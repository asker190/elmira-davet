import { getSafeSetting, setSafeSetting, isDatabaseReachable } from "@/lib/local-store";
import { getAllMetaLeads, saveAllMetaLeads } from "@/lib/meta/lead-service";
import { prisma } from "@/lib/prisma";

export type EventTimeSlot = "DAY" | "NIGHT" | "FULL";

export interface UnifiedLead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  eventDate: string; // YYYY-MM-DD
  timeSlot?: EventTimeSlot; // DAY (13:00-17:00) | NIGHT (19:00-23:00)
  eventType: string;
  hallPreference: string;
  guestCount?: number | null;
  budget?: number | null;
  source: "Meta / Instagram Ads" | "Website" | "Telefon" | "Referans";
  status:
    | "PENDING"
    | "CONTACTED"
    | "OFFER_SENT"
    | "CONFIRMED" // Kapora alındı / Onaylandı
    | "CANCELLED";
  metaStatus?: string; // e.g. "Yeni", "Kapora alındı"
  notes?: string | null;
  isAnonymized?: boolean;
  createdAt: string;
  updatedAt?: string;
  metaLeadgenId?: string;
}

export interface CalendarSlotEvent {
  id: string;
  date: string; // YYYY-MM-DD
  hall: "Kristal Salon" | "Kır Bahçesi" | "Tüm Salonlar";
  slot: EventTimeSlot; // DAY: 13:00-17:00, NIGHT: 19:00-23:00, FULL: 2 slots
  status: "BLOCKED" | "OPTIONED" | "FREE";
  note?: string;
  leadId?: string;
  clientName?: string;
  guestCount?: number;
  updatedAt?: string;
}

/**
 * Normalizes hall name to standard calendar hall
 */
export function normalizeHallName(
  hall?: string
): "Kristal Salon" | "Kır Bahçesi" | "Tüm Salonlar" {
  if (!hall) return "Kristal Salon";
  if (hall.toLowerCase().includes("kır") || hall.toLowerCase().includes("kir")) {
    return "Kır Bahçesi";
  }
  if (hall.toLowerCase().includes("tüm") || hall.toLowerCase().includes("tum")) {
    return "Tüm Salonlar";
  }
  return "Kristal Salon";
}

/**
 * Normalizes time slot from text or form values
 */
export function normalizeTimeSlot(val?: string | null): EventTimeSlot {
  if (!val) return "NIGHT";
  const str = val.toLowerCase();
  if (str.includes("gündüz") || str.includes("gunduz") || str.includes("13:00") || str.includes("day")) {
    return "DAY";
  }
  if (str.includes("tüm gün") || str.includes("full")) {
    return "FULL";
  }
  return "NIGHT";
}

/**
 * Fetches all calendar events safely
 */
export async function getCalendarEvents(): Promise<CalendarSlotEvent[]> {
  const raw = await getSafeSetting("admin_calendar_events");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((e) => ({
          ...e,
          slot: e.slot || "NIGHT",
        }));
      }
    } catch {}
  }

  // Fallback demo events
  const curYear = new Date().getFullYear();
  const curMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  return [
    {
      id: "cal_init_1",
      date: `${curYear}-${curMonth}-14`,
      hall: "Kristal Salon",
      slot: "DAY",
      status: "BLOCKED",
      note: "Büşra & Tolga Düğünü (13:00 - 17:00)",
      clientName: "Büşra & Tolga",
    },
    {
      id: "cal_init_2",
      date: `${curYear}-${curMonth}-14`,
      hall: "Kristal Salon",
      slot: "NIGHT",
      status: "BLOCKED",
      note: "Merve & Can Düğünü (19:00 - 23:00)",
      clientName: "Merve & Can",
    },
    {
      id: "cal_init_3",
      date: `${curYear}-${curMonth}-20`,
      hall: "Kır Bahçesi",
      slot: "NIGHT",
      status: "BLOCKED",
      note: "Selin & Emre Nişanı (19:00 - 23:00)",
      clientName: "Selin & Emre",
    },
  ];
}

/**
 * Saves all calendar events safely
 */
