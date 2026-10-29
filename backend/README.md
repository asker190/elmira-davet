# Elmira Davet - Headless PHP REST API & MySQL Backend

Bu dizin, Elmira Davet projesinin yönetim paneli ve dinamik modülleri için tasarlanmış **bağımsız, hafif ve sıfır harici bağımlılıklı (zero-dependency)** PHP REST API backend servisidir.

Mevcut React 19 / Tailwind / Next.js admin paneli arayüzünde **tek bir piksel dahi değişmeden** tüm veritabanı, oturum ve CMS işlemleri bu PHP servisi üzerinden yürütülür.

---

## 📁 Dizin Yapısı

```
backend/
├── .env.example             # Örnek ortam değişkenleri (DB ve JWT ayarları)
├── .htaccess               # cPanel/Apache kök yönlendirmesi (public klasörüne)
├── database/
│   ├── schema.sql          # MySQL Tablo Şeması (InnoDB, utf8mb4)
│   └── seed.sql            # Başlangıç verileri (Admin, ayarlar, slaytlar, anasayfa blokları)
├── public/
│   ├── .htaccess           # REST API rewrite kuralları (index.php'ye yönlendirme)
│   ├── index.php           # API giriş noktası ve rota tanımları
│   └── uploads/            # Yüklenen medya ve görseller
├── src/
│   ├── Config/
│   │   ├── Database.php    # UTF-8 mb4 destekli MySQL PDO bağlantısı
│   │   └── Env.php         # Sıfır kütüphaneli .env yükleyicisi
│   ├── Middleware/
│   │   ├── CorsMiddleware.php  # CORS ve preflight (OPTIONS) yönetimi
│   │   └── AuthMiddleware.php  # JWT doğrulama ve rol kontrolleri
│   ├── Utils/
│   │   ├── JWT.php         # Saf PHP HMAC-SHA256 JWT üretici & doğrulayıcı
│   │   └── Response.php    # Standart JSON yanıt yardımcısı
│   ├── Router.php          # RESTful rota yöneticisi ({id}, {slug} parametre desteği)
│   └── Controllers/
│       ├── AuthController.php         # Giriş, oturum ve profil kontrolü
│       ├── PageController.php         # Sayfalar, canlı bloklar, revizyonlar ve kilitler
│       ├── SettingController.php      # Site ayarları (iletişim, sosyal medya, SEO)
│       ├── HeroController.php         # Slider ve hero slayt yönetimi
│       ├── PackageController.php      # Paketler ve fiyatlandırma
│       ├── GalleryController.php      # Fotoğraf ve video galerisi
│       ├── TestimonialController.php  # Müşteri yorumları ve puanlar
│       ├── BlogController.php         # Blog yazıları
│       ├── ReservationController.php  # Teklif/rezervasyon talepleri (Leads)
│       └── MediaController.php        # Resim/dosya yükleme servisi
```

---

## 🚀 cPanel / Paylaşımlı Hosting Kurulum Rehberi

### 1. MySQL Veritabanını Oluşturma
1. cPanel'e giriş yapın ve **MySQL® Veritabanı Sihirbazı**'na (MySQL Database Wizard) tıklayın.
2. Bir veritabanı adı belirleyin (Örn: `kullaniciadi_elmira`).
3. Bir kullanıcı adı ve güçlü bir şifre oluşturup kullanıcıya **TÜM YETKİLERİ (ALL PRIVILEGES)** verin.
4. cPanel ana sayfasına dönüp **phpMyAdmin**'i açın.
5. Yeni oluşturduğunuz veritabanını seçip **İçe Aktar (Import)** sekmesinden sırasıyla:
   * `backend/database/schema.sql` dosyasını içe aktarın.
   * Ardından `backend/database/seed.sql` dosyasını içe aktarın.

### 2. Dosyaları Sunucuya Yükleme
* **Alt Alan Adı (Subdomain) ile Kurulum (Önerilen):**
  * cPanel'den `api.elmiradavet.com` adında bir alt alan adı oluşturun. Belge kök dizini (Document Root) olarak `public_html/api/public` seçin.
  * `backend/` klasörünün içeriğini bu dizine FTP veya cPanel Dosya Yöneticisi ile yükleyin.
* **Alt Klasör ile Kurulum:**
  * `public_html` içine `api` klasörü açıp `backend` içeriğini buraya yükleyin.

### 3. Ortam Değişkenlerini (.env) Düzenleme
Sunucudaki `backend/.env.example` dosyasının adını `.env` olarak değiştirin ve bilgilerinizi girin:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kullaniciadi_elmira
DB_USER=kullaniciadi_dbuser
DB_PASS=olusturdugunuz_sifre

