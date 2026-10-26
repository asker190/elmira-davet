---
description: Admin sayfa editörünü, ön yüzle AYNI bileşenleri render eden, blok tabanlı ve tasarımı bozmayan canlı editöre dönüştürür. Mevcut blok mantığı korunur.
---
Önce oku: docs/canli-sayfa-editoru-senaryolar.md (öncelikli), docs/sayfa-yonetimi-senaryolar.md (liste, revizyon, kilit, çöp),
docs/icerik-alanlari.md, docs/tasarim-kilidi.md. Çelişirse canli-sayfa-editoru-senaryolar.md geçerlidir.
AMAÇ: Admin'de sayfayı düzenlerken gördüğüm şey ön yüzdeki tasarımın AYNISI olacak, yaptığım değişiklik ön yüzde de görünecek,
ve ne yaparsam yapayım (içerik, blok ekle/sırala, "tasarımı güncelle") yapı bozulmayacak. Tasarım DEĞİŞMEZ.
Mevcut blok mantığını ve kayıtlı sayfa verisini koru. Yeniden başlama, düzelt.

ÖNKOŞUL: /tasarim-geri-al tamamlandı, ben onayladım, npm run test:visual geçiyor. Değilse DUR ve söyle.

AŞAMA 0: TEŞHİS (hiçbir dosyayı değiştirme)
1. Mevcut editörü ve blok sistemini incele: tuval siteyi nasıl render ediyor (aynı bileşen mi, kopya mı), blok şeması, blok verisinde stil/sınıf/renk/boşluk
   alanı var mı, stil yalıtımı (iframe/shadow) var mı, kaydetme akışı, şema sürümü/migrasyon var mı, sıraya bağlı stil (nth-child, index) var mı.
2. "Tasarımı güncelle" dediğimde yapının bozulduğu yeri bul: git geçmişinde ilgili commit/dosyalar, şema değişti mi, kayıtlı veri etkilendi mi.
3. Tarayıcı subagent ile aynı sayfayı editörde ve ön yüzde aç (1600x840, 1280x720, 390x844), yan yana karşılaştır, sapmaları tabloya yaz: sayfa | blok | ön yüz | editör | olası neden.
4. Kök nedenleri sınıfla: (a) editörde kopya/benzer bileşen (b) stil sızıntısı/yalıtım yok (c) blok verisi stil veya markup tutuyor
   (d) şema değişikliği migrasyonsuz (e) sıraya bağlı stil (f) editör sarmalayıcıları herkese açık HTML'i değiştiriyor (g) diğer.
5. Blok katalog adayını çıkar: tasarımdaki her bölüm bir blok mu, hangi sayfada kaç kez geçiyor, kısıtları (BL-05) koddan çıkar.
6. Rapor: docs/editor-teshis.md. DUR ve onayımı bekle.

AŞAMA 1: PLAN (kod yazma, onayımı bekle)
1. Mimari: tek kaynak bileşen katmanı (ör. components/site). Blok kaydı bu bileşenleri SARMALAR. Tuval, herkese açık render yolunun aynısını düzenleme modunda kullanır.
   Tuval yalıtımı için iframe önerilir (gerçek medya sorguları, stil sızıntısı yok). Alternatifleri gerekçesiyle kıyasla ve birini seç.
2. Satır içi düzenleme işaretleri (Editable/Field) yalnızca düzenleme modunda DOM'a etki eder, kapalıyken sıfır fark (EP-03).
3. Veri: blok verisi yalnızca içerik. Şema sürümlü, migrasyonlu. Mevcut kayıtlı sayfalar KORUNARAK geçiş planı (MG-01, MG-02), geri alma yedeği.
4. Koruma önlemleri: statik denetim (editörde site bileşeni kopyası var mı), şema anlık görüntü testi, görsel regresyon, DOM yapı testi, veride stil alanı taraması.
5. Implementation Plan sun, onayımı bekle.

AŞAMA 2: DİLİMLER (her dilim sonunda: ilgili senaryo testleri + npm run test:visual sıfır fark + kısa özet, sonra DUR)
E1 Tek kaynak: blok kaydı site bileşenlerini kullanır, kopyalar kaldırılır (EP-01..EP-04)
E2 İçerik şeması: yalnızca içerik, stil alanları temizlenir, sürümleme ve migrasyon (EP-05..EP-10, MG-*)
E3 Tuval: gerçek render, yalıtım, blok seçimi, tuval-panel eşleşmesi (ED-01, ED-02, ED-13..ED-15)
E4 Satır içi düzenleme: metin, altın vurgu, zengin metin, görsel, bağlantı, liste alanları (ED-03..ED-09, ED-12)
E5 Dinamik bloklar ve "Kaynağı düzenle" çekmecesi (ED-10, ED-11)
E6 Blok işlemleri: katalog, ekle, sırala, çoğalt, gizle, sil, kısıtlar (BL-*)
E7 Kaydet/taslak/yayın/önizleme/revizyon/kilit entegrasyonu (KY-*)
E8 Doğrulama: tüm EP-, ED-, BL-, KY-, MG- senaryoları, rapor docs/canli-sayfa-editoru-rapor.md

KURALLAR
- Site bileşenlerinin stilini, sınıfını veya animasyonunu değiştirme. Gerekirse /tasarim-degistir akışını öner ve dur.
- Panelde renk, font, boşluk, animasyon, sütun, özel HTML, iç içe blok seçeneği sunma. Yeni blok türü ekleme.
- Baseline güncelleme önerme. Editör için kopya bileşen yazma.
- UI senaryolarını Playwright ile test et (kodu test adına ekle) ve tarayıcı subagent ile kayıt/ekran görüntüsü al.
