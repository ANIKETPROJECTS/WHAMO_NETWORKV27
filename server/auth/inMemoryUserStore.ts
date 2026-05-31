import bcrypt from "bcryptjs";
import { User, type IUser } from "../models/User";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
}

function toStoredUser(doc: IUser): StoredUser {
  return {
    id: (doc._id as any).toString(),
    fullName: doc.fullName,
    email: doc.email,
    password: doc.password,
    createdAt: doc.createdAt,
  };
}

class MongoUserStore {
  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user ? toStoredUser(user) : undefined;
  }

  async findById(id: string): Promise<StoredUser | undefined> {
    const user = await User.findById(id);
    return user ? toStoredUser(user) : undefined;
  }

  async create(fullName: string, email: string, password: string): Promise<StoredUser> {
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    return toStoredUser(user);
  }

  async update(id: string, data: { fullName?: string; email?: string; password?: string }): Promise<StoredUser | undefined> {
    const updates: Partial<IUser> = {};
    if (data.fullName !== undefined) updates.fullName = data.fullName.trim();
    if (data.email !== undefined) updates.email = data.email.toLowerCase().trim();
    if (data.password !== undefined) updates.password = data.password;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return user ? toStoredUser(user) : undefined;
  }

  async seedDemo(): Promise<void> {
    const existing = await this.findByEmail("demo@example.com");
    if (existing) return;
    const hashed = await bcrypt.hash("Demo@123", 12);
    await this.create("Demo User", "demo@example.com", hashed);
    console.log("[auth] Demo user ready: demo@example.com / Demo@123");
  }
}

export const userStore = new MongoUserStore();
