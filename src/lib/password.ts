/**
 * Password strength validation — Morya Designs
 * Used on BOTH client (browser) and server (API route).
 * No imports needed — pure functions only.
 */

export interface PasswordCheck {
  minLength: boolean;   // >= 8 chars
  hasUpper: boolean;    // A-Z
  hasLower: boolean;    // a-z
  hasNumber: boolean;   // 0-9
  hasSpecial: boolean;  // !@#$%^&*()_-+=
}

const SPECIAL_RE = /[!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?`~]/;

export function checkPassword(password: string): PasswordCheck {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: SPECIAL_RE.test(password),
  };
}

export function isPasswordStrong(password: string): boolean {
  const c = checkPassword(password);
  return c.minLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial;
}

/** 0 = empty, 1 = weak, 2 = medium, 3 = strong */
export function passwordStrengthLevel(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const c = checkPassword(password);
  const passed = [c.minLength, c.hasUpper, c.hasLower, c.hasNumber, c.hasSpecial].filter(Boolean).length;
  if (passed <= 2) return 1;
  if (passed <= 4) return 2;
  return 3;
}

export const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (e.g. Morya@2026).";