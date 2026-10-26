import { prisma } from "@/lib/prisma";
import { getSafeSetting, setSafeSetting, isDatabaseReachable } from "@/lib/local-store";
import {
  MetaLeadRecord,
  MetaLeadStatus,
  MetaFormFieldAnswer,
  StatusHistoryEntry,
} from "./types";
import { fetchMetaLeadDetails, resolveMarketingNames } from "./client";

/**
 * Normalizes field key to lowercase alphanumeric for matching
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "_");
}

/**
 * Intelligently maps Meta form field_data to structured lead fields
 */
export function extractNormalizedLeadFields(fieldData: any[]): {
  fullName: string;
  phone: string;
  email?: string;
  eventDate?: string;
  eventType?: string;
  guestCount?: number | null;
  hallPreference?: string;
  customFields: Array<{ name: string; label: string; value: string }>;
  rawFieldData: MetaFormFieldAnswer[];
} {
  let fullName = "";
  let firstName = "";
  let lastName = "";
  let phone = "";
  let email = "";
  let eventDate = "";
  let eventType = "";
  let guestCount: number | null = null;
  let hallPreference = "";
  const customFields: Array<{ name: string; label: string; value: string }> = [];
  const rawFieldData: MetaFormFieldAnswer[] = [];

  if (!Array.isArray(fieldData)) {
    return {
      fullName: "İsimsiz Meta Müşterisi",
      phone: "-",
      customFields: [],
      rawFieldData: [],
    };
  }

  for (const item of fieldData) {
    const rawName = item.name || "";
    const key = normalizeKey(rawName);
    const values = Array.isArray(item.values) ? item.values : [item.value || ""];
    const valueStr = values.join(", ").trim();

    rawFieldData.push({
      name: rawName,
      label: item.label || rawName,
      values,
    });

    if (!valueStr) continue;

    // 1. Name matching
    if (
      key.includes("full_name") ||
      key.includes("ad_soyad") ||
      key.includes("adiniz_soyadiniz") ||
      key === "name" ||
      key === "isim"
    ) {
      if (!fullName) fullName = valueStr;
    } else if (key.includes("first_name") || key === "ad" || key === "adiniz") {
      firstName = valueStr;
    } else if (key.includes("last_name") || key === "soyad" || key === "soyadiniz") {
      lastName = valueStr;
    }
    // 2. Phone matching
    else if (
      key.includes("phone") ||
      key.includes("telefon") ||
      key.includes("cep") ||
      key.includes("gsm") ||
      key.includes("iletisim_numarasi")
    ) {
      if (!phone) phone = valueStr;
    }
    // 3. Email matching
    else if (
      key.includes("email") ||
      key.includes("eposta") ||
      key.includes("e_posta") ||
      key.includes("mail")
    ) {
      if (!email) email = valueStr;
    }
    // 4. Event Date matching
    else if (
      key.includes("date") ||
      key.includes("tarih") ||
      key.includes("ne_zaman") ||
      key.includes("dugun_tarihi") ||
      key.includes("etkinlik_tarihi")
    ) {
      if (!eventDate) eventDate = valueStr;
    }
    // 5. Guest Count matching
    else if (
      key.includes("guest") ||
      key.includes("davetli") ||
      key.includes("kisi") ||
      key.includes("misafir") ||
      key.includes("kac_kisi") ||
      key.includes("kapasite")
    ) {
      const parsedNum = parseInt(valueStr.replace(/\D/g, ""), 10);
      if (!isNaN(parsedNum) && parsedNum > 0) {
        guestCount = parsedNum;
      }
    }
    // 6. Event Type matching
    else if (
      key.includes("event_type") ||
      key.includes("etkinlik_turu") ||
      key.includes("organizasyon_turu") ||
      key.includes("kutlama_turu") ||
      key.includes("dugun_mu")
    ) {
      if (!eventType) eventType = valueStr;
    }
    // 7. Hall Preference matching
    else if (
      key.includes("hall") ||
      key.includes("salon") ||
      key.includes("mekan_tercihi")
    ) {
      if (!hallPreference) hallPreference = valueStr;
    }
    // Unmatched Custom Question
    else {
      customFields.push({
        name: rawName,
        label: item.label || rawName.replace(/_/g, " "),
        value: valueStr,
      });
    }
  }

  if (!fullName && (firstName || lastName)) {
    fullName = `${firstName} ${lastName}`.trim();
  }

  return {
    fullName: fullName || "İsimsiz Meta Müşterisi",
    phone: phone || "-",
    email: email || undefined,
    eventDate: eventDate || undefined,
    eventType: eventType || "Düğün & Davet",
    guestCount,
    hallPreference: hallPreference || "Kristal Salon (600 Kişilik)",
    customFields,
    rawFieldData,
  };
}

