# İçerik alanları (admin panelinde düzenlenebilir olacak her şey)

Kural: Ön yüzde görünen HER metin, görsel, bağlantı ve liste öğesi aşağıdaki alanlardan birine bağlıdır. Burada olmayan görünür bir içerik bulursan listeye ekle ve bana bildir.
"Seed" sütunu referans videoda okunabilen metindir. Gerçek seed, sağlam sürümün kodundaki birebir metinden üretilir (videoda okunamayan yerler: [kodda]).
Sınırlar öneridir: tasarımı bozmayacak üst sınırı koddaki mevcut metin uzunluklarından belirle ve uyarı olarak göster.
"Boşsa": default = seed değerine dön, gizle = öğeyi gösterme, zorunlu = kaydetmeyi engelle.

Alan türleri: text, textarea, richtext (yalnızca kalın/italik/bağlantı), image (medya kütüphanesi + alt metin), link (etiket + adres + yeni sekme), number, icon (hazır ikon seçici), list (sıralanabilir tekrarlı öğe).

## A. Genel (Site Ayarları)

| Alan | Tür | Boşsa | Seed |
|---|---|---|---|
| brandPart1 / brandPart2 | text | zorunlu | "Elmira" / "Davet Salonu" (ikincisi altın) |
| phoneDisplay, phoneTel | text | zorunlu | "+90 555 123 45 67" |
| email | text | zorunlu | info@elmiradavet.com |
| address | textarea | zorunlu | "Merkez Mahallesi, Gaziosmanpaşa Caddesi No: 42, Gaziosmanpaşa / İstanbul" |
| visitHours | text | gizle | "Haftanın her günü 09:00 - 22:00" |
| headerCta | link | default | "TEKLİF AL" -> iletişim/rezervasyon |
| whatsappNumber, whatsappDefaultMessage | text | gizle | [kodda] |
| whatsappFloatLabel | text | default | "WhatsApp Bilgi Hattı" |
| whatsappContactButtonLabel | text | default | "WHATSAPP İLE HIZLI MESAJ" |
| instagramUrl, facebookUrl | text | gizle (ikon gizlenir) | [kodda] |
| mapEmbedUrl / koordinat, mapOpenLink | text | gizle | [kodda], "Haritalar'da aç" |
| footerTagline | textarea | default | [kodda] (kısa tanıtım) |
| copyrightText | text | default | "© 2026 Elmira Davet Salonu. Tüm hakları saklıdır." (yıl otomatik) |
| kvkkLinkLabel, kvkkText | text / richtext | zorunlu | "KVKK Aydınlatma Metni" |
| staffLoginLabel | text | gizle | "Personel Girişi" |

Menü (NavItem, list): etiket, rota, görünür. Seed: Ana Sayfa, Salonlarımız, Paketler & Menüler, Etkinlikler, Galeri, Hakkımızda, Yorumlar, SSS, İletişim. Rota ve sayfa sırası kilitli, etiket ve görünürlük düzenlenir.
Footer bağlantıları (list): Hızlı Bağlantılar (5 öğe: Hakkımızda & Salonumuz, Düğün & Etkinlik Paketleri, Fotoğraf Galerisi, Mutlu Çiftlerimizin Yorumları, Düğün Rehberi & Blog), etiket + adres + sıra.
Footer "Etkinlik Türleri" listesi etkinlik türü kayıtlarından (footerLabel) beslenir.

## B. Ana Sayfa (sayfa içerikleri, bölüm bazlı)

Her bölüm bir bloktur: editörde göster/gizle, sırala, çoğalt, sil yapılabilir (kısıtlar için docs/canli-sayfa-editoru-senaryolar.md BL-05). Bölümün görünümü sabittir, yalnızca aşağıdaki alanlar düzenlenir.

1. Hero: locationPill ("İSTANBUL · GAZİOSMANPAŞA • ELMİRA DAVET SALONU"), headline [kodda], subline ("Gaziosmanpaşa'da Lüks & Zarafet"),
   chips (list, 2 öğe: "Kristal Salon" + "600 Kişilik Kapasite"; "Kır Bahçesi" + "300 Kişilik Açık Hava"), primaryCta ("TEKLİF & RANDEVU AL"), secondaryCta ("SALONLARIMIZI İNCELEYİN"), scrollHint ("KEŞFET"), backgroundImage + overlay koyuluğu YOK (tasarım sabit).
