import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, headers: [] });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.substring(file.name.lastIndexOf(".")) || ".xlsx";
    const tempFilePath = join(tmpdir(), `upload_${Date.now()}${ext}`);
    await writeFile(tempFilePath, buffer);

    const teknoPath = join(process.cwd(), "tekno_tool");
    const pythonCmd = `import json, sys; sys.path.insert(0, r'${teknoPath}'); from server import parse_headers_with_python; print(json.dumps(parse_headers_with_python(r'${tempFilePath}')))`;

    const result: string = await new Promise((resolve) => {
      execFile("python", ["-c", pythonCmd], (err, stdout) => {
        if (err) resolve("[]");
        else resolve(stdout);
      });
    });

    try { await unlink(tempFilePath); } catch {}

    const headers = JSON.parse(result.trim() || "[]");
    return NextResponse.json({ ok: true, headers });
  } catch (err) {
    return NextResponse.json({ ok: false, headers: [] });
  }
}
