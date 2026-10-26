# Tasarım Kilidi: Elmira Davet Salonu

Bu belge, 87 saniyelik referans ekran kaydından (docs/tasarim-referans/ klasöründeki 43 kare) çıkarılmıştır.
Amaç: ön yüzün BU görünümde kalması. Öncelik sırası: (1) sağlam sürümün kodu, (2) referans kareler, (3) bu belge.
Çelişki veya belirsizlik varsa tahmin etme, sor. "(gözlenmedi)" yazan yerleri icat etme, koddaki mevcut hâli koru.

## 1. Genel görünüm

- Koyu lüks tema: sayfa zemini neredeyse siyah antrasit, altın/şampanya vurgu, krem-beyaz başlıklar, gri gövde metni.
- Ölçülen yaklaşık renkler (video sıkıştırmalı, gerçek değeri koddan al): sayfa #121212, kart #1E1E1E, footer #181818,
  input zemini #272727, altın vurgu ≈ #C9A86A, altın buton gradyanı soldan sağa ≈ #D1B46F -> #9D7D40.
- Yazı tipi: başlıklarda serif (Playfair Display benzeri), gövde ve etiketlerde modern sans-serif (Inter benzeri).
- Başlık kalıbı: küçük, harf aralıklı, BÜYÜK HARF altın "eyebrow" -> büyük serif başlık -> kısa altın gradyan çizgi -> gri alt metin (ortalı, dar).
  Ana sayfadaki bazı bölümlerde sola yaslı varyant: eyebrow + başlık solda, sağda altın "... ->" bağlantısı.
- Köşeler: kartlar büyük yuvarlak (yaklaşık 16-24 px), butonlar ve rozetler tam yuvarlak (hap), input'lar orta yuvarlak.
- Kartlar: #1E1E1E zemin, ince açık kenarlık, yumuşak gölge. Öne çıkan kartta altın kenarlık ve hafif altın parıltı.
- Butonlar: (1) birincil: altın gradyan dolgu, koyu metin, BÜYÜK HARF küçük yazı, sol ikon, altın gölge/parıltı;
  (2) ikincil: koyu dolgu + ince kenarlık (bazılarında kahverengi-altın kenarlık "Randevu Al"); (3) yeşil WhatsApp butonu.
- İkonlar: ince çizgili (outline), altın renkli; ikon kutuları: yuvarlak köşeli koyu kare + altın çerçeve.
- Videoda görünen soldaki "N" rozeti Next.js geliştirme göstergesidir, tasarımın parçası değildir.
- Kayıt büyük olasılıkla tarayıcı %80 yakınlaştırmasında alındı. İçerik genişliği 1152 px (Tailwind max-w-6xl) civarı tahmin edilir. Gerçek değeri koddan al.

## 2. Sayfalar (rotalar tahminidir, gerçekleri koddan al)

/ (Ana Sayfa), /salonlarimiz, /paketler, /etkinlikler, /galeri, /hakkimizda, /yorumlar, /sss, /iletisim.
Videoda durum çubuğunda /paketler ve /iletisim rotaları görüldü. Her sayfanın altında aynı Footer vardır.

## 3. Tüm sayfalarda ortak

### Header (sabit, üstte)
- Sol: logo metni "Elmira" (krem) + "Davet Salonu" (altın), serif.
- Orta: Ana Sayfa, Salonlarımız, Paketler & Menüler, Etkinlikler, Galeri, Hakkımızda, Yorumlar, SSS, İletişim.
  Aktif sayfa altın renkli ve altı çizgili.
- Sağ: telefon ikonu + "+90 555 123 45 67"; altın "TEKLİF AL" hap butonu (takvim ikonlu).
- Sayfa en üstteyken biraz yüksek, kaydırınca hafif daralır (yazılar yukarı çıkar). Zemin yarı saydam koyu, alt kenarda ince çizgi.
- Mobil menü davranışı: (gözlenmedi), koddaki mevcut hâli koru.

### Footer
- Üstte ince çizgi, zemin #181818. 4 sütun: (1) logo + kısa tanıtım metni + Instagram ve Facebook ikon düğmeleri;
  (2) HIZLI BAĞLANTILAR: Hakkımızda & Salonumuz, Düğün & Etkinlik Paketleri, Fotoğraf Galerisi, Mutlu Çiftlerimizin Yorumları, Düğün Rehberi & Blog;
  (3) ETKİNLİK TÜRLERİ: Düğün & Nikah Töreni, Nişan & Söz Merasimi, Kına Gecesi & Bekarlığa Veda, Sünnet Düğünü, Kurumsal Davet & Gala Yemekleri, Mezuniyet & Özel Kutlamalar (soluk gri);
  (4) İLETİŞİM & KONUM: adres, telefon, e-posta (altın küçük ikonlarla).
