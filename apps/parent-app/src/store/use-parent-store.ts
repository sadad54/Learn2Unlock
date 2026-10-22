import { create } from "zustand";
import { seedData, type AdditionalTimeRequest, type Question } from "@learn2unlock/shared";
import { api } from "@/data/api";

type ParentState = {
  authenticated: boolean;
  loading: boolean;
  error: string | null;
  childNickname: string;
  schoolYear: number;
  language: "en" | "ms";
  subjects: Question["subject"][];
  devicePaired: boolean;
  controlledApps: string[];
  dailyLimit: number;
  weekendLimit: number;
  bedtime: string;
  warningMinutes: number;
  questionCount: number;
  passingScore: number;
  rewardMinutes: 5 | 10 | 15;
  maxReward: number;
  maxAttempts: number;
  requiresApproval: boolean;
  paused: boolean;
  requests: AdditionalTimeRequest[];
  questions: Question[];
  generatedQuestions: Question[];
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  hydrate(): Promise<void>;
  setProfile(nickname: string, schoolYear: number, language: "en" | "ms", subjects: Question["subject"][]): void;
  pairDevice(): void;
  toggleApp(id: string): void;
  updateScreenRules(patch: Partial<Pick<ParentState, "dailyLimit" | "weekendLimit" | "bedtime" | "warningMinutes">>): void;
  updateRewardRules(patch: Partial<Pick<ParentState, "questionCount" | "passingScore" | "rewardMinutes" | "maxReward" | "maxAttempts" | "requiresApproval">>): void;
  togglePaused(): void;
  updateRequest(id: string, status: AdditionalTimeRequest["status"], minutes?: number): Promise<void>;
  addQuestion(question: Question): Promise<void>;
  generateQuestions(topic?: string, additionalInstructions?: string): Promise<void>;
  approveGenerated(id: string): Promise<void>;
  discardGenerated(id: string): Promise<void>;
  completeOnboarding(): Promise<void>;
};

export const useParentStore = create<ParentState>((set, get) => ({
  authenticated: false,
  loading: false,
  error: null,
  childNickname: "Aina",
  schoolYear: 4,
  language: "en",
  subjects: ["math", "science", "bm", "english"],
  devicePaired: false,
  controlledApps: ["app-galaxy", "app-youtube"],
  dailyLimit: 60,
  weekendLimit: 90,
  bedtime: "20:30",
  warningMinutes: 5,
  questionCount: 5,
  passingScore: 80,
  rewardMinutes: 10,
  maxReward: 30,
  maxAttempts: 2,
  requiresApproval: false,
  paused: false,
  requests: seedData.additionalTimeRequests,
  questions: seedData.questions,
  generatedQuestions: [],
  login: async (email, password) => {
    set({ loading: true, error: null });
    try { await api.login(email, password); set({ authenticated: true }); await get().hydrate(); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Sign-in failed." }); throw error; }
    finally { set({ loading: false }); }
  },
  register: async (email, password) => {
    set({ loading: true, error: null });
    try { await api.register(email, password); set({ authenticated: true }); await get().hydrate(); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Account creation failed." }); throw error; }
    finally { set({ loading: false }); }
  },
  hydrate: async () => {
    const data = await api.bootstrap();
    const child = data.children[0];
    const screenRule = data.screenTimeRules.find((rule) => rule.childId === child?.id && rule.appId === null);
    const challengeRule = data.challengeRules.find((rule) => rule.childId === child?.id);
    set({
      requests: data.requests,
      questions: data.questions.filter((question) => question.status === "approved"),
      generatedQuestions: data.questions.filter((question) => question.source === "ai_generated" && question.status === "pending_review"),
      ...(child ? { childNickname: child.nickname, schoolYear: child.schoolYear, language: child.language, subjects: child.subjects } : {}),
      ...(screenRule ? { dailyLimit: screenRule.dailyLimitMinutes, weekendLimit: screenRule.weekendLimitMinutes ?? screenRule.dailyLimitMinutes, bedtime: screenRule.bedtime, warningMinutes: screenRule.warningMinutesBefore } : {}),
      ...(challengeRule ? { questionCount: challengeRule.questionCount, passingScore: challengeRule.passingScorePercent, rewardMinutes: challengeRule.rewardMinutes, maxReward: challengeRule.maxDailyRewardMinutes, maxAttempts: challengeRule.maxAttempts, requiresApproval: challengeRule.requiresParentApproval } : {}),
    });
  },
  setProfile: (childNickname, schoolYear, language, subjects) => set({ childNickname, schoolYear, language, subjects }),
  pairDevice: () => set({ devicePaired: true }),
  toggleApp: (id) => set((state) => ({ controlledApps: state.controlledApps.includes(id) ? state.controlledApps.filter((appId) => appId !== id) : [...state.controlledApps, id] })),
  updateScreenRules: (patch) => set(patch),
  updateRewardRules: (patch) => set(patch),
  togglePaused: () => set((state) => ({ paused: !state.paused })),
  updateRequest: async (id, status, minutes) => {
    const backendStatus = status === "pending" ? "rejected" : status;
    const result = await api.decideTimeRequest(id, backendStatus, minutes);
    set((state) => ({ requests: state.requests.map((request) => request.id === id ? result.request : request) }));
  },
  addQuestion: async (question) => {
    const { id: _id, createdAt: _createdAt, ...draft } = question;
    const created = await api.createQuestion(draft);
    set((state) => ({ questions: [created, ...state.questions] }));
  },
  generateQuestions: async (topic = "Properties of materials", additionalInstructions) => {
    const state = get(); set({ loading: true, error: null });
    try {
      const generated = await api.generateQuestions({ schoolYear: state.schoolYear, subject: "science", topic, learningStandardCode: "4.7.1", language: state.language, difficulty: "medium", type: "mcq", count: 5, ...(additionalInstructions ? { additionalInstructions } : {}) });
      set({ generatedQuestions: generated });
    } catch (error) { set({ error: error instanceof Error ? error.message : "Question generation failed." }); throw error; }
    finally { set({ loading: false }); }
  },
  approveGenerated: async (id) => {
    const approved = await api.updateQuestion(id, { status: "approved" });
    set((state) => ({ generatedQuestions: state.generatedQuestions.filter((question) => question.id !== id), questions: [approved, ...state.questions] }));
  },
  discardGenerated: async (id) => {
    await api.updateQuestion(id, { status: "rejected" });
    set((state) => ({ generatedQuestions: state.generatedQuestions.filter((question) => question.id !== id) }));
  },
  completeOnboarding: async () => {
    const state = get(); set({ loading: true, error: null });
    try {
      await api.completeOnboarding({ child: { nickname: state.childNickname, schoolYear: state.schoolYear, language: state.language, subjects: state.subjects }, controlledApps: state.controlledApps, screenTime: { dailyLimitMinutes: state.dailyLimit, weekendLimitMinutes: state.weekendLimit, bedtime: state.bedtime, warningMinutesBefore: state.warningMinutes }, challenge: { questionCount: state.questionCount, passingScorePercent: state.passingScore, rewardMinutes: state.rewardMinutes, maxDailyRewardMinutes: state.maxReward, maxAttempts: state.maxAttempts, requiresParentApproval: state.requiresApproval } });
    } catch (error) { set({ error: error instanceof Error ? error.message : "Unable to save setup." }); throw error; }
    finally { set({ loading: false }); }
  },
}));
