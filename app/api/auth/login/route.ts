import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { comparePassword, signToken } from '@/lib/auth/jwt';
import { isValidEmail } from '@/lib/validation/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'User account is inactive. Contact admin.' }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const role = memoryDb.roles.find(r => r.role_id === user.role_id);
    const roleName = role?.role_name || 'FARMER';

    const token = signToken({
      userId: user.user_id,
      email: user.email,
      name: user.name,
      roleId: user.role_id,
      roleName: roleName as any
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        roleName
      }
    });

    // Set cookie
    response.cookies.set('agri_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
