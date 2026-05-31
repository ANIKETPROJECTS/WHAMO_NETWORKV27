import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
}

class InMemoryUserStore {
  private users: Map<string, StoredUser> = new Map();
  private nextId = 1;

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const lower = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === lower) return user;
    }
    return undefined;
  }

  async findById(id: string): Promise<StoredUser | undefined> {
    return this.users.get(id);
  }

  async create(fullName: string, email: string, password: string): Promise<StoredUser> {
    const id = String(this.nextId++);
    const user: StoredUser = {
      id,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async update(id: string, data: { fullName?: string; email?: string; password?: string }): Promise<StoredUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated: StoredUser = {
      ...user,
      ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
      ...(data.email !== undefined && { email: data.email.toLowerCase().trim() }),
      ...(data.password !== undefined && { password: data.password }),
    };
    this.users.set(id, updated);
    return updated;
  }

  async seedDemo(): Promise<void> {
    const existing = await this.findByEmail("demo@example.com");
    if (existing) return;
    const hashed = await bcrypt.hash("Demo@123", 12);
    await this.create("Demo User", "demo@example.com", hashed);
    console.log("[auth] Demo user ready: demo@example.com / Demo@123");
  }
}

export const userStore = new InMemoryUserStore();
