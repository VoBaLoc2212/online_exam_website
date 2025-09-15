import { User, InsertUser } from "../../shared/schema";

export interface IUserService {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analytics methods
  getUserStats(userId: string): Promise<{
    totalPractice: number;
    mockTests: number;
    averageScore: number;
    studyStreak: number;
  }>;
  
  getSkillProgress(userId: string): Promise<{
    [skill: string]: number;
  }>;
}