import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: false,
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