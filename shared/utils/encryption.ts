import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Object containing encrypted data and initialization vector
 */
export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = randomBytes(16);
  const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || '', 'base64');
  
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (256 bits) when decoded');
  }
  
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Ensure we return strings, not Buffer objects
  const encryptedString = encrypted + '.' + cipher.getAuthTag().toString('base64');
  const ivString = iv.toString('base64');
  
  return {
    encryptedData: encryptedString,
    iv: ivString
  };
}

/**
 * Decrypts data that was encrypted using AES-256-GCM
 * @param encryptedData - The encrypted data string in format "encrypted.authTag"
 * @param iv - The initialization vector used for encryption
 * @returns The decrypted text
 */
export function decrypt(encryptedData: string, iv: string): string {
  // Handle case where encryptedData might be a stringified Buffer object
  let actualEncryptedData = encryptedData;

  try {
    // If it's a stringified Buffer object, parse and convert it
    if (typeof encryptedData === 'string' && encryptedData.includes('"type":"Buffer"')) {
      const bufferObj = JSON.parse(encryptedData);
      if (bufferObj.type === 'Buffer' && Array.isArray(bufferObj.data)) {
        actualEncryptedData = Buffer.from(bufferObj.data).toString();
      }
    }
  } catch (e) {
    // If parsing fails, use the original string
    console.warn('Failed to parse potential Buffer object:', e);
  }

  if (!actualEncryptedData.includes('.')) {
    throw new Error('Invalid encrypted data format. Expected "encrypted.authTag"');
  }

  const [encrypted, authTag] = actualEncryptedData.split('.');
  
  if (!encrypted || !authTag) {
    throw new Error('Missing encrypted data or authentication tag');
  }

  const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || '', 'base64');
  
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (256 bits) when decoded');
  }
  
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 