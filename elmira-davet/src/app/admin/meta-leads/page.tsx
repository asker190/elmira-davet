import { getMetaLeadsOverview } from "./actions";
import { MetaLeadsClient } from "./meta-leads-client";
import { getAllMetaLeads, saveAllMetaLeads } from "@/lib/meta/lead-service";
import { MetaLeadRecord } from "@/lib/meta/types";

export const metadata = {
  title: "Meta Reklam Talepleri | Elmira Davet Yönetim",
};

export const dynamic = "force-dynamic";

export default async function AdminMetaLeadsPage() {
  let initialLeads = await getAllMetaLeads();

  // If no leads exist yet, add 3 realistic demonstration leads
  if (initialLeads.length === 0) {
    const demoLeads: MetaLeadRecord[] = [
      {
        id: "meta_lead_demo_01",
        leadgenId: "98234829104812",
        formId: "form_2026_dugun_erken",
        formName: "2026 Gaziosmanpaşa Düğün Erken Rezervasyon Formu",
        campaignId: "camp_instagram_dugun_01",
        campaignName: "Kristal Salon & Kır Bahçesi Düğün Kampanyası",
        adsetId: "adset_evlilik_hazirlik_24_35",
        adsetName: "Evlenecek Çiftler Hedef Kitlesi (24-35 Yaş)",
        adId: "ad_reels_kristal_avize",
        adName: "Kristal Avize & İlk Dans Reels Reklamı",
        createdTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),

        fullName: "Büşra & Tolga Yılmaz",
        phone: "0532 555 44 33",
        email: "busra.yilmaz@gmail.com",
        eventDate: "2026-11-28",
        eventType: "Düğün & Balo",
        guestCount: 500,
        hallPreference: "Kristal Salon (600 Kişilik)",

        customFields: [
          {
            name: "menu_tercihi",
            label: "Yemekli mi Yemeksiz mi Düşünüyorsunuz?",
            value: "Sultan Kırmızı Etli Sıcak Yemekli Menü",
          },
          {
            name: "muzik_orkestra",
            label: "Canlı Orkestra Talebiniz Var mı?",
            value: "Evet, canlı orkestra ve karşılama triosu",
          },
          {
            name: "butce_araligi",
            label: "Yaklaşık Düğün Bütçeniz",
            value: "200.000 TL - 250.000 TL",
          },
          {
            name: "gorusme_zamani",
            label: "Salonu Ne Zaman Görmek İstersiniz?",
            value: "Bu Cumartesi saat 14:00 - 16:00 arası",
          },
        ],
        rawFieldData: [
          { name: "full_name", label: "Adınız Soyadınız", values: ["Büşra & Tolga Yılmaz"] },
          { name: "phone_number", label: "Telefon Numaranız", values: ["0532 555 44 33"] },
          { name: "email", label: "E-posta Adresiniz", values: ["busra.yilmaz@gmail.com"] },
          { name: "event_date", label: "Düğün Tarihiniz", values: ["2026-11-28"] },
          { name: "guest_count", label: "Tahmini Davetli Sayısı", values: ["500"] },
        ],

        status: "Yeni",
        statusHistory: [
          {
            status: "Yeni",
            changedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            changedBy: "Meta Webhook",
            note: "Instagram Lead Ads formundan anlık aktarıldı",
          },
        ],
        notes: [
          {
            id: "note_1",
            author: "Sistem",
            content: "Instagram Story reklamı üzerinden Lead formu dolduruldu.",
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
        ],
        isTest: false,
        importedVia: "WEBHOOK",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "meta_lead_demo_02",
        leadgenId: "87123910283912",
        formId: "form_kir_bahcesi_kokteyl",
        formName: "Kır Bahçesi Nişan & Kokteyl Teklif Formu",
        campaignId: "camp_kir_bahcesi_nisan",
        campaignName: "Açık Hava Kır Bahçesi Nişan Kampanyası",
        adsetId: "adset_nisan_istanbul_avrupa",
        adsetName: "Nişan & Söz Hazırlığı Yapanlar (Avrupa Yakası)",
        adId: "ad_gorsel_peri_isiklari",
        adName: "Kır Bahçesi Peri Işıkları Gece Çekimi",
        createdTime: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),

        fullName: "Selin & Emre Demir",
        phone: "0544 321 00 11",
        email: "selin.demir@hotmail.com",
        eventDate: "2026-11-20",
        eventType: "Kır Bahçesi Nişanı",
        guestCount: 250,
        hallPreference: "Kır Bahçesi (300 Kişilik)",

        customFields: [
          {
            name: "menu_tercihi",
            label: "Menü Seçimi",
            value: "Kokteyl Menü (Kanepeler & Düğün Pastası)",
          },
          {
            name: "ozel_talep",
            label: "Özel İstekleriniz",
            value: "Girişte volkan şovu ve fotoğraf çekim köşesi süslemesi",
          },
        ],
        rawFieldData: [
          { name: "full_name", label: "Ad Soyad", values: ["Selin & Emre Demir"] },
          { name: "phone_number", label: "Telefon", values: ["0544 321 00 11"] },
        ],

        status: "Teklif verildi",
        statusHistory: [
          {
            status: "Yeni",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            changedBy: "Meta Webhook",
          },
          {
            status: "Arandı",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            changedBy: "Satis Sorumlusu",
            note: "Telefonla arandı, paket detayları aktarıldı",
          },
          {
            status: "Teklif verildi",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            changedBy: "Satis Sorumlusu",
            note: "WhatsApp'tan 250 kişilik kır bahçesi kokteyl teklifi iletildi",
          },
        ],
        notes: [
          {
            id: "note_2",
            author: "Satis Sorumlusu",
            content: "Çiftle görüşüldü, hafta sonu mekanı gezecekler.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
        ],
        isTest: false,
        importedVia: "WEBHOOK",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "meta_lead_demo_03",
        leadgenId: "76123489201948",
        formId: "form_2026_dugun_erken",
        formName: "2026 Gaziosmanpaşa Düğün Erken Rezervasyon Formu",
        campaignId: "camp_instagram_dugun_01",
        campaignName: "Kristal Salon & Kır Bahçesi Düğün Kampanyası",
        adsetId: "adset_evlilik_hazirlik_24_35",
        adsetName: "Evlenecek Çiftler Hedef Kitlesi (24-35 Yaş)",
        adId: "ad_video_kristal_avize",
        adName: "Kristal Avize & İlk Dans Reels Reklamı",
        createdTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),

        fullName: "Zeynep & Murat Kaya",
        phone: "0533 999 88 77",
        email: "zeynep.kaya@gmail.com",
        eventDate: "2026-12-12",
        eventType: "Düğün & Balo",
        guestCount: 550,
        hallPreference: "Kristal Salon (600 Kişilik)",

        customFields: [
          {
            name: "menu_tercihi",
            label: "Menü Tercihi",
            value: "Altın Düğün Paketi (Sıcak Yemekli)",
          },
          {
            name: "kapora_bilgisi",
            label: "Sözleşme Notu",
            value: "Kapora banka havalesiyle ödendi, tarih takvimde kapatıldı.",
          },
        ],
        rawFieldData: [],

        status: "Kapora alındı",
        statusHistory: [
          {
            status: "Yeni",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            status: "Görüşmeye geldi",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            changedBy: "Admin",
            note: "Salonda tadım ve konsept seçimi yapıldı",
          },
          {
            status: "Kapora alındı",
            changedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            changedBy: "Admin",
            note: "12 Aralık 2026 tarihi kesinleştirildi, sözleşme imzalandı",
          },
        ],
        notes: [
          {
            id: "note_3",
            author: "Admin",
            content: "550 kişilik Altın Paket sözleşmesi tamamlandı.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
        ],
        isTest: false,
        importedVia: "WEBHOOK",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ];

    await saveAllMetaLeads(demoLeads);
  }

  const overview = await getMetaLeadsOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream flex items-center gap-2.5">
          <span>Meta Reklam Talepleri</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold font-sans">
            Lead Ads & Webhook
          </span>
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Instagram ve Facebook Lead Ads formlarından gelen tüm potansiyel müşteri kayıtlarını anlık takip edin, tek tıkla arayın veya WhatsApp mesajı başlatın.
        </p>
      </div>

      <MetaLeadsClient
        initialLeads={overview.leads}
        initialStats={overview.stats}
        initialConfig={overview.config}
        syncLogs={overview.syncLogs}
      />
    </div>
  );
}
