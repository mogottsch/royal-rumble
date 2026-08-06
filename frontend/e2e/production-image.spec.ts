import { expect, test } from "@playwright/test";

const frontendUrl = process.env.PROD_SMOKE_FRONTEND_URL;
const apiUrl = process.env.PROD_SMOKE_API_URL;

test.skip(!frontendUrl || !apiUrl, "production image URLs are only provided by the smoke script");

test("production images enforce CSP while allowing API and wrestler assets", async ({ page }) => {
  const cspErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /content security policy/i.test(message.text())) {
      cspErrors.push(message.text());
    }
  });

  const deepResponse = await page.goto(`${frontendUrl}/lobbies/SMOKE/dashboard`);
  expect(deepResponse?.status()).toBe(200);
  expect(deepResponse?.headers()["content-security-policy"]).toBeTruthy();

  const result = await page.evaluate(async (backend) => {
    const health = await fetch(`${backend}/api/health`).then((response) => response.json());
    const search = await fetch(`${backend}/api/wrestlers/search?search=John%20Cena`).then((response) => response.json());
    const wrestler = search.data.find((entry: { name: string }) => entry.name === "John Cena");
    const imageLoaded = await new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0);
      image.onerror = () => resolve(false);
      image.src = wrestler.thumbnail_url;
      document.body.append(image);
    });
    return { health, imageLoaded };
  }, apiUrl);

  expect(result.health.status).toBe("ok");
  expect(result.imageLoaded).toBe(true);
  expect(cspErrors).toEqual([]);
});
