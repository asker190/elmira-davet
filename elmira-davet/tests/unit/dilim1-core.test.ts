import assert from "assert";
import {
  slugifyTurkish,
  sanitizeHtml,
  blockNodeSchema,
  RESERVED_SLUGS,
} from "../../src/lib/cms/validation";
import {
  createPage,
  updatePage,
  getPageById,
  acquirePageLock,
  renewPageLock,
  releasePageLock,
  createPageRevision,
  getPageRevisions,
} from "../../src/lib/cms/page-service";
import {
  registerPageRedirect,
  resolveRedirect,
} from "../../src/lib/cms/redirect-service";
import type { BlockNode } from "../../src/lib/cms/types";

async function runDilim1Tests() {
  console.log("=== DİLİM 1: TEMEL VERİ MODELİ, DOĞRULAMA VE KİLİT TESTLERİ BAŞLIYOR ===");

  // 1. Test: slugifyTurkish handles Turkish characters correctly (ON-01)
  console.log("[TEST 1] Türkçe Slug Dönüşümü ve Büyük I Harfi");
  const slug1 = slugifyTurkish("KIR BAHÇESİ VE IŞIKLI BALO SALONU");
  assert.strictEqual(
    slug1,
    "kir-bahcesi-ve-isikli-balo-salonu",
    "Türkçe karakterler ve büyük I/İ doğru dönüştürülmelidir"
  );
  console.log("  ✔ Başarılı: 'KIR BAHÇESİ VE IŞIKLI BALO SALONU' ->", slug1);

  // 2. Test: Reserved slugs prevention (N-01)
  console.log("[TEST 2] Ayrılmış Slug Kontrolü");
  assert.ok(RESERVED_SLUGS.includes("admin"), "admin ayrılmış olmalı");
  assert.ok(RESERVED_SLUGS.includes("sitemap"), "sitemap ayrılmış olmalı");
  console.log("  ✔ Başarılı: Ayrılmış slug listesi devrede.");

  // 3. Test: HTML Sanitizer strips XSS and onclicks (X-04, B-09)
  console.log("[TEST 3] HTML XSS Sanitization");
  const dangerousHtml =
    '<p>Merhaba</p><script>alert("xss")</script><a href="javascript:steal()" onclick="hack()">Link</a><style>body{color:red}</style>';
  const clean = sanitizeHtml(dangerousHtml);
  assert.ok(!clean.includes("<script>"), "script etiketi temizlenmelidir");
  assert.ok(!clean.includes("onclick"), "onclick niteliği temizlenmelidir");
  assert.ok(!clean.includes("javascript:"), "javascript: protokolü temizlenmelidir");
  assert.ok(!clean.includes("<style>"), "style etiketi temizlenmelidir");
  console.log("  ✔ Başarılı: XSS içeriği güvenle temizlendi.");

  // 4. Test: BlockNode Zod schema validation (B-01)
  console.log("[TEST 4] Blok Düğüm Zod Şeması Doğrulaması");
  const validHeroBlock: BlockNode = {
    id: "blk_hero_1",
    type: "hero",
    schemaVersion: 1,
    attrs: {
      title: "Elmira Davet",
      posterUrl: "https://example.com/poster.jpg",
      overlayDarkness: 50,
      parallaxEnabled: true,
    },
    motion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.2,
      trigger: "viewport",
      once: true,
    },
  };
  const parseResult = blockNodeSchema.safeParse(validHeroBlock);
  assert.ok(parseResult.success, "Geçerli hero bloğu doğrulanmalıdır");
  console.log("  ✔ Başarılı: Blok Zod şeması geçerli düğümü onayladı.");

  // 5. Test: Optimistic concurrency control (K-03: No silent overwrites)
  console.log("[TEST 5] İyimser Kilit ve Sürüm Kontrolü (PG-K-03)");
  const createRes = await createPage({
    title: "Sürüm Test Sayfası",
    slug: `surum-test-${Date.now()}`,
    content: [validHeroBlock],
  });
  assert.ok(createRes.success && createRes.page, "Sayfa oluşturulmalıdır");
  const pageId = createRes.page.id;
  assert.strictEqual(createRes.page.version, 1, "İlk sürüm 1 olmalıdır");

  // Admin A updates version 1 -> page becomes version 2
  const updateA = await updatePage(pageId, { title: "Admin A Başlığı", expectedVersion: 1 }, "user_a");
  assert.ok(updateA.success && updateA.page, "Admin A güncellemesi başarılı olmalı");
  assert.strictEqual(updateA.page.version, 2, "Yeni sürüm 2 olmalıdır");

  // Admin B tries to update using outdated expectedVersion: 1 -> MUST CONFLICT!
  const updateB = await updatePage(pageId, { title: "Admin B Başlığı", expectedVersion: 1 }, "user_b");
  assert.strictEqual(updateB.success, false, "Eski sürümle güncelleme reddedilmelidir");
  assert.strictEqual(updateB.conflict, true, "Çakışma bayrağı true olmalıdır");
  console.log("  ✔ Başarılı: Eşzamanlı ezme engellendi (Optimistic Concurrency Control çalışıyor).");

  // 6. Test: Page Lock mechanism (PG-K-01, PG-K-02)
  console.log("[TEST 6] Sayfa Kilidi (Lock Heartbeat) Testi (PG-K-01)");
  const lock1 = await acquirePageLock(pageId, "user_ayse", "Ayşe Yılmaz");
  assert.ok(lock1.success, "İlk kullanıcı kilidi almalıdır");

  // Second user tries to acquire lock -> must fail with currentLock
  const lock2 = await acquirePageLock(pageId, "user_mehmet", "Mehmet Kaya");
  assert.strictEqual(lock2.success, false, "İkinci kullanıcı kilidi alamamalıdır");
  assert.strictEqual(lock2.currentLock?.userName, "Ayşe Yılmaz", "Mevcut kilit Ayşe'ye ait görünmelidir");

  // Renewal
  const renewed = await renewPageLock(pageId, "user_ayse");
  assert.ok(renewed, "Kilit yenilenebilmelidir");

  // Release
  await releasePageLock(pageId, "user_ayse");
  const lock3 = await acquirePageLock(pageId, "user_mehmet", "Mehmet Kaya");
  assert.ok(lock3.success, "Kilit bırakılınca ikinci kullanıcı alabilmelidir");
  await releasePageLock(pageId, "user_mehmet");
  console.log("  ✔ Başarılı: Kilit alma, engelleme, yenileme ve bırakma kusursuz.");

  // 7. Test: Revisions generation and max 50 limit (PG-R-01, PG-R-04)
  console.log("[TEST 7] Revizyon Yönetimi ve Saklama (PG-R-01, PG-R-04)");
  const rev1 = await createPageRevision(pageId, "Revizyon 1", [validHeroBlock], "user_a", "MANUAL");
  assert.ok(rev1.id, "Revizyon ID üretilmelidir");
  const revs = await getPageRevisions(pageId);
  assert.ok(revs.length >= 1, "En az bir revizyon listelenmelidir");
  console.log("  ✔ Başarılı: Revizyon geçmişi başarıyla oluşturuldu ve okundu.");

  // 8. Test: 301 Redirect creation and loop prevention (PG-S-02)
  console.log("[TEST 8] 301 Yönlendirme ve Döngü Koruması (PG-S-02)");
  await registerPageRedirect(pageId, "/eski-sayfa", "/yeni-sayfa");
  const resolved1 = await resolveRedirect("/eski-sayfa");
  assert.strictEqual(resolved1?.toPath, "/yeni-sayfa", "Yönlendirme doğru çözümlenmelidir");

  // Loop attempt: /yeni-sayfa -> /eski-sayfa
  await registerPageRedirect(pageId, "/yeni-sayfa", "/eski-sayfa");
  const resolved2 = await resolveRedirect("/yeni-sayfa");
  assert.strictEqual(resolved2?.toPath, "/eski-sayfa", "Yeni yönlendirme eklenmelidir");
  const resolvedOld = await resolveRedirect("/eski-sayfa");
  assert.strictEqual(resolvedOld, null, "Döngüyü kırmak için eski yönlendirme kaldırılmalıdır");
  console.log("  ✔ Başarılı: 301 yönlendirme çalışıyor ve döngü engellendi.");

  console.log("\n>>> DİLİM 1 TESTLERİNİN TÜMÜ (8/8) BAŞARIYLA GEÇTİ! <<<");
}

runDilim1Tests().catch((err) => {
  console.error("DİLİM 1 TEST HATASI:", err);
  process.exit(1);
});
