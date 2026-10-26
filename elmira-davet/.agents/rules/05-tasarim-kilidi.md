---
trigger: always_on
description: "Ön yüz tasarımı kilitlidir. Editör ve site aynı bileşenleri kullanır. Blok verisi yalnızca içerik tutar. Tasarım isteği önce etki analizi ister."
---
# TASARIM KİLİDİ (her zaman geçerli)

- Herkese açık sitenin görünümü KİLİTLİDİR: yerleşim, renk, yazı tipi, boşluk, köşe, gölge, animasyon, etkileşim.
  Referans: @docs/tasarim-kilidi.md ve docs/tasarim-referans/ klasöründeki kareler (varsa referans.mp4).
- TEK KAYNAK: Admin sayfa editörünün tuvali ile herkese açık site AYNI bileşenleri ve AYNI stilleri kullanır
  (bileşenler tek yerde, ör. components/site). Editör için kopya, benzer veya "editör sürümü" bileşen yazma.
  Tasarım bir kez tanımlanır, iki yüzey de ondan beslenir.
- Blok = mevcut tasarım bölümünün veri sarmalayıcısı. Blok verisi YALNIZCA içerik tutar (metin, görsel, bağlantı, liste, kayıt seçimi).
  Stil, sınıf, renk, font, boşluk, animasyon verisi tutma, panelde bunları seçtirme. Yeni blok türü eklemek tasarım değişikliğidir.
- Editör sarmalayıcıları (satır içi düzenleme, seçim çerçevesi) düzenleme modu kapalıyken herkese açık HTML'e hiçbir şey eklemez.
- Blok şeması ve kayıtlı sayfa verisi tasarım değişikliğiyle bozulmaz. Şema değişirse sürüm artar, migrasyon ve test yazılır.
- Tasarımla ilgili her istek ("güncelle", "düzelt", "yenile", "eşitle") önce etki analizi ister: dokunulacak bileşenler,
  blok şeması, kayıtlı içerik. Bunu /tasarim-degistir akışıyla yap, doğrudan kod yazma.
- Giriş/scroll animasyonları bittiğinde tüm içerik görünür olmalı. opacity:0 ile gizli kalan veya boş bant bırakan eleman hata sayılır.
- Siteye veya site bileşenlerine dokunan her işten sonra görsel regresyon testini çalıştır (tests/visual). Fark varsa iş bitmiş sayılmaz.
- Emin olmadığın her durumda değiştirme, sor.
