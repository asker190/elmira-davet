import { getAllPages } from "@/lib/cms/page-service";
import { PagesListClient } from "./pages-list-client";

export const metadata = {
  title: "Tüm Sayfalar | Elmira Davet Yönetim Paneli",
  description: "Web sitesindeki tüm sayfaları WordPress mantığında yönetin, düzenleyin ve yayınlayın.",
};

export const dynamic = "force-dynamic";

export default async function AdminSayfalarPage() {
  const allActive = await getAllPages({ status: "ALL" });
  const trashed = await getAllPages({ status: "TRASH" });
  const allCombined = [...allActive, ...trashed];

  const counts = {
    all: allActive.length,
    published: allCombined.filter((p) => p.status === "PUBLISHED").length,
    draft: allCombined.filter((p) => p.status === "DRAFT").length,
    scheduled: allCombined.filter((p) => p.status === "SCHEDULED").length,
    pendingReview: allCombined.filter((p) => p.status === "PENDING_REVIEW").length,
    trash: trashed.length,
  };

  return (
    <div className="space-y-6">
      <PagesListClient initialPages={allActive} initialCounts={counts} />
    </div>
  );
}

