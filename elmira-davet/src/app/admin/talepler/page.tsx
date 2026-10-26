import { CrmClient } from "./crm-client";
import { getUnifiedCrmLeads } from "@/lib/crm/crm-service";

export const metadata = {
  title: "Talepler & CRM | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminTaleplerPage() {
  const leads = await getUnifiedCrmLeads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream flex items-center gap-2.5">
          <span>Talepler & CRM (Müşteri Havuzu)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-semibold font-sans">
            Ortak Havuz & Meta Senkron
          </span>
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Web sitesi teklif formlarından ve Meta Lead Ads (Instagram/Facebook) reklamlarından gelen tüm talepleri tek listeden yönetin.
        </p>
      </div>

      <CrmClient initialLeads={leads as any} />
    </div>
  );
}
