import { CalendarClient } from "./calendar-client";
import { getCalendarEvents } from "@/lib/crm/crm-service";

export const metadata = {
  title: "Müsaitlik Takvimi | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  const events = await getCalendarEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream flex items-center gap-2.5">
          <span>Müsaitlik Takvimi</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-semibold font-sans">
            Gündüz & Akşam Seansları
          </span>
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Salonların gün bazında doluluk ve opsiyon durumlarını görüntüleyin. Bir günde aynı salona en fazla 2 etkinlik (13:00-17:00 Gündüz ve 19:00-23:00 Akşam) tanımlanabilir.
        </p>
      </div>

      <CalendarClient initialEvents={events as any} />
    </div>
  );
}
