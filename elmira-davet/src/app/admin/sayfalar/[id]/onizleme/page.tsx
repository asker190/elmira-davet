import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getPageById } from "@/lib/cms/page-service";
import { PublicPageRenderer } from "@/components/site/public-page-renderer";
import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Önizleme | Elmira Davet",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function PagePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let user = session?.user;
  if (!user) {
    if (process.env.NODE_ENV === "development") {
      user = {
        id: "default-admin",
        name: "Yönetici Admin",
        email: "admin@elmiradavet.com",
        role: "ADMIN" as any,
      };
    } else {
      redirect("/admin/giris");
    }
  }

  const page = await getPageById(id);
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-cream">
      {/* Top Preview Banner (PG-P-02) */}
      <div className="sticky top-0 z-50 bg-amber-500/90 text-charcoal-900 px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md backdrop-blur">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 stroke-[2.5]" />
          <span>CANLI ÖNİZLEME MODU — Bu sayfa henüz yayınlanmamış taslak hâlidir.</span>
        </div>
        <Link
          href={`/admin/sayfalar/${page.id}`}
          className="flex items-center gap-1 px-3 py-1 bg-charcoal-900 text-gold rounded-lg hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Editöre Dön</span>
        </Link>
      </div>

      {/* Render with the shared public renderer */}
      <PublicPageRenderer page={page} />
    </div>
  );
}
