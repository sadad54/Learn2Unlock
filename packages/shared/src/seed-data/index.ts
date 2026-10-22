import type { Learn2UnlockSeed, Question } from "../schemas/index";

type Subject = Question["subject"];
type Entry = {
  text: string;
  options?: string[];
  answer: string;
  explanation: string;
  topic: string;
  standard: string;
  difficulty: Question["difficulty"];
  type?: Question["type"];
};

const createdAt = "2026-07-01T08:00:00.000Z";

function createQuestions(
  subject: Subject,
  language: Question["language"],
  prefix: string,
  entries: Entry[],
): Question[] {
  return entries.map((entry, index) => ({
    id: `question-${prefix}-${String(index + 1).padStart(2, "0")}`,
    text: entry.text,
    type: entry.type ?? "mcq",
    ...(entry.options ? { options: entry.options } : {}),
    correctAnswer: entry.answer,
    explanation: entry.explanation,
    subject,
    topic: entry.topic,
    learningStandardCode: entry.standard,
    difficulty: entry.difficulty,
    language,
    source: index === 8 ? "parent_created" : index === 9 ? "ai_generated" : "verified_bank",
    status: index === 9 ? "pending_review" : "approved",
    ...(index === 9 ? { confidence: "low" as const } : {}),
    createdAt,
  }));
}

const mathQuestions = createQuestions("math", "en", "math", [
  { text: "Which fraction is equal to one half?", options: ["1/2", "1/3", "2/5", "3/4"], answer: "1/2", explanation: "One of two equal parts is written as 1/2.", topic: "Fractions", standard: "4.2.1", difficulty: "easy" },
  { text: "What is 348 + 127?", options: ["465", "475", "485", "575"], answer: "475", explanation: "Add the ones, tens, then hundreds to get 475.", topic: "Whole numbers", standard: "4.1.2", difficulty: "easy" },
  { text: "A box has 6 rows of 8 pencils. How many pencils are there?", options: ["14", "42", "48", "56"], answer: "48", explanation: "Six groups of eight is 6 × 8 = 48.", topic: "Multiplication", standard: "4.1.4", difficulty: "medium" },
  { text: "What is the perimeter of a square with 5 cm sides?", options: ["10 cm", "15 cm", "20 cm", "25 cm"], answer: "20 cm", explanation: "A square has four equal sides, so 4 × 5 cm = 20 cm.", topic: "Measurement", standard: "4.5.1", difficulty: "medium" },
  { text: "Round 2,746 to the nearest hundred.", options: ["2,700", "2,750", "2,800", "3,000"], answer: "2,700", explanation: "The tens digit is 4, so the hundreds digit stays the same.", topic: "Rounding", standard: "4.1.1", difficulty: "medium" },
  { text: "Which decimal is greater?", options: ["0.36", "0.63", "They are equal", "Cannot tell"], answer: "0.63", explanation: "Six tenths is greater than three tenths.", topic: "Decimals", standard: "4.3.2", difficulty: "easy" },
  { text: "How many minutes are in 2 hours and 15 minutes?", options: ["105", "120", "135", "150"], answer: "135", explanation: "Two hours is 120 minutes; 120 + 15 = 135.", topic: "Time", standard: "4.4.1", difficulty: "medium" },
  { text: "Find the missing number: 9 × __ = 72.", options: ["6", "7", "8", "9"], answer: "8", explanation: "Nine multiplied by eight equals 72.", topic: "Multiplication", standard: "4.1.4", difficulty: "easy" },
  { text: "Aina saves RM3 each week for 6 weeks. How much does she save?", options: ["RM9", "RM12", "RM18", "RM24"], answer: "RM18", explanation: "RM3 × 6 weeks = RM18.", topic: "Money", standard: "4.6.1", difficulty: "easy" },
  { text: "Which shape has exactly one pair of parallel sides?", options: ["Square", "Triangle", "Trapezium", "Circle"], answer: "Trapezium", explanation: "A trapezium has one pair of parallel sides.", topic: "Shapes", standard: "4.7.2", difficulty: "medium" },
]);

