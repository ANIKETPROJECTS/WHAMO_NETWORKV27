import { type InsertProject, type UpdateProjectRequest, type ProjectResponse } from "@shared/schema";
import { Project } from "./models/Project";

export interface IStorage {
  getProjectsByUser(userId: string): Promise<ProjectResponse[]>;
  getProject(id: string): Promise<ProjectResponse | undefined>;
  createProject(project: InsertProject, userId: string): Promise<ProjectResponse>;
  updateProject(id: string, updates: UpdateProjectRequest): Promise<ProjectResponse>;
  deleteProject(id: string): Promise<void>;
}

function toProjectResponse(doc: any): ProjectResponse {
  return {
    id: doc._id.toString(),
    name: doc.name,
    content: doc.content,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoStorage implements IStorage {
  async getProjectsByUser(userId: string): Promise<ProjectResponse[]> {
    const docs = await Project.find({ userId }).sort({ updatedAt: -1 });
    return docs.map(toProjectResponse);
  }

  async getProject(id: string): Promise<ProjectResponse | undefined> {
    try {
      const doc = await Project.findById(id);
      return doc ? toProjectResponse(doc) : undefined;
    } catch {
      return undefined;
    }
  }

  async createProject(insertProject: InsertProject, userId: string): Promise<ProjectResponse> {
    const doc = await Project.create({ ...insertProject, userId });
    return toProjectResponse(doc);
  }

  async updateProject(id: string, updates: UpdateProjectRequest): Promise<ProjectResponse> {
    const doc = await Project.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new Error(`Project ${id} not found`);
    return toProjectResponse(doc);
  }

  async deleteProject(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }
}

export const storage = new MongoStorage();
