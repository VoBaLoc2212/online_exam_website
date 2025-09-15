import { 
  questions,
  type Question, type InsertQuestion
} from "../../shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { IQuestionService } from "../implements/IQuestionService";

export class QuestionService implements IQuestionService {
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
      .where(eq(questions.id, id))
      .returning();
    return result.length > 0;
  }
}