const scienceQuestions = createQuestions("science", "en", "science", [
  { text: "Which material is best for a raincoat?", options: ["Cotton", "Waterproof plastic", "Paper", "Wool"], answer: "Waterproof plastic", explanation: "Waterproof plastic prevents rain from passing through.", topic: "Properties of materials", standard: "4.7.1", difficulty: "easy" },
  { text: "Plants make food mainly in which part?", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: "Leaves", explanation: "Leaves contain chlorophyll and are the main site of photosynthesis.", topic: "Plants", standard: "4.4.2", difficulty: "easy" },
  { text: "Which organ pumps blood around the body?", options: ["Lungs", "Heart", "Stomach", "Brain"], answer: "Heart", explanation: "The heart pumps blood through blood vessels.", topic: "Human body", standard: "4.2.1", difficulty: "easy" },
  { text: "What happens to water when it freezes?", options: ["It becomes gas", "It becomes solid", "It disappears", "It becomes warmer"], answer: "It becomes solid", explanation: "Cooling water to its freezing point changes it into ice.", topic: "States of matter", standard: "4.6.1", difficulty: "easy" },
  { text: "Which force pulls objects toward Earth?", options: ["Friction", "Magnetism", "Gravity", "Electricity"], answer: "Gravity", explanation: "Gravity attracts objects toward Earth's centre.", topic: "Forces", standard: "4.5.1", difficulty: "medium" },
  { text: "A shadow becomes shorter when the light source moves closer overhead.", answer: "True", explanation: "Light from overhead creates a shorter shadow.", topic: "Light", standard: "4.8.2", difficulty: "medium", type: "true_false" },
  { text: "Which animal is a vertebrate?", options: ["Earthworm", "Butterfly", "Fish", "Jellyfish"], answer: "Fish", explanation: "Fish have backbones, so they are vertebrates.", topic: "Animals", standard: "4.3.1", difficulty: "medium" },
  { text: "What is the main source of energy for Earth?", options: ["The Moon", "The Sun", "Wind", "Soil"], answer: "The Sun", explanation: "Most energy used by living things ultimately comes from the Sun.", topic: "Energy", standard: "4.9.1", difficulty: "easy" },
  { text: "Why do metal spoons feel hot in soup?", options: ["Metal conducts heat", "Metal creates heat", "Soup becomes cold", "Metal absorbs water"], answer: "Metal conducts heat", explanation: "Heat travels through metal from the soup to the spoon.", topic: "Heat", standard: "4.7.2", difficulty: "medium" },
  { text: "Which simple machine is used on a flagpole?", options: ["Lever", "Pulley", "Wheelbarrow", "Wedge"], answer: "Pulley", explanation: "A pulley changes the direction of force used to raise the flag.", topic: "Machines", standard: "4.10.1", difficulty: "medium" },
]);

