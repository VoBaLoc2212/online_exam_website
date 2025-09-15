import { Router } from "express";
import multer from "multer";
import XLSX from "xlsx";
import mammoth from "mammoth";
import { insertQuestionSchema } from "../../shared/schema";
import { QuestionService } from "../services/QuestionService";
import { QuestionBankService } from "../services/QuestionBankService";
import { requireAuth, AuthenticatedRequest } from "./userRoutes";

const questionRouter = Router();
const questionService = new QuestionService();
const questionBankService = new QuestionBankService();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Create single question
questionRouter.post("/questions", requireAuth, async (req, res) => {
  try {
    const questionData = insertQuestionSchema.parse(req.body);
    const question = await questionService.createQuestion(questionData);
    res.json(question);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Invalid question data", error: error.message });
  }
});

// Get specific question
questionRouter.get("/questions/:id", requireAuth, async (req, res) => {
  try {
    const question = await questionService.getQuestion(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json({ question });
  } catch (err) {
    res.status(400).json({ message: "Failed to get question", error: String(err) });
  }
});

// Update question
questionRouter.put("/questions/:id", requireAuth, async (req, res) => {
  try {
    const updates = insertQuestionSchema.partial().parse(req.body);
    const question = await questionService.updateQuestion(req.params.id, updates);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    res.json(question);
  } catch (error: any) {
    res.status(400).json({ message: "Failed to update question", error: error.message });
  }
});

// Delete question
questionRouter.delete("/questions/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await questionService.deleteQuestion(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question", error: String(error) });
  }
});

// Create multiple questions (bulk)
questionRouter.post("/questions/bulk", requireAuth, async (req, res) => {
  try {
    const questionsData = req.body.questions.map((q: any) =>
      insertQuestionSchema.parse(q)
    );
    const questions = await questionService.createQuestions(questionsData);
    res.json(questions);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Invalid questions data", error: error.message });
  }
});

// File import endpoint
questionRouter.post("/import", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { questionBankId, testType, skillType } = req.body;
    const file = req.file;

    let questions: any[] = [];

    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Handle Excel
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      questions = data.map((row: any, index) => ({
        questionBankId,
        content: row.Question || row.question || "",
        options: [row.A, row.B, row.C, row.D].filter(Boolean),
        correctAnswer: row.Answer || row.answer || "",
        explanation: row.Explanation || row.explanation || "",
        difficulty: row.Difficulty?.toLowerCase() || "medium",
        points: parseInt(row.Points) || 1,
        orderIndex: index + 1,
      }));
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Handle Word
      const { value: text } = await mammoth.extractRawText({
        path: file.path,
      });
      const lines = text.split("\n").filter((line) => line.trim());
      let currentQuestion: any = null;
      let questionIndex = 0;

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          // New question
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          questionIndex++;
          currentQuestion = {
            questionBankId,
            content: line.replace(/^\d+\./, "").trim(),
            options: [],
            correctAnswer: "",
            explanation: "",
            difficulty: "medium",
            points: 1,
            orderIndex: questionIndex,
          };
        } else if (line.match(/^[A-D]\./)) {
          // Option
          const option = line.replace(/^[A-D]\./, "").trim();
          if (currentQuestion) {
            currentQuestion.options.push(option);
          }
        } else if (line.toLowerCase().startsWith("answer:")) {
          // Answer
          if (currentQuestion) {
            currentQuestion.correctAnswer = line
              .replace(/answer:/i, "")
              .trim();
          }
        } else if (line.toLowerCase().startsWith("explanation:")) {
          // Explanation
          if (currentQuestion) {
            currentQuestion.explanation = line
              .replace(/explanation:/i, "")
              .trim();
          }
        }
      }

      if (currentQuestion) {
        questions.push(currentQuestion);
      }
    } else if (file.mimetype === "application/json") {
      // Handle JSON
      const fs = require("fs");
      const jsonData = JSON.parse(fs.readFileSync(file.path, "utf8"));

      questions = jsonData.map((q: any, index: number) => ({
        questionBankId,
        content: q.content || q.question || "",
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.answer || "",
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        points: q.points || 1,
        orderIndex: index + 1,
      }));
    }

    const validatedQuestions = questions.map((q) =>
      insertQuestionSchema.parse(q)
    );
    const createdQuestions = await questionService.createQuestions(
      validatedQuestions
    );

    res.json({
      message: `Successfully imported ${createdQuestions.length} questions`,
      questions: createdQuestions,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Import failed", error: error.message });
  }
});

export { questionRouter };