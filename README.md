# Elmira Davet & Balo Salonları

Elmira Davet & Balo Salonları kurumsal web sitesi, yönetim paneli ve blok tabanlı canlı sayfa editörü çalışma alanı.

## 📁 Çalışma Alanı Düzeni

- **`elmira-davet/`**: Next.js 16 (App Router), React 19 ve Tailwind CSS tabanlı ana web uygulaması ve admin CMS.
- **`docs/`**: Tasarım kilidi, mimari senaryolar, dinamik admin belgeleri ve kalite kontrol raporları.
- **`.agents/`**: Proje kuralları (Tasarım kilidi, sayfa yönetimi) ve yapay zeka ajan iş akışları.

## 🚀 Hızlı Başlangıç

Ana uygulama dizinine geçip geliştirme sunucusunu başlatın:

```bash
cd elmira-davet
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Veya kök dizinden doğrudan:
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışır.
Admin paneli: [http://localhost:3000/admin](http://localhost:3000/admin) (Giriş: `admin@elmira.com` / `admin123`)
