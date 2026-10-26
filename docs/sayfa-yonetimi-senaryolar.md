<USER_REQUEST>
---
description: Admin panelinde WordPress mantığında Sayfalar modülünü ve blok tabanlı sayfa editörünü planlar, geliştirir ve doğrular.
---
Spesifikasyon: docs/sayfa-yonetimi-senaryolar.md (önce TAMAMINI oku). Marka ve tasarım: docs/brif.md.
Spesifikasyonda olmayan özellik ekleme, olanı atlama. Belirsizlikte varsayma, sor.

AŞAMA 1: PLAN (kod yazma, onayımı bekle)
1. Mevcut kodu incele: Prisma şeması, admin yapısı, ön yüzdeki bölüm render mantığı, medya yükleme.
2. Eski PageSection yapısı varsa yeni Page + blok yapısına veri kaybı olmadan nasıl taşınacağını yaz.
3. Editör yaklaşımı için iki seçeneği karşılaştır: (a) Puck gibi hazır görsel editör, (b) özel editör
   (dnd-kit + Tiptap + Zod blok kayıt defteri). Bakım yükü, Türkçe/erişilebilirlik, motion ayarlarına uyum,
   mobil dokunmatik sürükleme açısından artı/eksileri yaz ve birini öner.
4. Implementation Plan çıkar: veri modeli, blok kayıt defteri yapısı, API uçları, klasör yapısı, dilimler.
5. Planı sun ve onayımı bekle.

AŞAMA 2: GELİŞTİRME (onaydan sonra, dilim dilim)
Dilim 1: veri modeli, Zod blok şeması, revizyon ve kilit altyapısı
Dilim 2: Tüm Sayfalar listesi (PG-L) ve Yeni Ekle (PG-N)
Dilim 3: editör iskeleti: tuval, blok ekleyici, sürükle-bırak, yan panel, geri al/ileri al, otomatik kayıt (PG-E)
Dilim 4: bloklar (PG-B), her biri kayıt defterine eklenerek
Dilim 5: hareket ayarları (PG-H)
Dilim 6: önizleme, yayınlama, zamanlama, revizyon (PG-P, PG-R)
Dilim 7: kilit ve eşzamanlılık, SEO, slug ve yönlendirme, yetki, çöp (PG-K, PG-S, PG-Y, PG-T)
Dilim 8: ön yüz render, önbellek, sitemap, hata ve sınır durumları (PG-O, PG-X)
Her dilimin sonunda ilgili senaryolar için test yaz, çalıştır, sonucu özetle ve bir sonraki dilime
geçmeden önce bana göster.

AŞAMA 3: DOĞRULAMA
- Her senaryo için test yaz ve senaryo kodunu test adına ekle (örn. "PG-P-06 zamanlanmış yayın").
  UI senaryoları: tests/e2e/sayfalar/ altında Playwright. Eşzamanlılık, zamanlama, yetki: API/entegrasyon testi.
- UI senaryolarında tarayıcı subagent'ı ile uygulamayı aç, senaryoyu uygula, ekran görüntüsü/kayıt ekle.
- Rapor: docs/sayfa-yonetimi-rapor.md. Senaryo no, sonuç (GEÇER/HATA/EKSİK/DOĞRULANAMADI), kanıt, açık sorunlar.

# Sayfa Yönetimi: Senaryolar (WordPress mantığı)

## 0. İlkeler
- Salon sahibi kod bilmeden sayfa oluşturur, düzenler, yayınlar. Mantık WordPress'tekiyle aynı:
  Tüm Sayfalar listesi, Yeni Ekle, blok editörü, yan panel, taslak/yayın/zamanlama, revizyon, çöp.
- Sayfa içeriği bir blok ağacıdır (JSON). Her blok türü TEK bir kayıt defterinde tanımlıdır:
  Zod şeması, varsayılan değerler, editör bileşeni, ön yüz bileşeni, ikon, kategori.
  Editör ve ön yüz aynı kayıt defterini kullanır, böylece "editörde gördüğüm = sitede çıkan" olur.
