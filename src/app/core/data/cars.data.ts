import { Car, CarColor } from '../models';

const C = {
  white: { name: 'Alp oqi', hex: '#f2f2f0', paint: 'white' },
  black: { name: 'Sapfir qora', hex: '#111113', paint: 'black' },
  grey: { name: 'Brooklyn kulrang', hex: '#7d858c', paint: 'grey' },
  silver: { name: 'Kumush', hex: '#c4c7cb', paint: 'silver' },
  green: { name: 'Isle of Man yashil', hex: '#1f6b4f', paint: 'green' },
  blue: { name: 'Portimao ko‘k', hex: '#1d4fbf', paint: 'blue' },
  red: { name: 'Toronto qizil', hex: '#b3121d', paint: 'red' },
  copper: { name: 'Mis bronza', hex: '#d39a6a', paint: 'orange' },
  sage: { name: 'Shalfey', hex: '#6e8a80', paint: 'green' },
} satisfies Record<string, CarColor>;

type Seed = Omit<Car, 'id' | 'rating' | 'reviews' | 'distance' | 'addedAt' | 'mileage' | 'status' | 'location' | 'description'> &
  Partial<Pick<Car, 'status' | 'mileage' | 'description'>>;

const LOCATIONS = ['Toshkent, Yunusobod', 'Toshkent, Chilonzor', 'Toshkent, Mirzo Ulug‘bek', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan'];

const seeds: Seed[] = [
  { make: 'BMW', model: 'X5 M', trim: 'Competition', year: 2025, price: 49500, rentPerDay: 189, fuel: ['Benzin', 'Dizel'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 625, torque: 750, accel: 3.9, topSpeed: 290, engine: '4.4L V8 TwinPower Turbo', seats: 5, colors: [C.green, C.black, C.white, C.blue], render: { make: 'bmw', model: 'x5' }, featured: true },
  { make: 'BMW', model: 'X2', trim: 'sDrive20i', year: 2024, price: 36700, rentPerDay: 99, fuel: ['Benzin', 'Dizel'], body: 'Krossover', transmission: 'Avtomat', drive: 'FWD', hp: 170, torque: 280, accel: 8.3, topSpeed: 213, engine: '1.5L 3-silindrli turbo', seats: 5, colors: [C.sage, C.white, C.black], render: { make: 'bmw', model: 'x2' } },
  { make: 'BMW', model: 'M2', trim: 'Coupé', year: 2024, price: 27000, rentPerDay: 129, fuel: ['Dizel'], body: 'Kupe', transmission: 'Avtomat', drive: 'RWD', hp: 460, torque: 400, accel: 4.9, topSpeed: 190, engine: '3.0L I6 TwinPower Turbo', seats: 4, colors: [C.grey, C.blue, C.white], render: { make: 'bmw', model: 'm2' } },
  { make: 'BMW', model: 'M135i', trim: 'xDrive', year: 2025, price: 32600, rentPerDay: 109, fuel: ['Benzin', 'Dizel'], body: 'Xetchbek', transmission: 'Avtomat', drive: 'AWD', hp: 306, torque: 400, accel: 4.9, topSpeed: 198, engine: '2.0L 4-silindrli turbo', seats: 5, colors: [C.white, C.black, C.red], render: { make: 'bmw', model: '1-series' } },
  { make: 'Mercedes-Benz', model: 'AMG C 63 S', trim: 'Coupe', year: 2023, price: 82900, rentPerDay: 249, fuel: ['Benzin'], body: 'Sport kupe', transmission: 'Avtomat', drive: 'RWD', hp: 503, torque: 700, accel: 3.7, topSpeed: 290, engine: 'AMG 4.0L V8 biturbo', seats: 4, colors: [C.copper, C.silver, C.red, C.blue, C.black], render: { make: 'mercedes', model: 'c-class' }, featured: true },
  { make: 'Mercedes-Benz', model: 'E 300', trim: 'Exclusive', year: 2024, price: 58400, rentPerDay: 159, fuel: ['Gibrid'], body: 'Sedan', transmission: 'Avtomat', drive: 'RWD', hp: 258, torque: 400, accel: 6.2, topSpeed: 250, engine: '2.0L turbo + EQ Boost', seats: 5, colors: [C.black, C.silver, C.white], render: { make: 'mercedes', model: 'e-class' } },
  { make: 'Mercedes-Benz', model: 'G 63', trim: 'AMG', year: 2025, price: 179000, rentPerDay: 459, fuel: ['Benzin'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 585, torque: 850, accel: 4.4, topSpeed: 240, engine: 'AMG 4.0L V8 biturbo', seats: 5, colors: [C.black, C.green, C.white], render: { make: 'mercedes', model: 'g-class' }, featured: true },
  { make: 'Porsche', model: '911 Carrera', trim: 'GTS', year: 2025, price: 139900, rentPerDay: 399, fuel: ['Benzin'], body: 'Sport kupe', transmission: 'Avtomat', drive: 'RWD', hp: 541, torque: 610, accel: 3.0, topSpeed: 312, engine: '3.6L T-Hybrid boxer', seats: 4, colors: [C.white, C.silver, C.red, C.green], render: { make: 'porsche', model: '911' }, featured: true },
  { make: 'Porsche', model: 'Taycan', trim: '4S', year: 2024, price: 104600, rentPerDay: 319, fuel: ['Elektr'], body: 'Sedan', transmission: 'Avtomat', drive: 'AWD', hp: 590, torque: 710, accel: 3.7, topSpeed: 250, engine: 'Ikki elektromotor, 97 kVt·soat', seats: 4, colors: [C.blue, C.white, C.grey], render: { make: 'porsche', model: 'taycan' } },
  { make: 'Porsche', model: 'Cayenne', trim: 'E-Hybrid', year: 2024, price: 92300, rentPerDay: 269, fuel: ['Plug-in gibrid'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 470, torque: 650, accel: 4.9, topSpeed: 254, engine: '3.0L V6 turbo + elektromotor', seats: 5, colors: [C.grey, C.black, C.white], render: { make: 'porsche', model: 'cayenne' } },
  { make: 'Audi', model: 'R8', trim: 'V10 Performance', year: 2024, price: 158600, rentPerDay: 429, fuel: ['Benzin'], body: 'Sport kupe', transmission: 'Avtomat', drive: 'AWD', hp: 620, torque: 580, accel: 3.1, topSpeed: 331, engine: '5.2L V10 FSI', seats: 2, colors: [C.silver, C.red, C.black], render: { make: 'audi', model: 'r8' } },
  { make: 'Audi', model: 'A4', trim: '2.0 TFSI Sport', year: 2024, price: 41200, rentPerDay: 89, fuel: ['Benzin'], body: 'Sedan', transmission: 'Avtomat', drive: 'AWD', hp: 249, torque: 370, accel: 5.8, topSpeed: 250, engine: '2.0L TFSI quattro', seats: 5, colors: [C.blue, C.white, C.grey], render: { make: 'audi', model: 'a4' } },
  { make: 'Audi', model: 'A6', trim: 'e-tron', year: 2025, price: 68900, rentPerDay: 179, fuel: ['Elektr'], body: 'Universal', transmission: 'Avtomat', drive: 'AWD', hp: 456, torque: 855, accel: 4.5, topSpeed: 240, engine: 'Ikki elektromotor, 100 kVt·soat', seats: 5, colors: [C.silver, C.black, C.blue], render: { make: 'audi', model: 'a6' } },
  { make: 'Ferrari', model: 'Roma', trim: 'Spider', year: 2025, price: 247000, rentPerDay: 690, fuel: ['Benzin'], body: 'Kabriolet', transmission: 'Avtomat', drive: 'RWD', hp: 620, torque: 760, accel: 3.4, topSpeed: 320, engine: '3.9L V8 biturbo', seats: 4, colors: [C.red, C.grey, C.white], render: { make: 'ferrari', model: 'roma' }, featured: true },
  { make: 'Tesla', model: 'Model S', trim: 'Long Range', year: 2024, price: 74990, rentPerDay: 145, fuel: ['Elektr'], body: 'Sedan', transmission: 'Avtomat', drive: 'AWD', hp: 670, torque: 1050, accel: 3.2, topSpeed: 250, engine: 'Ikki elektromotor', seats: 5, colors: [C.white, C.black, C.blue, C.red], render: { make: 'tesla', model: 'model-s' } },
  { make: 'Tesla', model: 'Model Y', trim: 'Performance', year: 2025, price: 51490, rentPerDay: 119, fuel: ['Elektr'], body: 'Krossover', transmission: 'Avtomat', drive: 'AWD', hp: 456, torque: 660, accel: 3.7, topSpeed: 250, engine: 'Ikki elektromotor', seats: 5, colors: [C.grey, C.white, C.red], render: { make: 'tesla', model: 'model-y' } },
  { make: 'Volkswagen', model: 'Tiguan', trim: '2.0 TSI R-Line', year: 2024, price: 38500, rentPerDay: 79, fuel: ['Benzin', 'Dizel'], body: 'Krossover', transmission: 'Avtomat', drive: 'AWD', hp: 220, torque: 350, accel: 7.1, topSpeed: 230, engine: '2.0L TSI 4Motion', seats: 5, colors: [C.white, C.grey, C.blue], render: { make: 'volkswagen', model: 'tiguan' } },
  { make: 'Volkswagen', model: 'Golf', trim: 'GTI', year: 2024, price: 33200, rentPerDay: 75, fuel: ['Benzin'], body: 'Xetchbek', transmission: 'Mexanika', drive: 'FWD', hp: 265, torque: 370, accel: 5.9, topSpeed: 250, engine: '2.0L TSI EA888', seats: 5, colors: [C.red, C.white, C.grey], render: { make: 'volkswagen', model: 'golf' } },
  { make: 'Mazda', model: '6', trim: '2.5 Turbo Premium', year: 2023, price: 29900, rentPerDay: 69, fuel: ['Benzin'], body: 'Sedan', transmission: 'Avtomat', drive: 'AWD', hp: 250, torque: 420, accel: 6.3, topSpeed: 240, engine: '2.5L Skyactiv-G turbo', seats: 5, colors: [C.red, C.white, C.grey], render: { make: 'mazda', model: '6' } },
  { make: 'Mazda', model: '3', trim: 'Hatchback Skyactiv-X', year: 2024, price: 24800, rentPerDay: 59, fuel: ['Gibrid'], body: 'Xetchbek', transmission: 'Mexanika', drive: 'FWD', hp: 186, torque: 240, accel: 8.1, topSpeed: 216, engine: '2.0L e-Skyactiv X', seats: 5, colors: [C.blue, C.red, C.white], render: { make: 'mazda', model: '3' } },
  { make: 'Toyota', model: 'Land Cruiser', trim: '300 GR Sport', year: 2025, price: 98700, rentPerDay: 239, fuel: ['Dizel'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 309, torque: 700, accel: 6.7, topSpeed: 210, engine: '3.3L V6 twin-turbo dizel', seats: 7, colors: [C.white, C.black, C.grey], render: { make: 'toyota', model: 'land-cruiser' } },
  { make: 'Toyota', model: 'Camry', trim: '2.5 Hybrid', year: 2025, price: 34500, rentPerDay: 65, fuel: ['Gibrid'], body: 'Sedan', transmission: 'Avtomat', drive: 'FWD', hp: 225, torque: 221, accel: 7.8, topSpeed: 180, engine: '2.5L Dynamic Force + gibrid', seats: 5, colors: [C.black, C.white, C.silver], render: { make: 'toyota', model: 'camry' } },
  { make: 'Hyundai', model: 'Ioniq 5', trim: 'N', year: 2025, price: 66200, rentPerDay: 149, fuel: ['Elektr'], body: 'Krossover', transmission: 'Avtomat', drive: 'AWD', hp: 641, torque: 770, accel: 3.4, topSpeed: 260, engine: 'Ikki elektromotor, 84 kVt·soat', seats: 5, colors: [C.blue, C.grey, C.white], render: { make: 'hyundai', model: 'ioniq-5' } },
  { make: 'Hyundai', model: 'Nexo', trim: 'Premium', year: 2024, price: 61900, rentPerDay: 139, fuel: ['Vodorod'], body: 'Krossover', transmission: 'Avtomat', drive: 'FWD', hp: 161, torque: 395, accel: 9.2, topSpeed: 179, engine: 'Vodorod yonilg‘i elementi', seats: 5, colors: [C.white, C.sage, C.grey], render: { make: 'hyundai', model: 'nexo' } },
  { make: 'Chevrolet', model: 'Tahoe', trim: 'High Country', year: 2024, price: 76400, rentPerDay: 189, fuel: ['Benzin', 'Gaz (LPG)'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 420, torque: 624, accel: 6.1, topSpeed: 180, engine: '6.2L V8 EcoTec3', seats: 7, colors: [C.black, C.white, C.silver], render: { make: 'chevrolet', model: 'tahoe' } },
  { make: 'Chevrolet', model: 'Malibu', trim: 'RS', year: 2024, price: 26900, rentPerDay: 55, fuel: ['Benzin', 'Gaz (LPG)'], body: 'Sedan', transmission: 'Avtomat', drive: 'FWD', hp: 163, torque: 250, accel: 8.6, topSpeed: 210, engine: '1.5L turbo', seats: 5, colors: [C.white, C.grey, C.red], render: { make: 'chevrolet', model: 'malibu' } },
  { make: 'Nissan', model: 'GT-R', trim: 'Nismo', year: 2024, price: 221000, rentPerDay: 590, fuel: ['Benzin'], body: 'Sport kupe', transmission: 'Avtomat', drive: 'AWD', hp: 600, torque: 652, accel: 2.9, topSpeed: 315, engine: '3.8L V6 twin-turbo', seats: 4, colors: [C.grey, C.white, C.black], render: { make: 'nissan', model: 'gt-r' } },
  { make: 'Land Rover', model: 'Range Rover', trim: 'Sport P530', year: 2025, price: 121800, rentPerDay: 349, fuel: ['Benzin', 'Plug-in gibrid'], body: 'SUV', transmission: 'Avtomat', drive: 'AWD', hp: 530, torque: 750, accel: 4.3, topSpeed: 260, engine: '4.4L V8 twin-turbo', seats: 5, colors: [C.sage, C.black, C.white], render: { make: 'land-rover', model: 'range-rover-sport' } },
];

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Deterministic pseudo-random so mock data is stable between reloads. */
function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const STATUSES: Car['status'][] = ['Sotuvda', 'Sotuvda', 'Sotuvda', 'Band', 'Sotuvda', 'Servisda', 'Sotuvda', 'Sotilgan'];

export const CARS: Car[] = seeds.map((s, i) => ({
  ...s,
  id: slug(`${s.make}-${s.model}-${s.trim}`),
  status: s.status ?? STATUSES[i % STATUSES.length],
  mileage: s.mileage ?? Math.round(rand(i + 3) * 18) * 1000,
  rating: Math.round((4 + rand(i + 1)) * 10) / 10,
  reviews: 40 + Math.round(rand(i + 7) * 260),
  distance: 80 + Math.round(rand(i + 11) * 420),
  location: LOCATIONS[i % LOCATIONS.length],
  addedAt: new Date(2026, 9, 18 - i * 3).toISOString(),
  description:
    s.description ??
    `${s.make} ${s.model} ${s.trim} — ${s.engine} dvigateli, ${s.hp} o.k. quvvat va ${s.torque} N·m moment. ` +
      `Har bir avtomobil 150 nuqtali texnik ko‘rikdan o‘tgan, rasmiy kafolat va servis tarixi bilan taqdim etiladi.`,
}));

export const BRANDS = [...new Set(CARS.map((c) => c.make))];
export const FUELS: Car['fuel'][number][] = ['Benzin', 'Dizel', 'Plug-in gibrid', 'Gibrid', 'Gaz (LPG)', 'Elektr', 'Vodorod'];
export const BODIES: Car['body'][] = ['Sedan', 'Universal', 'Kupe', 'Xetchbek', 'SUV', 'Sport kupe', 'Krossover', 'Kabriolet'];
