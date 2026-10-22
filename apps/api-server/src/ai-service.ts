import { randomUUID } from "node:crypto";
import { QuestionSchema, type GenerateQuestionsParams, type Question } from "@learn2unlock/shared";
import { z } from "zod";
import { config, hasConfiguredGroqKey } from "./config";
import { listEntities } from "./database";

const GeneratedQuestionSchema = z.object({
  text: z.string().min(8),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(8),
  confidence: z.enum(["high", "low"]),
});
const GroqPayloadSchema = z.object({ questions: z.array(GeneratedQuestionSchema) });

const responseSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctAnswer: { type: "string" },
          explanation: { type: "string" },
          confidence: { type: "string", enum: ["high", "low"] },
        },
        required: ["text", "options", "correctAnswer", "explanation", "confidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
} as const;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function passesSafetyFilter(question: z.infer<typeof GeneratedQuestionSchema>, existing: Question[]): boolean {
  const text = normalize(question.text);
  const blocked = ["address", "phone number", "password", "email address", "self harm", "weapon", "sexual"];
  if (blocked.some((term) => text.includes(term))) return false;
  if (!question.options.includes(question.correctAnswer)) return false;
  if (new Set(question.options.map(normalize)).size !== question.options.length) return false;
  if (!normalize(question.explanation).includes(normalize(question.correctAnswer))) return false;
  return !existing.some((item) => normalize(item.text) === text);
}

export class GroqConfigurationError extends Error {}

export async function generateQuestionsWithGroq(params: GenerateQuestionsParams): Promise<Question[]> {
  if (!hasConfiguredGroqKey()) {
    throw new GroqConfigurationError("Groq is not configured. Replace GROQ_API_KEY in apps/api-server/.env.");
  }
  const prompt = `Create exactly ${params.count} ${params.difficulty} ${params.type} questions for Malaysian KSSR Year ${params.schoolYear} ${params.subject}, topic ${params.topic}, learning standard ${params.learningStandardCode}, language ${params.language}. Every explanation must explicitly contain the correct answer. Avoid personal-data requests, unsafe content, trick questions, and ambiguous answers.${params.additionalInstructions ? ` Additional instructions: ${params.additionalInstructions}` : ""}`;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.groqApiKey}` },
    body: JSON.stringify({
      model: config.groqModel,
      temperature: 0.2,
      max_completion_tokens: 5000,
      messages: [
        { role: "system", content: "You generate curriculum-aligned educational question drafts. Output only schema-compliant JSON. You never modify rules, score attempts, or award time." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: { name: "learn2unlock_questions", strict: true, schema: responseSchema } },
    }),
  });
  const raw = await response.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  if (!response.ok) throw new Error(raw.error?.message ?? `Groq request failed with HTTP ${response.status}`);
  const content = raw.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");
  const generated = GroqPayloadSchema.parse(JSON.parse(content));
  const existing = listEntities<Question>("questions");
  const now = new Date().toISOString();
  return generated.questions
    .filter((question) => passesSafetyFilter(question, existing))
    .slice(0, params.count)
    .map((question) => QuestionSchema.parse({
      id: `question-ai-${randomUUID()}`,
      ...question,
      type: params.type,
      ...(params.type === "mcq" ? {} : { options: undefined }),
      subject: params.subject,
      topic: params.topic,
      learningStandardCode: params.learningStandardCode,
      difficulty: params.difficulty,
      language: params.language,
      source: "ai_generated",
      status: "pending_review",
      createdAt: now,
    }));
}
