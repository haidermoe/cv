import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, savePortfolioData } from '@/lib/portfolio';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'haider2026';

function isAuthorized(req: NextRequest): boolean {
  const cookieToken = req.cookies.get('admin_session')?.value;
  const headerToken = req.headers.get('authorization')?.replace('Bearer ', '');
  const expectedToken = Buffer.from(`${ADMIN_PASSWORD}:logged_in`).toString('base64');

  return cookieToken === expectedToken || headerToken === expectedToken;
}

export async function GET() {
  try {
    const data = getPortfolioData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 });
    }

    const success = savePortfolioData(body);
    if (!success) {
      return NextResponse.json({ ok: false, message: 'Failed to save data' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Data saved successfully', data: body });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
