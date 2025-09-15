import { Test, InsertTest, TestSession, InsertTestSession, Result, InsertResult } from "../../shared/schema";

export interface ITestService {
  getTests(userId: string): Promise<Test[]>;
  getTest(id: string): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, updates: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;
}

export interface ITestSessionService {
  getTestSession(id: string): Promise<TestSession | undefined>;
  getUserTestSessions(userId: string): Promise<TestSession[]>;
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  updateTestSession(id: string, updates: Partial<InsertTestSession>): Promise<TestSession | undefined>;
  completeTestSession(id: string): Promise<TestSession | undefined>;
}

export interface IResultService {
  getResults(userId: string): Promise<Result[]>;
  getResult(id: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
}