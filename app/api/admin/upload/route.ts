import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'haider2026';

function isAuthorized(req: NextRequest): boolean {
  const cookieToken = req.cookies.get('admin_session')?.value;
  const headerToken = req.headers.get('authorization')?.replace('Bearer ', '');
  const expectedToken = Buffer.from(`${ADMIN_PASSWORD}:logged_in`).toString('base64');
  return cookieToken === expectedToken || headerToken === expectedToken;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('customName') as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public directory
    const fileName = customName || file.name || 'uploaded_file';
    const publicPath = path.join(process.cwd(), 'public', fileName);

    fs.writeFileSync(publicPath, buffer);

    return NextResponse.json({
      ok: true,
      message: 'File uploaded successfully',
      path: `/${fileName}`,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
