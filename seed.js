import { db } from './server/db.js';
import { questionBanks, questions } from './shared/schema.js';

async function seedData() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Get user ID (replace with your actual user ID)
    const userId = '64b8ff57-e7c1-4acc-bd13-d040ef96d9d4';
    
    // Question bank data
    const questionBanksData = [
      // APTIS Reading Banks (5 banks)
      { name: 'APTIS Reading Comprehension - Beginner', description: 'Basic reading comprehension exercises for APTIS preparation', testType: 'aptis', skillType: 'reading', examDuration: 60 },
      { name: 'APTIS Reading Comprehension - Intermediate', description: 'Intermediate level reading passages and questions', testType: 'aptis', skillType: 'reading', examDuration: 75 },
      { name: 'APTIS Advanced Reading Skills', description: 'Advanced reading strategies and complex texts', testType: 'aptis', skillType: 'reading', examDuration: 90 },
      { name: 'APTIS Reading Practice Test 1', description: 'Full reading practice test in APTIS format', testType: 'aptis', skillType: 'reading', examDuration: 60 },
      { name: 'APTIS Reading Practice Test 2', description: 'Additional reading practice with varied topics', testType: 'aptis', skillType: 'reading', examDuration: 60 },
      
      // APTIS Listening Banks (3 banks)
      { name: 'APTIS Listening Fundamentals', description: 'Basic listening skills and comprehension', testType: 'aptis', skillType: 'listening', examDuration: 45 },
      { name: 'APTIS Listening Practice Set A', description: 'Listening exercises with audio materials', testType: 'aptis', skillType: 'listening', examDuration: 50 },
      { name: 'APTIS Advanced Listening', description: 'Complex listening scenarios and dialogues', testType: 'aptis', skillType: 'listening', examDuration: 55 },
      
      // VSTEP Reading Banks (4 banks)
      { name: 'VSTEP Reading Level 3-5', description: 'Reading comprehension for VSTEP levels 3-5', testType: 'vstep', skillType: 'reading', examDuration: 60 },
      { name: 'VSTEP Reading Academic Texts', description: 'Academic reading passages for VSTEP', testType: 'vstep', skillType: 'reading', examDuration: 75 },
      { name: 'VSTEP Reading Mock Test 1', description: 'Full reading section practice test', testType: 'vstep', skillType: 'reading', examDuration: 60 },
      { name: 'VSTEP Reading Mock Test 2', description: 'Additional reading practice with timer', testType: 'vstep', skillType: 'reading', examDuration: 60 },
      
      // VSTEP Listening Banks (3 banks)
      { name: 'VSTEP Listening Essentials', description: 'Essential listening skills for VSTEP', testType: 'vstep', skillType: 'listening', examDuration: 40 },
      { name: 'VSTEP Listening Practice A', description: 'Comprehensive listening practice set', testType: 'vstep', skillType: 'listening', examDuration: 45 },
      { name: 'VSTEP Listening Mock Exam', description: 'Full listening section simulation', testType: 'vstep', skillType: 'listening', examDuration: 40 },
      
      // Grammar Banks (3 banks)
      { name: 'English Grammar Fundamentals', description: 'Basic to intermediate grammar rules', testType: 'custom', skillType: 'grammar', examDuration: 30 },
      { name: 'Advanced English Grammar', description: 'Complex grammar structures and usage', testType: 'custom', skillType: 'grammar', examDuration: 45 },
      { name: 'Grammar for Test Preparation', description: 'Grammar exercises for exam preparation', testType: 'custom', skillType: 'grammar', examDuration: 40 },
      
      // Vocabulary Banks (2 banks)
      { name: 'Academic Vocabulary Builder', description: 'Essential academic vocabulary for tests', testType: 'custom', skillType: 'vocabulary', examDuration: 25 },
      { name: 'Advanced Vocabulary Practice', description: 'High-level vocabulary and word usage', testType: 'custom', skillType: 'vocabulary', examDuration: 30 },
    ];

    // Insert question banks
    console.log('📚 Creating question banks...');
    const createdBanks = [];
    for (const bankData of questionBanksData) {
      const [bank] = await db.insert(questionBanks).values({
        ...bankData,
        createdBy: userId
      }).returning();
      createdBanks.push(bank);
      console.log(`✅ Created: ${bank.name}`);
    }

    // Insert questions for each bank
    console.log('❓ Creating questions...');
    for (const bank of createdBanks) {
      const questionCount = Math.floor(Math.random() * 21) + 20; // 20-40 questions
      const questionsData = [];
      
      for (let i = 1; i <= questionCount; i++) {
        const questionContent = generateQuestionContent(bank.skillType, bank.testType, i);
        questionsData.push({
          questionBankId: bank.id,
          content: questionContent.content,
          options: questionContent.options,
          correctAnswer: questionContent.correctAnswer,
          explanation: questionContent.explanation,
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          points: Math.floor(i % 3) + 1,
          orderIndex: i
        });
      }
      
      await db.insert(questions).values(questionsData);
      console.log(`✅ Created ${questionCount} questions for: ${bank.name}`);
    }

    console.log('🎉 Seed process completed successfully!');
    console.log(`📊 Total: ${createdBanks.length} question banks created`);
    
  } catch (error) {
    console.error('❌ Seed process failed:', error);
  } finally {
    process.exit(0);
  }
}

function generateQuestionContent(skillType, testType, questionNumber) {
  const templates = {
    reading: {
      content: `Reading Question ${questionNumber}: According to the passage, what is the main idea discussed in paragraph ${Math.floor(questionNumber % 5) + 1}?`,
      options: [
        "The economic impact of globalization on developing countries",
        "Environmental challenges facing modern cities", 
        "Technological advances in communication",
        "Social changes in contemporary society"
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][questionNumber % 4],
      explanation: `The correct answer can be found in the key sentences of paragraph ${Math.floor(questionNumber % 5) + 1} which explicitly states the main concept.`
    },
    listening: {
      content: `Listening Question ${questionNumber}: In the conversation, what does the speaker suggest about the topic discussed?`,
      options: [
        "It requires immediate attention and action",
        "It needs further research and analysis",
        "It should be postponed until next month", 
        "It has already been resolved satisfactorily"
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][questionNumber % 4],
      explanation: `The speaker's tone and specific words indicate their recommendation regarding the timing and approach to the issue.`
    },
    grammar: {
      content: `Grammar Question ${questionNumber}: Choose the correct form to complete the sentence: "If I _______ more time, I would have finished the project."`,
      options: [
        "had",
        "have had", 
        "would have",
        "had had"
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][questionNumber % 4],
      explanation: `This is a third conditional sentence requiring the past perfect tense in the if-clause.`
    },
    vocabulary: {
      content: `Vocabulary Question ${questionNumber}: Which word best completes the sentence: "The professor's lecture was so _______ that many students fell asleep."`,
      options: [
        "monotonous",
        "fascinating",
        "interactive",
        "controversial"
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][questionNumber % 4],
      explanation: `The context clue "fell asleep" indicates that the lecture was boring or lacking in variation.`
    }
  };
  
  return templates[skillType] || templates.reading;
}

seedData();