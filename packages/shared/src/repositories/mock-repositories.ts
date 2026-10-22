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
  type AdditionalTimeRequest,
  type ApplicationRecord,
  type ChallengeAttempt,
  type ChallengeRule,
  type ChildProfile,
  type Device,
  type Question,
  type RewardTransaction,
  type ScreenTimeRule,
  type User,
} from "../schemas/index";
import { seedData } from "../seed-data/index";
import { PersistentCollection } from "./collection";
import type {
  AdditionalTimeRequestRepository,
  AiRepository,
  ApplicationRepository,
  ChallengeAttemptRepository,
  ChallengeRuleRepository,
  ChildProfileRepository,
  DeviceRepository,
  GenerateQuestionsParams,
  QuestionFilter,
  QuestionRepository,
  RepositoryBundle,
  RewardTransactionRepository,
  ScreenTimeRuleRepository,
  UserRepository,
} from "./contracts";
import type { StorageAdapter } from "./storage";

const namespace = "learn2unlock:v1";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

class MockUserRepository implements UserRepository {
  constructor(private readonly data: PersistentCollection<User>) {}
  async findByEmail(email: string) { return (await this.data.list()).find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null; }
  async getById(id: string) { return this.data.getById(id); }
}

class MockChildProfileRepository implements ChildProfileRepository {
  constructor(private readonly data: PersistentCollection<ChildProfile>) {}
  async list(familyId: string) { return (await this.data.list()).filter((child) => child.familyId === familyId); }
  async getById(id: string) { return this.data.getById(id); }
  async create(draft: Omit<ChildProfile, "id" | "createdAt">) { return this.data.create({ ...draft, id: makeId("child"), createdAt: now() }); }
  async update(id: string, patch: Partial<ChildProfile>) { return this.data.update(id, patch); }
}

class MockDeviceRepository implements DeviceRepository {
  constructor(private readonly data: PersistentCollection<Device>) {}
  async listByChild(childId: string) { return (await this.data.list()).filter((device) => device.childId === childId); }
  async getById(id: string) { return this.data.getById(id); }
  async create(draft: Omit<Device, "id">) { return this.data.create({ ...draft, id: makeId("device") }); }
  async update(id: string, patch: Partial<Device>) { return this.data.update(id, patch); }
}

class MockApplicationRepository implements ApplicationRepository {
  constructor(private readonly data: PersistentCollection<ApplicationRecord>) {}
  async list() { return this.data.list(); }
  async getById(id: string) { return this.data.getById(id); }
  async create(draft: Omit<ApplicationRecord, "id">) { return this.data.create({ ...draft, id: makeId("app") }); }
  async update(id: string, patch: Partial<ApplicationRecord>) { return this.data.update(id, patch); }
}

class MockScreenTimeRuleRepository implements ScreenTimeRuleRepository {
  constructor(private readonly data: PersistentCollection<ScreenTimeRule>) {}
  async listByChild(childId: string) { return (await this.data.list()).filter((rule) => rule.childId === childId); }
  async create(draft: Omit<ScreenTimeRule, "id">) { return this.data.create({ ...draft, id: makeId("screen-rule") }); }
  async update(id: string, patch: Partial<ScreenTimeRule>) { return this.data.update(id, patch); }
}

class MockChallengeRuleRepository implements ChallengeRuleRepository {
  constructor(private readonly data: PersistentCollection<ChallengeRule>) {}
  async getByChild(childId: string) { return (await this.data.list()).find((rule) => rule.childId === childId) ?? null; }
  async create(draft: Omit<ChallengeRule, "id">) { return this.data.create({ ...draft, id: makeId("challenge-rule") }); }
  async update(id: string, patch: Partial<ChallengeRule>) { return this.data.update(id, patch); }
}

class MockQuestionRepository implements QuestionRepository {
  constructor(private readonly data: PersistentCollection<Question>) {}
  async list(filter: QuestionFilter = {}) {
    return (await this.data.list()).filter((question) =>
      Object.entries(filter).every(([key, value]) => question[key as keyof Question] === value),
    );
  }
  async getById(id: string) { return this.data.getById(id); }
  async create(draft: Omit<Question, "id" | "createdAt">) { return this.data.create({ ...draft, id: makeId("question"), createdAt: now() }); }
  async update(id: string, patch: Partial<Question>) { return this.data.update(id, patch); }
  async remove(id: string) { return this.data.remove(id); }
}

class MockChallengeAttemptRepository implements ChallengeAttemptRepository {
  constructor(private readonly data: PersistentCollection<ChallengeAttempt>) {}
  async listByChild(childId: string) { return (await this.data.list()).filter((attempt) => attempt.childId === childId); }
  async create(draft: Omit<ChallengeAttempt, "id">) { return this.data.create({ ...draft, id: makeId("attempt") }); }
  async update(id: string, patch: Partial<ChallengeAttempt>) { return this.data.update(id, patch); }
}

