import { getSafeSetting, setSafeSetting } from "@/lib/local-store";
import { MetaSyncLog } from "./types";
import { ingestMetaLead } from "./lead-service";

interface QueueItem {
  id: string;
  leadgenId: string;
  formId: string;
  adId?: string;
  adsetId?: string;
  campaignId?: string;
  pageId?: string;
  createdTime?: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  lastError?: string;
}

const inMemoryQueue: QueueItem[] = [];
let isProcessing = false;

export async function addMetaSyncLog(log: Omit<MetaSyncLog, "id" | "timestamp">) {
  try {
    const settingValue = await getSafeSetting("meta_sync_logs");

    let logs: MetaSyncLog[] = [];
    if (settingValue) {
      try {
        logs = JSON.parse(settingValue);
      } catch {}
    }

    const newLog: MetaSyncLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log,
    };

    logs.unshift(newLog);
    if (logs.length > 100) logs = logs.slice(0, 100);

    await setSafeSetting("meta_sync_logs", JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to write meta sync log:", err);
  }
}

export async function getMetaSyncLogs(): Promise<MetaSyncLog[]> {
  try {
    const settingValue = await getSafeSetting("meta_sync_logs");
    if (settingValue) {
      return JSON.parse(settingValue);
    }
  } catch {}
  return [];
}

/**
 * Enqueues a leadgen event for background processing.
 * Returns immediately so webhook responds with 200 within milliseconds.
 */
export function enqueueLeadgenEvent(payload: {
  leadgenId: string;
  formId: string;
  adId?: string;
  adsetId?: string;
  campaignId?: string;
  pageId?: string;
  createdTime?: string;
}) {
  const item: QueueItem = {
    id: `queue_${payload.leadgenId}_${Date.now()}`,
    ...payload,
    attempts: 0,
    maxAttempts: 3,
    nextRetryAt: Date.now(),
  };

  inMemoryQueue.push(item);

  // Trigger non-blocking worker
  setTimeout(() => {
    processQueue().catch((err) =>
      console.error("Background lead queue worker error:", err)
    );
  }, 10);
}

/**
 * Worker that processes queued lead items with retry logic
 */
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (inMemoryQueue.length > 0) {
      const now = Date.now();
      const itemIndex = inMemoryQueue.findIndex((i) => i.nextRetryAt <= now);
      if (itemIndex === -1) break;

      const item = inMemoryQueue.splice(itemIndex, 1)[0];
      item.attempts += 1;

      try {
        const result = await ingestMetaLead({
          leadgenId: item.leadgenId,
          formId: item.formId,
          adId: item.adId,
          adsetId: item.adsetId,
          campaignId: item.campaignId,
          pageId: item.pageId,
          createdTime: item.createdTime,
          importedVia: "WEBHOOK",
        });

        await addMetaSyncLog({
          type: "WEBHOOK_EVENT",
          status: "SUCCESS",
          leadgenId: item.leadgenId,
          message: result.isDuplicate
            ? `Lead (#${item.leadgenId}) zaten kayıtlı, tekrar eklenmedi (Deduplication).`
            : `Lead (#${item.leadgenId} - ${result.lead.fullName}) başarıyla sisteme aktarıldı.`,
          details: {
            fullName: result.lead.fullName,
            phone: result.lead.phone,
            campaign: result.lead.campaignName,
          },
          attemptCount: item.attempts,
        });
      } catch (err: any) {
        item.lastError = err.message || "Bilinmeyen hata";

        if (item.attempts < item.maxAttempts) {
          // Exponential backoff: 5s, 20s, 60s
          const delayMs = Math.pow(item.attempts, 2) * 5000;
          item.nextRetryAt = Date.now() + delayMs;
          inMemoryQueue.push(item);

          await addMetaSyncLog({
            type: "WEBHOOK_EVENT",
            status: "RETRYING",
            leadgenId: item.leadgenId,
            message: `Lead detayı çekilemedi (${item.attempts}/${item.maxAttempts}). ${Math.round(delayMs / 1000)} sn sonra tekrar denenecek. Hata: ${item.lastError}`,
            attemptCount: item.attempts,
          });
        } else {
          await addMetaSyncLog({
            type: "WEBHOOK_EVENT",
            status: "FAILED",
            leadgenId: item.leadgenId,
            message: `Lead detayı ${item.maxAttempts} deneme sonrasında alınamadı. Hata: ${item.lastError}`,
            details: { error: item.lastError },
            attemptCount: item.attempts,
          });
        }
      }
    }
  } finally {
    isProcessing = false;
  }
}
