export type Network = "ethereum" | "polygon" | "arbitrum";
export type OrderStatus = "pending" | "confirmed" | "declined";
export type Edition = "unique" | "limited" | "open";

export interface Nft {
  id: string;
  name: string;
  collection: string;
  creator: string;
  description: string;
  priceEth: string;
  previousPriceEth?: string;
  available: number;
  totalSupply: number;
  edition: Edition;
  category: "art" | "collectible" | "gaming";
  imageIndex: number;
  version: number;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarIndex: number;
}

export interface Profile extends User {
  phone: string;
  bio: string;
  country: string;
}

export interface Wallet {
  id: string;
  label: string;
  address: string;
  network: Network;
  primary: boolean;
}

export interface CartItem {
  nftId: string;
  quantity: number;
  priceSnapshot: string;
}

export interface CartLine extends CartItem {
  nft: Nft;
}

export interface Cart {
  items: CartLine[];
  updatedAt: string;
}

export interface Quote {
  items: CartLine[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  coupon?: string;
  version: string;
  expiresAt: string;
  changedItems: string[];
}

export interface Order {
  id: string;
  transactionId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  buyer: { name: string; email: string };
  wallet: Wallet;
  quote: Quote;
  version: number;
  refusalReason?: string;
}

export interface PaginatedNfts {
  items: Nft[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface NftUpdatedEvent {
  resourceId: string;
  version: number;
  occurredAt: string;
  patch: Pick<Nft, "priceEth" | "available">;
}

export interface OrderUpdatedEvent {
  resourceId: string;
  userId: string;
  version: number;
  occurredAt: string;
  status: OrderStatus;
}

export type MockScenario =
  | "success"
  | "slow"
  | "offline"
  | "server-error"
  | "expired-session"
  | "favorite-error"
  | "price-change"
  | "sold-out"
  | "payment-declined"
  | "order-timeout";
