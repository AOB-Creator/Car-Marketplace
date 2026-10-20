import { CarStatus, Customer, OrderStatus } from './models';

export function orderBadge(status: OrderStatus): string {
  switch (status) {
    case 'Yakunlangan':
    case "To'langan":
      return 'badge--success';
    case 'Yangi':
      return 'badge--info';
    case 'Tasdiqlangan':
    case 'Yetkazilmoqda':
      return 'badge--warning';
    case 'Bekor qilingan':
      return 'badge--danger';
  }
}

export function carBadge(status: CarStatus): string {
  return { Sotuvda: 'badge--success', Band: 'badge--warning', Servisda: 'badge--info', Sotilgan: '' }[status];
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

export function avatarBg(c: Pick<Customer, 'avatarHue'>): string {
  return `linear-gradient(135deg, hsl(${c.avatarHue} 55% 55%), hsl(${(c.avatarHue + 40) % 360} 60% 42%))`;
}

export const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
export const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export function tel(phone: string): string {
  return 'tel:' + phone.replace(/\s/g, '');
}
