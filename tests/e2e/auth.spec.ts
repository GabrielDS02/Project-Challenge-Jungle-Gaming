import { expect, test } from "@playwright/test";
import { login, resetMock, setScenario } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("cadastro, conflito, login, expiração e logout", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nome completo").fill("Ada Duplicada");
  await page.getByLabel("E-mail").fill("ada@jungle.test");
  await page.getByRole("textbox", { name: "Senha" }).fill("Jungle@123");
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(page.getByRole("alert")).toContainText("Já existe");

  await login(page);
  const mobileMenu = page.getByRole("button", { name: "Abrir menu" });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(page.getByRole("link", { name: "Meu perfil" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fechar" })).toBeVisible();
    await page.getByRole("button", { name: "Fechar" }).click();
  } else {
    await expect(page.getByText(/Olá, Ada/)).toBeVisible();
  }
  await setScenario(page, "expired-session");
  await page.reload();
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("troca de usuário não mantém cache privado", async ({ page }) => {
  await login(page);
  const mobileMenu = page.getByRole("button", { name: "Abrir menu" });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Sair da conta" }).click();
  }
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("caio@jungle.test");
  await page.getByRole("textbox", { name: "Senha" }).fill("Jungle@123");
  await page.getByRole("button", { name: "Entrar na conta" }).click();
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(page.getByRole("link", { name: "Meu perfil" })).toBeVisible();
  } else {
    await expect(page.getByText(/Olá, Caio/)).toBeVisible();
  }
});
