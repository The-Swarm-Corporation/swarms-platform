import disposableDomains from 'disposable-email-domains';
import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';

export function isDisposableEmail(email: string) {
  const domain = email.split('@')[1].toLowerCase();
  return disposableDomains.includes(domain);
}

interface FingerprintData {
  ip: string;
  userAgent: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
}

export function generateFingerprint(data: FingerprintData): string {
  const fingerprintString = `${data.ip}|${data.userAgent}|${data.timezone || ''}|${data.language || ''}|${data.screenResolution || ''}`;
  const hash = sha256(utf8ToBytes(fingerprintString));
  return bytesToHex(hash);
}
