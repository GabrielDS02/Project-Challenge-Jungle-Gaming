import { expect, test } from "@playwright/test";
import { login, resetMock, setScenario } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("preço muda via Socket.IO e checkout exige nova cotação", async ({ page }) => {
  await login(page);
  await page.goto("/nfts/emerald-ape-442");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole("link", { name: /Carrinho com 1 itens/ })).toBeVisible();
  await page.goto("/cart");
  await page.evaluate(async () => {
    await fetch("/api/mock/events/nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "emerald-ape-442", priceEth: "2.93", available: 3 }),
    });
  });
  await expect(page.getByText(/Preço atualizado/)).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText(/2\.93(?:00)? ETH/).first()).toBeVisible();
});

test("navegação por teclado, foco do diálogo e validação", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.getByRole("button", { name: "Abrir laboratório de cenários" }).click();
  await expect(page.getByRole("heading", { name: "Laboratório de cenários" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Laboratório de cenários" })).toBeHidden();
});

test("skeleton em rede lenta e recuperação de falha", async ({ page }) => {
  await setScenario(page, "slow");
  await page.reload();
  await expect(page.getByLabel("Carregando catálogo")).toBeVisible();
  await expect(page.getByTestId("nft-card").first()).toBeVisible({ timeout: 5_000 });
  await setScenario(page, "server-error");
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Não foi possível carregar");
});
