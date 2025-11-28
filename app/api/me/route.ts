// Get current user endpoint
import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenWithDB } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use verifyTokenWithDB to check if user is still active
  const user = await verifyTokenWithDB(token);
  if (!user) {
    // User is inactive or deleted, clear cookie and return unauthorized
    const response = NextResponse.json(
      { error: 'Account is inactive or has been deleted' }, 
      { status: 401 }
    );
    response.cookies.delete('auth-token');
    return response;
  }

  return NextResponse.json({ user });
}
