import type {
  AdditionalTimeRequest,
  ApplicationRecord,
  ChallengeAttempt,
  ChallengeRule,
  ChildProfile,
  Device,
  Question,
  RewardTransaction,
  ScreenTimeRule,
  User,
} from "../schemas/index";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
}

export interface ChildProfileRepository {
  list(familyId: string): Promise<ChildProfile[]>;
  getById(id: string): Promise<ChildProfile | null>;
  create(draft: Omit<ChildProfile, "id" | "createdAt">): Promise<ChildProfile>;
  update(id: string, patch: Partial<ChildProfile>): Promise<ChildProfile>;
}

export interface DeviceRepository {
  listByChild(childId: string): Promise<Device[]>;
  getById(id: string): Promise<Device | null>;
  create(draft: Omit<Device, "id">): Promise<Device>;
  update(id: string, patch: Partial<Device>): Promise<Device>;
}

export interface ApplicationRepository {
  list(): Promise<ApplicationRecord[]>;
  getById(id: string): Promise<ApplicationRecord | null>;
  create(draft: Omit<ApplicationRecord, "id">): Promise<ApplicationRecord>;
  update(id: string, patch: Partial<ApplicationRecord>): Promise<ApplicationRecord>;
}

export interface ScreenTimeRuleRepository {
  listByChild(childId: string): Promise<ScreenTimeRule[]>;
  create(draft: Omit<ScreenTimeRule, "id">): Promise<ScreenTimeRule>;
  update(id: string, patch: Partial<ScreenTimeRule>): Promise<ScreenTimeRule>;
}

export interface ChallengeRuleRepository {
  getByChild(childId: string): Promise<ChallengeRule | null>;
  create(draft: Omit<ChallengeRule, "id">): Promise<ChallengeRule>;
  update(id: string, patch: Partial<ChallengeRule>): Promise<ChallengeRule>;
}

export type QuestionFilter = Partial<Pick<Question, "subject" | "topic" | "difficulty" | "source" | "status">>;

export interface QuestionRepository {
  list(filter?: QuestionFilter): Promise<Question[]>;
  getById(id: string): Promise<Question | null>;
  create(draft: Omit<Question, "id" | "createdAt">): Promise<Question>;
  update(id: string, patch: Partial<Question>): Promise<Question>;
  remove(id: string): Promise<void>;
}

export interface ChallengeAttemptRepository {
  listByChild(childId: string): Promise<ChallengeAttempt[]>;
  create(draft: Omit<ChallengeAttempt, "id">): Promise<ChallengeAttempt>;
  update(id: string, patch: Partial<ChallengeAttempt>): Promise<ChallengeAttempt>;
}

export interface RewardTransactionRepository {
  listByChild(childId: string): Promise<RewardTransaction[]>;
  findByIdempotencyKey(key: string): Promise<RewardTransaction | null>;
  create(draft: Omit<RewardTransaction, "id">): Promise<RewardTransaction>;
  update(id: string, patch: Partial<RewardTransaction>): Promise<RewardTransaction>;
}

export interface AdditionalTimeRequestRepository {
  listByChild(childId: string): Promise<AdditionalTimeRequest[]>;
  listPending(): Promise<AdditionalTimeRequest[]>;
  create(draft: Omit<AdditionalTimeRequest, "id" | "createdAt" | "status">): Promise<AdditionalTimeRequest>;
  update(id: string, patch: Partial<AdditionalTimeRequest>): Promise<AdditionalTimeRequest>;
}

export type GenerateQuestionsParams = {
  schoolYear: number;
  subject: Question["subject"];
  topic: string;
  learningStandardCode: string;
  language: Question["language"];
  difficulty: Question["difficulty"];
  type: Question["type"];
  count: number;
  additionalInstructions?: string;
};

export interface AiRepository {
  generateQuestions(params: GenerateQuestionsParams): Promise<Question[]>;
}

export type RepositoryBundle = {
  users: UserRepository;
  childProfiles: ChildProfileRepository;
  devices: DeviceRepository;
  applications: ApplicationRepository;
  screenTimeRules: ScreenTimeRuleRepository;
  challengeRules: ChallengeRuleRepository;
  questions: QuestionRepository;
  challengeAttempts: ChallengeAttemptRepository;
  rewardTransactions: RewardTransactionRepository;
  additionalTimeRequests: AdditionalTimeRequestRepository;
  ai: AiRepository;
};
