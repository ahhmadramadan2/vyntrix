import { prisma } from "../../config/db";
import { sendApplicationStatusEmail } from "../../utils/email";
import { createNotification } from "../notifications/notifications.service";

export const applyToJob = async (
  studentId: number,
  jobId: number,
  coverLetter?: string
) => {
  const existing = await prisma.application.findUnique({
    where: { studentId_jobId: { studentId, jobId } },
  });
  if (existing) throw new Error("You have already applied to this job");

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "OPEN") throw new Error("Job is not available");

  return prisma.application.create({
    data: { studentId, jobId, coverLetter },
    include: { job: { include: { company: true } } },
  });
};

export const getJobApplicants = async (jobId: number) => {
  return prisma.application.findMany({
    where: { jobId },
    orderBy: { applicationDate: "desc" },
    include: {
      student: {
        include: {
          profile: true,
          university: true,
          skills: { include: { skill: true } },
          projects: true,
        },
      },
      job: true,
    },
  });
};


export const updateApplicationStatus = async (
  applicationId: number,
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED"
) => {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { applicationStatus: status },
    include: {
      student: true,
      job: { include: { company: true } },
    },
  });

  const { student, job } = application;

  // In-app notification
  const notifMessages: Record<string, { title: string; message: string; notifType: string } | null> = {
    ACCEPTED: {
      title: "Application Accepted!",
      message: `Congratulations! Your application for ${job.title} at ${job.company.companyName} has been accepted.`,
      notifType: "APPLICATION_ACCEPTED",
    },
    REJECTED: {
      title: "Application Update",
      message: `Your application for ${job.title} at ${job.company.companyName} was not selected this time.`,
      notifType: "APPLICATION_REJECTED",
    },
    REVIEWED: {
      title: "Application Under Review",
      message: `Your application for ${job.title} at ${job.company.companyName} is being reviewed.`,
      notifType: "APPLICATION_REVIEWED",
    },
    PENDING: null,
  };

  const notifData = notifMessages[status];

  if (notifData) {
    console.log("Creating notification for studentId:", student.id, "type:", notifData.notifType);
    try {
      await createNotification({
        studentId: student.id,
        title: notifData.title,
        message: notifData.message,
        type: notifData.notifType as any,
        link: "/student/applications",
      });
    } catch (err) {
      console.error("Notification creation failed:", err);
    }

    try {
      await sendApplicationStatusEmail({
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        jobTitle: job.title,
        companyName: job.company.companyName,
        status: status as any,
      });
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  return application;
};