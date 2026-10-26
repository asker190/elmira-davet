import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const metadata = {
  title: "Kullanıcılar & İşlem Geçmişi | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminKullanicilarPage() {
  let users: any[] = [];
  let logs: any[] = [];

  // 1. Fetch Users from Prisma
  try {
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    if (dbUsers.length > 0) {
      users = dbUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }));
    }
  } catch {}

  // Check custom users in site settings if DB was offline or empty
  if (users.length === 0) {
    try {
      const customUsrs = await prisma.siteSetting.findUnique({
        where: { key: "admin_custom_users" },
      });
      if (customUsrs?.value) {
        users = JSON.parse(customUsrs.value);
      }
    } catch {}
  }

  // Fallback default users
  if (users.length === 0) {
    users = [
      {
        id: "usr-admin-1",
        name: "Yönetici (Admin)",
        email: "admin@elmiradavet.com",
        role: "ADMIN" as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-editor-1",
        name: "Etkinlik & Satış Sorumlusu",
        email: "satis@elmiradavet.com",
        role: "EDITOR" as const,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: "usr-editor-2",
        name: "Salon Şefi & Menü Koordinatörü",
        email: "koordinator@elmiradavet.com",
        role: "EDITOR" as const,
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      },
    ];
  }

  // 2. Fetch Audit Logs from SiteSetting
  try {
    const auditSetting = await prisma.siteSetting.findUnique({
      where: { key: "admin_audit_logs" },
    });
    if (auditSetting?.value) {
      logs = JSON.parse(auditSetting.value);
    }
  } catch {}

  // Fallback initial demo audit logs
  if (logs.length === 0) {
    const now = Date.now();
    logs = [
      {
        id: "log-1",
        user: "Admin",
        email: "admin@elmiradavet.com",
        action: "Site genel ayarlarını güncelledi",
        module: "Site Ayarları",
        details: "Logo URL, SEO başlık ve KVKK metinleri güncellendi",
        timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
      },
      {
        id: "log-2",
        user: "Admin",
        email: "admin@elmiradavet.com",
        action: "2026-11-14 tarihini Kristal Salon için BLOCKED olarak işaretledi",
        module: "Müsaitlik Takvimi",
        details: "Merve & Can Düğünü (550 Kişi) sözleşmesi yapıldı",
        timestamp: new Date(now - 1000 * 60 * 95).toISOString(),
      },
      {
        id: "log-3",
        user: "Etkinlik Sorumlusu",
        email: "satis@elmiradavet.com",
        action: "Selin & Emre Demir talebini OFFER_SENT olarak güncelledi",
        module: "Talepler & CRM",
        details: "WhatsApp üzerinden kokteyl menü fiyat teklifi iletildi",
        timestamp: new Date(now - 1000 * 60 * 220).toISOString(),
      },
      {
        id: "log-4",
        user: "Admin",
        email: "admin@elmiradavet.com",
        action: "Sultan Yemek Menüsü içeriğini ve fiyatını revize etti",
        module: "İçerik Yönetimi",
        details: "Kırmızı et ana yemek porsiyon gramajı güncellendi",
        timestamp: new Date(now - 1000 * 60 * 480).toISOString(),
      },
      {
        id: "log-5",
        user: "Admin",
        email: "admin@elmiradavet.com",
        action: "Galeriye 4 adet yeni yüksek çözünürlüklü kır bahçesi fotoğrafı ekledi",
        module: "Galeri & Medya",
        details: "16:9 en boy oranında gece peri masalı ışıklandırmaları",
        timestamp: new Date(now - 1000 * 60 * 720).toISOString(),
      },
      {
        id: "log-6",
        user: "Admin",
        email: "admin@elmiradavet.com",
        action: "Ana sayfa bölüm sıralamasını değiştirdi",
        module: "Sayfa Bölümleri",
        details: "Salonlarımız bloğu en üst 2. sıraya alındı",
        timestamp: new Date(now - 1000 * 60 * 1200).toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">Kullanıcılar & İşlem Geçmişi</h1>
        <p className="text-text-secondary text-sm">
          Panel erişim rollerini tanımlayın (Admin / Editör) ve sistemde kimin ne zaman hangi veriyi değiştirdiğini denetim günlüğünden takip edin.
        </p>
      </div>

      <UsersClient initialUsers={users} initialLogs={logs} />
    </div>
  );
}