/**
 * Gets all saved Meta Leads from database / persistent SiteSetting
 */
export async function getAllMetaLeads(): Promise<MetaLeadRecord[]> {
  try {
    const value = await getSafeSetting("meta_leads");
    if (value) {
      const list = JSON.parse(value);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch {}

  return [];
}

/**
 * Saves or updates full Meta Leads list
 */
export async function saveAllMetaLeads(leads: MetaLeadRecord[]): Promise<void> {
  try {
    await setSafeSetting("meta_leads", JSON.stringify(leads));
  } catch (err) {
    console.error("Failed to save meta_leads:", err);
  }
}

/**
 * Ingests a new Meta Lead into the system with deduplication and name resolution
 */
export async function ingestMetaLead(params: {
  leadgenId: string;
  formId: string;
  adId?: string;
  adsetId?: string;
  campaignId?: string;
  pageId?: string;
  createdTime?: string;
  importedVia?: "WEBHOOK" | "MANUAL_SYNC" | "CRON_SYNC";
}): Promise<{ isDuplicate: boolean; lead: MetaLeadRecord }> {
  const existingLeads = await getAllMetaLeads();

  // Deduplication check: Same leadgen_id must not be saved twice!
  const duplicate = existingLeads.find((l) => l.leadgenId === params.leadgenId);
  if (duplicate) {
    return { isDuplicate: true, lead: duplicate };
  }

  // Fetch full details from Graph API
  const leadDetails = await fetchMetaLeadDetails(params.leadgenId);

  // Extract form answers
  const fieldData = leadDetails.field_data || [];
  const normalized = extractNormalizedLeadFields(fieldData);

  // Resolve Campaign, AdSet, Ad, and Form Names from Graph API
  const names = await resolveMarketingNames({
    campaignId: params.campaignId || leadDetails.campaign_id,
    adsetId: params.adsetId || leadDetails.adset_id,
    adId: params.adId || leadDetails.ad_id,
    formId: params.formId || leadDetails.form_id,
  });

  const createdTime =
    leadDetails.created_time ||
    params.createdTime ||
    new Date().toISOString();

  const newRecord: MetaLeadRecord = {
    id: `meta_${params.leadgenId}`,
    leadgenId: params.leadgenId,
    formId: params.formId || leadDetails.form_id || "default_form",
    formName: names.formName || `Form (${params.formId || leadDetails.form_id})`,
    campaignId: params.campaignId || leadDetails.campaign_id,
    campaignName: names.campaignName || (leadDetails.campaign_id ? `Kampanya #${leadDetails.campaign_id}` : "Meta Lead Reklamı"),
    adsetId: params.adsetId || leadDetails.adset_id,
    adsetName: names.adsetName,
    adId: params.adId || leadDetails.ad_id,
    adName: names.adName || (leadDetails.ad_id ? `Reklam #${leadDetails.ad_id}` : "Instagram/Facebook Lead"),
    pageId: params.pageId || leadDetails.page_id,
    createdTime,

    fullName: normalized.fullName,
    phone: normalized.phone,
    email: normalized.email,
    eventDate: normalized.eventDate,
    eventType: normalized.eventType,
    guestCount: normalized.guestCount,
    hallPreference: normalized.hallPreference,

    customFields: normalized.customFields,
    rawFieldData: normalized.rawFieldData,

    status: "Yeni",
    statusHistory: [
      {
        status: "Yeni",
        changedAt: new Date().toISOString(),
        changedBy: "Meta Webhook",
        note: `Meta Lead Ads formundan otomatik alındı (${names.campaignName || "Meta"})`,
      },
    ],
    notes: [],

    isTest: params.leadgenId.startsWith("test_") || Boolean(leadDetails.is_organic === false && !leadDetails.ad_id),
    importedVia: params.importedVia || "WEBHOOK",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  existingLeads.unshift(newRecord);
  await saveAllMetaLeads(existingLeads);

  // Sync with Prisma reservation table for unified CRM (if database is online)
  try {
    if (await isDatabaseReachable()) {
      const eventDateObj = normalized.eventDate
        ? new Date(normalized.eventDate)
        : new Date(Date.now() + 86400000 * 30);

      await prisma.reservation
        .create({
          data: {
            fullName: normalized.fullName,
            email: normalized.email || `${normalized.phone.replace(/\D/g, "")}@meta.lead.elmiradavet.com`,
            phone: normalized.phone,
            eventDate: isNaN(eventDateObj.getTime()) ? new Date() : eventDateObj,
            eventType: `${normalized.eventType || "Düğün"} (Meta: ${names.campaignName || "Lead Ads"})`,
            guestCount: normalized.guestCount,
            message: `Meta Form: ${names.formName || params.formId}\nReklam: ${names.adName || "-"}\nCevaplar: ${normalized.customFields.map((f) => `${f.label}: ${f.value}`).join(" | ")}`,
            status: "PENDING",
          },
        })
        .catch(() => {});
    }
  } catch {}

  return { isDuplicate: false, lead: newRecord };
}

/**
 * Anonymizes a single name under KVKK (e.g. "Ahmet Yılmaz" -> "A*** Y***")
 */
export function anonymizeName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => (p.length > 1 ? p[0] + "***" : "*"))
    .join(" ");
}

/**
 * Anonymizes phone number (e.g. "0532 555 44 33" -> "0532 *** ** 33")
 */
export function anonymizePhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 7) {
    return digits.slice(0, 4) + " *** ** " + digits.slice(-2);
  }
  return "*** *** ** **";
}

