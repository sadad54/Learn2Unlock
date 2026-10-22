# Learn2Unlock: Turning Screen Time Into Curriculum-Aligned Learning Time Through Parent-Governed AI Question Generation

**Authors:** Adnan Mashrur Sadad¹, [Supervisor Name]¹
**Affiliation:** ¹[Faculty / Department], [University Name], Malaysia
**Corresponding author:** adnanmashrursadad@gmail.com

**Keywords:** educational technology, parental control, generative AI, KSSR, screen time, mobile learning

---

## Abstract

Learn2Unlock converts a child's device screen time from a resource parents must ration into a reward children earn by answering curriculum-aligned questions. The system is a mobile application pair — a parent app and a child app — served by a persistent API. When a child requests access to a restricted application, the child app presents a short challenge of questions drawn from a question bank aligned to Malaysia's Kurikulum Standard Sekolah Rendah (KSSR). Passing the challenge credits a parent-defined number of screen-time minutes.

The novelty is not the reward loop itself but where the artificial intelligence sits. A generative model produces question *drafts* only. Every draft passes a deterministic server-side filter and then a human parent review before it can ever reach a child. The model has no authority to score an attempt, alter a rule, or award a single minute of screen time. This architecture — AI as a drafting assistant behind a parental gate — addresses the trust deficit that has limited adoption of AI in family and classroom settings, while removing the content-authoring burden that makes existing question-based lock-screen apps impractical for working parents.

A functional prototype has been implemented and is operational. This abstract reports the prototype architecture, the safety-filter design, and the evaluation study planned for the next phase.

---

## 1. Introduction and Problem Statement

Malaysian primary-school children are among the heaviest mobile device users in the region, and parental control tools have responded almost entirely with restriction: timers, blocklists, and bedtime cut-offs. Restriction is adversarial by design. It positions the parent as an obstacle, generates daily negotiation, and teaches the child nothing. The device is either allowed or forbidden; the time spent unlocking it produces no educational value.

A small category of "answer-to-unlock" applications exists, but they fail in practice for three reasons:

1. **Content mismatch.** Their question banks are generic and rarely map to the national curriculum a Malaysian child is actually being assessed on.
2. **Authoring burden.** Where parents can add their own questions, they must write, verify, and maintain them manually — an unrealistic ask.
3. **Trust gap.** Where AI generates the questions, it does so unsupervised. Parents cannot see, correct, or veto what their child is shown, and educators reasonably distrust unreviewed model output for young learners.

Learn2Unlock targets the intersection of all three.

## 2. Objectives

1. Design a screen-time system in which access is earned through curriculum-aligned practice rather than granted or denied arbitrarily.
2. Reduce parental content-authoring effort using generative AI while keeping every question under human control.
3. Enforce, architecturally, that the AI model cannot score attempts, modify rules, or award screen time.
4. Deliver a working cross-platform prototype aligned to KSSR Years 1–6 across Mathematics, Science, Bahasa Melayu, and English.
5. Define an evaluation protocol measuring learning engagement and reduction in parent–child screen-time conflict.

## 3. Innovation and Novelty

**Human-in-the-loop AI content pipeline.** Generated questions enter the system with the status `pending_review` and are invisible to the child until a parent explicitly approves them. Approval is the only path into the active bank.

**Deterministic pre-filter before human review.** Before a parent ever sees a draft, the server rejects it if it contains blocked terms (personal data solicitation, unsafe or age-inappropriate content), if the stated correct answer is absent from the answer options, if options are duplicated after normalisation, if the explanation does not actually contain the correct answer, or if the question duplicates one already in the bank. This filters low-quality output automatically so that parent review time is spent on judgement, not on catching obvious errors.

**Structured output enforcement.** The model is constrained by a strict JSON schema at the API boundary, so malformed generations fail at parse time rather than propagating into the application.

**Separation of authority.** Scoring, reward calculation, balance updates, and rule enforcement are implemented server-side in deterministic code paths that the model has no access to. The AI's authority ends at "suggest a draft."

**Curriculum anchoring.** Every question — seeded, parent-written, or AI-drafted — carries a subject, topic, KSSR learning standard code, difficulty, and language tag, so practice is traceable to what the child is taught in school.

**Dual-app design.** The parent app and the child app are separate applications with separate visual languages and separate authentication, rather than one app with a PIN-protected settings panel. The child's device runs the child app; the parent retains a genuinely separate control surface.

## 4. Methodology and System Architecture

The prototype is an Expo/React Native monorepo in TypeScript with three deployable units:

| Component | Role |
|---|---|
| **Parent app** | Sign-in, five-step family setup, dashboard, time-request approvals, question bank management, manual question authoring, AI generation and review, progress reports, settings |
| **Child app** | Home, restriction notice, challenge flow, pass/fail result, earned-time reward, parent request, emergency and school-app allowlist |
| **API server** | Node.js HTTP service over SQLite: token authentication, family data, question review workflow, attempt scoring, reward ledger, request decisions |

A shared package holds theme tokens, Zod validation schemas, repository contracts, and a KSSR-aligned seed bank spanning four subjects.