2. İstatistikler (StatItem list, 4 öğe): value + suffix/prefix + label + subtext. Seed: "1.200+ / Mutlu Düğün & Davet / Gaziosmanpaşa'da unutulmaz tecrübe";
   "600 Kişi / Kristal Salon / Lüks kapalı davet ve balo salonu"; "300 Kişi / Kır Bahçesi / Yıldızlar altında doğal açık hava"; "%99 / Misafir Memnuniyeti / Doğrulanmış çift ve aile yorumları".
3. Salonlar bölümü: eyebrow ("İKİ FARKLI ATMOSFER, TEK BİR ZARAFET"), title ("Salonlarımız & Kapasiteler"), allLink ("TÜM SALON DETAYLARINI İNCELEYİN"). Kartlar Salon kayıtlarından.
4. Hakkımızda özeti: locationPill ("Gaziosmanpaşa Merkezde Prestijli Konum"), paragraph ("Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz. 600 kişilik lüks Kristal Salonumuz ve 300 kişilik büyüleyici Kır Bahçemiz ile ... [devamı kodda]"),
   miniFeatures (list, 4: ikon + başlık + metin; Kristal Avizeler, Ücretsiz Otopark & Vale, Akustik Mimari & Sahne, Gelin & Damat Süiti), moreLink ("HAKKIMIZDA DAHA FAZLA BİLGİ"),
   image + imageCaptionEyebrow ("İSTANBUL - GAZİOSMANPAŞA") + imageCaptionTitle ("Unutulmaz Düğünler, Kusursuz Masalar") + imageButton ("GALERİ").
5. Paketler bölümü: eyebrow ("AYRICALIKLI SEÇENEKLER"), title ("Düğün & Davet Paketlerimiz"), subtitle ("Yemekli ve yemeksiz menüler, canlı orkestra ve özel konsept süslemelerle bütçenize en uygun paketi seçin."), allLink ("TÜM PAKETLERİ VE MENÜ İÇERİKLERİNİ GÖR"). Kartlar Paket kayıtlarından.
6. Galeri özeti: eyebrow ("GÖRSEL ZARAFET"), title ("Salonlarımızdan Kareler"), allLink ("TÜM GALERİYİ AÇ (MASONRY)"), gösterilecek fotoğraflar (galeriden seçim, 3 adet).
7. Yorumlar özeti: eyebrow ("MUTLU ÇİFTLERİMİZ"), title ("Misafirlerimizin Yorumları"), subtitle ("Elmira Davet Salonu'nda ... Gaziosmanpaşa çiftlerinin gerçek deneyimleri"), gösterilecek yorumlar (seçim, 3 adet).
8. Rezervasyon bölümü: eyebrow ("REZERVASYON & BİLGİ"), title ("Tarihinizi Hemen Ayırın"), subtitle ("Gaziosmanpaşa merkez salonumuzda istediğiniz tarihi seçin; Kristal Salon veya Kır Bahçesi için size özel teklifimizle hemen dönüş yapalım.").

## C. Salonlarımız sayfası
Hero: locationPill ("İSTANBUL - GAZİOSMANPAŞA"), title ("Büyüleyici Salonlarımız"), subtitle (salon adları kalın: "Hayalinizdeki organizasyon için iki benzersiz atmosfer: İhtişamlı kapalı salonumuz **Kristal Salon** veya doğayla iç içe romantik **Kır Bahçesi**." Yalnızca kalın/italik destekli richtext).
Kartlar: Salon kayıtları. CTA paneli: eyebrow ("HANGİ SALON SİZİN İÇİN UYGUN?"), title ("Salonlarımızı Yerinde İncelemek İster Misiniz?"), text ("Gaziosmanpaşa merkezdeki mekanımızı ziyaret edebilir, her iki salonun masa düzenini, ışıklandırmasını ve akustiğini birebir deneyimleyebilirsiniz."), button ("SALONU GEZMEK İÇİN RANDEVU ALIN").

