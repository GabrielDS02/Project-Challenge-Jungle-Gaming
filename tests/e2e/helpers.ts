import { expect, type Page } from "@playwright/test";

export async function resetMock(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /seja dono do futuro/i })).toBeVisible();
  await page.evaluate(async () => {
    await fetch("/api/mock/reset", { method: "POST" });
  });
  // Service-worker activation can abort the first reload on Chromium. Retrying
  // the same public route keeps reset deterministic without hiding app errors.
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
  } catch {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  }
}

export async function login(page: Page, email = "ada@jungle.test", password = "Jungle@123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(password);
  await page.getByRole("button", { name: "Entrar na conta" }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function setScenario(page: Page, scenario: string) {
  await page.evaluate(async (value) => {
    await fetch("/api/mock/scenario", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: value }),
    });
  }, scenario);
}
