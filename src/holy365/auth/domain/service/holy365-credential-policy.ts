const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string | null | undefined): string | null {
  const email = (value ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;

  return email;
}

export function normalizeDisplayName(value: string | null | undefined): string | null {
  const name = (value ?? '').trim();
  if (!name || name.length > 30) return null;

  return name;
}
