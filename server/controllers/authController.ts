import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userStore } from "../auth/inMemoryUserStore";

const JWT_SECRET = process.env.JWT_SECRET || "whamo-designer-jwt-fallback";
const JWT_EXPIRES = "7d";

export async function register(req: Request, res: Response) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await userStore.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    await userStore.create(fullName.trim(), email.trim(), hashed);

    return res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  return res.json({ user: (req as any).user });
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { fullName, email } = req.body;

    if (!fullName?.trim() && !email?.trim()) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    const current = await userStore.findById(userId);
    if (!current) return res.status(404).json({ message: "User not found" });

    if (email && email.toLowerCase().trim() !== current.email) {
      const existing = await userStore.findByEmail(email);
      if (existing && existing.id !== userId) {
        return res.status(409).json({ message: "That email is already in use by another account" });
      }
    }

    const updated = await userStore.update(userId, {
      fullName: fullName?.trim() || current.fullName,
      email: email?.toLowerCase().trim() || current.email,
    });

    if (!updated) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign(
      { id: updated.id, email: updated.email, fullName: updated.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: updated.id, email: updated.email, fullName: updated.fullName },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await userStore.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 12);
    await userStore.update(userId, { password: hashed });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
