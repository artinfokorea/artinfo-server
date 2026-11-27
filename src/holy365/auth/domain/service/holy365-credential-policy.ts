const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string | null | undefined): string | null {
  const email = (value ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;

  return email;
}

/** 8~64자, 영문과 숫자를 각각 하나 이상 */
export function isValidPassword(value: string | null | undefined): boolean {
  const password = value ?? '';
  if (password.length < 8 || password.length > 64) return false;

  return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export function normalizeDisplayName(value: string | null | undefined): string | null {
  const name = (value ?? '').trim();
  if (!name || name.length > 30) return null;

  return name;
}
