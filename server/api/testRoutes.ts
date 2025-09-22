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

// Get all active tests for mock test page (not filtered by user)
testRouter.get("/tests/all", requireAuth, async (req, res) => {
  try {
    const tests = await testService.getAllTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Failed to get all tests" });
  }
});

// Get completion status for all tests
testRouter.get("/tests/completion-status", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tests = await testService.getTests(authReq.session.userId!);
    const completionStatus: Record<string, boolean> = {};
    
    for (const test of tests) {
      const hasCompleted = await testService.hasUserCompletedTest(authReq.session.userId!, test.id);
      completionStatus[test.id] = hasCompleted;
    }
    
    res.json(completionStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to get completion status" });
  }
});

testRouter.post("/tests", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    console.log("Test creation request body:", JSON.stringify(req.body, null, 2));
    const testData = insertTestSchema.parse({
      ...req.body,
      createdBy: authReq.session.userId,
    });
    console.log("Parsed test data:", JSON.stringify(testData, null, 2));
    const test = await testService.createTest(testData);
    res.json(test);
  } catch (error: any) {
    console.error("Test creation error:", error);
    if (error.errors) {
      console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
    }
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

// Check if user has completed a test
testRouter.get("/tests/:id/completed", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const hasCompleted = await testService.hasUserCompletedTest(authReq.session.userId!, id);
    res.json({ hasCompleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to check test completion status" });
  }
});

testRouter.patch("/tests/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const updates = req.body;
    
    // Get current test to verify ownership
    const currentTest = await testService.getTest(id);
    if (!currentTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    // Check if user owns this test
    if (currentTest.createdBy !== authReq.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const test = await testService.updateTest(id, updates);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.json(test);
  } catch (error: any) {
    console.error("Test update error:", error);
    res.status(400).json({ message: "Failed to update test", error: error.message });
  }
});

testRouter.delete("/tests/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    
    // Get current test to verify ownership
    const currentTest = await testService.getTest(id);
    if (!currentTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    // Check if user owns this test
    if (currentTest.createdBy !== authReq.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const deleted = await testService.deleteTest(id);
    if (!deleted) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.json({ message: "Test deleted successfully" });
  } catch (error: any) {
    console.error("Test deletion error:", error);
    res.status(500).json({ message: "Failed to delete test", error: error.message });
  }
});

// Check if user has completed a test
testRouter.get("/tests/:id/completed", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const hasCompleted = await testService.hasUserCompletedTest(authReq.session.userId!, id);
    res.json({ hasCompleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to check test completion status" });
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
      const points = question.difficulty === 'easy' ? 1 : question.difficulty === 'medium' ? 2 : 3;
      totalScore += points;
      const answers = session.answers as Record<string, any>;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score += points;

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

// Terminate test session due to anti-cheat violation
testRouter.post("/test-sessions/terminate", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { sessionId, reason } = req.body;
    
    if (!sessionId || !reason) {
      return res.status(400).json({ message: "Session ID and reason are required" });
    }
    
    // Get the session and verify ownership
    const session = await testSessionService.getTestSession(sessionId);
    if (!session || session.userId !== authReq.session.userId) {
      return res.status(404).json({ message: "Session not found or unauthorized" });
    }
    
    // Update session to completed with violation
    const terminatedSession = await testSessionService.terminateTestSession(sessionId, reason);
    
    // Get test and questions for result calculation
    const test = await testService.getTest(session.testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    const questions = await questionService.getQuestions(test.questionBankId);
    
    // Calculate total possible score
    let totalScore = 0;
    questions.forEach((question) => {
      const points = question.difficulty === 'easy' ? 1 : question.difficulty === 'medium' ? 2 : 3;
      totalScore += points;
    });
    
    // Create result with 0 score due to violation
    const skillBreakdown: { [key: string]: { correct: number; total: number } } = {};
    const skill = test.testType;
    skillBreakdown[skill] = { correct: 0, total: questions.length };
    
    const timeSpent = Math.floor(
      (new Date().getTime() - session.startTime.getTime()) / 1000
    );
    
    const result = await resultService.createResult({
      sessionId: session.id,
      userId: session.userId,
      testId: session.testId,
      score: 0, // Always 0 for violations
      totalScore,
      percentage: 0, // Always 0% for violations
      skillBreakdown,
      timeSpent,
    });
    
    res.json({ 
      message: "Test terminated due to violation", 
      session: terminatedSession, 
      result,
      violationReason: reason
    });
  } catch (error: any) {
    console.error("Error terminating test session:", error);
    res.status(500).json({ 
      message: "Failed to terminate session", 
      error: error.message 
    });
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

testRouter.get("/results/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const result = await resultService.getResult(id);
    
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    
    // Verify the result belongs to the authenticated user
    if (result.userId !== authReq.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to get result" });
  }
});

// Get test history (combined practice and mock test results)
testRouter.get("/test-history", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const testHistory = await testService.getTestHistory(authReq.session.userId!);
    res.json(testHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to get test history" });
  }
});

export { testRouter };