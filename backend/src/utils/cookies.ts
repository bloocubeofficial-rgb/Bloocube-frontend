import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

const baseOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, userData: Record<string, unknown>) {
  res.cookie('access_token', accessToken, { ...baseOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...baseOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  // user_data is readable by the frontend (not HttpOnly) — mirrors cookieAuth.ts
  // contract. Keep the default percent-encoding here (raw JSON contains
  // characters like {, }, "," that Node's cookie serializer rejects
  // outright) — see the decodeURIComponent fix in cookieAuth.ts's getUser().
  res.cookie('user_data', JSON.stringify(userData), { ...baseOpts, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', baseOpts);
  res.clearCookie('refresh_token', baseOpts);
  res.clearCookie('user_data', { ...baseOpts, httpOnly: false });
}
