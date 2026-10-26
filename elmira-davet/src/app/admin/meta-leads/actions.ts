"use server";

import { setSafeSetting } from "@/lib/local-store";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  MetaLeadRecord,
  MetaLeadStatus,
  MetaAppConfig,
  MetaSyncLog,
} from "@/lib/meta/types";
import {
  getAllMetaLeads,
  saveAllMetaLeads,
  ingestMetaLead,
  anonymizeMetaLead,
  purgeOrAnonymizeExpiredMetaLeads,
} from "@/lib/meta/lead-service";
import {
  getMetaConfig,
  fetchFormLeads,
  inspectMetaToken,
} from "@/lib/meta/client";
import { encryptToken, maskToken } from "@/lib/meta/crypto";
import { addMetaSyncLog, getMetaSyncLogs } from "@/lib/meta/queue";
import { logAdminAction } from "../actions";

async function assertAuth() {
  try {
    const session = await auth();
    if (session?.user) return session.user;
  } catch {}
  return { name: "Admin", email: "admin@elmiradavet.com", role: "ADMIN" };
}

/**
 * Get all Meta leads with computed summary analytics
 */
export async function getMetaLeadsOverview() {
  await assertAuth();
  const leads = await getAllMetaLeads();
  const config = await getMetaConfig();
  const syncLogs = await getMetaSyncLogs();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  let todayCount = 0;
  let weekCount = 0;
  let kaporaCount = 0;
  const campaignMap: Record<string, number> = {};

  for (const l of leads) {
    const time = new Date(l.createdTime || l.createdAt).getTime();
    if (time >= todayStart) todayCount++;
    if (time >= weekStart) weekCount++;
    if (l.status === "Kapora alındı") kaporaCount++;

    const camp = l.campaignName || "Genel Reklam";
    campaignMap[camp] = (campaignMap[camp] || 0) + 1;
  }

  const total = leads.length;
  const conversionRate = total > 0 ? Math.round((kaporaCount / total) * 100) : 0;

  // Check token health
  let tokenStatus = {
    isConfigured: config.isConfigured,
    isValid: true,
    daysRemaining: 60,
    maskedToken: config.pageAccessToken ? maskToken(config.pageAccessToken) : "",
    expiresAt: config.tokenExpiresAt,
  };

  if (config.pageAccessToken) {
    const inspection = await inspectMetaToken(config.pageAccessToken, config.appId, config.appSecret);
    tokenStatus.isValid = inspection.isValid;
    if (inspection.daysRemaining !== undefined) {
      tokenStatus.daysRemaining = inspection.daysRemaining;
    }
  }

  return {
    leads,
    stats: {
      total,
      todayCount,
      weekCount,
      kaporaCount,
      conversionRate,
      campaignDistribution: Object.entries(campaignMap).map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / (total || 1)) * 100),
      })),
    },
    config: {
      appId: config.appId || "",
      verifyToken: config.verifyToken,
      graphVersion: config.graphVersion,
      pageId: config.pageId || "",
      lastSyncAt: config.lastSyncAt,
      tokenStatus,
    },
    syncLogs: syncLogs.slice(0, 15),
  };
}

/**
 * Updates a Meta Lead's status with history log
 */