const bmQuestions = createQuestions("bm", "ms", "bm", [
  { text: "Pilih kata adjektif yang betul: Bunga itu sangat ____.", options: ["cantik", "berlari", "makan", "mereka"], answer: "cantik", explanation: "‘Cantik’ ialah kata adjektif yang menerangkan rupa bunga.", topic: "Tatabahasa", standard: "4.5.1", difficulty: "easy" },
  { text: "Apakah kata lawan bagi ‘tinggi’?", options: ["besar", "rendah", "panjang", "dekat"], answer: "rendah", explanation: "Kata lawan bagi ‘tinggi’ ialah ‘rendah’.", topic: "Kosa kata", standard: "4.2.2", difficulty: "easy" },
  { text: "Pilih ayat yang menggunakan tanda baca dengan betul.", options: ["Ibu berkata mari makan.", "Ibu berkata, “Mari makan.”", "Ibu berkata “mari makan”", "Ibu, berkata mari makan."], answer: "Ibu berkata, “Mari makan.”", explanation: "Ayat cakap ajuk menggunakan koma, tanda petik dan noktah dengan betul.", topic: "Tanda baca", standard: "4.3.1", difficulty: "medium" },
  { text: "Perkataan manakah ialah kata kerja?", options: ["meja", "cantik", "membaca", "merah"], answer: "membaca", explanation: "‘Membaca’ menunjukkan suatu perbuatan.", topic: "Tatabahasa", standard: "4.5.2", difficulty: "easy" },
  { text: "Lengkapkan simpulan bahasa: ringan ____.", options: ["tangan", "kaki", "mata", "hati"], answer: "tangan", explanation: "‘Ringan tangan’ bermaksud suka membantu.", topic: "Simpulan bahasa", standard: "4.4.1", difficulty: "medium" },
  { text: "Pilih penjodoh bilangan yang sesuai untuk pisang.", options: ["sebiji", "sebatang", "sesikat", "seutas"], answer: "sesikat", explanation: "Penjodoh bilangan yang sesuai ialah ‘sesikat pisang’.", topic: "Penjodoh bilangan", standard: "4.5.3", difficulty: "medium" },
  { text: "Ayat ‘Mereka bermain di padang’ ialah ayat penyata.", answer: "Benar", explanation: "Ayat itu menyatakan suatu maklumat.", topic: "Jenis ayat", standard: "4.3.2", difficulty: "easy", type: "true_false" },
  { text: "Apakah maksud perkataan ‘tekun’?", options: ["rajin dan bersungguh-sungguh", "cepat marah", "suka tidur", "sangat bising"], answer: "rajin dan bersungguh-sungguh", explanation: "‘Tekun’ bermaksud rajin serta bersungguh-sungguh.", topic: "Kosa kata", standard: "4.2.1", difficulty: "medium" },
  { text: "Pilih kata hubung: Aina membaca ____ Irfan melukis.", options: ["dan", "kerana", "supaya", "tetapi"], answer: "dan", explanation: "‘Dan’ menggabungkan dua perbuatan yang setara.", topic: "Kata hubung", standard: "4.5.4", difficulty: "easy" },
  { text: "Pilih ejaan yang betul.", options: ["aktibiti", "aktiviti", "aktivety", "aktifiti"], answer: "aktiviti", explanation: "Ejaan baku yang betul ialah ‘aktiviti’.", topic: "Ejaan", standard: "4.3.3", difficulty: "easy" },
]);

