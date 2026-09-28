import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, UserRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { hashPassword } from '@/lib/auth/jwt';
import { isValidEmail } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  const users = memoryDb.users.map(u => {
    const role = memoryDb.roles.find(r => r.role_id === u.role_id);
    const farmsCount = memoryDb.farms.filter(f => f.owner_id === u.user_id).length;
    return {
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role_id: u.role_id,
      role_name: role?.role_name || 'FARMER',
      is_active: u.is_active,
      farms_count: farmsCount,
      created_at: u.created_at
    };
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, phone, role_name = 'FARMER' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const existing = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const role = memoryDb.roles.find(r => r.role_name === role_name) || memoryDb.roles[1];
    const passwordHash = await hashPassword(password);
    const nextId = memoryDb.users.length > 0 ? Math.max(...memoryDb.users.map(u => u.user_id)) + 1 : 1;

    const newUser: UserRecord = {
      user_id: nextId,
      name,
      email,
      password_hash: passwordHash,
      phone: phone || '',
      role_id: role.role_id,
      is_active: true,
      created_at: new Date().toISOString()
    };

    memoryDb.users.push(newUser);

    return NextResponse.json({
      success: true,
      message: 'User created by Administrator',
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role_name: role.role_name
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
