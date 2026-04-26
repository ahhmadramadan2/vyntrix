import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://vyntrix-api.onrender.com";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
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
    // Wait for connection before joining room
    s.once("connect", () => {
      s.emit("join", studentId);
    });
  } else {
    // Already connected, just join
    s.emit("join", studentId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};