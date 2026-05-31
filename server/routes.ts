import type { Request, Response, Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupWhamoRoutes } from "./whamo-handler";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api/auth", authRoutes);
  setupWhamoRoutes(app);

  // All project routes require authentication
  app.get("/api/projects", authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const projects = await storage.getProjectsByUser(userId);
    res.json(projects);
  });

  app.get("/api/projects/:id", authenticateToken, async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.userId !== (req as any).user.id) return res.status(403).json({ message: "Forbidden" });
    res.json(project);
  });

  app.post("/api/projects", authenticateToken, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const userId = (req as any).user.id;
      const project = await storage.createProject(input, userId);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  app.put("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (project.userId !== (req as any).user.id) return res.status(403).json({ message: "Forbidden" });
      const input = api.projects.update.input.parse(req.body);
      const updated = await storage.updateProject(req.params.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.userId !== (req as any).user.id) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteProject(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}