const englishQuestions = createQuestions("english", "en", "english", [
  { text: "Choose the correct past tense of ‘go’.", options: ["goed", "gone", "went", "going"], answer: "went", explanation: "‘Went’ is the simple past form of ‘go’.", topic: "Grammar", standard: "4.2.1", difficulty: "easy" },
  { text: "Which word is an adjective?", options: ["quickly", "bright", "jump", "teacher"], answer: "bright", explanation: "‘Bright’ describes a noun, so it is an adjective.", topic: "Grammar", standard: "4.2.2", difficulty: "easy" },
  { text: "Choose the sentence with correct punctuation.", options: ["Where are you going.", "Where are you going?", "where are you going?", "Where, are you going?"], answer: "Where are you going?", explanation: "A direct question starts with a capital letter and ends with a question mark.", topic: "Writing", standard: "4.3.1", difficulty: "easy" },
  { text: "What is a synonym for ‘happy’?", options: ["joyful", "angry", "tired", "quiet"], answer: "joyful", explanation: "‘Joyful’ has a similar meaning to ‘happy’.", topic: "Vocabulary", standard: "4.1.2", difficulty: "easy" },
  { text: "Complete the sentence: There ____ three books on the table.", options: ["is", "are", "was", "be"], answer: "are", explanation: "Use ‘are’ with the plural noun ‘books’.", topic: "Grammar", standard: "4.2.3", difficulty: "medium" },
  { text: "Which sentence is in the future tense?", options: ["I walk home.", "I walked home.", "I will walk home.", "I am walking home."], answer: "I will walk home.", explanation: "‘Will’ shows that the action happens in the future.", topic: "Grammar", standard: "4.2.4", difficulty: "medium" },
  { text: "The word ‘carefully’ is an adverb.", answer: "True", explanation: "‘Carefully’ describes how an action is done.", topic: "Grammar", standard: "4.2.2", difficulty: "medium", type: "true_false" },
  { text: "Choose the correct collective noun: a ____ of fish.", options: ["pack", "school", "flock", "herd"], answer: "school", explanation: "A group of fish is called a school.", topic: "Vocabulary", standard: "4.1.3", difficulty: "medium" },
  { text: "Which opening is best for a friendly email?", options: ["Dear Aina,", "To whom it may concern,", "Attention!", "NOTICE"], answer: "Dear Aina,", explanation: "A friendly email can begin with ‘Dear’ followed by the person's name.", topic: "Writing", standard: "4.3.2", difficulty: "easy" },
  { text: "Choose the correct word: The puppy wagged ____ tail.", options: ["it's", "its", "it is", "its'"], answer: "its", explanation: "‘Its’ is the possessive form; ‘it's’ means ‘it is’.", topic: "Grammar", standard: "4.2.5", difficulty: "hard" },
]);

