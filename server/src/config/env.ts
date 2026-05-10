import dotenv from "dotenv";
dotenv.config();

// Validate all required environment variables at startup
// If any are missing the server will crash immediately with a clear message

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "PORT",
  "NODE_ENV",
  "CLIENT_URL",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL:              process.env.DATABASE_URL!,
  JWT_SECRET:                process.env.JWT_SECRET!,
  JWT_EXPIRES_IN:            process.env.JWT_EXPIRES_IN!,
  PORT:                      parseInt(process.env.PORT!, 10),
  NODE_ENV:                  process.env.NODE_ENV!,
  CLIENT_URL:                process.env.CLIENT_URL!,
  BCRYPT_ROUNDS:             parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
  SUPABASE_URL:              process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};