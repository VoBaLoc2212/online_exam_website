import { 
  users, questionBanks, questions, tests, testSessions, results,
  type User, type InsertUser, type QuestionBank, type InsertQuestionBank,
  type Question, type InsertQuestion, type Test, type InsertTest,
  type TestSession, type InsertTestSession, type Result, type InsertResult
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Question Bank methods
  getQuestionBanks(userId: string): Promise<QuestionBank[]>;
  getQuestionBank(id: string): Promise<QuestionBank | undefined>;
  createQuestionBank(questionBank: InsertQuestionBank): Promise<QuestionBank>;
  updateQuestionBank(id: string, updates: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined>;
  deleteQuestionBank(id: string): Promise<boolean>;

  // Question methods
  getQuestions(questionBankId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;

  // Test methods
  getTests(userId: string): Promise<Test[]>;
  getTest(id: string): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, updates: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;

  // Test Session methods
  getTestSession(id: string): Promise<TestSession | undefined>;
  getUserTestSessions(userId: string): Promise<TestSession[]>;
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  updateTestSession(id: string, updates: Partial<InsertTestSession>): Promise<TestSession | undefined>;
  completeTestSession(id: string): Promise<TestSession | undefined>;

  // Result methods
  getResults(userId: string): Promise<Result[]>;
  getResult(id: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;

  // Analytics methods
  getUserStats(userId: string): Promise<{
    totalPractice: number;
    mockTests: number;
    averageScore: number;
    studyStreak: number;
  }>;
  getSkillProgress(userId: string): Promise<{
    [skill: string]: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Question Bank methods
  async getQuestionBanks(userId: string): Promise<QuestionBank[]> {
    return await db
      .select()
      .from(questionBanks)
      .where(eq(questionBanks.createdBy, userId))
      .orderBy(desc(questionBanks.createdAt));
  }

  async getQuestionBank(id: string): Promise<QuestionBank | undefined> {
    const [questionBank] = await db.select().from(questionBanks).where(eq(questionBanks.id, id));
    return questionBank || undefined;
  }

  async createQuestionBank(questionBank: InsertQuestionBank): Promise<QuestionBank> {
    const [created] = await db
      .insert(questionBanks)
      .values(questionBank)
      .returning();
    return created;
  }

  async updateQuestionBank(id: string, updates: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined> {
    const [updated] = await db
      .update(questionBanks)
      .set(updates)
      .where(eq(questionBanks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteQuestionBank(id: string): Promise<boolean> {
    const result = await db
      .delete(questionBanks)
      .where(eq(questionBanks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Question methods
  async getQuestions(questionBankId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.questionBankId, questionBankId))
      .orderBy(questions.orderIndex);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db
      .insert(questions)
      .values(question)
      .returning();
    return created;
  }

  async createQuestions(questionsData: InsertQuestion[]): Promise<Question[]> {
    return await db
      .insert(questions)
      .values(questionsData)
      .returning();
  }

  async updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updated] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await db
      .delete(questions)
      .where(eq(questions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test methods
  async getTests(userId: string): Promise<Test[]> {
    return await db
      .select()
      .from(tests)
      .where(eq(tests.createdBy, userId))
      .orderBy(desc(tests.createdAt));
  }

  async getTest(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test || undefined;
  }

  async createTest(test: InsertTest): Promise<Test> {
    const [created] = await db
      .insert(tests)
      .values(test)
      .returning();
    return created;
  }

  async updateTest(id: string, updates: Partial<InsertTest>): Promise<Test | undefined> {
    const [updated] = await db
      .update(tests)
      .set(updates)
      .where(eq(tests.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTest(id: string): Promise<boolean> {
    const result = await db
      .delete(tests)
      .where(eq(tests.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test Session methods
  async getTestSession(id: string): Promise<TestSession | undefined> {
    const [session] = await db.select().from(testSessions).where(eq(testSessions.id, id));
    return session || undefined;
  }

  async getUserTestSessions(userId: string): Promise<TestSession[]> {
    return await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startTime));
  }

  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const [created] = await db
      .insert(testSessions)
      .values(session)
      .returning();
    return created;
  }

  async updateTestSession(id: string, updates: Partial<InsertTestSession>): Promise<TestSession | undefined> {
    const [updated] = await db
      .update(testSessions)
      .set(updates)
      .where(eq(testSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async completeTestSession(id: string): Promise<TestSession | undefined> {
    const [updated] = await db
      .update(testSessions)
      .set({
        isCompleted: true,
        endTime: new Date(),
      })
      .where(eq(testSessions.id, id))
      .returning();
    return updated || undefined;
  }

  // Result methods
  async getResults(userId: string): Promise<Result[]> {
    return await db
      .select()
      .from(results)
      .where(eq(results.userId, userId))
      .orderBy(desc(results.completedAt));
  }

  async getResult(id: string): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(eq(results.id, id));
    return result || undefined;
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [created] = await db
      .insert(results)
      .values(result)
      .returning();
    return created;
  }

  // Analytics methods
  async getUserStats(userId: string): Promise<{
    totalPractice: number;
    mockTests: number;
    averageScore: number;
    studyStreak: number;
  }> {
    const [stats] = await db
      .select({
        totalPractice: sql<number>`count(*)`,
        averageScore: sql<number>`avg(percentage)`,
      })
      .from(results)
      .where(eq(results.userId, userId));

    const mockTests = await db
      .select({ count: sql<number>`count(*)` })
      .from(results)
      .innerJoin(tests, eq(results.testId, tests.id))
      .where(and(
        eq(results.userId, userId),
        eq(tests.testType, 'vstep')
      ));

    // Simple study streak calculation (consecutive days with activity)
    const recentResults = await db
      .select({ completedAt: results.completedAt })
      .from(results)
      .where(eq(results.userId, userId))
      .orderBy(desc(results.completedAt))
      .limit(30);

    let studyStreak = 0;
    if (recentResults.length > 0) {
      const today = new Date();
      const dates = recentResults.map(r => r.completedAt.toDateString());
      const uniqueDates = Array.from(new Set(dates));
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i]);
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          studyStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalPractice: stats?.totalPractice || 0,
      mockTests: mockTests[0]?.count || 0,
      averageScore: Math.round(stats?.averageScore || 0),
      studyStreak,
    };
  }

  async getSkillProgress(userId: string): Promise<{ [skill: string]: number }> {
    const skillResults = await db
      .select({
        testType: tests.testType,
        skillType: questionBanks.skillType,
        averageScore: sql<number>`avg(${results.percentage})`,
      })
      .from(results)
      .innerJoin(tests, eq(results.testId, tests.id))
      .innerJoin(questionBanks, eq(tests.questionBankId, questionBanks.id))
      .where(eq(results.userId, userId))
      .groupBy(questionBanks.skillType);

    const progress: { [skill: string]: number } = {};
    skillResults.forEach(result => {
      progress[result.skillType] = Math.round(result.averageScore || 0);
    });

    return progress;
  }
}

export const storage = new DatabaseStorage();
