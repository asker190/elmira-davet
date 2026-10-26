import crypto from "crypto";
import { getSafeSetting } from "@/lib/local-store";
import { decryptToken } from "./crypto";
import { MetaAppConfig } from "./types";

const memoryNameCache: Record<string, { name: string; cachedAt: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

/**
 * Retrieves Meta configuration from Environment and fallback SiteSetting
 */
export async function getMetaConfig(): Promise<MetaAppConfig> {
  let dbConfig: Partial<MetaAppConfig> = {};
  try {
    const settingValue = await getSafeSetting("meta_app_config");
    if (settingValue) {
      dbConfig = JSON.parse(settingValue);
    }
  } catch {}

  const verifyToken =
    process.env.META_VERIFY_TOKEN ||
    dbConfig.verifyToken ||
    "elmira_davet_meta_verify_token_2026";

  const appSecret =
    process.env.META_APP_SECRET ||
    (dbConfig.appSecret ? decryptToken(dbConfig.appSecret) : undefined);

  const appId = process.env.META_APP_ID || dbConfig.appId;

  const rawPageAccessToken =
    process.env.META_PAGE_ACCESS_TOKEN || dbConfig.pageAccessToken;
  const pageAccessToken = rawPageAccessToken
    ? decryptToken(rawPageAccessToken)
    : undefined;

  const pageId = process.env.META_PAGE_ID || dbConfig.pageId;

  const graphVersion =
    process.env.META_GRAPH_VERSION || dbConfig.graphVersion || "v21.0";

  return {
    appId,
    appSecret,
    verifyToken,
    pageAccessToken,
    pageId,
    graphVersion,
    tokenExpiresAt: dbConfig.tokenExpiresAt,
    tokenScopes: dbConfig.tokenScopes,
    isConfigured: Boolean(pageAccessToken && (appSecret || process.env.META_APP_SECRET)),
    lastSyncAt: dbConfig.lastSyncAt,
  };
}

/**
 * Validates X-Hub-Signature-256 header using App Secret
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret?: string
): boolean {
  if (!signatureHeader) return false;
  const secret = appSecret || process.env.META_APP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("Meta App Secret is missing in production! Webhook rejected for security.");
      return false;
    }
    console.warn("Meta App Secret is not configured. Webhook verification permitted only in local development.");
    return true;
  }

  try {
    const [algo, signature] = signatureHeader.split("=");
    if (algo !== "sha256" || !signature) return false;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Returns Base Graph API URL with configurable version from .env
 */
export function getGraphApiBaseUrl(version?: string): string {
  const v = version || process.env.META_GRAPH_VERSION || "v21.0";
  return `https://graph.facebook.com/${v.startsWith("v") ? v : `v${v}`}`;
}

/**
 * Fetches Lead Details by leadgen_id from Meta Graph API
 */
export async function fetchMetaLeadDetails(
  leadgenId: string,
  accessToken?: string
): Promise<any> {
  const config = await getMetaConfig();
  const token = accessToken || config.pageAccessToken;
  if (!token) {
    throw new Error("Meta Page Access Token bulunamadı. Lütfen panelden veya .env'den tanımlayın.");
  }

  const url = `${getGraphApiBaseUrl(config.graphVersion)}/${leadgenId}?access_token=${token}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Graph API Hatası (HTTP ${response.status})`);
  }

  return data;
}

/**
 * Resolves Human-Readable names for Campaign, AdSet, Ad, and Lead Form
 */
export async function resolveMarketingNames(params: {
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  formId?: string;
  accessToken?: string;
}): Promise<{
  campaignName?: string;
  adsetName?: string;
  adName?: string;
  formName?: string;
}> {
  const config = await getMetaConfig();
  const token = params.accessToken || config.pageAccessToken;
  if (!token) return {};

  const baseUrl = getGraphApiBaseUrl(config.graphVersion);
  const result: {
    campaignName?: string;
    adsetName?: string;
    adName?: string;
    formName?: string;
  } = {};

  const fetchName = async (
    id?: string,
    field = "name"
  ): Promise<string | undefined> => {
    if (!id) return undefined;

    // Check memory cache
    const cached = memoryNameCache[id];
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.name;
    }

    try {
      const res = await fetch(
        `${baseUrl}/${id}?fields=${field}&access_token=${token}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const d = await res.json();
        const resolved = d[field] || d.name;
        if (resolved) {
          memoryNameCache[id] = { name: resolved, cachedAt: Date.now() };
          return resolved;
        }
      }
    } catch {}
    return undefined;
  };

  const [campaignName, adsetName, adName, formName] = await Promise.all([
    fetchName(params.campaignId),
    fetchName(params.adsetId),
    fetchName(params.adId),
    fetchName(params.formId),
  ]);

  result.campaignName = campaignName;
  result.adsetName = adsetName;
  result.adName = adName;
  result.formName = formName;

  return result;
}

/**
 * Pulls leads for a given Form ID for the last X days (Manual Sync & Catch-up)
 */
export async function fetchFormLeads(
  formId: string,
  daysBack = 7,
  accessToken?: string
): Promise<any[]> {
  const config = await getMetaConfig();
  const token = accessToken || config.pageAccessToken;
  if (!token) {
    throw new Error("Page Access Token tanımlı değil.");
  }

  const sinceTimestamp = Math.floor(
    (Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000
  );
  const baseUrl = getGraphApiBaseUrl(config.graphVersion);

  const url = `${baseUrl}/${formId}/leads?filtering=[{'field':'time_created','operator':'GREATER_THAN','value':${sinceTimestamp}}]&limit=100&access_token=${token}`;

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Form lead kayıtları çekilemedi");
  }

  return data.data || [];
}

/**
 * Inspects Token with Meta debug_token endpoint to determine expiry & validity
 */
export async function inspectMetaToken(
  inputToken: string,
  appId?: string,
  appSecret?: string
): Promise<{
  isValid: boolean;
  expiresAt?: string;
  scopes?: string[];
  daysRemaining?: number;
  error?: string;
}> {
  try {
    const config = await getMetaConfig();
    const aid = appId || config.appId;
    const asec = appSecret || config.appSecret;

    const baseUrl = getGraphApiBaseUrl(config.graphVersion);
    const appToken = aid && asec ? `${aid}|${asec}` : inputToken;

    const url = `${baseUrl}/debug_token?input_token=${inputToken}&access_token=${appToken}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok || json.error) {
      return {
        isValid: false,
        error: json.error?.message || "Token doğrulanamadı",
      };
    }

    const info = json.data;
    const isValid = Boolean(info.is_valid);
    let expiresAt: string | undefined;
    let daysRemaining: number | undefined;

    if (info.expires_at && info.expires_at > 0) {
      const expDate = new Date(info.expires_at * 1000);
      expiresAt = expDate.toISOString();
      daysRemaining = Math.max(
        0,
        Math.round((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
    } else if (info.data_access_expires_at) {
      const expDate = new Date(info.data_access_expires_at * 1000);
      expiresAt = expDate.toISOString();
      daysRemaining = Math.max(
        0,
        Math.round((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
    }

    return {
      isValid,
      expiresAt,
      scopes: info.scopes || [],
      daysRemaining,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || "Bağlantı hatası",
    };
  }
}
