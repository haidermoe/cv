import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

function cleanKeyStr(key: any, ignorePunct = true): string {
  if (key === null || key === undefined) return "";
  let s = String(key)
    .replace(/\uFEFF/g, "")
    .replace(/\xa0/g, " ")
    .replace(/[\r\n\t]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u0640]/g, "")
    .trim();

  // Arabic Normalization
  s = s
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

  if (s.endsWith(".0")) {
    s = s.slice(0, -2);
  }

  s = s.toLowerCase();
  if (ignorePunct) {
    s = s.replace(/[\W_]+/g, "");
  } else {
    s = s.replace(/\\/g, "/").trim();
  }
  return s;
}

function parseFileSheets(buffer: Buffer): { [sheetName: string]: any[][] } {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const result: { [sheetName: string]: any[][] } = {};
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    result[sheetName] = data;
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileOld = formData.get("file_old") as File | null;
    const fileNew = formData.get("file_new") as File | null;
    const fileRef = formData.get("file_ref") as File | null;

    const keyColOld = (formData.get("key_col_old") as string) || "0";
    const keyColNew = (formData.get("key_col_new") as string) || "0";
    const ignorePunct = formData.get("ignore_punct") !== "false";

    if (!fileOld || !fileNew) {
      return NextResponse.json({ ok: false, error: "يرجى اختيار ملف الموقع وملف المخزن" }, { status: 400 });
    }

    const bufOld = Buffer.from(await fileOld.arrayBuffer());
    const bufNew = Buffer.from(await fileNew.arrayBuffer());

    const oldSheets = parseFileSheets(bufOld);
    const newSheets = parseFileSheets(bufNew);

    // Reference Mapping
    const refMapping: { [key: string]: string } = {};
    if (fileRef) {
      const bufRef = Buffer.from(await fileRef.arrayBuffer());
      const refSheets = parseFileSheets(bufRef);
      for (const shName in refSheets) {
        const rows = refSheets[shName];
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length < 2) continue;
          const vals = row.map((v) => String(v).replace(/\xa0/g, " ").trim()).filter(Boolean);
          if (r === 0) {
            const rowStr = vals.join(" ").toLowerCase();
            if (["name", "sku", "اسم", "موقع", "مخزن", "item", "ref", "كود"].some((h) => rowStr.includes(h))) {
              continue;
            }
          }
          if (vals.length >= 2) {
            const targetStd = vals.length >= 3 ? vals[2] : vals[1];
            for (const v of vals) {
              if (!v) continue;
              refMapping[v.toLowerCase()] = targetStd;
              refMapping[cleanKeyStr(v, true)] = targetStd;
              refMapping[cleanKeyStr(v, false)] = targetStd;
            }
          }
        }
      }
    }

    function lookupRef(rawK: any): string | null {
      if (!rawK) return null;
      const strVal = String(rawK).replace(/\xa0/g, " ").trim();
      const lower = strVal.toLowerCase();
      const cleanP = cleanKeyStr(strVal, true);
      const cleanS = cleanKeyStr(strVal, false);

      if (refMapping[lower]) return refMapping[lower];
      if (refMapping[cleanP]) return refMapping[cleanP];
      if (refMapping[cleanS]) return refMapping[cleanS];
      return null;
    }

    function normalizeKey(rawK: any): string {
      if (!rawK) return "";
      const ref = lookupRef(rawK);
      const k = ref || rawK;
      return cleanKeyStr(k, ignorePunct);
    }

    const outWb = XLSX.utils.book_new();

    const targetSheetName = Object.keys(oldSheets)[0] || "Sheet1";
    const oldRows = oldSheets[targetSheetName] || [];
    const newSheetName = Object.keys(newSheets)[0] || "Sheet1";
    const newRows = newSheets[newSheetName] || [];

    const oldHeader = oldRows[0] || [];
    const newHeader = newRows[0] || [];

    // Find column indices
    let oldKeyIdx = 0;
    if (keyColOld !== "Row-by-Row") {
      const idx = oldHeader.findIndex((h) => String(h).trim() === keyColOld.trim());
      if (idx !== -1) oldKeyIdx = idx;
    }

    let newKeyIdx = 0;
    if (keyColNew !== "Row-by-Row") {
      const idx = newHeader.findIndex((h) => String(h).trim() === keyColNew.trim());
      if (idx !== -1) newKeyIdx = idx;
    }

    // Build old_by_key dictionary
    const oldByKey: { [key: string]: any[] } = {};
    for (let r = 1; r < oldRows.length; r++) {
      const row = oldRows[r];
      if (!row || row.length === 0) continue;
      const rawK = row[oldKeyIdx];
      const normK = normalizeKey(rawK);
      if (normK) {
        oldByKey[normK] = row;
      }
    }

    // Build categories
    const modRows: any[][] = [[...newHeader, "الحالة"]];
    const newSheetRows: any[][] = [newHeader];
    const delSheetRows: any[][] = [oldHeader];

    const processedKeys = new Set<string>();

    for (let r = 1; r < newRows.length; r++) {
      const row = newRows[r];
      if (!row || row.length === 0) continue;
      const rawK = row[newKeyIdx];
      const normK = normalizeKey(rawK);

      if (!normK) continue;
      processedKeys.add(normK);

      const oldMatch = oldByKey[normK];
      if (oldMatch) {
        modRows.push([...row, "مطابق / موجود"]);
      } else {
        newSheetRows.push(row);
      }
    }

    for (let r = 1; r < oldRows.length; r++) {
      const row = oldRows[r];
      if (!row || row.length === 0) continue;
      const rawK = row[oldKeyIdx];
      const normK = normalizeKey(rawK);
      if (normK && !processedKeys.has(normK)) {
        delSheetRows.push(row);
      }
    }

    // Add sheets to workbook
    const wsMod = XLSX.utils.aoa_to_sheet(modRows);
    const wsNew = XLSX.utils.aoa_to_sheet(newSheetRows);
    const wsDel = XLSX.utils.aoa_to_sheet(delSheetRows);

    XLSX.utils.book_append_sheet(outWb, wsMod, "Sheet1_Mod");
    XLSX.utils.book_append_sheet(outWb, wsNew, "Sheet1_New");
    XLSX.utils.book_append_sheet(outWb, wsDel, "Sheet1_Del");

    const outBuffer = XLSX.write(outWb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(outBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Tekno_Data_Report.xlsx"',
      },
    });
  } catch (error) {
    console.error("Tekno API Error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
