import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { fail } from '../utils/responses';

export type AuthedRequest = Request & { userId?: string; userRole?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) return fail(res, 'Authentication required', 401);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return fail(res, 'Authentication required', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return fail(res, 'Forbidden', 403);
    }
    next();
  };
}
