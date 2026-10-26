import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret =
    process.env.META_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    "elmira-davet-meta-aes-key-32bytes-secret";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plain text string (e.g. Meta Page Access Token or App Secret)
 * Returns format: "iv:authTag:encryptedHex"
 */
export function encryptToken(text: string): string {
  if (!text) return "";
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

/**
 * Decrypts a token encrypted with encryptToken()
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return "";
  if (!encryptedText.includes(":")) {
    // Plain text fallback (e.g. before initial encryption)
    return encryptedText;
  }

  try {
    const [ivHex, tagHex, contentHex] = encryptedText.split(":");
    if (!ivHex || !tagHex || !contentHex) return encryptedText;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    let decrypted = decipher.update(contentHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return encryptedText;
  }
}

/**
 * Mask token for display in the UI (e.g. "EAAB...3F8a")
 */
export function maskToken(token: string): string {
  if (!token) return "";
  if (token.length <= 10) return "••••••••";
  return `${token.substring(0, 6)}••••••••${token.substring(token.length - 4)}`;
}
