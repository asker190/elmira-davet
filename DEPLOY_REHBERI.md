# 🚀 Elmira Davet - Production Dağıtım (Deploy) Rehberi

Bu proje için **otomatik build alan ve Natro sunucunuza güvenle gönderen** deploy scripti oluşturulmuştur.

---

## 📋 1. Hızlı Başlangıç (Tek Komutla Deploy)

### Adım 1: FTP Bilgilerinizi Tanımlayın
Proje kök dizininde otomatik oluşturulan `.env.deploy` dosyasını açın (veya `.env.deploy.example` dosyasını `.env.deploy` olarak kopyalayın):

```bash
cp .env.deploy.example .env.deploy
```

İçeriğini Natro hosting FTP bilgilerinizle doldurun:

```ini
# Natro DNS kayıtlarınızdaki bilgiler:
FTP_HOST=ftp.elmiradavet.com.tr
# (Alternatif olarak 94.73.151.149 IP adresini de kullanabilirsiniz)
FTP_PORT=21
FTP_USER=natro_ftp_kullanici_adiniz
FTP_PASSWORD=natro_ftp_sifreniz

# Güvenli FTP (FTPS) kullanmak isterseniz: true
FTP_SECURE=false

# Sunucu hedef dizini (Natro cPanel / Linux hosting için /public_html)
FTP_REMOTE_ROOT=/public_html
FTP_BACKEND_DIR=/public_html/api
FTP_FRONTEND_DIR=/public_html
```

> **Güvenlik Notu:** `.env.deploy` dosyası `.gitignore` listesindedir, kesinlikle GitHub/Git deponuza yüklenmez, şifreniz güvendedir.

---

## 🛠️ 2. Deploy Komutları

Artık terminalden tek bir komutla hem Next.js build alabilir hem de sunucuya aktarabilirsiniz:

```bash
# 1. Tam Dağıtım (Next.js Build Alır + Frontend & PHP Backend'i Sunucuya Yükler)
npm run deploy

# veya doğrudan bash scriptiyle:
./deploy.sh
```

### Diğer Seçenekler:

* **Sadece Frontend Yüklemek için:**
  ```bash
  npm run deploy:frontend
  ```

* **Sadece PHP Backend API Yüklemek için:**
  ```bash
  npm run deploy:backend
  ```

* **Gerçek Yükleme Yapmadan Simülasyon (Dry-Run):**
  ```bash
  npm run deploy:dry
  ```

* **Tekrar Build Almadan Mevcut Derlemeyi Yüklemek için:**
  ```bash
  node scripts/deploy.mjs --skip-build
  ```

---

## ⚙️ 3. Deploy Scripti Ne Yapar?

1. **Ön Kontrol:** `.env.deploy` içindeki FTP sunucusu, kullanıcı adı ve şifresini kontrol eder.
2. **Otomatik Build:** `npm run build` komutunu çalıştırarak Next.js uygulamasını production için derler. (Eğer derlemede bir hata olursa sunucuyu bozmamak için işlemi anında iptal eder).
3. **Paketleme (Staging):**
   * Next.js derleme dosyalarını (`.next/standalone`, `.next/static` ve `public/`) hazırlar.
   * PHP REST API backend dosyalarını (`src/`, `public/`, `database/`, `.htaccess`) hazırlar.
4. **FTP/FTPS Aktarımı:**
   * `basic-ftp` motoru ile `ftp.elmiradavet.com.tr` (94.73.151.149) sunucusuna bağlanır.
   * Uzak sunucudaki dizinleri otomatik oluşturur ve dosyaları güvenli bir şekilde aktarır.
5. **Özet & Temizlik:** İşlem süresini bildirir ve geçici dosyaları temizler.