**Core interaction loop.** The child opens a restricted app → the child app shows the restriction notice → the child starts a challenge of *n* questions (parent-configured) → answers are submitted to the server → the server scores against the stored correct answers → if the score meets the parent's passing threshold, the reward minutes are credited to the child's balance, subject to a parent-set daily reward cap and maximum attempt count.

**AI generation flow.** Parent specifies school year, subject, topic, KSSR learning standard code, language, difficulty, question type, and count → request goes to the server (never from the child device, and never with the API key in the mobile bundle) → the model returns schema-constrained JSON → the deterministic filter rejects unsafe, duplicate, or internally inconsistent items → survivors are stored as `pending_review` → the parent approves, edits, or discards each one.

**Safety and privacy posture.** The provider API key is held server-side only and never enters either mobile bundle. Sessions are token-based with expiry. Emergency contacts and school-related applications remain reachable regardless of screen-time balance, so the reward mechanism can never block a child from help.

## 5. Prototype Status and Results

The following are implemented and operational in the current build:

- End-to-end parent flow: authentication, five-step onboarding (child profile, controlled apps, screen-time rules, challenge rules, rewards), dashboard, request handling, reports, and settings.
- End-to-end child flow: restriction notice, multi-question challenge, scored result, reward crediting, additional-time request, and emergency access.
- Persistent SQLite-backed API with typed contracts shared across all three units.
- KSSR-aligned seed question bank across Mathematics, Science, Bahasa Melayu, and English, tagged by topic, learning standard, and difficulty.
- Working AI generation endpoint with strict structured output and the full deterministic rejection filter.
- Automated API test suite and repository-wide type checking.

**Reported outcomes at this stage are technical, not behavioural.** No claim is made about learning gains or behaviour change until the evaluation below is executed.

## 6. Planned Evaluation

**Design.** A within-family, pre–post pilot over eight weeks with [N] Malaysian families with children in KSSR Years 3–6, recruited through [recruitment channel].

**Measures.**

- *Learning engagement:* number of challenge attempts, questions answered, and accuracy trend by KSSR learning standard, drawn from the server's attempt log.
- *Conflict reduction:* parent-reported frequency and intensity of screen-time disputes, collected pre- and post-pilot using a short validated family-conflict instrument.
- *AI content quality:* parent approval rate of AI-drafted questions, edit rate, and rejection reasons — the key measure of whether the human-in-the-loop pipeline reduces authoring burden without lowering quality.
- *Usability:* System Usability Scale administered separately to parents and to children using an age-adapted form.
- *Trust:* parent-reported willingness to allow AI-generated content, measured before and after exposure to the review workflow.

**Analysis.** Paired comparison of pre- and post-pilot conflict and trust scores; descriptive trend analysis of accuracy by learning standard; approval- and edit-rate reporting for the AI pipeline.

**Ethics.** Approval will be sought from [Institutional Research Ethics Committee]. Parental consent and child assent will be obtained. Attempt data will be de-identified before analysis.

## 7. Impact and Commercialisation Potential

**Educational impact.** Time children already spend negotiating for their devices is redirected into spaced retrieval practice on the exact learning standards their school assesses — practice that is measured, visible to parents in reports, and traceable to the curriculum.

**Social impact.** The system reframes the parent from gatekeeper to curator. Parents who cannot supervise homework in real time can still shape what their child practises, in fifteen minutes of question review rather than hours of tutoring.

**Market.** The immediate market is Malaysian households with primary-school children, reachable through schools, PIBG networks, and tuition centres. A school or district licence extends the same review workflow to teachers, who can approve a bank once for many families. The architecture is curriculum-agnostic: replacing the learning-standard taxonomy adapts it to other national curricula in the region.

**Sustainability.** Freemium consumer tier with a paid family tier for AI generation volume and detailed reporting; institutional licensing for schools. Server-side model calls keep unit economics controllable and keep credentials out of user devices.

## 8. Conclusion

Learn2Unlock demonstrates that generative AI can be introduced into children's educational technology without asking families to trust an unsupervised model. By confining the model to drafting, filtering its output deterministically, and requiring explicit parental approval before any question reaches a child, the system captures the scale advantage of AI content generation while keeping authority entirely human. A working prototype is complete; the planned pilot will test whether the approach delivers measurable engagement gains and reduced household conflict.

---

## References

*[Replace with your actual citations in the format NALI 2026 requires — typically APA 7th. Suggested sources to cite:]*

1. Kementerian Pendidikan Malaysia. *Dokumen Standard Kurikulum dan Pentaksiran (DSKP), KSSR Semakan 2017.* Bahagian Pembangunan Kurikulum.
2. [Reference on Malaysian children's screen time / device use prevalence]
3. [Reference on restrictive vs. active parental mediation of screen time]
4. [Reference on retrieval practice and spaced repetition in primary learners]
5. [Reference on human-in-the-loop AI in educational content generation]
6. [Reference on trust and acceptance of AI-generated content among parents/educators]

---

## Notes for Adnan — fill these before submitting

- `[Supervisor Name]`, `[Faculty / Department]`, `[University Name]`
- `[N]` families and `[recruitment channel]` in Section 6
- `[Institutional Research Ethics Committee]`
- References 2–6 — replace the placeholders with real, verifiable citations. Do not submit placeholder references.
- Check NALI 2026's word limit and trim Sections 3 and 7 first if you are over — they compress most easily without losing the core claim.
