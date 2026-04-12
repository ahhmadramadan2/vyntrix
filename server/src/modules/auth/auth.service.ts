import { prisma } from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../utils/email";

export const registerStudent = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  universityId: number;
  department: string;
  degree: string;
}) => {
  const existing = await prisma.student.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already registered");

  const university = await prisma.university.findUnique({
    where: { id: data.universityId },
  });
  if (!university) throw new Error("University not found");

  const passwordHash = await hashPassword(data.password);

  const student = await prisma.student.create({
    data: {
      firstName:    data.firstName,
      lastName:     data.lastName,
      email:        data.email,
      passwordHash,
      universityId: data.universityId,
      department:   data.department,
      degree:       data.degree,
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, department: true, degree: true,
      status: true, universityId: true,
    },
  });

  await prisma.studentProfile.create({ data: { studentId: student.id } });

  const token = signToken({ id: student.id, email: student.email, role: "STUDENT" });
  return { student, token };
};

export const loginStudent = async (email: string, password: string) => {
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student) throw new Error("Invalid email or password");

  const valid = await comparePassword(password, student.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const token = signToken({ id: student.id, email: student.email, role: "STUDENT" });

  const { passwordHash: _, ...studentData } = student;
  return { student: studentData, token };
};

export const registerCompany = async (data: {
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  companyEmail: string;
  hrFullName: string;
  hrEmail: string;
  password: string;
}) => {
  const existingCompany = await prisma.company.findUnique({
    where: { email: data.companyEmail },
  });
  if (existingCompany) throw new Error("Company email already registered");

  const existingHr = await prisma.hrUser.findUnique({
    where: { email: data.hrEmail },
  });
  if (existingHr) throw new Error("HR email already registered");

  const passwordHash = await hashPassword(data.password);

  const company = await prisma.company.create({
    data: {
      companyName: data.companyName,
      industry:    data.industry,
      location:    data.location,
      website:     data.website,
      email:       data.companyEmail,
    },
  });

  const hrUser = await prisma.hrUser.create({
    data: {
      companyId:    company.id,
      fullName:     data.hrFullName,
      email:        data.hrEmail,
      passwordHash,
    },
    select: {
      id: true, fullName: true, email: true, role: true, companyId: true,
    },
  });

  const token = signToken({ id: hrUser.id, email: hrUser.email, role: "HR" });
  return { company, hrUser, token };
};

export const loginCompany = async (email: string, password: string) => {
  const hrUser = await prisma.hrUser.findUnique({
    where: { email },
    include: { company: true },
  });
  if (!hrUser) throw new Error("Invalid email or password");

  const valid = await comparePassword(password, hrUser.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const token = signToken({ id: hrUser.id, email: hrUser.email, role: "HR" });

  const { passwordHash: _, ...hrData } = hrUser;
  return { hrUser: hrData, token };
};

export const forgotPassword = async (email: string, role: "STUDENT" | "HR") => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) throw new Error("No account found with this email");

    await prisma.student.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await sendPasswordResetEmail({
      name: `${student.firstName} ${student.lastName}`,
      email,
      token: resetToken,
      role: "STUDENT",
    });
  } else {
    const hrUser = await prisma.hrUser.findUnique({ where: { email } });
    if (!hrUser) throw new Error("No account found with this email");

    await prisma.hrUser.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await sendPasswordResetEmail({
      name: hrUser.fullName,
      email,
      token: resetToken,
      role: "HR",
    });
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  role: "STUDENT" | "HR"
) => {
  if (role === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!student) throw new Error("Invalid or expired reset token");

    const passwordHash = await hashPassword(newPassword);
    await prisma.student.update({
      where: { id: student.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
  } else {
    const hrUser = await prisma.hrUser.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!hrUser) throw new Error("Invalid or expired reset token");

    const passwordHash = await hashPassword(newPassword);
    await prisma.hrUser.update({
      where: { id: hrUser.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
  }
};

export const changeStudentCredentials = async (
  studentId: number,
  data: {
    currentPassword: string;
    newPassword?: string;
    newEmail?: string;
    newFirstName?: string;
    newLastName?: string;
  }
) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new Error("Student not found");

  const valid = await comparePassword(data.currentPassword, student.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const updateData: any = {};

  if (data.newPassword) {
    updateData.passwordHash = await hashPassword(data.newPassword);
  }

  if (data.newEmail && data.newEmail !== student.email) {
    const existing = await prisma.student.findUnique({
      where: { email: data.newEmail },
    });
    if (existing) throw new Error("Email already in use");
    updateData.email = data.newEmail;
  }

  if (data.newFirstName || data.newLastName) {
    if (student.lastUsernameChange) {
      const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
      if (student.lastUsernameChange > threeWeeksAgo) {
        const nextAllowed = new Date(
          student.lastUsernameChange.getTime() + 21 * 24 * 60 * 60 * 1000
        );
        throw new Error(
          `You can change your name again on ${nextAllowed.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        );
      }
    }
    if (data.newFirstName) updateData.firstName = data.newFirstName;
    if (data.newLastName)  updateData.lastName  = data.newLastName;
    updateData.lastUsernameChange = new Date();
  }

  return prisma.student.update({
    where: { id: studentId },
    data: updateData,
  });
};

export const changeHrCredentials = async (
  hrUserId: number,
  data: {
    currentPassword: string;
    newPassword?: string;
    newEmail?: string;
    newFullName?: string;
  }
) => {
  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) throw new Error("HR user not found");

  const valid = await comparePassword(data.currentPassword, hrUser.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const updateData: any = {};

  if (data.newPassword) {
    updateData.passwordHash = await hashPassword(data.newPassword);
  }

  if (data.newEmail && data.newEmail !== hrUser.email) {
    const existing = await prisma.hrUser.findUnique({
      where: { email: data.newEmail },
    });
    if (existing) throw new Error("Email already in use");
    updateData.email = data.newEmail;
  }

  if (data.newFullName) {
    updateData.fullName = data.newFullName;
  }

  return prisma.hrUser.update({
    where: { id: hrUserId },
    data: updateData,
  });
};