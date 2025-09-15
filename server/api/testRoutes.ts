import { Router } from "express";
import { insertTestSchema, insertTestSessionSchema } from "../../shared/schema";
import { TestService, TestSessionService, ResultService } from "../services/TestService";
import { QuestionService } from "../services/QuestionService";
import { requireAuth, AuthenticatedRequest } from "./userRoutes";

const testRouter = Router();
const testService = new TestService();
const testSessionService = new TestSessionService();
const resultService = new ResultService();
const questionService = new QuestionService();

// Test routes
testRouter.get("/tests", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tests = await testService.getTests(authReq.session.userId!);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Failed to get tests" });
  }
});

testRouter.post("/tests", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const testData = insertTestSchema.parse({
      ...req.body,
      createdBy: authReq.session.userId,
    });
    const test = await testService.createTest(testData);
    res.json(test);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Invalid test data", error: error.message });
  }
});

testRouter.get("/tests/:id", requireAuth, async (req, res) => {
  try {
    const test = await testService.getTest(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const questions = await questionService.getQuestions(test.questionBankId);
    res.json({ ...test, questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to get test" });
  }
});

// Test session routes
testRouter.post("/test-sessions", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const sessionData = insertTestSessionSchema.parse({
      ...req.body,
      userId: authReq.session.userId,
    });
    const session = await testSessionService.createTestSession(sessionData);
    res.json(session);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Invalid session data", error: error.message });
  }
});

testRouter.get("/test-sessions/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const session = await testSessionService.getTestSession(req.params.id);
    if (!session || session.userId !== authReq.session.userId) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to get session" });
  }
});

testRouter.patch("/test-sessions/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const updates = req.body;
    const session = await testSessionService.updateTestSession(req.params.id, updates);
    if (!session || session.userId !== authReq.session.userId) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to update session", error: error.message });
  }
});

testRouter.post("/test-sessions/:id/complete", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const session = await testSessionService.completeTestSession(req.params.id);
    if (!session || session.userId !== authReq.session.userId) {
      return res.status(404).json({ message: "Session not found" });
    }

    const test = await testService.getTest(session.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    const questions = await questionService.getQuestions(test.questionBankId);

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

    const result = await resultService.createResult({
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

// Results routes
testRouter.get("/results", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const results = await resultService.getResults(authReq.session.userId!);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to get results" });
  }
});

export { testRouter };