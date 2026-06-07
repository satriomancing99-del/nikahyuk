export function normalizeWhatsApp(phone: string): string {
  let clean = phone.trim().replace(/[\s\-()]/g, '');
  
  if (clean.startsWith('+62')) {
    clean = '62' + clean.slice(3);
  } else if (clean.startsWith('08')) {
    clean = '628' + clean.slice(2);
  } else if (clean.startsWith('+08')) {
    clean = '628' + clean.slice(3);
  }
  
  clean = clean.replace(/[^0-9]/g, '');
  return clean;
}

export function generateGuestCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