export const seedData: Learn2UnlockSeed = {
  users: [{ id: "user-parent-01", email: "parent@example.com", role: "parent", createdAt }],
  childProfiles: [
    { id: "child-aina", familyId: "family-01", nickname: "Aina", schoolYear: 4, language: "en", subjects: ["math", "science", "bm", "english"], avatarColor: "#F7D5B5", createdAt },
    { id: "child-irfan", familyId: "family-01", nickname: "Irfan", schoolYear: 2, language: "ms", subjects: ["math", "science", "bm", "english"], avatarColor: "#C8D7F2", createdAt },
  ],
  devices: [
    { id: "device-aina", childId: "child-aina", platform: "android", model: "Pixel 7a", pairedAt: createdAt, protectionStatus: "active", lastSeenAt: "2026-07-18T02:45:00.000Z" },
    { id: "device-irfan", childId: "child-irfan", platform: "android", model: "Samsung Galaxy A15", pairedAt: createdAt, protectionStatus: "offline", lastSeenAt: "2026-07-17T12:30:00.000Z" },
  ],
  applications: [
    { id: "app-phone", packageId: "com.android.dialer", displayName: "Phone", category: "essential", isEssential: true },
    { id: "app-parent-message", packageId: "com.learn2unlock.parentmessage", displayName: "Message Parent", category: "essential", isEssential: true },
    { id: "app-school", packageId: "my.edu.schoolportal", displayName: "School Portal", category: "essential", isEssential: true },
    { id: "app-galaxy", packageId: "com.example.galaxyquest", displayName: "Galaxy Quest", category: "games", isEssential: false },
    { id: "app-youtube", packageId: "com.google.android.youtube", displayName: "YouTube", category: "video", isEssential: false },
    { id: "app-chat", packageId: "com.example.chatspace", displayName: "ChatSpace", category: "social", isEssential: false },
    { id: "app-art", packageId: "com.example.artpad", displayName: "Art Pad", category: "other", isEssential: false },
  ],
  screenTimeRules: [
    { id: "screen-rule-aina", childId: "child-aina", appId: null, dailyLimitMinutes: 60, warningMinutesBefore: 5, bedtime: "20:30", weekendLimitMinutes: 90, version: 1, updatedAt: createdAt },
    { id: "screen-rule-irfan", childId: "child-irfan", appId: null, dailyLimitMinutes: 45, warningMinutesBefore: 5, bedtime: "20:00", weekendLimitMinutes: 60, version: 1, updatedAt: createdAt },
    { id: "screen-rule-aina-video", childId: "child-aina", appId: "app-youtube", dailyLimitMinutes: 20, warningMinutesBefore: 5, bedtime: "20:30", version: 1, updatedAt: createdAt },
  ],
  challengeRules: [
    { id: "challenge-rule-aina", childId: "child-aina", questionCount: 5, passingScorePercent: 80, rewardMinutes: 10, maxDailyRewardMinutes: 30, maxAttempts: 2, latestRewardTime: "20:30", requiresParentApproval: false },
    { id: "challenge-rule-irfan", childId: "child-irfan", questionCount: 5, passingScorePercent: 80, rewardMinutes: 5, maxDailyRewardMinutes: 20, maxAttempts: 2, latestRewardTime: "20:00", requiresParentApproval: true },
  ],
  questions: [...mathQuestions, ...scienceQuestions, ...bmQuestions, ...englishQuestions],
  challengeAttempts: [
    { id: "attempt-aina-01", childId: "child-aina", questionIds: ["question-science-01", "question-science-02", "question-science-03", "question-science-04", "question-science-05"], responses: [{ questionId: "question-science-01", submittedAnswer: "Waterproof plastic", isCorrect: true }, { questionId: "question-science-02", submittedAnswer: "Leaves", isCorrect: true }, { questionId: "question-science-03", submittedAnswer: "Heart", isCorrect: true }, { questionId: "question-science-04", submittedAnswer: "It becomes solid", isCorrect: true }, { questionId: "question-science-05", submittedAnswer: "Friction", isCorrect: false }], scorePercent: 80, passed: true, attemptNumber: 1, startedAt: "2026-07-18T02:00:00.000Z", completedAt: "2026-07-18T02:04:12.000Z" },
    { id: "attempt-irfan-01", childId: "child-irfan", questionIds: ["question-math-01", "question-math-02", "question-math-03", "question-math-04", "question-math-05"], responses: [{ questionId: "question-math-01", submittedAnswer: "1/2", isCorrect: true }, { questionId: "question-math-02", submittedAnswer: "475", isCorrect: true }, { questionId: "question-math-03", submittedAnswer: "42", isCorrect: false }], scorePercent: 67, passed: false, attemptNumber: 1, startedAt: "2026-07-17T09:00:00.000Z" },
  ],
  rewardTransactions: [
    { id: "reward-aina-01", childId: "child-aina", challengeAttemptId: "attempt-aina-01", minutesAwarded: 10, appId: null, idempotencyKey: "attempt-aina-01:reward", status: "auto_granted", createdAt: "2026-07-18T02:04:13.000Z" },
    { id: "reward-irfan-01", childId: "child-irfan", challengeAttemptId: "attempt-irfan-01", minutesAwarded: 0, appId: null, idempotencyKey: "attempt-irfan-01:reward", status: "rejected", createdAt: "2026-07-17T09:05:00.000Z" },
  ],
  additionalTimeRequests: [
    { id: "request-aina-01", childId: "child-aina", appId: "app-galaxy", requestedMinutes: 10, status: "pending", createdAt: "2026-07-18T02:43:00.000Z" },
    { id: "request-irfan-01", childId: "child-irfan", appId: "app-youtube", requestedMinutes: 15, status: "pending", createdAt: "2026-07-18T02:27:00.000Z" },
  ],
};

export const seedSummary = {
  familyCount: 1,
  childCount: seedData.childProfiles.length,
  questionCount: seedData.questions.length,
  questionsPerSubject: seedData.questions.reduce<Record<Subject, number>>(
    (counts, question) => ({ ...counts, [question.subject]: counts[question.subject] + 1 }),
    { math: 0, science: 0, bm: 0, english: 0 },
  ),
} as const;
