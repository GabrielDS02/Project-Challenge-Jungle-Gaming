import type { CartItem, MockScenario, Nft, Order, Profile, User, Wallet } from "@/types/api";

interface StoredUser extends User {
  passwordHash: string;
}

export interface MockDbState {
  users: StoredUser[];
  profiles: Record<string, Profile>;
  wallets: Record<string, Wallet[]>;
  favorites: Record<string, string[]>;
  carts: Record<string, CartItem[]>;
  orders: Record<string, Order>;
  idempotency: Record<string, { fingerprint: string; orderId: string }>;
  nfts: Nft[];
  sessionUserId: string | null;
  scenario: MockScenario;
}

const STORAGE_KEY = "jungle-marketplace-mock-db-v1";

export function hashPassword(value: string) {
  let hash = 5381;
  for (const char of `jungle-marketplace:${value}`) hash = (hash * 33) ^ char.charCodeAt(0);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const nftCopy = [
  ["emerald-ape-442", "Emerald Ape #442", "Emerald Tribe", "Vinicius Art", "2.49", 5, "unique", "art"],
  [
    "onyx-guardian-218",
    "Onyx Guardian #218",
    "Jungle Keepers",
    "Maya Hash",
    "1.86",
    8,
    "limited",
    "collectible",
  ],
  ["sunset-oracle-071", "Sunset Oracle #071", "Golden Habitat", "Nuno Labs", "3.12", 2, "unique", "art"],
  ["neon-mandrill-908", "Neon Mandrill #908", "Meta Fauna", "Sato Studio", "0.94", 14, "open", "gaming"],
  ["ivory-nomad-133", "Ivory Nomad #133", "Jungle Keepers", "Maya Hash", "1.42", 6, "limited", "collectible"],
  ["savanna-rider-514", "Savanna Rider #514", "Golden Habitat", "Nuno Labs", "2.08", 4, "limited", "gaming"],
  ["turquoise-rebel-829", "Turquoise Rebel #829", "Meta Fauna", "Sato Studio", "4.31", 1, "unique", "art"],
  [
    "sage-emperor-604",
    "Sage Emperor #604",
    "Emerald Tribe",
    "Vinicius Art",
    "1.18",
    9,
    "open",
    "collectible",
  ],
  ["obsidian-scout-311", "Obsidian Scout #311", "Jungle Keepers", "Maya Hash", "0.78", 17, "open", "gaming"],
  ["amber-chief-250", "Amber Chief #250", "Golden Habitat", "Nuno Labs", "5.20", 1, "unique", "art"],
] as const;

function makeNfts(): Nft[] {
  return nftCopy.map(([id, name, collection, creator, priceEth, available, edition, category], index) => ({
    id,
    name,
    collection,
    creator,
    priceEth,
    available,
    totalSupply: edition === "unique" ? 1 : edition === "limited" ? 25 : 100,
    edition,
    category,
    imageIndex: index % 8,
    version: 1,
    featured: index < 3,
    description:
      "Uma peça autoral da selva digital, criada para colecionadores que valorizam identidade, escassez e uma história visual marcante. Metadados e propriedade são simulados neste desafio.",
  }));
}

function initialState(): MockDbState {
  const userA: StoredUser = {
    id: "user-ada",
    name: "Ada Silva",
    email: "ada@jungle.test",
    avatarIndex: 4,
    passwordHash: hashPassword("Jungle@123"),
  };
  const userB: StoredUser = {
    id: "user-caio",
    name: "Caio Santos",
    email: "caio@jungle.test",
    avatarIndex: 6,
    passwordHash: hashPassword("Jungle@123"),
  };
  return {
    users: [userA, userB],
    profiles: {
      [userA.id]: {
        ...userA,
        phone: "+55 11 99999-1234",
        bio: "Colecionadora de arte generativa.",
        country: "Brasil",
      },
      [userB.id]: {
        ...userB,
        phone: "+55 21 98888-4321",
        bio: "Explorador de mundos digitais.",
        country: "Brasil",
      },
    },
    wallets: {
      [userA.id]: [
        {
          id: "wallet-ada-1",
          label: "Carteira principal",
          address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          network: "ethereum",
          primary: true,
        },
      ],
      [userB.id]: [
        {
          id: "wallet-caio-1",
          label: "Polygon Vault",
          address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          network: "polygon",
          primary: true,
        },
      ],
    },
    favorites: { [userA.id]: ["emerald-ape-442"], [userB.id]: [] },
    carts: { guest: [], [userA.id]: [], [userB.id]: [] },
    orders: {},
    idempotency: {},
    nfts: makeNfts(),
    sessionUserId: null,
    scenario: (import.meta.env.VITE_DEFAULT_SCENARIO as MockScenario) || "success",
  };
}

function load(): MockDbState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as MockDbState) : initialState();
  } catch {
    return initialState();
  }
}

let database = load();

export function getDb() {
  return database;
}

export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // The demo still works in storage-restricted environments for the current session.
  }
}

export function resetDb() {
  database = initialState();
  saveDb();
  return database;
}

export function getCartOwner() {
  return database.sessionUserId ?? "guest";
}

export function publicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, avatarIndex: user.avatarIndex };
}
