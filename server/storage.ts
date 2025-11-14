import { type User, type InsertUser, type TimeSeriesDataPoint, type ProcessedDataPoint, type ModelResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  storeTimeSeriesData(data: TimeSeriesDataPoint[]): Promise<void>;
  getTimeSeriesData(): Promise<TimeSeriesDataPoint[]>;
  storeProcessedData(data: ProcessedDataPoint[]): Promise<void>;
  getProcessedData(): Promise<ProcessedDataPoint[]>;
  storeModelResult(result: ModelResult): Promise<void>;
  getLatestModelResult(): Promise<ModelResult | undefined>;
  clearData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private timeSeriesData: TimeSeriesDataPoint[] = [];
  private processedData: ProcessedDataPoint[] = [];
  private latestModel: ModelResult | undefined;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async storeTimeSeriesData(data: TimeSeriesDataPoint[]): Promise<void> {
    this.timeSeriesData = data;
  }

  async getTimeSeriesData(): Promise<TimeSeriesDataPoint[]> {
    return this.timeSeriesData;
  }

  async storeProcessedData(data: ProcessedDataPoint[]): Promise<void> {
    this.processedData = data;
  }

  async getProcessedData(): Promise<ProcessedDataPoint[]> {
    return this.processedData;
  }

  async storeModelResult(result: ModelResult): Promise<void> {
    this.latestModel = result;
  }

  async getLatestModelResult(): Promise<ModelResult | undefined> {
    return this.latestModel;
  }

  async clearData(): Promise<void> {
    this.timeSeriesData = [];
    this.processedData = [];
    this.latestModel = undefined;
  }
}

export const storage = new MemStorage();
