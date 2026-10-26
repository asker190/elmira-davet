# Canlı Sayfa Editörü: Senaryolar (tasarım kilitli, blok tabanlı)

Bu belge docs/canli-editor-senaryolar.md ve docs/sayfa-yonetimi-senaryolar.md belgelerinin editörle ilgili kısımlarının yerine geçer ve ÖNCELİKLİDİR.
Sayfa listesi, yeni ekle, slug/yönlendirme, revizyon, kilit, çöp, yetki ve SEO maddeleri docs/sayfa-yonetimi-senaryolar.md'de geçerli kalır (KY-01).
Eski belgelerdeki şu maddeler GEÇERSİZDİR: Stil sekmesi, Hareket sekmesi, cihaza özel override, serbest renk/boşluk/font, Sütunlar bloğu, iç içe blok, Özel HTML bloğu, "yeni blok türü" serbestliği.

Biçim: KOD. Olduğunda -> Beklenen. Her senaryo için test yaz ve kodu test adına ekle.
Ekranlar: 1600x840, 1280x720, 390x844. Tasarım için docs/tasarim-kilidi.md, alanlar için docs/icerik-alanlari.md.

## 0. İlkeler

- P1 TEK KAYNAK: Editör tuvali ve herkese açık site AYNI bileşenleri ve AYNI stilleri kullanır. Editör için kopya veya benzer bileşen yazılmaz.
- P2 Blok = mevcut tasarım bölümünün veri sarmalayıcısı. Blok verisi YALNIZCA içerik tutar (metin, görsel, bağlantı, liste, kayıt seçimi, tasarımda var olan seçenek).
  Stil, sınıf, renk, font, boşluk, animasyon verisi tutmaz.
- P3 Editörde yapılabilenler: içerik düzenle, katalogdan blok ekle, sırala, çoğalt, gizle, sil (kısıtlar dahilinde). Tasarım ayarı yoktur.
- P4 Blok kataloğu yalnızca tasarımda var olan bölümlerden oluşur. Yeni blok türü = tasarım değişikliği = /tasarim-degistir.
- P5 Düzenleme kapalıyken herkese açık HTML, editör entegrasyonundan önceki HTML ile yapısal olarak aynıdır.
- P6 Blok şeması sürümlüdür. Bileşen/tasarım güncellenince kayıtlı sayfalar bozulmaz. Şema değişirse sürüm artar ve migrasyon yazılır.
- P7 Mevcut kayıtlı sayfa verisi korunur (MG-01).