export async function saveCalendarEvents(events: CalendarSlotEvent[]): Promise<void> {
  await setSafeSetting("admin_calendar_events", JSON.stringify(events));

  // Sync to Prisma blockedDate for full days
  if (await isDatabaseReachable()) {
    try {
      // Find days where both slots or FULL slot is booked
      const dateCounts: Record<string, number> = {};
      events.forEach((e) => {
        if (e.status === "BLOCKED") {
          const count = e.slot === "FULL" ? 2 : 1;
          dateCounts[e.date] = (dateCounts[e.date] || 0) + count;
        }
      });

      for (const [dateStr, count] of Object.entries(dateCounts)) {
        if (count >= 2) {
          const dateObj = new Date(dateStr);
          await prisma.blockedDate
            .upsert({
              where: { date: dateObj },
              update: { note: "Tüm Seanslar Dolu (Gündüz ve Akşam)" },
              create: { date: dateObj, note: "Tüm Seanslar Dolu (Gündüz ve Akşam)" },
            })
            .catch(() => {});
        }
      }
    } catch {}
  }
}

/**
 * Synchronizes lead booking into the availability calendar.
 * Automatically marks the day and slot as BLOCKED if Kapora/Confirmed,
 * or removes the slot if cancelled. Enforces max 2 events per salon per day.
 */
export async function syncLeadToCalendar(
  lead: {
    id: string;
    fullName: string;
    eventDate: string;
    hallPreference?: string;
    timeSlot?: EventTimeSlot;
    guestCount?: number | null;
  },
  isBooked: boolean
): Promise<{ success: boolean; message?: string }> {
  if (!lead.eventDate) return { success: false, message: "Etkinlik tarihi bulunamadı" };

  const events = await getCalendarEvents();
  const dateStr = lead.eventDate.split("T")[0];
  const hall = normalizeHallName(lead.hallPreference);
  const slot = lead.timeSlot || "NIGHT";

  // Remove any previous calendar event linked to this lead
  const updatedEvents = events.filter((e) => e.leadId !== lead.id);

  if (isBooked) {
    // Check existing events on this date for this hall
    const existingForHall = updatedEvents.filter(
      (e) => e.date === dateStr && (e.hall === hall || e.hall === "Tüm Salonlar") && e.status === "BLOCKED"
    );

    // Max 2 events per day check:
    const isDayOccupied = existingForHall.some((e) => e.slot === "DAY" || e.slot === "FULL");
    const isNightOccupied = existingForHall.some((e) => e.slot === "NIGHT" || e.slot === "FULL");

    let targetSlot = slot;
    if (slot === "DAY" && isDayOccupied) {
      if (!isNightOccupied) {
        targetSlot = "NIGHT"; // fallback to night if day is full
      } else {
        return {
          success: false,
          message: `${dateStr} tarihinde ${hall} için hem Gündüz hem Akşam seansı doludur. (Maksimum 2 etkinlik sınırına ulaşıldı)`,
        };
      }
    } else if (slot === "NIGHT" && isNightOccupied) {
      if (!isDayOccupied) {
        targetSlot = "DAY"; // fallback to day if night is full
      } else {
        return {
          success: false,
          message: `${dateStr} tarihinde ${hall} için hem Gündüz hem Akşam seansı doludur. (Maksimum 2 etkinlik sınırına ulaşıldı)`,
        };
      }
    }

    const slotLabel = targetSlot === "DAY" ? "13:00 - 17:00 (Gündüz)" : "19:00 - 23:00 (Akşam)";

    updatedEvents.push({
      id: `cal_auto_${lead.id}`,
      date: dateStr,
      hall,
      slot: targetSlot,
      status: "BLOCKED",
      note: `${lead.fullName} (${slotLabel})`,
      clientName: lead.fullName,
      guestCount: lead.guestCount || undefined,
      leadId: lead.id,
      updatedAt: new Date().toISOString(),
    });
  }

  await saveCalendarEvents(updatedEvents);
  return { success: true };
}

/**
 * Returns all unified leads combining Meta Lead Ads, Website Reservations, and CRM
 */
