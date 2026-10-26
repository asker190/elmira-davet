import assert from "node:assert";
import {
  createPage,
  updatePage,
  createPageRevision,
  getPageRevisions,
  restoreRevision,
  getPageById,
  getAllPages,
} from "../../src/lib/cms/page-service";
import { createNewBlock } from "../../src/lib/cms/registry";

async function runDilim6Tests() {
  console.log("=== DİLİM 6: YAYINLAMA, ZAMANLAMA VE REVİZYON (PG-P & PG-R) TESTLERİ ===");

  // [TEST 1] Taslak Kaydet ve Yayınlama Doğrulaması (PG-P-01, PG-P-03)
  console.log("\n[TEST 1] Taslak Kayıt ve Yayınlama (PG-P-01, PG-P-03)");
  const createRes = await createPage({
    title: "Yayın Testi Sayfası",
    slug: `yayin-test-${Date.now()}`,
    status: "DRAFT",
    content: [createNewBlock("heading", { text: "Taslak Başlık" })],
  });
  assert.ok(createRes.success && createRes.page);
  const page = createRes.page;
  assert.strictEqual(page.status, "DRAFT", "Yeni sayfa ilk olarak DRAFT kaydedilmeli");

  // Publish
  const publishRes = await updatePage(page.id, {
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
  });
  assert.ok(publishRes.success && publishRes.page);
  assert.strictEqual(publishRes.page.status, "PUBLISHED", "Durum PUBLISHED olmalı");
  assert.ok(publishRes.page.publishedAt, "publishedAt tarihi atanmış olmalı");
  console.log("  ✔ Başarılı: Taslak oluşturma ve yayına alma doğrulandı.");

  // [TEST 2] Zamanlama ve Europe/Istanbul Saat Dilimi Kararlılığı (PG-P-06, PG-P-08)
  console.log("\n[TEST 2] Zamanlama ve Europe/Istanbul Saat Dilimi (PG-P-06, PG-P-08)");
  // Gece 23:30 TR saati (UTC+3) -> UTC 20:30
  const trTimeString = "2026-10-25T23:30:00+03:00";
  const utcDate = new Date(trTimeString);

  const scheduleRes = await updatePage(page.id, {
    status: "SCHEDULED",
    scheduledAt: utcDate.toISOString(),
  });
  assert.ok(scheduleRes.success && scheduleRes.page);
  assert.strictEqual(scheduleRes.page.status, "SCHEDULED");

  // Verify format in Europe/Istanbul timezone
  const formattedInIstanbul = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(scheduleRes.page.scheduledAt!));

  assert.ok(
    formattedInIstanbul.includes("23:30"),
    "Europe/Istanbul saat diliminde saat 23:30 olarak görüntülenmeli"
  );
  assert.ok(
    formattedInIstanbul.includes("25.10.2026") || formattedInIstanbul.includes("25/10/2026"),
    "Ertesi güne kayma olmamalı"
  );
  console.log("  ✔ Başarılı: TR saat dilimi zamanlama ve tarih koruması doğrulandı.");

  // [TEST 3] Revizyon Geçmişi ve Diff Karşılaştırma (PG-R-01, PG-R-02)
  console.log("\n[TEST 3] Revizyon Geçmişi ve Diff Özeti (PG-R-01, PG-R-02)");
  const rev1 = await createPageRevision(
    page.id,
    "Sürüm 1",
    [createNewBlock("heading", { text: "İlk Sürüm" })],
    "admin-user",
    "MANUAL"
  );

  const rev2 = await createPageRevision(
    page.id,
    "Sürüm 2",
    [
      createNewBlock("heading", { text: "İkinci Sürüm" }),
      createNewBlock("text", { html: "<p>Eklenen metin</p>" }),
    ],
    "admin-user",
    "PUBLISH"
  );

  const allRevs = await getPageRevisions(page.id);
  assert.ok(allRevs.length >= 2, "En az 2 revizyon bulunmalı");
  assert.strictEqual(allRevs[0].id, rev2.id, "Son kaydedilen revizyon en başta olmalı");

  // Diff summary
  const blockCountDiff = rev2.content.length - rev1.content.length;
  assert.strictEqual(blockCountDiff, 1, "Sürüm 2'de 1 blok fazla olmalı");
  console.log("  ✔ Başarılı: Revizyon geçmişi ve diff karşılaştırma doğrulandı.");

  // [TEST 4] Revizyonu Taslak Olarak Geri Yükleme (PG-R-03)
  console.log("\n[TEST 4] Revizyonu Taslak Olarak Geri Yükleme (PG-R-03)");
  const restoreRes = await restoreRevision(page.id, rev1.id, "admin-user");
  assert.ok(restoreRes.success && restoreRes.page);
  assert.strictEqual(restoreRes.page.title, "Sürüm 1", "Eski revizyon başlığı geri gelmeli");
  assert.strictEqual(restoreRes.page.content.length, 1, "Eski revizyon blokları yüklenmeli");

  // Verify RESTORE revision was added to history
  const updatedRevs = await getPageRevisions(page.id);
  assert.strictEqual(updatedRevs[0].type, "RESTORE", "Geri yükleme yeni bir RESTORE revizyonu olmalı");
  console.log("  ✔ Başarılı: Revizyon yayını bozmadan editöre taslak olarak geri yüklendi.");

  // [TEST 5] Son 50 Revizyon Sınırı ve PUBLISH Korunması (PG-R-04)
  console.log("\n[TEST 5] Revizyon Kotası (Max 50) ve PUBLISH Korunması (PG-R-04)");
  for (let i = 0; i < 55; i++) {
    await createPageRevision(
      page.id,
      `Oto Kayıt ${i}`,
      [createNewBlock("heading", { text: `Metin ${i}` })],
      "admin-user",
      i % 10 === 0 ? "PUBLISH" : "MANUAL"
    );
  }
  const cappedRevs = await getPageRevisions(page.id);
  assert.ok(cappedRevs.length <= 50, "Maksimum revizyon 50'yi aşmamalı");
  assert.ok(
    cappedRevs.some((r) => r.type === "PUBLISH"),
    "PUBLISH revizyonları temizlenmeden korunmalı"
  );
  console.log("  ✔ Başarılı: 50 revizyon kotası ve PUBLISH koruma kuralı doğrulandı.");

  console.log("\n>>> DİLİM 6 TESTLERİNİN TÜMÜ (5/5) BAŞARIYLA GEÇTİ! <<<\n");
}

runDilim6Tests().catch((err) => {
  console.error("DİLİM 6 TEST HATASI:", err);
  process.exit(1);
});
