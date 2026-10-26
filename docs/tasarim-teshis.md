# Tasarım Teşhis Raporu: Elmira Davet Salonu

**Tarih:** 21 Ekim 2026  
**İş Akışı:** /tasarim-geri-al (Aşama 0: Teşhis)  
**Referans Kaynak:** `docs/tasarim-referans/referans.mp4` (87 saniyelik ekran kaydı, 1280x672) ve çıkarılan 44 adet kare (`frame-01.png` .. `frame-44.png`).  
**Tasarım Kilidi Belgesi:** `docs/tasarim-kilidi.md`

---

## 1. Sürüm ve Git Durumu
- **Git Durumu:** Çalışma alanında (`/Users/alikose/Desktop/Elmira Davet` ve `elmira-davet`) başlatılmış bir `.git` deposu ve commit geçmişi bulunmamaktadır.
- **Sağlam Sürüm Adayı:** Projenin `src/app/(site)/*` klasöründeki 9 sayfa doğrudan Next.js sayfaları olarak çalışmakta ve tasarım kilidi (`docs/tasarim-kilidi.md`) ile `docs/tasarim-referans/` karelerindeki orijinal lüks tasarımı birebir barındırmaktadır.
- **Yedek:** Veritabanı ve veri dosyaları `elmira-davet/backups/elmira_backup_2026-10-21_13-03-05.json` ve `store_backup_20261021_160309.json` olarak yedeklenmiştir.

---

## 2. Ön Yüz Render Zinciri Haritası

| Sayfa | Rota | Ana Bileşenler | Veri Kaynağı | Durum |
|---|---|---|---|---|
| **Ana Sayfa** | `/` | `HeroMask`, `Counter`, `Reveal`, `HallCard`, `ReservationForm`, `Footer` | `DEFAULT_SECTIONS` + `mockData` / `prisma` | Orijinal Tasarım Aktif |
| **Salonlarımız** | `/salonlar` | `HallCard`, Başlık Banner, CTA Paneli | `mockHalls` / `prisma.hall` | Orijinal Tasarım Aktif |
| **Paketler & Menüler** | `/paketler` | Paket Kartları (Gümüş/Altın/Elmas), SSS Bölümü | `mockPackages` / `prisma.package` | Orijinal Tasarım Aktif |
| **Etkinlikler** | `/etkinlikler` | Etkinlik Kartları Izgarası, İkonlar | `mockEvents` / `prisma.eventType` | Orijinal Tasarım Aktif |
| **Galeri** | `/galeri` | `MasonryGallery`, Kategori Filtre Hapları, Lightbox | `mockGalleryImages` / `prisma.galleryImage` | Orijinal Tasarım Aktif |
| **Hakkımızda** | `/hakkimizda` | Özellik Kartları, Hikaye Paragrafları, Konum Rozeti | `getPageContent("hakkimizda")` | Orijinal Tasarım Aktif |
| **Yorumlar** | `/referanslar` | Yorum Kartları Izgarası, Yıldız Puanlaması | `mockTestimonials` / `prisma.testimonial` | Orijinal Tasarım Aktif |
| **Sıkça Sorulan Sorular** | `/sss` | Numaralı SSS Akordeon/Kartları, Yardım Kutusu | `mockFaqs` / `prisma.faq` | Orijinal Tasarım Aktif |
| **İletişim & Rezervasyon** | `/iletisim` | `ReservationForm`, İletişim Bilgi Kartları, Harita | `getSiteSettings()`, `prisma.blockedDate` | Orijinal Tasarım Aktif |
| **CMS Dinamik Sayfalar** | `/[...slug]` | `PublicPageRenderer` | `Page.content` (Blok JSON) | **SAPMA:** Kopya blok bileşenleri render ediyor |

---

## 3. Sapmalar ve Kök Neden Analizi

