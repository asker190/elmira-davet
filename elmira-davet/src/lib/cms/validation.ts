import { z } from "zod";
import type { BlockType, BlockMotionConfig, BlockNode } from "./types";

// ─── Reserved Slugs ───────────────────────────────────────
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "giris",
  "cikis",
  "_next",
  "static",
  "sitemap",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "login",
  "logout",
  "dashboard",
  "auth",
] as const;

// ─── Slug Generator ───────────────────────────────────────
export function slugifyTurkish(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  return text
    .split("")
    .map((char) => turkishMap[char] || char)
    .join("")
    .toLocaleLowerCase("tr-TR")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── HTML Sanitizer (XSS Prevention) ──────────────────────
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove inline event handlers (onclick, onload, onerror, etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    // Remove javascript: and data: pseudo-protocols from attributes
    .replace(/href\s*=\s*["']\s*(javascript|data):[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']\s*(javascript):[^"']*["']/gi, 'src=""');
}

// ─── Motion Schema ────────────────────────────────────────
export const blockMotionSchema = z.object({
  animation: z.enum([
    "none",
    "fade",
    "slide-up",
    "slide-left",
    "slide-right",
    "zoom",
    "mask",
    "text-reveal",
  ]),
  duration: z.number().min(0.2).max(2.0).default(0.6),
  delay: z.number().min(0).max(2.0).default(0),
  trigger: z.enum(["viewport", "load"]).default("viewport"),
  once: z.boolean().default(true),
  stagger: z.number().min(0).max(1.0).optional(),
  parallaxSpeed: z.number().min(0).max(1.0).optional(),
});

// ─── Visibility & Layout Schema ───────────────────────────
export const blockVisibilitySchema = z.object({
  hideOnDesktop: z.boolean().optional(),
  hideOnTablet: z.boolean().optional(),
  hideOnMobile: z.boolean().optional(),
});

export const blockLayoutSchema = z.object({
  align: z.enum(["left", "center", "right"]).optional(),
  contentWidth: z.enum(["narrow", "normal", "full"]).optional(),
  paddingY: z.enum(["none", "small", "medium", "large", "xlarge"]).optional(),
  background: z
    .object({
      type: z.enum(["none", "color", "gradient", "image"]).default("none"),
      value: z.string().optional(),
    })
    .optional(),
});

// ─── Individual Block Attribute Schemas ───────────────────

export const heroBlockAttrsSchema = z.object({
  title: z.string().min(1, "Hero başlığı zorunludur"),
  subtitle: z.string().optional(),
  videoUrl: z.string().optional(),
  posterUrl: z.string().min(1, "Hero poster görseli zorunludur"),
  locationBadge: z.string().optional(),
  button1Text: z.string().optional(),
  button1Link: z.string().optional(),
  button2Text: z.string().optional(),
  button2Link: z.string().optional(),
  overlayDarkness: z.number().min(0).max(90).default(40),
  parallaxEnabled: z.boolean().default(true),
});

export const headingBlockAttrsSchema = z.object({
  text: z.string().min(1, "Başlık metni zorunludur"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const textBlockAttrsSchema = z.object({
  html: z.string().default("<p></p>"),
  leadText: z.boolean().default(false),
});

export const imageBlockAttrsSchema = z.object({
  url: z.string().min(1, "Görsel seçimi zorunludur"),
  alt: z.string().min(1, "Görsel alt metni SEO ve erişilebilirlik için zorunludur"),
  caption: z.string().optional(),
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "auto"]).default("16:9"),
  zoomOnHover: z.boolean().default(true),
  parallaxEffect: z.boolean().default(false),
  focalPoint: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const galleryBlockAttrsSchema = z.object({
  categorySlug: z.string().default("all"),
  layout: z.enum(["masonry", "grid"]).default("masonry"),
  enableLightbox: z.boolean().default(true),
  limit: z.number().min(3).max(30).default(12),
});

export const hallCardsBlockAttrsSchema = z.object({
  mode: z.enum(["all", "selected"]).default("all"),
  selectedIds: z.array(z.string()).default([]),
  layout: z.enum(["grid", "carousel"]).default("grid"),
  showFeatures: z.boolean().default(true),
});

export const packagesBlockAttrsSchema = z.object({
  mode: z.enum(["all", "selected"]).default("all"),
  selectedIds: z.array(z.string()).default([]),
  showPricing: z.boolean().default(true),
  featuredFirst: z.boolean().default(true),
});

export const countersBlockAttrsSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        duration: z.number().default(2),
      })
    )
    .min(1, "En az bir sayaç eklemelisiniz"),
});

export const testimonialsBlockAttrsSchema = z.object({
  mode: z.enum(["all", "selected"]).default("all"),
  selectedIds: z.array(z.string()).default([]),
  layout: z.enum(["slider", "grid"]).default("slider"),
  limit: z.number().min(1).max(20).default(6),
});

export const faqBlockAttrsSchema = z.object({
  mode: z.enum(["all", "selected"]).default("all"),
  selectedIds: z.array(z.string()).default([]),
  category: z.string().optional(),
  generateSchema: z.boolean().default(true), // FAQPage schema
});