- En altta ince çizgi; solda "© 2026 Elmira Davet Salonu. Tüm hakları saklıdır."; sağda "KVKK Aydınlatma Metni" ve "Personel Girişi".

### Yüzen WhatsApp butonu
- Sağ altta sabit, yeşil hap: yeşil nokta + WhatsApp simgesi + "WhatsApp Bilgi Hattı". Tüm sayfalarda görünür.

### Ortak bileşenler (aynı görünüm her yerde)
- Bölüm başlığı (eyebrow + serif başlık + altın çizgi + alt metin), CTA paneli (ortalı, koyu, yuvarlak, kenarlıklı kart; başlığın bir kısmı altın gradyan),
  Randevu formu, Salon kartı, Paket kartı, Etkinlik kartı, Yorum kartı, SSS kartı, Özellik kartı, Galeri (masonry + filtre + lightbox), İstatistik kartı.

## 4. Sayfa sayfa varsayılan bölüm sırası (seed). Editörde bloklar sıralanabilir, her bölümün kendi görünümü kilitlidir

### Ana Sayfa (/)
1. Hero: tam genişlik, koyu overlay'li fotoğraf (gelin buketi). Üstte konum hapı "İSTANBUL · GAZİOSMANPAŞA • ELMİRA DAVET SALONU"; ana başlık (giriş animasyonuyla gelir, ilk karede görünmüyor, metni koddan al);
   "Gaziosmanpaşa'da Lüks & Zarafet"; iki bilgi hapı (Kristal Salon – 600 Kişilik Kapasite, Kır Bahçesi – 300 Kişilik Açık Hava);
   "TEKLİF & RANDEVU AL" (altın) ve "SALONLARIMIZI İNCELEYİN ->" (çerçeveli); altta "KEŞFET" ve ince dikey çizgi.
2. İstatistik şeridi: 4 eşit kart (altın serif büyük sayı, başlık, alt metin).
3. "Salonlarımız & Kapasiteler": sola yaslı başlık + sağda "TÜM SALON DETAYLARINI İNCELEYİN ->"; 2 salon kartı.
4. Hakkımızda özeti: konum hapı, altın çizgi, paragraf, 4 mini özellik kartı (2x2), "HAKKIMIZDA DAHA FAZLA BİLGİ ->"; sağda görsel kart (alt bilgi çubuğu: "İSTANBUL · GAZİOSMANPAŞA / Unutulmaz Düğünler, Kusursuz Masalar" + "GALERİ" butonu).
5. "Düğün & Davet Paketlerimiz" (ortalı başlık) + 3 paket kartı + "TÜM PAKETLERİ VE MENÜ İÇERİKLERİNİ GÖR ->".
6. "Salonlarımızdan Kareler": sola yaslı başlık + "TÜM GALERİYİ AÇ (MASONRY) ->"; 3 fotoğraf kartı.
7. "Misafirlerimizin Yorumları": 3 yorum kartı.
8. "Tarihinizi Hemen Ayırın": ortalı dar form kartı.
9. Footer.

