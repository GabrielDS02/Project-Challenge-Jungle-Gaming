import { expect, test } from "@playwright/test";
import { resetMock } from "./helpers";

test.beforeEach(async ({ page }) => resetMock(page));

test("manifesto e service worker expõem uma PWA instalável", async ({ page }) => {
  const manifestResponse = await page.request.get("/site.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = (await manifestResponse.json()) as {
    display: string;
    start_url: string;
    icons: Array<{ src: string; sizes: string; purpose: string }>;
  };

  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192" }),
      expect.objectContaining({ sizes: "512x512", purpose: expect.stringContaining("maskable") }),
    ]),
  );

  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { scope: ready.scope, script: ready.active?.scriptURL ?? "" };
  });
  expect(registration.scope).toBe("http://127.0.0.1:4173/");
  expect(registration.script).toContain("mockServiceWorker.js?pwa=1");

  await expect
    .poll(() => page.evaluate(async () => (await caches.keys()).some((key) => key.startsWith("jungle-pwa-"))))
    .toBe(true);
});

test("shell continua disponível sem rede após a primeira visita", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.waitForFunction(() => document.documentElement.dataset.pwaCache === "ready");

  // A second online load verifies that the active worker can serve and refresh its cached shell.
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.pwaCache === "ready");
  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /SEJA DONO DO FUTURO/ })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
