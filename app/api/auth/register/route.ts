import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { hashPassword, signToken } from '@/lib/auth/jwt';
import { isValidEmail } from '@/lib/validation/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, roleName = 'FARMER' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check duplicate
    const existing = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 409 });
    }

    const role = memoryDb.roles.find(r => r.role_name === roleName) || memoryDb.roles.find(r => r.role_name === 'FARMER')!;
    const passwordHash = await hashPassword(password);
    const nextUserId = memoryDb.users.length > 0 ? Math.max(...memoryDb.users.map(u => u.user_id)) + 1 : 1;

    const newUser = {
      user_id: nextUserId,
      name,
      email,
      password_hash: passwordHash,
      phone: phone || '',
      role_id: role.role_id,
      is_active: true,
      created_at: new Date().toISOString()
    };
    memoryDb.users.push(newUser);

    const token = signToken({
      userId: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      roleId: newUser.role_id,
      roleName: role.role_name as any
    });

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: newUser.role_id,
        roleName: role.role_name
      }
    }, { status: 201 });

    response.cookies.set('agri_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
