import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["parent", "admin"]),
  createdAt: z.string().datetime(),
});

export const ChildProfileSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  nickname: z.string().min(1).max(30),
  schoolYear: z.number().min(1).max(6),
  language: z.enum(["ms", "en"]),
  subjects: z.array(z.enum(["math", "science", "bm", "english"])),
  avatarColor: z.string(),
  createdAt: z.string().datetime(),
});

export const DeviceSchema = z.object({
  id: z.string(),
  childId: z.string(),
  platform: z.literal("android"),
  model: z.string(),
  pairedAt: z.string().datetime(),
  protectionStatus: z.enum(["active", "permission_removed", "offline"]),
  lastSeenAt: z.string().datetime(),
});

export const ApplicationRecordSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  displayName: z.string(),
  category: z.enum(["games", "social", "video", "other", "essential"]),
  iconUrl: z.string().optional(),
  isEssential: z.boolean().default(false),
});

export const ScreenTimeRuleSchema = z.object({
  id: z.string(),
  childId: z.string(),
  appId: z.string().nullable(),
  dailyLimitMinutes: z.number().min(1),
  warningMinutesBefore: z.number().default(5),
  bedtime: z.string(),
  weekendLimitMinutes: z.number().optional(),
  version: z.number(),
  updatedAt: z.string().datetime(),
});

export const ChallengeRuleSchema = z.object({
  id: z.string(),
  childId: z.string(),
  questionCount: z.number().default(5),
  passingScorePercent: z.number().default(80),
  rewardMinutes: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  maxDailyRewardMinutes: z.number().default(30),
  maxAttempts: z.number().default(2),
  latestRewardTime: z.string().default("20:30"),
  requiresParentApproval: z.boolean().default(false),
});

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["mcq", "true_false", "numeric"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  subject: z.enum(["math", "science", "bm", "english"]),
  topic: z.string(),
  learningStandardCode: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  language: z.enum(["ms", "en"]),
  source: z.enum(["verified_bank", "parent_created", "ai_generated"]),
  status: z.enum(["approved", "pending_review", "rejected"]),
  confidence: z.enum(["high", "low"]).optional(),
  createdAt: z.string().datetime(),
});

export const ChallengeAttemptSchema = z.object({
  id: z.string(),
  childId: z.string(),
  questionIds: z.array(z.string()),
  responses: z.array(
    z.object({
      questionId: z.string(),
      submittedAnswer: z.string(),
      isCorrect: z.boolean(),
    }),
  ),
  scorePercent: z.number(),
  passed: z.boolean(),
  attemptNumber: z.number(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const RewardTransactionSchema = z.object({
  id: z.string(),
  childId: z.string(),
  challengeAttemptId: z.string(),
  minutesAwarded: z.number(),
  appId: z.string().nullable(),
  idempotencyKey: z.string(),
  status: z.enum(["auto_granted", "pending_parent_approval", "approved", "rejected"]),
  createdAt: z.string().datetime(),
});

export const AdditionalTimeRequestSchema = z.object({
  id: z.string(),
  childId: z.string(),
  appId: z.string(),
  requestedMinutes: z.number(),
  status: z.enum(["pending", "approved", "rejected", "modified"]),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
export type ChildProfile = z.infer<typeof ChildProfileSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type ApplicationRecord = z.infer<typeof ApplicationRecordSchema>;
export type ScreenTimeRule = z.infer<typeof ScreenTimeRuleSchema>;
export type ChallengeRule = z.infer<typeof ChallengeRuleSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type ChallengeAttempt = z.infer<typeof ChallengeAttemptSchema>;
export type RewardTransaction = z.infer<typeof RewardTransactionSchema>;
export type AdditionalTimeRequest = z.infer<typeof AdditionalTimeRequestSchema>;

export const Learn2UnlockSeedSchema = z.object({
  users: z.array(UserSchema),
  childProfiles: z.array(ChildProfileSchema),
  devices: z.array(DeviceSchema),
  applications: z.array(ApplicationRecordSchema),
  screenTimeRules: z.array(ScreenTimeRuleSchema),
  challengeRules: z.array(ChallengeRuleSchema),
  questions: z.array(QuestionSchema),
  challengeAttempts: z.array(ChallengeAttemptSchema),
  rewardTransactions: z.array(RewardTransactionSchema),
  additionalTimeRequests: z.array(AdditionalTimeRequestSchema),
});

export type Learn2UnlockSeed = z.infer<typeof Learn2UnlockSeedSchema>;
