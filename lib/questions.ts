export type Subject = 'reading' | 'math' | 'science' | 'english'

export interface Question {
  id: string
  subject: Subject
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correct: number // index of correct option
  explanation: string
}

export const SUBJECTS: { id: Subject; label: string; icon: string; color: string; description: string }[] = [
  { id: 'reading',  label: 'Reading',          icon: '📖', color: 'from-blue-500 to-blue-600',   description: 'Key ideas, inferences, vocabulary in context' },
  { id: 'math',     label: 'Math',             icon: '📐', color: 'from-violet-500 to-violet-600', description: 'Algebra, fractions, percentages, statistics' },
  { id: 'science',  label: 'Science',          icon: '🔬', color: 'from-teal-500 to-teal-600',   description: 'Anatomy, biology, chemistry, scientific reasoning' },
  { id: 'english',  label: 'English & Language', icon: '✍️', color: 'from-amber-500 to-amber-600', description: 'Grammar, punctuation, sentence structure' },
]

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'r1',
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
    id: 'r2',
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
  {
    id: 'm1',
    subject: 'math',
    topic: 'Percentages',
    difficulty: 'medium',
    question: 'A nurse needs to administer 40% of a 250 mL IV bag. How many milliliters should the patient receive?',
    options: ['80 mL', '100 mL', '125 mL', '150 mL'],
    correct: 1,
    explanation: '40% of 250 mL = 0.40 × 250 = 100 mL. To find a percentage of a number, convert the percentage to a decimal (40% = 0.40) and multiply. 0.40 × 250 = 100.',
  },
  {
    id: 'm2',
    subject: 'math',
    topic: 'Algebra',
    difficulty: 'medium',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '9'],
    correct: 1,
    explanation: 'To solve for x: subtract 7 from both sides → 3x = 15. Then divide both sides by 3 → x = 5. Check: 3(5) + 7 = 15 + 7 = 22. ✓',
  },
  {
    id: 's1',
    subject: 'science',
    topic: 'Human Anatomy',
    difficulty: 'medium',
    question: 'Which chamber of the heart is responsible for pumping oxygenated blood to the rest of the body?',
    options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
    correct: 3,
    explanation: 'The left ventricle pumps oxygenated blood out through the aorta to the entire body. This is why the left ventricle has the thickest walls — it needs to generate the most pressure. The right ventricle pumps deoxygenated blood to the lungs. The atria receive blood (right atrium from body, left atrium from lungs).',
  },
  {
    id: 's2',
    subject: 'science',
    topic: 'Biology',
    difficulty: 'medium',
    question: 'During cellular respiration, glucose is broken down to produce ATP. Which organelle is primarily responsible for this process?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correct: 2,
    explanation: 'The mitochondria is known as the "powerhouse of the cell" because it\'s where cellular respiration (specifically the Krebs cycle and electron transport chain) produces most of the cell\'s ATP. The nucleus contains DNA. Ribosomes make proteins. The Golgi apparatus packages and ships proteins.',
  },
  {
    id: 'e1',
    subject: 'english',
    topic: 'Grammar',
    difficulty: 'easy',
    question: 'Which of the following sentences is grammatically correct?',
    options: [
      'The team of nurses were exhausted after their shift.',
      'The team of nurses was exhausted after their shift.',
      'The team of nurses are exhausted after their shift.',
      'The team of nurses have been exhausted after their shift.',
    ],
    correct: 1,
    explanation: '"Team" is a collective noun and takes a singular verb in American English. "The team... was exhausted" is correct. Although "team" refers to multiple people, the noun itself is singular. "Were," "are," and "have been" are all plural forms and incorrect here.',
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
    explanation: 'A semicolon connects two independent clauses (complete sentences) without a conjunction. "She studied all night" and "she still felt unprepared" are both complete sentences, making option B correct. Option A incorrectly uses a semicolon before a conjunction (but). Options C and D split clauses incorrectly.',
  },
]
