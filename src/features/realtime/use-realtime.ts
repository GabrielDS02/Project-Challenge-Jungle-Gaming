import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type { Nft, NftUpdatedEvent, Order, OrderUpdatedEvent } from "@/types/api";

export function useRealtime() {
  const client = useQueryClient();
  const versions = useRef(new Map<string, number>());

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
    });
    const accepts = (key: string, version: number) => {
      const current = versions.current.get(key) ?? 0;
      if (version <= current) return false;
      versions.current.set(key, version);
      return true;
    };
    const onNftUpdated = (event: NftUpdatedEvent) => {
      if (!accepts(`nft:${event.resourceId}`, event.version)) return;
      client.setQueryData<Nft>(["nft", event.resourceId], (current) =>
        current ? { ...current, ...event.patch, version: event.version } : current,
      );
      void client.invalidateQueries({ queryKey: ["nfts"] });
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["quote"] });
    };
    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      if (!accepts(`order:${event.resourceId}`, event.version)) return;
      client.setQueryData<Order>(["order", event.resourceId], (current) =>
        current
          ? { ...current, status: event.status, version: event.version, updatedAt: event.occurredAt }
          : current,
      );
      void client.invalidateQueries({ queryKey: ["order", event.resourceId] });
      void client.invalidateQueries({ queryKey: ["cart"] });
    };
    const onNftFallback = (event: Event) => onNftUpdated((event as CustomEvent<NftUpdatedEvent>).detail);
    const onOrderFallback = (event: Event) =>
      onOrderUpdated((event as CustomEvent<OrderUpdatedEvent>).detail);

    socket.on("nft.updated", onNftUpdated);
    socket.on("order.updated", onOrderUpdated);
    window.addEventListener("jungle:nft.updated", onNftFallback);
    window.addEventListener("jungle:order.updated", onOrderFallback);
    socket.on("connect", () => {
      document.documentElement.dataset.realtime = "connected";
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["order"] });
    });
    socket.on("disconnect", () => {
      document.documentElement.dataset.realtime = "disconnected";
    });
    return () => {
      delete document.documentElement.dataset.realtime;
      window.removeEventListener("jungle:nft.updated", onNftFallback);
      window.removeEventListener("jungle:order.updated", onOrderFallback);
      socket.disconnect();
    };
  }, [client]);
}
