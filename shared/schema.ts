import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const testTypeEnum = pgEnum('test_type', ['aptis', 'vstep', 'custom']);
export const skillTypeEnum = pgEnum('skill_type', ['reading', 'listening', 'grammar', 'vocabulary', 'writing', 'speaking']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionBanks = pgTable("question_banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  testType: testTypeEnum("test_type").notNull(),
  skillType: skillTypeEnum("skill_type").notNull(),
  examDuration: integer("exam_duration").notNull(), // in minutes
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionBankId: varchar("question_bank_id").notNull().references(() => questionBanks.id),
  content: text("content").notNull(),
  options: jsonb("options").notNull(), // Array of answer options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: difficultyEnum("difficulty").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  testType: testTypeEnum("test_type").notNull(),
  questionBankId: varchar("question_bank_id").notNull().references(() => questionBanks.id),
  timeLimit: integer("time_limit").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testSessions = pgTable("test_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => tests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  timeRemaining: integer("time_remaining"), // in seconds
  currentQuestionIndex: integer("current_question_index").default(0).notNull(),
  answers: jsonb("answers").default('{}').notNull(), // Question ID to answer mapping
  markedQuestions: jsonb("marked_questions").default('[]').notNull(), // Array of question IDs
  isCompleted: boolean("is_completed").default(false).notNull(),
  score: integer("score"),
  totalScore: integer("total_score"),
  tabSwitchCount: integer("tab_switch_count").default(0).notNull(),
  warningCount: integer("warning_count").default(0).notNull(),
  suspiciousActivity: jsonb("suspicious_activity").default('[]').notNull(),
});

export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => testSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  testId: varchar("test_id").notNull().references(() => tests.id),
  score: integer("score").notNull(),
  totalScore: integer("total_score").notNull(),
  percentage: integer("percentage").notNull(),
  skillBreakdown: jsonb("skill_breakdown").notNull(), // Skill-wise performance
  timeSpent: integer("time_spent").notNull(), // in seconds
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const practiceResults = pgTable("practice_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionBankId: varchar("question_bank_id").notNull().references(() => questionBanks.id),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  score: integer("score").notNull(), // Score out of 10
  timeSpent: integer("time_spent").notNull(), // in seconds
  answers: jsonb("answers").notNull(), // Question ID to answer mapping
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Session store table for connect-pg-simple
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questionBanks: many(questionBanks),
  tests: many(tests),
  testSessions: many(testSessions),
  results: many(results),
  practiceResults: many(practiceResults),
}));

export const questionBanksRelations = relations(questionBanks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [questionBanks.createdBy],
    references: [users.id],
  }),
  questions: many(questions),
  tests: many(tests),
  practiceResults: many(practiceResults),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  questionBank: one(questionBanks, {
    fields: [questions.questionBankId],
    references: [questionBanks.id],
  }),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
  questionBank: one(questionBanks, {
    fields: [tests.questionBankId],
    references: [questionBanks.id],
  }),
  createdBy: one(users, {
    fields: [tests.createdBy],
    references: [users.id],
  }),
  sessions: many(testSessions),
  results: many(results),
}));

export const testSessionsRelations = relations(testSessions, ({ one, many }) => ({
  test: one(tests, {
    fields: [testSessions.testId],
    references: [tests.id],
  }),
  user: one(users, {
    fields: [testSessions.userId],
    references: [users.id],
  }),
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  session: one(testSessions, {
    fields: [results.sessionId],
    references: [testSessions.id],
  }),
  user: one(users, {
    fields: [results.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [results.testId],
    references: [tests.id],
  }),
}));

export const practiceResultsRelations = relations(practiceResults, ({ one }) => ({
  user: one(users, {
    fields: [practiceResults.userId],
    references: [users.id],
  }),
  questionBank: one(questionBanks, {
    fields: [practiceResults.questionBankId],
    references: [questionBanks.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionBankSchema = createInsertSchema(questionBanks).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  startTime: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  completedAt: true,
});

export const insertPracticeResultSchema = createInsertSchema(practiceResults).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type QuestionBank = typeof questionBanks.$inferSelect;
export type InsertQuestionBank = z.infer<typeof insertQuestionBankSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type PracticeResult = typeof practiceResults.$inferSelect;
export type InsertPracticeResult = z.infer<typeof insertPracticeResultSchema>;
