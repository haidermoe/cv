import { NextRequest, NextResponse } from 'next/server';

// Default Admin Password (can also be customized via ADMIN_PASSWORD env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'haider2026';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json().catch(() => ({}));

    if (!password) {
      return NextResponse.json({ ok: false, message: 'Password is required' }, { status: 400 });
    }

    if (password === ADMIN_PASSWORD) {
      // Create session token (simple base64 token based on password + date)
      const token = Buffer.from(`${ADMIN_PASSWORD}:logged_in`).toString('base64');
      const response = NextResponse.json({ ok: true, token });

      // Set HTTP-only session cookie
      response.cookies.set({
        name: 'admin_session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_session')?.value;
  const expectedToken = Buffer.from(`${ADMIN_PASSWORD}:logged_in`).toString('base64');

  const authenticated = cookieToken === expectedToken;
  return NextResponse.json({ ok: true, authenticated });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, message: 'Logged out' });
  response.cookies.delete('admin_session');
  return response;
}
