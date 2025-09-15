import { Router } from "express";
import { insertQuestionBankSchema } from "../../shared/schema";
import { QuestionBankService } from "../services/QuestionBankService";
import { QuestionService } from "../services/QuestionService";
import { requireAuth, AuthenticatedRequest } from "./userRoutes";

const questionBankRouter = Router();
const questionBankService = new QuestionBankService();
const questionService = new QuestionService();

// Public endpoint for accessing all question banks with pagination (for practice mode)
questionBankRouter.get("/practice/question-banks", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const testType = req.query.testType as string;
    const skillType = req.query.skillType as string;
    
    const result = await questionBankService.getQuestionBanksWithPagination(page, limit, {
      testType: testType !== 'all' ? testType : undefined,
      skillType: skillType !== 'all' ? skillType : undefined
    });
    
    const response = {
      questionBanks: result.questionBanks,
      totalCount: result.totalCount,
      currentPage: page,
      totalPages: Math.ceil(result.totalCount / limit)
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching question banks:", error);
    res.status(500).json({ message: "Failed to get question banks" });
  }
});

// Private endpoint for user's question banks
questionBankRouter.get("/question-banks", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const questionBanks = await questionBankService.getUserQuestionBanks(
      authReq.session.userId!
    );
    res.json(questionBanks);
  } catch (error) {
    console.error('Error in /api/question-banks:', error);
    res.status(500).json({ message: "Failed to get question banks" });
  }
});

// Create new question bank
questionBankRouter.post("/question-banks", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const questionBankData = insertQuestionBankSchema.parse({
      ...req.body,
      createdBy: authReq.session.userId,
    });
    const questionBank = await questionBankService.createQuestionBank(questionBankData);
    res.json(questionBank);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Invalid question bank data", error: error.message });
  }
});

// Get specific question bank
questionBankRouter.get("/question-banks/:id", requireAuth, async (req, res) => {
  try {
    const questionBank = await questionBankService.getQuestionBank(req.params.id);
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found" });
    }
    res.json(questionBank);
  } catch (error) {
    res.status(500).json({ message: "Failed to get question bank" });
  }
});

// Update question bank
questionBankRouter.put("/question-banks/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const questionBank = await questionBankService.getQuestionBank(req.params.id);
    
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found" });
    }
    
    // Check ownership
    if (questionBank.createdBy !== authReq.session.userId) {
      return res.status(403).json({ message: "Permission denied" });
    }
    
    const updates = insertQuestionBankSchema.partial().parse(req.body);
    const updated = await questionBankService.updateQuestionBank(req.params.id, updates);
    
    if (!updated) {
      return res.status(404).json({ message: "Question bank not found" });
    }
    
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: "Failed to update question bank", error: error.message });
  }
});

// Delete question bank and all its questions
questionBankRouter.delete("/question-banks/:id", requireAuth, async (req, res) => {
  try {
    console.log("Delete question bank ID:", req.params.id);
    const questionBank = await questionBankService.getQuestionBank(req.params.id);
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found" });
    }

    // Check ownership
    const authReq = req as AuthenticatedRequest;
    if (questionBank.createdBy !== authReq.session.userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Delete question bank and all related questions
    const deleted = await questionBankService.deleteQuestionBankWithQuestions(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Question bank not found or already deleted" });
    }

    res.json({ message: "Question bank and all related questions deleted successfully" });
  } catch (error) {
    console.error("Delete question bank error:", error);
    res.status(500).json({ 
      message: "Failed to delete question bank", 
      error: String(error)
    });
  }
});

// Get questions for a specific question bank
questionBankRouter.get("/question-banks/:id/questions", requireAuth, async (req, res) => {
  try {
    const questionBank = await questionBankService.getQuestionBank(req.params.id);
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found" });
    }

    // Get all questions for this question bank
    const questions = await questionService.getQuestions(questionBank.id);

    // Return sorted questions by orderIndex
    const sortedQuestions = questions.sort((a, b) => a.orderIndex - b.orderIndex);
    res.json(sortedQuestions);
  } catch (error) {
    res.status(500).json({ message: "Failed to get questions", error: String(error) });
  }
});

export { questionBankRouter };