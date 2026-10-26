import { prisma } from "@/lib/prisma";
import { createTestimonial, deleteTestimonial } from "../actions";
import { PlusCircle, Trash2, Star, MessageSquareQuote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Müşteri Yorumları Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Düğün ve etkinlik sahiplerinin deneyimlerini, referanslarını ve puanlarını buradan yönetin.
        </p>
      </div>

      {/* Add Testimonial Form */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
        <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-gold" />
          <span>Yeni Müşteri Yorumu Ekle</span>
        </h3>

        <form
          action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const eventType = (formData.get("eventType") as string) || undefined;
            const content = formData.get("content") as string;
            const rating = Number(formData.get("rating")) || 5;

            await createTestimonial({
              name,
              eventType,
              content,
              rating,
            });
          }}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Müşteri / Çift Adı *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Örn: Ayşe & Murat Yıldız"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Etkinlik Türü
              </label>
              <input
                type="text"
                name="eventType"
                placeholder="Düğün, Nişan, Kına vb."
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Puanlama (Yıldız)
              </label>
              <select
                name="rating"
                defaultValue="5"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 Yıldız - Mükemmel)</option>
                <option value="4">⭐⭐⭐⭐ (4 Yıldız - Çok İyi)</option>
                <option value="3">⭐⭐⭐ (3 Yıldız - İyi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Yorum / Deneyim Metni *
            </label>
            <textarea
              name="content"
              required
              rows={3}
              placeholder="Müşterinizin salon ve hizmet hakkındaki güzel sözleri..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yorumu Ekle</span>
            </button>
          </div>
        </form>
      </div>

      {/* Testimonials Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading text-text-primary">
          Mevcut Yorumlar ({testimonials.length})
        </h3>

        {testimonials.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary rounded-2xl border border-border text-sm">
            Henüz eklenmiş bir müşteri yorumu bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between hover:border-gold/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? "text-gold fill-current"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    {item.eventType && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-text-secondary border border-border">
                        {item.eventType}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="font-heading text-text-primary text-sm font-medium">
                    {item.name}
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      await deleteTestimonial(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                      title="Yorumu Sil"
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
