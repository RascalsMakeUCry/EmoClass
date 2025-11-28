// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase-admin"; // pastikan path benar
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher";
}

// Password utils
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utils
export async function createToken(user: User): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.user as User;
  } catch {
    return null;
  }
}

// ✅ Helper baru untuk App Router, menerima NextRequest
export async function verifyAuthRequest(
  request: NextRequest
): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  return verifyTokenWithDB(token);
}

// Cek token + user aktif di DB
export async function verifyTokenWithDB(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as User;

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, is_active")
      .eq("id", user.id)
      .single();

    if (error || !data || !data.is_active) return null;

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as "admin" | "teacher",
    };
  } catch (error) {
    console.error("Error verifyTokenWithDB:", error);
    return null;
  }
}