export const reservationFormBlockAttrsSchema = z.object({
  title: z.string().default("Hemen Teklif ve Randevu Alın"),
  subtitle: z.string().default("Özel gününüzü birlikte planlayalım"),
  defaultSlot: z.enum(["DAY", "NIGHT"]).default("NIGHT"),
  requireKvkk: z.literal(true).default(true),
  thankYouMessage: z
    .string()
    .default("Rezervasyon talebiniz başarıyla alındı. Satış danışmanımız en kısa sürede sizinle iletişime geçecektir."),
});

export const mapBlockAttrsSchema = z.object({
  customAddress: z.string().optional(),
  title: z.string().default("Konum & Ulaşım"),
  subtitle: z.string().default("Gaziosmanpaşa merkezde kolay ulaşım"),
  zoomLevel: z.number().min(10).max(20).default(15),
  showDirectionsButton: z.boolean().default(true),
});

export const columnsBlockAttrsSchema = z.object({
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(2),
  gap: z.enum(["small", "medium", "large"]).default("medium"),
});

export const buttonCtaBlockAttrsSchema = z.object({
  text: z.string().min(1, "Buton metni zorunludur"),
  linkType: z.enum(["internal", "external", "phone", "whatsapp", "anchor"]).default("internal"),
  url: z.string().optional(),
  targetPageId: z.string().optional(),
  newTab: z.boolean().default(false),
  variant: z.enum(["gold", "outline", "surface"]).default("gold"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export const videoBlockAttrsSchema = z.object({
  source: z.enum(["youtube", "vimeo", "mp4"]).default("mp4"),
  url: z.string().min(1, "Video URL adresi zorunludur"),
  posterUrl: z.string().optional(),
  autoplaySilent: z.boolean().default(false),
  loop: z.boolean().default(false),
});

export const spacerDividerBlockAttrsSchema = z.object({
  height: z.enum(["small", "medium", "large", "xlarge"]).default("medium"),
  hasLine: z.boolean().default(false),
  lineStyle: z.enum(["solid", "gold", "dashed"]).default("gold"),
});

export const customHtmlBlockAttrsSchema = z.object({
  html: z.string().default(""),
});

export const savedBlockAttrsSchema = z.object({
  savedBlockId: z.string().min(1, "Kayıtlı bölüm seçilmelidir"),
  isDetached: z.boolean().default(false),
});

// ─── Recursive Block Node Schema ──────────────────────────

export const blockNodeSchema: z.ZodType<BlockNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum([
      "hero",
      "heading",
      "text",
      "image",
      "gallery",
      "hall_cards",
      "packages",
      "counters",
      "testimonials",
      "faq",
      "reservation_form",
      "map",
      "columns",
      "button_cta",
      "video",
      "spacer_divider",
      "saved_block",
      "custom_html",
    ]),
    schemaVersion: z.number().default(1),
    attrs: z.record(z.string(), z.any()).default({}),
    children: z.array(blockNodeSchema).max(12).optional(),
    motion: blockMotionSchema.optional(),
    visibility: blockVisibilitySchema.optional(),
    layout: blockLayoutSchema.optional(),
    anchorId: z
      .string()
      .regex(/^[a-z0-9-_]*$/, "Çapa ID yalnızca küçük harf, rakam ve tire içerebilir")
      .optional(),
  })
);

// ─── Page Creation / Update Schema ────────────────────────

export const pageFormSchema = z.object({
  title: z
    .string()
    .min(1, "Sayfa başlığı zorunludur")
    .max(200, "Sayfa başlığı en fazla 200 karakter olabilir"),
  slug: z
    .string()
    .max(100, "Kalıcı bağlantı en fazla 100 karakter olabilir")
    .refine((val) => val === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "Slug yalnızca küçük harf, rakam ve tire içerebilir veya kök sayfa için boş bırakılabilir",
    })
    .refine((val) => val === "" || !RESERVED_SLUGS.includes(val as any), {
      message: "Bu kalıcı bağlantı sistem tarafından ayrılmıştır, kullanılamaz.",
    }),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "TRASH"])
    .default("DRAFT"),
  parentId: z.string().nullable().optional(),
  template: z.enum(["default", "home", "hall_detail", "contact"]).default("default"),
  menuOrder: z.coerce.number().int().default(0),
  isSystem: z.boolean().default(false),
  systemKey: z.string().nullable().optional(),
  content: z.array(blockNodeSchema).default([]),
  featuredImageId: z.string().nullable().optional(),
  seo: z
    .object({
      title: z.string().max(70, "SEO başlığı en fazla 70 karakter olmalıdır").optional(),
      description: z.string().max(160, "SEO açıklaması en fazla 160 karakter olmalıdır").optional(),
      ogImage: z.string().optional(),
      canonical: z.string().optional(),
      noIndex: z.boolean().default(false),
      noFollow: z.boolean().default(false),
    })
    .optional(),
  scheduledAt: z.string().nullable().optional(),
  version: z.number().int().default(1),
});

export type PageFormData = z.infer<typeof pageFormSchema>;
