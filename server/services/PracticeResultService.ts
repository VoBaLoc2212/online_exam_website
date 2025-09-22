import { db } from "../db.js";
import { practiceResults, questionBanks, questions } from "../../shared/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

export interface CreatePracticeResultData {
  questionBankId: string;
  answers: Record<string, string>;
  timeSpent: number;
}

export interface PracticeResultFilters {
  questionBankId?: string;
  limit: number;
  offset: number;
}

export class PracticeResultService {
  async createPracticeResult(userId: string, data: CreatePracticeResultData) {
    const { questionBankId, answers, timeSpent } = data;

    // Get all questions for this question bank
    const bankQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.questionBankId, questionBankId))
      .orderBy(questions.orderIndex);

    if (bankQuestions.length === 0) {
      throw new Error("No questions found for this question bank");
    }

    // Calculate score based on correct answers
    let correctAnswers = 0;
    const totalQuestions = bankQuestions.length;

    bankQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    // Score is out of 10 points
    const score = Math.round((correctAnswers / totalQuestions) * 10);

    // Create practice result
    const [result] = await db
      .insert(practiceResults)
      .values({
        userId,
        questionBankId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers: answers, // No need to stringify for jsonb
        completedAt: new Date(),
      })
      .returning();

    return {
      ...result,
      answers: result.answers, // No need to parse for jsonb
    };
  }

  async getPracticeResults(userId: string, filters: PracticeResultFilters) {
    const { questionBankId, limit, offset } = filters;

    let baseCondition = eq(practiceResults.userId, userId);
    
    if (questionBankId) {
      baseCondition = and(
        eq(practiceResults.userId, userId),
        eq(practiceResults.questionBankId, questionBankId)
      ) as any;
    }

    const results = await db
      .select({
        id: practiceResults.id,
        score: practiceResults.score,
        totalQuestions: practiceResults.totalQuestions,
        correctAnswers: practiceResults.correctAnswers,
        timeSpent: practiceResults.timeSpent,
        completedAt: practiceResults.completedAt,
        questionBank: {
          id: questionBanks.id,
          name: questionBanks.name,
          testType: questionBanks.testType,
          skillType: questionBanks.skillType,
        },
      })
      .from(practiceResults)
      .leftJoin(questionBanks, eq(practiceResults.questionBankId, questionBanks.id))
      .where(baseCondition)
      .orderBy(desc(practiceResults.completedAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  async getPracticeResultById(id: string, userId: string) {
    const [result] = await db
      .select({
        id: practiceResults.id,
        score: practiceResults.score,
        totalQuestions: practiceResults.totalQuestions,
        correctAnswers: practiceResults.correctAnswers,
        timeSpent: practiceResults.timeSpent,
        answers: practiceResults.answers,
        completedAt: practiceResults.completedAt,
        questionBank: {
          id: questionBanks.id,
          name: questionBanks.name,
          testType: questionBanks.testType,
          skillType: questionBanks.skillType,
        },
      })
      .from(practiceResults)
      .leftJoin(questionBanks, eq(practiceResults.questionBankId, questionBanks.id))
      .where(
        and(
          eq(practiceResults.id, id),
          eq(practiceResults.userId, userId)
        )
      );

    if (!result) {
      return null;
    }

    return {
      ...result,
      answers: result.answers, // No need to parse for jsonb
    };
  }

  async getPracticeStats(userId: string, questionBankId?: string) {
    let baseCondition = eq(practiceResults.userId, userId);
    
    if (questionBankId) {
      baseCondition = and(
        eq(practiceResults.userId, userId),
        eq(practiceResults.questionBankId, questionBankId)
      ) as any;
    }

    const [stats] = await db
      .select({
        totalAttempts: sql<number>`count(*)`,
        averageScore: sql<number>`avg(${practiceResults.score})`,
        bestScore: sql<number>`max(${practiceResults.score})`,
        totalTimeSpent: sql<number>`sum(${practiceResults.timeSpent})`,
        averageCorrectAnswers: sql<number>`avg(${practiceResults.correctAnswers})`,
      })
      .from(practiceResults)
      .where(baseCondition);

    return {
      totalAttempts: Number(stats.totalAttempts),
      averageScore: Number(stats.averageScore) || 0,
      bestScore: Number(stats.bestScore) || 0,
      totalTimeSpent: Number(stats.totalTimeSpent) || 0,
      averageCorrectAnswers: Number(stats.averageCorrectAnswers) || 0,
    };
  }
}