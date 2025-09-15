import { 
  users, tests, testSessions, results, questionBanks,
  type User, type InsertUser
} from "../../shared/schema";
import { db } from "../db";
import { eq, desc, and, sql } from "drizzle-orm";
import { IUserService } from "../implements/IUserService";

export class UserService implements IUserService {
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