### Kök Neden (a): Kopya Blok Bileşenleri ve Stil Sızıntısı (KRİTİK)
- **Tespit:** `src/components/site/public-page-renderer.tsx` ve `src/components/admin/editor/block-renderers.tsx` dosyaları, sitenin özgün bileşenlerini (`components/site/*`) sarmalamak yerine, her bir blok için sıfırdan bağımsız HTML/JSX şablonları üretmektedir.
- **Geçersiz Stil Alanları:** Blok şemalarında `layout` (padding, background, contentWidth) ve `motion` (animation, duration, delay) serbest stil alanları bulunmaktadır. Bu durum `05-tasarim-kilidi.md` ve `canli-sayfa-editoru-senaryolar.md` ilkelerine aykırıdır.
- **Etki:** Canlı editörden veya CMS'ten render edilen sayfalar, sitenin orijinal tasarımından sapmakta ve "tasarımı güncelle" dendiğinde düzenin bozulmasına yol açmaktadır.

### Kök Neden (b) & (c): Rota Eşleşmesi ve Veri
- **Tespit:** Referans belgesinde belirtilen rotalar ile koddaki rotalar:
  - Referans: `/yorumlar` -> Koddaki rota: `/referanslar` (Navbar'da "Yorumlar" bağlantısı `/referanslar` rotasına gitmektedir).
  - Referans: `/salonlarimiz` -> Koddaki rota: `/salonlar`.
- **Karar:** Koddaki rotalar (`/referanslar` ve `/salonlar`) tutarlıdır ve çalışmaktadır; `next.config.ts` veya yönlendirmelerle alternatif rotalar da desteklenebilir.

### Kök Neden (d) & (e): Animasyonlar ve Reveal Güvenliği
- **Tespit:** `HeroMask`, `Reveal`, `Counter` bileşenlerinde `framer-motion` kullanılmaktadır. Sayfa sonuna kadar kaydırıldığında tüm elemanların görünür hale gelmesi (opacity 1) şartnamesi doğrulanmalıdır.

---

## 4. Teşhis Özeti Tablosu

| Sayfa / Bileşen | Referanstaki Tasarım | Mevcut Kod Durumu | Kök Neden Sınıfı | Düzeltme Stratejisi |
|---|---|---|---|---|
| **Ön Yüz Sayfaları (9 sayfa)** | 44 referans karedeki koyu lüks tema (#121212, altın #C9A86A, Playfair serif başlıklar) | `src/app/(site)/*` sayfalarında orijinal tasarım bileşenleriyle mevcut | Uygun | Korunacak ve kilitlenecek |
| **Header (Navbar)** | Yarı saydam koyu, daralan, aktif sayfa altı çizgili, altın "TEKLİF AL" butonu | `src/components/site/navbar.tsx` | Uygun | Korunacak |
| **Footer** | 4 sütun: Logo/tanıtım, Hızlı Bağlantılar, Etkinlik Türleri, İletişim | `src/components/site/footer.tsx` | Uygun | Korunacak |
| **WhatsApp Butonu** | Sağ altta yeşil hap buton | Mevcut | Uygun | Korunacak |
| **CMS Render Yolu** | Ön yüzle birebir aynı tasarım ve bileşenler | `public-page-renderer.tsx` içinde kopya blok markup'ları var | **(a) Kopya bileşen** | Tek kaynak site bileşenlerini sarmalayacak şekilde refactor edilecek |
| **Editör Tuvali** | Ön yüzle birebir aynı render | `block-renderers.tsx` içinde kopya markup'lar ve serbest stil alanları var | **(a) Kopya bileşen** | Ön yüz bileşenleriyle birleştirilecek |

---

## 5. Sıradaki Adım: Aşama 1 Geri Alma & Kilitleme Planı
Bu teşhis raporu doğrultusunda:
1. `src/app/(site)/*` altındaki 9 orijinal sayfa korunarak referans baseline olarak alınacaktır.
2. Playwright görsel regresyon testi (`tests/visual/site-regression.spec.ts`) kurulacaktır.
3. 9 sayfa x 3 ekran boyutu (1600x840, 1280x720, 390x844) için testler çalıştırılacak ve kullanıcı onayına sunulacaktır.
