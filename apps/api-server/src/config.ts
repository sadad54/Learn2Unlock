import { resolve } from "node:path";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databasePath: resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/learn2unlock.sqlite"),
  groqApiKey: process.env.GROQ_API_KEY ?? "gsk_REPLACE_WITH_YOUR_GROQ_API_KEY",
  groqModel: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:8081,http://localhost:8082").split(",").map((value) => value.trim()),
};

export function hasConfiguredGroqKey(): boolean {
  return config.groqApiKey.startsWith("gsk_") && !config.groqApiKey.includes("REPLACE_WITH");
}
