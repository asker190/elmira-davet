import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

import { mockBlogPosts } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Düğün & Etkinlik Rehberi | Elmira Davet Blog",
  description:
    "En yeni düğün trendleri, organizasyon ipuçları ve evlilik hazırlığı rehberleri.",
};

export default async function BlogPage() {
  const dbPosts = await prisma.blogPost
    .findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    })
    .catch(() => []);

  const posts = dbPosts.length > 0 ? dbPosts : mockBlogPosts;

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          İlham & İpuçları
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-text-primary">
          Düğün Rehberi & Blog
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          Düğün hazırlıklarından trend konseptlere, müzik seçiminden mekan tüyolarına kadar merak ettiğiniz her şey.
        </p>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm bg-bg-secondary rounded-3xl border border-border">
            Henüz yayınlanmış bir blog yazısı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl bg-bg-secondary border border-border overflow-hidden flex flex-col justify-between hover:border-gold/40 transition-all duration-300 group shadow-card"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative h-56 w-full bg-surface overflow-hidden">
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface">
                        <BookOpen className="w-8 h-8 text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <time dateTime={post.publishedAt?.toISOString()}>
                        {post.publishedAt
                          ? formatDate(post.publishedAt)
                          : formatDate(post.createdAt)}
                      </time>
                    </div>

                    <h2 className="text-xl font-heading text-text-primary group-hover:text-gold transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold font-semibold group/btn"
                  >
                    <span>Yazının Devamını Oku</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
