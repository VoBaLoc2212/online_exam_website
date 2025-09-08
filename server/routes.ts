import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertQuestionBankSchema, insertQuestionSchema, insertTestSchema, insertTestSessionSchema } from "@shared/schema";
import multer from "multer";
import XLSX from "xlsx";
import mammoth from "mammoth";

// Extend Request interface to include session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: {
    userId: string;
    save: (callback?: (err: any) => void) => void;
    destroy: (callback?: (err: any) => void) => void;
  }
}

// Extend WebSocket interface for session tracking
interface ExtendedWebSocket extends WebSocket {
  sessionId?: string;
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      const authReq = req as AuthenticatedRequest;
      authReq.session.userId = user.id;
      
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const authReq = req as AuthenticatedRequest;
      authReq.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
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
      const user = await storage.getUser(authReq.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Question Bank routes
  app.get("/api/question-banks", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const questionBanks = await storage.getQuestionBanks(authReq.session.userId);
      res.json(questionBanks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get question banks" });
    }
  });

  app.post("/api/question-banks", requireAuth, async (req, res) => {
    try {
      const questionBankData = insertQuestionBankSchema.parse({
        ...req.body,
        createdBy: req.session.userId
      });
      
      const questionBank = await storage.createQuestionBank(questionBankData);
      res.json(questionBank);
    } catch (error) {
      res.status(400).json({ message: "Invalid question bank data", error: error.message });
    }
  });

  app.get("/api/question-banks/:id", requireAuth, async (req, res) => {
    try {
      const questionBank = await storage.getQuestionBank(req.params.id);
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      const questions = await storage.getQuestions(questionBank.id);
      res.json({ ...questionBank, questions });
    } catch (error) {
      res.status(500).json({ message: "Failed to get question bank" });
    }
  });