## D. Paketler & Menüler sayfası
title ("Davet & Düğün Paketleri"), subtitle ("Her zevke ve ihtiyaca uygun, her şey dahil paketlerimiz ile kusursuz bir organizasyon planlayın."), kartlar Paket kayıtlarından, allLink.
SSS bölümü: eyebrow ("MERAK EDİLENLER"), title ("Sıkça Sorulan Sorular"), gösterilecek sorular (SSS kayıtlarından, "paketler" grubu).

## E. Etkinlikler sayfası
eyebrow ("HİZMET YELPAZEMİZ"), title ("Her Özel Güne Kusursuz Dokunuş"), subtitle ("Evlilik merasimlerinden geleneksel kına gecelerine, sünnet törenlerinden kurumsal galalara kadar her organizasyon türü için uzman kadromuzla yanınızdayız."). Kartlar EtkinlikTürü kayıtlarından.
CTA paneli: title ("Özel Bir Konsept Mi Düşünüyorsunuz?", altın vurgu: "Mi Düşünüyorsunuz?" kısmı sabit tasarım), text ("Hayalinizdeki konsepti, renk paletini ve müzik akışını organizasyon sorumlumuzla birlikte tasarlayabilirsiniz."), button ("GÖRÜŞME RANDEVUSU OLUŞTURUN").

## F. Galeri sayfası
eyebrow ("GÖRSEL DENEYİM"), title ("Fotoğraf Galerisi"), subtitle ("Kristal Salon'un görkemli avizeleri, Kır Bahçesi'nin peri masalı ışıkları ve düzenlediğimiz yüzlerce unutulmaz davetten büyüleyici kareler."), "Tüm Fotoğraflar" etiketi.
Kategori sayıları, fotoğraf sayısından OTOMATİK hesaplanır. Lightbox alt şeridi sağ metni: lightboxBrand ("Elmira Davet Gaziosmanpaşa"), hover metni: hoverHint ("Büyütmek için dokunun").

## G. Hakkımızda sayfası
locationPill ("İstanbul - Gaziosmanpaşa"), title ("Zarafetin Gaziosmanpaşa'daki Adresi"), subtitle ("Elmira Davet Salonu olarak, hayatınızın en mutlu gününü zarafet, konfor ve profesyonellikle buluşturuyoruz."),
image + captionEyebrow ("MİMARİ & ATMOSFER") + caption ("Lüks şamdanlar, kristal avizeler ve modern çizgiler"), storyTitle ("Bölgenin En Seçkin Davet Salonu"), storyParagraphs (list, 2),
storyButton ("SALONU ZİYARET EDİN & RANDEVU ALIN"), featuresEyebrow ("KONFOR VE İHTİŞAM"), featuresTitle ("Ayrıcalıklarımız & Donanımımız"), features (list, 6: ikon + başlık + metin; Kristal Salon (600 Kişi), Kır Bahçesi (300 Kişi), Akustik Ses & Robotik Işık, Ücretsiz Otopark & Vale, Özel Gelin & Damat Süiti, Gurme Menüler & İkramlar).

## H. Yorumlar sayfası
eyebrow ("GERÇEK DENEYİMLER"), title ("Mutlu Çiftlerimizin Sözleri"), subtitle ("En mutlu günlerini bize emanet eden çiftlerimizin unutulmaz anılarına ve güzel yorumlarına göz atın."), yorumlar Yorum kayıtlarından.
CTA paneli: title ("Sizin Masalınız Burada Başlasın"), text ("Gelin, bu güzel yorumların arasına sizin mutluluk hikayenizi de birlikte ekleyelim."), button ("HEMEN RANDEVU ALIN").

## I. SSS sayfası
eyebrow ("AKLINIZA TAKILANLAR"), title ("Sıkça Sorulan Sorular"), subtitle ("Düğün ve etkinlik organizasyonu sürecinde çiftlerimizin ve ailelerin çok merak ettiği konuları derledik."), sorular SSS kayıtlarından ("genel" grubu).
CTA paneli: title ("Farklı Bir Sorunuz Mu Var?"), text ("Bizimle doğrudan iletişime geçebilir, Gaziosmanpaşa merkez salonumuzu dilediğiniz gün ziyaret edebilirsiniz."), button1 ("İLETİŞİME GEÇİN"), button2 ("HEMEN ARAYIN", telefon bağlantısı).

