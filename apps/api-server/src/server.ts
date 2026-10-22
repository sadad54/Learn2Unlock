import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import {
  AdditionalTimeRequestSchema,
  ChallengeAttemptSchema,
  ChallengeRuleSchema,
  ChildProfileSchema,
  DeviceSchema,
  QuestionSchema,
  RewardTransactionSchema,
  ScreenTimeRuleSchema,
  UserSchema,
  type AdditionalTimeRequest,
  type ChallengeAttempt,
  type ChallengeRule,
  type ChildProfile,
  type Device,
  type GenerateQuestionsParams,
  type Question,
  type RewardTransaction,
  type ScreenTimeRule,
  type User,
} from "@learn2unlock/shared";
import { z } from "zod";
import { config } from "./config";
import { addBalance, database, deleteEntity, getBalance, getEntity, listEntities, patchEntity, seedDatabase, setBalance, upsertEntity, type EntityType } from "./database";
import { createToken, hashPassword, verifyPassword } from "./security";
import { generateQuestionsWithGroq, GroqConfigurationError } from "./ai-service";

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const RegisterSchema = LoginSchema.extend({ familyId: z.string().min(1).default("family-01") });
const GenerateSchema = z.object({ schoolYear: z.number().min(1).max(6), subject: z.enum(["math", "science", "bm", "english"]), topic: z.string().min(1), learningStandardCode: z.string().min(1), language: z.enum(["ms", "en"]), difficulty: z.enum(["easy", "medium", "hard"]), type: z.enum(["mcq", "true_false", "numeric"]), count: z.number().min(1).max(10), additionalInstructions: z.string().max(500).optional() });
const CompleteAttemptSchema = z.object({ responses: z.array(z.object({ questionId: z.string(), submittedAnswer: z.string() })) });
const RequestTimeSchema = z.object({ appId: z.string(), requestedMinutes: z.number().min(5).max(60) });
const DecideRequestSchema = z.object({ status: z.enum(["approved", "rejected", "modified"]), requestedMinutes: z.number().min(5).max(60).optional() });
const CompleteOnboardingSchema = z.object({
  child: ChildProfileSchema.pick({ nickname: true, schoolYear: true, language: true, subjects: true }),
  controlledApps: z.array(z.string()),
  screenTime: z.object({ dailyLimitMinutes: z.number().min(5), weekendLimitMinutes: z.number().min(5), bedtime: z.string(), warningMinutesBefore: z.number().min(1) }),
  challenge: ChallengeRuleSchema.pick({ questionCount: true, passingScorePercent: true, rewardMinutes: true, maxDailyRewardMinutes: true, maxAttempts: true, requiresParentApproval: true }),
});

type Principal = { id: string; kind: "parent" | "child" };
class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }

function applyCors(request: IncomingMessage, response: ServerResponse): void {
  const origin = request.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
}

function json(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_000_000) throw new HttpError(413, "Request body is too large.");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new HttpError(400, "Invalid JSON body."); }
}

function id(prefix: string): string { return `${prefix}-${randomUUID()}`; }
function now(): string { return new Date().toISOString(); }

function createSession(principalId: string): string {
  const token = createToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  database.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, principalId, expiresAt);
  return token;
}

function authenticate(request: IncomingMessage): Principal {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Authentication required.");
  const row = database.prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?").get(token) as { user_id: string; expires_at: string } | undefined;
  if (!row || Date.parse(row.expires_at) <= Date.now()) throw new HttpError(401, "Session is invalid or expired.");
  return row.user_id.startsWith("child:") ? { id: row.user_id.slice(6), kind: "child" } : { id: row.user_id, kind: "parent" };
}

function requireParent(request: IncomingMessage): Principal {
  const principal = authenticate(request);
  if (principal.kind !== "parent") throw new HttpError(403, "Parent access required.");
  return principal;
}

function getFamilyId(userId: string): string {
  return userId === "user-parent-01" ? "family-01" : `family-${userId}`;
}

