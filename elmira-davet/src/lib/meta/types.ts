export type MetaLeadStatus =
  | "Yeni"
  | "Arandı"
  | "Ulaşılamadı"
  | "Teklif verildi"
  | "Görüşmeye geldi"
  | "Kapora alındı"
  | "Kaybedildi";

export interface MetaFormFieldAnswer {
  name: string;
  label?: string;
  values: string[];
}

export interface StatusHistoryEntry {
  status: MetaLeadStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface LeadNoteEntry {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface MetaLeadRecord {
  id: string; // leadgen_id or local fallback
  leadgenId: string;
  formId: string;
  formName?: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adsetName?: string;
  adId?: string;
  adName?: string;
  pageId?: string;
  createdTime: string; // ISO string from Meta created_time

  // Extracted normalized lead fields
  fullName: string;
  phone: string;
  email?: string;
  eventDate?: string;
  eventType?: string;
  guestCount?: number | null;
  hallPreference?: string;

  // Custom / Unmatched form answers
  customFields: Array<{
    name: string;
    label: string;
    value: string;
  }>;
  rawFieldData: MetaFormFieldAnswer[];

  // Lead Lifecycle Management
  status: MetaLeadStatus;
  statusHistory: StatusHistoryEntry[];
  notes: LeadNoteEntry[];

  // Meta System Information
  isTest?: boolean;
  isAnonymized?: boolean;
  anonymizedAt?: string;
  importedVia: "WEBHOOK" | "MANUAL_SYNC" | "CRON_SYNC";
  createdAt: string;
  updatedAt: string;
}

export interface MetaAppConfig {
  appId?: string;
  appSecret?: string;
  verifyToken: string;
  pageAccessToken?: string; // stored encrypted
  pageId?: string;
  graphVersion: string;
  tokenExpiresAt?: string; // ISO string
  tokenScopes?: string[];
  isConfigured: boolean;
  lastSyncAt?: string;
  syncIntervalMinutes?: number;
}

export interface MetaSyncLog {
  id: string;
  type: "WEBHOOK_EVENT" | "MANUAL_SYNC" | "CRON_SYNC" | "TOKEN_CHECK";
  status: "SUCCESS" | "FAILED" | "RETRYING";
  leadgenId?: string;
  message: string;
  details?: any;
  timestamp: string;
  attemptCount?: number;
}
