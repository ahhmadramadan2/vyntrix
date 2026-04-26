import { io, Socket } from "socket.io-client";

// Strip /api/v1 if present — socket needs the base URL only
const BASE_URL = (import.meta.env.VITE_API_URL || "https://vyntrix-api.onrender.com")
  .replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = (studentId: number) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once("connect", () => {
      s.emit("join", studentId);
    });
  } else {
    s.emit("join", studentId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};