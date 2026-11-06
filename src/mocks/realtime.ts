import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";

const origin = window.location.origin.replace(/^http/, "ws");
export const socketLink = ws.link(`${origin}/socket.io/`);

const clients = new Set<ReturnType<typeof toSocketIo>["client"]>();

export const socketHandler = socketLink.addEventListener("connection", (connection) => {
  // The binding decodes Engine.IO frames so the app and mock exchange named Socket.IO events.
  const io = toSocketIo(connection);
  clients.add(io.client);
  connection.client.addEventListener("close", () => clients.delete(io.client));
});

export function broadcastSocketEvent(event: string, payload: unknown) {
  clients.forEach((client) => client.emit(event, payload));
}