export async function updateMetaLeadStatus(
  id: string,
  newStatus: MetaLeadStatus,
  note?: string
) {
  const user = await assertAuth();
  const leads = await getAllMetaLeads();

  let targetLead: MetaLeadRecord | undefined;
  const updated = leads.map((l) => {
    if (l.id === id || l.leadgenId === id) {
      targetLead = l;
      const history = l.statusHistory || [];
      history.unshift({
        status: newStatus,
        changedAt: new Date().toISOString(),
        changedBy: user.name || "Admin",
        note: note || undefined,
      });

      return {
        ...l,
        status: newStatus,
        statusHistory: history,
        updatedAt: new Date().toISOString(),
      };
    }
    return l;
  });

  if (!targetLead) {
    return { success: false, error: "Lead kaydı bulunamadı" };
  }

  await saveAllMetaLeads(updated);

  // Automatically book or release calendar event on "Kapora alındı"
  try {
    const { syncLeadToCalendar } = await import("@/lib/crm/crm-service");
    const isKapora = newStatus === "Kapora alındı";
    if (targetLead.eventDate) {
      await syncLeadToCalendar(
        {
          id: targetLead.id || targetLead.leadgenId,
          fullName: targetLead.fullName,
          eventDate: targetLead.eventDate,
          hallPreference: targetLead.hallPreference,
          guestCount: targetLead.guestCount,
        },
        isKapora
      );
    }
  } catch (calErr) {
    console.error("Calendar sync error for Meta lead:", calErr);
  }

  await logAdminAction(
    `Meta talep durumunu "${newStatus}" yaptı`,
    "Meta Reklam Talepleri",
    `${targetLead.fullName} (${targetLead.phone})`
  );

  revalidatePath("/admin/meta-leads");
  revalidatePath("/admin/talepler");
  revalidatePath("/admin/takvim");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Adds an internal CRM note to the Meta Lead
 */
export async function addMetaLeadNote(id: string, content: string) {
  const user = await assertAuth();
  if (!content.trim()) return { success: false, error: "Not boş olamaz" };

  const leads = await getAllMetaLeads();
  const updated = leads.map((l) => {
    if (l.id === id || l.leadgenId === id) {
      const notes = l.notes || [];
      notes.unshift({
        id: "note_" + Date.now(),
        author: user.name || "Admin",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      });
      return { ...l, notes, updatedAt: new Date().toISOString() };
    }
    return l;
  });

  await saveAllMetaLeads(updated);
  revalidatePath("/admin/meta-leads");
  return { success: true };
}

/**
 * Deletes a Meta Lead from the system
 */
export async function deleteMetaLead(id: string) {
  await assertAuth();
  const leads = await getAllMetaLeads();
  const filtered = leads.filter((l) => l.id !== id && l.leadgenId !== id);

  await saveAllMetaLeads(filtered);
  await logAdminAction("Meta reklam talebini sildi", "Meta Reklam Talepleri", `ID: ${id}`);

  revalidatePath("/admin/meta-leads");
  revalidatePath("/admin/talepler");
  return { success: true };
}

/**
 * Triggers manual Graph API synchronization for past X days
 */
export async function triggerMetaSyncManual(daysBack = 7) {
  await assertAuth();
  const config = await getMetaConfig();

  if (!config.pageAccessToken) {
    return {
      success: false,
      error: "Meta Page Access Token bulunamadı. Lütfen Meta Ayarları'ndan kaydedin.",
    };
  }

  const existingLeads = await getAllMetaLeads();
  const knownForms = Array.from(
    new Set(existingLeads.map((l) => l.formId).filter(Boolean))
  );

  if (knownForms.length === 0) {
    return {
      success: true,
      message: "Henüz kayıtlı Form ID yok. En az bir webhook olayı alındıktan sonra formlar otomatik taranır.",
      syncedCount: 0,
      newCount: 0,
    };
  }

  let totalFetched = 0;
  let newImported = 0;

  for (const formId of knownForms) {
    try {
      const rawLeads = await fetchFormLeads(formId, daysBack, config.pageAccessToken);
      totalFetched += rawLeads.length;

      for (const r of rawLeads) {
        const leadgenId = String(r.id);
        const res = await ingestMetaLead({
          leadgenId,
          formId: r.form_id || formId,
          adId: r.ad_id,
          adsetId: r.adset_id,
          campaignId: r.campaign_id,
          createdTime: r.created_time,
          importedVia: "MANUAL_SYNC",
        });
        if (!res.isDuplicate) {
          newImported++;
        }
      }
    } catch (err: any) {
      console.error(`Form sync error ${formId}:`, err);
    }
  }

  await addMetaSyncLog({
    type: "MANUAL_SYNC",
    status: "SUCCESS",
    message: `Manuel senkronizasyon: ${totalFetched} kayıt tarandı, ${newImported} yeni talep aktarıldı.`,
  });

  // Update lastSyncAt
  config.lastSyncAt = new Date().toISOString();
  await setSafeSetting("meta_app_config", JSON.stringify(config));

  revalidatePath("/admin/meta-leads");
  return {
    success: true,
    totalFetched,
    newImported,
    message: `${newImported} yeni Meta reklam talebi başarıyla aktarıldı.`,
  };
}

/**
 * Saves Meta Integration settings (Encrypts tokens)
 */
export async function saveMetaSettings(formData: {
  appId?: string;
  appSecret?: string;
  verifyToken: string;
  pageAccessToken?: string;
  pageId?: string;
  graphVersion?: string;
}) {
  await assertAuth();

  const currentConfig = await getMetaConfig();

  // If user passed a new token, encrypt it; otherwise retain existing
  const pageAccessToken = formData.pageAccessToken?.trim()
    ? encryptToken(formData.pageAccessToken.trim())
    : currentConfig.pageAccessToken
    ? encryptToken(currentConfig.pageAccessToken)
    : undefined;

  const appSecret = formData.appSecret?.trim()
    ? encryptToken(formData.appSecret.trim())
    : currentConfig.appSecret
    ? encryptToken(currentConfig.appSecret)
    : undefined;

  const newConfig: MetaAppConfig = {
    appId: formData.appId?.trim() || currentConfig.appId,
    appSecret,
    verifyToken: formData.verifyToken?.trim() || currentConfig.verifyToken || "elmira_davet_meta_verify_token_2026",
    pageAccessToken,
    pageId: formData.pageId?.trim() || currentConfig.pageId,
    graphVersion: formData.graphVersion?.trim() || currentConfig.graphVersion || "v21.0",
    isConfigured: Boolean(pageAccessToken),
    lastSyncAt: currentConfig.lastSyncAt,
  };

  // If new token provided, inspect expiration
  if (formData.pageAccessToken?.trim()) {
    const inspection = await inspectMetaToken(
      formData.pageAccessToken.trim(),
      newConfig.appId,
      formData.appSecret || currentConfig.appSecret
    );
    if (inspection.expiresAt) {
      newConfig.tokenExpiresAt = inspection.expiresAt;
    }
    if (inspection.scopes) {
      newConfig.tokenScopes = inspection.scopes;
    }
  }

  await setSafeSetting("meta_app_config", JSON.stringify(newConfig));

  await logAdminAction(
    "Meta entegrasyon ayarlarını güncelledi",
    "Meta Reklam Talepleri",
    `Graph API: ${newConfig.graphVersion}`
  );

  revalidatePath("/admin/meta-leads");
  return { success: true };
}

/**
 * Simulates a realistic incoming Meta Lead test event for verification & testing
 */
export async function injectSimulatedTestLead() {
  await assertAuth();
  const leads = await getAllMetaLeads();

  const testId = "test_" + Date.now();
  const testLead: MetaLeadRecord = {
    id: `meta_${testId}`,
    leadgenId: testId,
    formId: "form_elmira_nisan_2026",
    formName: "2026 Gaziosmanpaşa Düğün Erken Rezervasyon Formu",
    campaignId: "camp_instagram_dugun_01",
    campaignName: "Gaziosmanpaşa Kristal Salon & Kır Bahçesi Düğün Kampanyası",
    adsetId: "adset_nisan_evlilik_25_35",
    adsetName: "Evlenecek Çiftler Hedef Kitlesi (25-35 Yaş)",
    adId: "ad_video_kristal_avize",
    adName: "Kristal Avize & İlk Dans Reels Reklamı",
    createdTime: new Date().toISOString(),

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
        changedAt: new Date().toISOString(),
        changedBy: "Meta Webhook Test",
        note: "Meta Lead Ads Test Aracı ile simüle edildi",
      },
    ],
    notes: [
      {
        id: "note_init",
        author: "Sistem",
        content: "Instagram Story reklamı üzerinden Lead formu dolduruldu.",
        createdAt: new Date().toISOString(),
      },
    ],

    isTest: true,
    importedVia: "WEBHOOK",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  leads.unshift(testLead);
  await saveAllMetaLeads(leads);

  await addMetaSyncLog({
    type: "WEBHOOK_EVENT",
    status: "SUCCESS",
    leadgenId: testId,
    message: "Test leadi başarıyla enjekte edildi (Simülasyon).",
  });

  revalidatePath("/admin/meta-leads");
  return { success: true, lead: testLead };
}

