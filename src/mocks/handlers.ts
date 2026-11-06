import Decimal from "decimal.js";
import { delay, http, HttpResponse } from "msw";
import type {
  CartLine,
  MockScenario,
  NftUpdatedEvent,
  Order,
  OrderUpdatedEvent,
  Profile,
  Quote,
  Wallet,
} from "@/types/api";
import { getCartOwner, getDb, hashPassword, publicUser, resetDb, saveDb } from "./db";
import { broadcastSocketEvent, socketHandler } from "./realtime";

const jsonError = (status: number, code: string, message: string, fieldErrors?: Record<string, string>) =>
  HttpResponse.json({ code, message, fieldErrors }, { status });

async function scenarioGate() {
  const { scenario } = getDb();
  if (scenario === "slow") await delay(1_500);
  else await delay(Math.floor(Math.random() * 130) + 50);
  if (scenario === "offline") return HttpResponse.error();
  if (scenario === "server-error")
    return jsonError(503, "SERVICE_UNAVAILABLE", "O serviço simulado está temporariamente indisponível.");
  return null;
}

function authenticatedUserId() {
  const db = getDb();
  if (db.scenario === "expired-session") {
    db.sessionUserId = null;
    saveDb();
  }
  return db.sessionUserId;
}

function requireUser() {
  const id = authenticatedUserId();
  return id ? id : null;
}

function cartLines(): CartLine[] {
  const db = getDb();
  return (db.carts[getCartOwner()] ?? []).flatMap((item) => {
    const nft = db.nfts.find((candidate) => candidate.id === item.nftId);
    return nft ? [{ ...item, nft }] : [];
  });
}

function makeQuote(coupon?: string): Quote {
  const items = cartLines();
  const subtotal = items.reduce(
    (sum, item) => sum.plus(new Decimal(item.nft.priceEth).times(item.quantity)),
    new Decimal(0),
  );
  const discountRate = coupon?.toUpperCase() === "JUNGLE10" ? new Decimal("0.10") : new Decimal(0);
  const discount = subtotal.times(discountRate);
  const fee = subtotal.isZero() ? new Decimal(0) : Decimal.max(subtotal.times("0.018"), "0.0042");
  return {
    items,
    subtotalEth: subtotal.toFixed(4),
    discountEth: discount.toFixed(4),
    networkFeeEth: fee.toFixed(4),
    totalEth: subtotal.minus(discount).plus(fee).toFixed(4),
    coupon: discountRate.isZero() ? undefined : coupon?.toUpperCase(),
    version: items.map((item) => `${item.nft.id}:${item.nft.version}:${item.quantity}`).join("|"),
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    changedItems: items.filter((item) => item.priceSnapshot !== item.nft.priceEth).map((item) => item.nft.id),
  };
}

