"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import JSZip from "jszip";

// Helper to sanitize filenames
function sanitizeFilename(name: string): string {
  const clean = name.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, " ").trim();
  return clean.slice(0, 100) || "image";
}

// Helper to determine file extension
function getFileExtension(url: string, contentType?: string | null): string {
  const cleanUrl = url.split("?")[0].split("#")[0];
  const match = cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i);
  if (match) {
    return "." + match[1].toLowerCase();
  }
  if (contentType) {
    const ct = contentType.toLowerCase();
    if (ct.includes("png")) return ".png";
    if (ct.includes("webp")) return ".webp";
    if (ct.includes("gif")) return ".gif";
    if (ct.includes("svg")) return ".svg";
  }
  return ".jpg";
}

export default function ImageDownloaderPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [nameCol, setNameCol] = useState<number>(0);
  const [selectedUrlCols, setSelectedUrlCols] = useState<number[]>([]);
  
  // Parsed items data
  const [itemsData, setItemsData] = useState<{ name: string; urls: string[] }[]>([]);
  
  // Progress states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentProgressText, setCurrentProgressText] = useState("");
  const [downloadStats, setDownloadStats] = useState<{ total: number; downloaded: number; failed: number } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const t = {
    AR: {
      back: "العودة للرئيسية",
      badge: "أداة أتمتة سريعة • Bulk Downloader",
      title: "أداة تنزيل وتسمية الصور من الإكسل",
      subtitle: "ارفع ملف الإكسل (Excel أو CSV) لاستخراج روابط الصور وتنزيلها وتسميتها بأسماء المنتجات وتجميعها في ملف ZIP واحد بسرعة عالية.",
      dropTitle: "اضغط لاختيار ملف إكسل أو اسحبه إلى هنا",
      dropHint: "يدعم ملفات .xlsx, .xls, .csv",
      changeFile: "تغيير الملف",
      settingsTitle: "إعدادات تحديد الأعمدة",
      nameColLabel: "عمود اسم المنتج (لتسمية الصور):",
      urlColsLabel: "أعمدة روابط الصور (يمكن اختيار أكثر من عمود):",
      previewTitle: "معاينة العناصر المكتشفة",
      totalItems: "إجمالي المنتجات:",
      totalImages: "إجمالي الصور:",
      colIndex: "#",
      colName: "اسم الملف / المنتج",
      colCount: "عدد الصور",
      colUrls: "الروابط المكتشفة",
      startBtn: "بدء تنزيل الصور وتجهيز الـ ZIP",
      processing: "جاري تنزيل الصور...",
      finishedTitle: "تم اكتمال التنزيل وضغط الملف بنجاح!",
      downloadAgain: "تنزيل ملف ZIP مرة أخرى",
      noUrlsWarning: "لم يتم العثور على روابط صور في الأعمدة المحددة",
      downloadSample: "تحميل ملف إكسل تجريبي",
    },
    EN: {
      back: "Back to Home",
      badge: "Fast Automation Engine • Bulk Downloader",
      title: "Bulk Excel Image Downloader & Renamer",
      subtitle: "Upload your Excel or CSV file to extract image URLs, download them concurrently, rename them by product names, and package into a clean ZIP archive.",
      dropTitle: "Click to browse or drag & drop an Excel file here",
      dropHint: "Supports .xlsx, .xls, .csv files",
      changeFile: "Change File",
      settingsTitle: "Column Mapping Settings",
      nameColLabel: "Product Name Column (for renaming files):",
      urlColsLabel: "Image URL Columns (select multiple if applicable):",
      previewTitle: "Extracted Items Preview",
      totalItems: "Total Products:",
      totalImages: "Total Images:",
      colIndex: "#",
      colName: "File / Item Name",
      colCount: "Images",
      colUrls: "Extracted URLs",
      startBtn: "Start Download & Package ZIP",
      processing: "Downloading Images...",
      finishedTitle: "Download & Packaging Completed Successfully!",
      downloadAgain: "Download ZIP File Again",
      noUrlsWarning: "No valid image URLs found in selected columns",
      downloadSample: "Download Sample Excel File",
    }
  }[lang];

  // Helper to convert index to Column Letter (0 -> A, 1 -> B)
  const numToColStr = (n: number): string => {
    let s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % 26) + 65) + s;
      n = Math.floor(n / 26) - 1;
    }
    return s;
  };

  // Handle File Upload & Column Parsing
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsFinished(false);
    setDownloadStats(null);
    setProgressPercent(0);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) return;

      const ws = wb.Sheets[firstSheet];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (data.length === 0) return;

      const firstRow = data[0] || [];
      const cols = firstRow.map((val, idx) => {
        const colLetter = numToColStr(idx);
        const strVal = String(val).trim();
        return strVal ? `${colLetter} (${strVal})` : `${colLetter}`;
      });

      setColumns(cols);

      // Auto-select Name column (look for name, title, item, sku, اسم, منتج)
      const nameKeywords = ["name", "title", "item", "sku", "product", "اسم", "عنوان", "منتج", "مادة"];
      let detectedNameIdx = 0;
      for (let i = 0; i < cols.length; i++) {
        if (nameKeywords.some(k => cols[i].toLowerCase().includes(k))) {
          detectedNameIdx = i;
          break;
        }
      }
      setNameCol(detectedNameIdx);

      // Auto-detect URL columns
      const urlKeywords = ["url", "image", "img", "link", "photo", "pic", "صورة", "صوره", "رابط"];
      const detectedUrlCols: number[] = [];
      for (let i = 0; i < cols.length; i++) {
        if (urlKeywords.some(k => cols[i].toLowerCase().includes(k))) {
          detectedUrlCols.push(i);
        }
      }

      // If no keyword match, inspect sample rows for http:// or https://
      if (detectedUrlCols.length === 0) {
        for (let colIdx = 0; colIdx < cols.length; colIdx++) {
          for (let rowIdx = 1; rowIdx < Math.min(data.length, 10); rowIdx++) {
            const val = String(data[rowIdx]?.[colIdx] || "").trim();
            if (val.startsWith("http://") || val.startsWith("https://")) {
              detectedUrlCols.push(colIdx);
              break;
            }
          }
        }
      }

      const finalUrlCols = detectedUrlCols.length > 0 ? detectedUrlCols : (cols.length > 1 ? [1] : [0]);
      setSelectedUrlCols(finalUrlCols);

      // Parse items preview
      extractItems(data, detectedNameIdx, finalUrlCols);

    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const extractItems = (data: any[][], nameIdx: number, urlColsIdx: number[]) => {
    const items: { name: string; urls: string[] }[] = [];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const itemName = String(row[nameIdx] || "").trim();
      if (!itemName) continue;

      const urls: string[] = [];
      for (const colIdx of urlColsIdx) {
        const val = String(row[colIdx] || "").trim();
        if (val.startsWith("http://") || val.startsWith("https://")) {
          // Check if multiple urls are separated by comma, space or semicolon
          const splitUrls = val.split(/[\s,;]+/).filter(u => u.startsWith("http://") || u.startsWith("https://"));
          urls.push(...splitUrls);
        }
      }

      if (urls.length > 0) {
        items.push({ name: itemName, urls });
      }
    }
    setItemsData(items);
  };

  const handleNameColChange = (newIdx: number) => {
    setNameCol(newIdx);
    if (file) {
      reparseWithSettings(newIdx, selectedUrlCols);
    }
  };

  const handleUrlColToggle = (colIdx: number) => {
    const next = selectedUrlCols.includes(colIdx)
      ? selectedUrlCols.filter(i => i !== colIdx)
      : [...selectedUrlCols, colIdx];
    setSelectedUrlCols(next);
    if (file) {
      reparseWithSettings(nameCol, next);
    }
  };

  const reparseWithSettings = async (nameIdx: number, urlColsIdx: number[]) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      extractItems(data, nameIdx, urlColsIdx);
    } catch (err) {
      console.error(err);
    }
  };

  // Start Downloading & Zipping Process
  const handleStartDownload = async () => {
    if (itemsData.length === 0) return;

    setIsProcessing(true);
    setIsFinished(false);
    setProgressPercent(0);

    const zip = new JSZip();
    let totalImagesCount = 0;
    itemsData.forEach(item => totalImagesCount += item.urls.length);

    let downloadedCount = 0;
    let failedCount = 0;

    setDownloadStats({ total: totalImagesCount, downloaded: 0, failed: 0 });

    // Download worker function with fallback CORS proxy
    const fetchImageBuffer = async (url: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> => {
      try {
        // Direct fetch attempt
        const res = await fetch(url, { mode: "cors" });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || "";
          return { buffer, contentType };
        }
      } catch {
        // Fallback through internal proxy
      }

      try {
        const proxyRes = await fetch(`/api/images/proxy?url=${encodeURIComponent(url)}`);
        if (proxyRes.ok) {
          const buffer = await proxyRes.arrayBuffer();
          const contentType = proxyRes.headers.get("content-type") || "";
          return { buffer, contentType };
        }
      } catch {
        // Proxy failed
      }
      return null;
    };

    // Sequential/Batch download to avoid browser network throttling
    const concurrency = 6;
    let currentTaskIndex = 0;

    const allImageTasks: { itemName: string; url: string; imgIndex: number; totalForThisItem: number }[] = [];
    itemsData.forEach(item => {
      item.urls.forEach((url, i) => {
        allImageTasks.push({
          itemName: item.name,
          url,
          imgIndex: i + 1,
          totalForThisItem: item.urls.length
        });
      });
    });

    const runWorker = async () => {
      while (currentTaskIndex < allImageTasks.length) {
        const taskIdx = currentTaskIndex++;
        const task = allImageTasks[taskIdx];
        if (!task) break;

        setCurrentProgressText(`${task.itemName} (${taskIdx + 1}/${allImageTasks.length})`);

        const result = await fetchImageBuffer(task.url);
        if (result && result.buffer.byteLength > 0) {
          const ext = getFileExtension(task.url, result.contentType);
          const baseName = sanitizeFilename(task.itemName);
          const suffix = task.totalForThisItem > 1 ? `_${task.imgIndex}` : "";
          const fileName = `${baseName}${suffix}${ext}`;
          
          zip.file(fileName, result.buffer);
          downloadedCount++;
        } else {
          failedCount++;
        }

        const pct = Math.round(((downloadedCount + failedCount) / totalImagesCount) * 100);
        setProgressPercent(pct);
        setDownloadStats({ total: totalImagesCount, downloaded: downloadedCount, failed: failedCount });
      }
    };

    // Spawn workers
    const workers = Array.from({ length: Math.min(concurrency, allImageTasks.length) }, () => runWorker());
    await Promise.all(workers);

    // Generate ZIP
    setCurrentProgressText(lang === "AR" ? "جاري ضغط وتجهيز ملف الـ ZIP..." : "Generating ZIP archive...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Trigger download
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `Downloaded_Images_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    setIsProcessing(false);
    setIsFinished(true);
  };

  // Generate Sample Excel File
  const handleDownloadSample = () => {
    const sampleData = [
      ["Product Name", "SKU", "Image URL 1", "Image URL 2"],
      ["Apple iPhone 15 Pro Max", "IPH15PM-BLK", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", "https://images.unsplash.com/photo-1695048133021-f852e97a39d4?w=800"],
      ["Sony WH-1000XM5 Headphones", "SNY-WH1000-SIL", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800", ""],
      ["Logitech MX Master 3S Mouse", "LOG-MX3S-GRY", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800", ""],
      ["MacBook Pro 16 M3 Max", "MBP16-M3-SPC", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Sample_Products_Images.xlsx");
  };

  const totalExtractedImages = itemsData.reduce((acc, item) => acc + item.urls.length, 0);

  return (
    <div
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#0a0b12",
        color: "#ffffff",
        minHeight: "100vh",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        padding: "40px 20px 100px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* TOP HEADER NAVIGATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "15px" }}>
          <Link
            href="/"
            style={{
              background: "#151728",
              color: "#ffffff",
              padding: "10px 22px",
              borderRadius: "40px",
              fontSize: "14px",
              fontWeight: "800",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>←</span>
            <span>{t.back}</span>
          </Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handleDownloadSample}
              style={{
                background: "rgba(96, 165, 250, 0.1)",
                color: "#60a5fa",
                padding: "10px 20px",
                borderRadius: "40px",
                fontSize: "13px",
                fontWeight: "800",
                border: "1px solid rgba(96, 165, 250, 0.25)",
                cursor: "pointer",
              }}
            >
              {t.downloadSample}
            </button>

            <button
              onClick={() => setLang(prev => prev === "AR" ? "EN" : "AR")}
              style={{
                background: "#ffffff",
                color: "#0f111a",
                padding: "8px 18px",
                borderRadius: "40px",
                fontSize: "13px",
                fontWeight: "900",
                border: "none",
                cursor: "pointer",
              }}
            >
              {lang === "AR" ? "EN" : "عربي"}
            </button>
          </div>
        </div>

        {/* HERO INTRO */}
        <div style={{ textAlign: "center", marginBottom: "45px" }}>
          <span style={{ background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "6px 18px", borderRadius: "25px", fontSize: "13px", fontWeight: "800", display: "inline-block", marginBottom: "16px" }}>
            {t.badge}
          </span>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "900", letterSpacing: "-0.5px", marginBottom: "16px" }}>
            {t.title}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "17px", maxWidth: "720px", margin: "0 auto", lineHeight: "1.7", fontWeight: "500" }}>
            {t.subtitle}
          </p>
        </div>

        {/* FILE UPLOAD CARD */}
        {!file ? (
          <div
            style={{
              background: "#151728",
              border: "2px dashed rgba(96, 165, 250, 0.35)",
              borderRadius: "28px",
              padding: "60px 30px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "40px",
            }}
            onClick={() => document.getElementById("excel-upload-input")?.click()}
          >
            <input
              id="excel-upload-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div style={{ fontSize: "40px", marginBottom: "16px", color: "#60a5fa" }}>📁</div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>{t.dropTitle}</h3>
            <p style={{ color: "#64748b", fontSize: "14.5px", fontWeight: "600" }}>{t.dropHint}</p>
          </div>
        ) : (
          <div style={{ background: "#151728", borderRadius: "24px", padding: "24px 30px", marginBottom: "35px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <span style={{ color: "#60a5fa", fontSize: "13px", fontWeight: "800", textTransform: "uppercase" }}>Active File:</span>
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>{file.name}</h4>
            </div>

            <button
              onClick={() => { setFile(null); setColumns([]); setItemsData([]); }}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "8px 18px",
                borderRadius: "30px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              {t.changeFile}
            </button>
          </div>
        )}

        {/* SETTINGS & COLUMN MAPPING */}
        {file && columns.length > 0 && (
          <div style={{ background: "#151728", borderRadius: "28px", padding: "35px 30px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "35px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px" }}>
              {t.settingsTitle}
            </h3>

            {/* NAME COLUMN SELECTOR */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "14.5px", fontWeight: "800", color: "#cbd5e1", marginBottom: "10px" }}>
                {t.nameColLabel}
              </label>
              <select
                value={nameCol}
                onChange={(e) => handleNameColChange(Number(e.target.value))}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  background: "#0d0f1a",
                  color: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontSize: "14px",
                  fontWeight: "700",
                  outline: "none",
                }}
              >
                {columns.map((col, idx) => (
                  <option key={idx} value={idx}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* URL COLUMNS CHECKBOXES */}
            <div>
              <label style={{ display: "block", fontSize: "14.5px", fontWeight: "800", color: "#cbd5e1", marginBottom: "12px" }}>
                {t.urlColsLabel}
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {columns.map((col, idx) => {
                  const isSelected = selectedUrlCols.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleUrlColToggle(idx)}
                      style={{
                        background: isSelected ? "#2563eb" : "#0d0f1a",
                        color: isSelected ? "#ffffff" : "#94a3b8",
                        border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                        padding: "10px 18px",
                        borderRadius: "16px",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{isSelected ? "✓" : "+"}</span>
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS / STATUS BAR */}
        {isProcessing && (
          <div style={{ background: "#151728", borderRadius: "24px", padding: "30px", border: "1px solid rgba(96, 165, 250, 0.4)", marginBottom: "35px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#60a5fa" }}>{t.processing}</span>
              <span style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff" }}>{progressPercent}%</span>
            </div>

            {/* PROGRESS TRACK */}
            <div style={{ width: "100%", height: "12px", background: "#0d0f1a", borderRadius: "20px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #60a5fa)", transition: "width 0.2s ease" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13.5px", fontWeight: "600" }}>
              <span>{currentProgressText}</span>
              {downloadStats && (
                <span>{downloadStats.downloaded} / {downloadStats.total} images</span>
              )}
            </div>
          </div>
        )}

        {/* FINISHED SUCCESS BANNER */}
        {isFinished && downloadStats && (
          <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "24px", padding: "25px 30px", marginBottom: "35px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#34d399" }}>{t.finishedTitle}</h4>
              <p style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px" }}>
                Successfully packaged {downloadStats.downloaded} images into ZIP.
              </p>
            </div>

            <button
              onClick={handleStartDownload}
              style={{
                background: "#10b981",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t.downloadAgain}
            </button>
          </div>
        )}

        {/* ITEMS PREVIEW TABLE & ACTION BUTTON */}
        {itemsData.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: "800" }}>{t.previewTitle}</h3>
                <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                  {t.totalItems} <strong style={{ color: "#ffffff" }}>{itemsData.length}</strong> • {t.totalImages} <strong style={{ color: "#60a5fa" }}>{totalExtractedImages}</strong>
                </span>
              </div>

              <button
                disabled={isProcessing || totalExtractedImages === 0}
                onClick={handleStartDownload}
                style={{
                  background: isProcessing ? "#475569" : "#2563eb",
                  color: "#ffffff",
                  padding: "14px 34px",
                  borderRadius: "50px",
                  fontSize: "15.5px",
                  fontWeight: "800",
                  border: "none",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 30px rgba(37, 99, 235, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {isProcessing ? t.processing : t.startBtn}
              </button>
            </div>

            {/* PREVIEW TABLE */}
            <div style={{ background: "#151728", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ maxHeight: "450px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "AR" ? "right" : "left", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "#0d0f1a", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontWeight: "800" }}>
                      <th style={{ padding: "14px 20px", width: "60px" }}>{t.colIndex}</th>
                      <th style={{ padding: "14px 20px" }}>{t.colName}</th>
                      <th style={{ padding: "14px 20px", width: "120px" }}>{t.colCount}</th>
                      <th style={{ padding: "14px 20px" }}>{t.colUrls}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsData.slice(0, 100).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "14px 20px", color: "#64748b", fontWeight: "700" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 20px", color: "#ffffff", fontWeight: "700" }}>{item.name}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "800" }}>
                            {item.urls.length}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#94a3b8", maxWidth: "450px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.urls.join(" , ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {itemsData.length > 100 && (
                <div style={{ padding: "12px 20px", background: "#0d0f1a", color: "#64748b", fontSize: "12.5px", textAlign: "center", fontWeight: "600" }}>
                  Showing first 100 of {itemsData.length} items. All items will be downloaded in the ZIP archive.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
