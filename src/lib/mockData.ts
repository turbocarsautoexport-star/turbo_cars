import { Auction, Bid, SiteStats, Testimonial } from "./types";

const FIRST_NAMES = [
  "Aziz",
  "Diyor",
  "Malika",
  "Shahzod",
  "Kamola",
  "Bobur",
  "Nodira",
  "Jasur",
  "Sevara",
  "Otabek",
  "Gulnoza",
  "Farrux",
  "Madina",
  "Sardor",
  "Ziyoda",
  "Islom",
];

const LAST_NAMES = [
  "Karimov",
  "Yusupova",
  "Rashidov",
  "Tosheva",
  "Nazarov",
  "Ergasheva",
  "Xolmatov",
  "Sultonova",
  "Abdullayev",
  "Qodirova",
  "Mirzayev",
  "Ismoilova",
];

function randomBidderName(rand: () => number): string {
  const f = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

// deterministic-ish PRNG so repeated calls within a session feel stable per auction
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CarSeed {
  slug: string;
  title: string;
  brand: string;
  year: number;
  mileageKm: number;
  transmission: Auction["transmission"];
  fuel: Auction["fuel"];
  city: string;
  description: string;
  accent: number;
  startPrice: number;
  bidStep: number;
  depositAmount?: number;
}

const CAR_SEEDS: CarSeed[] = [
  {
    slug: "chevrolet-malibu-2-2021",
    title: "Chevrolet Malibu 2",
    brand: "Chevrolet",
    year: 2021,
    mileageKm: 38500,
    transmission: "Avtomat",
    fuel: "Benzin",
    city: "Toshkent",
    description:
      "Bitta egasida bo'lgan, doimiy texnik ko'rikdan o'tgan business-klass sedan. Bo'yalmagan, ichki salon toza saqlangan.",
    accent: 0,
    startPrice: 210_000_000,
    bidStep: 1_500_000,
  },
  {
    slug: "chevrolet-gentra-2023",
    title: "Chevrolet Gentra",
    brand: "Chevrolet",
    year: 2023,
    mileageKm: 12300,
    transmission: "Mexanika",
    fuel: "Benzin",
    city: "Samarqand",
    description:
      "Kafolat muddati davom etayotgan, deyarli yangi holatdagi kompakt sedan. Shahar ichida minimal foydalanilgan.",
    accent: 1,
    startPrice: 165_000_000,
    bidStep: 1_000_000,
  },
  {
    slug: "chevrolet-tracker-2023",
    title: "Chevrolet Tracker",
    brand: "Chevrolet",
    year: 2023,
    mileageKm: 21000,
    transmission: "Avtomat",
    fuel: "Benzin",
    city: "Toshkent",
    description:
      "Zamonaviy krossover, to'liq jihozlangan (parktronik, kamera, klimat-kontrol). Oilaviy foydalanish uchun ideal.",
    accent: 2,
    startPrice: 255_000_000,
    bidStep: 2_000_000,
    depositAmount: 5_000_000,
  },
  {
    slug: "bmw-530i-2018",
    title: "BMW 530i xDrive",
    brand: "BMW",
    year: 2018,
    mileageKm: 61200,
    transmission: "Avtomat",
    fuel: "Benzin",
    city: "Toshkent",
    description:
      "Premium business-sedan, to'liq servis tarixi bilan. Charm salon, panoramik lyuk, adaptiv xavfsizlik tizimlari.",
    accent: 3,
    startPrice: 340_000_000,
    bidStep: 3_000_000,
    depositAmount: 8_000_000,
  },
  {
    slug: "lexus-rx350-2020",
    title: "Lexus RX350",
    brand: "Lexus",
    year: 2020,
    mileageKm: 44000,
    transmission: "Avtomat",
    fuel: "Benzin",
    city: "Buxoro",
    description:
      "Ishonchli va hashamatli krossover. Rasmiy diler texnik xizmatidan o'tib turgan, urilmagan, bo'yalmagan.",
    accent: 4,
    startPrice: 470_000_000,
    bidStep: 4_000_000,
    depositAmount: 10_000_000,
  },
  {
    slug: "chevrolet-cobalt-2020",
    title: "Chevrolet Cobalt",
    brand: "Chevrolet",
    year: 2020,
    mileageKm: 52800,
    transmission: "Mexanika",
    fuel: "Benzin",
    city: "Andijon",
    description:
      "Yoqilg'i tejamkor, ishonchli shahar avtomobili. Doimiy servisda bo'lgan, salon originalligicha saqlangan.",
    accent: 0,
    startPrice: 132_000_000,
    bidStep: 800_000,
  },
  {
    slug: "mercedes-e200-2019",
    title: "Mercedes-Benz E200",
    brand: "Mercedes-Benz",
    year: 2019,
    mileageKm: 58600,
    transmission: "Avtomat",
    fuel: "Benzin",
    city: "Toshkent",
    description:
      "Nafis va dinamik business-sedan. AMG-line paket, to'liq elektron xavfsizlik va komfort jihozlari.",
    accent: 3,
    startPrice: 365_000_000,
    bidStep: 3_000_000,
  },
  {
    slug: "chevrolet-nexia-3-2022",
    title: "Chevrolet Nexia 3",
    brand: "Chevrolet",
    year: 2022,
    mileageKm: 19800,
    transmission: "Mexanika",
    fuel: "Benzin",
    city: "Farg'ona",
    description:
      "Kam yurgan, bitta oilada bo'lgan ixcham sedan. Birinchi bor sotiluvchi, hujjatlari toza.",
    accent: 1,
    startPrice: 118_000_000,
    bidStep: 700_000,
  },
];

function buildBidHistory(
  seed: CarSeed,
  startAt: number,
  windowEnd: number,
  rand: () => number
): Bid[] {
  const bids: Bid[] = [];
  let price = seed.startPrice;
  let t = startAt + Math.floor(rand() * 60_000);
  let i = 0;
  while (t < windowEnd) {
    const jump = seed.bidStep * (1 + Math.floor(rand() * 3));
    price += jump;
    bids.push({
      id: `${seed.slug}-bid-${i}`,
      bidderName: randomBidderName(rand),
      amount: price,
      createdAt: t,
    });
    t += 15_000 + Math.floor(rand() * 90_000);
    i += 1;
  }
  return bids;
}

export function createSeedAuctions(now: number): Auction[] {
  return CAR_SEEDS.map((seed, idx) => {
    const rand = mulberry32(now + idx * 7919);
    const bucket = idx % 8;

    let startAt: number;
    let endAt: number;
    let status: Auction["status"];

    if (bucket < 3) {
      // live now
      startAt = now - (5 + Math.floor(rand() * 35)) * 60_000;
      endAt = now + (bucket === 0 ? 2 : 4 + Math.floor(rand() * 10)) * 60_000;
      status = "live";
    } else if (bucket < 5) {
      // upcoming
      startAt = now + (10 + Math.floor(rand() * 120)) * 60_000;
      endAt = startAt + (15 + Math.floor(rand() * 20)) * 60_000;
      status = "upcoming";
    } else {
      // ended
      const daysAgo = 1 + Math.floor(rand() * 6);
      startAt = now - daysAgo * 24 * 60 * 60_000;
      endAt = startAt + (18 + Math.floor(rand() * 15)) * 60_000;
      status = "ended";
    }

    const bidWindowEnd = status === "upcoming" ? startAt : Math.min(now, endAt);
    const bids =
      status === "upcoming"
        ? []
        : buildBidHistory(seed, startAt, status === "ended" ? endAt : bidWindowEnd, rand);
    const currentPrice = bids.length
      ? bids[bids.length - 1].amount
      : seed.startPrice;

    return {
      id: seed.slug,
      slug: seed.slug,
      title: seed.title,
      brand: seed.brand,
      year: seed.year,
      mileageKm: seed.mileageKm,
      transmission: seed.transmission,
      fuel: seed.fuel,
      city: seed.city,
      description: seed.description,
      accent: seed.accent,
      startPrice: seed.startPrice,
      currentPrice,
      bidStep: seed.bidStep,
      currency: "so'm",
      startAt,
      endAt,
      status,
      bids,
      winnerName:
        status === "ended" && bids.length
          ? bids[bids.length - 1].bidderName
          : undefined,
      requiresDeposit: Boolean(seed.depositAmount),
      depositAmount: seed.depositAmount ?? 0,
    } satisfies Auction;
  });
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Otabek Rashidov",
    city: "Toshkent",
    carWon: "Chevrolet Malibu 2",
    rating: 5,
    text: "Birinchi marta onlayn auksionda qatnashdim, juda shaffof va qulay bo'ldi. Har bir bid real vaqtda ko'rinib turdi, hech qanday shubha qolmadi.",
    date: "2026-05-14",
  },
  {
    id: "t2",
    name: "Malika Yusupova",
    city: "Samarqand",
    carWon: "Lexus RX350",
    rating: 5,
    text: "Taймер aniq ishladi, savdo belgilangan vaqtda avtomatik yopildi. G'alaba qozonganimdan so'ng menejerlar tez orada bog'lanishdi.",
    date: "2026-04-02",
  },
  {
    id: "t3",
    name: "Jasur Nazarov",
    city: "Andijon",
    carWon: "Chevrolet Cobalt",
    rating: 4,
    text: "Narxlar bozor darajasida, savdo jarayoni qiziqarli va tez kechdi. Statistikalar orqali avvalgi savdolarni ham ko'rish qulay.",
    date: "2026-03-21",
  },
  {
    id: "t4",
    name: "Sevara Tosheva",
    city: "Buxoro",
    carWon: "BMW 530i xDrive",
    rating: 5,
    text: "Ilovadagi jonli statistika va boshqa ishtirokchilarning takliflarini kuzatish g'alati adrenalin beradi. Albatta yana qatnashaman.",
    date: "2026-02-27",
  },
  {
    id: "t5",
    name: "Sardor Ergashev",
    city: "Farg'ona",
    carWon: "Mercedes-Benz E200",
    rating: 5,
    text: "Admin savdoni belgilangan daqiqada yopdi, hech qanday muammosiz g'olib sifatida tasdiqladim. Xizmat sifati yuqori baholanadi.",
    date: "2026-01-30",
  },
];

export const BASE_STATS: SiteStats = {
  totalAuctions: 1248,
  totalSoldSom: 186_400_000_000,
  activeBidders: 5320,
  avgSaleMinutes: 11,
};
