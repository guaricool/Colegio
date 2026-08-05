export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatVes(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(amount).replace('VES', 'Bs.');
}

export function formatDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function cleanPhoneForWhatsapp(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '58' + cleaned.substring(1);
  } else if (!cleaned.startsWith('58') && cleaned.length === 10) {
    cleaned = '58' + cleaned;
  }
  return cleaned;
}

export function buildWhatsappLink(phone: string, message: string): string {
  const formattedPhone = cleanPhoneForWhatsapp(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
