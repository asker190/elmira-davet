export type PageStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "TRASH";

export type RevisionType = "AUTOSAVE" | "MANUAL" | "PUBLISH" | "RESTORE";

export type BlockType =
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "gallery"
  | "hall_cards"
  | "packages"
  | "counters"
  | "testimonials"
  | "faq"
  | "reservation_form"
  | "map"
  | "columns"
  | "button_cta"
  | "video"
  | "spacer_divider"
  | "saved_block"
  | "custom_html";

export interface BlockMotionConfig {
  animation:
    | "none"
    | "fade"
    | "slide-up"
    | "slide-left"
    | "slide-right"
    | "zoom"
    | "mask"
    | "text-reveal";
  duration: number; // 0.2 - 2.0 sn
  delay: number; // 0.0 - 2.0 sn
  trigger: "viewport" | "load";
  once: boolean;
  stagger?: number;
  parallaxSpeed?: number; // 0.0 - 1.0 (sadece hero ve image)
}

export interface BlockVisibilityConfig {
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export interface BlockLayoutConfig {
  align?: "left" | "center" | "right";
  contentWidth?: "narrow" | "normal" | "full";
  paddingY?: "none" | "small" | "medium" | "large" | "xlarge";
  background?: {
    type: "none" | "color" | "gradient" | "image";
    value?: string;
  };
}

export interface BlockNode {
  id: string; // uuid
  type: BlockType;
  schemaVersion: number;
  attrs: Record<string, any>;
  children?: BlockNode[]; // Sütunlar gibi iç içe bloklar için (en fazla 2 seviye)
  motion?: BlockMotionConfig;
  visibility?: BlockVisibilityConfig;
  layout?: BlockLayoutConfig;
  anchorId?: string; // #bolum-adi
}

export interface PageSeoConfig {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  parentId?: string | null;
  parent?: { id: string; title: string; slug: string } | null;
  children?: PageData[];
  template: string;
  menuOrder: number;
  isSystem: boolean;
  systemKey?: string | null;
  content: BlockNode[];
  schemaVersion: number;
  version: number; // Eşzamanlılık (Optimistic locking)
  featuredImageId?: string | null;
  seo?: PageSeoConfig | null;
  authorId?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lock?: PageLockData | null;
}

export interface PageRevisionData {
  id: string;
  pageId: string;
  title: string;
  content: BlockNode[];
  authorId?: string | null;
  authorName?: string | null;
  type: RevisionType;
  createdAt: string;
}

export interface PageLockData {
  pageId: string;
  userId: string;
  userName: string;
  expiresAt: string;
}

export interface RedirectData {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  pageId?: string | null;
  createdAt: string;
}

export interface SavedBlockData {
  id: string;
  name: string;
  category: string;
  content: BlockNode;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