export async function getUnifiedCrmLeads(): Promise<UnifiedLead[]> {
  const unified: UnifiedLead[] = [];
  const seenIds = new Set<string>();

  // 1. Ingest Meta Leads
  try {
    const metaLeads = await getAllMetaLeads();
    for (const m of metaLeads) {
      const isConfirmed = m.status === "Kapora alındı";
      const isCancelled = m.status === "Kaybedildi";
      const status: UnifiedLead["status"] = isConfirmed
        ? "CONFIRMED"
        : isCancelled
        ? "CANCELLED"
        : m.status === "Teklif verildi"
        ? "OFFER_SENT"
        : m.status === "Arandı" || m.status === "Görüşmeye geldi"
        ? "CONTACTED"
        : "PENDING";

      // Detect slot preference from custom answers
      let detectedSlot: EventTimeSlot = "NIGHT";
      const slotAnswer = m.customFields?.find(
        (f) => f.name.includes("saat") || f.name.includes("seans") || f.label.includes("Saat")
      );
      if (slotAnswer) {
        detectedSlot = normalizeTimeSlot(slotAnswer.value);
      }

      unified.push({
        id: m.id || m.leadgenId,
        fullName: m.fullName,
        phone: m.phone,
        email: m.email,
        eventDate: m.eventDate || m.createdTime.split("T")[0],
        timeSlot: detectedSlot,
        eventType: m.eventType || "Düğün & Balo",
        hallPreference: m.hallPreference || "Kristal Salon (600 Kişilik)",
        guestCount: m.guestCount || 400,
        budget: null,
        source: "Meta / Instagram Ads",
        status,
        metaStatus: m.status,
        notes: `Meta Kampanya: ${m.campaignName || "Lead Ads"}\nReklam: ${m.adName || "-"}\nForm: ${m.formName || m.formId}`,
        isAnonymized: m.isAnonymized,
        createdAt: m.createdTime || m.createdAt,
        updatedAt: m.updatedAt,
        metaLeadgenId: m.leadgenId,
      });
      seenIds.add(m.id);
      seenIds.add(m.leadgenId);
    }
  } catch (err) {
    console.error("Error reading Meta Leads for unified CRM:", err);
  }

  // 2. Ingest Website Reservations (from local store or DB)
  try {
    const rawLocalRes = await getSafeSetting("reservations");
    if (rawLocalRes) {
      const localRes = JSON.parse(rawLocalRes);
      if (Array.isArray(localRes)) {
        for (const r of localRes) {
          if (!seenIds.has(r.id)) {
            unified.push({
              id: r.id,
              fullName: r.fullName,
              phone: r.phone,
              email: r.email,
              eventDate: (r.eventDate || "").split("T")[0],
              timeSlot: normalizeTimeSlot(r.timeSlot),
              eventType: r.eventType || "Düğün & Davet",
              hallPreference: r.hallPreference || "Kristal Salon (600 Kişilik)",
              guestCount: r.guestCount || 350,
              budget: null,
              source: "Website",
              status: r.status === "CONFIRMED" ? "CONFIRMED" : r.status === "CANCELLED" ? "CANCELLED" : "PENDING",
              notes: r.message,
              createdAt: r.createdAt || new Date().toISOString(),
              isAnonymized: r.isAnonymized,
            });
            seenIds.add(r.id);
          }
        }
      }
    }
  } catch {}

  // 3. Ingest Prisma DB reservations if online
  if (await isDatabaseReachable()) {
    try {
      const dbReservations = await prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      for (const r of dbReservations) {
        if (!seenIds.has(r.id)) {
          unified.push({
            id: r.id,
            fullName: r.fullName,
            phone: r.phone,
            email: r.email,
            eventDate: r.eventDate.toISOString().split("T")[0],
            timeSlot: "NIGHT",
            eventType: r.eventType || "Düğün",
            hallPreference: "Kristal Salon (600 Kişilik)",
            guestCount: r.guestCount || 400,
            budget: null,
            source: r.eventType?.includes("Meta") ? "Meta / Instagram Ads" : "Website",
            status: r.status === "CONFIRMED" ? "CONFIRMED" : r.status === "CANCELLED" ? "CANCELLED" : "PENDING",
            notes: r.message,
            createdAt: r.createdAt.toISOString(),
          });
          seenIds.add(r.id);
        }
      }
    } catch {}
  }

  // 4. Ingest Manual CRM Leads from admin_crm_leads
  try {
    const rawCrm = await getSafeSetting("admin_crm_leads");
    if (rawCrm) {
      const crmList = JSON.parse(rawCrm);
      if (Array.isArray(crmList)) {
        for (const c of crmList) {
          if (!seenIds.has(c.id)) {
            unified.push({
              ...c,
              timeSlot: normalizeTimeSlot(c.timeSlot),
            });
            seenIds.add(c.id);
          }
        }
      }
    }
  } catch {}

  // Sort descending by creation date
  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
