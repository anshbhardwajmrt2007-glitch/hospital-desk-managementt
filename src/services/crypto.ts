/**
 * Secure cryptographic helpers using Web Crypto API.
 * Uses PBKDF2 with SHA-256 and unique per-user salt.
 * No plaintext passwords are ever stored or transmitted.
 */

// Convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Generate a random cryptographically strong salt (16 bytes)
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bufferToHex(salt.buffer);
}

// Hash password with PBKDF2-HMAC-SHA256 (10,000 iterations)
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = hexToBuffer(saltHex);

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 10000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return bufferToHex(derivedKey);
}

// Constant-time-like password verification
export async function verifyPassword(password: string, saltHex: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password, saltHex);
  return computedHash === storedHash;
}

// Generate random UUID
export function generateUUID(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate human-friendly reference numbers (e.g. MD-APT-2024-8192)
export function generateReferenceNumber(prefix: string): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${rand}`;
}
