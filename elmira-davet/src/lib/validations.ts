import { z } from "zod";

// ─── Reservation Form ────────────────────────────────────

export const reservationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Ad soyad en az 2 karakter olmalıdır")
    .max(100, "Ad soyad en fazla 100 karakter olabilir"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .string()
    .regex(
      /^(\+90|0)?[1-9][0-9]{9}$/,
      "Geçerli bir telefon numarası giriniz (ör: 05XX XXX XX XX)"
    ),
  eventDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return date > new Date();
    },
    { message: "Etkinlik tarihi gelecekte olmalıdır" }
  ),
  timeSlot: z.enum(["DAY", "NIGHT", "FULL"]).default("NIGHT").optional(),
  eventType: z.string().min(1, "Etkinlik türü seçiniz"),
  guestCount: z.coerce
    .number()
    .int()
    .min(10, "Misafir sayısı en az 10 olmalıdır")
    .max(5000, "Misafir sayısı en fazla 5000 olabilir")
    .optional(),
  message: z
    .string()
    .max(1000, "Mesaj en fazla 1000 karakter olabilir")
    .optional(),
  kvkkConsent: z.literal(true, {
    message: "KVKK aydınlatma metnini okuyup onaylamanız gerekmektedir",
  }),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// ─── Login Form ──────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Package Admin ───────────────────────────────────────

export const packageSchema = z.object({
  name: z.string().min(2, "Paket adı en az 2 karakter olmalıdır"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug yalnızca küçük harf, rakam ve tire içerebilir"
    ),
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır"),
  price: z.coerce.number().min(0).optional().nullable(),
  priceLabel: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  features: z.array(z.string()).default([]),
});

export type PackageFormData = z.infer<typeof packageSchema>;

// ─── Hall Admin ──────────────────────────────────────────

export const hallSchema = z.object({
  name: z.string().min(2, "Salon adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug zorunludur"),
  capacity: z.string().min(2, "Kapasite bilgisi giriniz"),
  area: z.string().min(2, "Alan bilgisi giriniz"),
  tagline: z.string().min(2, "Spot başlık giriniz"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  imageUrl: z.string().url("Geçerli bir görsel URL'si giriniz"),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type HallFormData = z.infer<typeof hallSchema>;

// ─── Menu Admin ──────────────────────────────────────────

export const menuSchema = z.object({
  name: z.string().min(2, "Menü adı en az 2 karakter olmalıdır"),
  category: z.string().min(2, "Kategori seçiniz"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  items: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type MenuFormData = z.infer<typeof menuSchema>;

// ─── Event Type Admin ────────────────────────────────────

export const eventTypeSchema = z.object({
  title: z.string().min(2, "Etkinlik adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug zorunludur"),
  desc: z.string().min(5, "Açıklama giriniz"),
  capacity: z.string().min(2, "Kapasite giriniz"),
  iconName: z.string().default("Sparkles"),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;

// ─── FAQ Admin ───────────────────────────────────────────

export const faqSchema = z.object({
  q: z.string().min(5, "Soru en az 5 karakter olmalıdır"),
  a: z.string().min(10, "Cevap en az 10 karakter olmalıdır"),
  category: z.string().default("Genel"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type FaqFormData = z.infer<typeof faqSchema>;

// ─── CRM Lead Admin ──────────────────────────────────────

export const leadCrmSchema = z.object({
  fullName: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır"),
  phone: z.string().min(10, "Telefon numarası giriniz"),
  email: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
  eventDate: z.string().min(1, "Etkinlik tarihi seçiniz"),
  timeSlot: z.enum(["DAY", "NIGHT", "FULL"]).default("NIGHT").optional(),
  eventType: z.string().min(1, "Etkinlik türü seçiniz"),
  hallPreference: z.string().default("Kristal Salon"),
  guestCount: z.coerce.number().int().min(10).optional().nullable(),
  source: z.string().default("Website"),
  status: z.enum(["PENDING", "CONTACTED", "OFFER_SENT", "CONFIRMED", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional().nullable(),
  budget: z.coerce.number().optional().nullable(),
});

export type LeadCrmFormData = z.infer<typeof leadCrmSchema>;

// ─── Calendar Block Admin ────────────────────────────────

export const calendarBlockSchema = z.object({
  date: z.string().min(10, "Tarih seçiniz (YYYY-MM-DD)"),
  hall: z.enum(["Kristal Salon", "Kır Bahçesi", "Tüm Salonlar"]).default("Tüm Salonlar"),
  status: z.enum(["BLOCKED", "OPTIONED", "FREE"]).default("BLOCKED"),
  slot: z.enum(["DAY", "NIGHT", "FULL"]).default("NIGHT"),
  note: z.string().optional().nullable(),
});

export type CalendarBlockFormData = z.infer<typeof calendarBlockSchema>;

// ─── Hero Slide Admin ────────────────────────────────────

export const heroSlideSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Görsel URL giriniz"),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type HeroSlideFormData = z.infer<typeof heroSlideSchema>;

// ─── Testimonial Admin ───────────────────────────────────

export const testimonialSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  eventType: z.string().optional().nullable(),
  content: z.string().min(10, "Yorum en az 10 karakter olmalıdır"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// ─── Site Settings ───────────────────────────────────────

export const siteSettingsSchema = z.object({
  siteName: z.string().optional().default(""),
  logoUrl: z.string().optional(),
  slogan: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  kvkkText: z.string().optional(),
  aboutText: z.string().optional(),
  aboutImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  primaryColor: z.string().optional(),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

// ─── User Admin ──────────────────────────────────────────

export const userCreateSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
