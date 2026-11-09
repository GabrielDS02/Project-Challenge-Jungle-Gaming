import { expect, test } from "@playwright/test";
import { resetMock } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("busca, filtros, ordenação, paginação e histórico", async ({ page }) => {
  await page.getByLabel("Buscar no catálogo").fill("Emerald");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/search=Emerald/);
  await expect(page.getByTestId("nft-card")).toHaveCount(2);
  await page.getByRole("combobox", { name: "Categoria" }).click();
  await page.getByRole("option", { name: "Arte", exact: true }).click();
  await expect(page).toHaveURL(/category=art/);
  await page.getByRole("combobox", { name: "Edição" }).click();
  await page.getByRole("option", { name: "Única", exact: true }).click();
  await expect(page).toHaveURL(/edition=unique/);
  await page.getByRole("combobox", { name: "Ordenar" }).click();
  await page.getByRole("option", { name: "Maior preço", exact: true }).click();
  await expect(page).toHaveURL(/sort=price-desc/);
  await page.goBack();
  await expect(page.getByRole("combobox", { name: "Ordenar" })).not.toHaveText("Maior preço");
  await page.goto("/");
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.goBack();
  await expect(page).not.toHaveURL(/page=2/);
});

test("catálogo apresenta estado vazio sem perder os filtros", async ({ page }) => {
  await page.getByLabel("Buscar no catálogo").fill("coleção inexistente");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Nada por aqui ainda" })).toBeVisible();
  await expect(page).toHaveURL(/search=cole%C3%A7%C3%A3o/);
});

test("menus de opção preservam contraste e tema escuro", async ({ page }) => {
  const sort = page.getByRole("combobox", { name: "Ordenar" });
  await sort.click();

  const menu = page.locator(".select-menu-content");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("option", { name: "Menor preço", exact: true })).toBeVisible();
  await expect(menu).toHaveCSS("background-color", "rgb(36, 19, 12)");
});

test("acesso direto ao detalhe e recurso inexistente", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-442");
  await expect(page.getByRole("heading", { name: "Emerald Ape #442" })).toBeVisible();
  await page.goto("/nfts/not-found");
  await expect(page.getByRole("heading", { name: "NFT indisponível" })).toBeVisible();
});

test("galeria alterna imagens, amplia a obra e não sobrepõe o conteúdo", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-442");

  const secondView = page.getByRole("button", { name: /Exibir visualização 2/ });
  await secondView.click();
  await expect(secondView).toHaveAttribute("aria-pressed", "true");

  const mainArtwork = page.getByRole("button", { name: /Vista 2 de 3.*Emerald Ape #442/ });
  await expect(mainArtwork).toBeVisible();
  await mainArtwork.click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Emerald Ape #442" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar" }).click();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  if ((page.viewportSize()?.width ?? 0) >= 1280) {
    const gallery = await page.locator(".gallery-intro").boundingBox();
    const details = await page.locator(".detail-intro").boundingBox();
    expect(gallery).not.toBeNull();
    expect(details).not.toBeNull();
    expect(gallery!.x + gallery!.width).toBeLessThanOrEqual(details!.x + 1);
  }
});

test("@visual início e detalhe", async ({ page }) => {
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  await page.goto("/nfts/emerald-ape-442");
  await expect(page).toHaveScreenshot("detail.png", { fullPage: true });
});