## J. İletişim sayfası
locationPill ("İstanbul - Gaziosmanpaşa"), title ("İletişim & Randevu"), subtitle ("600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi alanlarımızı yerinde görmek, kahvemizi içmek ve özel gününüzü planlamak için hemen randevu alın."),
bilgi kartı başlığı ("İletişim Bilgileri"), etiketler (ADRES, TELEFON, E-POSTA, ZİYARET SAATLERİ), değerler Site Ayarları'ndan.
Form: formTitle ("Online Randevu & Teklif Formu"), formSubtitle ("Hayalinizdeki etkinlik için tarih seçin ve ilk adımı atın."), alan etiketleri ve yer tutucuları (Adınız ve Soyadınız* "Örn: Ayşe Yılmaz", Telefon Numaranız* "05XX XXX XX XX", E-posta Adresiniz* "ornek@mail.com", Etkinlik Türü*, Etkinlik Tarihi*, Tahmini Davetli Sayısı "Örn: 350", Özel Notlarınız & İstekleriniz "Düşündüğünüz konsept, müzik veya menü detayları..."),
kvkkConsentText ("Kişisel verilerimin işlenmesine ilişkin KVKK Aydınlatma Metni'ni okudum, anladım ve açık rıza veriyorum. *", bağlantılı kısım ayrı), submitLabel ("TEKLİF VE RANDEVU TALEBİ GÖNDER"), successMessage, errorMessage [kodda].
Etkinlik Türü seçenekleri EtkinlikTürü kayıtlarından (formLabel): Düğün Organizasyonu, Nişan & Söz, Kına Gecesi, Sünnet Düğünü, Kurumsal Davet & Gala, Özel Kutlama & Parti. Form gönderimleri Talepler (CRM) modülüne düşer.

## K. Liste modülleri (CRUD)

Ortak: yayında/taslak, sıra (sürükle-bırak), oluşturma/güncelleme zamanı. Silme yerine arşivleme.

- Salon: slug, name, eyebrow, shortDescription, capacityBadge ("600 Kişilik Kapasite"), areaBadge ("850 m² Kapalı Alan"), image (+alt), features (list, tam 6 öğe önerilir: 2 sütun düzeni), detailLabel ("SALONU İNCELEYİN"), detailHref, bookLabel ("Randevu Al").
  Seed Kristal Salon: "Yüksek tavan mimarisi, dev kristal avizeleri, son teknoloji akustik ses ve robotik ışıklandırma sistemleriyle görkemli düğün ve balolarınız için tasarlandı." (eyebrow: "GÖRKEMLİ VE BÜYÜLEYİCİ KAPALI SALON"; özellikler: 600 Kişilik Lüks Oturma Düzeni, Akustik Ses ve Dijital Işık Şovu, İklimlendirme ve Havalandırma, Geniş ve Ferah Dans Pisti, Özel Gelin & Damat Hazırlık Süiti, Merkezi Gaziosmanpaşa Konumu).
  Seed Kır Bahçesi: "Yıldızların altında, yemyeşil doğa manzarası ve peri masalı ışıklandırmalarıyla samimi düğün, nişan ve kokteylleriniz için eşsiz bir kır bahçesi deneyimi." (eyebrow: "DOĞAYLA İÇ İÇE ROMANTİK AÇIK ALAN"; "300 Kişilik Kapasite", "500 m² Açık Hava" [videoda ana sayfada "Açık Alan", Salonlar sayfasında "Açık Hava" okunuyor, kodda doğrula]; özellikler: 300 Kişilik Açık Hava Düzeni, Doğal Çim Zemin ve Ahşap Dans Pisti, Hava Muhalefetine Karşı Koruma, Romantik Peri Masalı Işıkları, Açık Hava Bar ve Kokteyl Alanı, Özel Fotoğraf Çekim Köşeleri). Kristal Salon rozeti "850 m² Kapalı Alan".
