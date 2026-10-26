import { prisma } from "@/lib/prisma";
import {
  updateReservationStatus,
  deleteReservation,
  toggleBlockedDate,
} from "../actions";
import {
  CalendarCheck2,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatDate, getWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const [reservations, blockedDates] = await Promise.all([
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.blockedDate.findMany({
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Rezervasyonlar & Takvim Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Web sitesi randevu formundan gelen talepleri inceleyin, onaylayın ve salonun dolu tarihlerini yönetin.
        </p>
      </div>

      {/* Block Date Tool */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
        <h3 className="text-base font-heading text-text-primary flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          <span>Takvimde Tarih Engelle / Dolu İşaretle</span>
        </h3>
        <p className="text-xs text-text-muted">
          Engellediğiniz tarihler web sitesindeki rezervasyon formunda seçilemez olarak işaretlenir.
        </p>

        <form
          action={async (formData: FormData) => {
            "use server";
            const date = formData.get("date") as string;
            const note = (formData.get("note") as string) || undefined;
            if (date) {
              await toggleBlockedDate(date, note);
            }
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Engellenecek Tarih
            </label>
            <input
              type="date"
              name="date"
              required
              className="px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Not / Etkinlik Bilgisi
            </label>
            <input
              type="text"
              name="note"
              placeholder="Örn: Ahmet & Zeynep Düğün Organizasyonu (Dolu)"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Tarihi Kilitle</span>
          </button>
        </form>

        {/* Currently Blocked Dates */}
        {blockedDates.length > 0 && (
          <div className="pt-3 border-t border-border">
            <span className="text-xs text-text-muted block mb-2 font-medium">
              Dolu / Kilitli Tarihler:
            </span>
            <div className="flex flex-wrap gap-2">
              {blockedDates.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface border border-border text-xs text-text-secondary"
                >
                  <span className="text-gold font-medium">
                    {formatDate(b.date)}
                  </span>
                  {b.note && <span className="text-text-muted">({b.note})</span>}
                  <form
                    action={async () => {
                      "use server";
                      await toggleBlockedDate(b.date.toISOString());
                    }}
                  >
                    <button
                      type="submit"
                      className="text-text-muted hover:text-error ml-1 cursor-pointer"
                      title="Engeli Kaldır"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-gold" />
            <span>Gelen Rezervasyon Talepleri ({reservations.length})</span>
          </h3>
        </div>

        {reservations.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary rounded-2xl border border-border text-sm">
            Henüz alınmış bir rezervasyon başvurusu bulunmuyor.
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const waUrl = getWhatsAppUrl(
                res.phone,
                `Merhaba Sayın ${res.fullName}, Elmira Davet Salonu için yaptığınız ${res.eventType} rezervasyon talebiniz hakkında iletişime geçiyoruz.`
              );

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-bg-secondary border border-border hover:border-border-light transition-colors space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-heading text-text-primary">
                          {res.fullName}
                        </h4>
                        {res.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            <Clock className="w-3 h-3" />
                            Beklemede
                          </span>
                        )}
                        {res.status === "CONFIRMED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Onaylandı
                          </span>
                        )}
                        {res.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-400/10 text-rose-400 border border-rose-400/20">
                            <XCircle className="w-3 h-3" />
                            İptal Edildi
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold" />
                          {res.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gold" />
                          {res.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-text-muted">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          Etkinlik Tarihi:{" "}
                          <strong className="text-text-primary">
                            {formatDate(res.eventDate)}
                          </strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary font-medium">
                          {res.eventType}
                        </span>
                        {res.guestCount && (
                          <span className="text-text-muted">
                            Misafir: {res.guestCount} Kişi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Fast Contact Button */}
                    <div className="flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp Mesajı</span>
                      </a>
                    </div>
                  </div>

                  {/* Message & KVKK Details */}
                  <div className="text-xs space-y-2">
                    {res.message && (
                      <div className="p-3 rounded-xl bg-surface border border-border text-text-secondary leading-relaxed">
                        <strong className="text-text-primary block mb-1">
                          Müşteri Notu:
                        </strong>
                        {res.message}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-text-muted pt-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-gold" />
                        <span>
                          KVKK Açık Rıza Onayı Alındı (Kayıt Tarihi:{" "}
                          {res.kvkkConsentDate
                            ? formatDate(res.kvkkConsentDate)
                            : formatDate(res.createdAt)}
                          )
                        </span>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {res.status !== "CONFIRMED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateReservationStatus(res.id, "CONFIRMED");
                            }}
                          >
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 border border-emerald-400/20 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Onayla
                            </button>
                          </form>
                        )}

                        {res.status !== "PENDING" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateReservationStatus(res.id, "PENDING");
                            }}
                          >
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/20 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Beklemeye Al
                            </button>
                          </form>
                        )}

                        {res.status !== "CANCELLED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateReservationStatus(res.id, "CANCELLED");
                            }}
                          >
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-lg bg-rose-400/10 text-rose-400 hover:bg-rose-400/20 border border-rose-400/20 text-xs font-medium transition-colors cursor-pointer"
                            >
                              İptal Et
                            </button>
                          </form>
                        )}

                        <form
                          action={async () => {
                            "use server";
                            await deleteReservation(res.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer ml-1"
                            title="Talebi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
