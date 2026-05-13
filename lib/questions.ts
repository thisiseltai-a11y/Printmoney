export type Subject = 'reading' | 'math' | 'science' | 'english'

export interface Question {
  id: string
  subject: Subject
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  passage?: string
  passageTitle?: string
  passageGroupId?: string
  stimulusIndex?: number
  stimulusTotal?: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export const SUBJECTS: { id: Subject; label: string; icon: string; color: string; description: string }[] = [
  { id: 'reading',  label: 'Reading',             icon: '📖', color: 'from-blue-500 to-blue-600',    description: 'Key ideas, inferences, vocabulary in context' },
  { id: 'math',     label: 'Math',                icon: '📐', color: 'from-violet-500 to-violet-600', description: 'Algebra, fractions, percentages, statistics' },
  { id: 'science',  label: 'Science',             icon: '🔬', color: 'from-teal-500 to-teal-600',    description: 'Anatomy, biology, chemistry, scientific reasoning' },
  { id: 'english',  label: 'English & Language',  icon: '✍️', color: 'from-amber-500 to-amber-600',  description: 'Grammar, punctuation, sentence structure' },
]

export const SAMPLE_QUESTIONS: Question[] = [
  // ── READING — Passage Group 1 (3 questions) ─────────────────────────────
  {
    id: 'r-p1-q1',
    subject: 'reading',
    topic: 'Main Idea',
    difficulty: 'medium',
    passageGroupId: 'r-passage-1',
    stimulusIndex: 1,
    stimulusTotal: 3,
    passageTitle: 'Hand Hygiene in Clinical Settings',
    passage: `Hand hygiene is widely recognized as the single most effective measure for preventing the spread of healthcare-associated infections (HAIs). Despite this, studies consistently show that healthcare workers comply with hand hygiene protocols only 40–60% of the time. The consequences are significant: HAIs affect approximately 1 in 31 hospital patients on any given day in the United States, contributing to tens of thousands of preventable deaths annually.

The World Health Organization (WHO) promotes a "5 Moments for Hand Hygiene" framework, which identifies the key points during patient care when hand hygiene must be performed: before touching a patient, before a clean or aseptic procedure, after body fluid exposure, after touching a patient, and after touching patient surroundings. Each moment targets a specific transmission pathway and is grounded in evidence of infection risk.

Barriers to compliance are multifactorial. Skin irritation from frequent washing, time pressure, insufficient access to hand hygiene products, and a belief that gloves eliminate the need for hand washing are commonly cited reasons. Interventions that have shown the most promise include alcohol-based hand rub availability at every point of care, regular performance feedback, and sustained education campaigns. Institutional culture—where leadership models and enforces standards—has emerged as the strongest predictor of long-term compliance improvement.`,
    question: 'Which of the following best states the main idea of this passage?',
    options: [
      'Healthcare workers rarely wash their hands because they are too busy.',
      'Hand hygiene is essential to preventing infections, yet compliance remains low due to multiple barriers.',
      'The WHO\'s 5 Moments framework is the most important development in infection control.',
      'Alcohol-based hand rubs are more effective than soap and water in clinical settings.',
    ],
    correct: 1,
    explanation: 'The passage opens by establishing hand hygiene as the single most effective prevention measure, then addresses the compliance gap and its consequences, barriers, and solutions. Option B accurately reflects the full scope. Options A, C, and D each capture only one supporting detail rather than the overall argument.',
  },
  {
    id: 'r-p1-q2',
    subject: 'reading',
    topic: 'Inference',
    difficulty: 'medium',
    passageGroupId: 'r-passage-1',
    stimulusIndex: 2,
    stimulusTotal: 3,
    passageTitle: 'Hand Hygiene in Clinical Settings',
    passage: `Hand hygiene is widely recognized as the single most effective measure for preventing the spread of healthcare-associated infections (HAIs). Despite this, studies consistently show that healthcare workers comply with hand hygiene protocols only 40–60% of the time. The consequences are significant: HAIs affect approximately 1 in 31 hospital patients on any given day in the United States, contributing to tens of thousands of preventable deaths annually.

The World Health Organization (WHO) promotes a "5 Moments for Hand Hygiene" framework, which identifies the key points during patient care when hand hygiene must be performed: before touching a patient, before a clean or aseptic procedure, after body fluid exposure, after touching a patient, and after touching patient surroundings. Each moment targets a specific transmission pathway and is grounded in evidence of infection risk.

Barriers to compliance are multifactorial. Skin irritation from frequent washing, time pressure, insufficient access to hand hygiene products, and a belief that gloves eliminate the need for hand washing are commonly cited reasons. Interventions that have shown the most promise include alcohol-based hand rub availability at every point of care, regular performance feedback, and sustained education campaigns. Institutional culture—where leadership models and enforces standards—has emerged as the strongest predictor of long-term compliance improvement.`,
    question: 'Based on the passage, what can be inferred about a hospital unit where leadership actively models and enforces hand hygiene standards?',
    options: [
      'Staff on that unit are more likely to develop skin irritation from frequent hand washing.',
      'That unit is likely to have higher long-term hand hygiene compliance than units where leadership does not model the behavior.',
      'That unit will eliminate healthcare-associated infections entirely.',
      'Staff will rely on alcohol-based hand rubs rather than soap and water.',
    ],
    correct: 1,
    explanation: 'The passage states that "institutional culture—where leadership models and enforces standards—has emerged as the strongest predictor of long-term compliance improvement." This directly supports the inference in option B. Option C goes too far (the passage says compliance improves, not that HAIs are eliminated). Options A and D are not supported by the text.',
  },
  {
    id: 'r-p1-q3',
    subject: 'reading',
    topic: 'Vocabulary in Context',
    difficulty: 'medium',
    passageGroupId: 'r-passage-1',
    stimulusIndex: 3,
    stimulusTotal: 3,
    passageTitle: 'Hand Hygiene in Clinical Settings',
    passage: `Hand hygiene is widely recognized as the single most effective measure for preventing the spread of healthcare-associated infections (HAIs). Despite this, studies consistently show that healthcare workers comply with hand hygiene protocols only 40–60% of the time. The consequences are significant: HAIs affect approximately 1 in 31 hospital patients on any given day in the United States, contributing to tens of thousands of preventable deaths annually.

The World Health Organization (WHO) promotes a "5 Moments for Hand Hygiene" framework, which identifies the key points during patient care when hand hygiene must be performed: before touching a patient, before a clean or aseptic procedure, after body fluid exposure, after touching a patient, and after touching patient surroundings. Each moment targets a specific transmission pathway and is grounded in evidence of infection risk.

Barriers to compliance are multifactorial. Skin irritation from frequent washing, time pressure, insufficient access to hand hygiene products, and a belief that gloves eliminate the need for hand washing are commonly cited reasons. Interventions that have shown the most promise include alcohol-based hand rub availability at every point of care, regular performance feedback, and sustained education campaigns. Institutional culture—where leadership models and enforces standards—has emerged as the strongest predictor of long-term compliance improvement.`,
    question: 'As used in the passage, the word "multifactorial" most nearly means:',
    options: [
      'Difficult to measure accurately',
      'Resulting from many different causes',
      'Unique to each individual worker',
      'Related to hospital administration policies',
    ],
    correct: 1,
    explanation: '"Multifactorial" combines "multi-" (many) and "factor" (cause or element). The passage then lists several distinct barriers—skin irritation, time pressure, lack of access, and misconceptions about gloves—confirming that the barriers arise from many different causes. Option B is correct.',
  },

  // ── READING — Passage Group 2 (2 questions) ─────────────────────────────
  {
    id: 'r-p2-q1',
    subject: 'reading',
    topic: 'Author\'s Purpose',
    difficulty: 'medium',
    passageGroupId: 'r-passage-2',
    stimulusIndex: 1,
    stimulusTotal: 2,
    passageTitle: 'The Nurse\'s Role in Patient Education',
    passage: `Patient education has evolved from a brief verbal exchange at discharge to a recognized pillar of modern nursing practice. Research consistently demonstrates that patients who understand their diagnosis, medications, and self-care plan are more likely to adhere to treatment regimens, recognize warning signs early, and experience fewer hospital readmissions. Despite this evidence, nurses often report that time constraints, language barriers, and low health literacy among patients limit the effectiveness of their teaching.

Effective patient education relies on several principles. First, the nurse must assess the patient's baseline knowledge and readiness to learn before delivering information. Attempting to teach a patient who is in pain, anxious, or cognitively impaired is unlikely to be productive. Second, information should be presented in plain language—ideally at or below a sixth-grade reading level—and reinforced through multiple modalities: verbal explanation, written materials, and demonstration when applicable. The "teach-back" method, in which the patient repeats the information in their own words, is one of the most validated tools for confirming comprehension.

Nurses who invest in patient education are not simply fulfilling a regulatory requirement; they are directly influencing patient outcomes. Studies have linked structured discharge education to reductions in 30-day readmission rates for conditions such as heart failure and pneumonia. In an era of value-based care, where hospitals are financially penalized for preventable readmissions, effective nursing education has both clinical and institutional implications.`,
    question: 'What is the primary purpose of this passage?',
    options: [
      'To argue that nurses spend too much time on patient education instead of direct care',
      'To explain what patient education is and why it matters in nursing practice',
      'To compare the effectiveness of verbal instruction versus written materials',
      'To describe the history of patient education from the past to the present',
    ],
    correct: 1,
    explanation: 'The passage defines patient education, presents evidence for its value, describes best practices, and connects it to patient outcomes and hospital finances. The overarching purpose is to explain the role and importance of patient education in nursing—option B. Option A misrepresents the tone. Option C is a supporting detail, not the main purpose. Option D focuses only on the opening sentence.',
  },
  {
    id: 'r-p2-q2',
    subject: 'reading',
    topic: 'Supporting Detail',
    difficulty: 'easy',
    passageGroupId: 'r-passage-2',
    stimulusIndex: 2,
    stimulusTotal: 2,
    passageTitle: 'The Nurse\'s Role in Patient Education',
    passage: `Patient education has evolved from a brief verbal exchange at discharge to a recognized pillar of modern nursing practice. Research consistently demonstrates that patients who understand their diagnosis, medications, and self-care plan are more likely to adhere to treatment regimens, recognize warning signs early, and experience fewer hospital readmissions. Despite this evidence, nurses often report that time constraints, language barriers, and low health literacy among patients limit the effectiveness of their teaching.

Effective patient education relies on several principles. First, the nurse must assess the patient's baseline knowledge and readiness to learn before delivering information. Attempting to teach a patient who is in pain, anxious, or cognitively impaired is unlikely to be productive. Second, information should be presented in plain language—ideally at or below a sixth-grade reading level—and reinforced through multiple modalities: verbal explanation, written materials, and demonstration when applicable. The "teach-back" method, in which the patient repeats the information in their own words, is one of the most validated tools for confirming comprehension.

Nurses who invest in patient education are not simply fulfilling a regulatory requirement; they are directly influencing patient outcomes. Studies have linked structured discharge education to reductions in 30-day readmission rates for conditions such as heart failure and pneumonia. In an era of value-based care, where hospitals are financially penalized for preventable readmissions, effective nursing education has both clinical and institutional implications.`,
    question: 'According to the passage, what does the "teach-back" method involve?',
    options: [
      'The nurse repeating the information a second time to reinforce learning',
      'Using written handouts that the patient takes home and reviews later',
      'Having the patient repeat the information back in their own words',
      'Testing the patient with a written quiz before discharge',
    ],
    correct: 2,
    explanation: 'The passage explicitly states: "The \'teach-back\' method, in which the patient repeats the information in their own words, is one of the most validated tools for confirming comprehension." Option C matches this definition exactly. Options A, B, and D describe other education strategies not defined as teach-back in the passage.',
  },

  // ── READING — Standalone questions ──────────────────────────────────────
  {
    id: 'r3',
    subject: 'reading',
    topic: 'Main Idea',
    difficulty: 'medium',
    question: 'A student reads a passage about the history of antibiotics. The passage describes Fleming\'s discovery of penicillin, early clinical trials, and the eventual mass production during World War II. What is the most likely main idea of this passage?',
    options: [
      'Fleming was the most important scientist of the 20th century',
      'The development of antibiotics involved discovery, testing, and large-scale production',
      'World War II caused significant advances in medical science',
      'Penicillin is the most important antibiotic ever discovered',
    ],
    correct: 1,
    explanation: 'The passage covers three distinct phases — discovery, trials, and production — making option B the most accurate summary of the overall main idea. Options A, C, and D each focus on one detail rather than the full scope of the passage.',
  },
  {
    id: 'r4',
    subject: 'reading',
    topic: 'Inference',
    difficulty: 'medium',
    question: 'The passage states: "By the third week of the study, participants who received the new medication reported significantly fewer symptoms, while the placebo group showed no change." What can be inferred from this statement?',
    options: [
      'The medication cured all participants',
      'The placebo group was not monitored properly',
      'The medication appears to be effective at reducing symptoms',
      'Three weeks is not enough time to evaluate a medication',
    ],
    correct: 2,
    explanation: 'The key word "inferred" means we draw a logical conclusion from the evidence. The passage clearly states the medication group improved while the placebo did not — the most reasonable inference is that the medication is effective. We cannot conclude it "cured" everyone (A), that monitoring was poor (B), or make a judgment about study duration (D).',
  },

  // ── MATH ─────────────────────────────────────────────────────────────────
  {
    id: 'm1',
    subject: 'math',
    topic: 'Percentages',
    difficulty: 'medium',
    question: 'A nurse needs to administer 40% of a 250 mL IV bag. How many milliliters should the patient receive?',
    options: ['80 mL', '100 mL', '125 mL', '150 mL'],
    correct: 1,
    explanation: '40% of 250 mL = 0.40 × 250 = 100 mL. To find a percentage of a number, convert the percentage to a decimal (40% = 0.40) and multiply.',
  },
  {
    id: 'm2',
    subject: 'math',
    topic: 'Algebra',
    difficulty: 'medium',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '9'],
    correct: 1,
    explanation: 'Subtract 7 from both sides → 3x = 15. Divide both sides by 3 → x = 5. Check: 3(5) + 7 = 22. ✓',
  },
  {
    id: 'm3',
    subject: 'math',
    topic: 'Dosage Calculation',
    difficulty: 'hard',
    question: 'A physician orders 500 mg of amoxicillin. The medication is available as 250 mg per 5 mL suspension. How many mL should the nurse administer?',
    options: ['5 mL', '7.5 mL', '10 mL', '12.5 mL'],
    correct: 2,
    explanation: 'Use the formula: (Desired dose ÷ Available dose) × Volume = (500 mg ÷ 250 mg) × 5 mL = 2 × 5 = 10 mL.',
  },
  {
    id: 'm4',
    subject: 'math',
    topic: 'Ratios & Proportions',
    difficulty: 'medium',
    question: 'A recipe requires 3 cups of flour for every 2 cups of sugar. If you use 9 cups of flour, how many cups of sugar are needed?',
    options: ['4 cups', '5 cups', '6 cups', '8 cups'],
    correct: 2,
    explanation: 'Set up a proportion: 3/2 = 9/x. Cross-multiply: 3x = 18, so x = 6 cups of sugar.',
  },

