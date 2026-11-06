import type { ClassValue } from "clsx";
import clsx from "clsx";
import Decimal from "decimal.js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEth(value: string | number) {
  return `${new Decimal(value).toDecimalPlaces(4).toFixed()} ETH`;
}

export function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function getErrorMessage(error: unknown, fallback = "Não foi possível concluir a ação.") {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function makeIdempotencyKey() {
  return crypto.randomUUID();
}
