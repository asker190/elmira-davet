import assert from "node:assert";
import {
  createPage,
  updatePage,
  getPageById,
  getPageBySlug,
  permanentlyDeletePage,
} from "../../src/lib/cms/page-service";
import { resolveRedirect } from "../../src/lib/cms/redirect-service";
import { checkSlugAvailabilityAction } from "../../src/app/admin/sayfalar/actions";

async function runTests() {
  console.log("=== SISTEM SAYFALARI SLUG VE BOŞ SLUG (KÖK '/') TESTLERI BAŞLIYOR ===");

  const timestamp = Date.now();

  // 1. TEST: Sistem sayfasının slug'ı değiştirilebilir
  console.log("\n[TEST 1] Sistem Sayfasının Slug'ının Değiştirilebilmesi");
  const sysPageRes = await createPage({
    title: "Sistem Sayfası Test",
    slug: `sistem-test-${timestamp}`,
    isSystem: true,
    systemKey: `system_key_${timestamp}`,
  });
  assert.ok(sysPageRes.success && sysPageRes.page, "Sistem sayfası oluşturulmalı");
  const sysPageId = sysPageRes.page.id;

  const newSlug = `yeni-sistem-slug-${timestamp}`;
  const updateRes = await updatePage(sysPageId, { slug: newSlug });
  assert.strictEqual(updateRes.success, true, "Sistem sayfasının slug'ı başarıyla güncellenebilmeli");
  assert.strictEqual(updateRes.page?.slug, newSlug, "Güncellenen slug eşleşmeli");

  // 301 redirect oluşturuldu mu?
  const redirectCheck = await resolveRedirect(`/sistem-test-${timestamp}`);
  assert.ok(redirectCheck, "Eski slug'dan yeni slug'a 301 yönlendirmesi kaydedilmeli");
  assert.strictEqual(redirectCheck.toPath, `/${newSlug}`);
  console.log("  ✔ Başarılı: Sistem sayfasının slug'ı değiştirildi ve 301 yönlendirmesi kaydedildi.");

  // 2. TEST: Boş slug (kök '/') girildiğinde otomatik slug oluşturulmamalı, boş olarak kaydedilmeli
  console.log("\n[TEST 2] Boş Slug (Kök '/') Girildiğinde Otomatik Slug Üretilmeyip Boş Kalması");
  const updateEmptyRes = await updatePage(sysPageId, { slug: "" });
  assert.strictEqual(updateEmptyRes.success, true, "Slug boş olarak güncellenebilmeli");
  assert.strictEqual(updateEmptyRes.page?.slug, "", "Slug başlığa dönüştürülmemeli, boş ('') kalmalı");

  // getPageBySlug("") ile bulunabilmeli
  const rootPage = await getPageBySlug("");
  assert.ok(rootPage, "Kök ('') slug ile sayfa sorgulanabilmeli");
  assert.strictEqual(rootPage.id, sysPageId, "Kök sayfa ID'si eşleşmeli");
  console.log("  ✔ Başarılı: Slug boş girdiğimizde otomatik slug üretilmedi, kök ('') olarak kaydedildi.");

  // 3. TEST: İkinci bir sayfaya boş slug verildiğinde çakışma hatası vermeli
  console.log("\n[TEST 3] İkinci Sayfaya Boş Slug Verildiğinde Tekillik (Unique) Kontrolü");
  const page2Res = await createPage({
    title: "İkinci Sayfa",
    slug: `ikinci-sayfa-${timestamp}`,
  });
  assert.ok(page2Res.success && page2Res.page);

  const duplicateEmptyRes = await updatePage(page2Res.page.id, { slug: "" });
  assert.strictEqual(duplicateEmptyRes.success, false, "İkinci sayfaya boş slug verilememeli");
  assert.ok(duplicateEmptyRes.error?.includes("Kök"), "Hata mesajı kök slug çakışmasını belirtmeli");
  console.log("  ✔ Başarılı: Birden fazla sayfaya boş slug verilmesi engellendi.");

  // 4. TEST: checkSlugAvailabilityAction boş slug denetimi
  console.log("\n[TEST 4] checkSlugAvailabilityAction Boş Slug ve Kullanılabilirlik Kontrolü");
  const checkOwn = await checkSlugAvailabilityAction("", sysPageId);
  assert.strictEqual(checkOwn.available, true, "Kendi sayfası için boş slug müsait görünmeli");

  const checkOther = await checkSlugAvailabilityAction("", page2Res.page.id);
  assert.strictEqual(checkOther.available, false, "Başka sayfa için boş slug dolu görünmeli");
  console.log("  ✔ Başarılı: checkSlugAvailabilityAction boş slug uygunluğunu doğru raporluyor.");

  // Temizlik
  await permanentlyDeletePage(sysPageId);
  await permanentlyDeletePage(page2Res.page.id);
  console.log("\n>>> TÜM TESTLER BAŞARIYLA GEÇTİ! <<<\n");
}

runTests().catch((err) => {
  console.error("TEST HATASI:", err);
  process.exit(1);
});
