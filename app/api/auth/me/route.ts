import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth/auth';
import { memoryDb } from '@/lib/postgres/db';

export async function GET(request: NextRequest) {
  const user = getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const dbUser = memoryDb.users.find(u => u.user_id === user.userId);

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: dbUser?.phone || '',
      roleId: user.roleId,
      roleName: user.roleName
    }
  });
}
