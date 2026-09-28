import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export function getAuthUserFromRequest(request: NextRequest): TokenPayload | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Check cookies
  const cookieToken = request.cookies.get('agri_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function requireAuth(request: NextRequest, allowedRoles?: ('ADMIN' | 'FARMER' | 'OFFICER')[]) {
  const user = getAuthUserFromRequest(request);
  if (!user) {
    return {
      authorized: false,
      error: 'Unauthorized: Authentication required',
      status: 401,
      user: null
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.roleName)) {
    return {
      authorized: false,
      error: `Forbidden: Insufficient privileges. Required: ${allowedRoles.join(', ')}`,
      status: 403,
      user
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
    user
  };
}
