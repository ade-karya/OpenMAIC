/**
 * PIN Authentication API
 *
 * POST /api/auth/pin — Verify PIN, set session cookie
 * DELETE /api/auth/pin — Logout, clear session cookie
 * GET /api/auth/pin — Check current session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validatePin,
  createPinToken,
  verifyPinToken,
  getPinTokenFromRequest,
  getPinUserFromToken,
  PIN_COOKIE_NAME,
  hasPinUsers,
} from '@/lib/server/pin-auth';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('PinAuthAPI');

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

/** POST — Login with PIN */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body as { pin?: string };

    if (!pin || typeof pin !== 'string') {
      return apiError('INVALID_REQUEST', 400, 'PIN is required');
    }

    const user = validatePin(pin.trim());
    if (!user) {
      log.warn('Invalid PIN attempt');
      return apiError('INVALID_REQUEST', 401, 'Invalid PIN');
    }

    const token = createPinToken(user);
    log.info(`PIN login successful: ${user.name}`);

    const response = NextResponse.json({
      success: true,
      user: { index: user.index, name: user.name },
    });

    response.cookies.set(PIN_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    log.error('PIN login error:', error);
    return apiError('INTERNAL_ERROR', 500, 'Login failed');
  }
}

/** DELETE — Logout */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PIN_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

/** GET — Check session */
export async function GET(req: NextRequest) {
  const token = getPinTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      pinEnabled: hasPinUsers(),
    });
  }

  const user = getPinUserFromToken(token);
  if (!user) {
    // Invalid / expired token — clear cookie
    const response = NextResponse.json({
      success: true,
      authenticated: false,
      pinEnabled: hasPinUsers(),
    });
    response.cookies.set(PIN_COOKIE_NAME, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    pinEnabled: true,
    user: { index: user.index, name: user.name },
  });
}
