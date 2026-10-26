import crypto from "crypto";
import { getMetaConfig } from "./client";
import { addMetaSyncLog } from "./queue";

/**
 * Normalizes and SHA-256 hashes a string according to Meta CAPI specification
 */
export function hashMetaField(val?: string | null): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash("sha256").update(clean).digest("hex");
}

/**
 * Normalizes phone number to digits only with country code (defaults to +90 for TR)
 */
export function hashMetaPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("0")) {
    digits = "90" + digits.substring(1);
  } else if (!digits.startsWith("90") && digits.length === 10) {
    digits = "90" + digits;
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

export interface MetaCapiEventPayload {
  eventName: "Lead" | "Contact" | "ViewContent" | "InitiateCheckout" | "Schedule";
  eventId: string;
  eventSourceUrl?: string;
  userData: {
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
    fbc?: string; // _fbc cookie if available
    fbp?: string; // _fbp cookie if available
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentCategory?: string;
    [key: string]: any;
  };
}

/**
 * Sends a Server-Side Event to Meta Conversions API (CAPI).
 * Deduplicates with browser pixel using eventId.
 */
export async function sendMetaConversionsApiEvent(
  event: MetaCapiEventPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getMetaConfig();
    const pixelId =
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      process.env.META_PIXEL_ID;

    const accessToken = config.pageAccessToken;

    if (!pixelId || !accessToken) {
      console.log(
        "[Meta CAPI] Pixel ID or Page Access Token not configured. Event skipped:",
        event.eventName
      );
      return { success: false, error: "Pixel ID or Token missing" };
    }

    const hashedEmail = hashMetaField(event.userData.email);
    const hashedPhone = hashMetaPhone(event.userData.phone);

    const eventTime = Math.floor(Date.now() / 1000);
    const graphVersion = config.graphVersion || "v21.0";

    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_time: eventTime,
          event_id: event.eventId,
          event_source_url:
            event.eventSourceUrl ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://elmiradavet.com",
          action_source: "website",
          user_data: {
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
            client_ip_address: event.userData.clientIp,
            client_user_agent: event.userData.clientUserAgent,
            fbc: event.userData.fbc,
            fbp: event.userData.fbp,
          },
          custom_data: {
            currency: event.customData?.currency || "TRY",
            value: event.customData?.value,
            content_name: event.customData?.contentName,
            content_category: event.customData?.contentCategory || "Düğün & Davet",
            ...event.customData,
          },
        },
      ],
    };

    const endpoint = `https://graph.facebook.com/${graphVersion}/${pixelId}/events?access_token=${accessToken}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[Meta CAPI Error]", result);
      await addMetaSyncLog({
        type: "MANUAL_SYNC",
        status: "FAILED",
        message: `CAPI ${event.eventName} olayı gönderilemedi: ${result.error?.message || "Bilinmeyen hata"}`,
      });
      return { success: false, error: result.error?.message };
    }

    console.log(`[Meta CAPI Success] Sent ${event.eventName} (Event ID: ${event.eventId})`);
    await addMetaSyncLog({
      type: "WEBHOOK_EVENT",
      status: "SUCCESS",
      message: `Meta Conversions API: ${event.eventName} dönüşüm olayı Meta'ya iletildi. (Event ID: ${event.eventId})`,
    });

    return { success: true };
  } catch (err: any) {
    console.error("[Meta CAPI Exception]", err);
    return { success: false, error: err.message };
  }
}
