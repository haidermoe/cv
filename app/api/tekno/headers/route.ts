import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, headers: [] });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return NextResponse.json({ ok: true, headers: [] });

    const ws = wb.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const firstRow = data[0] || [];

    function numToColStr(n: number): string {
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    }

    const headers = firstRow.map((val, idx) => {
      const colLetter = numToColStr(idx);
      const strVal = String(val).trim();
      return strVal ? `${colLetter} (${strVal})` : `${colLetter}`;
    });

    return NextResponse.json({ ok: true, headers });
  } catch (err) {
    return NextResponse.json({ ok: false, headers: [] });
  }
}
