import { prisma } from "@/lib/prisma";
import {
  deletePackage,
  togglePackageFeatured,
} from "../actions";
import { Trash2, Star, Check, Package as PackageIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PackageCreateForm } from "./package-create-form";

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
      <PackageCreateForm />

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
