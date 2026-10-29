import { prisma } from "@/lib/prisma";
import { deleteBlogPost } from "../actions";
import { Trash2, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BlogCreateForm } from "./blog-create-form";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Blog Yazıları Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Düğün ipuçları, organizasyon rehberleri ve duyurularınızı buradan yayınlayın.
        </p>
      </div>

      {/* Create Post Form */}
      <BlogCreateForm />

      {/* Posts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading text-text-primary">
          Kayıtlı Blog Yazıları ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary rounded-2xl border border-border text-sm">
            Henüz eklenmiş bir blog yazısı bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl bg-bg-secondary border border-border overflow-hidden">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {post.status === "PUBLISHED" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                        Yayında
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        Taslak
                      </span>
                    )}
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-base font-heading text-text-primary">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    <span>Görüntüle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <form
                    action={async () => {
                      "use server";
                      await deleteBlogPost(post.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                      title="Yazıyı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
