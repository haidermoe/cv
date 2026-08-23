"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import JSZip from "jszip";

// REUSABLE FLIP-TEXT LINK COMPONENT
function FlipLink({ children, href, style, color = "#0f111a", hoverColor = "#2563eb" }: { children: React.ReactNode; href: string; style?: React.CSSProperties; color?: string; hoverColor?: string }) {
  return (
    <a
      href={href}
      style={{
        fontSize: "14.5px",
        fontWeight: "800",
        fontFamily: "'Tajawal', 'Outfit', sans-serif",
        padding: "0 4px",
        textDecoration: "none",
        ...style
      }}
      className="flip-link-group"
    >
      <span className="flip-wrapper">
        <span className="flip-text-primary" style={{ color: color }}>{children}</span>
        <span className="flip-text-secondary" style={{ color: hoverColor }}>{children}</span>
      </span>
    </a>
  );
}

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Language ripple state
  const [isLangAnimating, setIsLangAnimating] = useState(false);
  const [langOrigin, setLangOrigin] = useState({ x: 0, y: 0 });
  const [circleActive, setCircleActive] = useState(false);

  // Client Drawer Tab State (+ كُن عميلاً)
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isClientDrawerActive, setIsClientDrawerActive] = useState(false);
  const [isClientDrawerClosing, setIsClientDrawerClosing] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // File states
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

  useEffect(() => {
    const handleCheckDesktop = () => setIsDesktop(window.innerWidth > 960);
    handleCheckDesktop();
    window.addEventListener("resize", handleCheckDesktop);
    return () => window.removeEventListener("resize", handleCheckDesktop);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth) * 2 - 1,
      y: (clientY / innerHeight) * 2 - 1,
    });
  };

  const handleLangSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLangAnimating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setLangOrigin({ x, y });
    setIsLangAnimating(true);

    requestAnimationFrame(() => {
      setCircleActive(true);
    });

    setTimeout(() => {
      setLang((prev) => (prev === "AR" ? "EN" : "AR"));
      setCircleActive(false);

      setTimeout(() => {
        setIsLangAnimating(false);
      }, 700);
    }, 700);
  };

  const openClientDrawer = () => {
    setIsClientDrawerOpen(true);
    setIsClientDrawerClosing(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsClientDrawerActive(true);
      });
    });
  };

  const closeClientDrawer = () => {
    setIsClientDrawerActive(false);
    setIsClientDrawerClosing(true);
    setTimeout(() => {
      setIsClientDrawerOpen(false);
      setIsClientDrawerClosing(false);
    }, 450);
  };

  const handleDrawerFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/haider.m.shwkat@outlook.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        "الاسم والشركة / Client Name": formData.get("client_name"),
        "البريد الإلكتروني / Client Email": formData.get("client_email"),
        "تفاصيل المشروع / Project Details": formData.get("project_details"),
        _subject: "طلب عمل جديد من أداة تنزيل الصور!",
      }),
    }).catch(console.error);

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      closeClientDrawer();
    }, 2500);
  };

  const t = {
    AR: {
      brandName: "حيدر محمد",
      navHome: "الرئيسية",
      navAbout: "النبذة",
      navExperience: "الخبرات",
      navEducation: "التعليم",
      navContact: "تواصل معي",
      becomeClient: "كن عميلاً",
      title: "أداة تنزيل وتسمية الصور من الإكسل (Bulk Downloader)",
      subtitle: "منظومة سريعة لمعالجة ملفات الإكسل وسحب روابط الصور وتنزيلها وتسميتها بأسماء المنتجات وضغطها بملف ZIP تلقائياً",
      dropTitle: "اختر ملف الإكسل (Excel أو CSV) أو اسحبه إلى هنا",
      dropHint: "يدعم ملفات .xlsx, .xls, .csv بكافة الأحجام",
      activeFile: "الملف الحالي:",
      changeFile: "تغيير الملف",
      settingsTitle: "إعدادات مطابقة الأعمدة",
      nameColLabel: "عمود اسم المنتج (لتسمية الصور):",
      urlColsLabel: "أعمدة روابط الصور (حدد الأعمدة المراد تنزيلها):",
      previewTitle: "معاينة العناصر المكتشفة",
      totalItems: "إجمالي المنتجات:",
      totalImages: "إجمالي الصور:",
      colIndex: "#",
      colName: "اسم المنتج / الملف",
      colCount: "عدد الصور",
      colUrls: "روابط الصور",
      startBtn: "بدء تنزيل الصور وتجهيز ملف ZIP",
      processing: "جاري تنزيل الصور بالتوازي...",
      finishedTitle: "تم اكتمال التنزيل وضغط الصور بنجاح!",
      downloadAgain: "إعادة تحميل ملف الـ ZIP",
      downloadSample: "تحميل ملف إكسل تجريبي",
      drawerTitle: "مرحباً! أخبرنا بكل التفاصيل",
      drawerSubtitle: "يسعدنا التعاون معك لبناء وتطوير حلول برمجية وبيانات استثنائية.",
      nameLabel: "الاسم والشركة",
      emailLabel: "البريد الإلكتروني",
      projectLabel: "تفاصيل المشروع",
      submitBtn: "إرسال الطلب",
      submittedSuccess: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً.",
    },
    EN: {
      brandName: "Haider Mohamed",
      navHome: "Home",
      navAbout: "About Us",
      navExperience: "Experience",
      navEducation: "Education",
      navContact: "Contact Us",
      becomeClient: "Become a Client",
      title: "Bulk Excel Image Downloader & Renamer",
      subtitle: "High-speed engine to parse Excel catalogs, download product images concurrently, rename them automatically, and package into a ZIP archive",
      dropTitle: "Click to select Excel/CSV file or drag & drop here",
      dropHint: "Supports .xlsx, .xls, .csv files of any size",
      activeFile: "Active File:",
      changeFile: "Change File",
      settingsTitle: "Column Mapping Settings",
      nameColLabel: "Product Name Column (for renaming files):",
      urlColsLabel: "Image URL Columns (select columns to download):",
      previewTitle: "Extracted Items Preview",
      totalItems: "Total Products:",
      totalImages: "Total Images:",
      colIndex: "#",
      colName: "Product / File Name",
      colCount: "Images",
      colUrls: "Image URLs",
      startBtn: "Start Download & Package ZIP",
      processing: "Downloading Images Concurrently...",
      finishedTitle: "Download & Packaging Completed Successfully!",
      downloadAgain: "Download ZIP Archive Again",
      downloadSample: "Download Sample Excel File",
      drawerTitle: "Hey! Tell us all the things",
      drawerSubtitle: "We’d love to hear about your project and build something amazing together.",
      nameLabel: "Name & Company",
      emailLabel: "Your Email",
      projectLabel: "Project Details",
      submitBtn: "Submit Request",
      submittedSuccess: "Request Submitted Successfully! We will contact you soon.",
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

      // Auto-select Name column
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

    const fetchImageBuffer = async (url: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> => {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || "";
          return { buffer, contentType };
        }
      } catch {
        // CORS fallback
      }

      try {
        const proxyRes = await fetch(`/api/images/proxy?url=${encodeURIComponent(url)}`);
        if (proxyRes.ok) {
          const buffer = await proxyRes.arrayBuffer();
          const contentType = proxyRes.headers.get("content-type") || "";
          return { buffer, contentType };
        }
      } catch {
        // Failed
      }
      return null;
    };

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

    const workers = Array.from({ length: Math.min(concurrency, allImageTasks.length) }, () => runWorker());
    await Promise.all(workers);

    setCurrentProgressText(lang === "AR" ? "جاري ضغط وتجهيز ملف الـ ZIP..." : "Generating ZIP archive...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

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

  const handleDownloadSample = () => {
    const sampleData = [
      ["Product Name", "SKU", "Image URL 1", "Image URL 2", "Image URL 3"],
      ["Apple iPhone 15 Pro Max", "IPH15PM-BLK", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", "https://images.unsplash.com/photo-1695048133021-f852e97a39d4?w=800", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800"],
      ["Sony WH-1000XM5 Headphones", "SNY-WH1000-SIL", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", ""],
      ["Logitech MX Master 3S Mouse", "LOG-MX3S-GRY", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800", "", ""],
      ["MacBook Pro 16 M3 Max", "MBP16-M3-SPC", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Sample_Products_Images.xlsx");
  };

  const totalExtractedImages = itemsData.reduce((acc, item) => acc + item.urls.length, 0);

  return (
    <div
      onMouseMove={handleMouseMove}
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#f2f1f6",
        color: "#0f111a",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isDesktop ? "20px clamp(16px, 5vw, 80px)" : "16px 14px 20px",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* CIRCULAR LANGUAGE RIPPLE TRANSITION OVERLAY */}
      {isLangAnimating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            background: "#0f111a",
            clipPath: circleActive
              ? `circle(150vmax at ${langOrigin.x}px ${langOrigin.y}px)`
              : `circle(0px at ${langOrigin.x}px ${langOrigin.y}px)`,
            transition: "clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "900",
              letterSpacing: "0.08em",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {lang === "AR" ? "ENGLISH" : "العربية"}
          </span>
        </div>
      )}

      {/* 3D CONCAVE DOT GRID BACKGROUND LAYER */}
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          perspective: "1000px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: "radial-gradient(rgba(15, 17, 26, 0.16) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            transform: `perspective(1000px) rotateX(${16 + mousePos.y * 14}deg) rotateY(${mousePos.x * 16}deg) scale(1.25)`,
            transformOrigin: "center center",
            transition: "transform 0.08s linear",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
          }}
        />
      </div>

      {/* TOP HEADER BAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          zIndex: 30,
          gap: "8px",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            color: "#0f111a",
            fontSize: "clamp(14px, 3.6vw, 20px)",
            fontWeight: "900",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="16" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#0f111a" />
            <rect x="0" y="13" width="16" height="7" fill="#0f111a" />
            <rect x="10" y="13" width="15" height="7" fill="#2563eb" />
          </svg>
          <span>{t.brandName}</span>
        </Link>

        {/* CENTER PILL NAV WITH FLIP LINK ANIMATIONS */}
        <div
          className="desktop-header-nav"
          style={{
            display: isDesktop ? "flex" : "none",
            alignItems: "center",
            gap: "28px",
            background: "#ffffff",
            padding: "10px 28px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
          }}
        >
          <FlipLink href="/" color="#475569" hoverColor="#2563eb">
            {t.navHome}
          </FlipLink>
          <FlipLink href="/tekno" color="#475569" hoverColor="#2563eb">
            {lang === "AR" ? "أداة تكنو (Excel Diff)" : "Tekno Tool"}
          </FlipLink>
          <FlipLink href="/#about" color="#475569" hoverColor="#2563eb">
            {t.navAbout}
          </FlipLink>
          <FlipLink href="/#experience" color="#475569" hoverColor="#2563eb">
            {t.navExperience}
          </FlipLink>
          <FlipLink href="/#contact" color="#475569" hoverColor="#2563eb">
            {t.navContact}
          </FlipLink>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={handleDownloadSample}
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              color: "#2563eb",
              padding: isDesktop ? "8px 16px" : "6px 10px",
              borderRadius: "50px",
              fontSize: isDesktop ? "13px" : "11.5px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {t.downloadSample}
          </button>

          <button
            onClick={handleLangSwitch}
            className="awsmd-btn-glow"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              color: "#0f111a",
              padding: isDesktop ? "7px 14px" : "6px 10px",
              borderRadius: "50px",
              fontSize: isDesktop ? "12px" : "11px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {lang === "AR" ? "EN" : "عربي"} ∨
          </button>

          <button
            onClick={openClientDrawer}
            className="awsmd-royal-client-btn"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span className="flip-box">
              <span className="flip-wrapper">
                <span className="flip-text-primary">
                  + {isDesktop ? (lang === "AR" ? "كن عميلاً" : "Become a Client") : (lang === "AR" ? "تواصل" : "Client")}
                </span>
                <span className="flip-text-secondary">
                  + {isDesktop ? (lang === "AR" ? "كن عميلاً" : "Become a Client") : (lang === "AR" ? "تواصل" : "Client")}
                </span>
              </span>
            </span>
          </button>
        </div>
      </header>

      {/* MAIN TOOL CONTENT */}
      <main
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: "1100px",
          width: "100%",
          margin: "40px auto",
        }}
      >
        {/* HEADER TITLE CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: isDesktop ? "35px 40px" : "25px 20px",
            borderRadius: "28px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: isDesktop ? "36px" : "24px",
              fontWeight: "900",
              color: "#0f111a",
              marginBottom: "10px",
              letterSpacing: "-0.02em",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: isDesktop ? "15.5px" : "13.5px",
              color: "#475569",
              fontWeight: "600",
              maxWidth: "780px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* UPLOAD CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: isDesktop ? "35px 40px" : "25px 20px",
            borderRadius: "28px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
            marginBottom: "30px",
          }}
        >
          {!file ? (
            <div
              style={{
                border: "2.5px dashed #cbd5e1",
                borderRadius: "24px",
                padding: isDesktop ? "50px 30px" : "35px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "#f8fafc",
              }}
              onClick={() => document.getElementById("excel-file-input")?.click()}
            >
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div style={{ fontSize: "38px", color: "#2563eb", marginBottom: "12px" }}>📁</div>
              <h3 style={{ fontSize: isDesktop ? "20px" : "16px", fontWeight: "800", color: "#0f111a", marginBottom: "6px" }}>
                {t.dropTitle}
              </h3>
              <p style={{ color: "#64748b", fontSize: "13.5px", fontWeight: "600", margin: 0 }}>
                {t.dropHint}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", paddingBottom: "25px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", textTransform: "uppercase" }}>{t.activeFile}</span>
                  <h3 style={{ fontSize: "19px", fontWeight: "900", color: "#0f111a", marginTop: "2px" }}>{file.name}</h3>
                </div>
                <button
                  onClick={() => { setFile(null); setColumns([]); setItemsData([]); }}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
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

              {/* COLUMN MAPPINGS */}
              {columns.length > 0 && (
                <div style={{ marginTop: "25px" }}>
                  <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#0f111a", marginBottom: "18px" }}>
                    {t.settingsTitle}
                  </h4>

                  {/* NAME COLUMN SELECTOR */}
                  <div style={{ marginBottom: "22px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                      {t.nameColLabel}
                    </label>
                    <select
                      value={nameCol}
                      onChange={(e) => handleNameColChange(Number(e.target.value))}
                      style={{
                        width: "100%",
                        maxWidth: "420px",
                        background: "#ffffff",
                        color: "#0f111a",
                        padding: "12px 18px",
                        borderRadius: "14px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "14px",
                        fontWeight: "700",
                        outline: "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
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
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "10px" }}>
                      {t.urlColsLabel}
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {columns.map((col, idx) => {
                        const isSelected = selectedUrlCols.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleUrlColToggle(idx)}
                            style={{
                              background: isSelected ? "#2563eb" : "#f1f5f9",
                              color: isSelected ? "#ffffff" : "#475569",
                              border: isSelected ? "1px solid #2563eb" : "1px solid #e2e8f0",
                              padding: "8px 16px",
                              borderRadius: "14px",
                              fontSize: "13px",
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
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        {isProcessing && (
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "28px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
              border: "1.5px solid #93c5fd",
              marginBottom: "30px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb" }}>{t.processing}</span>
              <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f111a" }}>{progressPercent}%</span>
            </div>

            <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "#2563eb", transition: "width 0.2s ease" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "13.5px", fontWeight: "600" }}>
              <span>{currentProgressText}</span>
              {downloadStats && (
                <span>{downloadStats.downloaded} / {downloadStats.total}</span>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {isFinished && downloadStats && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1.5px solid #6ee7b7",
              borderRadius: "28px",
              padding: "24px 30px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: "900", color: "#065f46" }}>{t.finishedTitle}</h4>
              <p style={{ color: "#047857", fontSize: "14px", marginTop: "2px", fontWeight: "600" }}>
                {downloadStats.downloaded} files packaged into ZIP.
              </p>
            </div>

            <button
              onClick={handleStartDownload}
              style={{
                background: "#059669",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
              }}
            >
              {t.downloadAgain}
            </button>
          </div>
        )}

        {/* ITEMS PREVIEW & ACTION TABLE */}
        {itemsData.length > 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: isDesktop ? "35px 40px" : "25px 20px",
              borderRadius: "28px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(15, 17, 26, 0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f111a" }}>{t.previewTitle}</h3>
                <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
                  {t.totalItems} <strong style={{ color: "#0f111a" }}>{itemsData.length}</strong> • {t.totalImages} <strong style={{ color: "#2563eb" }}>{totalExtractedImages}</strong>
                </span>
              </div>

              <button
                disabled={isProcessing || totalExtractedImages === 0}
                onClick={handleStartDownload}
                style={{
                  background: isProcessing ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                  padding: "14px 34px",
                  borderRadius: "50px",
                  fontSize: "15px",
                  fontWeight: "800",
                  border: "none",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 25px rgba(37, 99, 235, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                {isProcessing ? t.processing : t.startBtn}
              </button>
            </div>

            {/* FULL SCROLLABLE TABLE WITH ALL ROWS */}
            <div style={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "AR" ? "right" : "left", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "800" }}>
                      <th style={{ padding: "14px 18px", width: "60px" }}>{t.colIndex}</th>
                      <th style={{ padding: "14px 18px" }}>{t.colName}</th>
                      <th style={{ padding: "14px 18px", width: "110px" }}>{t.colCount}</th>
                      <th style={{ padding: "14px 18px" }}>{t.colUrls}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsData.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fcfcfd" }}>
                        <td style={{ padding: "12px 18px", color: "#94a3b8", fontWeight: "700" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 18px", color: "#0f111a", fontWeight: "800" }}>{item.name}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "800" }}>
                            {item.urls.length}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", color: "#64748b", maxWidth: "420px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.urls.join(" , ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13.5px",
          fontWeight: "600",
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(15, 17, 26, 0.08)",
          position: "relative",
          zIndex: 20,
        }}
      >
        <span>© {new Date().getFullYear()} {t.brandName}. All rights reserved.</span>
      </footer>

      {/* CLIENT DRAWER MODAL */}
      {isClientDrawerOpen && (
        <div
          className="awsmd-drawer-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "rgba(15, 17, 26, 0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            opacity: isClientDrawerActive ? 1 : 0,
            transition: "opacity 0.45s ease",
            display: "flex",
            justifyContent: lang === "AR" ? "flex-end" : "flex-start",
          }}
          onClick={closeClientDrawer}
        >
          <div
            className={
              lang === "AR"
                ? (isClientDrawerClosing ? "awsmd-drawer-panel-ar awsmd-drawer-panel-ar-exit" : "awsmd-drawer-panel-ar")
                : (isClientDrawerClosing ? "awsmd-drawer-panel-en awsmd-drawer-panel-en-exit" : "awsmd-drawer-panel-en")
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              height: "100%",
              background: "#ffffff",
              boxShadow: "-10px 0 50px rgba(0,0,0,0.15)",
              padding: isDesktop ? "45px 40px" : "30px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#0f111a" }}>{t.drawerTitle}</h3>
                <button
                  onClick={closeClientDrawer}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    fontSize: "18px",
                    fontWeight: "900",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "30px" }}>
                {t.drawerSubtitle}
              </p>

              {formSubmitted ? (
                <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: "16px", padding: "20px", color: "#065f46", fontWeight: "800", textAlign: "center" }}>
                  {t.submittedSuccess}
                </div>
              ) : (
                <form onSubmit={handleDrawerFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>{t.nameLabel}</label>
                    <input required name="client_name" type="text" placeholder="Haider" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>{t.emailLabel}</label>
                    <input required name="client_email" type="email" placeholder="haider@example.com" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>{t.projectLabel}</label>
                    <textarea required name="project_details" rows={4} placeholder="..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "14px", resize: "none" }} />
                  </div>
                  <button type="submit" style={{ background: "#2563eb", color: "#ffffff", padding: "14px", borderRadius: "50px", fontSize: "15px", fontWeight: "900", border: "none", cursor: "pointer", marginTop: "10px" }}>
                    {t.submitBtn}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
