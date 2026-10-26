import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig, verifyMetaSignature } from "@/lib/meta/client";
import { enqueueLeadgenEvent, addMetaSyncLog } from "@/lib/meta/queue";

export const dynamic = "force-dynamic";

/**
 * GET Handler: Meta Webhook Verification Handshake
 * Validates hub.mode, hub.verify_token, and responds with hub.challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = await getMetaConfig();

  // Validate mode and verify token
  if (mode === "subscribe" && token && token === config.verifyToken) {
    console.log("Meta webhook subscription verified successfully.");
    await addMetaSyncLog({
      type: "WEBHOOK_EVENT",
      status: "SUCCESS",
      message: "Meta Webhook aboneliği başarıyla doğrulandı (Handshake OK).",
    });

    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("Meta webhook verification failed. Token mismatch or invalid mode.");
  return new NextResponse("Forbidden - Token mismatch", { status: 403 });
}

/**
 * POST Handler: Ingestion of incoming Lead Ads events
 * Verifies X-Hub-Signature-256, responds 200 immediately, and queues background processing
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    const config = await getMetaConfig();

    // Verify HMAC-SHA256 signature
    const isValidSignature = verifyMetaSignature(
      rawBody,
      signature,
      config.appSecret
    );

    if (!isValidSignature) {
      console.error("Meta Webhook: Invalid X-Hub-Signature-256 header!");
      await addMetaSyncLog({
        type: "WEBHOOK_EVENT",
        status: "FAILED",
        message: "Geçersiz X-Hub-Signature-256 imzası. İstek reddedildi.",
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Process leadgen changes
    let queuedCount = 0;
    if (payload.object === "page" && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        const pageId = entry.id;
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === "leadgen") {
            const val = change.value || {};
            const leadgenId = String(val.leadgen_id || "");
            const formId = String(val.form_id || "");
            const adId = val.ad_id ? String(val.ad_id) : undefined;
            const adsetId = val.adgroup_id ? String(val.adgroup_id) : undefined;
            const campaignId = val.campaign_id ? String(val.campaign_id) : undefined;
            const createdTime = val.created_time
              ? new Date(val.created_time * 1000).toISOString()
              : new Date().toISOString();

            if (leadgenId) {
              enqueueLeadgenEvent({
                leadgenId,
                formId,
                adId,
                adsetId,
                campaignId,
                pageId,
                createdTime,
              });
              queuedCount++;
            }
          }
        }
      }
    }

    // Return HTTP 200 immediately to Meta
    return NextResponse.json(
      {
        success: true,
        received: true,
        queued: queuedCount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Meta Webhook Handler Error:", err);
    // Still return 200 or 500 depending on error, but return fast
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