- Ön yüzdeki bütün sayfalar (Ana sayfa, Hakkımızda, İletişim, SSS...) bu sistemle yönetilir. Sabit sayfa kalmaz.
- Dinamik bloklar (Salonlar, Paketler, Yorumlar, SSS, Galeri) veriyi kendi modüllerinden çeker.
  İçeriği sayfaya kopyalamaz.
- Hareket (animasyon) ayarı her blokta vardır. Salon sahibi kod yazmadan animasyon seçer.
- Zaman: UTC saklanır, Europe/Istanbul gösterilir. Arayüz Türkçe, kod ve değişken adları İngilizce.

## 1. Veri modeli (plan aşamasında onaylatılacak öneri)
- Page: id, title, slug, status (DRAFT, PENDING_REVIEW, SCHEDULED, PUBLISHED, TRASH), parentId, template,
  menuOrder, isSystem, systemKey, content (blok ağacı JSON), schemaVersion, version (sayı, eşzamanlılık için),
  featuredImageId, seo (JSON), authorId, publishedAt, scheduledAt, trashedAt, createdAt, updatedAt
- PageRevision: pageId, title, content, authorId, type (AUTOSAVE, MANUAL, PUBLISH, RESTORE), createdAt
- PageLock: pageId, userId, expiresAt (heartbeat ile uzar)
- Redirect: fromPath, toPath, statusCode, pageId
- SavedBlock (Kayıtlı bölüm): name, content, createdBy
- PreviewToken: pageId, tokenHash, expiresAt, revokedAt
- Blok yapısı: { id (uuid), type, schemaVersion, attrs, children?, motion, visibility, anchorId? }

