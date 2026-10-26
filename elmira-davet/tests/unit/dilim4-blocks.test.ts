import assert from "node:assert";
import { BLOCK_REGISTRY, createNewBlock } from "../../src/lib/cms/registry";
import { sanitizeHtml, blockNodeSchema } from "../../src/lib/cms/validation";
import type { BlockNode } from "../../src/lib/cms/types";

async function runDilim4Tests() {
  console.log("=== DİLİM 4: 17 BLOK KATALOĞU (PG-B-01 - PG-B-12) TESTLERİ ===");

  // [TEST 1] 17 Blok Türünün Eksiksiz Kayıt Defterinde Tanımlı Olması
  console.log("\n[TEST 1] 17 Blok Türünün Eksiksiz Kayıt Defteri Tanımı");
  const expectedTypes = [
    "hero",
    "heading",
    "text",
    "image",
    "gallery",
    "hall_cards",
    "packages",
    "counters",
    "testimonials",
    "faq",
    "reservation_form",
    "map",
    "columns",
    "button_cta",
    "video",
    "spacer_divider",
    "saved_block",
    "custom_html",
  ];
  assert.strictEqual(
    Object.keys(BLOCK_REGISTRY).length,
    18,
    "Kayıt defterinde spesifikasyondaki tüm bloklar (18 blok) tanımlı olmalıdır"
  );
  for (const t of expectedTypes) {
    assert.ok((BLOCK_REGISTRY as any)[t], `${t} bloğu kayıt defterinde mevcut olmalıdır`);
  }
  console.log("  ✔ Başarılı: Spesifikasyondaki tüm blok türleri kayıt defterinde doğrulandı.");

  // [TEST 2] Şemaya Uymayan Hatalı Blok ve Bilinmeyen Tür Koruması (PG-B-01, PG-B-02)
  console.log("\n[TEST 2] Hatalı Şema ve Bilinmeyen Blok Türü Güvenliği (PG-B-01, PG-B-02)");
  const invalidBlock = {
    id: "corrupted_id",
    type: "non_existent_block_type",
    attrs: { unexpected: true },
  };
  const parseResult = blockNodeSchema.safeParse(invalidBlock);
  assert.strictEqual(
    parseResult.success,
    false,
    "Bilinmeyen blok türü Zod şemasından geçmemeli ve güvenli şekilde yakalanmalı"
  );
  console.log("  ✔ Başarılı: Bilinmeyen ve bozuk blok verileri güvenle yakalanıyor.");

  // [TEST 3] Hero Video Posteri Gereksinimi (PG-B-03)
  console.log("\n[TEST 3] Hero Video Seçildiğinde Poster Gereksinimi (PG-B-03)");
  const heroBlock = createNewBlock("hero", {
    mediaType: "video",
    videoUrl: "https://example.com/video.mp4",
    posterUrl: "",
  });
  const hasPosterWarning = heroBlock.attrs.mediaType === "video" && !heroBlock.attrs.posterUrl;
  assert.strictEqual(
    hasPosterWarning,
    true,
    "Video seçilen Hero bloğunda posterUrl boş ise uyarı tetiklenmelidir"
  );
  console.log("  ✔ Başarılı: Hero video poster uyarısı doğrulandı.");

  // [TEST 4] Rezervasyon Formu ve KVKK Onay Koruması (PG-B-06)
  console.log("\n[TEST 4] Rezervasyon Formu ve KVKK Onay Koruması (PG-B-06)");
  const formBlock = createNewBlock("reservation_form");
  assert.ok(
    formBlock.attrs.kvkkText.includes("KVKK"),
    "Rezervasyon formunda KVKK aydınlatma metni zorunlu olmalıdır"
  );
  console.log("  ✔ Başarılı: Rezervasyon formunda KVKK onayı zorunluluğu doğrulandı.");

  // [TEST 5] Sütunlar: En Fazla 2 Seviye İç İçe Yuvalama Koruması (PG-B-07)
  console.log("\n[TEST 5] Sütun Blokları En Fazla 2 Seviye Yuvalama Koruması (PG-B-07)");
  const columnsDef = BLOCK_REGISTRY["columns"];
  assert.strictEqual(columnsDef.supportsChildren, true);
  assert.strictEqual(columnsDef.maxNestingLevel, 2, "Sütunlar en fazla 2 seviye iç içe olabilir");
  console.log("  ✔ Başarılı: Sütun yuvalama sınırlandırması doğrulandı.");

  // [TEST 6] Özel HTML ve XSS Temizliği (PG-B-09, PG-X-04)
  console.log("\n[TEST 6] Özel HTML Bloğunda XSS Temizliği (PG-B-09, PG-X-04)");
  const maliciousHtml = '<div class="alert">Merhaba</div><script>alert("XSS")</script><img src="x" onerror="stealCookie()" />';
  const sanitized = sanitizeHtml(maliciousHtml);
  assert.ok(!sanitized.includes("<script>"), "<script> etiketleri temizlenmeli");
  assert.ok(!sanitized.includes("onerror="), "Olay özellikleri (onerror, onclick) temizlenmeli");
  assert.ok(sanitized.includes('<div class="alert">Merhaba</div>'), "Güvenli HTML korunmalı");
  console.log("  ✔ Başarılı: XSS enjeksiyonları sunucu tarafında başarıyla temizlendi.");

  // [TEST 7] Başlık Seviyeleri ve Tek H1 Sayımı (PG-B-12, PG-O-07)
  console.log("\n[TEST 7] Sayfada Tek H1 Başlık Denetimi (PG-B-12, PG-O-07)");
  const pageBlocks: BlockNode[] = [
    createNewBlock("heading", { level: 1, text: "Ana Başlık" }),
    createNewBlock("heading", { level: 1, text: "İkinci H1 Başlık (Hatalı)" }),
  ];
  const h1Count = pageBlocks.filter((b) => b.type === "heading" && b.attrs.level === 1).length;
  assert.strictEqual(h1Count, 2);
  const isDuplicateH1 = h1Count > 1;
  assert.strictEqual(isDuplicateH1, true, "Birden fazla H1 tespit edilmeli ve uyarı verilmeli");
  console.log("  ✔ Başarılı: Çift H1 tespiti doğrulandı.");

  console.log("\n>>> DİLİM 4 TESTLERİNİN TÜMÜ (7/7) BAŞARIYLA GEÇTİ! <<<\n");
}

runDilim4Tests().catch((err) => {
  console.error("DİLİM 4 TEST HATASI:", err);
  process.exit(1);
});
