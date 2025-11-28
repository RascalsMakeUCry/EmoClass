// Authentication utilities
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
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

// Verify token and check if user is still active in database
export async function verifyTokenWithDB(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as User;
    
    // Import supabase-admin to use service role
    const { supabase } = await import('./supabase-admin');
    
    // Check if user still exists and is active
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking user status:', error);
      return null;
    }
    
    if (!data) {
      console.log('User not found in database');
      return null;
    }
    
    if (!data.is_active) {
      console.log('User is inactive');
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as 'admin' | 'teacher',
    };
  } catch (error) {
    console.error('Error in verifyTokenWithDB:', error);
    return null;
  }
}