  // Question routes
  app.post("/api/questions", requireAuth, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Invalid question data", error: error.message });
    }
  });

  app.post("/api/questions/bulk", requireAuth, async (req, res) => {
    try {
      const questionsData = req.body.questions.map((q: any) => insertQuestionSchema.parse(q));
      const questions = await storage.createQuestions(questionsData);
      res.json(questions);
    } catch (error) {
      res.status(400).json({ message: "Invalid questions data", error: error.message });
    }
  });

  // File import route
  app.post("/api/import", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { questionBankId, testType, skillType } = req.body;
      const file = req.file;
      
      let questions: any[] = [];

      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Handle Excel file
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        questions = data.map((row: any, index) => ({
          questionBankId,
          content: row.Question || row.question || '',
          options: [row.A || '', row.B || '', row.C || '', row.D || ''].filter(Boolean),
          correctAnswer: row.Answer || row.answer || '',
          explanation: row.Explanation || row.explanation || '',
          difficulty: row.Difficulty?.toLowerCase() || 'medium',
          points: parseInt(row.Points) || 1,
          orderIndex: index + 1,
        }));
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle Word file
        const { value: text } = await mammoth.extractRawText({ path: file.path });
        
        // Simple parsing logic for Word documents (can be enhanced)
        const lines = text.split('\n').filter(line => line.trim());
        let currentQuestion: any = null;
        let questionIndex = 0;

        for (const line of lines) {
          if (line.match(/^\d+\./)) {
            // New question
            if (currentQuestion) {
              questions.push({
                ...currentQuestion,
                questionBankId,
                orderIndex: questionIndex++,
              });
            }
            currentQuestion = {
              content: line.replace(/^\d+\./, '').trim(),
              options: [],
              difficulty: 'medium',
              points: 1,
            };
          } else if (line.match(/^[A-D]\)/)) {
            // Answer option
            if (currentQuestion) {
              currentQuestion.options.push(line.substring(2).trim());
            }
          } else if (line.toLowerCase().includes('answer:')) {
            // Correct answer
            if (currentQuestion) {
              currentQuestion.correctAnswer = line.replace(/answer:/i, '').trim();
            }
          } else if (line.toLowerCase().includes('explanation:')) {
            // Explanation
            if (currentQuestion) {
              currentQuestion.explanation = line.replace(/explanation:/i, '').trim();
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
      } else if (file.mimetype === 'application/json') {
        // Handle JSON file
        const fs = require('fs');
        const jsonData = JSON.parse(fs.readFileSync(file.path, 'utf8'));
        
        questions = jsonData.map((q: any, index: number) => ({
          questionBankId,
          content: q.content || q.question || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || q.answer || '',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          points: q.points || 1,
          orderIndex: index + 1,
        }));
      }

      // Validate and create questions
      const validatedQuestions = questions.map(q => insertQuestionSchema.parse(q));
      const createdQuestions = await storage.createQuestions(validatedQuestions);

      res.json({ 
        message: `Successfully imported ${createdQuestions.length} questions`,
        questions: createdQuestions
      });
    } catch (error) {
      res.status(400).json({ message: "Import failed", error: error.message });
    }
  });

  // Test routes
  app.get("/api/tests", requireAuth, async (req, res) => {
    try {
      const tests = await storage.getTests(req.session.userId);
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tests" });
    }
  });

  app.post("/api/tests", requireAuth, async (req, res) => {
    try {
      const testData = insertTestSchema.parse({
        ...req.body,
        createdBy: req.session.userId
      });
      
      const test = await storage.createTest(testData);
      res.json(test);
    } catch (error) {
      res.status(400).json({ message: "Invalid test data", error: error.message });
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

  // Test session routes
  app.post("/api/test-sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertTestSessionSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const session = await storage.createTestSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error: error.message });
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
    } catch (error) {
      res.status(400).json({ message: "Failed to update session", error: error.message });
    }
  });

  app.post("/api/test-sessions/:id/complete", requireAuth, async (req, res) => {
    try {
      const session = await storage.completeTestSession(req.params.id);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Calculate and create result
      const test = await storage.getTest(session.testId);
      const questions = await storage.getQuestions(test.questionBankId);
      
      let score = 0;
      let totalScore = 0;
      const skillBreakdown: { [key: string]: { correct: number, total: number } } = {};

      questions.forEach(question => {
        totalScore += question.points;
        const userAnswer = session.answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          score += question.points;
        }

        // Track skill performance
        const skill = test.testType; // Simplified - could be more granular
        if (!skillBreakdown[skill]) {
          skillBreakdown[skill] = { correct: 0, total: 0 };
        }
        skillBreakdown[skill].total++;
        if (isCorrect) {
          skillBreakdown[skill].correct++;
        }
      });

      const percentage = Math.round((score / totalScore) * 100);
      const timeSpent = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

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
    } catch (error) {
      res.status(400).json({ message: "Failed to complete session", error: error.message });
    }
  });

  // Results routes
  app.get("/api/results", requireAuth, async (req, res) => {
    try {
      const results = await storage.getResults(req.session.userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/analytics/skills", requireAuth, async (req, res) => {
    try {
      const skillProgress = await storage.getSkillProgress(req.session.userId);
      res.json(skillProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skill progress" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time monitoring
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_session') {
          ws.sessionId = data.sessionId;
        } else if (data.type === 'anti_cheat_event') {
          // Handle anti-cheat events
          if (ws.sessionId) {
            const session = await storage.getTestSession(ws.sessionId);
            if (session) {
              const updates: any = {};
              
              if (data.event === 'tab_switch') {
                updates.tabSwitchCount = (session.tabSwitchCount || 0) + 1;
                updates.suspiciousActivity = [
                  ...(session.suspiciousActivity as any[]),
                  {
                    type: 'tab_switch',
                    timestamp: new Date(),
                    data: data.data
                  }
                ];
                
                if (updates.tabSwitchCount > 3) {
                  updates.warningCount = (session.warningCount || 0) + 1;
                }
              } else if (data.event === 'window_blur') {
                updates.suspiciousActivity = [
                  ...(session.suspiciousActivity as any[]),
                  {
                    type: 'window_blur',
                    timestamp: new Date(),
                    duration: data.data?.duration
                  }
                ];
              }
              
              await storage.updateTestSession(ws.sessionId, updates);
              
              // Send warning back to client if needed
              if (updates.warningCount > session.warningCount) {
                ws.send(JSON.stringify({
                  type: 'warning',
                  message: 'Suspicious activity detected. Your session is being monitored.'
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
