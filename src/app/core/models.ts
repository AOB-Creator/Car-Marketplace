export type FuelType = 'Benzin' | 'Dizel' | 'Gibrid' | 'Plug-in gibrid' | 'Elektr' | 'Gaz (LPG)' | 'Vodorod';
export type BodyType = 'Sedan' | 'Kupe' | 'Krossover' | 'SUV' | 'Xetchbek' | 'Universal' | 'Sport kupe' | 'Kabriolet';
export type Transmission = 'Avtomat' | 'Mexanika';
export type CarStatus = 'Sotuvda' | 'Band' | 'Sotilgan' | 'Servisda';

export interface CarColor {
  name: string;
  hex: string;
  /** Paint name sent to the render CDN. */
  paint: string;
}

export interface Hotspot {
  label: string;
  /** Percentage coordinates over the car image. */
  x: number;
  y: number;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  rentPerDay: number;
  fuel: FuelType[];
  body: BodyType;
  transmission: Transmission;
  drive: 'AWD' | 'RWD' | 'FWD';
  hp: number;
  torque: number;
  accel: number;
  topSpeed: number;
  engine: string;
  seats: number;
  mileage: number;
  colors: CarColor[];
  /** Identifiers used by the render CDN (imagin.studio). */
  render: { make: string; model: string };
  status: CarStatus;
  rating: number;
  reviews: number;
  distance: number;
  location: string;
  featured?: boolean;
  description: string;
  addedAt: string;
}

export type OrderStatus = 'Yangi' | 'Tasdiqlangan' | "To'langan" | 'Yetkazilmoqda' | 'Yakunlangan' | 'Bekor qilingan';
export type OrderKind = 'Xarid' | 'Ijara' | 'Test-drayv';

export interface Order {
  id: string;
  customerId: string;
  carId: string;
  kind: OrderKind;
  status: OrderStatus;
  amount: number;
  date: string;
  payment: 'Karta' | 'Naqd' | 'Kredit' | 'Lizing';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarHue: number;
  joined: string;
  tier: 'Standart' | 'Gold' | 'Platinum';
}

export interface ChatMessage {
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  carId: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}
