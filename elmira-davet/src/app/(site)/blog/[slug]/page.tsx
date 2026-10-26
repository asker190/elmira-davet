import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft, CalendarCheck2, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

import { mockBlogPosts } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findUnique({
      where: { slug },
    })
    .catch(() => mockBlogPosts.find((p) => p.slug === slug));

  if (!post) {
    return { title: "Yazı Bulunamadı | Elmira Davet" };
  }

  return {
    title: `${post.title} | Elmira Davet Blog`,
    description: post.excerpt || "Elmira Davet Düğün Salonu Blog Yazısı",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post = await prisma.blogPost
    .findUnique({
      where: { slug },
    })
    .catch(() => null);

  if (!post) {
    post = mockBlogPosts.find((p) => p.slug === slug) ?? null;
  }

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article className="pt-28 pb-20 space-y-12">
      {/* Post Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-secondary hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Blog Yazılarına Dön</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-text-primary leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt
                ? formatDate(post.publishedAt)
                : formatDate(post.createdAt)}
            </time>
          </span>
          <span>•</span>
          <span className="text-gold">Elmira Davet Editör Ekibi</span>
        </div>
      </header>

      {/* Featured Cover Image */}
      {post.coverImageUrl && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[360px] sm:h-[480px] rounded-3xl overflow-hidden border border-border shadow-elevated">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-invert prose-gold max-w-none text-text-secondary text-base leading-relaxed space-y-6 [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-heading [&_h3]:text-gold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-text-secondary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Card */}
        <div className="mt-16 p-8 rounded-3xl bg-bg-secondary border border-gold/40 text-center space-y-4 shadow-elevated">
          <h3 className="text-2xl font-heading text-gradient-gold">
            Hayalinizdeki Düğünü Birlikte Planlayalım
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            Elmira Davet Salonu ayrıcalıklarını yerinde görmek ve tarihinizi rezerve
            etmek için bize ulaşın.
          </p>
          <div className="pt-2">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Randevu Alın</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
