import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertQuestionBankSchema,
  insertQuestionSchema,
  insertTestSchema,
  insertTestSessionSchema,
} from "@shared/schema";
import multer from "multer";
import XLSX from "xlsx";
import mammoth from "mammoth";
import type { Session } from "express-session";

// Extend Request interface to include session
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: Session & { userId?: string };
}

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export async function registerRoutes(app: Express): Promise<void> {
  // ---------------- Auth middleware ----------------
  const requireAuth = (req: Request, res: Response, next: any) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // ---------------- Auth routes ----------------
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(userData.username);
      const existingEmail = await storage.getUserByEmail(userData.email);

      if (existingUser || existingEmail) {
        return res
          .status(400)
          .json({ message: "Username/Email already exists" });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userToSave = { ...userData, password: hashedPassword };
      const user = await storage.createUser(userToSave);
      req.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (err: any) {
      console.error("REGISTER ERROR:", err, err?.stack);
      res
        .status(400)
        .json({ message: "Invalid user data", error: String(err) });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const authReq = req as AuthenticatedRequest;
      authReq.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const authReq = req as AuthenticatedRequest;
    authReq.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // ---------------- Question Bank routes ----------------
  // Public endpoint for accessing all question banks with pagination
  app.get("/api/practice/question-banks", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const testType = req.query.testType as string;
      const skillType = req.query.skillType as string;
      
      const result = await storage.getQuestionBanksWithPagination(page, limit, {
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
  app.get("/api/question-banks", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const questionBanks = await storage.getUserQuestionBanks(
        authReq.session.userId!
      );
      res.json(questionBanks);
    } catch (error) {
      console.error('Error in /api/question-banks:', error);
      res.status(500).json({ message: "Failed to get question banks" });
    }
  });

  app.post("/api/question-banks", requireAuth, async (req, res) => {
    try {
      const questionBankData = insertQuestionBankSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const questionBank = await storage.createQuestionBank(questionBankData);
      res.json(questionBank);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Invalid question bank data", error: error.message });
    }
  });

  app.get("/api/question-banks/:id", requireAuth, async (req, res) => {
    try {
      const questionBank = await storage.getQuestionBank(req.params.id);
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      res.json(questionBank);
    } catch (error) {
      res.status(500).json({ message: "Failed to get question bank" });
    }
  });

  // Delete a question bank and all its questions
  app.delete("/api/question-banks/:id", requireAuth, async (req, res) => {
    try {
      console.log("Delete question bank ID:", req.params.id);
      const questionBank = await storage.getQuestionBank(req.params.id);
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }

      // Kiểm tra quyền xóa (chỉ người tạo mới được xóa)
      const authReq = req as AuthenticatedRequest;
      if (questionBank.createdBy !== authReq.session.userId) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Xóa question bank và tất cả câu hỏi liên quan
      const deleted = await storage.deleteQuestionBankWithQuestions(req.params.id);
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
  app.get("/api/question-banks/:id/questions", requireAuth, async (req, res) => {
    try {
      const questionBank = await storage.getQuestionBank(req.params.id);
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }

      // Lấy tất cả câu hỏi thuộc question bank này
      const questions = await storage.getQuestions(questionBank.id);

      // Trả về mảng câu hỏi đã sắp xếp theo orderIndex
      const sortedQuestions = questions.sort((a, b) => a.orderIndex - b.orderIndex);
      res.json(sortedQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions", error: String(error) });
    }
  });

  // ---------------- Question routes ----------------
  app.post("/api/questions", requireAuth, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Invalid question data", error: error.message });
    }
  });

  // GET /api/questions/:id
  app.get("/api/questions/:id", requireAuth, async (req, res) => {
    try {
  const question = await storage.getQuestion(req.params.id);
  if (!question) return res.status(404).json({ message: "Not found" });
  res.json({ question });
    } catch (err) {
      res.status(400).json({ message: "Failed to get question", error: String(err) });
    }
  });

  app.post("/api/questions/bulk", requireAuth, async (req, res) => {
    try {
      const questionsData = req.body.questions.map((q: any) =>
        insertQuestionSchema.parse(q)
      );
      const questions = await storage.createQuestions(questionsData);
      res.json(questions);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Invalid questions data", error: error.message });
    }
  });

  // ---------------- File import route ----------------
  app.post(
    "/api/import",
    requireAuth,
    upload.single("file"),
    async (req, res) => {
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
              if (currentQuestion) {
                questions.push({
                  ...currentQuestion,
                  questionBankId,
                  orderIndex: questionIndex++,
                });
              }
              currentQuestion = {
                content: line.replace(/^\d+\./, "").trim(),
                options: [],
                difficulty: "medium",
                points: 1,
              };
            } else if (line.match(/^[A-D]\)/)) {
              currentQuestion?.options.push(line.substring(2).trim());
            } else if (line.toLowerCase().includes("answer:")) {
              if (currentQuestion) {
                currentQuestion.correctAnswer = line
                  .replace(/answer:/i, "")
                  .trim();
              }
            } else if (line.toLowerCase().includes("explanation:")) {
              if (currentQuestion) {
                currentQuestion.explanation = line
                  .replace(/explanation:/i, "")
                  .trim();
              }
            }
          }

          if (currentQuestion) {
            questions.push({
              ...currentQuestion,
              questionBankId,
              orderIndex: questionIndex,
            });
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
        const createdQuestions = await storage.createQuestions(
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
    }
  );

  // ---------------- Test routes ----------------
  app.get("/api/tests", requireAuth, async (req, res) => {
    try {
      const tests = await storage.getTests(req.session.userId!);
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tests" });
    }
  });

  app.post("/api/tests", requireAuth, async (req, res) => {
    try {
      const testData = insertTestSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const test = await storage.createTest(testData);
      res.json(test);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Invalid test data", error: error.message });
    }
  });

  app.get("/api/tests/:id", requireAuth, async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      const questions = await storage.getQuestions(test.questionBankId);
      res.json({ ...test, questions });
    } catch (error) {
      res.status(500).json({ message: "Failed to get test" });
    }
  });

  // ---------------- Test session routes ----------------
  app.post("/api/test-sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertTestSessionSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      const session = await storage.createTestSession(sessionData);
      res.json(session);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Invalid session data", error: error.message });
    }
  });

  app.get("/api/test-sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getTestSession(req.params.id);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  app.patch("/api/test-sessions/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateTestSession(req.params.id, updates);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Failed to update session", error: error.message });
    }
  });

  app.post("/api/test-sessions/:id/complete", requireAuth, async (req, res) => {
    try {
      const session = await storage.completeTestSession(req.params.id);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      const test = await storage.getTest(session.testId);
      if (!test) return res.status(404).json({ message: "Test not found" });
      const questions = await storage.getQuestions(test.questionBankId);

      let score = 0;
      let totalScore = 0;
      const skillBreakdown: {
        [key: string]: { correct: number; total: number };
      } = {};

      questions.forEach((question) => {
        totalScore += question.points;
        const answers = session.answers as Record<string, any>;
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) score += question.points;

        const skill = test.testType;
        if (!skillBreakdown[skill]) {
          skillBreakdown[skill] = { correct: 0, total: 0 };
        }
        skillBreakdown[skill].total++;
        if (isCorrect) skillBreakdown[skill].correct++;
      });

      const percentage = Math.round((score / totalScore) * 100);
      if (!session.endTime)
        return res.status(400).json({ message: "Session not ended" });
      const timeSpent = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );

      const result = await storage.createResult({
        sessionId: session.id,
        userId: session.userId,
        testId: session.testId,
        score,
        totalScore,
        percentage,
        skillBreakdown,
        timeSpent,
      });

      res.json({ session, result });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Failed to complete session", error: error.message });
    }
  });

  // ---------------- Results routes ----------------
  app.get("/api/results", requireAuth, async (req, res) => {
    try {
      const results = await storage.getResults(req.session.userId!);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  // ---------------- Analytics routes ----------------
  app.get("/api/analytics/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/analytics/skills", requireAuth, async (req, res) => {
    try {
      const skillProgress = await storage.getSkillProgress(req.session.userId!);
      res.json(skillProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skill progress" });
    }
  });
}
