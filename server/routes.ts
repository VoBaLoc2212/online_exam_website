import type { Express } from "express";
import { userRouter } from "./api/userRoutes";
import { questionBankRouter } from "./api/questionBankRoutes";
import { questionRouter } from "./api/questionRoutes";
import { testRouter } from "./api/testRoutes";

export async function registerRoutes(app: Express): Promise<void> {
  // Register modular routes
  app.use("/api", userRouter);
  app.use("/api", questionBankRouter);
  app.use("/api", questionRouter);
  app.use("/api", testRouter);
}