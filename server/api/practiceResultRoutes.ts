import { Router } from "express";
import { PracticeResultService } from "../services/PracticeResultService";
import { requireAuth, AuthenticatedRequest } from "./userRoutes";

const router = Router();
const practiceResultService = new PracticeResultService();

// Create a new practice result
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { questionBankId, answers, timeSpent } = req.body;
    const userId = req.session.userId!;

    if (!questionBankId || !answers) {
      return res.status(400).json({ error: "Question bank ID and answers are required" });
    }

    const result = await practiceResultService.createPracticeResult(userId, {
      questionBankId,
      answers,
      timeSpent: timeSpent || 0,
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating practice result:", error);
    res.status(500).json({ error: "Failed to create practice result" });
  }
});

// Get practice results for a user
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.session.userId!;
    const { questionBankId, limit = 20, offset = 0 } = req.query;

    const results = await practiceResultService.getPracticeResults(userId, {
      questionBankId: questionBankId as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching practice results:", error);
    res.status(500).json({ error: "Failed to fetch practice results" });
  }
});

// Get a specific practice result
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId!;

    const result = await practiceResultService.getPracticeResultById(id, userId);

    if (!result) {
      return res.status(404).json({ error: "Practice result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching practice result:", error);
    res.status(500).json({ error: "Failed to fetch practice result" });
  }
});

// Get practice statistics for a user
router.get("/stats/summary", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.session.userId!;
    const { questionBankId } = req.query;

    const stats = await practiceResultService.getPracticeStats(userId, questionBankId as string);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching practice stats:", error);
    res.status(500).json({ error: "Failed to fetch practice stats" });
  }
});

export default router;