/**
 * Elmira Davet - PHP Headless REST API İstemcisi
 * Next.js frontend ve Admin paneli ile PHP Backend arasındaki köprü
 */

const getApiBaseUrl = (): string => {
  // 1. Tarayıcıda çalışıyorsa
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost:8000";
  }
  // 2. Sunucu tarafında (Server Components / Server Actions) çalışıyorsa
  return process.env.PHP_API_URL || process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost:8000";
};

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchFromPhp<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // JSON Body varsa Content-Type ekle
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Token ekle
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: options.cache || "no-store",
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "PHP API sunucusuna bağlanılamadı",
    };
  }
}

export const phpApi = {
  // ─── Sayfalar (Pages) ──────────────────────────────────
  async getPages(status: string = "ALL", search?: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return fetchFromPhp(`/pages?${params.toString()}`);
  },

  async getPageById(id: string) {
    return fetchFromPhp(`/pages/${id}`);
  },

  async getPageBySlug(slug: string) {
    const encoded = slug === "" ? "anasayfa" : encodeURIComponent(slug);
    return fetchFromPhp(`/pages/by-slug/${encoded}`);
  },

  async savePage(id: string, payload: any, token?: string) {
    return fetchFromPhp(`/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
  },

  async createPage(payload: any, token?: string) {
    return fetchFromPhp("/pages", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },

  async trashPage(id: string, token?: string) {
    return fetchFromPhp(`/pages/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async publishPage(id: string, token?: string) {
    return fetchFromPhp(`/pages/${id}/publish`, {
      method: "POST",
      token,
    });
  },

  // ─── Site Ayarları ─────────────────────────────────────
  async getSettings() {
    return fetchFromPhp("/settings");
  },

  async updateSettings(settings: Record<string, any>, token?: string) {
    return fetchFromPhp("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
      token,
    });
  },

  // ─── Hero Slaytları ────────────────────────────────────
  async getHeroSlides() {
    return fetchFromPhp("/hero-slides");
  },

  // ─── Paketler ──────────────────────────────────────────
  async getPackages() {
    return fetchFromPhp("/packages");
  },

  // ─── Galeri ────────────────────────────────────────────
  async getGallery() {
    return fetchFromPhp("/gallery");
  },

  // ─── Yorumlar ──────────────────────────────────────────
  async getTestimonials() {
    return fetchFromPhp("/testimonials");
  },

  // ─── Rezervasyon Gönderimi ─────────────────────────────
  async submitReservation(payload: any) {
    return fetchFromPhp("/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ─── CRM & Talepler (Leads) ─────────────────────────────
  async getLeads(status?: string, source?: string, search?: string, token?: string) {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.set("status", status);
    if (source && source !== "ALL") params.set("source", source);
    if (search) params.set("search", search);
    return fetchFromPhp(`/leads?${params.toString()}`, { token });
  },

  async createLead(payload: any, token?: string) {
    return fetchFromPhp("/leads", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },

  async updateLeadStatus(id: string, status: string, notes?: string, bookingDetails?: any, token?: string) {
    return fetchFromPhp(`/leads/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes, bookingDetails }),
      token,
    });
  },

  async deleteLead(id: string, token?: string) {
    return fetchFromPhp(`/leads/${id}`, {
      method: "DELETE",
      token,
    });
  },

  // ─── Takvim (Calendar) ──────────────────────────────────
  async getCalendarEvents() {
    return fetchFromPhp("/calendar");
  },
};
