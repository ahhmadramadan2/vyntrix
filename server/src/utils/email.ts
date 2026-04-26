import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ApplicationEmailData {
  studentName: string;
  studentEmail: string;
  jobTitle: string;
  companyName: string;
  status: "ACCEPTED" | "REJECTED" | "REVIEWED";
}

const statusContent = {
  ACCEPTED: {
    subject: "🎉 Congratulations! Your application was accepted",
    heading: "Great news!",
    color: "#22c55e",
    message: (job: string, company: string) =>
      `Your application for <strong>${job}</strong> at <strong>${company}</strong> has been <strong style="color:#22c55e">accepted</strong>. The HR team will be in touch with you soon regarding next steps.`,
  },
  REJECTED: {
    subject: "Update on your application",
    heading: "Application Update",
    color: "#ef4444",
    message: (job: string, company: string) =>
      `Thank you for applying for <strong>${job}</strong> at <strong>${company}</strong>. After careful consideration, the team has decided not to move forward with your application at this time. Keep applying — the right opportunity is out there!`,
  },
  REVIEWED: {
    subject: "👀 Your application is being reviewed",
    heading: "Application Under Review",
    color: "#4f6ef7",
    message: (job: string, company: string) =>
      `Your application for <strong>${job}</strong> at <strong>${company}</strong> is currently being <strong style="color:#4f6ef7">reviewed</strong> by the HR team. We will notify you of any updates.`,
  },
};

export const sendApplicationStatusEmail = async (
  data: ApplicationEmailData
) => {
  const content = statusContent[data.status];

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: data.studentEmail,
    subject: content.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0d0f1a;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f1a;min-height:100vh;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1a1d2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
                      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <div style="width:40px;height:40px;background:#4f6ef7;border-radius:10px;display:inline-block;line-height:40px;text-align:center;">
                          <span style="color:white;font-weight:bold;font-size:18px;">V</span>
                        </div>
                        <span style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Vyntrix</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="background:#13151f;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);padding:40px 32px;">
                      <div style="width:56px;height:56px;background:${content.color}20;border:1px solid ${content.color}40;border-radius:14px;margin:0 auto 24px;text-align:center;line-height:56px;">
                        <span style="font-size:24px;">${data.status === "ACCEPTED" ? "🎉" : data.status === "REJECTED" ? "📋" : "👀"}</span>
                      </div>
                      <h1 style="color:white;font-size:24px;font-weight:700;text-align:center;margin:0 0 8px;">${content.heading}</h1>
                      <p style="color:#94a3b8;text-align:center;margin:0 0 32px;">Hi ${data.studentName},</p>
                      <div style="background:#1a1d2e;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:32px;">
                        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0;">
                          ${content.message(data.jobTitle, data.companyName)}
                        </p>
                      </div>
                      <div style="text-align:center;">
<a href="https://vyntrix-psi.vercel.app/student/applications"                          style="display:inline-block;background:#4f6ef7;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
                          View My Applications
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#1a1d2e;border:1px solid rgba(255,255,255,0.08);border-radius:0 0 16px 16px;padding:24px;text-align:center;">
                      <p style="color:#475569;font-size:13px;margin:0;">
                        You received this email because you applied for a job on Vyntrix.<br>
                        © 2025 Vyntrix. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};
export const sendPasswordResetEmail = async (data: {
  name: string;
  email: string;
  token: string;
  role: "STUDENT" | "HR";
}) => {
 const resetUrl = `https://vyntrix-psi.vercel.app/reset-password?token=${data.token}&role=${data.role}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: data.email,
    subject: "Reset your Vyntrix password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0d0f1a;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                  <tr>
                    <td style="background:#1a1d2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
                      <div style="width:40px;height:40px;background:#4f6ef7;border-radius:10px;display:inline-block;line-height:40px;text-align:center;margin-bottom:8px;">
                        <span style="color:white;font-weight:bold;font-size:18px;">V</span>
                      </div>
                      <span style="color:white;font-size:22px;font-weight:700;display:block;">Vyntrix</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#13151f;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);padding:40px 32px;text-align:center;">
                      <div style="width:56px;height:56px;background:#4f6ef720;border:1px solid #4f6ef740;border-radius:14px;margin:0 auto 24px;line-height:56px;">
                        <span style="font-size:24px;">🔐</span>
                      </div>
                      <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 8px;">Reset your password</h1>
                      <p style="color:#94a3b8;margin:0 0 32px;">Hi ${data.name}, click the button below to reset your password. This link expires in 1 hour.</p>
                      <a href="${resetUrl}" style="display:inline-block;background:#4f6ef7;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
                        Reset Password
                      </a>
                      <p style="color:#475569;font-size:13px;margin:24px 0 0;">If you did not request this, you can safely ignore this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#1a1d2e;border:1px solid rgba(255,255,255,0.08);border-radius:0 0 16px 16px;padding:24px;text-align:center;">
                      <p style="color:#475569;font-size:13px;margin:0;">© 2025 Vyntrix. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};