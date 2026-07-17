// Fallback content shown when Supabase env vars aren't configured yet, so the
// site is fully click-through-able for preview before a real database exists.
import { Car, Offer, Review } from "./types";

export const MOCK_CARS: Car[] = [
  {
    id: "mock-car-1",
    model: "Chevrolet Malibu 2",
    year: 2021,
    photos: [],
    status: "in_stock",
    category: "sedan",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-car-2",
    model: "Hyundai Palisade",
    year: 2022,
    photos: [],
    status: "in_stock",
    category: "suv",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-car-3",
    model: "Kia K5",
    year: 2020,
    photos: [],
    status: "sold",
    category: "sedan",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: "mock-offer-1",
    title: "Eksport uchun bepul logistika konsultatsiyasi",
    discountText: "Bepul",
    description: "Birinchi buyurtmangiz uchun portdan yetkazib berish rejasini bepul tuzib beramiz.",
    publishDate: new Date().toISOString().slice(0, 10),
    validUntil: null,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "mock-review-1",
    customerName: "Aziz Karimov",
    rating: 5,
    body: "Mashinani vaqtida va hujjatlari to'liq holda qabul qildim. Rahmat jamoaga!",
    photoUrl: null,
    pending: false,
    createdAt: new Date().toISOString(),
  },
];
