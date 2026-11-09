import type { CartItem, MockScenario, Nft, Order, Profile, User, Wallet } from "@/types/api";
import { accountFixtures, createNftFixtures } from "./fixtures";

interface StoredUser extends User {
  passwordHash: string;
}

export interface MockDbState {
  users: StoredUser[];
  profiles: Record<string, Profile>;
  wallets: Record<string, Wallet[]>;
  favorites: Record<string, string[]>;
  carts: Record<string, CartItem[]>;
  orders: Record<string, Order>;
  idempotency: Record<string, { fingerprint: string; orderId: string }>;
  nfts: Nft[];
  sessionUserId: string | null;
  scenario: MockScenario;
}

const STORAGE_KEY = "jungle-marketplace-mock-db-v1";

export function hashPassword(value: string) {
  let hash = 5381;
  for (const char of `jungle-marketplace:${value}`) hash = (hash * 33) ^ char.charCodeAt(0);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function initialState(): MockDbState {
  const users: StoredUser[] = accountFixtures.map(({ profile, password }) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarIndex: profile.avatarIndex,
    passwordHash: hashPassword(password),
  }));
  return {
    users,
    profiles: Object.fromEntries(accountFixtures.map(({ profile }) => [profile.id, { ...profile }])),
    wallets: Object.fromEntries(
      accountFixtures.map(({ profile, wallets }) => [profile.id, structuredClone(wallets)]),
    ),
    favorites: Object.fromEntries(
      accountFixtures.map(({ profile, favorites }) => [profile.id, [...favorites]]),
    ),
    carts: Object.fromEntries([...["guest", ...users.map((user) => user.id)].map((id) => [id, []])]),
    orders: {},
    idempotency: {},
    nfts: createNftFixtures(),
    sessionUserId: null,
    scenario: (import.meta.env.VITE_DEFAULT_SCENARIO as MockScenario) || "success",
  };
}

function load(): MockDbState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return initialState();

    const stored = JSON.parse(value) as MockDbState;
    // Normalize older demo data so stock can never exceed the edition's total supply.
    stored.nfts = stored.nfts.map((nft) => ({
      ...nft,
      available: Math.min(nft.available, nft.totalSupply),
    }));
    return stored;
  } catch {
    return initialState();
  }
}

let database = load();

export function getDb() {
  return database;
}

export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // The demo still works in storage-restricted environments for the current session.
  }
}

export function resetDb() {
  database = initialState();
  saveDb();
  return database;
}

export function getCartOwner() {
  return database.sessionUserId ?? "guest";
}

export function publicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, avatarIndex: user.avatarIndex };
}
