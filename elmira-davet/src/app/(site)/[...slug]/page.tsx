import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/cms/page-service";
import { getRedirect } from "@/lib/cms/redirect-service";
import { PublicPageRenderer } from "@/components/site/public-page-renderer";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const page = await getPageBySlug(slugPath);

  if (!page || page.status !== "PUBLISHED") {
    return {
      title: "Sayfa Bulunamadı | Elmira Davet",
    };
  }

  const seo = page.seo || {};
  const metaTitle = seo.title || `${page.title} | Elmira Davet`;
  const metaDesc =
    seo.description ||
    "Elmira Davet & Balo Salonları, lüks mimarisi ve zengin organizasyon menüleriyle en özel anlarınızı taçlandırıyor.";

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: seo.canonical || `https://elmiradavet.com/${page.slug}`,
    },
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `https://elmiradavet.com/${page.slug}`,
      siteName: "Elmira Davet & Balo Salonları",
      images: [
        {
          url:
            seo.ogImage ||
            page.featuredImageId ||
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const fullPath = `/${slugPath}`;

  // 1. Check 301 Redirect table (PG-S-02)
  const redirectRule = await getRedirect(fullPath);
  if (redirectRule) {
    permanentRedirect(redirectRule.toPath);
  }

  // 2. Fetch page from database
  const page = await getPageBySlug(slugPath);

  // 3. Status checks: Draft, Scheduled, Pending, Trash -> 404 (PG-O-04)
  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return <PublicPageRenderer page={page} />;
}
