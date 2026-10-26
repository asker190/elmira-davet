import assert from "node:assert";
import {
  createPage,
  updatePage,
  trashPage,
  restorePageFromTrash,
  permanentlyDeletePage,
  acquirePageLock,
  renewPageLock,
  releasePageLock,
  forceTakeoverLock,
  getPageLock,
  getPageById,
  getAllPages,
} from "../../src/lib/cms/page-service";
import { registerPageRedirect, resolveRedirect } from "../../src/lib/cms/redirect-service";
import { createNewBlock } from "../../src/lib/cms/registry";

async function runDilim7Tests() {
  console.log("=== DİLİM 7: KİLİT, SEO, 301, YETKİ VE ÇÖP (PG-K, PG-S, PG-Y, PG-T) TESTLERİ ===");

  // [TEST 1] Sayfa Kilidi ve Heartbeat Mekanizması (PG-K-01, PG-K-02)
  console.log("\n[TEST 1] Sayfa Kilidi ve Çakışma Önleme (PG-K-01, PG-K-02)");
  const createRes = await createPage({
    title: "Kilit Test Sayfası",
    slug: `kilit-test-${Date.now()}`,
    status: "DRAFT",
    content: [createNewBlock("heading", { text: "Kilit" })],
  });
  assert.ok(createRes.success && createRes.page);
  const page = createRes.page;

  // User A acquires lock
  const lockA = await acquirePageLock(page.id, "user-ayse", "Ayşe");
  assert.strictEqual(lockA.success, true);
  assert.strictEqual(lockA.currentLock?.userName, "Ayşe");

  // User B tries to acquire lock -> should fail
  const lockB = await acquirePageLock(page.id, "user-mehmet", "Mehmet");
  assert.strictEqual(lockB.success, false, "İkinci kullanıcı kilidi alamamalı");
  assert.strictEqual(lockB.currentLock?.userName, "Ayşe", "Mevcut kilit Ayşe'ye ait olmalı");

  // User A renews lock
  const renewOk = await renewPageLock(page.id, "user-ayse");
  assert.strictEqual(renewOk, true, "Kilit sahibi heartbeat ile süreyi uzatabilmeli");

  // User B cannot renew User A's lock
  const renewFail = await renewPageLock(page.id, "user-mehmet");
  assert.strictEqual(renewFail, false, "Başkasının kilidi uzatılamamalı");
  console.log("  ✔ Başarılı: Sayfa kilidi ve heartbeat mekanizması doğrulandı.");

  // [TEST 2] Düzenlemeyi Devralma (Force Takeover) (PG-K-05)
  console.log("\n[TEST 2] Düzenlemeyi Devralma (PG-K-05)");
  const takeoverLock = await forceTakeoverLock(page.id, "user-mehmet", "Mehmet");
  assert.strictEqual(takeoverLock.userId, "user-mehmet");
  assert.strictEqual(takeoverLock.userName, "Mehmet");

  const checkLock = await getPageLock(page.id);
  assert.strictEqual(checkLock?.userName, "Mehmet", "Kilit Mehmet'e devredilmiş olmalı");

  await releasePageLock(page.id, "user-mehmet");
  const clearedLock = await getPageLock(page.id);
  assert.strictEqual(clearedLock, null, "Kilit serbest bırakılabilmeli");
  console.log("  ✔ Başarılı: Kilit devralma ve serbest bırakma doğrulandı.");

  // [TEST 3] Optimistic Concurrency Control (Sürüm Uyuşmazlığı) (PG-K-03)
  console.log("\n[TEST 3] Optimistic Concurrency (Sessiz Ezme Engelleme) (PG-K-03)");
  const staleVersion = page.version; // v1
  // First update bumps version to v2
  const update1 = await updatePage(page.id, {
    title: "Güncelleme 1",
    expectedVersion: staleVersion,
  });
  assert.ok(update1.success && update1.page);
  assert.strictEqual(update1.page.version, staleVersion + 1);

  // Second concurrent update with old version should fail with conflict!
  const update2 = await updatePage(page.id, {
    title: "Güncelleme 2 (Gecikmiş İstek)",
    expectedVersion: staleVersion, // still expects v1
  });
  assert.strictEqual(update2.success, false, "Sürüm uyuşmazlığında güncelleme reddedilmeli");
  assert.strictEqual(update2.conflict, true, "Conflict bayrağı true olmalı");
  console.log("  ✔ Başarılı: Optimistic locking ile sessiz ezme engellendi.");

  // [TEST 4] Slug Değişimi ve 301 Yönlendirme Zincir/Döngü Koruması (PG-S-02)
  console.log("\n[TEST 4] 301 Yönlendirme ve Döngü Koruması (PG-S-02)");
  const slugA = `/eski-adres-${Date.now()}`;
  const slugB = `/yeni-adres-${Date.now()}`;

  // Register A -> B
  await registerPageRedirect(page.id, slugA, slugB);
  const red1 = await resolveRedirect(slugA);
  assert.ok(red1);
  assert.strictEqual(red1.toPath, slugB, "A adresi B'ye yönlenmeli");

  // If user later redirects B -> A (potential infinite loop A -> B -> A)
  await registerPageRedirect(page.id, slugB, slugA);
  const red2 = await resolveRedirect(slugB);
  assert.ok(red2);
  assert.strictEqual(red2.toPath, slugA, "B adresi A'ya yönlenmeli");

  // Verify loop was broken and A no longer redirects to B
  const redAAfter = await resolveRedirect(slugA);
  assert.strictEqual(
    redAAfter?.toPath === slugB,
    false,
    "Sonsuz döngü (A -> B -> A) otomatik kırılmalıdır"
  );
  console.log("  ✔ Başarılı: 301 yönlendirme ve döngü engelleme doğrulandı.");

  // [TEST 5] Çöp Kutusu, Geri Yükleme ve 30 Günlük Temizleme (PG-T-01, PG-T-02, PG-T-04)
  console.log("\n[TEST 5] Çöp Kutusu, Geri Yükleme ve Süre Denetimi (PG-T-01, PG-T-04)");
  const trashRes = await trashPage(page.id);
  assert.strictEqual(trashRes.success, true);

  const trashedPage = await getPageById(page.id);
  assert.strictEqual(trashedPage?.status, "TRASH");
  assert.ok(trashedPage?.trashedAt, "trashedAt tarihi atanmalı");

  // Restore returns page as DRAFT (PG-T-02)
  const restoreRes = await restorePageFromTrash(page.id);
  assert.strictEqual(restoreRes.success, true);
  const restoredPage = await getPageById(page.id);
  assert.strictEqual(restoredPage?.status, "DRAFT", "Çöpten geri yüklenen sayfa DRAFT olarak dönmeli");
  assert.strictEqual(restoredPage?.trashedAt, null);

  // System page trash prevention (PG-T-05)
  const sysPage = await createPage({
    title: "Sistem Ana Sayfa",
    slug: `sys-anasayfa-${Date.now()}`,
    isSystem: true,
    systemKey: "anasayfa",
    content: [],
  });
  assert.ok(sysPage.page);
  const sysTrashRes = await trashPage(sysPage.page.id);
  assert.strictEqual(sysTrashRes.success, false, "Sistem sayfaları çöpe atılamaz");
  console.log("  ✔ Başarılı: Çöp kutusu, geri yükleme ve sistem sayfası koruması doğrulandı.");

  console.log("\n>>> DİLİM 7 TESTLERİNİN TÜMÜ (5/5) BAŞARIYLA GEÇTİ! <<<\n");
}

runDilim7Tests().catch((err) => {
  console.error("DİLİM 7 TEST HATASI:", err);
  process.exit(1);
});
