import { prisma } from "@/lib/prisma";
import {
  createPackage,
  deletePackage,
  togglePackageFeatured,
} from "../actions";
import { PlusCircle, Trash2, Star, Check, Package as PackageIcon } from "lucide-react";
import { formatPrice, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    include: {
      features: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Etkinlik Paketleri Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Düğün, nişan, kına ve kurumsal etkinlik paketlerini, fiyatlarını ve içeriklerini buradan yönetin.
        </p>
      </div>

      {/* Create Package Form */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
        <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-gold" />
          <span>Yeni Paket Ekle</span>
        </h3>

        <form
          action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const slug = (formData.get("slug") as string) || slugify(name);
            const description = formData.get("description") as string;
            const priceRaw = formData.get("price") as string;
            const price = priceRaw ? parseFloat(priceRaw) : null;
            const priceLabel = (formData.get("priceLabel") as string) || null;
            const imageUrl = (formData.get("imageUrl") as string) || null;
            const isFeatured = formData.get("isFeatured") === "on";

            // Features entered line by line
            const featuresRaw = formData.get("features") as string;
            const features = featuresRaw
              ? featuresRaw
                  .split("\n")
                  .map((f) => f.trim())
                  .filter(Boolean)
              : [];

            await createPackage({
              name,
              slug,
              description,
              price,
              priceLabel,
              imageUrl,
              isFeatured,
              features,
            });
          }}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Paket Adı *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Örn: Platin Düğün Paketi"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                URL Slug (Boş bırakılırsa otomatik oluşur)
              </label>
              <input
                type="text"
                name="slug"
                placeholder="platin-dugun-paketi"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Görsel URL (İsteğe bağlı)
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Fiyat (₺ cinsinden rakam)
              </label>
              <input
                type="number"
                name="price"
                placeholder="250000"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Özel Fiyat Metni (Varsa)
              </label>
              <input
                type="text"
                name="priceLabel"
                placeholder="Örn: Fiyat için arayınız"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                className="w-4 h-4 rounded text-gold bg-surface border-border focus:ring-gold"
              />
              <label
                htmlFor="isFeatured"
                className="text-sm text-text-secondary cursor-pointer"
              >
                Öne Çıkarılan Paket (Ana sayfada vurgulanır)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Paket Açıklaması *
            </label>
            <textarea
              name="description"
              required
              rows={2}
              placeholder="Paketin kısa ve etkileyici açıklaması..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Paket Özellikleri (Her satıra bir özellik yazınız)
            </label>
            <textarea
              name="features"
              rows={4}
              placeholder={"500 kişilik salon\nCanlı orkestra\nLüks pasta ikramı\nÜcretsiz vale"}
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none font-mono text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Paketi Oluştur</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Packages List */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading text-text-primary">
          Mevcut Paketler ({packages.length})
        </h3>

        {packages.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary rounded-2xl border border-border text-sm">
            Henüz eklenmiş bir paket bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-2xl bg-bg-secondary border p-6 flex flex-col justify-between transition-colors relative ${
                  pkg.isFeatured ? "border-gold/50 shadow-gold" : "border-border"
                }`}
              >
                {pkg.isFeatured && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-gold text-bg-primary flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    Öne Çıkan
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <PackageIcon className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wider uppercase">
                      Paket
                    </span>
                  </div>
                  <h4 className="text-xl font-heading text-text-primary">
                    {pkg.name}
                  </h4>
                  <div className="mt-3 pb-3 border-b border-border">
                    <span className="text-2xl font-heading text-gradient-gold font-bold">
                      {pkg.priceLabel || formatPrice(pkg.price ? Number(pkg.price) : null)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Features list */}
                  {pkg.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {pkg.features.map((feat) => (
                        <li
                          key={feat.id}
                          className="flex items-start gap-2 text-xs text-text-secondary"
                        >
                          <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card actions */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <form
                    action={async () => {
                      "use server";
                      await togglePackageFeatured(pkg.id, !pkg.isFeatured);
                    }}
                  >
                    <button
                      type="submit"
                      className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        pkg.isFeatured
                          ? "bg-gold/10 text-gold border-gold/30"
                          : "bg-surface text-text-muted border-border hover:text-text-primary"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${pkg.isFeatured ? "fill-current" : ""}`} />
                      <span>{pkg.isFeatured ? "Öne Çıkarıldı" : "Öne Çıkar"}</span>
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deletePackage(pkg.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                      title="Paketi Sil"
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
