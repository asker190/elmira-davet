import { prisma } from "@/lib/prisma";
import { isDatabaseReachable, getSafeSetting, setSafeSetting } from "@/lib/local-store";
import type { RedirectData } from "./types";

// ─── Local Redirect Storage Helpers ───────────────────────
async function getLocalRedirects(): Promise<RedirectData[]> {
  try {
    const raw = await getSafeSetting("cms_redirects");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

async function saveLocalRedirects(redirects: RedirectData[]): Promise<void> {
  await setSafeSetting("cms_redirects", JSON.stringify(redirects));
}

// ─── Register Redirect on Slug Change (PG-S-02) ────────────

export async function registerPageRedirect(
  pageId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  const normalizedFrom = oldPath.startsWith("/") ? oldPath : `/${oldPath}`;
  const normalizedTo = newPath.startsWith("/") ? newPath : `/${newPath}`;

  if (normalizedFrom === normalizedTo) return;

  const now = new Date();
  const redirectId = `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (await isDatabaseReachable()) {
    try {
      // 1. Break loops: If newPath already redirects to normalizedFrom, remove it (A -> B -> A)
      await prisma.redirect.deleteMany({
        where: {
          OR: [
            { fromPath: normalizedFrom },
            { fromPath: normalizedTo, toPath: normalizedFrom },
          ],
        },
      });

      // 2. Create the new 301 redirect
      await prisma.redirect.create({
        data: {
          id: redirectId,
          fromPath: normalizedFrom,
          toPath: normalizedTo,
          statusCode: 301,
          pageId,
          createdAt: now,
        },
      });
    } catch (err) {
      console.warn("DB redirect create error, fallback to local:", err);
    }
  }

  // Local store update
  const local = await getLocalRedirects();
  const filtered = local.filter(
    (r) =>
      r.fromPath !== normalizedFrom &&
      !(r.fromPath === normalizedTo && r.toPath === normalizedFrom)
  );

  filtered.unshift({
    id: redirectId,
    fromPath: normalizedFrom,
    toPath: normalizedTo,
    statusCode: 301,
    pageId,
    createdAt: now.toISOString(),
  });

  await saveLocalRedirects(filtered);
}

// ─── Resolve Redirect (Used in Middleware / Route) ─────────

export async function resolveRedirect(path: string): Promise<RedirectData | null> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (await isDatabaseReachable()) {
    try {
      const red = await prisma.redirect.findUnique({
        where: { fromPath: normalizedPath },
      });
      if (red) {
        return {
          id: red.id,
          fromPath: red.fromPath,
          toPath: red.toPath,
          statusCode: red.statusCode,
          pageId: red.pageId,
          createdAt: red.createdAt.toISOString(),
        };
      }
    } catch {}
  }

  const local = await getLocalRedirects();
  return local.find((r) => r.fromPath === normalizedPath) || null;
}

export const getRedirect = resolveRedirect;
