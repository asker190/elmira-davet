import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetaConfig, fetchFormLeads } from "@/lib/meta/client";
import { ingestMetaLead, getAllMetaLeads } from "@/lib/meta/lead-service";
import { addMetaSyncLog } from "@/lib/meta/queue";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  try {
    // ─── Security Check: Require Admin Session or Valid CRON Secret ───
    const session = await auth();
    const authHeader = request.headers.get("authorization");
    const cronHeader = request.headers.get("x-cron-secret");
    const cronSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET;

    const hasValidCronSecret = Boolean(
      cronSecret &&
      ((authHeader && authHeader === `Bearer ${cronSecret}`) ||
       (cronHeader && cronHeader === cronSecret))
    );

    if (!session?.user && !hasValidCronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz erişim (401). Meta senkronizasyonu için admin girişi veya geçerli CRON_SECRET gereklidir.",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const daysBack = daysParam ? parseInt(daysParam, 10) : 7;
    const explicitFormId = searchParams.get("formId");

    const config = await getMetaConfig();
    if (!config.pageAccessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Meta Page Access Token bulunamadı. Lütfen panel ayarlarından kaydedin.",
        },
        { status: 400 }
      );
    }

    // Determine target form IDs
    const formIdsToSync: string[] = [];
    if (explicitFormId) {
      formIdsToSync.push(explicitFormId);
    } else {
      // Find known form IDs from existing leads or page
      const existingLeads = await getAllMetaLeads();
      const knownForms = Array.from(
        new Set(existingLeads.map((l) => l.formId).filter(Boolean))
      );
      if (knownForms.length > 0) {
        formIdsToSync.push(...knownForms);
      }
    }

    if (formIdsToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Kayıtlı Form ID bulunamadı. Lütfen formId parametresi girin veya en az bir webhook kaydı alın.",
        syncedCount: 0,
        newCount: 0,
      });
    }

    let totalFetched = 0;
    let newImported = 0;
    let duplicatesSkipped = 0;

    for (const formId of formIdsToSync) {
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

          if (res.isDuplicate) {
            duplicatesSkipped++;
          } else {
            newImported++;
          }
        }
      } catch (formErr: any) {
        console.error(`Error syncing form ${formId}:`, formErr);
      }
    }

    await addMetaSyncLog({
      type: "MANUAL_SYNC",
      status: "SUCCESS",
      message: `Meta senkronizasyonu tamamlandı. ${totalFetched} kayıt tarandı, ${newImported} yeni talep içeri aktarıldı, ${duplicatesSkipped} mükerrer kayıt atlandı.`,
      details: { daysBack, totalFetched, newImported, duplicatesSkipped },
    });

    return NextResponse.json({
      success: true,
      totalFetched,
      newImported,
      duplicatesSkipped,
      message: `${newImported} yeni lead başarıyla panele aktarıldı.`,
    });
  } catch (err: any) {
    console.error("Meta Sync API Error:", err);
    await addMetaSyncLog({
      type: "MANUAL_SYNC",
      status: "FAILED",
      message: `Meta senkronizasyonu başarısız oldu: ${err.message}`,
    });

    return NextResponse.json(
      { success: false, error: err.message || "Senkronizasyon hatası" },
      { status: 500 }
    );
  }
}
