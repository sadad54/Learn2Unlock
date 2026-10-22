import assert from "node:assert/strict";
import test from "node:test";
import {
  Learn2UnlockSeedSchema,
  MemoryStorageAdapter,
  createMockRepositories,
  seedData,
  seedSummary,
} from "../src/index";

test("the complete seed satisfies the frontend contracts", () => {
  const parsed = Learn2UnlockSeedSchema.parse(seedData);
  assert.equal(parsed.childProfiles.length, 2);
  assert.equal(parsed.questions.length, 40);
  assert.deepEqual(seedSummary.questionsPerSubject, {
    math: 10,
    science: 10,
    bm: 10,
    english: 10,
  });
  assert.ok(parsed.childProfiles.every((child) => child.nickname.length <= 30));
});

test("repositories seed once and persist updates through the adapter", async () => {
  const storage = new MemoryStorageAdapter();
  const repositories = createMockRepositories(storage);

  assert.equal((await repositories.childProfiles.list("family-01")).length, 2);
  const updated = await repositories.childProfiles.update("child-aina", { schoolYear: 5 });
  assert.equal(updated.schoolYear, 5);

  const secondInstance = createMockRepositories(storage);
  assert.equal((await secondInstance.childProfiles.getById("child-aina"))?.schoolYear, 5);
});

test("reward idempotency prevents duplicate time awards", async () => {
  const repositories = createMockRepositories(new MemoryStorageAdapter());
  const draft = {
    childId: "child-aina",
    challengeAttemptId: "attempt-new",
    minutesAwarded: 10,
    appId: null,
    idempotencyKey: "attempt-new:reward",
    status: "auto_granted" as const,
    createdAt: "2026-07-18T04:00:00.000Z",
  };

  const first = await repositories.rewardTransactions.create(draft);
  const second = await repositories.rewardTransactions.create(draft);
  assert.equal(first.id, second.id);
  assert.equal((await repositories.rewardTransactions.listByChild("child-aina")).filter((reward) => reward.idempotencyKey === draft.idempotencyKey).length, 1);
});

test("mock AI only creates pending-review content", async () => {
  const repositories = createMockRepositories(new MemoryStorageAdapter());
  const generated = await repositories.ai.generateQuestions({
    schoolYear: 4,
    subject: "science",
    topic: "Properties of materials",
    learningStandardCode: "4.7.1",
    language: "en",
    difficulty: "medium",
    type: "mcq",
    count: 5,
  });

  assert.equal(generated.length, 5);
  assert.ok(generated.every((question) => question.status === "pending_review"));
  assert.ok(generated.some((question) => question.confidence === "low"));
});
