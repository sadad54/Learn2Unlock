import { create } from "zustand";
import { seedData, type Question } from "@learn2unlock/shared";
import { api } from "@/data/api";

type RequestStatus = "not_sent" | "sent" | "seen" | "approved";
type ChildState = {
  remainingMinutes: number; questions: Question[]; attemptId: string | null; currentIndex: number; answers: Record<string, string>; rewardApplied: boolean; completing: boolean; initialized: boolean; error: string | null; requestStatus: RequestStatus;
  initialize(): Promise<void>; startChallenge(): Promise<void>; answer(questionId: string, answer: string): void; advance(): void; applyReward(): Promise<void>; sendRequest(): Promise<void>; resetRequest(): void;
};

async function ensureChildSession(): Promise<void> {
  try { await api.childHome("child-aina"); } catch { await api.childDemoLogin("child-aina"); }
}

export const useChildStore = create<ChildState>((set, get) => ({
  remainingMinutes: 42,
  questions: seedData.questions.filter((question) => question.subject === "science" && question.status === "approved").slice(0, 5),
  attemptId: null, currentIndex: 0, answers: {}, rewardApplied: false, completing: false, initialized: false, error: null, requestStatus: "not_sent",
  initialize: async () => {
    try { await ensureChildSession(); const home = await api.childHome("child-aina"); set({ remainingMinutes: home.remainingMinutes, initialized: true, error: null }); }
    catch (error) { set({ initialized: true, error: error instanceof Error ? error.message : "Unable to load child data." }); }
  },
  startChallenge: async () => {
    set({ currentIndex: 0, answers: {}, rewardApplied: false, completing: false, error: null });
    try { await ensureChildSession(); const result = await api.startChallenge("child-aina"); set({ attemptId: result.attempt.id, questions: result.questions }); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to start challenge." }); throw error; }
  },
  answer: (questionId, answer) => set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  advance: () => set((state) => ({ currentIndex: Math.min(state.questions.length - 1, state.currentIndex + 1) })),
  applyReward: async () => {
    const state = get(); if (state.rewardApplied || state.completing || !state.attemptId) return; set({ completing: true });
    try { const result = await api.completeChallenge(state.attemptId, state.questions.map((question) => ({ questionId: question.id, submittedAnswer: state.answers[question.id] ?? "" }))); set({ remainingMinutes: result.remainingMinutes, rewardApplied: result.reward.status === "auto_granted", error: null }); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to apply reward." }); }
    finally { set({ completing: false }); }
  },
  sendRequest: async () => {
    try { await ensureChildSession(); await api.requestTime("child-aina", "app-galaxy", 10); set({ requestStatus: "sent", error: null }); }
    catch (error) { set({ error: error instanceof Error ? error.message : "Unable to send request." }); }
  },
  resetRequest: () => set({ requestStatus: "not_sent" }),
}));
