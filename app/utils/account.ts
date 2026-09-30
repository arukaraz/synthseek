export const ACCOUNT_FIELD_RULES = {
  usernameMin: 3,
  usernameMax: 32,
  passwordMin: 8,
} as const;

export function isValidUsername(username: string): boolean {
  const length = username.trim().length;
  return length >= ACCOUNT_FIELD_RULES.usernameMin && length <= ACCOUNT_FIELD_RULES.usernameMax;
}

export function isValidPassword(password: string): boolean {
  return password.length >= ACCOUNT_FIELD_RULES.passwordMin;
}
