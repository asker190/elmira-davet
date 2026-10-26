# Dinamik Admin ve Tasarım Kilidi: Senaryolar

Biçim: KOD. Olduğunda -> Beklenen. Her senaryo için test yaz ve kodu test adına ekle.
Ön yüz ölçüleri: 1600x840, 1280x720, 390x844. Alanlar için bkz. docs/icerik-alanlari.md, tasarım için docs/tasarim-kilidi.md.

## TK: Tasarım kilidi (ön yüz)

TK-01 9 sayfa x 3 ekran, tam sayfa görüntü, animasyonlar bitmiş -> onaylı baseline ile fark yok (maxDiffPixelRatio <= 0.001). Harita iframe ve tarih alanı maskelenir.
TK-02 Sayfa en alta kadar kaydırılıp gezildiğinde -> görünmez (opacity<1, visibility hidden) kalan eleman yok, boş bant yok. JS geç yüklense veya animasyon takılsa içerik görünür kalır.
TK-03 Hero başlığı -> giriş animasyonu sonunda görünür. Her sayfada tek H1 vardır.
TK-04 Header: aktif sayfa bağlantısı altın ve altı çizgili, kaydırınca daralır, telefon ve "TEKLİF AL" çalışır. 390 px'te yatay kaydırma yok, menü çalışır.
TK-05 Galeri: filtre hapları sayıları doğru, filtre sonrası kartlar sola yaslı, kart hover'ı (rozet, başlık, ipucu), lightbox aç/kapat (Esc, kapat düğmesi, dışarı tıklama) ve kategori+başlık doğru.
TK-06 İletişim formu: odak halkası, seçim listesi, tarih alanı, zorunlu alan uyarıları, KVKK işaretlenmeden gönderilemez (sunucuda da).
TK-07 9 rota 200 döner, olmayan adres tasarımlı 404 verir. Footer ve yüzen WhatsApp butonu her sayfada vardır.
TK-08 Konsolda hata/uyarı yok. Tüm görsellerde boyut tanımı var (CLS < 0.05). Başlık fontu yüklenemezse düzen bozulmaz.
TK-09 Admin'den herhangi bir içerik değişince -> ön yüz DOM'unun etiket ve sınıf yapısı aynı kalır (yalnızca metin, src, href değişir). (DOM yapı anlık görüntü testi)
TK-10 Ön yüz paketinde admin/editör kodu bulunmaz. Herkese açık sayfa, kayıtlı blok verisini editörle AYNI site bileşenleriyle render eder.

## DA: Genel (dinamik admin)

