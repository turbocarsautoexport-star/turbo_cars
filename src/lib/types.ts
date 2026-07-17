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

export type CarStatus = "in_stock" | "transit" | "sold";

export interface Car {
  id: string;
  model: string;
  year: number;
  photos: string[];
  status: CarStatus;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdSection =
  | "news"
  | "rates"
  | "containers"
  | "track"
  | "offers"
  | "catalog"
  | "reviews"
  | "sold"
  | "support"
  | "home"
  | "eksport"
  | "auksionlar";

export type AdPlacement = "top" | "island" | "split";
export type AdSize = "portrait" | "square" | "story";
export type AdAccent = "red" | "dark" | "gradient";

export interface AdMedia {
  type: "photo" | "video";
  url: string;
}

export interface Ad {
  id: string;
  section: AdSection;
  placement: AdPlacement;
  size?: AdSize | null;
  accent: AdAccent;
  body: string;
  ctaLabel?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  media: AdMedia[];
  clicks: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  discountText?: string | null;
  description?: string | null;
  publishDate: string;
  validUntil?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  photoUrl?: string | null;
  pending: boolean;
  createdAt: string;
}

export type SupportChatStatus = "open" | "claimed" | "closed";
export type SupportMessageSender = "guest" | "staff";

export interface SupportMessage {
  id: string;
  sender: SupportMessageSender;
  body: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

export interface SupportChat {
  id: string;
  guestName: string;
  status: SupportChatStatus;
  claimedBy?: string | null;
  claimedByName?: string | null;
  createdAt: string;
  closedAt?: string | null;
  satisfaction?: number | null;
  messages?: SupportMessage[];
}

export type WorkerRole = "admin" | "worker";

export interface WorkerProfile {
  id: string;
  name: string;
  role: WorkerRole;
  permissions: Record<string, boolean>;
  phone?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}
