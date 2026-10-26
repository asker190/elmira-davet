"use server";

import { prisma } from "@/lib/prisma";
import { reservationSchema, type ReservationFormData } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isDatabaseReachable, getSafeSetting, setSafeSetting } from "@/lib/local-store";
import { sendMetaConversionsApiEvent } from "@/lib/meta/capi";

export async function submitReservation(
  data: ReservationFormData & { eventId?: string; etkConsent?: boolean }
) {
  // ─── 1. Rate Limiting by IP ───
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "anonymous";

  const isAllowed = checkRateLimit(`res_${ip}`, 5, 60 * 1000);
  if (!isAllowed) {
    return {
      success: false,
      error: "Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.",
    };
  }

  // ─── 2. Validate Form with Zod ───
  const parsed = reservationSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Lütfen formu eksiksiz doldurun.";
    return {
      success: false,
      error: errorMsg,
    };
  }

  const { fullName, email, phone, eventDate, eventType, guestCount, message, kvkkConsent, timeSlot } =
    parsed.data;

  const now = new Date();
  const userAgent = headerList.get("user-agent") || undefined;
  const isOnline = await isDatabaseReachable();

  // ─── 3. Check Blocked Date ───
  if (isOnline) {
    try {
      const selectedDate = new Date(eventDate);
      const isBlocked = await prisma.blockedDate.findFirst({
        where: {
          date: {
            gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (isBlocked) {
        return {
          success: false,
          error: "Seçtiğiniz tarih doludur. Lütfen farklı bir tarih seçiniz.",
        };
      }
    } catch {}
  }

  // ─── 4. Save Reservation & KVKK Records ───
  let reservationId = "res_" + Date.now();

  if (isOnline) {
    try {
      const reservation = await prisma.reservation.create({
        data: {
          fullName,
          email,
          phone,
          eventDate: new Date(eventDate),
          eventType,
          guestCount: guestCount || null,
          message: message || null,
          kvkkConsent: Boolean(kvkkConsent),
          kvkkConsentDate: now,
          status: "PENDING",
        },
      });
      reservationId = reservation.id;

      // Log KVKK Consent Record for legal audit
      await prisma.kvkkConsent
        .create({
          data: {
            fullName,
            email,
            consentText: `KVKK Aydınlatma Metni kabul edildi.${data.etkConsent ? " Ticari Elektronik İleti (ETK) onayı verildi." : ""}`,
            ipAddress: ip,
            userAgent,
            consentDate: now,
          },
        })
        .catch(() => {});
    } catch (dbErr) {
      console.warn("DB save failed, falling back to local store:", dbErr);
    }
  }

  // Always backup to safe local store for fault-tolerance
  try {
    const rawLocal = await getSafeSetting("reservations");
    let localReservations: any[] = [];
    if (rawLocal) {
      try {
        localReservations = JSON.parse(rawLocal);
      } catch {}
    }

    localReservations.unshift({
      id: reservationId,
      fullName,
      email,
      phone,
      eventDate,
      timeSlot: timeSlot || "NIGHT",
      eventType,
      guestCount,
      message,
      kvkkConsent: Boolean(kvkkConsent),
      etkConsent: Boolean(data.etkConsent),
      ipAddress: ip,
      createdAt: now.toISOString(),
      status: "PENDING",
    });

    await setSafeSetting("reservations", JSON.stringify(localReservations));
  } catch {}

  // ─── 5. Meta Conversions API (CAPI) Integration ───
  const eventId = data.eventId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Send server-side event asynchronously
  sendMetaConversionsApiEvent({
    eventName: "Lead",
    eventId,
    eventSourceUrl: headerList.get("referer") || undefined,
    userData: {
      email,
      phone,
      clientIp: ip !== "anonymous" ? ip : undefined,
      clientUserAgent: userAgent,
    },
    customData: {
      contentName: `${eventType} Teklif Talebi`,
      contentCategory: "Rezervasyon",
      currency: "TRY",
      value: guestCount ? guestCount * 400 : 100000,
      guestCount,
      eventDate,
    },
  }).catch((err) => console.error("Error dispatching Meta CAPI:", err));

  revalidatePath("/admin");
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin/talepler");

  return {
    success: true,
    reservationId,
    eventId,
  };
}
