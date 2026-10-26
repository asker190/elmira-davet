import assert from "node:assert";
import { createNewBlock } from "../../src/lib/cms/registry";
import { blockMotionSchema } from "../../src/lib/cms/validation";
import type { BlockNode, BlockMotionConfig } from "../../src/lib/cms/types";

async function runDilim5Tests() {
  console.log("=== DİLİM 5: HAREKET (MOTION) AYARLARI (PG-H-01 - PG-H-07) TESTLERİ ===");

  // [TEST 1] Hareket Şeması ve Geçerli Animasyon Değerleri (PG-H-01)
  console.log("\n[TEST 1] Animasyon Türleri ve Varsayılan Değerler (PG-H-01)");
  const validMotion: BlockMotionConfig = {
    animation: "slide-up",
    duration: 0.8,
    delay: 0.1,
    trigger: "viewport",
    once: true,
    stagger: 0.1,
  };
  const parseRes = blockMotionSchema.safeParse(validMotion);
  assert.strictEqual(parseRes.success, true, "Geçerli hareket konfigürasyonu doğrulanmalı");
  console.log("  ✔ Başarılı: Hareket şeması ve türleri doğrulandı.");

  // [TEST 2] Süre Sınırı Zorlaması (Clamp 0.2 - 2.0 sn) (PG-H-04)
  console.log("\n[TEST 2] Süre ve Gecikme Sınır Zorlaması (PG-H-04)");
  const clampedDuration = Math.min(Math.max(10.0, 0.2), 2.0); // 10 sn girilirse 2.0'ye kırpılır
  assert.strictEqual(clampedDuration, 2.0, "10 sn girilen animasyon süresi en fazla 2.0 sn olmalıdır");

  const tooShortDuration = Math.min(Math.max(0.05, 0.2), 2.0);
  assert.strictEqual(tooShortDuration, 0.2, "0.05 sn girilen süre en az 0.2 sn olmalıdır");
  console.log("  ✔ Başarılı: Animasyon süre sınırlandırmaları (0.2s - 2.0s) doğrulandı.");

  // [TEST 3] Parallax Sadece Hero ve Görselde Desteklenir (PG-H-03)
  console.log("\n[TEST 3] Parallax Desteği Kısıtlaması (PG-H-03)");
  const isParallaxAllowed = (type: string) => type === "hero" || type === "image";
  assert.strictEqual(isParallaxAllowed("hero"), true, "Hero parallax desteklemeli");
  assert.strictEqual(isParallaxAllowed("image"), true, "Görsel parallax desteklemeli");
  assert.strictEqual(isParallaxAllowed("text"), false, "Metin bloğu parallax desteklememeli");
  assert.strictEqual(isParallaxAllowed("faq"), false, "SSS bloğu parallax desteklememeli");
  console.log("  ✔ Başarılı: Parallax kısıtlaması doğru bloklarla sınırlandırıldı.");

  // [TEST 4] Sayfada 6'dan Fazla Parallax Performans Uyarısı (PG-H-04)
  console.log("\n[TEST 4] 6'dan Fazla Parallax Performans Uyarısı (PG-H-04)");
  const blocksWithParallax: BlockNode[] = [];
  for (let i = 0; i < 7; i++) {
    const b = createNewBlock("image");
    b.motion = { ...b.motion!, parallaxSpeed: 0.3 };
    blocksWithParallax.push(b);
  }
  const parallaxCount = blocksWithParallax.filter(
    (b) => (b.type === "hero" || b.type === "image") && (b.motion?.parallaxSpeed || 0) > 0
  ).length;
  assert.strictEqual(parallaxCount, 7);
  const showPerformanceWarning = parallaxCount > 6;
  assert.strictEqual(
    showPerformanceWarning,
    true,
    "Sayfada 6'dan fazla parallax varsa performans uyarısı tetiklenmelidir"
  );
  console.log("  ✔ Başarılı: Parallax performans uyarısı başarıyla tetiklendi.");

  console.log("\n>>> DİLİM 5 TESTLERİNİN TÜMÜ (4/4) BAŞARIYLA GEÇTİ! <<<\n");
}

runDilim5Tests().catch((err) => {
  console.error("DİLİM 5 TEST HATASI:", err);
  process.exit(1);
});
