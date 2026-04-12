import http from "http";
import { Server } from "socket.io";
import app from "./src/app";
import { env } from "./src/config/env";
import { prisma } from "./src/config/db";

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io — real-time chat
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Student joins their personal room
  socket.on("join", (studentId: number) => {
    socket.join(`student_${studentId}`);
    console.log(`👤 Student ${studentId} joined room`);
  });

  // Send a message
  socket.on("send_message", async (data: {
    connectionId: number;
    senderId: number;
    receiverId: number;
    content: string;
  }) => {
    try {
      const message = await prisma.message.create({
        data: {
          connectionId: data.connectionId,
          senderId: data.senderId,
          content: data.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      });

      // Emit to both sender and receiver rooms
      io.to(`student_${data.senderId}`)
        .to(`student_${data.receiverId}`)
        .emit("receive_message", message);
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  // Mark messages as read
  socket.on("mark_read", async (data: {
    connectionId: number;
    studentId: number;
  }) => {
    await prisma.message.updateMany({
      where: {
        connectionId: data.connectionId,
        senderId: { not: data.studentId },
        read: false,
      },
      data: { read: true },
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = env.PORT;
httpServer.listen(PORT, () => {
  console.log(`🚀 Vyntrix server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}/api/v1`);
  console.log(`💬 Socket.io enabled`);
});