  // ── SCIENCE ──────────────────────────────────────────────────────────────
  {
    id: 's1',
    subject: 'science',
    topic: 'Human Anatomy',
    difficulty: 'medium',
    question: 'Which chamber of the heart is responsible for pumping oxygenated blood to the rest of the body?',
    options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
    correct: 3,
    explanation: 'The left ventricle pumps oxygenated blood out through the aorta to the entire body. It has the thickest walls because it generates the most pressure. The right ventricle pumps deoxygenated blood to the lungs. The atria receive blood (right atrium from body, left atrium from lungs).',
  },
  {
    id: 's2',
    subject: 'science',
    topic: 'Cell Biology',
    difficulty: 'medium',
    question: 'During cellular respiration, glucose is broken down to produce ATP. Which organelle is primarily responsible for this process?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correct: 2,
    explanation: 'The mitochondria is known as the "powerhouse of the cell" because it\'s where the Krebs cycle and electron transport chain produce most of the cell\'s ATP. The nucleus contains DNA. Ribosomes make proteins. The Golgi apparatus packages and ships proteins.',
  },
  {
    id: 's3',
    subject: 'science',
    topic: 'Physiology',
    difficulty: 'medium',
    question: 'Which hormone is primarily responsible for regulating blood glucose levels by promoting the uptake of glucose into cells?',
    options: ['Glucagon', 'Cortisol', 'Insulin', 'Epinephrine'],
    correct: 2,
    explanation: 'Insulin, released by beta cells of the pancreas, lowers blood glucose by promoting uptake into muscle, fat, and liver cells. Glucagon raises blood glucose. Cortisol and epinephrine also raise blood glucose during stress responses.',
  },
  {
    id: 's4',
    subject: 'science',
    topic: 'Scientific Reasoning',
    difficulty: 'hard',
    question: 'A researcher wants to test whether a new drug reduces blood pressure. She divides 100 participants into two groups: one receives the drug, and one receives a sugar pill. Neither the participants nor the researchers know who received which treatment. What type of study is this?',
    options: ['Single-blind study', 'Double-blind randomized controlled trial', 'Cohort study', 'Case-control study'],
    correct: 1,
    explanation: 'A double-blind RCT means neither participants nor researchers know who receives the treatment — eliminating both participant bias and researcher bias. Single-blind = only participants don\'t know. Cohort studies follow groups over time. Case-control studies compare people with/without a condition.',
  },

