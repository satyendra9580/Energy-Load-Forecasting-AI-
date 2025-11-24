import { type User, type InsertUser, type TimeSeriesDataPoint, type ProcessedDataPoint, type ModelResult } from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Interface defining the storage operations.
 * Allows for swapping different storage implementations (e.g., memory, database).
 */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  /** Stores raw time series data from CSV upload */
  storeTimeSeriesData(data: TimeSeriesDataPoint[]): Promise<void>;
  /** Retrieves stored raw time series data */
  getTimeSeriesData(): Promise<TimeSeriesDataPoint[]>;

  /** Stores processed data with engineered features */
  storeProcessedData(data: ProcessedDataPoint[]): Promise<void>;
  /** Retrieves processed data for training/forecasting */
  getProcessedData(): Promise<ProcessedDataPoint[]>;

  /** Stores the result of a model training/prediction run */
  storeModelResult(result: ModelResult): Promise<void>;
  /** Retrieves the most recent model result */
  getLatestModelResult(): Promise<ModelResult | undefined>;

  /** Clears all stored data (useful for testing or resetting) */
  clearData(): Promise<void>;
}

/**
 * In-memory implementation of the storage interface.
 * Data is lost when the server restarts.
 * Suitable for demonstration and development purposes.
 */
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
