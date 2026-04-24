import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://vyntrix-api.onrender.com";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // polling as fallback — Render needs this
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
    s.emit("join", studentId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};