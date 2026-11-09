import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type { Nft, NftUpdatedEvent, Order, OrderUpdatedEvent } from "@/types/api";

export function useRealtime() {
  const client = useQueryClient();
  const versions = useRef(new Map<string, number>());

  useEffect(() => {
    let fallbackTimer: number | undefined;
    const refreshLiveResources = () => {
      void client.invalidateQueries({ queryKey: ["nft"] });
      void client.invalidateQueries({ queryKey: ["nfts"] });
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["order"] });
    };
    const startFallback = () => {
      if (fallbackTimer) return;
      if (document.documentElement.dataset.realtime !== "connected") {
        document.documentElement.dataset.realtime = "fallback";
      }
      refreshLiveResources();
      fallbackTimer = window.setInterval(refreshLiveResources, 1_000);
    };
    const stopFallback = () => {
      if (!fallbackTimer) return;
      window.clearInterval(fallbackTimer);
      fallbackTimer = undefined;
    };
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
    const fallbackChannel =
      "BroadcastChannel" in window ? new BroadcastChannel("kurio-realtime-events") : undefined;
    const onBroadcastFallback = (
      event: MessageEvent<
        | { name: "nft.updated"; payload: NftUpdatedEvent }
        | { name: "order.updated"; payload: OrderUpdatedEvent }
      >,
    ) => {
      if (event.data.name === "nft.updated") onNftUpdated(event.data.payload);
      else if (event.data.name === "order.updated") onOrderUpdated(event.data.payload);
    };

    socket.on("nft.updated", onNftUpdated);
    socket.on("order.updated", onOrderUpdated);
    window.addEventListener("jungle:nft.updated", onNftFallback);
    window.addEventListener("jungle:order.updated", onOrderFallback);
    fallbackChannel?.addEventListener("message", onBroadcastFallback);
    document.documentElement.dataset.realtime = "connecting";
    const fallbackGracePeriod = window.setTimeout(startFallback, 1_200);
    socket.on("connect", () => {
      document.documentElement.dataset.realtime = "connected";
      refreshLiveResources();
      // A low-frequency REST reconciliation remains active even with a socket:
      // it closes the gap if a frame is lost while the browser/proxy reconnects.
      startFallback();
    });
    socket.on("disconnect", () => {
      startFallback();
    });
    socket.on("connect_error", startFallback);
    return () => {
      window.clearTimeout(fallbackGracePeriod);
      stopFallback();
      delete document.documentElement.dataset.realtime;
      window.removeEventListener("jungle:nft.updated", onNftFallback);
      window.removeEventListener("jungle:order.updated", onOrderFallback);
      fallbackChannel?.removeEventListener("message", onBroadcastFallback);
      fallbackChannel?.close();
      socket.disconnect();
    };
  }, [client]);
}
