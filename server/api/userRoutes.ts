import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Session } from "express-session";
import { insertUserSchema } from "../../shared/schema";
import { UserService } from "../services/UserService";

// Extend Request interface to include session
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: Session & { userId?: string };
}

const userRouter = Router();
const userService = new UserService();

// Auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Register endpoint
userRouter.post("/register", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    const existingUser = await userService.getUserByUsername(userData.username);
    const existingEmail = await userService.getUserByEmail(userData.email);

    if (existingUser || existingEmail) {
      return res
        .status(400)
        .json({ message: "Username/Email already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToSave = { ...userData, password: hashedPassword };
    const user = await userService.createUser(userToSave);
    
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
  } catch (err: any) {
    console.error("REGISTER ERROR:", err, err?.stack);
    res
      .status(400)
      .json({ message: "Invalid user data", error: String(err) });
  }
});

// Login endpoint
userRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.getUserByUsername(username);

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

// Logout endpoint
userRouter.post("/logout", (req, res) => {
  const authReq = req as AuthenticatedRequest;
  authReq.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user endpoint
userRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await userService.getUser(authReq.session.userId!);
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

// Analytics endpoints
userRouter.get("/analytics/stats", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const stats = await userService.getUserStats(authReq.session.userId!);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to get stats" });
  }
});

userRouter.get("/analytics/skills", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const skillProgress = await userService.getSkillProgress(authReq.session.userId!);
    res.json(skillProgress);
  } catch (error) {
    res.status(500).json({ message: "Failed to get skill progress" });
  }
});

export { userRouter, requireAuth };
export type { AuthenticatedRequest };