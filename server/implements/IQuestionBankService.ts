import { QuestionBank, InsertQuestionBank } from "../../shared/schema";

export interface IQuestionBankService {
  getAllQuestionBanks(): Promise<QuestionBank[]>;
  getUserQuestionBanks(userId: string): Promise<QuestionBank[]>;
  getQuestionBank(id: string): Promise<QuestionBank | undefined>;
  
  getQuestionBanksWithPagination(page: number, limit: number, filters?: {
    testType?: string;
    skillType?: string;
  }): Promise<{
    questionBanks: QuestionBank[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>;
  
  createQuestionBank(questionBank: InsertQuestionBank): Promise<QuestionBank>;
  updateQuestionBank(id: string, updates: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined>;
  deleteQuestionBank(id: string): Promise<boolean>;
  deleteQuestionBankWithQuestions(id: string): Promise<boolean>;
}