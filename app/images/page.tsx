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

function sanitizeFilename(name: string): string {
  const clean = name.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, " ").trim();
  return clean.slice(0, 100) || "image";
}

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
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isNavMenuClosing, setIsNavMenuClosing] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const closeNavMenu = (targetHref?: string) => {
    setIsNavMenuClosing(true);
    setTimeout(() => {
      setIsNavMenuOpen(false);
      setIsNavMenuClosing(false);
      if (targetHref) {
        window.location.href = targetHref;
      }
    }, 750);
  };

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
        _subject: "طلب عمل جديد من صفحة أداة تنزيل الصور!",
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
      logo: "حيدر محمد",
      brandName: "حيدر محمد",
      navHome: "الرئيسية",
      navStats: "الإحصائيات والمهارات",
      navAbout: "النبذة",
      navExperience: "الخبرات",
      navTools: "الأدوات",
      navEducation: "التعليم",
      navContact: "تواصل معي",
      downloadCV: "تحميل ملف السيرة PDF",
      becomeClient: "كن عميلاً",
      title: "أداة تنزيل وتسمية الصور من الإكسل (Image Downloader)",
      subtitle: "منظومة سريعة لمعالجة ملفات الإكسل وسحب روابط الصور وتنزيلها وتسميتها بأسماء المنتجات وضغطها بملف ZIP تلقائياً",
      dropTitle: "اختر ملف الإكسل (Excel أو CSV) أو اسحبه إلى هنا",
      dropHint: "يدعم ملفات .xlsx, .xls, .csv بكافة الأحجام",
      activeFile: "الملف الحالي:",
      changeFile: "تغيير الملف",
      settingsTitle: "تحديد أعمدة الربط والتنزيل",
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
      logo: "Haider Mohamed",
      brandName: "Haider Mohamed",
      navHome: "Home",
      navStats: "Stats & Skills",
      navAbout: "About Us",
      navExperience: "Experience",
      navTools: "Tools",
      navEducation: "Education",
      navContact: "Contact Us",
      downloadCV: "Download PDF",
      becomeClient: "Become a Client",
      title: "Bulk Excel Image Downloader & Renamer",
      subtitle: "High-speed engine to parse Excel catalogs, download product images concurrently, rename them automatically, and package into a ZIP archive",
      dropTitle: "Click to select Excel/CSV file or drag & drop here",
      dropHint: "Supports .xlsx, .xls, .csv files of any size",
      activeFile: "Active File:",
      changeFile: "Change File",
      settingsTitle: "Select Key & URL Columns",
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

  const numToColStr = (n: number): string => {
    let s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % 26) + 65) + s;
      n = Math.floor(n / 26) - 1;
    }
    return s;
  };

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

      const nameKeywords = ["name", "title", "item", "sku", "product", "اسم", "عنوان", "منتج", "مادة"];
      let detectedNameIdx = 0;
      for (let i = 0; i < cols.length; i++) {
        if (nameKeywords.some(k => cols[i].toLowerCase().includes(k))) {
          detectedNameIdx = i;
          break;
        }
      }
      setNameCol(detectedNameIdx);

      const urlKeywords = ["url", "image", "img", "link", "photo", "pic", "صورة", "صوره", "رابط"];
      const detectedUrlCols: number[] = [];
      for (let i = 0; i < cols.length; i++) {
        if (urlKeywords.some(k => cols[i].toLowerCase().includes(k))) {
          detectedUrlCols.push(i);
        }
      }

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
        // Fallback
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

      {/* Top Fixed Floating Buttons (Top Right) */}
      <div
        className="awsmd-top-actions"
        style={{
          position: "fixed",
          top: "24px",
          right: "32px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          direction: "ltr"
        }}
      >
        {/* ENLARGED ROYAL BLUE SIDE FILL & FLIP TEXT BUTTON */}
        <button
          onClick={openClientDrawer}
          className="awsmd-royal-client-btn"
        >
          <span className="flip-box">
            <span className="flip-wrapper">
              <span className="flip-text-primary">+ {t.becomeClient}</span>
              <span className="flip-text-secondary">+ {t.becomeClient}</span>
            </span>
          </span>
        </button>

        {/* BORDERED LANGUAGE SELECTOR PILL */}
        <button
          onClick={handleLangSwitch}
          style={{
            background: "#ffffff",
            border: "1.5px solid #4f46e5",
            color: "#4f46e5",
            padding: "8px 18px",
            borderRadius: "50px",
            fontSize: "13.5px",
            fontWeight: "800",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease"
          }}
        >
          <span>{lang === "AR" ? "EN" : "عربي"}</span>
          <span style={{ fontSize: "10px", opacity: 0.8 }}>∨</span>
        </button>

        {/* GREY CIRCULAR MENU BUTTON */}
        <button
          onClick={() => setIsNavMenuOpen(true)}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "#e2e8f0",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.2s ease, background 0.2s ease"
          }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="2.5" rx="1.25" fill="#475569"/>
            <rect y="6.5" width="13" height="2.5" rx="1.25" fill="#475569"/>
          </svg>
        </button>
      </div>

      {/* INDEPENDENT FLOATING BRAND LOGO / NAME (TOP LEFT) */}
      <div
        style={{
          position: "fixed",
          top: "28px",
          left: "32px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "19px",
            fontWeight: "900",
            color: "#000000",
            textDecoration: "none",
            letterSpacing: "-0.01em"
          }}
        >
          <svg width="22" height="18" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#000000"/>
            <rect x="0" y="13" width="16" height="7" fill="#000000"/>
            <rect x="10" y="13" width="15" height="7" fill="#2563eb"/>
          </svg>
          <span>{t.logo}</span>
        </Link>
      </div>

      {/* Floating Pill Header Navigation (CENTER) */}
      <header
        className="desktop-header-nav"
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "24px",
          background: "#ffffff",
          padding: "8px 24px",
          borderRadius: "50px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
          border: "1px solid rgba(15, 17, 26, 0.08)"
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FlipLink href="/" color="#0f111a" hoverColor="#2563eb">{t.navHome}</FlipLink>
          <FlipLink href="/#stats" color="#475569" hoverColor="#2563eb">{t.navStats}</FlipLink>
          <FlipLink href="/#about" color="#475569" hoverColor="#2563eb">{t.navAbout}</FlipLink>
          <FlipLink href="/#experience" color="#475569" hoverColor="#2563eb">{t.navExperience}</FlipLink>
          <FlipLink href="/#tools" color="#475569" hoverColor="#2563eb">{t.navTools}</FlipLink>
          <FlipLink href="/#education" color="#475569" hoverColor="#2563eb">{t.navEducation}</FlipLink>
          <FlipLink href="/#contact" color="#475569" hoverColor="#2563eb">{t.navContact}</FlipLink>
        </nav>

        <a
          href="/HAIDER-MOHAMED-SHWKAT-CV.pdf"
          download="HAIDER-MOHAMED-SHWKAT-CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="awsmd-btn-glow"
          style={{
            background: "#0f111a",
            color: "#ffffff",
            padding: "8px 20px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "transform 0.3s ease, background 0.3s ease"
          }}
        >
          <span>{t.downloadCV}</span>
        </a>
      </header>

      {/* AWSMD FULLSCREEN NAVIGATION MENU OVERLAY (TWO BLUE PANELS) */}
      {(isNavMenuOpen || isNavMenuClosing) && (
        <React.Fragment>
          {/* DARK BLUE SIDEBAR COLUMN */}
          <div
            className={isNavMenuClosing ? "awsmd-col-dark awsmd-col-dark-exit" : "awsmd-col-dark"}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              width: "280px",
              height: "100vh",
              background: "#1d4ed8",
              zIndex: 3000,
              left: lang === "EN" ? 0 : "auto",
              right: lang === "AR" ? 0 : "auto",
              padding: "40px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRight: lang === "EN" ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderLeft: lang === "AR" ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="1" width="8" height="10" fill="#ffffff"/>
                <rect x="0" y="13" width="16" height="7" fill="#ffffff"/>
                <rect x="10" y="13" width="15" height="7" fill="rgba(255,255,255,0.7)"/>
              </svg>
              <span style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff" }}>{t.logo}</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ color: "#fbbf24", fontSize: "14px", fontWeight: "900", marginBottom: "6px" }}>★ 5.0 Gold Verified</div>
              <p style={{ color: "#ffffff", fontSize: "13px", lineHeight: "1.5", fontWeight: "600", opacity: 0.9 }}>
                {lang === "AR" ? "تصميم ومشاريع برمجية استثنائية." : "Awesome portfolio for awesome business."}
              </p>
            </div>
          </div>

          {/* LIGHT COBALT BLUE MAIN PANEL */}
          <div
            className={isNavMenuClosing ? "awsmd-col-light awsmd-col-light-exit" : "awsmd-col-light"}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              width: "calc(100vw - 280px)",
              height: "100vh",
              background: "#2563eb",
              zIndex: 3000,
              left: lang === "EN" ? "280px" : 0,
              right: lang === "AR" ? "280px" : 0
            }}
          ></div>

          {/* MAIN MENU CONTENT */}
          <div
            className={isNavMenuClosing ? "awsmd-nav-content awsmd-nav-content-exit" : "awsmd-nav-content"}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              width: "calc(100vw - 280px)",
              height: "100vh",
              color: "#ffffff",
              zIndex: 3001,
              left: lang === "EN" ? "280px" : 0,
              right: lang === "AR" ? "280px" : 0,
              padding: "40px 60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto",
              fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
            }}
          >
            {/* TOP HEADER BAR */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="7" y="1" width="8" height="10" fill="#ffffff"/>
                  <rect x="0" y="13" width="16" height="7" fill="#ffffff"/>
                  <rect x="10" y="13" width="15" height="7" fill="rgba(255,255,255,0.7)"/>
                </svg>
                <span style={{ fontSize: "20px", fontWeight: "900" }}>{t.logo}</span>
              </div>

              <span style={{ fontSize: "14px", fontWeight: "700", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>
                {lang === "AR" ? "التصفح والشرائح" : "Navigation"}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <button
                  onClick={() => { closeNavMenu(); openClientDrawer(); }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "none",
                    color: "#ffffff",
                    padding: "8px 20px",
                    borderRadius: "50px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  + {t.becomeClient}
                </button>

                <button
                  onClick={() => closeNavMenu()}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: "900",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MAIN HUGE DISPLAY MENU LIST */}
            <div style={{ margin: "50px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { num: "01", label: t.navHome, href: "/" },
                { num: "02", label: t.navStats, href: "/#stats" },
                { num: "03", label: t.navAbout, href: "/#about" },
                { num: "04", label: t.navExperience, href: "/#experience" },
                { num: "05", label: t.navTools, href: "/#tools" },
                { num: "06", label: t.navEducation, href: "/#education" },
                { num: "07", label: t.navContact, href: "/#contact" }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); closeNavMenu(item.href); }}
                  className="awsmd-nav-item"
                  style={{
                    fontSize: "clamp(36px, 5vw, 68px)",
                    fontWeight: "900",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: "20px",
                    lineHeight: "1.0",
                    width: "fit-content",
                    animationDelay: `${index * 45 + 300}ms`
                  }}
                >
                  <span>{item.label}</span>
                  <sup style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)", fontWeight: "800" }}>{item.num}</sup>
                </a>
              ))}
            </div>

            {/* FOOTER INFO */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "25px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "14px", opacity: 0.8, display: "block", marginBottom: "4px" }}>
                  {lang === "AR" ? "البريد الإلكتروني المباشر" : "Direct Email"}
                </span>
                <a href="mailto:haider.m.shwkat@outlook.com" style={{ color: "#ffffff", fontSize: "18px", fontWeight: "800", textDecoration: "none" }}>
                  haider.m.shwkat@outlook.com
                </a>
              </div>

              <a
                href="/HAIDER-MOHAMED-SHWKAT-CV.pdf"
                download="HAIDER-MOHAMED-SHWKAT-CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#0f111a",
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "800",
                  textDecoration: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}
              >
                {t.downloadCV}
              </a>
            </div>
          </div>
        </React.Fragment>
      )}

      {/* MAIN TOOL CONTENT */}
      <main
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "90px",
          paddingBottom: "40px",
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
              fontSize: isDesktop ? "38px" : "26px",
              fontWeight: "900",
              color: "#0f111a",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: isDesktop ? "15px" : "13.5px",
              color: "#475569",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            {t.subtitle}
          </p>

          <button
            onClick={handleDownloadSample}
            style={{
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#2563eb",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t.downloadSample}
          </button>
        </div>

        {/* UPLOAD & SETTINGS CARD */}
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
            <label
              style={{
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: "24px",
                padding: isDesktop ? "50px 30px" : "35px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                style={{ display: "none" }}
              />
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3 style={{ fontSize: isDesktop ? "18px" : "15.5px", fontWeight: "800", color: "#0f111a", margin: 0 }}>
                {t.dropTitle}
              </h3>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                {t.dropHint}
              </span>
            </label>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", paddingBottom: "22px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", textTransform: "uppercase" }}>{t.activeFile}</span>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f111a", marginTop: "2px" }}>{file.name}</h3>
                </div>
                <button
                  onClick={() => { setFile(null); setColumns([]); setItemsData([]); }}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    padding: "7px 16px",
                    borderRadius: "30px",
                    fontSize: "12.5px",
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
                  <h4 style={{ fontSize: "17px", fontWeight: "900", color: "#0f111a", marginBottom: "16px" }}>
                    {t.settingsTitle}
                  </h4>

                  {/* NAME COLUMN SELECTOR */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                      {t.nameColLabel}
                    </label>
                    <select
                      value={nameCol}
                      onChange={(e) => handleNameColChange(Number(e.target.value))}
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        background: "#f8fafc",
                        color: "#0f111a",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: "1px solid #cbd5e1",
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
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", color: "#334155", marginBottom: "10px" }}>
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
              padding: "26px 30px",
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
              border: "1.5px solid #93c5fd",
              marginBottom: "30px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "15.5px", fontWeight: "800", color: "#2563eb" }}>{t.processing}</span>
              <span style={{ fontSize: "17px", fontWeight: "900", color: "#0f111a" }}>{progressPercent}%</span>
            </div>

            <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "10px" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "#2563eb", transition: "width 0.2s ease" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
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
              borderRadius: "24px",
              padding: "22px 30px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h4 style={{ fontSize: "17.5px", fontWeight: "900", color: "#065f46" }}>{t.finishedTitle}</h4>
              <p style={{ color: "#047857", fontSize: "13.5px", marginTop: "2px", fontWeight: "600" }}>
                {downloadStats.downloaded} files packaged into ZIP.
              </p>
            </div>

            <button
              onClick={handleStartDownload}
              style={{
                background: "#059669",
                color: "#ffffff",
                padding: "9px 22px",
                borderRadius: "30px",
                fontSize: "13.5px",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ fontSize: "19px", fontWeight: "900", color: "#0f111a" }}>{t.previewTitle}</h3>
                <span style={{ color: "#64748b", fontSize: "13.5px", fontWeight: "600" }}>
                  {t.totalItems} <strong style={{ color: "#0f111a" }}>{itemsData.length}</strong> • {t.totalImages} <strong style={{ color: "#2563eb" }}>{totalExtractedImages}</strong>
                </span>
              </div>

              <button
                disabled={isProcessing || totalExtractedImages === 0}
                onClick={handleStartDownload}
                style={{
                  background: isProcessing ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                  padding: "13px 32px",
                  borderRadius: "50px",
                  fontSize: "14.5px",
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
              <div style={{ maxHeight: "480px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "AR" ? "right" : "left", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "800" }}>
                      <th style={{ padding: "13px 18px", width: "60px" }}>{t.colIndex}</th>
                      <th style={{ padding: "13px 18px" }}>{t.colName}</th>
                      <th style={{ padding: "13px 18px", width: "110px" }}>{t.colCount}</th>
                      <th style={{ padding: "13px 18px" }}>{t.colUrls}</th>
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

      {/* EXACT AWSMD CLIENT DRAWER MODAL MATCHING TEKNO & HOME */}
      {isClientDrawerOpen && (
        <div
          className="awsmd-drawer-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 2000,
            display: "flex",
            justifyContent: lang === "AR" ? "flex-end" : "flex-start",
            opacity: isClientDrawerClosing ? 0 : 1,
            transition: "opacity 0.45s ease",
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
              position: "fixed",
              top: 0,
              right: lang === "AR" ? 0 : "auto",
              left: lang === "EN" ? 0 : "auto",
              width: "480px",
              height: "100vh",
              background: "#ffffff",
              color: "#0f111a",
              padding: "50px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: lang === "AR" ? "-20px 0 60px rgba(0,0,0,0.2)" : "20px 0 60px rgba(0,0,0,0.2)",
              overflowY: "auto",
              fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0f111a", letterSpacing: "-0.5px" }}>
                    {t.drawerTitle}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "14.5px", marginTop: "8px", lineHeight: "1.5", fontWeight: "500" }}>
                    {t.drawerSubtitle}
                  </p>
                </div>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              {formSubmitted ? (
                <div style={{ padding: "35px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0", marginTop: "30px" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#166534" }}>
                    {lang === "AR" ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
                  </h3>
                  <p style={{ color: "#15803d", fontSize: "15px", marginTop: "6px", fontWeight: "600" }}>
                    {lang === "AR" ? "سنقوم بالتواصل معك في أسرع وقت ممكن." : "We will get back to you as soon as possible."}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleDrawerFormSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "18px" }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {t.nameLabel}
                    </label>
                    <input
                      required
                      type="text"
                      name="client_name"
                      placeholder={lang === "AR" ? "حيدر من تكنو ستور" : "Haider from Techno Store"}
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {t.emailLabel}
                    </label>
                    <input
                      required
                      type="email"
                      name="client_email"
                      placeholder="haider@example.com"
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {t.projectLabel}
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="project_details"
                      placeholder={lang === "AR" ? "اكتب تفاصيل مشروعك أو فكرتك المميزة هنا..." : "Write your project details or great ideas here..."}
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                        resize: "none",
                      }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "6px" }}>
                    <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "700" }}>
                      haider.m.shwkat@outlook.com
                    </span>

                    <button
                      type="submit"
                      className="awsmd-btn-glow"
                      style={{
                        background: "#0f111a",
                        color: "#ffffff",
                        padding: "12px 24px",
                        borderRadius: "50px",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{t.submitBtn}</span>
                      <span style={{ fontSize: "16px" }}>←</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
