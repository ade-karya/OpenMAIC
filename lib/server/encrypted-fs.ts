/**
 * Encrypted File I/O
 *
 * Encrypts JSON data at rest using AES-256-GCM so that volume-mounted files
 * cannot be read in plain text via Docker Desktop or other file browsers.
 *
 * The encryption key is derived from the DATA_ENCRYPTION_KEY env var.
 * If the env var is not set, files are stored in plain JSON (dev mode).
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const MAGIC = Buffer.from('ENCR'); // 4-byte file header to detect encrypted files

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) return null;
  // Derive a 32-byte key from the env var using SHA-256
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptedWrite(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const jsonStr = JSON.stringify(data, null, 2);
  const key = getKey();

  if (!key) {
    // No encryption key → plain JSON (development)
    fs.writeFileSync(filePath, jsonStr, 'utf8');
    return;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // File format: MAGIC(4) + IV(16) + TAG(16) + ENCRYPTED_DATA
  const output = Buffer.concat([MAGIC, iv, tag, encrypted]);

  // Atomic write
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, output);
  fs.renameSync(tmpPath, filePath);
}

export function encryptedRead<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath);

    // Check if file is encrypted (starts with MAGIC header)
    if (raw.length >= MAGIC.length && raw.subarray(0, MAGIC.length).equals(MAGIC)) {
      const key = getKey();
      if (!key) {
        console.error('[encrypted-fs] File is encrypted but DATA_ENCRYPTION_KEY is not set');
        return fallback;
      }

      const iv = raw.subarray(MAGIC.length, MAGIC.length + IV_LENGTH);
      const tag = raw.subarray(MAGIC.length + IV_LENGTH, MAGIC.length + IV_LENGTH + TAG_LENGTH);
      const encrypted = raw.subarray(MAGIC.length + IV_LENGTH + TAG_LENGTH);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8'));
    }

    // Plain JSON file (unencrypted / dev mode)
    return JSON.parse(raw.toString('utf8'));
  } catch (error) {
    console.error(`[encrypted-fs] Failed to read ${filePath}:`, error);
    return fallback;
  }
}