- Paket: name, description, priceMode (tutar | "Özel fiyat teklifi"), priceAmount (sayı, ₺ ve binlik ayraç otomatik), priceText ("Özel Fiyat Teklifi Alınız"), isFeatured (yalnızca bir paket), featuredBadge ("ÖNE ÇIKAN PAKET"), detailsLabel ("PAKET DETAYLARI:"), features (list), ctaLabel ("TEKLİF AL & RANDEVU OLUŞTUR"; ana sayfada kısa hâli "TEKLİF AL & RANDEVU" ayrı alan).
  Seed: Gümüş Düğün Paketi ₺150.000 ("Şık ve zarif bir düğün arayanlar için ideal. Temel hizmetleri içeren ekonomik paketimiz."; 6 madde), Altın Düğün Paketi ₺250.000 (öne çıkan; "En çok tercih edilen paketimiz. Sıcak yemek servisi, canlı orkestra ve lüks şampanya süslemeleri."; 6 madde), Elmas VIP Düğün Paketi (Özel Fiyat; "Her şey dahil ultra lüks paketimiz. Gurme alakart lezzetler, Jimmy Jib & drone çekimleri, limitsiz hizmet."; 6 madde). Maddelerin tamamı kodda.
- EtkinlikTürü: title, description, capacityBadge ("600 Kişiye Kadar"), icon, image (+alt), ctaLabel ("TEKLİF AL & PLANLA"), formLabel (formdaki seçenek adı), footerLabel (footer'daki ad).
  Seed: Düğün Organizasyonu (600), Nişan & Söz Töreni (300), Kına Gecesi & Bekarlığa Veda (450), Sünnet Düğünü (500), Kurumsal Davet & Gala (600), Mezuniyet & Özel Partiler (350).
- GaleriKategori: name, slug, sıra. GaleriFotoğraf: image (+alt), title, category, sıra, ana sayfada göster. Seed kategoriler: Kristal Salon, Kır Bahçesi, Düğün & Gelin Yolu, Kına & Nişan. Seed fotoğraf başlıkları: "Kristal Salon - Dev Avizeler ve Dans Pisti", "Gelin Yolu ve Çiçekli Şamdanlar", "Kına Gecesi Tahtı ve Özel Işıklandırma" (+3 [kodda]; toplam 6).
- Yorum: authorName, roleBadge ("Kristal Salon Düğünü"), text, rating (1-5), verifiedLabel ("Doğrulanmış Misafir"), isPublished. Seed: Merve & Can Yıldız (Kristal Salon Düğünü), Selin & Emre Demir (Kır Bahçesi Nişanı), Burcu & Tolga Kaya (Düğün & Nikah Merasimi); metinler kodda.
- SSS: question, answer (richtext, yalnızca kalın/bağlantı), group (genel | paketler), sıra. Seed (paketler): Paket içeriğinde değişiklik veya ekleme yapabilir miyiz?; Ödeme koşulları ve taksit imkanı nasıl?; Düğün öncesi menü tadımı yapabiliyor muyuz?; Fotoğraf ve video çekimi paketlere dahil mi?
  Seed (genel): Elmira Davet Salonu nerede bulunuyor ve ulaşım nasıl?; Salonlarınızın kapasitesi nedir?; Yemekli ve yemeksiz düğün seçenekleriniz var mı?; Kına ve düğün için aynı salonu seçebilir miyiz? (cevap: "Evet, kına geceniz için Kır Bahçesi veya Kristal Salon'u, düğününüz için dilediğiniz salonu seçebileceğiniz avantajlı 'Kına + Düğün Kombin' paketlerimiz mevcuttur.") ve diğerleri [kodda].
- StatItem: yukarıdaki istatistikler.

## L. Sayfa başına SEO
Her sayfa: seoTitle (<=60), seoDescription (<=155), ogImage, noindex. Boşsa varsayılan: sayfa başlığı + marka.

## M. Medya kütüphanesi
Yükleme (tür/boyut sınırı), alt metin, odak noktası, kullanıldığı yerler, kullanılan görsel silinemez (uyarı), kullanılmayanları toplu temizleme.
