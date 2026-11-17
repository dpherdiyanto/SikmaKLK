/**
 * Kebijakan Kata Sandi SIKMA:
 * Minimal 8 karakter kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol.
 */

export interface PasswordCriteriaResult {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isValid: boolean;
  score: number;
}

export const SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

export function checkPasswordCriteria(password: string): PasswordCriteriaResult {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = SYMBOL_REGEX.test(password);

  const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;
  const isValid = score === 5;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    isValid,
    score
  };
}

export function getPasswordValidationMessage(password: string): string | null {
  if (!password) {
    return 'Kata sandi wajib diisi.';
  }

  const result = checkPasswordCriteria(password);
  if (result.isValid) {
    return null;
  }

  const missing: string[] = [];
  if (!result.minLength) missing.push('minimal 8 karakter');
  if (!result.hasUppercase) missing.push('huruf besar (A-Z)');
  if (!result.hasLowercase) missing.push('huruf kecil (a-z)');
  if (!result.hasNumber) missing.push('angka (0-9)');
  if (!result.hasSymbol) missing.push('simbol/tanda baca (@, #, $, %, dll)');

  return `Kata sandi harus memenuhi: ${missing.join(', ')}.`;
}

/**
 * Membuat kata sandi acak yang memenuhi seluruh kriteria:
 * 8-10 karakter dengan jaminan huruf besar, huruf kecil, angka, dan simbol.
 */
export function generateCompliantPassword(): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';

  // Ensure at least one of each required set
  const guaranteed = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  // Shuffle the characters
  for (let i = guaranteed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guaranteed[i], guaranteed[j]] = [guaranteed[j], guaranteed[i]];
  }

  const result = guaranteed.join('');
  return result;
}

export const PASSWORD_HASH_PREFIX = '$sha256$';

export function isHashedPassword(password?: string | null): boolean {
  if (!password) return false;
  return (
    password.startsWith(PASSWORD_HASH_PREFIX) ||
    password.startsWith('$pbkdf2-sha256$') ||
    password.startsWith('$2a$') ||
    password.startsWith('$2b$') ||
    password.startsWith('$2y$')
  );
}

function generateSaltHex(byteLength = 12): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function pureJsSha256Hex(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);

  const bitLen = bytes.length * 8;
  const padLen = ((bytes.length + 8) % 64 === 0 ? 0 : 64 - ((bytes.length + 8) % 64)) + bytes.length + 8;
  const padded = new Uint8Array(padLen + (padLen === bytes.length + 8 ? 0 : 0));
  const totalLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  void padded;

  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H, (val) => val.toString(16).padStart(8, '0')).join('');
}

async function sha256Hex(message: string): Promise<string> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(message);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return pureJsSha256Hex(message);
    }
  }
  return pureJsSha256Hex(message);
}

/**
 * Menghasilkan hash SHA-256 dengan salt acak per pengguna: $sha256$<salt>$<digest>
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const trimmed = plainPassword;
  if (!trimmed) return '';
  if (isHashedPassword(trimmed)) return trimmed;

  const salt = generateSaltHex(12);
  const digest = await sha256Hex(`${salt}:${trimmed}`);
  return `${PASSWORD_HASH_PREFIX}${salt}$${digest}`;
}

/**
 * Memverifikasi kecocokan password plaintext terhadap password tersimpan (mendukung hash $sha256$ maupun plaintext legacy).
 */
export async function verifyPassword(inputPassword: string, storedPassword?: string | null): Promise<boolean> {
  if (!storedPassword) return false;
  if (storedPassword.startsWith(PASSWORD_HASH_PREFIX)) {
    const parts = storedPassword.split('$');
    // Format: ['', 'sha256', '<salt>', '<digest>']
    if (parts.length !== 4) return false;
    const [, , salt, expectedDigest] = parts;
    if (!salt || !expectedDigest) return false;
    const computed = await sha256Hex(`${salt}:${inputPassword}`);
    return computed === expectedDigest;
  }
  return inputPassword === storedPassword;
}

export function formatHashedPasswordPreview(hashedPassword: string): string {
  if (!isHashedPassword(hashedPassword)) return hashedPassword;
  if (hashedPassword.length <= 22) return hashedPassword;
  return `${hashedPassword.slice(0, 12)}••••${hashedPassword.slice(-6)}`;
}