class MockRewardTransactionRepository implements RewardTransactionRepository {
  constructor(private readonly data: PersistentCollection<RewardTransaction>) {}
  async listByChild(childId: string) { return (await this.data.list()).filter((reward) => reward.childId === childId); }
  async findByIdempotencyKey(key: string) { return (await this.data.list()).find((reward) => reward.idempotencyKey === key) ?? null; }
  async create(draft: Omit<RewardTransaction, "id">) {
    const existing = await this.findByIdempotencyKey(draft.idempotencyKey);
    if (existing) return existing;
    return this.data.create({ ...draft, id: makeId("reward") });
  }
  async update(id: string, patch: Partial<RewardTransaction>) { return this.data.update(id, patch); }
}

class MockAdditionalTimeRequestRepository implements AdditionalTimeRequestRepository {
  constructor(private readonly data: PersistentCollection<AdditionalTimeRequest>) {}
  async listByChild(childId: string) { return (await this.data.list()).filter((request) => request.childId === childId); }
  async listPending() { return (await this.data.list()).filter((request) => request.status === "pending"); }
  async create(draft: Omit<AdditionalTimeRequest, "id" | "createdAt" | "status">) { return this.data.create({ ...draft, id: makeId("request"), status: "pending", createdAt: now() }); }
  async update(id: string, patch: Partial<AdditionalTimeRequest>) { return this.data.update(id, patch); }
}

export class MockAiRepository implements AiRepository {
  async generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
    const matches = seedData.questions.filter((question) => question.subject === params.subject);
    return Array.from({ length: params.count }, (_, index) => {
      const sample = matches[index % Math.max(matches.length, 1)];
      return QuestionSchema.parse({
        id: makeId("ai-question"),
        text: sample?.text ?? `Sample ${params.topic} question ${index + 1}`,
        type: params.type,
        ...(params.type === "mcq" ? { options: sample?.options ?? ["Option A", "Option B", "Option C", "Option D"] } : {}),
        correctAnswer: sample?.correctAnswer ?? "Option A",
        explanation: sample?.explanation ?? "A parent should review this sample explanation.",
        subject: params.subject,
        topic: params.topic,
        learningStandardCode: params.learningStandardCode,
        difficulty: params.difficulty,
        language: params.language,
        source: "ai_generated",
        status: "pending_review",
        confidence: index % 3 === 2 ? "low" : "high",
        createdAt: now(),
      });
    });
  }
}

export function createMockRepositories(storage: StorageAdapter): RepositoryBundle {
  const users = new PersistentCollection(storage, `${namespace}:users`, UserSchema, seedData.users);
  const children = new PersistentCollection(storage, `${namespace}:children`, ChildProfileSchema, seedData.childProfiles);
  const devices = new PersistentCollection(storage, `${namespace}:devices`, DeviceSchema, seedData.devices);
  const applications = new PersistentCollection(storage, `${namespace}:applications`, ApplicationRecordSchema, seedData.applications);
  const screenRules = new PersistentCollection(storage, `${namespace}:screen-rules`, ScreenTimeRuleSchema, seedData.screenTimeRules);
  const challengeRules = new PersistentCollection(storage, `${namespace}:challenge-rules`, ChallengeRuleSchema, seedData.challengeRules);
  const questions = new PersistentCollection(storage, `${namespace}:questions`, QuestionSchema, seedData.questions);
  const attempts = new PersistentCollection(storage, `${namespace}:attempts`, ChallengeAttemptSchema, seedData.challengeAttempts);
  const rewards = new PersistentCollection(storage, `${namespace}:rewards`, RewardTransactionSchema, seedData.rewardTransactions);
  const requests = new PersistentCollection(storage, `${namespace}:requests`, AdditionalTimeRequestSchema, seedData.additionalTimeRequests);

  return {
    users: new MockUserRepository(users),
    childProfiles: new MockChildProfileRepository(children),
    devices: new MockDeviceRepository(devices),
    applications: new MockApplicationRepository(applications),
    screenTimeRules: new MockScreenTimeRuleRepository(screenRules),
    challengeRules: new MockChallengeRuleRepository(challengeRules),
    questions: new MockQuestionRepository(questions),
    challengeAttempts: new MockChallengeAttemptRepository(attempts),
    rewardTransactions: new MockRewardTransactionRepository(rewards),
    additionalTimeRequests: new MockAdditionalTimeRequestRepository(requests),
    ai: new MockAiRepository(),
  };
}
