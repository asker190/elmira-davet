import { PrismaClient, Role, PostStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ──────────────────────────────────────
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@elmira.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@elmira.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ─── Editor User ─────────────────────────────────────
  const editorPassword = await hash("editor123", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@elmira.com" },
    update: {},
    create: {
      name: "Editör",
      email: "editor@elmira.com",
      passwordHash: editorPassword,
      role: Role.EDITOR,
    },
  });
  console.log(`✅ Editor user created: ${editor.email}`);

  // ─── Site Settings ───────────────────────────────────
  const settings = [
    { key: "siteName", value: "Elmira Davet" },
    { key: "slogan", value: "Hayalinizdeki Düğün Burada Başlıyor" },
    { key: "phone", value: "+90 555 123 45 67" },
    { key: "email", value: "info@elmira.com" },
    {
      key: "address",
      value: "Atatürk Mahallesi, Cumhuriyet Caddesi No: 123, Merkez/İstanbul",
    },
    { key: "mapEmbedUrl", value: "" },
    { key: "instagramUrl", value: "https://instagram.com/elmira.davet" },
    { key: "facebookUrl", value: "https://facebook.com/elmira.davet" },
    { key: "youtubeUrl", value: "" },
    { key: "tiktokUrl", value: "" },
    {
      key: "aboutText",
      value:
        "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için buradayız. Modern mimarimiz, zarif dekorasyonumuz ve profesyonel ekibimizle her etkinliğinizi kusursuz bir deneyime dönüştürüyoruz.\n\nYılların deneyimi ve binlerce mutlu çiftin hikayesiyle, sizin için en iyisini sunmaya devam ediyoruz.",
    },
    {
      key: "kvkkText",
      value: `KVKK AYDINLATMA METNİ

Elmira Davet Salonu ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin güvenliğine büyük önem vermekteyiz.

1. Veri Sorumlusu
Elmira Davet Salonu, kişisel verilerinizin işlenmesinde veri sorumlusu sıfatıyla hareket etmektedir.

2. İşlenen Kişisel Veriler
- Kimlik bilgileri (ad, soyad)
- İletişim bilgileri (telefon, e-posta)
- Etkinlik bilgileri (tarih, tür, misafir sayısı)

3. Kişisel Verilerin İşlenme Amacı
- Rezervasyon taleplerinin değerlendirilmesi
- İletişim taleplerinin yanıtlanması
- Hizmet kalitesinin artırılması

4. Kişisel Verilerin Aktarılması
Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmamaktadır.

5. Veri Saklama Süresi
Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca saklanır. Rezervasyon verileri etkinlik tarihinden itibaren 2 yıl süreyle saklanır.

6. Haklarınız
KVKK'nın 11. maddesi kapsamında; verilerinize erişim, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsiniz.

İletişim: info@elmira.com`,
    },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ ${settings.length} site settings created`);

  // ─── Hero Slides ─────────────────────────────────────
  const heroSlides = [
    {
      title: "Hayalinizdeki Düğün",
      subtitle: "Elmira Davet ile Gerçek Olsun",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
      buttonText: "Paketleri İncele",
      buttonLink: "/paketler",
      sortOrder: 0,
    },
    {
      title: "Zarif & Modern",
      subtitle: "Her Detay Sizin İçin Tasarlandı",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&q=80",
      buttonText: "Galeri",
      buttonLink: "/galeri",
      sortOrder: 1,
    },
    {
      title: "Unutulmaz Anlar",
      subtitle: "Profesyonel Ekibimizle",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80",
      buttonText: "İletişim",
      buttonLink: "/iletisim",
      sortOrder: 2,
    },
  ];

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({ data: slide });
  }
  console.log(`✅ ${heroSlides.length} hero slides created`);

  // ─── Gallery Categories ──────────────────────────────
  const categories = [
    { name: "Düğün", slug: "dugun", sortOrder: 0 },
    { name: "Nişan", slug: "nisan", sortOrder: 1 },
    { name: "Kına Gecesi", slug: "kina-gecesi", sortOrder: 2 },
    { name: "Salon", slug: "salon", sortOrder: 3 },
    { name: "Dekorasyon", slug: "dekorasyon", sortOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.galleryCategory.create({ data: cat });
  }
  console.log(`✅ ${categories.length} gallery categories created`);

  // ─── Packages ────────────────────────────────────────
  const packages = [
    {
      name: "Gümüş Paket",
      slug: "gumus-paket",
      description:
        "Şık ve sade bir düğün arayanlar için ideal. Temel hizmetleri içeren ekonomik paketimiz.",
      price: 150000,
      priceLabel: null,
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      features: [
        "300 kişilik salon",
        "Temel dekorasyon",
        "DJ müzik sistemi",
        "Açık büfe yemek",
        "3 saatlik kullanım",
      ],
    },
    {
      name: "Altın Paket",
      slug: "altin-paket",
      description:
        "En popüler paketimiz. Zarif dekorasyon, canlı müzik ve premium menü ile unutulmaz bir gece.",
      price: 250000,
      priceLabel: null,
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      features: [
        "500 kişilik salon",
        "Premium dekorasyon",
        "Canlı orkestra",
        "Premium açık büfe",
        "Pasta ikramı",
        "5 saatlik kullanım",
        "Ücretsiz vale",
        "Gelin odası",
      ],
    },
    {
      name: "Elmas Paket",
      slug: "elmas-paket",
      description:
        "Her şey dahil lüks paketimiz. Özel koreografi, havai fişek gösterisi ve kişiye özel hizmetler.",
      price: null,
      priceLabel: "Fiyat için arayınız",
      isActive: true,
      isFeatured: false,
      sortOrder: 2,
      features: [
        "700 kişilik salon",
        "Lüks özel dekorasyon",
        "Canlı orkestra + DJ",
        "Gourmet menü",
        "Düğün pastası",
        "Havai fişek gösterisi",
        "Özel koreografi",
        "Sınırsız kullanım",
        "Ücretsiz vale",
        "Gelin & damat süiti",
        "Profesyonel fotoğraf",
        "Video çekim",
      ],
    },
  ];

  for (const pkg of packages) {
    const { features, ...packageData } = pkg;
    const created = await prisma.package.create({
      data: {
        ...packageData,
        features: {
          create: features.map((text, index) => ({
            text,
            sortOrder: index,
          })),
        },
      },
    });
    console.log(`  📦 Package: ${created.name}`);
  }
  console.log(`✅ ${packages.length} packages created`);

  // ─── Testimonials ────────────────────────────────────
  const testimonials = [
    {
      name: "Ayşe & Mehmet Yılmaz",
      eventType: "Düğün",
      content:
        "Elmira Davet'te hayalimizin düğününü yaptık. Ekip her detayı özenle hazırladı, misafirlerimiz hâlâ o geceyi konuşuyor!",
      rating: 5,
      sortOrder: 0,
    },
    {
      name: "Fatma & Ahmet Demir",
      eventType: "Nişan",
      content:
        "Nişanımız için mükemmel bir organizasyon. Dekorasyon, yemekler ve hizmet kalitesi beklentilerimizin çok üzerindeydi.",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Zeynep & Can Öztürk",
      eventType: "Düğün",
      content:
        "İlk görüşmeden son dansa kadar her şey kusursuzdu. Elmira ekibine ne kadar teşekkür etsek az. Kesinlikle tavsiye ediyoruz!",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Elif & Burak Kaya",
      eventType: "Düğün",
      content:
        "Salon muhteşem, yemekler lezzetli, ekip çok profesyonel. Düğünümüz tam istediğimiz gibi oldu.",
      rating: 4,
      sortOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log(`✅ ${testimonials.length} testimonials created`);

  // ─── Blog Posts ───────────────────────────────────────
  const blogPosts = [
    {
      title: "2025 Düğün Trendleri",
      slug: "2025-dugun-trendleri",
      excerpt:
        "Bu yılın en popüler düğün trendlerini keşfedin. Renk paletlerinden dekorasyon fikirlerine kadar her şey.",
      content: `<h2>2025 Yılının Öne Çıkan Düğün Trendleri</h2>
<p>Her yıl olduğu gibi bu yıl da düğün trendleri değişiyor ve gelişiyor. İşte 2025 yılında öne çıkan trendler:</p>
<h3>1. Doğal ve Sürdürülebilir Dekorasyon</h3>
<p>Çevre dostu malzemeler ve doğal çiçekler bu yılın vazgeçilmezi. Geri dönüştürülmüş materyaller ve yerel çiçekçilerle çalışmak trend.</p>
<h3>2. Intimate Düğünler</h3>
<p>Küçük ama özel. Yakın dostlar ve aile ile yapılan samimi düğünler popülerliğini koruyor.</p>
<h3>3. Teknoloji Entegrasyonu</h3>
<p>Drone çekimleri, LED duvarlar ve interaktif misafir deneyimleri düğünlere yeni bir boyut katıyor.</p>`,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      title: "Düğün Mekanı Seçerken Dikkat Edilmesi Gerekenler",
      slug: "dugun-mekani-secerken-dikkat-edilecekler",
      excerpt:
        "Hayalinizdeki düğün mekanını seçerken bilmeniz gereken 10 altın kural.",
      content: `<h2>Düğün Mekanı Seçim Rehberi</h2>
<p>Düğün mekanı seçimi, düğün organizasyonunun en önemli kararlarından biridir. İşte dikkat etmeniz gerekenler:</p>
<h3>1. Kapasite</h3>
<p>Misafir listenizi önceden belirleyin ve mekanın kapasitesinin yeterli olduğundan emin olun.</p>
<h3>2. Lokasyon</h3>
<p>Misafirlerinizin kolayca ulaşabileceği, otopark imkanı olan bir mekan tercih edin.</p>
<h3>3. Bütçe</h3>
<p>Paket fiyatlarını ve nelerin dahil olduğunu detaylı öğrenin. Gizli maliyetlere dikkat edin.</p>`,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log(`✅ ${blogPosts.length} blog posts created`);

  // ─── Page SEO ────────────────────────────────────────
  const pageSeo = [
    {
      pageSlug: "anasayfa",
      metaTitle: "Elmira Davet | Düğün & Davet Salonu",
      metaDescription:
        "Elmira Davet Salonu - Hayalinizdeki düğün ve özel günleriniz için elegant ve modern mekan. İstanbul'un en prestijli davet salonu.",
    },
    {
      pageSlug: "hakkimizda",
      metaTitle: "Hakkımızda",
      metaDescription:
        "Elmira Davet Salonu hakkında bilgi edinin. Yılların deneyimi ve profesyonel ekibimizle tanışın.",
    },
    {
      pageSlug: "galeri",
      metaTitle: "Galeri",
      metaDescription:
        "Elmira Davet Salonu galeri sayfası. Düğün, nişan ve özel etkinlik fotoğraflarımızı inceleyin.",
    },
    {
      pageSlug: "paketler",
      metaTitle: "Paketler & Fiyatlar",
      metaDescription:
        "Elmira Davet Salonu paket ve fiyat bilgileri. Gümüş, Altın ve Elmas paketlerimizi keşfedin.",
    },
    {
      pageSlug: "blog",
      metaTitle: "Blog",
      metaDescription:
        "Düğün trendleri, organizasyon ipuçları ve ilham veren içerikler. Elmira Davet blog.",
    },
    {
      pageSlug: "referanslar",
      metaTitle: "Referanslar & Müşteri Yorumları",
      metaDescription:
        "Mutlu çiftlerimizin yorumları. Elmira Davet Salonu müşteri deneyimleri ve referansları.",
    },
    {
      pageSlug: "iletisim",
      metaTitle: "İletişim & Rezervasyon",
      metaDescription:
        "Elmira Davet Salonu iletişim bilgileri ve online rezervasyon formu. Hemen randevu alın!",
    },
    {
      pageSlug: "kvkk",
      metaTitle: "KVKK Aydınlatma Metni",
      metaDescription:
        "Elmira Davet Salonu KVKK Aydınlatma Metni. Kişisel verilerinizin korunması hakkında bilgi.",
    },
  ];

  for (const seo of pageSeo) {
    await prisma.pageSeo.create({ data: seo });
  }
  console.log(`✅ ${pageSeo.length} page SEO records created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin  → admin@elmira.com / admin123");
  console.log("   Editor → editor@elmira.com / editor123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
