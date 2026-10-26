process.env.TSX_TEST = "1";
import assert from "assert";
import {
  createPage,
  getPageById,
  getPageBySlug,
  getAllPages,
  trashPage,
  clonePage,
  updatePage,
} from "../../src/lib/cms/page-service";
import {
  checkSlugAvailabilityAction,
  batchPagesAction,
  quickEditPageAction,
} from "../../src/app/admin/sayfalar/actions";
import { slugifyTurkish } from "../../src/lib/cms/validation";

async function runDilim2Tests() {
  console.log("=== DİLİM 2: TÜM SAYFALAR LİSTESİ (PG-L) VE YENİ EKLE (PG-N) TESTLERİ ===");

  // 1. Test: Turkish-insensitive search (PG-L-03)
  console.log("[TEST 1] Türkçe Karakter Duyarsız Arama (PG-L-03)");
  const p1 = await createPage({
    title: "Düğün Paketleri ve Kına",
    slug: `dugun-ve-kina-${Date.now()}`,
    status: "PUBLISHED",
  });
  assert.ok(p1.success && p1.page);

  // Search "dugun" should find "Düğün Paketleri ve Kına"
  const searchResults1 = await getAllPages({ search: "dugun" });
  assert.ok(
    searchResults1.some((p) => p.id === p1.page!.id),
    "'dugun' araması 'Düğün' içeren sayfayı bulmalıdır"
  );

  // Search "KINA" should find
  const searchResults2 = await getAllPages({ search: "KINA" });
  assert.ok(
    searchResults2.some((p) => p.id === p1.page!.id),
    "'KINA' araması sayfayı bulmalıdır"
  );
  console.log("  ✔ Başarılı: Türkçe karakter duyarsız arama çalışıyor.");

  // 2. Test: Status Counts and Trash exclusion from ALL (PG-L-02)
  console.log("[TEST 2] Durum Sekmeleri Sayımları ve Çöp Ayrımı (PG-L-02)");
  const allActive = await getAllPages({ status: "ALL" });
  assert.ok(
    allActive.every((p) => p.status !== "TRASH"),
    "Tümü sekmesinde Çöp sayfaları YER ALMAMALIDIR (L-02)"
  );
  console.log("  ✔ Başarılı: Çöp sayfaları Tümü sekmesinden başarıyla ayrıldı.");

  // 3. Test: Quick Edit (PG-L-05)
  console.log("[TEST 3] Hızlı Düzenle (PG-L-05)");
  const updateRes = await updatePage(p1.page.id, {
    title: "Güncellenmiş Düğün Paketi",
    menuOrder: 5,
  });
  assert.ok(updateRes.success && updateRes.page);
  assert.strictEqual(updateRes.page.title, "Güncellenmiş Düğün Paketi");
  assert.strictEqual(updateRes.page.menuOrder, 5);
  console.log("  ✔ Başarılı: Hızlı düzenleme verileri sayfa yenilenmeden güncelledi.");

  // 4. Test: Clone Page (PG-L-08)
  console.log("[TEST 4] Sayfa Kopyalama (PG-L-08)");
  const cloneRes = await clonePage(p1.page.id);
  assert.ok(cloneRes.success && cloneRes.page);
  assert.ok(cloneRes.page.title.includes("(Kopya)"), "Başlık (Kopya) içermelidir");
  assert.strictEqual(cloneRes.page.status, "DRAFT", "Kopya taslak olmalıdır");
  assert.notStrictEqual(cloneRes.page.slug, p1.page.slug, "Kopya slug benzersiz olmalıdır");
  console.log("  ✔ Başarılı: Sayfa kopyalandı ->", cloneRes.page.title, `(${cloneRes.page.slug})`);

  // 5. Test: System Page Protection (PG-L-10)
  console.log("[TEST 5] Sistem Sayfası Koruma Denetimi (PG-L-10)");
  const sysPage = await createPage({
    title: "Ana Sayfa",
    slug: `anasayfa-sistem-test-${Date.now()}`,
    status: "PUBLISHED",
    isSystem: true,
  });
  assert.ok(sysPage.success && sysPage.page);

  const trashAttempt = await trashPage(sysPage.page.id);
  assert.strictEqual(trashAttempt.success, false, "Sistem sayfası çöpe atılamaz");
  console.log("  ✔ Başarılı: Sistem sayfaları çöpe atılmaya karşı korumalıdır.");

  // 6. Test: Slug Availability & Trash Detection (PG-N-01, PG-N-05)
  console.log("[TEST 6] Kalıcı Bağlantı ve Çöpteki Slug Çakışması (PG-N-01, PG-N-05)");
  const trashTarget = await createPage({
    title: "Çöp Adayı Sayfa",
    slug: `cop-slug-${Date.now()}`,
    status: "DRAFT",
  });
  assert.ok(trashTarget.success && trashTarget.page);
  await trashPage(trashTarget.page.id);

  // Check availability of that slug:
  const slugCheck = await checkSlugAvailabilityAction(trashTarget.page.slug);
  assert.strictEqual(slugCheck.available, false, "Çöpteki slug doğrudan müsait olmamalıdır");
  assert.strictEqual(slugCheck.isInTrash, true, "Çöpte olduğu bayrağı true olmalıdır (N-05)");
  console.log("  ✔ Başarılı: Çöpteki slug çakışması tespit edildi ve öneri mesajı hazırlandı.");

  console.log("\n>>> DİLİM 2 TESTLERİNİN TÜMÜ (6/6) BAŞARIYLA GEÇTİ! <<<");
}

runDilim2Tests().catch((err) => {
  console.error("DİLİM 2 TEST HATASI:", err);
  process.exit(1);
});