### Salonlarımız
Konum hapı, "Büyüleyici Salonlarımız" + çizgi + alt metin (salon adları kalın); 2 büyük salon kartı (eyebrow'lu); CTA paneli ("HANGİ SALON SİZİN İÇİN UYGUN?" / "Salonlarımızı Yerinde İncelemek İster Misiniz?" / "SALONU GEZMEK İÇİN RANDEVU ALIN").

### Paketler & Menüler
"Davet & Düğün Paketleri" + alt metin; 3 paket kartı; "Sıkça Sorulan Sorular" bölümü ("MERAK EDİLENLER", 4 soru, "?" ikonlu kartlar); Footer.

### Etkinlikler
"HİZMET YELPAZEMİZ" / "Her Özel Güne Kusursuz Dokunuş" / alt metin; 3x2 etkinlik kartı; CTA paneli ("Özel Bir Konsept Mi Düşünüyorsunuz?" + "GÖRÜŞME RANDEVUSU OLUŞTURUN").

### Galeri
"GÖRSEL DENEYİM" / "Fotoğraf Galerisi" / alt metin; filtre hapları (aktif: altın dolgu; sayılar parantez içinde); 3 sütun masonry; üzerine gelince kategori rozeti + başlık + "Büyütmek için dokunun"; tıklayınca lightbox.

### Hakkımızda
Konum hapı, "Zarafetin Gaziosmanpaşa'daki Adresi" + alt metin; iki sütun: sol görsel kart ("MİMARİ & ATMOSFER" alt kartı), sağ "Bölgenin En Seçkin Davet Salonu" + altın çizgi + 2 paragraf + "SALONU ZİYARET EDİN & RANDEVU ALIN";
"KONFOR VE İHTİŞAM" / "Ayrıcalıklarımız & Donanımımız" + 6 özellik kartı (3x2).

### Yorumlar
"GERÇEK DENEYİMLER" / "Mutlu Çiftlerimizin Sözleri" / alt metin; 3 yorum kartı; CTA paneli ("Sizin Masalınız Burada Başlasın" + "HEMEN RANDEVU ALIN").

### SSS
"AKLINIZA TAKILANLAR" / "Sıkça Sorulan Sorular" / alt metin; numaralı (1, 2, 3...) soru-cevap kartları, dar tek sütun; CTA paneli ("Farklı Bir Sorunuz Mu Var?" + "İLETİŞİME GEÇİN" + "HEMEN ARAYIN").

### İletişim
Konum hapı, "İletişim & Randevu" + alt metin; iki sütun: sol "İletişim Bilgileri" kartı (adres, telefon, e-posta, ziyaret saatleri, yeşil "WHATSAPP İLE HIZLI MESAJ", altında Google harita + "Haritalar'da aç" bağlantısı), sağ "Online Randevu & Teklif Formu" kartı.

## 5. Bileşen ayrıntıları

- Salon kartı: üstte görsel (alta doğru karta karışan degrade). Sol üst: kişi ikonlu kapasite hapı (altın kenarlıklı). Sağ üst: koyu hap (m² bilgisi).
  Altta: (Salonlar sayfasında) altın eyebrow, serif başlık, gri açıklama, ince ayraç, 2 sütun onay listesi (altın tik), solda "SALONU İNCELEYİN ->", sağda "Randevu Al" hap düğmesi.
- Paket kartı (3 adet, eşit yükseklik, buton hep altta): serif paket adı, küçük gri açıklama, altın serif fiyat (₺150.000 / ₺250.000), "PAKET DETAYLARI:" ve onay listesi, altta tam genişlik buton.
  Ortadaki (Altın) kart: altın kenarlık + parıltı, üst kenarda "★ ÖNE ÇIKAN PAKET" rozeti, altın dolgulu buton. Üçüncü kartta fiyat yerine büyük serif "Özel Fiyat Teklifi Alınız" ("Teklifi Alınız" altın).
  Diğer butonlar koyu dolgulu: "TEKLİF AL & RANDEVU OLUŞTUR ->".
- Etkinlik kartı: üstte fotoğraf (alta degrade), sol üstte "600 Kişiye Kadar" hapı, ikon kutusu, serif başlık, gri metin, tam genişlik koyu "TEKLİF AL & PLANLA ->" butonu.
- Yorum kartı: 5 altın yıldız, sağ üstte rol hapı (örn. "Kristal Salon Düğünü"), italik alıntı, ince ayraç, serif isim, küçük gri "Doğrulanmış Misafir", sağ altta soluk konuşma-balonu ikonu.
- SSS kartı: Sayfada numaralı altın kutucuk (1, 2, 3...) + serif soru + gri cevap. Paketler sayfasında numara yerine "?" daire ikonu. Cevaplar açık görünüyor (açılır-kapanır davranışı gözlenmedi).
- Özellik kartı: ikon kutusu + serif başlık + gri kısa metin.
- İstatistik kartı: ortalı, altın serif büyük değer, krem başlık, soluk alt metin.
- Galeri: hap filtreler (aktif altın dolgulu), masonry 3 sütun, farklı yükseklikler, yuvarlak köşe + gölge. Filtre sonrası kartlar sola yaslı kalır (ortalanmaz).
  Hover: alttan koyu degrade, sol üstte kategori rozeti, başlık (serif), "Büyütmek için dokunun" (büyüteç ikonlu).
  Lightbox: arka plan koyulaşır, ortada yuvarlak köşeli büyük görsel, sağ üstte yuvarlak kapat düğmesi, alt şerit: sol altın kategori + serif başlık, sağ "Elmira Davet Gaziosmanpaşa" (parıltı ikonlu).
- Randevu formu: kart içinde başlık "Online Randevu & Teklif Formu" + alt satır; 2 sütunlu alanlar (Adınız ve Soyadınız*, Telefon Numaranız*, E-posta Adresiniz*, Etkinlik Türü* (seçim), Etkinlik Tarihi* (tarih), Tahmini Davetli Sayısı), tam genişlik "Özel Notlarınız & İstekleriniz",
  KVKK onay kutusu (altın bağlantılı, zorunlu), tam genişlik altın "TEKLİF VE RANDEVU TALEBİ GÖNDER" butonu (parıltı ikonlu). Alanlarda sol ikon, odaklanınca altın halka. Etiketler BÜYÜK HARF küçük.

## 6. Hareket davranışları (gözlenenler)

- Sayfa/bölüm içerikleri girişte yumuşakça belirir (aşağıdan yukarı hafif kayarak fade-in). Referans karelerde bu yüzden bazı bantlar geçici boş görünür; animasyon bittiğinde içerik görünür olmalıdır.
- Hero: başlık giriş animasyonuyla gelir (metin birkaç saniye sonra tamamlanır).
- Header kaydırınca daralır, aktif menü bağlantısı altın ve altı çizgili.
- Galeri filtresi: kartlar yumuşak geçişle yeniden dizilir. Lightbox açılışı fade.
- Düğmelerde altın gölge/parıltı; form alanlarında odak halkası.
- İstatistik sayaç animasyonu, hover yükselmeleri, sayfa geçiş animasyonu: (gözlenmedi), koddaki mevcut hâli koru.

## 7. Dokunulmaz / izin verilen

- DOKUNULMAZ: bu belgede ve karelerde görünen her şeyin stili, düzeni, sırası, animasyonu, bileşen yapısı (HTML etiket/sınıf yapısı dâhil).
- İZİN VERİLEN: İÇERİĞİN (metin, görsel, bağlantı, liste, kayıt seçimi) veritabanından gelmesi ve editörde blokların ekle/sırala/çoğalt/gizle/sil işlemleri. Üretilen HTML yapısı ve her bölümün görünümü değişmez.

## 8. Test (Görsel Regresyon ve Kitleme)
- **Komutlar:**
  - `npm run test:visual`: Görsel regresyon ve reveal güvenliği testlerini çalıştırır.
  - `npm run test:visual:update`: Onaylı baseline ekran görüntülerini günceller (yalnızca kullanıcı onayıyla).
- **Test Paketi:** `tests/visual/site-regression.spec.ts` (Playwright)
- **Baseline Konumu:** `tests/visual/snapshots/`
- **Ekran Boyutları:**
  - Masaüstü: `1600x840` (`desktop-1600`)
  - Dizüstü: `1280x720` (`laptop-1280`)
  - Mobil: `390x844` (`mobile-390`)
- **Eşik Değeri:** `maxDiffPixelRatio <= 0.001` (birebir piksel uyumu)
- **Maskelenen Alanlar:** Harita iframe'i, video öğeleri ve dinamik tarih/saat damgaları.
- **Reveal Güvenliği:** Sayfa sonuna kadar gezildikten sonra görünmez (`opacity < 1` veya `visibility: hidden`) kalan ana içerik elemanı olamaz; her sayfada tek ve görünür H1 başlığı bulunur. Mobil ekranda yatay taşma (scrollWidth > clientWidth) engellenir.

## 9. Editörde aynı tasarım
- Admin sayfa editörünün tuvali, bu belgedeki tasarımın AYNISIDIR: herkese açık sitenin gerçek bileşenleri ve stilleri kullanılır (tek kaynak), benzeri yazılmaz.
- Yalnızca editör çerçevesi (sol blok listesi, sağ alan paneli, üst çubuk) admin stilindedir. Tuvalin içi site stilindedir ve admin stilinden yalıtılmıştır.
- Tuvalde animasyonlar kapalıdır (düzenlemeyi bozmasın), "Önizle" modunda siteyle aynı animasyonlar çalışır.
- Tasarım değişikliği yalnızca /tasarim-degistir akışıyla yapılır. Tek kaynak bileşenlerde değişir, editör ve site birlikte güncellenir, blok şeması ve kayıtlı içerik bozulmaz.
