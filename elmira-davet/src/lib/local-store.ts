import fs from "fs";
import path from "path";
import net from "net";
import { prisma } from "@/lib/prisma";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// In-memory cache for ultra-fast fallback access
let memoryStore: Record<string, string> = {};
let isStoreLoaded = false;
let dbCheckCache: { isAvailable: boolean; checkedAt: number } | null = null;

/**
 * Checks whether PostgreSQL database server is actually listening and reachable.
 * Caches result for 10 seconds so normal requests don't repeatedly attempt TCP connections.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  const now = Date.now();
  if (dbCheckCache && now - dbCheckCache.checkedAt < 10000) {
    return dbCheckCache.isAvailable;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  let host = "localhost";
  let port = 5432;

  try {
    const match = dbUrl.match(/@([^:]+):(\d+)/);
    if (match) {
      host = match[1];
      port = parseInt(match[2], 10);
    }
  } catch {}

  const reachable = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let hasResolved = false;

    socket.setTimeout(250);

    socket.on("connect", () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on("timeout", () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on("error", () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });

  dbCheckCache = { isAvailable: reachable, checkedAt: now };
  return reachable;
}

let lastStoreMtime = 0;

function ensureStoreLoaded() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const stat = fs.statSync(STORE_FILE);
      if (!isStoreLoaded || stat.mtimeMs > lastStoreMtime) {
        const content = fs.readFileSync(STORE_FILE, "utf-8");
        memoryStore = JSON.parse(content || "{}");
        lastStoreMtime = stat.mtimeMs;
        isStoreLoaded = true;
      }
    } else {
      memoryStore = {};
      isStoreLoaded = true;
    }
  } catch {
    if (!isStoreLoaded) {
      memoryStore = {};
      isStoreLoaded = true;
    }
  }
}

function persistStoreFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    if (fs.existsSync(STORE_FILE)) {
      lastStoreMtime = fs.statSync(STORE_FILE).mtimeMs;
    }
  } catch {}
}

/**
 * Safely gets a stored key-value item.
 * Tries Prisma first only if database is online; otherwise, returns immediately from local file store.
 */
export async function getSafeSetting(key: string): Promise<string | null> {
  ensureStoreLoaded();

  const isDbOnline = await isDatabaseReachable();
  if (isDbOnline) {
    try {
      const res = await prisma.siteSetting
        .findUnique({ where: { key } })
        .catch(() => null);

      if (res?.value) {
        memoryStore[key] = res.value;
        return res.value;
      }
    } catch {}
  }

  // Fallback to local persistent file store
  return memoryStore[key] || null;
}

/**
 * Returns all safely stored settings as a key-value dictionary.
 */
export function getAllSafeSettings(): Record<string, string> {
  ensureStoreLoaded();
  return { ...memoryStore };
}

/**
 * Safely sets a stored key-value item.
 * Saves to local file store immediately, then syncs to Prisma if database is reachable.
 */
export async function setSafeSetting(key: string, value: string): Promise<void> {
  ensureStoreLoaded();
  memoryStore[key] = value;
  persistStoreFile();

  const isDbOnline = await isDatabaseReachable();
  if (isDbOnline) {
    try {
      await prisma.siteSetting
        .upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
        .catch(() => {});
    } catch {}
  }
}