export const handlers = [
  socketHandler,
  http.get("/api/mock/scenario", () => HttpResponse.json({ scenario: getDb().scenario })),
  http.put("/api/mock/scenario", async ({ request }) => {
    const body = (await request.json()) as { scenario: MockScenario };
    getDb().scenario = body.scenario;
    saveDb();
    return HttpResponse.json({ scenario: getDb().scenario });
  }),
  http.post("/api/mock/reset", () => HttpResponse.json({ ok: true, scenario: resetDb().scenario })),

  http.get("/api/session", async () => {
    const gate = await scenarioGate();
    if (gate) return gate;
    const db = getDb();
    const user = db.users.find((candidate) => candidate.id === authenticatedUserId());
    return HttpResponse.json({ user: user ? publicUser(user) : null });
  }),
  http.post("/api/session/login", async ({ request }) => {
    const gate = await scenarioGate();
    if (gate) return gate;
    const body = (await request.json()) as { email: string; password: string };
    const db = getDb();
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === body.email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(body.password))
      return jsonError(401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    const guest = db.carts.guest ?? [];
    const owned = db.carts[user.id] ?? [];
    for (const item of guest) {
      const existing = owned.find((candidate) => candidate.nftId === item.nftId);
      if (existing) existing.quantity += item.quantity;
      else owned.push(item);
    }
    db.carts[user.id] = owned;
    db.carts.guest = [];
    db.sessionUserId = user.id;
    saveDb();
    return HttpResponse.json({ user: publicUser(user) });
  }),
  http.post("/api/session/logout", () => {
    getDb().sessionUserId = null;
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/api/accounts", async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string };
    const db = getDb();
    if (db.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase()))
      return jsonError(409, "EMAIL_CONFLICT", "Já existe uma conta com este e-mail.", {
        email: "E-mail já cadastrado.",
      });
    if (body.password.length < 8)
      return jsonError(422, "VALIDATION_ERROR", "Revise os campos informados.", {
        password: "Use pelo menos 8 caracteres.",
      });
    const id = `user-${crypto.randomUUID()}`;
    const user = {
      id,
      name: body.name,
      email: body.email.toLowerCase(),
      avatarIndex: 0,
      passwordHash: hashPassword(body.password),
    };
    db.users.push(user);
    db.profiles[id] = { ...publicUser(user), phone: "", bio: "", country: "Brasil" };
    db.wallets[id] = [];
    db.favorites[id] = [];
    db.carts[id] = db.carts.guest ?? [];
    db.carts.guest = [];
    db.sessionUserId = id;
    saveDb();
    return HttpResponse.json({ user: publicUser(user) }, { status: 201 });
  }),

  http.get("/api/nfts", async ({ request }) => {
    const gate = await scenarioGate();
    if (gate) return gate;
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const category = url.searchParams.get("category") ?? "all";
    const edition = url.searchParams.get("edition") ?? "all";
    const sort = url.searchParams.get("sort") ?? "featured";
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
    const pageSize = 6;
    let items = getDb().nfts.filter(
      (nft) =>
        (!search || `${nft.name} ${nft.collection} ${nft.creator}`.toLowerCase().includes(search)) &&
        (category === "all" || nft.category === category) &&
        (edition === "all" || nft.edition === edition),
    );
    items = [...items].sort((a, b) => {
      if (sort === "price-asc") return Number(a.priceEth) - Number(b.priceEth);
      if (sort === "price-desc") return Number(b.priceEth) - Number(a.priceEth);
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
    return HttpResponse.json({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: items.length,
      totalPages: Math.max(Math.ceil(items.length / pageSize), 1),
    });
  }),
  http.get("/api/nfts/:nftId", async ({ params }) => {
    const gate = await scenarioGate();
    if (gate) return gate;
    const nft = getDb().nfts.find((candidate) => candidate.id === params.nftId);
    return nft ? HttpResponse.json(nft) : jsonError(404, "NFT_NOT_FOUND", "Este NFT não foi encontrado.");
  }),

  http.get("/api/favorites", () => {
    const userId = requireUser();
    return userId
      ? HttpResponse.json({ ids: getDb().favorites[userId] ?? [] })
      : jsonError(401, "UNAUTHORIZED", "Entre para acessar seus favoritos.");
  }),
  http.post("/api/favorites/:nftId", ({ params }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Entre para favoritar.");
    if (getDb().scenario === "favorite-error")
      return jsonError(
        500,
        "FAVORITE_FAILED",
        "A alteração do favorito falhou. O estado anterior foi restaurado.",
      );
    const favorites = getDb().favorites[userId] ?? [];
    if (!favorites.includes(String(params.nftId))) favorites.push(String(params.nftId));
    getDb().favorites[userId] = favorites;
    saveDb();
    return HttpResponse.json({ ids: favorites });
  }),
  http.delete("/api/favorites/:nftId", ({ params }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Entre para alterar favoritos.");
    if (getDb().scenario === "favorite-error")
      return jsonError(
        500,
        "FAVORITE_FAILED",
        "A alteração do favorito falhou. O estado anterior foi restaurado.",
      );
    getDb().favorites[userId] = (getDb().favorites[userId] ?? []).filter((id) => id !== params.nftId);
    saveDb();
    return HttpResponse.json({ ids: getDb().favorites[userId] });
  }),

  http.get("/api/cart", async () => {
    const gate = await scenarioGate();
    if (gate) return gate;
    return HttpResponse.json({ items: cartLines(), updatedAt: new Date().toISOString() });
  }),
  http.post("/api/cart/items", async ({ request }) => {
    const { nftId, quantity = 1 } = (await request.json()) as { nftId: string; quantity?: number };
    const db = getDb();
    const nft = db.nfts.find((candidate) => candidate.id === nftId);
    if (!nft) return jsonError(404, "NFT_NOT_FOUND", "NFT não encontrado.");
    const cart = db.carts[getCartOwner()] ?? [];
    const existing = cart.find((item) => item.nftId === nftId);
    if ((existing?.quantity ?? 0) + quantity > nft.available)
      return jsonError(409, "INSUFFICIENT_STOCK", "A quantidade solicitada não está disponível.");
    if (existing) existing.quantity += quantity;
    else cart.push({ nftId, quantity, priceSnapshot: nft.priceEth });
    db.carts[getCartOwner()] = cart;
    saveDb();
    return HttpResponse.json({ items: cartLines(), updatedAt: new Date().toISOString() }, { status: 201 });
  }),
  http.patch("/api/cart/items/:nftId", async ({ params, request }) => {
    const { quantity } = (await request.json()) as { quantity: number };
    const nft = getDb().nfts.find((candidate) => candidate.id === params.nftId);
    if (!nft || quantity < 1 || quantity > nft.available)
      return jsonError(409, "INVALID_QUANTITY", "Quantidade indisponível para esta edição.");
    const item = (getDb().carts[getCartOwner()] ?? []).find((candidate) => candidate.nftId === params.nftId);
    if (!item) return jsonError(404, "CART_ITEM_NOT_FOUND", "Item não encontrado no carrinho.");
    item.quantity = quantity;
    saveDb();
    return HttpResponse.json({ items: cartLines(), updatedAt: new Date().toISOString() });
  }),
  http.delete("/api/cart/items/:nftId", ({ params }) => {
    getDb().carts[getCartOwner()] = (getDb().carts[getCartOwner()] ?? []).filter(
      (item) => item.nftId !== params.nftId,
    );
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/api/quotes", async ({ request }) => {
    const { coupon } = (await request.json()) as { coupon?: string };
    if (coupon && !["JUNGLE10", "EXPIRED10"].includes(coupon.toUpperCase()))
      return jsonError(422, "INVALID_COUPON", "Cupom inválido.");
    if (coupon?.toUpperCase() === "EXPIRED10") return jsonError(422, "EXPIRED_COUPON", "Este cupom expirou.");
    return HttpResponse.json(makeQuote(coupon));
  }),

  http.get("/api/profile", () => {
    const userId = requireUser();
    return userId
      ? HttpResponse.json(getDb().profiles[userId])
      : jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
  }),
  http.put("/api/profile", async ({ request }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
    const body = (await request.json()) as Partial<Profile>;
    getDb().profiles[userId] = { ...getDb().profiles[userId], ...body };
    const user = getDb().users.find((candidate) => candidate.id === userId)!;
    user.name = getDb().profiles[userId].name;
    user.avatarIndex = getDb().profiles[userId].avatarIndex;
    saveDb();
    return HttpResponse.json(getDb().profiles[userId]);
  }),
  http.post("/api/profile/password", async ({ request }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
    const body = (await request.json()) as { currentPassword: string; newPassword: string };
    const user = getDb().users.find((candidate) => candidate.id === userId)!;
    if (user.passwordHash !== hashPassword(body.currentPassword))
      return jsonError(422, "INVALID_PASSWORD", "A senha atual está incorreta.");
    user.passwordHash = hashPassword(body.newPassword);
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("/api/wallets", () => {
    const userId = requireUser();
    return userId
      ? HttpResponse.json({ items: getDb().wallets[userId] ?? [] })
      : jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
  }),
  http.post("/api/wallets", async ({ request }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
    const body = (await request.json()) as Omit<Wallet, "id">;
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address))
      return jsonError(422, "INVALID_ADDRESS", "Informe um endereço de carteira válido.", {
        address: "Use um endereço EVM com 42 caracteres.",
      });
    const wallet = { ...body, id: `wallet-${crypto.randomUUID()}` };
    if (body.primary) (getDb().wallets[userId] ?? []).forEach((item) => (item.primary = false));
    getDb().wallets[userId] = [...(getDb().wallets[userId] ?? []), wallet];
    saveDb();
    return HttpResponse.json(wallet, { status: 201 });
  }),
  http.put("/api/wallets/:walletId", async ({ params, request }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
    const body = (await request.json()) as Partial<Wallet>;
    const wallet = (getDb().wallets[userId] ?? []).find((item) => item.id === params.walletId);
    if (!wallet) return jsonError(404, "WALLET_NOT_FOUND", "Carteira não encontrada.");
    if (body.primary) getDb().wallets[userId].forEach((item) => (item.primary = false));
    Object.assign(wallet, body);
    saveDb();
    return HttpResponse.json(wallet);
  }),

  http.post("/api/orders", async ({ request }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Entre novamente para concluir a compra.");
    const key = request.headers.get("Idempotency-Key");
    if (!key) return jsonError(400, "IDEMPOTENCY_REQUIRED", "A chave de idempotência é obrigatória.");
    const body = (await request.json()) as {
      walletId: string;
      quoteVersion: string;
      buyer: { name: string; email: string };
      coupon?: string;
    };
    const db = getDb();
    const fingerprint = JSON.stringify(body);
    const previous = db.idempotency[key];
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        return jsonError(409, "IDEMPOTENCY_CONFLICT", "A chave já foi usada com outro conteúdo.");
      return HttpResponse.json(db.orders[previous.orderId]);
    }
    const quote = makeQuote(body.coupon);
    if (!quote.items.length) return jsonError(409, "EMPTY_CART", "O carrinho está vazio.");
    if (quote.version !== body.quoteVersion || quote.changedItems.length)
      return jsonError(
        409,
        "STALE_QUOTE",
        "Preço ou disponibilidade mudou. Revise a cotação antes de confirmar.",
        { quote: "Cotação desatualizada." },
      );
    const wallet = (db.wallets[userId] ?? []).find((item) => item.id === body.walletId);
    if (!wallet) return jsonError(422, "WALLET_REQUIRED", "Selecione uma carteira válida.");
    const id = `ord-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const order: Order = {
      id,
      transactionId: `0x${crypto.randomUUID().replaceAll("-", "")}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      buyer: body.buyer,
      wallet,
      quote,
      version: 1,
    };
    db.orders[id] = order;
    db.idempotency[key] = { fingerprint, orderId: id };
    saveDb();
    const shouldDecline = db.scenario === "payment-declined";
    setTimeout(() => {
      const current = getDb().orders[id];
      if (!current || current.status !== "pending") return;
      current.status = shouldDecline ? "declined" : "confirmed";
      current.refusalReason = shouldDecline ? "A carteira simulada recusou a assinatura." : undefined;
      current.version += 1;
      current.updatedAt = new Date().toISOString();
      if (!shouldDecline) {
        for (const line of current.quote.items) {
          const nft = getDb().nfts.find((item) => item.id === line.nftId);
          if (nft) {
            nft.available -= line.quantity;
            nft.version += 1;
          }
          const cart = getDb().carts[userId] ?? [];
          const cartItem = cart.find((item) => item.nftId === line.nftId);
          if (cartItem) cartItem.quantity -= line.quantity;
          getDb().carts[userId] = cart.filter((item) => item.quantity > 0);
        }
      }
      saveDb();
      const event: OrderUpdatedEvent = {
        resourceId: id,
        userId,
        version: current.version,
        occurredAt: current.updatedAt,
        status: current.status,
      };
      broadcastSocketEvent("order.updated", event);
    }, 1_200);
    if (db.scenario === "order-timeout") {
      await delay(8_500);
      return HttpResponse.error();
    }
    return HttpResponse.json(order, { status: 202 });
  }),
  http.get("/api/orders/:orderId", ({ params }) => {
    const userId = requireUser();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
    const order = getDb().orders[String(params.orderId)];
    return order ? HttpResponse.json(order) : jsonError(404, "ORDER_NOT_FOUND", "Pedido não encontrado.");
  }),

  http.post("/api/mock/events/nft", async ({ request }) => {
    const { nftId, priceEth, available } = (await request.json()) as {
      nftId: string;
      priceEth?: string;
      available?: number;
    };
    const nft = getDb().nfts.find((item) => item.id === nftId);
    if (!nft) return jsonError(404, "NFT_NOT_FOUND", "NFT não encontrado.");
    nft.previousPriceEth = nft.priceEth;
    if (priceEth) nft.priceEth = priceEth;
    if (available !== undefined) nft.available = available;
    nft.version += 1;
    saveDb();
    const event: NftUpdatedEvent = {
      resourceId: nft.id,
      version: nft.version,
      occurredAt: new Date().toISOString(),
      patch: { priceEth: nft.priceEth, available: nft.available },
    };
    broadcastSocketEvent("nft.updated", event);
    return HttpResponse.json(event);
  }),
];