DA-01 Seed parity: Veritabanı seed ile (mevcut metinlerle) doldurulduğunda -> TK-01 sıfır farkla geçer.
DA-02 Sabit içerik taraması: ön yüzdeki tüm görünür metin düğümleri, görsel ve bağlantılar bir alanla eşleşir. Eşleşmeyenler rapor edilir (istisna: yalnızca ARIA/ikon adları).
DA-03 Panel formları alan kayıt defterinden üretilir. Her alanın etiketi, türü, sınırı, varsayılanı ve "boşsa" davranışı vardır. Kayıt defterinde olan her alan panelde düzenlenebilir (otomatik test).
DA-04 Alan boşaltılırsa -> kuralına göre (default | gizle | zorunlu) davranır. Gizlenen öğenin boş çerçevesi/boşluğu ön yüzde kalmaz.
DA-05 Kaydet -> ön yüz en geç 2 sn içinde güncellenir (etiketli revalidate). Başka sayfalardaki aynı veri de güncellenir (örn. telefon: header, footer, SSS butonu).
DA-06 Karakter sınırı aşılırsa -> uyarı + kaydetme engeli (sınırlar tasarımı bozmayacak şekilde belirlenir). Çok uzun kelime/emoji/satır sonu düzeni bozmaz.
DA-07 "Varsayılana dön": alan ve bölüm bazında seed değerine döner, onay ister, ActivityLog'a yazılır.
DA-08 Türkçe karakter ve özel karakter (&, ', ", <, >) metinde bozulmadan kaydedilir ve gösterilir. HTML/script girilirse temizlenir (XSS).
DA-09 Eşzamanlı düzenleme: iki yönetici aynı kaydı düzenlerse -> sürüm uyuşmazlığı uyarısı, sessiz ezme yok.
DA-10 Yetki: ADMIN her şeyi düzenler. EDITOR sayfa/liste içeriklerini düzenler. Site Ayarları'nın marka, telefon, WhatsApp ve KVKK alanlarını ve kullanıcıları yalnızca ADMIN düzenler. Kontrol sunucudadır (yetkisiz API isteği 403 döner).
DA-11 Liste kayıtları (salon, paket vb.) için önizleme: kayıt kaydedilmeden gerçek ön yüzde nasıl görüneceği gösterilir (varsa). Önizleme herkese açık sayfayı değiştirmez, indekslenmez. Sayfa önizlemesi için bkz. canli-sayfa-editoru-senaryolar.md KY-03.
DA-12 Kaydedilmemiş değişiklikle sayfadan çıkışta uyarı. Kayıt hatasında form içeriği kaybolmaz.
DA-13 Panel mobilde (390 px) temel düzenlemeye (metin, liste sıralama, görsel değiştirme) izin verir.
DA-14 Tüm kayıt/silme/arşivleme/varsayılana dönme işlemleri ActivityLog'a yazılır (kim, ne, eski -> yeni).

## Modül senaryoları

SA-01 Site Ayarları: telefon değişince header, footer, SSS "HEMEN ARAYIN", iletişim kartı ve tel: bağlantıları birlikte güncellenir. Biçim doğrulanır.
SA-02 Marka metni iki parça (krem + altın) olarak düzenlenir, ön yüzde renkler korunur.
SA-03 Sosyal bağlantı boşsa ilgili ikon footer'da gizlenir. WhatsApp numarası boşsa yüzen buton ve iletişim butonu gizlenir.
SA-04 Harita adresi değişince iletişim sayfasındaki harita güncellenir, geçersiz adres reddedilir.
SA-05 Yıl otomatik: telif metninde yıl, sunucu yılına göre gelir.

MN-01 Menü etiketi değişince header (ve mobil menü) güncellenir. Rota ve sıra kilitli. Gizlenen öğe aktif-vurgusunu bozmaz.
MN-02 Footer bağlantıları eklenir, silinir, sıralanır. Dış bağlantı güvenli açılır (noopener).

SL-01 Salon kartı alanları (rozetler, eyebrow, metin, 6 madde, görsel) düzenlenir. Ana sayfa ve Salonlar sayfası aynı kayıttan beslenir.
SL-02 Madde sayısı 2 sütun düzenini bozmayacak şekilde sınırlıdır (çift sayı önerisi). Eksik görselde yer tutucu yerine kayıt kaydedilemez.
SL-03 Yeni salon eklenince kart düzeni korunur (2 sütun, 3. kart alta düşer). Taslak/arşivli salon görünmez.

PK-01 Paket alanları, fiyat modu (tutar | özel fiyat), fiyat biçimi (₺ + binlik nokta) doğru. "Öne çıkan" yalnızca tek pakette olabilir.
PK-02 Madde sayısı farklı olsa bile kartlar eşit yükseklikte, buton hep altta kalır (mevcut tasarım davranışı korunur).
PK-03 Ana sayfa ve Paketler sayfası aynı kayıttan beslenir. Ana sayfada kısa buton etiketi ayrı alandır.

ET-01 Etkinlik türü eklenince/silinince etkinlikler sayfası, iletişim formu seçim listesi (formLabel) ve footer listesi (footerLabel) birlikte güncellenir.
ET-02 Kapasite rozeti, ikon ve görsel düzenlenir. İkon yalnızca hazır listeden seçilir.
ET-03 Kullanılan (taleplerde geçen) etkinlik türü silinemez, arşivlenir. Eski talepler bozulmaz.

GL-01 Fotoğraf ekle/değiştir/sırala/arşivle, kategori ata. Kategori sayıları ön yüzde otomatik doğru ("Tüm Fotoğraflar (6)" vb.). Boş kategori hapı gösterilmez.
GL-02 Masonry düzeni, farklı görsel oranlarında bozulmaz (yükleme sırasında oran uyarısı).
GL-03 Ana sayfada gösterilecek 3 fotoğraf seçilir. Lightbox başlığı ve kategorisi fotoğraf kaydından gelir.

YR-01 Yorum ekle/düzenle/yayından kaldır, puan 1-5 yıldız doğru çizilir. Ana sayfa özetinde gösterilecek 3 yorum seçilir.
YR-02 Uzun yorum metni kart düzenini bozmaz (sınır + uyarı). Yorum yoksa bölüm gizlenir.
YR-03 (Gelecek) Google yorumları aynı kartlarla birlikte gösterilecek. Bu aşamada KAPSAM DIŞI, tasarım değişmez.

SS-01 Soru/cevap ekle/düzenle/sırala, grup seç (genel | paketler). SSS ve Paketler sayfaları doğru gruptan beslenir. Numaralandırma otomatik.
SS-02 Cevapta yalnızca kalın ve bağlantı kullanılabilir, diğer HTML temizlenir.

IS-01 İstatistik değerleri (1.200+, 600 Kişi, %99 vb.) düzenlenir, sayaç animasyonu (varsa) yeni değerle çalışır.

SY-01..SY-04 Sayfa içeriği ve blok senaryoları docs/canli-sayfa-editoru-senaryolar.md dosyasına taşındı (EP-, ED-, BL-, KY-, MG-). Bu belgede sayfa/blok senaryosu yoktur.

FR-01 Form etiketleri, yer tutucular, KVKK metni, başarı/hata mesajı düzenlenir. Zorunlu alan yıldızı ve doğrulama kuralları kayıt defterinden gelir ama doğrulama sunucuda yapılır.
FR-02 Gönderim -> Talepler (CRM) modülüne düşer, e-posta/WhatsApp bildirimi (varsa) gider, talep önce veritabanına yazılır.

SEO-01 Sayfa başına başlık/açıklama/OG görseli düzenlenir, boşsa varsayılan üretilir. noindex çalışır. sitemap.xml yalnızca yayındaki sayfaları içerir.

MD-01 Görsel yükleme (tür/boyut sınırı, optimize), alt metin, odak noktası. Kullanılan görsel silinmeye çalışılırsa nerede kullanıldığı gösterilir ve engellenir.
MD-02 Görsel değişince ilgili tüm kartlarda güncellenir. Kırık görsel durumunda ön yüzde boş kutu kalmaz, admin'de uyarı çıkar.