/**
 * Anonymizes email (e.g. "busra.yilmaz@gmail.com" -> "b***@gmail.com")
 */
export function anonymizeEmail(email?: string): string {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return "***@***.com";
  const user = parts[0];
  const domain = parts[1];
  return (user.length > 1 ? user[0] + "***" : "*") + "@" + domain;
}

/**
 * KVKK Data Retention: Anonymizes a specific Meta Lead record
 */
export async function anonymizeMetaLead(
  leadgenId: string,
  performedBy: string = "KVKK Yetkilisi"
): Promise<{ success: boolean; lead?: MetaLeadRecord }> {
  const leads = await getAllMetaLeads();
  const index = leads.findIndex((l) => l.leadgenId === leadgenId || l.id === leadgenId);
  if (index === -1) {
    return { success: false };
  }

  const target = leads[index];
  target.fullName = anonymizeName(target.fullName);
  target.phone = anonymizePhone(target.phone);
  if (target.email) {
    target.email = anonymizeEmail(target.email);
  }

  target.customFields = target.customFields.map((f) => ({
    ...f,
    value: "[KVKK Kapsamında Anonimleştirildi]",
  }));

  target.rawFieldData = [];
  target.isAnonymized = true;
  target.anonymizedAt = new Date().toISOString();
  target.updatedAt = new Date().toISOString();

  target.statusHistory.unshift({
    status: target.status,
    changedAt: new Date().toISOString(),
    changedBy: performedBy,
    note: "6698 sayılı KVKK kapsamında kişisel veriler maskelenerek anonimleştirildi.",
  });

  await saveAllMetaLeads(leads);
  return { success: true, lead: target };
}

/**
 * KVKK Batch Cleanup: Anonymizes all Meta Leads older than the retention period (default 24 months)
 */
export async function purgeOrAnonymizeExpiredMetaLeads(
  retentionMonths: number = 24,
  performedBy: string = "KVKK Otomatik Saklama Politikası"
): Promise<{ totalScanned: number; anonymizedCount: number }> {
  const leads = await getAllMetaLeads();
  const thresholdMs = Date.now() - retentionMonths * 30 * 24 * 60 * 60 * 1000;
  let count = 0;

  for (const lead of leads) {
    const createdMs = new Date(lead.createdAt || lead.createdTime).getTime();
    if (!lead.isAnonymized && createdMs < thresholdMs) {
      lead.fullName = anonymizeName(lead.fullName);
      lead.phone = anonymizePhone(lead.phone);
      if (lead.email) {
        lead.email = anonymizeEmail(lead.email);
      }
      lead.customFields = lead.customFields.map((f) => ({
        ...f,
        value: "[KVKK Kapsamında Saklama Süresi Sonu Anonimleştirildi]",
      }));
      lead.rawFieldData = [];
      lead.isAnonymized = true;
      lead.anonymizedAt = new Date().toISOString();
      lead.updatedAt = new Date().toISOString();

      lead.statusHistory.unshift({
        status: lead.status,
        changedAt: new Date().toISOString(),
        changedBy: performedBy,
        note: `KVKK ${retentionMonths} aylık yasal saklama süresi dolduğu için otomatik anonimleştirildi.`,
      });

      count++;
    }
  }

  if (count > 0) {
    await saveAllMetaLeads(leads);
  }

  return { totalScanned: leads.length, anonymizedCount: count };
}
