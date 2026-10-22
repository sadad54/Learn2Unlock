import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { resetDatabaseForTests } from "../src/database";

process.env.NODE_ENV = "test";
const { server } = await import("../src/server");
let baseUrl = "";

before(async () => {
  resetDatabaseForTests();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port.");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

test("health, parent auth, and persistent bootstrap work", async () => {
  const health = await request("/health");
  assert.equal(health.response.status, 200);
  const login = await request("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email: "parent@example.com", password: "password" }) });
  assert.equal(login.response.status, 200);
  const token = (login.body as { token: string }).token;
  const bootstrap = await request("/api/v1/bootstrap", { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(bootstrap.response.status, 200);
  assert.equal((bootstrap.body as { questions: unknown[] }).questions.length, 40);
});

test("child challenges are scored server-side and rewards are idempotent", async () => {
  const auth = await request("/api/v1/auth/child-demo", { method: "POST", body: JSON.stringify({ childId: "child-aina", pairingCode: "482715" }) });
  const token = (auth.body as { token: string }).token;
  const headers = { Authorization: `Bearer ${token}` };
  const started = await request("/api/v1/children/child-aina/challenges/start", { method: "POST", headers });
  assert.equal(started.response.status, 201);
  const payload = started.body as { attempt: { id: string }; questions: { id: string; correctAnswer: string }[] };
  const responses = payload.questions.map((question) => ({ questionId: question.id, submittedAnswer: question.correctAnswer }));
  const completed = await request(`/api/v1/attempts/${payload.attempt.id}/complete`, { method: "POST", headers, body: JSON.stringify({ responses }) });
  assert.equal((completed.body as { attempt: { scorePercent: number } }).attempt.scorePercent, 100);
  assert.equal((completed.body as { remainingMinutes: number }).remainingMinutes, 52);
  const repeated = await request(`/api/v1/attempts/${payload.attempt.id}/complete`, { method: "POST", headers, body: JSON.stringify({ responses }) });
  assert.equal((repeated.body as { remainingMinutes: number }).remainingMinutes, 52);
});

test("Groq drafts stay unavailable until the placeholder key is replaced", async () => {
  const login = await request("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email: "parent@example.com", password: "password" }) });
  const token = (login.body as { token: string }).token;
  const generated = await request("/api/v1/ai/questions/generate", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ schoolYear: 4, subject: "science", topic: "Materials", learningStandardCode: "4.7.1", language: "en", difficulty: "medium", type: "mcq", count: 2 }) });
  assert.equal(generated.response.status, 503);
  assert.equal((generated.body as { code: string }).code, "GROQ_NOT_CONFIGURED");
});
