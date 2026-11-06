import { expect, test } from "@playwright/test";
import { resetMock } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("busca, filtros, ordenação, paginação e histórico", async ({ page }) => {
  await page.getByLabel("Buscar no catálogo").fill("Emerald");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/search=Emerald/);
  await expect(page.getByTestId("nft-card")).toHaveCount(2);
  await page.getByLabel("Categoria").selectOption("art");
  await expect(page).toHaveURL(/category=art/);
  await page.getByLabel("Ordenar").selectOption("price-desc");
  await expect(page).toHaveURL(/sort=price-desc/);
  await page.goBack();
  await expect(page.getByLabel("Ordenar")).not.toHaveValue("price-desc");
});

test("acesso direto ao detalhe e recurso inexistente", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-442");
  await expect(page.getByRole("heading", { name: "Emerald Ape #442" })).toBeVisible();
  await page.goto("/nfts/not-found");
  await expect(page.getByRole("heading", { name: "NFT indisponível" })).toBeVisible();
});

test("@visual início e detalhe", async ({ page }) => {
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  await page.goto("/nfts/emerald-ape-442");
  await expect(page).toHaveScreenshot("detail.png", { fullPage: true });
});
