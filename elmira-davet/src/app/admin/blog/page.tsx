import { prisma } from "@/lib/prisma";
import { createBlogPost, deleteBlogPost } from "../actions";
import { PlusCircle, Trash2, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { formatDate, slugify } from "@/lib/utils";
import Link from "next/link";

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
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
        <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-gold" />
          <span>Yeni Blog Yazısı Ekle</span>
        </h3>

        <form
          action={async (formData: FormData) => {
            "use server";
            const title = formData.get("title") as string;
            const slug = (formData.get("slug") as string) || slugify(title);
            const excerpt = (formData.get("excerpt") as string) || undefined;
            const content = formData.get("content") as string;
            const coverImageUrl = (formData.get("coverImageUrl") as string) || undefined;
            const status = (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT";

            await createBlogPost({
              title,
              slug,
              excerpt,
              content,
              coverImageUrl,
              status,
            });
          }}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Yazı Başlığı *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Örn: 2026 Yılının En Popüler Düğün Konseptleri"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Yayın Durumu
              </label>
              <select
                name="status"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              >
                <option value="PUBLISHED">Doğrudan Yayınla</option>
                <option value="DRAFT">Taslak Olarak Kaydet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                URL Slug (Boş bırakılırsa otomatik oluşur)
              </label>
              <input
                type="text"
                name="slug"
                placeholder="2026-dugun-konseptleri"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Kapak Görseli URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Kısa Özet (Listede ve arama sonuçlarında gösterilir)
            </label>
            <textarea
              name="excerpt"
              rows={2}
              placeholder="Yazının 1-2 cümlelik kısa özeti..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Yazı İçeriği (HTML / Paragraflar) *
            </label>
            <textarea
              name="content"
              required
              rows={6}
              placeholder="<h2>Alt Başlık</h2><p>Yazı paragrafları buraya...</p>"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none font-mono text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yazıyı Kaydet</span>
            </button>
          </div>
        </form>
      </div>

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
