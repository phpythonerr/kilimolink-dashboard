import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export function encrypt(text: string, secretKey: string): string {
  // Generate a random IV
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, Buffer.from(secretKey), iv);

  // Encrypt the data
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the auth tag
  const tag = cipher.getAuthTag();

  // Combine IV, salt, encrypted data, and auth tag
  return Buffer.concat([iv, salt, tag, Buffer.from(encrypted, "hex")]).toString(
    "base64"
  );
}

export function decrypt(encryptedData: string, secretKey: string): string {
  const buffer = Buffer.from(encryptedData, "base64");

  // Extract the pieces
  const iv = buffer.slice(0, IV_LENGTH);
  const salt = buffer.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const tag = buffer.slice(
    IV_LENGTH + SALT_LENGTH,
    IV_LENGTH + SALT_LENGTH + TAG_LENGTH
  );
  const encrypted = buffer.slice(IV_LENGTH + SALT_LENGTH + TAG_LENGTH);

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(secretKey), iv);
  decipher.setAuthTag(tag);

  // Decrypt the data
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
