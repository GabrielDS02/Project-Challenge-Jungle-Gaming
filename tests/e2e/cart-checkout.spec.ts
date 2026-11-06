import { expect, test } from "@playwright/test";
import { login, resetMock, setScenario } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("favorito com rollback em falha", async ({ page }) => {
  await login(page);
  await setScenario(page, "favorite-error");
  const favorite = page.getByLabel(/Remover Emerald Ape.*favoritos/);
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
});

test("carrinho, quantidade, cupom e persistência", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-442");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole("link", { name: /Carrinho com 1 itens/ })).toBeVisible();
  await page.goto("/cart");
  await page.getByLabel("Cupom").fill("JUNGLE10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText(/- 0\.249(?:0)? ETH/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("Emerald Ape #442")).toBeVisible();
});

test("compra completa e clique repetido recuperam um pedido", async ({ page }) => {
  await login(page);
  await page.goto("/nfts/emerald-ape-442");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole("link", { name: /Carrinho com 1 itens/ })).toBeVisible();
  await page.goto("/cart");
  await page.getByRole("link", { name: "Continuar para pagamento" }).click();
  await page.getByText(/Revisei os itens/).click();
  await page.getByRole("button", { name: "Revisar valores" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).dblclick();
  await expect(page).toHaveURL(/\/orders\/ord-/);
  await expect(page.getByRole("heading", { name: /a obra agora é sua/i })).toBeVisible({ timeout: 8_000 });
});

test("pagamento recusado preserva o carrinho", async ({ page }) => {
  await login(page);
  await setScenario(page, "payment-declined");
  await page.goto("/nfts/emerald-ape-442");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole("link", { name: /Carrinho com 1 itens/ })).toBeVisible();
  await page.goto("/checkout");
  await page.getByText(/Revisei os itens/).click();
  await page.getByRole("button", { name: "Revisar valores" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento recusado" })).toBeVisible({ timeout: 8_000 });
  await page.goto("/cart");
  await expect(page.getByText("Emerald Ape #442")).toBeVisible();
});

test("@visual carrinho e pagamento", async ({ page }) => {
  await login(page);
  await page.goto("/nfts/emerald-ape-442");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole("link", { name: /Carrinho com 1 itens/ })).toBeVisible();
  await page.goto("/cart");
  await expect(page).toHaveScreenshot("cart.png", { fullPage: true });
  await page.goto("/checkout");
  await expect(page).toHaveScreenshot("checkout.png", { fullPage: true });
});
