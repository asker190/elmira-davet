"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Filter,
  Sun,
  Moon,
} from "lucide-react";
import { setCalendarDayStatus } from "../actions";

export type EventTimeSlot = "DAY" | "NIGHT" | "FULL";

interface CalendarEvent {
  id?: string;
  date: string; // YYYY-MM-DD
  hall: "Kristal Salon" | "Kır Bahçesi" | "Tüm Salonlar";
  status: "BLOCKED" | "OPTIONED" | "FREE";
  slot?: EventTimeSlot; // DAY: 13:00-17:00 | NIGHT: 19:00-23:00 | FULL
  note?: string;
  clientName?: string;
}

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
}

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isPending, startTransition] = useTransition();

  // Current calendar view state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedHall, setSelectedHall] = useState<
    "Tüm Salonlar" | "Kristal Salon" | "Kır Bahçesi"
  >("Tüm Salonlar");

  // Modal state for editing a day & slot
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalHall, setModalHall] = useState<
    "Kristal Salon" | "Kır Bahçesi" | "Tüm Salonlar"
  >("Kristal Salon");
  const [modalSlot, setModalSlot] = useState<EventTimeSlot>("NIGHT");
  const [modalStatus, setModalStatus] = useState<
    "BLOCKED" | "OPTIONED" | "FREE"
  >("BLOCKED");
  const [modalNote, setModalNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Open modal for day
  const handleDayClick = (dayNumber: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, dayNumber);
    setSelectedDate(dateStr);

    const hall = selectedHall === "Tüm Salonlar" ? "Kristal Salon" : selectedHall;
    setModalHall(hall);

    // Look for existing events on this date and hall
    const existing = events.filter(
      (e) => e.date === dateStr && (e.hall === hall || e.hall === "Tüm Salonlar")
    );

    const hasNight = existing.some((e) => e.slot === "NIGHT" || e.slot === "FULL");
    const hasDay = existing.some((e) => e.slot === "DAY" || e.slot === "FULL");

    // Suggest default available slot
    if (!hasDay && hasNight) {
      setModalSlot("DAY");
      setModalStatus("BLOCKED");
      setModalNote("");
    } else if (hasDay && !hasNight) {
      setModalSlot("NIGHT");
      setModalStatus("BLOCKED");
      setModalNote("");
    } else if (existing.length > 0) {
      const first = existing[0];
      setModalSlot(first.slot || "NIGHT");
      setModalStatus(first.status);
      setModalNote(first.note || "");
    } else {
      setModalSlot("NIGHT");
      setModalStatus("BLOCKED");
      setModalNote("");
    }

    setIsModalOpen(true);
  };

  // Submit day update
  const handleSave = () => {
    if (!selectedDate) return;

    startTransition(async () => {
      try {
        const res = await setCalendarDayStatus({
          date: selectedDate,
          hall: modalHall,
          status: modalStatus,
          slot: modalSlot,
          note: modalNote,
        });

        if (res.success) {
          toast.success(
            modalStatus === "FREE"
              ? `${selectedDate} (${modalSlot === "DAY" ? "Gündüz" : "Akşam"}) seansı boşaltıldı`
              : `${selectedDate} (${modalSlot === "DAY" ? "Gündüz" : "Akşam"}) durumu kaydedildi`
          );

          setEvents((prev) => {
            const filtered = prev.filter(
              (e) =>
                !(
                  e.date === selectedDate &&
                  (e.hall === modalHall || modalHall === "Tüm Salonlar") &&
                  (modalSlot === "FULL" || e.slot === modalSlot || e.slot === "FULL")
                )
            );
            if (modalStatus !== "FREE") {
              filtered.push({
                id: "cal_" + Date.now(),
                date: selectedDate,
                hall: modalHall,
                slot: modalSlot,
                status: modalStatus,
                note: modalNote,
              });
            }
            return filtered;
          });

          setIsModalOpen(false);
        } else {
          toast.error(res.error || "İşlem başarısız");
        }
      } catch {
        toast.error("Bir hata oluştu");
      }
    });
  };

  const handleSetFree = () => {
    if (!selectedDate) return;

    startTransition(async () => {
      try {
        const res = await setCalendarDayStatus({
          date: selectedDate,
          hall: modalHall,
          status: "FREE",
          slot: modalSlot,
        });

        if (res.success) {
          toast.success(`${selectedDate} müsait olarak ayarlandı`);
          setEvents((prev) =>
            prev.filter(
              (e) =>
                !(
                  e.date === selectedDate &&
                  (e.hall === modalHall || modalHall === "Tüm Salonlar") &&
                  (modalSlot === "FULL" || e.slot === modalSlot)
                )
            )
          );
          setIsModalOpen(false);
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Current month stats
  const currentMonthEvents = events.filter((e) => {
    const [y, m] = e.date.split("-").map(Number);
    return y === currentYear && m === currentMonth + 1;
  });

  const blockedCount = currentMonthEvents.filter((e) => e.status === "BLOCKED").length;
  const optionedCount = currentMonthEvents.filter((e) => e.status === "OPTIONED").length;
  const totalSlotsInMonth = daysInMonth * 2; // 2 slots per day (Day & Night)
  const occupiedSlots = blockedCount;
  const occupancyRate = totalSlotsInMonth > 0 ? Math.round((occupiedSlots / totalSlotsInMonth) * 100) : 0;

  // Selected date existing events for modal
  const selectedDateEvents = selectedDate
    ? events.filter(
        (e) =>
          e.date === selectedDate &&
          (e.hall === modalHall || modalHall === "Tüm Salonlar") &&
          e.status !== "FREE"
      )
    : [];

  return (
    <div className="space-y-6">
      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Bu Ay Dolu Seanslar</span>
            <div className="w-2.5 h-2.5 rounded-full bg-error" />
          </div>
          <div className="text-2xl font-bold font-mono text-cream mt-1">{blockedCount} Seans</div>
          <p className="text-[11px] text-text-muted mt-0.5">Kesinleşen organizasyon</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Opsiyonlu Seanslar</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{optionedCount} Seans</div>
          <p className="text-[11px] text-text-muted mt-0.5">Görüşme sürecinde</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Maks. Günlük Kapasite</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="text-2xl font-bold font-mono text-cream mt-1">2 Seans / Gün</div>
          <p className="text-[11px] text-text-muted mt-0.5">13:00-17:00 & 19:00-23:00</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Aylık Doluluk Oranı</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-gold mt-1">%{occupancyRate}</div>
          <div className="w-full bg-bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* CALENDAR CONTROLS & HALL TABS */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
            >
              Bugün
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-heading font-bold text-cream">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
          </div>
        </div>

        {/* Hall Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-bg-secondary p-1 rounded-xl border border-border overflow-x-auto">
          {(["Tüm Salonlar", "Kristal Salon", "Kır Bahçesi"] as const).map((hall) => {
            const isSelected = selectedHall === hall;
            return (
              <button
                key={hall}
                onClick={() => setSelectedHall(hall)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gold text-bg-primary font-semibold shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-surface"
                }`}
              >
                {hall}
              </button>
            );
          })}
        </div>
      </div>

      {/* CALENDAR MONTH GRID */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAY_NAMES.map((d, i) => (
            <div
              key={d}
              className={`text-xs font-semibold uppercase tracking-wider py-1 ${
                i >= 5 ? "text-gold" : "text-text-muted"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-28 sm:h-32 rounded-xl bg-bg-secondary/40 border border-border/40 opacity-30"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateString(currentYear, currentMonth, dayNum);
            const isCurrentToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === dayNum;

            const dayEvents = events.filter((e) => {
              if (e.date !== dateStr) return false;
              if (selectedHall === "Tüm Salonlar") return true;
              return e.hall === selectedHall || e.hall === "Tüm Salonlar";
            });

            const daySlotEvent = dayEvents.find((e) => e.slot === "DAY");
            const nightSlotEvent = dayEvents.find((e) => e.slot === "NIGHT");
            const fullSlotEvent = dayEvents.find((e) => e.slot === "FULL");

            const isFullyBooked =
              fullSlotEvent?.status === "BLOCKED" ||
              (daySlotEvent?.status === "BLOCKED" && nightSlotEvent?.status === "BLOCKED");

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(dayNum)}
                className={`h-28 sm:h-32 p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:border-gold hover:shadow-md ${
                  isCurrentToday
                    ? "bg-gold/10 border-gold/50"
                    : isFullyBooked
                    ? "bg-error/5 border-error/25 hover:border-error/60"
                    : "bg-bg-secondary border-border hover:bg-surface"
                }`}
              >
                {/* Header: Day number + status badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono rounded-md px-1.5 py-0.5 ${
                      isCurrentToday
                        ? "bg-gold text-bg-primary"
                        : "text-text-primary group-hover:text-gold"
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1">
                    {isFullyBooked ? (
                      <span className="text-[9px] font-bold text-error bg-error/20 px-1 py-0.2 rounded border border-error/30 uppercase">
                        Tam Dolu
                      </span>
                    ) : dayEvents.length > 0 ? (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                        {dayEvents.length}/2
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>

                {/* Day Seans Badges (Max 2 Slots) */}
                <div className="space-y-1 overflow-y-auto max-h-20 text-[10px]">
                  {/* Gündüz Seansı */}
                  {daySlotEvent ? (
                    <div
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate flex items-center gap-1 ${
                        daySlotEvent.status === "BLOCKED"
                          ? "bg-error/20 text-error border border-error/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                      title={`Gündüz (13:00-17:00): ${daySlotEvent.note || "Dolu"}`}
                    >
                      <Sun className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                      <span className="truncate">Gündüz: {daySlotEvent.note || "Dolu"}</span>
                    </div>
                  ) : fullSlotEvent ? null : (
                    <div className="text-[9px] text-emerald-400/60 font-mono px-1 py-0.2 rounded bg-emerald-500/5 border border-emerald-500/10 truncate">
                      ☀️ 13-17: Boş
                    </div>
                  )}

                  {/* Akşam Seansı */}
                  {nightSlotEvent ? (
                    <div
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate flex items-center gap-1 ${
                        nightSlotEvent.status === "BLOCKED"
                          ? "bg-error/20 text-error border border-error/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                      title={`Akşam (19:00-23:00): ${nightSlotEvent.note || "Dolu"}`}
                    >
                      <Moon className="w-2.5 h-2.5 shrink-0 text-indigo-400" />
                      <span className="truncate">Akşam: {nightSlotEvent.note || "Dolu"}</span>
                    </div>
                  ) : fullSlotEvent ? null : (
                    <div className="text-[9px] text-emerald-400/60 font-mono px-1 py-0.2 rounded bg-emerald-500/5 border border-emerald-500/10 truncate">
                      🌙 19-23: Boş
                    </div>
                  )}

                  {/* Tüm Gün Kapatılmışsa */}
                  {fullSlotEvent && (
                    <div className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">Tüm Gün Özel Kiralama</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Gündüz Seansı: 13:00 - 17:00</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Akşam Seansı: 19:00 - 23:00</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-error/30 border border-error/50 inline-block" />
              <span>Dolu (Kapora Alındı)</span>
            </div>
          </div>
          <div className="text-text-secondary text-[11px]">
            * Aynı salonda bir günde en fazla 2 organizasyon düzenlenebilir.
          </div>
        </div>
      </div>

      {/* DAY & SLOT STATUS MODAL */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">Tarih ve Seans Düzenle</h3>
                <p className="text-xs text-gold font-mono">{selectedDate}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Existing bookings summary on this day */}
            {selectedDateEvents.length > 0 && (
              <div className="p-3 rounded-xl bg-bg-secondary border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Bu Tarihteki Mevcut Kayıtlar ({selectedDateEvents.length}/2):
                </span>
                {selectedDateEvents.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface border border-border/60"
                  >
                    <div className="flex items-center gap-2">
                      {evt.slot === "DAY" ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span className="font-medium text-cream">
                        {evt.slot === "DAY" ? "13:00 - 17:00 (Gündüz)" : "19:00 - 23:00 (Akşam)"}
                      </span>
                      <span className="text-text-muted text-[11px]">- {evt.note || evt.clientName || "Dolu"}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        evt.status === "BLOCKED"
                          ? "bg-error/20 text-error"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {evt.status === "BLOCKED" ? "Dolu" : "Opsiyonlu"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {/* Salon Seçimi */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Salon Seçimi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Kristal Salon", "Kır Bahçesi", "Tüm Salonlar"] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setModalHall(h)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium text-center border transition-all cursor-pointer ${
                        modalHall === h
                          ? "bg-gold/15 text-gold border-gold font-semibold"
                          : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seans / Saat Dilimi Seçimi */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Seans / Saat Dilimi (Maksimum 2 Etkinlik)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalSlot("DAY")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalSlot === "DAY"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500 font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gündüz (13-17)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalSlot("NIGHT")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalSlot === "NIGHT"
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500 font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Akşam (19-23)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalSlot("FULL")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalSlot === "FULL"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500 font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Tüm Gün (2 Seans)</span>
                  </button>
                </div>
              </div>

              {/* Durum Seçimi */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Müsaitlik Durumu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalStatus("BLOCKED")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalStatus === "BLOCKED"
                        ? "bg-error/20 text-error border-error font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Dolu
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalStatus("OPTIONED")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalStatus === "OPTIONED"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500 font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Opsiyonlu
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalStatus("FREE")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      modalStatus === "FREE"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Müsait
                  </button>
                </div>
              </div>

              {/* Not / Açıklama */}
              {modalStatus !== "FREE" && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Not / Çift İsmi / Organizasyon Bilgisi
                  </label>
                  <input
                    type="text"
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="Örn: Büşra & Tolga Düğün / 500 Kişi"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleSetFree}
                disabled={isPending}
                className="px-3 py-2 text-xs text-text-muted hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Seansı Boşalt
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-gold text-bg-primary hover:opacity-95 shadow-gold transition-opacity cursor-pointer"
                >
                  {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