function getChildHome(childId: string) {
  const child = getEntity<ChildProfile>("childProfiles", childId);
  if (!child) throw new HttpError(404, "Child profile not found.");
  return {
    child,
    devices: listEntities<Device>("devices").filter((item) => item.childId === childId),
    applications: listEntities("applications"),
    screenTimeRules: listEntities<ScreenTimeRule>("screenTimeRules").filter((item) => item.childId === childId),
    challengeRule: listEntities<ChallengeRule>("challengeRules").find((item) => item.childId === childId) ?? null,
    remainingMinutes: getBalance(childId),
    pendingRequests: listEntities<AdditionalTimeRequest>("additionalTimeRequests").filter((item) => item.childId === childId && item.status === "pending"),
  };
}

async function route(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const parts = url.pathname.split("/").filter(Boolean);
  if (method === "OPTIONS") { response.writeHead(204); response.end(); return; }
  if (method === "GET" && url.pathname === "/health") { json(response, 200, { status: "ok", service: "learn2unlock-api", database: "sqlite", groqModel: config.groqModel }); return; }

  if (method === "POST" && url.pathname === "/api/v1/auth/login") {
    const input = LoginSchema.parse(await readJson(request));
    const user = listEntities<User>("users").find((item) => item.email.toLowerCase() === input.email.toLowerCase());
    if (!user) throw new HttpError(401, "Invalid email or password.");
    const credential = database.prepare("SELECT password_hash FROM credentials WHERE user_id = ?").get(user.id) as { password_hash: string } | undefined;
    if (!credential || !verifyPassword(input.password, credential.password_hash)) throw new HttpError(401, "Invalid email or password.");
    json(response, 200, { token: createSession(user.id), user }); return;
  }
  if (method === "POST" && url.pathname === "/api/v1/auth/register") {
    const input = RegisterSchema.parse(await readJson(request));
    if (listEntities<User>("users").some((item) => item.email.toLowerCase() === input.email.toLowerCase())) throw new HttpError(409, "Email is already registered.");
    const user = UserSchema.parse({ id: id("user"), email: input.email, role: "parent", createdAt: now() });
    upsertEntity("users", user);
    database.prepare("INSERT INTO credentials (user_id, password_hash) VALUES (?, ?)").run(user.id, hashPassword(input.password));
    json(response, 201, { token: createSession(user.id), user }); return;
  }
  if (method === "POST" && url.pathname === "/api/v1/auth/child-demo") {
    const body = z.object({ childId: z.string().default("child-aina"), pairingCode: z.string() }).parse(await readJson(request));
    if (body.pairingCode !== "482715" || !getEntity("childProfiles", body.childId)) throw new HttpError(401, "Invalid pairing code.");
    json(response, 200, { token: createSession(`child:${body.childId}`), childId: body.childId }); return;
  }
  if (method === "POST" && url.pathname === "/api/v1/auth/logout") {
    authenticate(request);
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    database.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    json(response, 200, { success: true }); return;
  }

  if (method === "GET" && url.pathname === "/api/v1/bootstrap") {
    const principal = requireParent(request);
    const familyId = getFamilyId(principal.id);
    const children = listEntities<ChildProfile>("childProfiles").filter((item) => item.familyId === familyId);
    json(response, 200, { children, applications: listEntities("applications"), questions: listEntities<Question>("questions"), requests: listEntities<AdditionalTimeRequest>("additionalTimeRequests"), devices: listEntities<Device>("devices").filter((device) => children.some((child) => child.id === device.childId)), screenTimeRules: listEntities<ScreenTimeRule>("screenTimeRules").filter((rule) => children.some((child) => child.id === rule.childId)), challengeRules: listEntities<ChallengeRule>("challengeRules").filter((rule) => children.some((child) => child.id === rule.childId)) }); return;
  }

  if (method === "POST" && url.pathname === "/api/v1/onboarding/complete") {
    requireParent(request);
    const input = CompleteOnboardingSchema.parse(await readJson(request));
    const currentChild = getEntity<ChildProfile>("childProfiles", "child-aina");
    if (!currentChild) throw new HttpError(404, "Demo child profile not found.");
    const child = ChildProfileSchema.parse({ ...currentChild, ...input.child });
    const screenTimeRule = ScreenTimeRuleSchema.parse({ id: "screen-rule-aina", childId: child.id, appId: null, ...input.screenTime, version: (getEntity<ScreenTimeRule>("screenTimeRules", "screen-rule-aina")?.version ?? 0) + 1, updatedAt: now() });
    const currentChallenge = getEntity<ChallengeRule>("challengeRules", "challenge-rule-aina");
    const challengeRule = ChallengeRuleSchema.parse({ ...currentChallenge, id: "challenge-rule-aina", childId: child.id, latestRewardTime: input.screenTime.bedtime, ...input.challenge });
    upsertEntity("childProfiles", child); upsertEntity("screenTimeRules", screenTimeRule); upsertEntity("challengeRules", challengeRule);
    const controlledRules = input.controlledApps.map((appId) => ScreenTimeRuleSchema.parse({ id: `screen-rule-aina-${appId}`, childId: child.id, appId, dailyLimitMinutes: input.screenTime.dailyLimitMinutes, warningMinutesBefore: input.screenTime.warningMinutesBefore, bedtime: input.screenTime.bedtime, weekendLimitMinutes: input.screenTime.weekendLimitMinutes, version: 1, updatedAt: now() }));
    for (const rule of controlledRules) upsertEntity("screenTimeRules", rule);
    json(response, 200, { child, screenTimeRule, challengeRule, controlledRules }); return;
  }

  if (method === "GET" && parts[0] === "api" && parts[1] === "v1" && parts[2] === "children" && parts[4] === "home") {
    const principal = authenticate(request); const childId = parts[3];
    if (!childId || (principal.kind === "child" && principal.id !== childId)) throw new HttpError(403, "Child access denied.");
    json(response, 200, getChildHome(childId)); return;
  }
  if (method === "POST" && url.pathname === "/api/v1/children") {
    const principal = requireParent(request);
    const input = ChildProfileSchema.omit({ id: true, createdAt: true, familyId: true }).parse(await readJson(request));
    const child = ChildProfileSchema.parse({ ...input, id: id("child"), familyId: getFamilyId(principal.id), createdAt: now() });
    upsertEntity("childProfiles", child); setBalance(child.id, 0); json(response, 201, child); return;
  }

  if (method === "GET" && url.pathname === "/api/v1/questions") {
    authenticate(request);
    const filters = ["subject", "topic", "difficulty", "source", "status"] as const;
    const questions = listEntities<Question>("questions").filter((question) => filters.every((key) => !url.searchParams.has(key) || question[key] === url.searchParams.get(key)));
    json(response, 200, questions); return;
  }
  if (method === "POST" && url.pathname === "/api/v1/questions") {
    requireParent(request); const draft = QuestionSchema.omit({ id: true, createdAt: true }).parse(await readJson(request));
    const question = QuestionSchema.parse({ ...draft, id: id("question"), createdAt: now() }); upsertEntity("questions", question); json(response, 201, question); return;
  }
  if (parts[0] === "api" && parts[1] === "v1" && parts[2] === "questions" && parts[3]) {
    requireParent(request); const questionId = parts[3];
    if (method === "PATCH") { const current = getEntity<Question>("questions", questionId); if (!current) throw new HttpError(404, "Question not found."); const patch = await readJson(request) as object; const updated = QuestionSchema.parse({ ...current, ...patch, id: questionId }); upsertEntity("questions", updated); json(response, 200, updated); return; }
    if (method === "DELETE") { if (!deleteEntity("questions", questionId)) throw new HttpError(404, "Question not found."); response.writeHead(204); response.end(); return; }
  }
  if (method === "POST" && url.pathname === "/api/v1/ai/questions/generate") {
    requireParent(request); const params = GenerateSchema.parse(await readJson(request)) as GenerateQuestionsParams;
    const questions = await generateQuestionsWithGroq(params); for (const question of questions) upsertEntity("questions", question); json(response, 201, questions); return;
  }

  if (method === "POST" && parts[0] === "api" && parts[1] === "v1" && parts[2] === "children" && parts[4] === "challenges" && parts[5] === "start") {
    const principal = authenticate(request); const childId = parts[3];
    if (!childId || (principal.kind === "child" && principal.id !== childId)) throw new HttpError(403, "Child access denied.");
    const rule = listEntities<ChallengeRule>("challengeRules").find((item) => item.childId === childId); if (!rule) throw new HttpError(404, "Challenge rule not found.");
    const today = now().slice(0, 10);
    const attemptsToday = listEntities<ChallengeAttempt>("challengeAttempts").filter((item) => item.childId === childId && item.startedAt.startsWith(today)).length;
    if (attemptsToday >= rule.maxAttempts) throw new HttpError(429, "Daily challenge attempt limit reached.");
    const questions = listEntities<Question>("questions").filter((item) => item.status === "approved" && item.subject === "science").slice(0, rule.questionCount);
    const attemptNumber = listEntities<ChallengeAttempt>("challengeAttempts").filter((item) => item.childId === childId).length + 1;
    const attempt = ChallengeAttemptSchema.parse({ id: id("attempt"), childId, questionIds: questions.map((item) => item.id), responses: [], scorePercent: 0, passed: false, attemptNumber, startedAt: now() });
    upsertEntity("challengeAttempts", attempt); json(response, 201, { attempt, questions }); return;
  }
  if (method === "POST" && parts[0] === "api" && parts[1] === "v1" && parts[2] === "attempts" && parts[4] === "complete") {
    const principal = authenticate(request); const attemptId = parts[3]; const attempt = attemptId ? getEntity<ChallengeAttempt>("challengeAttempts", attemptId) : null;
    if (!attempt) throw new HttpError(404, "Challenge attempt not found."); if (principal.kind === "child" && principal.id !== attempt.childId) throw new HttpError(403, "Child access denied.");
    const input = CompleteAttemptSchema.parse(await readJson(request)); const questions = attempt.questionIds.map((questionId) => getEntity<Question>("questions", questionId)).filter((item): item is Question => item !== null);
    const responses = questions.map((question) => { const submittedAnswer = input.responses.find((item) => item.questionId === question.id)?.submittedAnswer ?? ""; return { questionId: question.id, submittedAnswer, isCorrect: submittedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase() }; });
    const scorePercent = Math.round(responses.filter((item) => item.isCorrect).length / Math.max(questions.length, 1) * 100); const rule = listEntities<ChallengeRule>("challengeRules").find((item) => item.childId === attempt.childId); if (!rule) throw new HttpError(404, "Challenge rule not found."); const passed = scorePercent >= rule.passingScorePercent;
    const completed = ChallengeAttemptSchema.parse({ ...attempt, responses, scorePercent, passed, completedAt: now() }); upsertEntity("challengeAttempts", completed);
    const rewardKey = `${attempt.id}:reward`; let reward = listEntities<RewardTransaction>("rewardTransactions").find((item) => item.idempotencyKey === rewardKey) ?? null;
    if (!reward) { const today = now().slice(0, 10); const awardedToday = listEntities<RewardTransaction>("rewardTransactions").filter((item) => item.childId === attempt.childId && item.createdAt.startsWith(today) && ["auto_granted", "approved"].includes(item.status)).reduce((total, item) => total + item.minutesAwarded, 0); const minutesAwarded = passed ? Math.max(0, Math.min(rule.rewardMinutes, rule.maxDailyRewardMinutes - awardedToday)) : 0; const status = !passed || minutesAwarded === 0 ? "rejected" : rule.requiresParentApproval ? "pending_parent_approval" : "auto_granted"; reward = RewardTransactionSchema.parse({ id: id("reward"), childId: attempt.childId, challengeAttemptId: attempt.id, minutesAwarded, appId: null, idempotencyKey: rewardKey, status, createdAt: now() }); upsertEntity("rewardTransactions", reward); if (status === "auto_granted") addBalance(attempt.childId, reward.minutesAwarded); }
    json(response, 200, { attempt: completed, reward, remainingMinutes: getBalance(attempt.childId) }); return;
  }

  if (method === "POST" && parts[0] === "api" && parts[1] === "v1" && parts[2] === "children" && parts[4] === "time-requests") {
    const principal = authenticate(request); const childId = parts[3]; if (!childId || (principal.kind === "child" && principal.id !== childId)) throw new HttpError(403, "Child access denied.");
    const input = RequestTimeSchema.parse(await readJson(request)); const timeRequest = AdditionalTimeRequestSchema.parse({ id: id("request"), childId, ...input, status: "pending", createdAt: now() }); upsertEntity("additionalTimeRequests", timeRequest); json(response, 201, timeRequest); return;
  }
  if (method === "PATCH" && parts[0] === "api" && parts[1] === "v1" && parts[2] === "time-requests" && parts[3]) {
    requireParent(request); const requestId = parts[3]; const current = getEntity<AdditionalTimeRequest>("additionalTimeRequests", requestId); if (!current) throw new HttpError(404, "Time request not found.");
    const input = DecideRequestSchema.parse(await readJson(request)); const updated = AdditionalTimeRequestSchema.parse({ ...current, ...input }); upsertEntity("additionalTimeRequests", updated); if ((input.status === "approved" || input.status === "modified") && current.status === "pending") addBalance(current.childId, input.requestedMinutes ?? current.requestedMinutes); json(response, 200, { request: updated, remainingMinutes: getBalance(current.childId) }); return;
  }

  const entityRoutes: Record<string, { type: EntityType; schema: z.ZodTypeAny }> = { "screen-time-rules": { type: "screenTimeRules", schema: ScreenTimeRuleSchema }, "challenge-rules": { type: "challengeRules", schema: ChallengeRuleSchema }, devices: { type: "devices", schema: DeviceSchema } };
  const entityRoute = entityRoutes[parts[2] ?? ""];
  if (parts[0] === "api" && parts[1] === "v1" && entityRoute) {
    requireParent(request);
    if (method === "GET") { const childId = url.searchParams.get("childId"); json(response, 200, listEntities(entityRoute.type).filter((entity) => !childId || (entity as { childId?: string }).childId === childId)); return; }
    if (method === "POST") { const entity = entityRoute.schema.parse({ ...(await readJson(request) as object), id: id(parts[2] ?? "entity") }); upsertEntity(entityRoute.type, entity); json(response, 201, entity); return; }
    if (method === "PATCH" && parts[3]) { const current = getEntity(entityRoute.type, parts[3]); if (!current) throw new HttpError(404, "Entity not found."); const patch = await readJson(request) as object; const updated = entityRoute.schema.parse({ ...current, ...patch, id: parts[3] }); upsertEntity(entityRoute.type, updated); json(response, 200, updated); return; }
  }
  throw new HttpError(404, "Route not found.");
}

seedDatabase();
export const server = createServer(async (request, response) => {
  applyCors(request, response);
  try { await route(request, response); }
  catch (error) {
    if (error instanceof z.ZodError) { json(response, 400, { error: "Validation failed.", details: error.flatten() }); return; }
    if (error instanceof GroqConfigurationError) { json(response, 503, { error: error.message, code: "GROQ_NOT_CONFIGURED" }); return; }
    if (error instanceof HttpError) { json(response, error.status, { error: error.message }); return; }
    console.error(error); json(response, 500, { error: error instanceof Error ? error.message : "Internal server error." });
  }
});

if (process.env.NODE_ENV !== "test") server.listen(config.port, "0.0.0.0", () => console.log(`Learn2Unlock API listening on http://localhost:${config.port}`));
