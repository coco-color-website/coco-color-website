/**
 * COCO 主理人分身会员认证工具。
 * 纯 Web Crypto API，兼容 Next.js Edge Runtime / Cloudflare Pages。
 */

import { supabase } from "@/lib/supabase";

const TOKEN_VERSION = "v1";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 天
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH_BYTES = 32;

export class CocoAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CocoAuthError";
  }
}

function getTokenSecret(): string {
  const secret = process.env.COCO_TOKEN_SECRET;
  if (!secret) {
    throw new CocoAuthError("COCO_TOKEN_SECRET not set");
  }
  return secret;
}

export function isAlphanumericUsername(username: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(username);
}

function utf8ToBytes(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer;
}

function bytesToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const bin = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): ArrayBuffer {
  const normalized = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0)).buffer;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    PBKDF2_KEY_LENGTH_BYTES * 8
  );
  return `${bytesToBase64Url(salt.buffer)}:${bytesToBase64Url(derived)}`;
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  const [saltB64, hashB64] = hashed.split(":");
  if (!saltB64 || !hashB64) return false;

  let salt: ArrayBuffer;
  try {
    salt = base64UrlToBytes(saltB64);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    PBKDF2_KEY_LENGTH_BYTES * 8
  );
  return bytesToBase64Url(derived) === hashB64;
}

interface TokenPayload {
  v: string;
  u: string;
  exp: number;
}

export async function signCocoToken(username: string): Promise<string> {
  const secret = getTokenSecret();
  const payload: TokenPayload = {
    v: TOKEN_VERSION,
    u: username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const payloadBytes = utf8ToBytes(JSON.stringify(payload));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);

  return `${bytesToBase64Url(payloadBytes)}.${bytesToBase64Url(signature)}`;
}

export async function verifyCocoToken(token: string): Promise<string> {
  const secret = getTokenSecret();
  const parts = token.split(".");
  if (parts.length !== 2) {
    throw new CocoAuthError("Invalid token format");
  }

  const [payloadB64, signatureB64] = parts;
  let payloadBytes: ArrayBuffer;
  let signatureBytes: ArrayBuffer;

  try {
    payloadBytes = base64UrlToBytes(payloadB64);
    signatureBytes = base64UrlToBytes(signatureB64);
  } catch {
    throw new CocoAuthError("Invalid token encoding");
  }

  const key = await importHmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    payloadBytes
  );
  if (!valid) {
    throw new CocoAuthError("Invalid token signature");
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as TokenPayload;
  } catch {
    throw new CocoAuthError("Invalid token payload");
  }

  if (payload.v !== TOKEN_VERSION || !payload.u || !payload.exp) {
    throw new CocoAuthError("Malformed token payload");
  }

  if (Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new CocoAuthError("Token expired");
  }

  if (!supabase) {
    throw new CocoAuthError("Database not configured");
  }

  const { data: student, error } = await supabase
    .from("students")
    .select("username, expires_at")
    .eq("username", payload.u)
    .single();

  if (error || !student) {
    throw new CocoAuthError("User not found");
  }

  if (student.expires_at && new Date(student.expires_at) <= new Date()) {
    throw new CocoAuthError("Membership expired");
  }

  return payload.u;
}
