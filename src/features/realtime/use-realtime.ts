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
    socket.on("nft.updated", (event: NftUpdatedEvent) => {
      if (!accepts(`nft:${event.resourceId}`, event.version)) return;
      client.setQueryData<Nft>(["nft", event.resourceId], (current) =>
        current ? { ...current, ...event.patch, version: event.version } : current,
      );
      void client.invalidateQueries({ queryKey: ["nfts"] });
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["quote"] });
    });
    socket.on("order.updated", (event: OrderUpdatedEvent) => {
      if (!accepts(`order:${event.resourceId}`, event.version)) return;
      client.setQueryData<Order>(["order", event.resourceId], (current) =>
        current
          ? { ...current, status: event.status, version: event.version, updatedAt: event.occurredAt }
          : current,
      );
      void client.invalidateQueries({ queryKey: ["order", event.resourceId] });
      void client.invalidateQueries({ queryKey: ["cart"] });
    });
    socket.on("connect", () => {
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["order"] });
    });
    return () => {
      socket.disconnect();
    };
  }, [client]);
}
