---
description: Tasarımı DEĞİŞTİRMEDEN liste modüllerini, site ayarlarını, SEO, medya ve form ayarlarını admin panelinden düzenlenebilir yapar. Sayfa/blok düzenleme /canli-sayfa-editoru ile yapılır.
---
ÖNKOŞUL: /tasarim-geri-al tamamlandı, ben onayladım ve npm run test:visual geçiyor. Değilse DUR ve söyle.
Spesifikasyon: docs/icerik-alanlari.md, docs/dinamik-admin-senaryolar.md, docs/tasarim-kilidi.md (önce hepsini oku).
Admin arayüzü Türkçe. Kod ve değişken adları İngilizce. Doğrulama Zod, yetki sunucuda, hassas işlemler ActivityLog'a yazılır.

TEMEL İLKE
- Ön yüz görünümü değişmez. Sabit metin/görsel/bağlantı yerine veritabanı değeri okunur. Seed, mevcut sitenin birebir içeriğidir;
  seed yüklenince ön yüz görsel regresyon testinden farksız geçmelidir (DA-01).
- Panel formları "alan kayıt defterinden" üretilir (docs/icerik-alanlari.md). Her alanın etiketi, türü, sınırı, varsayılanı ve
  boş kalırsa davranışı (varsayılana dön / gizle / zorunlu) tanımlıdır. Ön yüz okuyucusu aynı kayıt defterini kullanır.
- Yeni stil, bileşen veya animasyon ekleme. Ön yüzde karşılığı olmayan alan ekleme.
- Sayfaların blok düzeni ve blok içerikleri /canli-sayfa-editoru ile yönetilir. Bu workflow o kısma dokunmaz, yalnızca onun beslendiği veri modüllerini kurar.

AŞAMA 0: PLAN (kod yazma, onayımı bekle)
1. Mevcut veri modelini ve ön yüz render zincirini incele (docs/tasarim-teshis.md varsa kullan). Sabit kalan her metin/görsel/bağlantıyı
   tara, docs/icerik-alanlari.md ile karşılaştır, eksik kalan alanları listele (DA-02).
2. Önerilen modeller: SiteSettings, NavItem, FooterLink, Salon, Package,
   EventType, GalleryCategory, GalleryItem, Testimonial, Faq, StatItem, MediaAsset, ActivityLog. Mevcut tablolarla çakışmayı yaz.
3. Seed stratejisi: mevcut sabit metinlerden otomatik seed betiği, tekrar çalıştırılabilir (idempotent), yalnızca boş alanları doldurur.
4. Önbellek: etiketli revalidate, kayıttan sonra ön yüz <= 2 sn içinde güncellenir.
5. Implementation Plan sun, onayımı bekle.

AŞAMA 1: GELİŞTİRME (dilimler, her dilim sonunda test + görsel regresyon + kısa özet, sonra DUR)
D1 Alan kayıt defteri, seed betiği, ön yüz okuyucu (getContent, varsayılana düşme), revalidate altyapısı
D2 Site Ayarları (marka, telefon, e-posta, adres, saatler, WhatsApp, sosyal, harita, footer, KVKK) + Menü + Footer bağlantıları
D3 Salonlar, Paketler, Etkinlik Türleri (listeler). Etkinlik türü formdaki seçim listesi ve footer listesinin tek kaynağı olur.
D4 Galeri (kategori + fotoğraf, sayaçlar otomatik), Yorumlar, SSS, İstatistik kartları
D5 (bu workflow'da yok) Sayfa içerikleri /canli-sayfa-editoru workflow'unda yapılır. Bu dilimi atla.
D6 Randevu formu ayarları, SEO (sayfa başına), Medya kütüphanesi
D7 Yetki, ActivityLog, hata/boş durumlar, erişilebilirlik, mobil panel
D8 Doğrulama: DA-* ve TK-* senaryolarının tamamı, rapor docs/dinamik-admin-rapor.md

HER DİLİMDE
- İlgili senaryolar için test yaz (kodu test adına ekle). Tarayıcı subagent ile paneli kullanıp ön yüzde sonucu doğrula (kayıt, ekran görüntüsü).
- npm run test:visual sıfır farkla geçmeli. Fark varsa nedenini bul, düzelt. Baseline güncelleme önerme.
- Ön yüzde değiştirdiğin her dosyayı listele ve değişikliğin yalnızca veri kaynağı olduğunu göster.
