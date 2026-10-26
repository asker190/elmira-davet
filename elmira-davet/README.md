# Elmira Davet & Balo Salonları - Web & Canlı CMS Platformu

Modern, lüks davet ve balo salonu web sitesi ile blok tabanlı canlı sayfa editörünü içeren tam kapsamlı Next.js kurumsal web platformu.

## 🚀 Teknolojiler

- **Framework:** Next.js 16 (App Router)
- **UI & Kütüphaneler:** React 19, Tailwind CSS, Framer Motion, GSAP, Lucide Icons
- **Editör & Editör Tuvali:** dnd-kit, TipTap (Zengin Metin Editörü), Özel Blok Ağacı Mimarisi
- **Veritabanı & ORM:** Prisma ORM, PostgreSQL (ve yerel JSON/SQLite veri dayanıklılık katmanı)
- **Kimlik Doğrulama:** Auth.js (NextAuth v5) - RBAC (SUPER_ADMIN, ADMIN, EDITOR)
- **Medya Yönetimi:** Cloudinary Entegrasyonu & Özel Medya Seçici
- **Test:** Playwright (Görsel Regresyon & E2E), TypeScript / Node Unit Testleri

---

## 🛠️ Kurulum ve Başlangıç

### 1. Gereksinimler
- Node.js 20.x veya 22.x+
- npm veya pnpm

### 2. Bağımlılıkları Yükleme
```bash
npm install
```

### 3. Çevre Değişkenleri (.env)
`.env.example` dosyasını `.env` olarak kopyalayın ve değişkenleri güncelleyin:
```bash
cp .env.example .env
```

Örnek `.env` içeriği:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/elmira_davet?schema=public"
AUTH_SECRET="guclu-ve-rastgele-bir-secret-anahtari"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="905xxxxxxxxx"
```

### 4. Veritabanı ve Tohum (Seed) Verileri
```bash
# Şemayı veritabanına uygula
npm run db:push

# Başlangıç salonları, paketleri, sayfaları ve yönetici kullanıcısını oluştur
npm run db:seed
```

> **Varsayılan Yönetici Girişi:**  
> **E-posta:** `admin@elmira.com`  
> **Şifre:** `admin123`  
> **Panel Adresi:** `http://localhost:3000/admin`

### 5. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 📜 Kullanılabilir Komutlar (Scripts)

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır (localhost:3000) |
| `npm run build` | Üretim (production) derlemesini alır |
| `npm run start` | Derlenmiş üretim sunucusunu çalıştırır |
| `npm run lint` | ESLint ile kod kalite denetimi yapar |
| `npm run db:push` | Prisma şemasını veritabanına yansıtır |
| `npm run db:seed` | Örnek verileri ve yönetici kullanıcısını veritabanına yükler |
| `npm run db:reset` | Veritabanını sıfırlayıp yeniden tohumlar |
| `npm run backup` | Sistem ayarları ve sayfaların JSON yedeğini alır |
| `npm run test:visual` | Playwright ile görsel regresyon testlerini çalıştırır |

---

## 📁 Proje Dizin Yapısı

```
elmira-davet/
├── src/
│   ├── app/                 # Next.js App Router (Site ve Admin sayfaları)
│   │   ├── (site)/          # Herkese açık kurumsal web sitesi sayfaları
│   │   ├── admin/           # Yönetim paneli modülleri (Sayfalar, Salonlar, Paketler vb.)
│   │   └── api/             # REST ve dahili API uç noktaları
│   ├── components/
│   │   ├── admin/           # Canlı sayfa editörü tuvali, araç çubuğu ve modal bileşenleri
│   │   ├── site/            # Herkese açık sitenin ortak bileşenleri (Tek Kaynak)
│   │   └── animations/      # Reveal, Parallax ve Counter animasyon bileşenleri
│   └── lib/
│       ├── cms/             # Blok şemaları, kayıt defteri, sayfa ve revizyon servisleri
│       ├── auth.ts          # Auth.js yapılandırması
│       └── prisma.ts        # Prisma ORM istemcisi
├── prisma/                  # Prisma şeması ve tohumlama scripti
├── tests/                   # Birim testler ve görsel regresyon testleri
└── public/                  # Statik medya ve görseller
```

---

## 🔒 Tasarım Kilidi ve Mimari Prensipler

- **Tek Kaynak Prensibi:** Admin canlı sayfa editörünün tuvali ile herkese açık site aynı bileşenleri ve aynı stilleri paylaşır.
- **Blok Tabanlı Mimari:** Bloklar sadece içerik verisini (metin, görsel, seçimler) barındırır. Tasarım, tipografi ve boşluk hiyerarşisi sabittir.
- **Optimistic Concurrency:** Aynı sayfa üzerinde eşzamanlı düzenleme çatışmaları ve sessiz ezmeler otomatik olarak engellenir.
