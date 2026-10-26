"use client";

import { useState } from "react";
import { submitReservation } from "@/app/(site)/actions";
import toast from "react-hot-toast";
import {
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  X,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ReservationFormProps {
  blockedDateStrings?: string[];
  whatsAppNumber?: string;
  kvkkText?: string;
}

export function ReservationForm({
  blockedDateStrings = [],
  whatsAppNumber = "905551234567",
  kvkkText,
}: ReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    fullName: string;
    eventType: string;
    eventDate: string;
    timeSlot?: string;
  } | null>(null);

  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [etkChecked, setEtkChecked] = useState(false);

  // Form field states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<"DAY" | "NIGHT">("NIGHT");
  const [eventType, setEventType] = useState("Düğün");
  const [guestCount, setGuestCount] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kvkkChecked) {
      toast.error("Lütfen KVKK aydınlatma metnini onaylayınız.");
      return;
    }

    if (blockedDateStrings.includes(eventDate)) {
      toast.error("Seçtiğiniz tarih doludur. Lütfen farklı bir gün seçin.");
      return;
    }

    setLoading(true);
    // Deduplication Event ID shared between Client Pixel and Server CAPI
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const result = await submitReservation({
        fullName,
        email,
        phone,
        eventDate,
        timeSlot,
        eventType,
        guestCount: guestCount ? Number(guestCount) : undefined,
        message: message || undefined,
        kvkkConsent: true,
        etkConsent: etkChecked,
        eventId,
      });

      if (!result.success) {
        toast.error(result.error || "Form gönderilemedi.");
      } else {
        toast.success("Rezervasyon talebiniz başarıyla iletildi!");
        setSuccessData({ fullName, eventType, eventDate, timeSlot });

        // Trigger Client-side Meta Pixel Lead Event (only fires if user accepted marketing cookies)
        import("@/components/seo/meta-pixel").then(({ trackClientMetaLead }) => {
          trackClientMetaLead({
            eventId,
            contentName: `${eventType} Teklif Talebi (${timeSlot === "DAY" ? "13:00-17:00" : "19:00-23:00"})`,
            value: guestCount ? Number(guestCount) * 400 : 100000,
          });
        });
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Min date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  if (successData) {
    const slotLabel = successData.timeSlot === "DAY" ? "13:00 - 17:00 Gündüz Seansı" : "19:00 - 23:00 Akşam Seansı";
    const waMessage = `Merhaba, Elmira Davet web sitesi üzerinden randevu talebi oluşturdum. İsmim ${successData.fullName}, ${successData.eventDate} tarihindeki (${slotLabel}) ${successData.eventType} organizasyonumuz için detayları görüşmek istiyorum.`;
    const waUrl = getWhatsAppUrl(whatsAppNumber, waMessage);

    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-bg-secondary border border-gold/40 text-center space-y-6 shadow-elevated">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-heading text-gradient-gold">
            Talebiniz Alındı!
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Sayın <strong>{successData.fullName}</strong>, talebiniz yetkili
            ekibimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp ile Hemen Yazın</span>
          </a>

          <button
            onClick={() => {
              setSuccessData(null);
              setFullName("");
              setEmail("");
              setPhone("");
              setEventDate("");
              setMessage("");
              setKvkkChecked(false);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface hover:bg-surface-hover text-text-secondary text-sm border border-border transition-colors cursor-pointer"
          >
            Yeni Talep Oluştur
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-10 rounded-3xl bg-bg-secondary border border-border shadow-card space-y-6"
      >
        <div className="border-b border-border pb-4">
          <h3 className="text-xl sm:text-2xl font-heading text-text-primary">
            Online Randevu & Teklif Formu
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Hayalinizdeki etkinlik için tarih seçin ve ilk adımı atın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Adınız ve Soyadınız *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ayşe Yılmaz"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Telefon Numaranız *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              E-posta Adresiniz *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Etkinlik Türü *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            >
              <option value="Düğün">Düğün Organizasyonu</option>
              <option value="Nişan & Söz">Nişan & Söz</option>
              <option value="Kına Gecesi">Kına Gecesi</option>
              <option value="Sünnet">Sünnet Düğünü</option>
              <option value="Kurumsal Davet">Kurumsal Davet & Gala</option>
              <option value="Özel Parti">Özel Kutlama & Parti</option>
            </select>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Etkinlik Tarihi *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="date"
                required
                min={minDateStr}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
            {eventDate && blockedDateStrings.includes(eventDate) && (
              <p className="text-xs text-error mt-1">
                ⚠️ Bu tarih maalesef doludur. Lütfen başka bir gün seçin.
              </p>
            )}
          </div>

          {/* Seans / Saat Aralığı */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Saat Aralığı / Seans *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimeSlot("DAY")}
                className={`py-3 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  timeSlot === "DAY"
                    ? "bg-gold/15 border-gold text-gold shadow-sm font-semibold ring-1 ring-gold"
                    : "bg-surface border-border text-text-secondary hover:border-gold/50"
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${timeSlot === "DAY" ? "text-gold" : "text-text-muted"}`} />
                <span>13.00 - 17.00</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot("NIGHT")}
                className={`py-3 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  timeSlot === "NIGHT"
                    ? "bg-gold/15 border-gold text-gold shadow-sm font-semibold ring-1 ring-gold"
                    : "bg-surface border-border text-text-secondary hover:border-gold/50"
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${timeSlot === "NIGHT" ? "text-gold" : "text-text-muted"}`} />
                <span>19.00 - 23.00</span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold" />
              <span>Günde en fazla 2 etkinlik düzenlenmektedir.</span>
            </p>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Tahmini Davetli Sayısı
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                min="10"
                max="5000"
                value={guestCount ?? ""}
                onChange={(e) =>
                  setGuestCount(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Örn: 350"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          {/* Message */}
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Özel Notlarınız & İstekleriniz
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Düşündüğünüz konsept, müzik veya menü detayları..."
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>
        </div>

        {/* KVKK Consent Checkbox */}
        <div className="pt-2 border-t border-border flex items-start gap-3">
          <input
            type="checkbox"
            id="kvkk"
            checked={kvkkChecked}
            onChange={(e) => setKvkkChecked(e.target.checked)}
            required
            className="mt-1 w-4 h-4 rounded text-gold bg-surface border-border focus:ring-gold cursor-pointer"
          />
          <label htmlFor="kvkk" className="text-xs text-text-secondary cursor-pointer leading-relaxed">
            Kişisel verilerimin işlenmesine ilişkin{" "}
            <button
              type="button"
              onClick={() => setKvkkModalOpen(true)}
              className="text-gold underline hover:text-gold-light cursor-pointer font-medium"
            >
              KVKK Aydınlatma Metni
            </button>
            &apos;ni okudum, anladım ve onaylıyorum. *
          </label>
        </div>

        {/* ETK Ticari Elektronik İleti Checkbox (İsteğe Bağlı) */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="etk"
            checked={etkChecked}
            onChange={(e) => setEtkChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-gold bg-surface border-border focus:ring-gold cursor-pointer"
          />
          <label htmlFor="etk" className="text-xs text-text-secondary cursor-pointer leading-relaxed">
            Elmira Davet&apos;in indirim, kampanya ve erken rezervasyon fırsatlarından haberdar olmak için tarafıma SMS ve telefon yoluyla ticari elektronik ileti gönderilmesine onay veriyorum. (İsteğe bağlı)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || (!!eventDate && blockedDateStrings.includes(eventDate))}
          className="w-full py-4 px-6 rounded-full bg-gradient-gold text-bg-primary font-semibold text-sm tracking-wider uppercase hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer shadow-gold flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Gönderiliyor...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Teklif ve Randevu Talebi Gönder</span>
            </>
          )}
        </button>
      </form>

      {/* KVKK Modal */}
      {kvkkModalOpen && (
        <div
          onClick={() => setKvkkModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-elevated"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-lg font-heading text-text-primary">
                  KVKK Aydınlatma Metni
                </h4>
              </div>
              <button
                onClick={() => setKvkkModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
              {kvkkText ||
                `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Elmira Davet Salonu olarak veri sorumlusu sıfatıyla rezervasyon formunda paylaştığınız ad, soyad, telefon ve e-posta bilgileriniz yalnızca randevu talebinizin değerlendirilmesi ve sizinle iletişime geçilmesi amacıyla işlenmektedir. Verileriniz üçüncü kişilerle paylaşılmaz ve yasal saklama süresi sonunda güvenle imha edilir.`}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => {
                  setKvkkChecked(true);
                  setKvkkModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold cursor-pointer"
              >
                Okudum, Onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
