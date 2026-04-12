import { prisma } from "../../config/db";

// Search students to connect with
export const searchStudents = async (query: string, currentStudentId: number) => {
  return prisma.student.findMany({
    where: {
      AND: [
        { id: { not: currentStudentId } },
        {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName:  { contains: query, mode: "insensitive" } },
            { email:     { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      university: { select: { name: true } },
      profile: { select: { avatarUrl: true } },
    },
    take: 10,
  });
};

// Send a connection request
export const sendConnectionRequest = async (senderId: number, receiverId: number) => {
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });
  if (existing) throw new Error("Connection already exists");

  return prisma.connection.create({
    data: { senderId, receiverId },
    include: {
      receiver: {
        select: {
          id: true, firstName: true, lastName: true,
          profile: { select: { avatarUrl: true } },
        },
      },
    },
  });
};

// Accept or reject a connection
export const respondToConnection = async (
  connectionId: number,
  studentId: number,
  status: "ACCEPTED" | "REJECTED"
) => {
  return prisma.connection.update({
    where: { id: connectionId, receiverId: studentId },
    data: { status },
  });
};

// Get all connections for a student
export const getConnections = async (studentId: number) => {
  return prisma.connection.findMany({
    where: {
      OR: [
        { senderId: studentId, status: "ACCEPTED" },
        { receiverId: studentId, status: "ACCEPTED" },
      ],
    },
    include: {
      sender: {
        select: {
          id: true, firstName: true, lastName: true,
          department: true,
          profile: { select: { avatarUrl: true } },
        },
      },
      receiver: {
        select: {
          id: true, firstName: true, lastName: true,
          department: true,
          profile: { select: { avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

// Get pending connection requests received
export const getPendingRequests = async (studentId: number) => {
  return prisma.connection.findMany({
    where: { receiverId: studentId, status: "PENDING" },
    include: {
      sender: {
        select: {
          id: true, firstName: true, lastName: true,
          department: true,
          university: { select: { name: true } },
          profile: { select: { avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get messages for a connection
export const getMessages = async (connectionId: number, studentId: number) => {
  // Verify student is part of this connection
  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      OR: [{ senderId: studentId }, { receiverId: studentId }],
    },
  });
  if (!connection) throw new Error("Connection not found");

  // Mark messages as read
  await prisma.message.updateMany({
    where: { connectionId, senderId: { not: studentId }, read: false },
    data: { read: true },
  });

  return prisma.message.findMany({
    where: { connectionId },
    include: {
      sender: {
        select: {
          id: true, firstName: true, lastName: true,
          profile: { select: { avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

// Get unread message count
export const getUnreadCount = async (studentId: number) => {
  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { senderId: studentId, status: "ACCEPTED" },
        { receiverId: studentId, status: "ACCEPTED" },
      ],
    },
    select: { id: true },
  });

  const connectionIds = connections.map((c) => c.id);

  return prisma.message.count({
    where: {
      connectionId: { in: connectionIds },
      senderId: { not: studentId },
      read: false,
    },
  });
};