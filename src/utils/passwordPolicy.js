export function validateOwnerPassword(password, email = '') {
  const value = typeof password === 'string' ? password : '';
  const localPart = String(email).split('@')[0]?.toLowerCase();
  const checks = {
    length: value.length >= 12,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    identity: !localPart || localPart.length < 4 || !value.toLowerCase().includes(localPart),
  };
  return { valid: Object.values(checks).every(Boolean), checks };
}
