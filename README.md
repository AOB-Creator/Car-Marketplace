# CARZONE — Premium avtomobil platformasi

Angular 20 (standalone, signals, zoneless) asosida qurilgan avtomobil savdosi va ijarasi platformasi hamda to‘liq admin dashboard.

## Ishga tushirish

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build -> dist/carzone
```

## Sahifalar

**Sayt**
- `/` — landing: hero karusel, qidiruv paneli, brendlar marquee, statistika, “Hashamat va ishonchlilik” dial, top tanlovlar, qadamlar, mijozlar fikri, FAQ
- `/cars` — katalog: yoqilg‘i/brend/kuzov/uzatma filtrlari, narx gistogramma-slayderi, saralash, grid/list ko‘rinish, sevimlilar
- `/cars/:id` — avtomobil sahifasi: toifali hotspotlar, ranglar, ko‘rish burchaklari, xususiyatlar karuseli, kredit kalkulyatori, ijara va test-drayv broni, o‘xshash avtomobillar
- `/about`, `/faq`

**Dashboard** (`/dashboard`)
- Bosh sahifa — KPI kartalar, daromad grafigi, brendlar donut, so‘nggi buyurtmalar, avtopark holati, haftalik bronlar, faollik
- Avtomobillar — filtr paneli, kartalar/jadval, qo‘shish/tahrirlash (reactive forms + jonli preview), o‘chirish
- Buyurtmalar — status tablar, qidiruv, sahifalash, tafsilotlar paneli va status o‘zgartirish
- Mijozlar, Xabarlar (chat), Sevimlilar, Analitika, Bildirishnomalar, Sozlamalar

Avtomobillar va sevimlilar `localStorage` da saqlanadi (Sozlamalar → Ma’lumotlar orqali tiklanadi).
Avtomobil rasmlari `cdn.imagin.studio` dan olinadi; yuklanmasa, avtomobil rangidagi SVG siluet ko‘rsatiladi.
