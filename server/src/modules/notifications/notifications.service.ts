import { prisma } from "../../config/db";

type NotifType =
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "APPLICATION_REVIEWED"
  | "INFO";

export const createNotification = async (data: {
  studentId: number;
  title: string;
  message: string;
  type: NotifType;
  link?: string;
}) => {
  return prisma.notification.create({ data });
};

export const getNotifications = async (studentId: number) => {
  return prisma.notification.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
};

export const getUnreadCount = async (studentId: number) => {
  return prisma.notification.count({
    where: { studentId, read: false },
  });
};

export const markAsRead = async (
  notificationId: number,
  studentId: number
) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, studentId },
    data: { read: true },
  });
};

export const markAllAsRead = async (studentId: number) => {
  return prisma.notification.updateMany({
    where: { studentId, read: false },
    data: { read: true },
  });
};