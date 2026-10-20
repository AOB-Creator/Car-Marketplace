import { Conversation, Customer, Order, OrderKind, OrderStatus } from '../models';
import { CARS } from './cars.data';

const NAMES = [
  'Aziz Karimov', 'Dilnoza Rahimova', 'Jasur Tursunov', 'Malika Yusupova', 'Sardor Aliyev', 'Nilufar Saidova',
  'Bekzod Ergashev', 'Madina Xolmatova', 'Otabek Nazarov', 'Shahnoza Qodirova', 'Rustam Mirzayev', 'Kamola Ismoilova',
  'Javohir Abdullayev', 'Gulnora Sharipova', 'Temur Hasanov', 'Zarina Umarova', 'Sherzod Fayziyev', 'Lola Murodova',
];
const CITIES = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg‘ona', 'Navoiy', 'Qarshi'];
const TIERS: Customer['tier'][] = ['Standart', 'Gold', 'Standart', 'Platinum', 'Gold', 'Standart'];

function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const CUSTOMERS: Customer[] = NAMES.map((name, i) => {
  const [first, last] = name.toLowerCase().split(' ');
  return {
    id: `c${i + 1}`,
    name,
    email: `${first}.${last}@mail.uz`.replace(/‘/g, ''),
    phone: `+998 9${i % 10} ${100 + i * 37} ${10 + i} ${20 + i * 3}`,
    city: CITIES[i % CITIES.length],
    avatarHue: Math.round(rand(i) * 360),
    joined: new Date(2025, i % 12, 3 + i).toISOString(),
    tier: TIERS[i % TIERS.length],
  };
});

const STATUSES: OrderStatus[] = ['Yangi', 'Tasdiqlangan', "To'langan", 'Yetkazilmoqda', 'Yakunlangan', 'Yakunlangan', 'Bekor qilingan', "To'langan"];
const KINDS: OrderKind[] = ['Xarid', 'Ijara', 'Ijara', 'Test-drayv', 'Xarid'];
const PAYMENTS: Order['payment'][] = ['Karta', 'Kredit', 'Naqd', 'Lizing', 'Karta'];

export const ORDERS: Order[] = Array.from({ length: 64 }, (_, i) => {
  const car = CARS[Math.floor(rand(i + 1) * CARS.length)];
  const kind = KINDS[i % KINDS.length];
  const days = 1 + Math.floor(rand(i + 5) * 9);
  const date = new Date(2026, 9, 20);
  date.setDate(date.getDate() - Math.floor(i * 1.6));
  date.setHours(9 + (i % 10), (i * 17) % 60);
  return {
    id: `#CZ-${(48210 - i).toString()}`,
    customerId: CUSTOMERS[i % CUSTOMERS.length].id,
    carId: car.id,
    kind,
    status: STATUSES[(i * 3) % STATUSES.length],
    amount: kind === 'Xarid' ? car.price : kind === 'Ijara' ? car.rentPerDay * days : 0,
    date: date.toISOString(),
    payment: PAYMENTS[i % PAYMENTS.length],
  };
});

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'm1', customerId: 'c2', carId: CARS[0].id, unread: 2, online: true,
    messages: [
      { from: 'them', text: 'Assalomu alaykum! BMW X5 M hali sotuvdami?', time: '10:12' },
      { from: 'me', text: 'Va alaykum assalom! Ha, Isle of Man yashil rangda mavjud. Test-drayvga yozib qo‘yaymi?', time: '10:14' },
      { from: 'them', text: 'Ha, ertaga soat 15:00 qulay bo‘ladi.', time: '10:16' },
      { from: 'them', text: 'Kredit shartlari haqida ham ma’lumot bersangiz.', time: '10:16' },
    ],
  },
  {
    id: 'm2', customerId: 'c5', carId: CARS[7].id, unread: 0, online: true,
    messages: [
      { from: 'them', text: 'Porsche 911 GTS ni 3 kunga ijaraga olmoqchiman.', time: 'Kecha' },
      { from: 'me', text: 'Albatta! Kuniga $399, sug‘urta narxga kiritilgan.', time: 'Kecha' },
      { from: 'them', text: 'Zo‘r, bron qilaman.', time: 'Kecha' },
    ],
  },
  {
    id: 'm3', customerId: 'c8', carId: CARS[4].id, unread: 1, online: false,
    messages: [
      { from: 'them', text: 'AMG C 63 S mis rangini ko‘rsangiz bo‘ladimi? Video yuborsangiz.', time: 'Du' },
    ],
  },
  {
    id: 'm4', customerId: 'c11', carId: CARS[14].id, unread: 0, online: false,
    messages: [
      { from: 'me', text: 'Tesla Model S yetkazib berildi. Yoqdimi?', time: 'Ya' },
      { from: 'them', text: 'Juda ajoyib, rahmat jamoaga!', time: 'Ya' },
    ],
  },
  {
    id: 'm5', customerId: 'c14', carId: CARS[20].id, unread: 0, online: true,
    messages: [
      { from: 'them', text: 'Land Cruiser 300 uchun trade-in qilsa bo‘ladimi?', time: 'Sh' },
      { from: 'me', text: 'Ha, eski avtomobilingizni baholab beramiz. Qachon kelasiz?', time: 'Sh' },
    ],
  },
];

export const ACTIVITY = [
  { icon: 'cart', text: 'Dilnoza Rahimova BMW X5 M uchun buyurtma berdi', time: '2 daqiqa oldin' },
  { icon: 'key', text: 'Porsche 911 GTS 3 kunga ijaraga berildi', time: '18 daqiqa oldin' },
  { icon: 'card', text: '#CZ-48207 bo‘yicha $82 900 to‘lov qabul qilindi', time: '1 soat oldin' },
  { icon: 'car', text: 'Yangi avtomobil qo‘shildi: Ferrari Roma Spider', time: '3 soat oldin' },
  { icon: 'star', text: 'Sardor Aliyev Audi R8 ga 5 yulduz qo‘ydi', time: 'Kecha' },
];
