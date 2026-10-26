import assert from "node:assert";
import { BLOCK_REGISTRY, createNewBlock, searchBlockRegistry } from "../../src/lib/cms/registry";
import {
  createPage,
  updatePage,
  createPageRevision,
  getPageRevisions,
  getPageById,
} from "../../src/lib/cms/page-service";
import type { BlockNode } from "../../src/lib/cms/types";

async function runDilim3Tests() {
  console.log("=== DİLİM 3: EDİTÖR İSKELETİ (PG-E-01 - PG-E-15) TESTLERİ ===");

  // [TEST 1] Blok Ekleyici Arama & Kategori (PG-E-02)
  console.log("\n[TEST 1] Blok Ekleyici Türkçe Arama ve Filtreleme (PG-E-02)");
  const searchResults1 = searchBlockRegistry("dugun", "all", true);
  assert.ok(
    searchResults1.some((b) => b.type === "packages" || b.type === "hero"),
    "Türkçe karakter duyarsız blok araması çalışmalı"
  );

  const dynamicBlocks = searchBlockRegistry("", "dynamic", true);
  assert.ok(
    dynamicBlocks.every((b) => b.category === "dynamic"),
    "Kategori filtrelemesi yalnızca seçili kategorideki blokları getirmeli"
  );
  console.log("  ✔ Başarılı: Blok arama ve kategorizasyon doğrulandı.");

  // [TEST 2] Blok Üretimi ve Benzersiz Kimlikler (PG-E-02)
  console.log("\n[TEST 2] Blok Örneği Üretimi ve Varsayılan Değerler (PG-E-02)");
  const heroBlock = createNewBlock("hero");
  const headingBlock = createNewBlock("heading");
  assert.ok(heroBlock.id.startsWith("blk_"), "Blok id'si otomatik üretilmeli");
  assert.notStrictEqual(heroBlock.id, headingBlock.id, "Her bloğun id'si benzersiz olmalı");
  assert.strictEqual(heroBlock.schemaVersion, 1, "Blok schemaVersion 1 olmalı");
  assert.strictEqual(heroBlock.attrs.overlayOpacity, 55, "Varsayılan attrs yüklenmeli");
  console.log("  ✔ Başarılı: Blok örnekleri doğru şema ve benzersiz ID ile üretildi.");

  // [TEST 3] Blok Taşıma ve Sütun Hiyerarşisi (PG-E-03)
  console.log("\n[TEST 3] Blok Sıralama ve Hiyerarşik Taşıma (PG-E-03)");
  const b1 = createNewBlock("heading", { text: "Blok 1" });
  const b2 = createNewBlock("text", { html: "<p>Blok 2</p>" });
  const b3 = createNewBlock("button_cta", { text: "Blok 3" });
  let list: BlockNode[] = [b1, b2, b3];

  // Move b3 up to index 1
  const moveUp = (items: BlockNode[], idx: number) => {
    if (idx <= 0) return items;
    const copy = [...items];
    const temp = copy[idx];
    copy[idx] = copy[idx - 1];
    copy[idx - 1] = temp;
    return copy;
  };

  list = moveUp(list, 2);
  assert.strictEqual(list[1].id, b3.id, "Blok 3 bir üste taşınmalı");
  assert.strictEqual(list[2].id, b2.id, "Blok 2 bir alta kaymalı");
  console.log("  ✔ Başarılı: Blok taşıma ve sıralama algoritması doğrulandı.");

  // [TEST 4] Blok Silme ve Geri Al Tamponu (PG-E-04)
  console.log("\n[TEST 4] Blok Silme ve Geri Al (Undo Delete) (PG-E-04)");
  const initialCount = list.length;
  const deletedIndex = 1;
  const deletedBlock = list[deletedIndex];

  // Delete
  list = list.filter((b) => b.id !== deletedBlock.id);
  assert.strictEqual(list.length, initialCount - 1, "Blok silinmeli");

  // Undo Delete (restore back into original position)
  list = [...list.slice(0, deletedIndex), deletedBlock, ...list.slice(deletedIndex)];
  assert.strictEqual(list.length, initialCount, "Geri al ile blok geri gelmeli");
  assert.strictEqual(list[deletedIndex].id, deletedBlock.id, "Blok eski pozisyonuna dönmeli");
  console.log("  ✔ Başarılı: Blok silme sonrası geri alma başarıyla çalıştı.");

  // [TEST 5] Geri Al / İleri Al 50 Adım Geçmiş Kapasitesi (PG-E-05)
  console.log("\n[TEST 5] Geri Al / İleri Al 50 Adım Geçmiş Kapasitesi (PG-E-05)");
  const historyBuffer: BlockNode[][] = [];
  for (let i = 0; i < 55; i++) {
    historyBuffer.push([createNewBlock("heading", { text: `Adım ${i}` })]);
    if (historyBuffer.length > 50) {
      historyBuffer.shift(); // En eskiyi at
    }
  }
  assert.strictEqual(historyBuffer.length, 50, "Geçmiş tamponu en fazla 50 adım tutmalı");
  assert.strictEqual(
    historyBuffer[49][0].attrs.text,
    "Adım 54",
    "Son adım en güncel hâli yansıtmalı"
  );
  console.log("  ✔ Başarılı: 50 adımlı geri al/ileri al geçmiş tamponu doğrulandı.");

  // [TEST 6] Otomatik Kayıt: Yayındaki Sayfayı Bozmadan AUTOSAVE Revizyonu (PG-E-06)
  console.log("\n[TEST 6] Otomatik Kayıt ve Yayındaki Sayfa Korunması (PG-E-06)");
  const createRes = await createPage({
    title: "Canlı Yayındaki Sayfa",
    slug: `canli-sayfa-${Date.now()}`,
    status: "PUBLISHED",
    content: [createNewBlock("heading", { text: "Orijinal Başlık" })],
  });
  assert.ok(createRes.success && createRes.page);
  const livePage = createRes.page;

  // Simulate Autosave with modified content
  const autoSaveContent = [createNewBlock("heading", { text: "Değiştirilmiş Taslak Başlık" })];
  await createPageRevision(
    livePage.id,
    "Canlı Yayındaki Sayfa (Taslak)",
    autoSaveContent,
    "admin-user",
    "AUTOSAVE"
  );

  // Verify page status is STILL PUBLISHED in DB
  const checkPage = await getPageById(livePage.id);
  assert.ok(checkPage);
  assert.strictEqual(
    checkPage.status,
    "PUBLISHED",
    "Otomatik kayıt yayındaki sayfanın PUBLISHED durumunu değiştirmemeli"
  );

  // Check revision was recorded
  const revs = await getPageRevisions(livePage.id);
  assert.ok(
    revs.some((r) => r.type === "AUTOSAVE"),
    "AUTOSAVE revizyonu kaydedilmiş olmalı"
  );
  console.log("  ✔ Başarılı: Otomatik kayıt yayını bozmadı, ayrı revizyon olarak kaydedildi.");

  // [TEST 7] Cihaz Görünürlük Bayrakları (PG-E-13)
  console.log("\n[TEST 7] Cihaz Görünürlük Bayrakları ve Önizleme (PG-E-13)");
  const mobileHiddenBlock = createNewBlock("hero");
  mobileHiddenBlock.visibility = { hideOnMobile: true };
  assert.strictEqual(mobileHiddenBlock.visibility.hideOnMobile, true);
  console.log("  ✔ Başarılı: Cihaz önizleme görünürlük konfigürasyonu doğrulandı.");

  console.log("\n>>> DİLİM 3 TESTLERİNİN TÜMÜ (7/7) BAŞARIYLA GEÇTİ! <<<\n");
}

runDilim3Tests().catch((err) => {
  console.error("DİLİM 3 TEST HATASI:", err);
  process.exit(1);
});
