---
trigger: model_decision
description: "Admin Sayfalar modülü, blok tabanlı canlı sayfa editörü, blok kaydı ve blok şeması ile ilgili işlerde uygula."
---
- Spesifikasyonlar: @docs/canli-sayfa-editoru-senaryolar.md (öncelikli), @docs/sayfa-yonetimi-senaryolar.md (liste, yeni ekle, revizyon, kilit, çöp),
  @docs/icerik-alanlari.md. Çelişirse canli-sayfa-editoru-senaryolar.md geçerlidir.
  Eski belgelerdeki Stil/Hareket sekmesi, cihaza özel override, sütun, iç içe blok ve özel HTML bloğu maddeleri GEÇERSİZDİR.
- Editör tuvali gerçek site bileşenlerini render eder (tek kaynak). Kopya veya benzer bileşen yazma.
- Blok verisi yalnızca içerik tutar. Stil, renk, font, boşluk ve animasyon seçeneği sunma.
- Yayındaki sayfa, otomatik kayıt veya taslak düzenlemeyle değişmez. Yalnızca Yayınla/Güncelle değiştirir.
- Dinamik bloklar veriyi kendi modüllerinden çeker (salon, paket, etkinlik, galeri, yorum, SSS), içeriği sayfaya kopyalamaz.
- Yetki ve doğrulama sunucuda yapılır.
