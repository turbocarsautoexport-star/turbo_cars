export type AuctionStatus = "upcoming" | "live" | "ended";

export interface Bid {
  id: string;
  bidderName: string;
  amount: number;
  createdAt: number;
}

export interface Auction {
  id: string;
  slug: string;
  title: string;
  brand: string;
  year: number;
  mileageKm: number;
  transmission: "Avtomat" | "Mexanika";
  fuel: "Benzin" | "Dizel" | "Gibrid" | "Elektr";
  city: string;
  description: string;
  accent: number;
  startPrice: number;
  currentPrice: number;
  bidStep: number;
  currency: "so'm";
  startAt: number;
  endAt: number;
  status: AuctionStatus;
  bids: Bid[];
  winnerName?: string;
  reservePrice?: number;
  requiresDeposit: boolean;
  depositAmount: number;
}

export interface AccessCode {
  id: string;
  auctionId: string;
  code: string;
  holderName?: string;
  createdAt: number;
  redeemedAt?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  carWon: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
}

export interface SiteStats {
  totalAuctions: number;
  totalSoldSom: number;
  activeBidders: number;
  avgSaleMinutes: number;
}
