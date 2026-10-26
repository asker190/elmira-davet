import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", slug: "anasayfa", name: "Ana Sayfa" },
  { path: "/salonlar", slug: "salonlar", name: "Salonlarımız" },
  { path: "/paketler", slug: "paketler", name: "Paketler & Menüler" },
  { path: "/etkinlikler", slug: "etkinlikler", name: "Etkinlik Türleri" },
  { path: "/galeri", slug: "galeri", name: "Fotoğraf Galerisi" },
  { path: "/hakkimizda", slug: "hakkimizda", name: "Hakkımızda" },
  { path: "/referanslar", slug: "referanslar", name: "Yorumlar" },
  { path: "/sss", slug: "sss", name: "Sıkça Sorulan Sorular" },
  { path: "/iletisim", slug: "iletisim", name: "İletişim & Rezervasyon" },
];

/**
 * Helper to smoothly scroll page to bottom and back to top
 * Ensures all intersection observers, lazy images, and reveals are triggered.
 */
async function triggerAllScrollReveals(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          setTimeout(resolve, 300);
        }
      }, 100);
    });
  });
}

test.describe("TK-01: Tasarım Kilidi Görsel Regresyon Testleri", () => {
  for (const route of ROUTES) {
    test(`TK-01: ${route.name} (${route.path}) görsel bütünlüğü`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      // Trigger all reveal animations
      await triggerAllScrollReveals(page);
      await page.waitForTimeout(400);

      // Mask dynamic elements like iframes (e.g. google maps)
      const masks = [page.locator("iframe"), page.locator("video")];

      await expect(page).toHaveScreenshot(`${route.slug}-full.png`, {
        fullPage: true,
        mask: masks,
      });
    });
  }
});

test.describe("TK-02 & TK-03: Reveal Güvenliği ve Başlık Hiyerarşisi", () => {
  for (const route of ROUTES) {
    test(`TK-02 & TK-03: ${route.name} tek H1 ve görünür içerik denetimi`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await triggerAllScrollReveals(page);

      // TK-03: Single visible H1 heading
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `${route.path} sayfasında tek bir h1 olmalı`).toBe(1);
      await expect(page.locator("h1").first()).toBeVisible();

      // TK-02: No stuck hidden elements in main content after scroll
      const stuckHiddenElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("main section, main h2, main p, main article"));
        return elements
          .filter((el) => {
            const style = window.getComputedStyle(el);
            return style.opacity === "0" || style.visibility === "hidden";
          })
          .map((el) => el.tagName + "." + el.className);
      });

      expect(
        stuckHiddenElements.length,
        `${route.path} sayfasında kaydırma sonrası gizli kalan (opacity:0) eleman olmamalı: ${stuckHiddenElements.join(", ")}`
      ).toBe(0);
    });
  }
});

test.describe("TK-04: Header, Footer ve Yüzen Buton Denetimi", () => {
  test("TK-04: Header, Footer ve WhatsApp butonu her sayfada mevcuttur", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });

      // Header exists and has branding
      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Footer exists
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Floating WhatsApp exists
      const whatsapp = page.locator("aside[aria-label='WhatsApp İletişim Hattı'], a[href*='wa.me']");
      await expect(whatsapp.first()).toBeVisible();
    }
  });

  test("TK-04: 390px mobil ekranda yatay taşma (horizontal scrollbar) olmamalı", async ({ page }) => {
    // Only test on mobile-390 project
    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 400) {
      for (const route of ROUTES) {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(
          hasHorizontalScroll,
          `${route.path} sayfasında 390px ekranda yatay taşma olmamalı`
        ).toBe(false);
      }
    }
  });
});
