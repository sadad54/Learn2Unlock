import { z } from "zod";
import {
  AdditionalTimeRequestSchema,
  ApplicationRecordSchema,
  ChallengeAttemptSchema,
  ChallengeRuleSchema,
  ChildProfileSchema,
  DeviceSchema,
  QuestionSchema,
  RewardTransactionSchema,
  ScreenTimeRuleSchema,
  UserSchema,
  type Question,
} from "../schemas/index";
import type { GenerateQuestionsParams } from "../repositories/contracts";

const AuthResponseSchema = z.object({ token: z.string(), user: UserSchema });
const ChildAuthResponseSchema = z.object({ token: z.string(), childId: z.string() });
export const BootstrapResponseSchema = z.object({ children: z.array(ChildProfileSchema), applications: z.array(ApplicationRecordSchema), questions: z.array(QuestionSchema), requests: z.array(AdditionalTimeRequestSchema), devices: z.array(DeviceSchema), screenTimeRules: z.array(ScreenTimeRuleSchema), challengeRules: z.array(ChallengeRuleSchema) });
export const ChildHomeResponseSchema = z.object({ child: ChildProfileSchema, devices: z.array(DeviceSchema), applications: z.array(ApplicationRecordSchema), screenTimeRules: z.array(ScreenTimeRuleSchema), challengeRule: ChallengeRuleSchema.nullable(), remainingMinutes: z.number(), pendingRequests: z.array(AdditionalTimeRequestSchema) });
const StartChallengeResponseSchema = z.object({ attempt: ChallengeAttemptSchema, questions: z.array(QuestionSchema) });
const CompleteChallengeResponseSchema = z.object({ attempt: ChallengeAttemptSchema, reward: RewardTransactionSchema, remainingMinutes: z.number() });

export type BootstrapResponse = z.infer<typeof BootstrapResponseSchema>;
export type ChildHomeResponse = z.infer<typeof ChildHomeResponseSchema>;
export type StartChallengeResponse = z.infer<typeof StartChallengeResponseSchema>;
export type CompleteChallengeResponse = z.infer<typeof CompleteChallengeResponseSchema>;

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); this.name = "ApiError"; }
}

export type TokenStore = { get(): Promise<string | null>; set(token: string): Promise<void>; remove(): Promise<void> };

export class Learn2UnlockApiClient {
  constructor(private readonly baseUrl: string, private readonly tokens: TokenStore) {}

  private async request<T>(path: string, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    const token = await this.tokens.get();
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    } catch {
      throw new ApiError("Cannot reach the Learn2Unlock server.", 0, "NETWORK_ERROR");
    }
    const payload = await response.json().catch(() => ({})) as { error?: string; code?: string };
    if (!response.ok) throw new ApiError(payload.error ?? `Request failed with HTTP ${response.status}.`, response.status, payload.code);
    return schema.parse(payload);
  }

  async login(email: string, password: string) { const result = await this.request("/auth/login", AuthResponseSchema, { method: "POST", body: JSON.stringify({ email, password }) }); await this.tokens.set(result.token); return result.user; }
  async register(email: string, password: string) { const result = await this.request("/auth/register", AuthResponseSchema, { method: "POST", body: JSON.stringify({ email, password }) }); await this.tokens.set(result.token); return result.user; }
  async childDemoLogin(childId = "child-aina") { const result = await this.request("/auth/child-demo", ChildAuthResponseSchema, { method: "POST", body: JSON.stringify({ childId, pairingCode: "482715" }) }); await this.tokens.set(result.token); return result; }
  async logout() { try { await this.request("/auth/logout", z.object({ success: z.boolean() }), { method: "POST" }); } finally { await this.tokens.remove(); } }
  bootstrap() { return this.request("/bootstrap", BootstrapResponseSchema); }
  completeOnboarding(input: { child: { nickname: string; schoolYear: number; language: "ms" | "en"; subjects: Question["subject"][] }; controlledApps: string[]; screenTime: { dailyLimitMinutes: number; weekendLimitMinutes: number; bedtime: string; warningMinutesBefore: number }; challenge: { questionCount: number; passingScorePercent: number; rewardMinutes: 5 | 10 | 15; maxDailyRewardMinutes: number; maxAttempts: number; requiresParentApproval: boolean } }) { return this.request("/onboarding/complete", z.object({ child: ChildProfileSchema, screenTimeRule: ScreenTimeRuleSchema, challengeRule: ChallengeRuleSchema, controlledRules: z.array(ScreenTimeRuleSchema) }), { method: "POST", body: JSON.stringify(input) }); }
  childHome(childId: string) { return this.request(`/children/${childId}/home`, ChildHomeResponseSchema); }
  listQuestions() { return this.request("/questions", z.array(QuestionSchema)); }
  createQuestion(question: Omit<Question, "id" | "createdAt">) { return this.request("/questions", QuestionSchema, { method: "POST", body: JSON.stringify(question) }); }
  updateQuestion(id: string, patch: Partial<Question>) { return this.request(`/questions/${id}`, QuestionSchema, { method: "PATCH", body: JSON.stringify(patch) }); }
  generateQuestions(params: GenerateQuestionsParams) { return this.request("/ai/questions/generate", z.array(QuestionSchema), { method: "POST", body: JSON.stringify(params) }); }
  startChallenge(childId: string) { return this.request(`/children/${childId}/challenges/start`, StartChallengeResponseSchema, { method: "POST" }); }
  completeChallenge(attemptId: string, responses: { questionId: string; submittedAnswer: string }[]) { return this.request(`/attempts/${attemptId}/complete`, CompleteChallengeResponseSchema, { method: "POST", body: JSON.stringify({ responses }) }); }
  requestTime(childId: string, appId: string, requestedMinutes: number) { return this.request(`/children/${childId}/time-requests`, AdditionalTimeRequestSchema, { method: "POST", body: JSON.stringify({ appId, requestedMinutes }) }); }
  decideTimeRequest(id: string, status: "approved" | "rejected" | "modified", requestedMinutes?: number) { return this.request(`/time-requests/${id}`, z.object({ request: AdditionalTimeRequestSchema, remainingMinutes: z.number() }), { method: "PATCH", body: JSON.stringify({ status, ...(requestedMinutes === undefined ? {} : { requestedMinutes }) }) }); }
}
