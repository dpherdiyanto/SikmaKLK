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