Blok kataloğu (ADAY liste, teşhis aşamasında koddan kesinleştirilir): Hero, Sayfa başlığı, İstatistik şeridi, Salonlar (ana sayfa düzeni / tam sayfa düzeni),
Hakkımızda özeti, Hakkımızda hikâyesi (görsel + metin), Özellik kartları ızgarası, Paketler, Etkinlik kartları ızgarası, Galeri özeti, Galeri (filtre + masonry + lightbox),
Yorumlar (özet / tam), SSS listesi (numaralı / "?" ikonlu), CTA paneli, Rezervasyon bölümü, İletişim bölümü (bilgi kartı + form + harita).
Blok DEĞİL (global): Header, Footer, yüzen WhatsApp butonu (Site Ayarları'ndan yönetilir).
"Düzen" seçenekleri yalnızca tasarımda gerçekten var olan varyantlar için sunulur (örn. ana sayfa düzeni / tam sayfa düzeni).

## EP: Eşleşme ve tasarım güvenliği

EP-01 Her sayfa için editör tuvali (seçim çerçeveleri ve animasyon kapalı) ile herkese açık sayfa -> 3 ekran boyutunda görüntü farkı yok (maxDiffPixelRatio <= 0.001).
EP-02 Tek kaynak statik denetimi: blok kaydındaki tüm render bileşenleri site bileşen klasöründen gelir, editör klasöründe sitedeki bir bileşenin kopyası veya benzeri yoktur. Kopya bulunursa test kırılır.
EP-03 Düzenleme modu kapalıyken Editable/blok sarmalayıcıları DOM'a etiket, sınıf veya attribute eklemez -> HTML yapı anlık görüntüsü, editör entegrasyonundan önceki sürümle eşit (yalnızca veri metinleri farklı olabilir).
EP-04 Yalıtım: admin CSS tuvale, tuval CSS'i panele sızmaz. Admin teması değişse tuval değişmez. Tuvalde site yazı tipleri yüklü.
EP-05 Tasarım güncelleme testi: bir site bileşeninin stili (test için) değiştirilir -> editör tuvali ve ön yüz BİRLİKTE değişir. Kayıtlı hiçbir sayfa/blok bozulmaz, veri migrasyonu gerekmez. Sonra geri alınır.
EP-06 Şema güvenliği: blok şemaları sürümlüdür. Şema anlık görüntü testi: şema değiştiyse sürüm artmış ve migrasyon yazılmış olmalı, değilse test kırılır. Eski sürüm veri açılışta otomatik yükseltilir.
EP-07 Blok bağımsızlığı: her bloğun kendi ekran görüntüsü, sayfadaki sırasından bağımsız aynıdır (en az iki farklı sıralamada karşılaştırılır). Sıra değişince boşluklar çift olmaz, üst üste binme olmaz.
EP-08 Sıraya bağlı stil yoktur: nth-child, index veya "zebra zemin" gibi sıraya bağlı görünüm blok türüne bağlanmıştır. Teşhiste taranır, bulunursa düzeltilir ve görünüm aynı kalır.
EP-09 Tuvalde animasyonlar kapalıdır, "Önizle" modunda siteyle birebir aynı animasyonlar çalışır. Animasyon ayarı blokta saklanmaz.
EP-10 Kayıtlı sayfa verisinde tasarım alanı (stil, sınıf, renk, boşluk, font) bulunmaz. Veri taraması: bulunanlar migrasyonla temizlenir, görünüm değişmez (EP-01 sıfır fark).

## ED: Düzenleme

ED-01 Tuvalde bir alana tıklayınca panelde o alan odaklanır. Metin alanları tuvalde doğrudan yazılır. Panel ile tuval çift yönlüdür, değişiklik <= 100 ms'de ikisine yansır.
ED-02 Alan türleri: metin, uzun metin, zengin metin, görsel, bağlantı, ikon (hazır liste), sayı, seçim (hazır seçenekler), liste. Şemadaki her alanın panelde karşılığı vardır (otomatik test).
ED-03 Başlıklarda altın vurgu: seçilen kısım tasarımdaki mevcut vurgu stiliyle gösterilir (örn. "Mi Düşünüyorsunuz?", "Teklifi Alınız"). Tek vurgu türü vardır, başka renk/biçim yoktur. Yapıştırılan biçim temizlenir.
ED-04 Zengin metin yalnızca tasarımın desteklediği biçimleri sunar (kalın, italik, bağlantı). Desteklenmeyen alanda düz metin.
ED-05 Alan sınırı ve sayaç: sınır aşılınca uyarı ve kaydetme engeli. Çok uzun kelime, satır sonu, emoji ve Türkçe karakter düzeni bozmaz.
ED-06 Boş alan: tasarımdaki kurala göre (varsayılana dön | öğeyi gizle | zorunlu). Tuvalde yer tutucu görünür, ön yüzde boş çerçeve veya boş başlık kalmaz.
ED-07 Görsel alanı: tuvalde tıklayınca medya seçici, alt metin, odak noktası, oran uyarısı. Silinmiş/yüklenemeyen görselde yer tutucu ve uyarı.
ED-08 Bağlantı alanı: iç sayfa (sayfa kimliğiyle), dış adres, tel:, wa.me, çapa. javascript: ve data: reddedilir. Sayfa slug'ı değişince iç bağlantı bozulmaz.
ED-09 Liste alanları (maddeler, mini kartlar, rakamlar): ekle, sil, sırala, çoğalt. Alt/üst sınır şemadan gelir, sınırda düğme pasif ve nedeni yazar. Tasarım kuralı varsa (örn. iki sütunlu liste için çift sayı) uyarı verir.
ED-10 Dinamik bloklar (salon, paket, etkinlik, galeri, yorum, SSS): tuvalde gerçek veriyle görünür. Blok ayarı: hangi kayıtlar (hepsi/seçilenler), kaç adet, grup/kategori.
      Karta tıklayınca "Kaynağı düzenle" çekmecesi açılır, kayıt sayfadan ayrılmadan düzenlenir, kaydedince tuval yenilenir. Yetkisi yoksa salt okunur. Veri yoksa tuvalde yer tutucu, ön yüzde blok gizli.
ED-11 Etkileşimli bloklar (galeri filtresi/lightbox, SSS açılır alanı, form): tuvalde tıklama düzenleme içindir, etkileşim "Önizle" modunda çalışır. Tuvalde form GÖNDERİLMEZ.
ED-12 Geri al / ileri al en az 50 adım (Ctrl/Cmd+Z). Odak metindeyse metni, değilse blok işlemini geri alır.
ED-13 Cihaz önizleme (masaüstü/tablet/mobil) tuval genişliğini değiştirir ve gerçek medya sorgularını çalıştırır. Cihaza özel içerik veya stil farkı YOKTUR.
ED-14 Erişilebilirlik: editör klavyeyle kullanılabilir, odak göstergesi ve Türkçe ARIA etiketleri vardır.
ED-15 Güvenlik: tuval-panel mesajlaşması yalnızca aynı kökenden ve şema doğrulamalı mesajı kabul eder. Girilen HTML/script sunucuda temizlenir (XSS).

## BL: Blok işlemleri

BL-01 "+" ile yalnızca katalogdaki bloklar eklenir. Katalogda olmayan blok eklenemez.
BL-02 Eklenen blok, tasarımla birebir görünen örnek içerikle (seed) gelir. Bloğun görünümü eklendiği yere göre değişmez.
BL-03 Sürükle-bırak sıralama (tuval, liste görünümü, klavye Alt+↑/↓, dokunmatik), bırakma çizgisi, otomatik kaydırma.
BL-04 Çoğalt (kimlik yenilenir), gizle/göster (gizli blok ön yüzde hiç render edilmez, tuvalde soluk), sil ("Geri al" bildirimi).
BL-05 Kısıtlar blok kaydında tanımlıdır: Hero yalnızca ana sayfada, en üstte, en fazla 1. Sayfa başlığı iç sayfalarda en üstte, en fazla 1.
      Galeri (tam), Rezervasyon bölümü, İletişim bölümü sayfa başına en fazla 1 (form kimlikleri çakışmaz). İhlal sürüklerken engellenir ve Türkçe nedeni gösterilir.
      Kısıtlar teşhiste koddaki mevcut sayfa yapısından çıkarılır.
BL-06 Sütun, iç içe blok, serbest HTML ve serbest stil seçeneği YOKTUR.
BL-07 Silinemez blok: ana sayfada Hero. Silme denemesinde neden gösterilir ve engellenir.
BL-08 Bloklar arası dikey boşluk tasarımdaki gibidir ve sıra değişince aynı kalır (EP-07).

## KY: Kaydet, yayın, önizleme

KY-01 Mevcut Sayfalar modülünün özellikleri korunur ve editörle entegre çalışır: liste, yeni ekle, slug ve yönlendirme, SEO, revizyon, kilit, çöp, yetki (docs/sayfa-yonetimi-senaryolar.md).
KY-02 Otomatik kayıt TASLAĞA yazar, yayındaki sayfayı değiştirmez ("Yayındakinden farklı değişiklikler var" rozeti). Yalnızca Yayınla/Güncelle yayını değiştirir, ön yüz en geç 2 sn içinde güncellenir.
KY-03 Önizle: gerçek ön yüz tasarımıyla, kaydedilmemiş son taslağı gösterir, yalnızca giriş yapmış yöneticiye açık, noindex.
KY-04 Revizyon: her yayın bir revizyondur. Geri yükleme taslak olarak gelir. Eski şema sürümlü revizyon açılışta yükseltilir (EP-06).
KY-05 Kilit ve sürüm kontrolü: iki yönetici aynı sayfayı düzenlerse uyarı, sessiz ezme yok.
KY-06 Kayıt hatasında tuvaldeki içerik kaybolmaz (yerel yedek), "Tekrar dene" çıkar. Kaydedilmemiş değişiklikle çıkışta uyarı.
KY-07 Herkese açık sayfa yalnızca yayınlanmış sürümü render eder. Taslak, zamanlanmış ve çöpteki sayfa 404 verir.
KY-08 Yayın doğrulaması: zorunlu alanlar, alt metin uyarısı, tek H1, kırık bağlantı uyarısı.

## MG: Mevcut veriyi koruyarak geçiş

MG-01 Mevcut kayıtlı sayfalar ve blok verisi KORUNUR. Geçiş: stil/tasarım alanları ayıklanır, bozuk veri onarılır, geri dönüş için yedek alınır. Geçiş sonrası EP-01 sıfır fark.
MG-02 Geçiş betiği tekrar çalıştırılabilir (idempotent), önce kuru çalıştırma (dry-run) raporu verir, çalıştırmadan önce veritabanı yedeği önerir. Hatalı sayfa listelenir, sessizce atlanmaz.
