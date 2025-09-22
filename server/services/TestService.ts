import { 
  tests, testSessions, results, questionBanks,
  type Test, type InsertTest, type TestSession, type InsertTestSession, 
  type Result, type InsertResult
} from "../../shared/schema";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { ITestService, ITestSessionService, IResultService } from "../implements/ITestService";

export class TestService implements ITestService {
  async getTests(userId: string): Promise<Test[]> {
    return await db.query.tests.findMany({
      where: eq(tests.createdBy, userId),
      orderBy: desc(tests.createdAt),
      with: {
        questionBank: {
          columns: {
            id: true,
            name: true,
            skillType: true,
          }
        }
      }
    });
  }

  async getAllTests(): Promise<Test[]> {
    return await db.query.tests.findMany({
      where: eq(tests.isActive, true), // Chỉ lấy tests đang active
      orderBy: desc(tests.createdAt),
      with: {
        questionBank: {
          columns: {
            id: true,
            name: true,
            skillType: true,
          }
        }
      }
    });
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
      .where(eq(tests.id, id))
      .returning();
    return result.length > 0;
  }

  async hasUserCompletedTest(userId: string, testId: string): Promise<boolean> {
    const existingResults = await db
      .select()
      .from(results)
      .where(and(
        eq(results.userId, userId),
        eq(results.testId, testId)
      ));
    return existingResults.length > 0;
  }

  async getTestHistory(userId: string) {
    // Get mock test results
    const mockTestResults = await db.query.results.findMany({
      where: eq(results.userId, userId),
      orderBy: desc(results.completedAt),
      with: {
        test: {
          columns: {
            id: true,
            name: true,
            testType: true,
          }
        }
      }
    });

    // Transform mock test results
    const formattedMockTests = mockTestResults.map(result => ({
      id: result.id,
      type: 'mock-test' as const,
      name: result.test.name,
      score: result.score,
      totalScore: result.totalScore,
      percentage: result.percentage,
      timeSpent: result.timeSpent,
      completedAt: result.completedAt.toISOString(),
      testType: result.test.testType,
    }));

    return {
      practiceResults: [], // Will be populated later when we integrate with practice results
      mockTestResults: formattedMockTests,
      totalCount: formattedMockTests.length,
      averageScore: formattedMockTests.length > 0 
        ? formattedMockTests.reduce((sum, result) => sum + result.percentage, 0) / formattedMockTests.length 
        : 0
    };
  }
}

export class TestSessionService implements ITestSessionService {
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

  async terminateTestSession(id: string, reason: string): Promise<TestSession | undefined> {
    const [updated] = await db
      .update(testSessions)
      .set({
        isCompleted: true,
        endTime: new Date(),
        suspiciousActivity: [{ type: 'termination', reason, timestamp: new Date() }]
      })
      .where(eq(testSessions.id, id))
      .returning();
    return updated || undefined;
  }
}

export class ResultService implements IResultService {
  async getResults(userId: string): Promise<Result[]> {
    return await db.query.results.findMany({
      where: eq(results.userId, userId),
      orderBy: desc(results.completedAt),
      with: {
        test: {
          columns: {
            id: true,
            name: true,
            testType: true,
          }
        }
      }
    });
  }

  async getResult(id: string): Promise<Result | undefined> {
    const result = await db.query.results.findFirst({
      where: eq(results.id, id),
      with: {
        test: {
          columns: {
            id: true,
            name: true,
            testType: true,
            timeLimit: true,
            totalQuestions: true,
          }
        },
        session: {
          columns: {
            id: true,
            startTime: true,
            endTime: true,
            isCompleted: true,
          }
        }
      }
    });
    return result || undefined;
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [created] = await db
      .insert(results)
      .values(result)
      .returning();
    return created;
  }
}