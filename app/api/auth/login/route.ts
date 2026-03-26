// 1. Force the Node.js runtime to fix the "bcryptjs/crypto" Edge warnings
export const runtime = 'nodejs';
// 2. Force dynamic to prevent "Dynamic Server Usage" static build errors
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate schema
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check password (verifyPassword uses bcryptjs which requires Node.js runtime)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: { id: user.id, email: user.email, role: user.role } 
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Ensure cookie is available for the whole site
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}