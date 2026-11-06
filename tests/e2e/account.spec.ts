import { expect, test } from "@playwright/test";
import { login, resetMock } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetMock(page);
  await login(page);
});

test("edita perfil, avatar e valida senha", async ({ page }) => {
  await page.goto("/profile");
  await page.getByLabel("Nome").fill("Ada Jungle");
  await page.getByLabel("Usar avatar 6").click();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("status")).toContainText("Perfil atualizado");
  await page.reload();
  await expect(page.getByLabel("Nome")).toHaveValue("Ada Jungle");
  await page.getByLabel("Senha atual").fill("senha-errada");
  await page.getByLabel("Nova senha").fill("NovaJungle@123");
  await page.getByRole("button", { name: "Atualizar senha" }).click();
  await expect(page.getByRole("alert")).toContainText("senha atual");
});

test("carteiras validam endereço e permitem principal", async ({ page }) => {
  await page.goto("/wallets");
  await page.getByRole("button", { name: "Adicionar carteira" }).click();
  await page.getByLabel("Nome da carteira").fill("Nova carteira");
  await page.getByLabel("Endereço").fill("inválido");
  await page.getByRole("button", { name: "Salvar carteira" }).click();
  expect(
    await page.getByLabel("Endereço").evaluate((element: HTMLInputElement) => element.checkValidity()),
  ).toBe(false);
});