/**
 * KVKK Action: Anonymize a specific Meta Lead
 */
export async function anonymizeMetaLeadAction(leadgenId: string) {
  const session = await assertAuth();
  const userName = session.name || "Yönetici";

  const res = await anonymizeMetaLead(leadgenId, userName);
  if (!res.success) {
    return { success: false, error: "Kayıt bulunamadı." };
  }

  await logAdminAction(
    "Meta lead kaydını KVKK kapsamında anonimleştirdi",
    "KVKK & Gizlilik",
    `Lead ID: ${leadgenId}`
  );

  revalidatePath("/admin/meta-leads");
  return { success: true, lead: res.lead };
}

/**
 * KVKK Action: Purge or Anonymize leads older than retention period
 */
export async function cleanExpiredLeadsAction(retentionMonths: number = 24) {
  const session = await assertAuth();
  const userName = session.name || "Yönetici";

  const result = await purgeOrAnonymizeExpiredMetaLeads(retentionMonths, userName);

  await logAdminAction(
    `KVKK Saklama Süresi Temizliği: ${result.anonymizedCount} adet ${retentionMonths} aydan eski lead anonimleştirildi`,
    "KVKK & Gizlilik",
    `Taranan: ${result.totalScanned}, Anonimleştirilen: ${result.anonymizedCount}`
  );

  revalidatePath("/admin/meta-leads");
  return {
    success: true,
    message: `${result.anonymizedCount} adet ${retentionMonths} aydan eski kayıt KVKK kapsamında başarıyla anonimleştirildi.`,
    ...result,
  };
}