  // ── ENGLISH ───────────────────────────────────────────────────────────────
  {
    id: 'e1',
    subject: 'english',
    topic: 'Subject-Verb Agreement',
    difficulty: 'easy',
    question: 'Which of the following sentences is grammatically correct?',
    options: [
      'The team of nurses were exhausted after their shift.',
      'The team of nurses was exhausted after their shift.',
      'The team of nurses are exhausted after their shift.',
      'The team of nurses have been exhausted after their shift.',
    ],
    correct: 1,
    explanation: '"Team" is a collective noun and takes a singular verb in American English. "The team... was exhausted" is correct. "Were," "are," and "have been" are plural forms and incorrect here.',
  },
  {
    id: 'e2',
    subject: 'english',
    topic: 'Punctuation',
    difficulty: 'medium',
    question: 'Which sentence uses a semicolon correctly?',
    options: [
      'She studied all night; but she still felt unprepared.',
      'She studied all night; she still felt unprepared.',
      'She studied; all night for the exam.',
      'She; studied all night for the exam.',
    ],
    correct: 1,
    explanation: 'A semicolon connects two independent clauses without a conjunction. "She studied all night" and "she still felt unprepared" are both complete sentences, making option B correct. Option A incorrectly uses a semicolon before a conjunction (but). Options C and D split clauses incorrectly.',
  },
  {
    id: 'e3',
    subject: 'english',
    topic: 'Sentence Structure',
    difficulty: 'medium',
    question: 'Which of the following is a run-on sentence?',
    options: [
      'The patient was stable; the nurse updated the chart.',
      'Although the patient was stable, the nurse stayed nearby.',
      'The patient was stable the nurse updated the chart.',
      'The patient was stable, so the nurse updated the chart.',
    ],
    correct: 2,
    explanation: 'A run-on sentence joins two independent clauses without proper punctuation or a conjunction. Option C has two complete thoughts ("The patient was stable" and "the nurse updated the chart") fused without any separator. Options A (semicolon), B (subordinating conjunction), and D (comma + coordinating conjunction) are all correctly formed.',
  },
  {
    id: 'e4',
    subject: 'english',
    topic: 'Word Choice',
    difficulty: 'easy',
    question: 'Which sentence uses the correct word?',
    options: [
      'The doctor reviewed the patients chart.',
      'The doctor reviewed the patient\'s chart.',
      'The doctor reviewed the patients\' chart.',
      'The doctor reviewed the patients charts.',
    ],
    correct: 1,
    explanation: 'When showing possession for a singular noun, add an apostrophe + s. "The patient\'s chart" means the chart belonging to one patient. "Patients\'" would indicate multiple patients. "Patients chart" and "patients charts" are missing the possessive apostrophe entirely.',
  },
]
