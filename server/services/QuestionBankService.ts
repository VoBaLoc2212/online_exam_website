import { 
  questionBanks, questions,
  type QuestionBank, type InsertQuestionBank
} from "../../shared/schema";
import { db } from "../db";
import { eq, desc, and, sql } from "drizzle-orm";
import { IQuestionBankService } from "../implements/IQuestionBankService";

export class QuestionBankService implements IQuestionBankService {
  private async getQuestionBankQuery(whereClause?: any, pagination?: { limit: number; offset: number }) {
    const query = db
      .select({
        id: questionBanks.id,
        name: questionBanks.name,
        description: questionBanks.description,
        testType: questionBanks.testType,
        skillType: questionBanks.skillType,
        examDuration: questionBanks.examDuration,
        createdBy: questionBanks.createdBy,
        questionCount: sql<number>`COALESCE((
          SELECT COUNT(*)
          FROM questions q
          WHERE q.question_bank_id = question_banks.id
        ), 0)`.mapWith(Number).as('questionCount'),
        createdAt: questionBanks.createdAt
      })
      .from(questionBanks)
      .orderBy(desc(questionBanks.createdAt));

    if (whereClause) {
      query.where(whereClause);
    }

    if (pagination) {
      query.limit(pagination.limit).offset(pagination.offset);
    }

    const result = await query;
    return result;
  }

  async getQuestionBanksWithPagination(page: number, limit: number, filters?: {
    testType?: string;
    skillType?: string;
  }) {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    let whereClause;
    if (filters) {
      const conditions = [];
      if (filters.testType && filters.testType !== 'all') {
        conditions.push(eq(questionBanks.testType, filters.testType as any));
      }
      if (filters.skillType && filters.skillType !== 'all') {
        conditions.push(eq(questionBanks.skillType, filters.skillType as any));
      }
      if (conditions.length > 0) {
        whereClause = and(...conditions);
      }
    }

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(questionBanks)
      .where(whereClause || undefined);

    // Get paginated results
    const questionBanksList = await this.getQuestionBankQuery(whereClause, { limit, offset });

    return {
      questionBanks: questionBanksList,
      totalCount: Number(count),
      currentPage: page,
      totalPages: Math.ceil(Number(count) / limit)
    };
  }

  async getAllQuestionBanks(): Promise<QuestionBank[]> {
    return await this.getQuestionBankQuery();
  }

  async getQuestionBank(id: string): Promise<QuestionBank | undefined> {
    const [bank] = await this.getQuestionBankQuery(eq(questionBanks.id, id));
    return bank || undefined;
  }

  async getUserQuestionBanks(userId: string): Promise<QuestionBank[]> {
    return await this.getQuestionBankQuery(eq(questionBanks.createdBy, userId));
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
      .where(eq(questionBanks.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteQuestionBankWithQuestions(id: string): Promise<boolean> {
    try {
      const existingBank = await this.getQuestionBank(id);
      if (!existingBank) {
        console.error("Question bank not found before deletion:", id);
        return false;
      }

      const result = await db.transaction(async (tx) => {
        await tx
          .delete(questions)
          .where(eq(questions.questionBankId, id));

        await tx
          .delete(questionBanks)
          .where(eq(questionBanks.id, id));

        return true;
      });

      return result;
    } catch (error) {
      console.error("Delete question bank transaction error:", error);
      return false;
    }
  }
}