## 2. Blok kataloğu (hepsi kayıt defterinde)
| Blok | Ayarlar | Not |
| Hero | video/görsel, poster, başlık, alt başlık, 2 buton, katman koyuluğu | poster zorunlu, parallax |
| Başlık | metin, seviye (H1-H4) | sayfada tek H1 uyarısı |
| Metin | zengin metin | yapıştırınca temizlenir |
| Görsel | medya, alt metin, oran, yakınlaşma efekti | alt metin uyarısı |
| Galeri | kategori seçimi, masonry/grid, lightbox | dinamik, boşsa gizlenir |
| Salon kartları | tümü/seçilenler, sayı, grid/kaydırmalı | dinamik, taslak salon görünmez |
| Paketler/Menüler | tümü/seçilenler, düzen | dinamik |
| Sayaçlar | etiket + sayı listesi | görününce sayar |
| Yorumlar | tümü/seçilenler, slider/grid | dinamik |
| SSS | tümü/seçilenler | dinamik, FAQPage schema üretir |
| Rezervasyon formu | başlık, alan seçimi, teşekkür mesajı | KVKK onayı zorunlu |
| Harita | adres (Site Ayarları'ndan) | |
| Sütunlar | 2-4 sütun, mobilde alt alta | en fazla 2 seviye iç içe |
| Buton/CTA bandı | metin, bağlantı (iç sayfa, dış, tel:, wa.me, çapa) | |
| Video | YouTube/Vimeo/yükleme | otomatik oynatma yalnızca sessiz arka planda |
| Boşluk/Ayırıcı | yükseklik (hazır ölçek) | |
| Kayıtlı bölüm | bir SavedBlock'a bağlı | bağlı veya ayrık kopya |
| Özel HTML | sanitize edilmiş HTML | YALNIZCA ADMIN |

Ortak ayarlar (her blokta):
- Düzen: hizalama, içerik genişliği (dar/normal/tam), iç/dış boşluk (hazır ölçek), arka plan (renk/görsel/gradyan)
- Hareket: giriş animasyonu, süre, gecikme, tetikleyici, bir kez/her seferinde, kademeli (stagger), parallax şiddeti
- Görünürlük: masaüstü/tablet/mobilde gizle, çapa kimliği (#bolum-adi)

## 3. Senaryolar
Biçim: KOD. Olduğunda → Beklenen.

### PG-L: Tüm Sayfalar listesi
L-01 Sayfalar > Tüm Sayfalar açılır → tabloda başlık, yazar, durum, üst sayfa, son değişiklik (TR saati).
     Varsayılan sıra son değişikliğe göre, sayfalama 20.
L-02 Durum sekmeleri sayılarla (Tümü n | Yayında n | Taslak n | Zamanlanmış n | İncelemede n | Çöp n) →
     tıklayınca filtreler, her işlemden sonra sayılar güncellenir. Çöp "Tümü"ne dahil değildir.
L-03 Arama başlık ve slug'da çalışır, Türkçe karakter duyarsız ("dugun" yazınca "Düğün Paketleri" bulunur).
L-04 Satıra gelince: Düzenle | Hızlı Düzenle | Kopyala | Çöpe At | Görüntüle (yayındaysa) / Önizle (değilse).
     Mobilde işlemler her zaman görünür.
L-05 Hızlı Düzenle: başlık, slug, durum, üst sayfa, yayın tarihi satır içinde düzenlenir, sayfa yenilenmeden kaydolur.
     Geçersiz veya çakışan slug'da satır içi hata gösterir.
L-06 Toplu işlem: seçilenleri Yayınla / Taslağa al / Kopyala / Çöpe at. Sistem sayfaları işlem dışı kalır,
     hangi kayıtların atlandığı bildirilir.
L-07 Hiyerarşi: alt sayfalar üst sayfanın altında girintili listelenir. Üst sayfa çöpe atılırken sor:
     "Alt sayfalar bir üst seviyeye çıksın mı, birlikte çöpe mi gitsin?"
L-08 Kopyala: "Başlık (Kopya)", slug benzersiz (-2), durum Taslak, blok içeriği aynı ama blok id'leri yenilenir,
     SEO alanları kopyalanır, revizyon geçmişi ve kilit kopyalanmaz.
L-09 Boş durum: hiç sayfa yokken "Henüz sayfa yok" mesajı ve Yeni Ekle butonu çıkar. Filtre sonucu boşsa "Sonuç yok".
L-10 Sistem sayfaları (Ana sayfa, Rezervasyon/İletişim) rozetle işaretlenir. Çöpe atılamaz, slug'ı değişmez, taslağa alınamaz.
L-11 Başka kullanıcının düzenlediği sayfada kilit ikonu ve "Ayşe düzenliyor" yazısı görünür.
L-12 Sütun başlığıyla sıralama (başlık, tarih, durum) ve sayfa sırası (menuOrder) sürükle-bırakla değişir.

### PG-N: Yeni sayfa
N-01 Başlık yazılınca slug otomatik üretilir ("Düğün Paketleri" → "dugun-paketleri"), elle değiştirilebilir.
     Benzersizlik anında kontrol edilir. Ayrılmış slug'lar (admin, api, giris, _next, sitemap...) reddedilir.
N-02 Şablon seçimi: Boş sayfa, Ana sayfa düzeni, Salon detay düzeni, İçerik sayfası, İletişim/Rezervasyon.
     Şablon hazır blok dizisi ekler, sonra serbestçe değişir.
N-03 Başlıksız sayfa taslak olarak kaydolabilir ("Başlıksız") ama yayınlanamaz.
N-04 İlk kayıttan sonra durum Taslak. Kaydetmeden çıkışta "Kaydedilmemiş değişiklikler var" uyarısı çıkar.
N-05 Slug çöpteki bir sayfada duruyorsa çakışma sayılır. Kullanıcıya "çöpteki sayfayı geri yükle veya slug'ı değiştir" önerilir.

### PG-E: Editör
E-01 Yerleşim: üst çubuk (geri al, ileri al, blok ekle +, liste görünümü, cihaz önizleme, Önizle, Taslağı kaydet,
     Yayınla/Güncelle), solda liste görünümü (açılır), ortada tuval, sağda Sayfa | Blok sekmeli yan panel.
E-02 Blok ekleme: + ile ekleyici açılır, kategori ve arama (Türkçe karakter duyarsız) var. Seçili bloğun altına eklenir.
     Boş satırda "/" hızlı ekleme açar.
E-03 Sürükle-bırak: fare ve dokunmatikle sıralama, bırakma konumu çizgiyle gösterilir. Klavyeyle (odak + Alt+↑/↓)
     taşıma da çalışır. İç içe bloklarda (sütunlar) çalışır.
E-04 Blok araç çubuğu: yukarı/aşağı taşı, çoğalt, sil, "Kayıtlı bölüm olarak kaydet". Silme sonrası "Geri al" toast'ı çıkar.
E-05 Geri al / ileri al en az 50 adım (Ctrl/Cmd+Z, Shift+Z). Yayınlamadan sonra da çalışır.
E-06 Otomatik kayıt: değişiklikten 10 sn sonra AUTOSAVE revizyonu yazılır. Yayındaki sayfada otomatik kayıt YAYINI
     DEĞİŞTİRMEZ, "Yayındakinden farklı değişiklikler var" rozeti çıkar.
E-07 Ağ kopunca "Bağlantı yok, değişiklikler bekliyor" gösterilir, bağlantı gelince otomatik tekrar denenir.
     Kayıt başarısız olursa içerik kaybolmaz (yerel yedek). Sekme kapatılırken tarayıcı uyarısı çıkar.
E-08 Kısayollar: Ctrl/Cmd+S kaydet, / blok ekle, Esc seçimi kaldırır. "?" kısayol listesini açar.
E-09 Zengin metin: kalın, italik, bağlantı, liste, başlık seviyeleri. Word/web'den yapıştırılan içerik temizlenir
     (stil, script, gereksiz etiketler atılır).
E-10 Bağlantı ekleme: iç sayfa arama (başlıkla), dış URL, tel:, wa.me. Dış bağlantılar rel="noopener" ile yeni sekmede açılabilir.
     Taslak/çöp sayfaya bağlantı verilirse uyarı gösterilir. javascript: ve data: URL reddedilir.
E-11 Medya seçici: kütüphaneden seç veya sürükleyerek yükle, alt metin uyarısı, odak noktası seçimi, boyut/tür sınırı.
     Silinmiş görsel blokta yer tutucu ve uyarı gösterir.
E-12 Sayfa yan paneli: başlık, slug, durum, yayın tarihi, üst sayfa, sıra, şablon, öne çıkan görsel, SEO, yazar.
E-13 Cihaz önizleme (masaüstü/tablet/mobil): tuval genişliği değişir, "mobilde gizle" ayarlı bloklar kaybolur.
E-14 Liste görünümü blokları ağaç olarak gösterir. Tıklayınca tuvalde odaklanır, sürüklenerek sıralanır.
E-15 Editör tamamen klavyeyle kullanılabilir, odak göstergesi vardır, ARIA etiketleri Türkçedir.

### PG-B: Bloklar
B-01 Şemaya uymayan blok verisi yüklenince editör çökmez. "Hatalı blok" kutusu çıkar, onar veya sil seçeneği sunar.
B-02 Kayıt defterinde karşılığı olmayan (kaldırılmış) blok türü editörde yer tutucu olur, ön yüzde gizlenir.
B-03 Hero: video yüklenemezse poster görünür. Poster yoksa yayınlama uyarısı verir. Mobilde video yerine poster yüklenir.
B-04 Dinamik bloklar (Salonlar, Paketler, Yorumlar, SSS, Galeri): panelde ilgili kayıt değişince ilgili sayfalar yenilenir.
     Taslak veya arşivlenmiş kayıt ön yüzde görünmez. Seçili kayıtlar silinirse blok hata vermez, kalan kayıtları gösterir.
B-05 Dinamik blokta gösterilecek kayıt yoksa ön yüzde blok tamamen gizlenir, editörde "Gösterilecek kayıt yok" notu çıkar.
B-06 Rezervasyon formu: KVKK onayı işaretlenmeden gönderilemez (sunucuda da kontrol edilir). Aynı sayfada iki form olursa
     id ve etiketler çakışmaz. Gönderim Talepler (CRM) modülüne düşer.
B-07 Sütunlar: mobilde alt alta dizilir, 2 seviyeden fazla iç içe konamaz, içindeki bloğu dışarı sürükleme çalışır.
B-08 Kayıtlı bölüm: bağlı kullanımda tek yerde değiştirince her yerde güncellenir. "Ayır" ile bağımsız kopyaya dönüşür.
     Silinirken kullanıldığı sayfalar listelenir ve onay istenir.
B-09 Özel HTML: yalnızca ADMIN ekleyebilir/düzenleyebilir, EDITOR bloğu salt okunur görür.
     İçerik sanitize edilir, script ve olay özellikleri (onclick vb.) temizlenir.
B-10 Buton/CTA: iç sayfa seçilirse sayfa slug'ı değişince bağlantı bozulmaz (sayfa id ile bağlanır).
B-11 Video: otomatik oynatma yalnızca sessiz arka plan modunda. prefers-reduced-motion açıkken duran poster gösterilir.
B-12 Başlık blokları: tek H1 uyarısı verilir, seviye atlanırsa (H2 → H4) uyarı çıkar.

### PG-H: Hareket (motion)
H-01 Blok yan panelinde Hareket sekmesi: animasyon (yok, belirme, yukarı kayma, soldan, sağdan, yakınlaşma,
     maske ile açılma, satır satır/harf harf metin), süre (0.2-2 sn), gecikme, bir kez/her seferinde, stagger.
H-02 Editörde animasyonlar varsayılan KAPALI (düzenlemeyi bozmasın). Blok seçiliyken "Oynat" butonu animasyonu gösterir.
     Önizleme modunda gerçek hâliyle çalışır.
H-03 Parallax ve kaydırmaya bağlı yakınlaşma yalnızca Hero ve Görsel bloğunda seçilebilir. Şiddet kaydırıcısı vardır,
     mobilde otomatik hafifletilir.
H-04 Değer sınırları sunucuda da zorlanır (süre 10 sn girilirse kırpılır). Bir sayfada 6'dan fazla parallax varsa performans uyarısı verilir.
H-05 prefers-reduced-motion açıkken ön yüzde tüm hareket ayarları yok sayılır, içerik anında görünür.
H-06 Hareketi elle ayarlanmamış bloklar Site Ayarları'ndaki genel varsayılanı kullanır. Varsayılan değişince onlar da güncellenir.
H-07 JavaScript kapalıyken veya geç yüklenirken içerik görünür kalır (başlangıçta opacity:0 yüzünden boş sayfa olmaz).

### PG-P: Önizleme, yayınlama, zamanlama
P-01 Taslak kaydet: sayfa yalnızca panelde görünür. Ön yüzde 404 verir.
P-02 Önizle: yeni sekmede gerçek ön yüz tasarımıyla açılır, kaydedilmemiş (otomatik kaydedilmiş) son hâli gösterir.
     Giriş yapmış yöneticiye açıktır. "Paylaşılabilir önizleme linki" 48 saat geçerlidir, iptal edilebilir, noindex'tir.
P-03 Yayınla: doğrulama yapılır (başlık, slug, zorunlu blok alanları, alt metin uyarıları). Sonra yayınlanır,
     ön yüz önbelleği anında yenilenir, sitemap güncellenir, "Sayfayı gör" bağlantısı verilir.
P-04 Yayındaki sayfa düzenlenirken ön yüz eski sürümü gösterir. "Güncelle"ye basınca yeni sürüm yayına çıkar.
P-05 Taslağa al: ön yüz 404 verir, sitemap'ten çıkar. Menüde veya başka sayfalarda bağlantısı olanlar için kırık bağlantı uyarısı çıkar.
     Sistem sayfası taslağa alınamaz.
P-06 Zamanlama: gelecek tarih+saat seçilir (TR saatiyle gösterilir, UTC saklanır) → durum Zamanlanmış.
     Zamanı gelince otomatik yayınlanır (en fazla 1 dk sapma). Görev iki kez veya iki sunucuda çalışsa tek yayın olur
     (idempotent). Geçmiş tarih seçilirse "şimdi yayınla" önerilir.
P-07 Zamanlanmış sayfa düzenlenebilir, zamanlama iptal edilip taslağa dönebilir.
P-08 Gece 23:30 TR saatiyle zamanlanan sayfa ertesi güne kaymaz.
P-09 EDITOR yayınlayamaz (Y-01): "İncelemeye gönder" kullanır, durum "İncelemede" olur, ADMIN'e bildirim gider.
     ADMIN yayınlar veya not ekleyerek taslağa geri çevirir.

### PG-R: Revizyon
R-01 Her manuel kayıt ve her yayın revizyon üretir. Otomatik kayıt tek bir AUTOSAVE kaydının üzerine yazar.
R-02 Revizyon paneli: tarih, yazar, tür. Seçilen iki sürüm arasındaki fark gösterilir (eklenen/silinen/değişen bloklar, metin farkı).
R-03 Geri yükle: seçilen sürüm editöre TASLAK olarak yüklenir, yayını doğrudan değiştirmez. Geri yükleme yeni bir RESTORE revizyonu olur.
R-04 Saklama: sayfa başına son 50 revizyon. YAYIN revizyonları silinmez, fazla AUTOSAVE/MANUAL kayıtlar temizlenir.
R-05 Revizyon silinmiş medya/salon/kayıtlı bölüm referansı içerse bile geri yükleme hata vermez, yer tutucu çıkar.

### PG-K: Kilit ve eşzamanlılık
K-01 Sayfayı açan kullanıcı kilit alır (heartbeat 15 sn, süre dolumu 60 sn). İkinci kullanıcı açınca
     "Ayşe düzenliyor": Salt okunur aç | Düzenlemeyi devral.
K-02 Sekme kapanınca/çökünce kilit süresi dolunca otomatik düşer.
K-03 Kilide rağmen kayıtta sürüm kontrolü yapılır. Sürüm uyuşmazsa "Bu sayfa başkası tarafından değiştirildi" çıkar:
     farkı gör | benimkini yaz | onunkini al. Sessiz ezme olmaz.
K-04 Aynı kullanıcı sayfayı iki sekmede açarsa ikinci sekme uyarılır.
K-05 Düzenlemeyi devralınan kullanıcının kaydedilmemiş değişikliği kaybolmaz, ayrı bir taslak revizyon olarak saklanır.

### PG-S: SEO, slug, yönlendirme
S-01 SEO paneli: SEO başlığı (60 karakter sayacı), meta açıklama (155), OG görseli, canonical, noindex/nofollow,
     arama sonucu önizlemesi. Boşsa sayfa başlığı ve ilk metinden öneri üretilir.
S-02 Yayınlanmış sayfanın slug'ı değişirse eski adres yeni adrese 301 ile yönlenir. Zincir/döngü (A→B→A) oluşmaz.
     Eski slug başka sayfaya verilirse eski yönlendirme geçersiz sayılır.
S-03 Alt sayfa yolu /ust/alt biçimindedir. Üst slug değişince alt sayfaların yolları ve yönlendirmeleri güncellenir.
S-04 "Ana sayfa" ataması yalnızca Site Ayarları'ndan yapılır. Sayfa editöründen yapılamaz.
S-05 sitemap.xml yalnızca yayında ve noindex olmayan sayfaları içerir. Zamanlanmış sayfa yayınlanınca eklenir.
S-06 Yapılandırılmış veri: LocalBusiness/EventVenue sitenin ilgili sayfalarında, SSS bloğu FAQPage olarak üretilir.
S-07 Aynı SEO başlığı veya meta açıklaması başka sayfada varsa uyarı gösterilir.

### PG-Y: Yetki
Y-01 ADMIN her şeyi yapar. EDITOR sayfa oluşturur, düzenler, taslağa alır, zamanlama taslağı hazırlar, incelemeye gönderir.
     (Site Ayarları'nda "EDITOR yayınlayabilsin" seçeneği vardır, varsayılan kapalı.)
Y-02 EDITOR: sistem sayfalarının slug/durumunu değiştiremez, Özel HTML bloğu ekleyemez, kalıcı silemez, ayarlara giremez.
Y-03 Yetki kontrolü SUNUCUDA yapılır. Yetkisiz API isteği 403 döner, arayüzde butonu gizlemek yeterli sayılmaz.
Y-04 Oluşturma, yayınlama, geri alma, çöpe atma, geri yükleme, slug değişikliği, rol değişikliği ActivityLog'a yazılır.
Y-05 Yazarı silinen kullanıcının sayfaları kaybolmaz, yazar "Silinmiş kullanıcı" görünür. ADMIN yazarı değiştirebilir.

### PG-T: Çöp
T-01 Çöpe at: sayfa Çöp sekmesine gider, ön yüzde 404 verir, "Geri al" toast'ı çıkar. Menü/bağlantı kullanımı varsa uyarı çıkar.
T-02 Geri yükle: sayfa TASLAK olarak döner. Slug çakışıyorsa yeni slug önerilir.
T-03 Kalıcı sil yalnızca ADMIN'dedir, onay penceresi ister. Revizyonlar ve bağlı yönlendirmeler silinir, medya silinmez.
T-04 Çöpteki sayfalar 30 gün sonra otomatik silinir (zamanlanmış görev, çift çalışmaya dayanıklı).
T-05 Sistem sayfaları çöpe atılamaz.
T-06 Çöpe atılan sayfaya bağlantı veren başka sayfalar için "kırık bağlantı" raporu gösterilir.

### PG-O: Ön yüz
O-01 Yayındaki sayfa /slug adresinde blokları sırayla render eder. İçerik ilk HTML'de bulunur (sunucu tarafı render).
O-02 Editör ve ön yüz aynı kayıt defterini kullanır. Aynı sayfayı yan yana karşılaştıran görsel test yazılır.
O-03 Dinamik blokların verisi değişince ilgili sayfalar yenilenir (etiketli revalidate).
O-04 Yok/taslak/çöp/zamanlanmış sayfa → tasarımlı 404. Yayında ama noindex ise erişilir ama indexlenmez.
O-05 Animasyon kodu yalnızca kullanılan bloklar için yüklenir (dynamic import). Lighthouse performans/erişilebilirlik 90+.
O-06 Menüler modülünde yalnızca yayındaki sayfalar seçilebilir. Sayfa taslağa alınırsa menüden ön yüzde kalkar.
O-07 Yayınlanan sayfada tek H1 vardır, başlık seviyeleri atlamaz, görsellerde alt metin bulunur.

### PG-X: Hata ve sınır durumları
X-01 Çok büyük sayfada (yüzlerce blok) editör takılmaz. Kayıt boyutu sınırı (örn. 1 MB) aşılırsa anlaşılır hata verir.
X-02 Kayıtta sunucu hatası olursa içerik editörde kalır, "Tekrar dene" çıkar, veri kaybı olmaz.
X-03 Blok şeması sürümü değişirse eski içerik schemaVersion ile otomatik yükseltilir. Yükseltilemeyen blok B-01 gibi davranır.
X-04 XSS: metin, HTML, bağlantı, SEO alanlarına script girilirse sunucuda temizlenir, ön yüzde çalışmaz.
X-05 Çok uzun başlık/slug (200+ karakter), yalnız boşluktan oluşan başlık, emoji ve RTL karakterler düzgün işlenir veya reddedilir.
X-06 Aynı sayfada eşzamanlı iki yayın isteği tek PUBLISH revizyonu üretir.
X-07 Silinmiş salon/medya/kayıtlı bölüm referansı olan blok hata vermez, yer tutucu gösterir.
X-08 Telefon/tablette panelde temel düzenleme (metin, sıralama, yayınlama) çalışır. Ağır işlemlerde masaüstü önerilir.

## 4. Kapsam dışı (yapma)
Çok dilli sayfalar, şifre korumalı sayfalar, yorum sistemi, tema/eklenti mağazası, serbest CSS editörü.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-21T13:41:56+03:00.

The user's current state is as follows:
Active Document: /Users/alikose/Desktop/Elmira Davet/elmira-davet/src/lib/meta/crypto.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 18
Other open documents:
- /Users/alikose/Desktop/Elmira Davet/elmira-davet/src/lib/meta/crypto.ts (LANGUAGE_TYPESCRIPT)
- /Users/alikose/Desktop/Elmira Davet/elmira-davet/AGENTS.md (LANGUAGE_MARKDOWN)
- /Users/alikose/Desktop/Elmira Davet/elmira-davet/src/lib/utils.ts (LANGUAGE_TYPESCRIPT)
No browser pages are currently open.
</ADDITIONAL_METADATA>