JWT_SECRET=cok_guclu_rastgele_bir_anahtar_987654321
ALLOWED_ORIGINS=https://elmiradavet.com,https://admin.elmiradavet.com
```

---

## 💻 Yerel Geliştirme (Localhost) Çalıştırma

PHP kurulu bir bilgisayarda (veya XAMPP / MAMP / Herd ile):

```bash
cd backend
# PHP Dahili Geliştirme Sunucusunu Başlat:
php -S localhost:8000 -t public
```

API test etmek için tarayıcıda veya Postman'de:
`http://localhost:8000/` -> `{ "success": true, "message": "Elmira Davet API Servisi Aktif" }`

---

## 🔐 Varsayılan Yönetici Bilgileri

* **E-posta:** `admin@elmira.com`
* **Şifre:** `admin123`
* **Rol:** `ADMIN`

---

## 🔗 Next.js Frontend Entegrasyonu

Next.js (`elmira-davet/.env.local`) dosyasına tek bir satır eklemeniz yeterlidir:

```env
NEXT_PUBLIC_PHP_API_URL=https://api.elmiradavet.com
# veya yerel geliştirme için:
# NEXT_PUBLIC_PHP_API_URL=http://localhost:8000
```

Frontend'de `src/lib/php-api.ts` istemcisi üzerinden tüm blok verileri, ayarlar ve sayfalar doğrudan bu PHP servisinden çekilir. Tasarımda, animasyonlarda veya bileşen yapısında **hiçbir değişiklik yapılmaz**.

---

## 🎯 Meta Lead Ads (Instagram / Facebook) & CRM Webhook Kurulumu

Elmira Davet yönetim paneli, Meta Lead Ads reklamlarından ve web sitesi formlarından gelen talepleri tek bir CRM havuzunda birleştirir.

### 1. Meta for Developers Panelinde Webhook Tanımlama
1. [Meta for Developers](https://developers.facebook.com/) paneline giriş yapın ve uygulamanızı seçin.
2. Sol menüden **Webhooks** bölümüne gidin ve nesne türü olarak **Page** seçin.
3. **Subscribe to this object** butonuna basın:
   * **Callback URL:** `https://api.elmiradavet.com/webhooks/meta` (veya `https://elmiradavet.com/api/webhooks/meta`)
   * **Verify Token:** `.env` dosyanızdaki `META_VERIFY_TOKEN` değeri (Örn: `elmira_davet_meta_secret_token_2026`).
4. Abonelik alanları (Subscription Fields) listesinden **`leadgen`** alanına abone olun (**Subscribe**).

### 2. Gerekli İzinler & Sürekli Sayfa Erişim Jetonu (Page Access Token)
Meta Graph API üzerinden form verilerini (Ad Soyad, Telefon, E-posta, Düğün Tarihi, Tercih Edilen Seans) anında çekebilmek için:
* **İzinler:** `leads_retrieval`, `pages_manage_ads`, `pages_read_engagement`
* `META_PAGE_ACCESS_TOKEN` değerini `backend/.env` dosyasına ekleyin.

### 3. CRM ve Otomatik Takvim Kilit Mekanizması
* Reklamdan veya web sitesinden yeni talep geldiğinde durum **`PENDING` (Yeni / Bekliyor)** olarak MySQL `leads` tablosuna ve paneldeki **Talepler & CRM** havuzuna düşer.
* Müşteriyle görüşülüp kapora alındığında panelden **"Kapora Alındı"** seçilir.
* Sistem düğün tarihini ve seansını (Gündüz 13:00-17:00 veya Akşam 19:00-23:00) seçilen salon için `calendar_events` tablosunda **BLOCKED** olarak işaretler.
* Web sitesindeki rezervasyon formunda ve takvimde bu tarih ve saat aralığı otomatik olarak kapatılır. (Günde maksimum 2 etkinlik kuralı uygulanır).

---

## 🖼️ Galeri Yönetimi & Düzenlenen Mantık
1. **Çoklu Yükleme & Kırpma:** Fotoğraflar harici bağlantı yerine doğrudan bilgisayardan seçilir, 16:9, 1:1, 4:3 veya 9:16 oranında kırpılarak optimize edilir.
2. **Kategori Yönetimi:** Yeni kategori eklendiğinde hem MySQL hem de yerel veri deposunda kalıcı olarak saklanır; sayfayı yenileyince kaybolmaz.
3. **Sıralama Kaydı:** Yukarı/Aşağı taşıma butonlarıyla fotoğraf sırası değiştirildiğinde `saveGalleryOrder` üzerinden anında kaydedilir.
4. **Hata Koruması:** Özel yüklenen fotoğrafların kategori ilişkileri null-safe hale getirilmiş, sitede beyaz sayfa/çökme riski tamamen ortadan kaldırılmıştır.
