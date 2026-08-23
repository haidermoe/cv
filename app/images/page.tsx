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

  // Operation Mode: "download" (From Excel) | "upload" (Images to Links & Excel)
  const [mode, setMode] = useState<"download" | "upload">("download");
  const [isMorphing, setIsMorphing] = useState(false);
  const activeColor = mode === "download" ? "#2563eb" : "#dc2626";
  const activeGlow = mode === "download" ? "0 12px 35px rgba(37, 99, 235, 0.35)" : "0 12px 35px rgba(220, 38, 38, 0.35)";

  const switchMode = (newMode: "download" | "upload") => {
    if (newMode === mode) return;
    setIsMorphing(true);
    setMode(newMode);
    setTimeout(() => setIsMorphing(false), 520);
  };

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

  // --- MODE 1: DOWNLOAD FROM EXCEL STATES ---
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [nameCol, setNameCol] = useState<number>(0);
  const [selectedUrlCols, setSelectedUrlCols] = useState<number[]>([]);
  const [itemsData, setItemsData] = useState<{ name: string; urls: string[] }[]>([]);
  
  // Progress states for download
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentProgressText, setCurrentProgressText] = useState("");
  const [downloadStats, setDownloadStats] = useState<{ total: number; downloaded: number; failed: number } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // --- MODE 2: UPLOAD IMAGES TO LINKS STATES ---
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadedResults, setUploadedResults] = useState<{ name: string; url: string; direct_url: string; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadText, setCurrentUploadText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

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
        _subject: "طلب عمل جديد من صفحة أداة الصور!",
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
      titleDownload: "أداة تنزيل وتسمية الصور من الإكسل (Image Downloader)",
      subtitleDownload: "منظومة سريعة لمعالجة ملفات الإكسل وسحب روابط الصور وتنزيلها وتسميتها بأسماء المنتجات وضغطها بملف ZIP تلقائياً",
      titleUpload: "أداة رفع الصور وتوليد روابط الإكسل (Image to URL & Excel)",
      subtitleUpload: "رفع سريع ومباشر للصور إلى السحابة، وتوليد روابط إنترنت مباشرة وفورية وتصديرها بملف Excel بضغطة زر",
      modeDownload: "وضع تنزيل الصور من الإكسل (Download Mode)",
      modeUpload: "وضع رفع الصور وتوليد الروابط (Upload to Links Mode)",
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
      dropImagesTitle: "اختر أو اسحب الصور المراد رفعها إلى هنا",
      dropImagesHint: "يدعم صيغ JPG, PNG, WEBP, GIF, SVG - اسحب حتى مئات الصور دفعة واحدة",
      selectedImagesCount: "عدد الصور المحددة:",
      totalUploadSize: "الحجم الإجمالي:",
      startUploadBtn: "بدء رفع الصور وتوليد الروابط",
      uploading: "جاري رفع الصور إلى السحابة بالتوازي...",
      uploadSuccessTitle: "تم رفع جميع الصور وتوليد الروابط بنجاح!",
      copyAllBtn: "نسخ جميع الروابط",
      copiedAllMsg: "تم نسخ كافة الروابط!",
      exportExcelBtn: "تصدير وتنزيل ملف Excel",
      uploadResultsTitle: "روابط الصور المرفوعة",
      colThumb: "المعاينة",
      colDirectUrl: "الرابط المباشر",
      colCopy: "نسخ",
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
      titleDownload: "Bulk Excel Image Downloader & Renamer",
      subtitleDownload: "High-speed engine to parse Excel catalogs, download product images concurrently, rename them automatically, and package into a ZIP archive",
      titleUpload: "Bulk Image Uploader & Excel Link Generator",
      subtitleUpload: "Fast cloud upload engine to convert your product images into direct CDN URLs and export ready Excel spreadsheets instantly",
      modeDownload: "Download Mode (From Excel)",
      modeUpload: "Upload Mode (Images to Links)",
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
      dropImagesTitle: "Select or drop image files here",
      dropImagesHint: "Supports JPG, PNG, WEBP, GIF, SVG - drop hundreds of images at once",
      selectedImagesCount: "Selected Images:",
      totalUploadSize: "Total Size:",
      startUploadBtn: "Start Upload & Generate Links",
      uploading: "Uploading images concurrently to cloud...",
      uploadSuccessTitle: "All Images Uploaded & Links Generated Successfully!",
      copyAllBtn: "Copy All URLs",
      copiedAllMsg: "All URLs Copied!",
      exportExcelBtn: "Download Excel Spreadsheet",
      uploadResultsTitle: "Uploaded Image Links",
      colThumb: "Preview",
      colDirectUrl: "Direct CDN URL",
      colCopy: "Copy",
      drawerTitle: "Hey! Tell us all the things",
      drawerSubtitle: "We’d love to hear about your project and build something amazing together.",
      nameLabel: "Name & Company",
      emailLabel: "Your Email",
      projectLabel: "Project Details",
      submitBtn: "Submit Request",
      submittedSuccess: "Request Submitted Successfully! We will contact you soon.",
    }
  }[lang];

  // --- MODE 1: EXCEL PARSING HANDLERS ---
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsFinished(false);
    setDownloadStats(null);
    setProgressPercent(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (json.length > 0) {
        const rawHeaders = json[0] || [];
        const headerStrings = rawHeaders.map((h, i) => (h ? String(h).trim() : `Column ${i + 1}`));
        setColumns(headerStrings);

        // Auto-detect name column
        let foundNameIdx = 0;
        const nameKeywords = ["name", "product", "item", "title", "sku", "اسم", "المنتج", "العنصر", "المادة"];
        for (let i = 0; i < headerStrings.length; i++) {
          const lower = headerStrings[i].toLowerCase();
          if (nameKeywords.some(k => lower.includes(k))) {
            foundNameIdx = i;
            break;
          }
        }
        setNameCol(foundNameIdx);

        // Auto-detect image URL columns
        const detectedUrlCols: number[] = [];
        const urlKeywords = ["image", "img", "photo", "pic", "link", "url", "صورة", "رابط", "صور"];
        for (let i = 0; i < headerStrings.length; i++) {
          if (i === foundNameIdx) continue;
          const lower = headerStrings[i].toLowerCase();
          if (urlKeywords.some(k => lower.includes(k))) {
            detectedUrlCols.push(i);
          }
        }

        if (detectedUrlCols.length === 0) {
          for (let i = 0; i < headerStrings.length; i++) {
            if (i !== foundNameIdx) {
              detectedUrlCols.push(i);
              break;
            }
          }
        }
        setSelectedUrlCols(detectedUrlCols);

        extractItems(json, foundNameIdx, detectedUrlCols);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const extractItems = (rows: any[][], nameIdx: number, urlIndices: number[]) => {
    const extracted: { name: string; urls: string[] }[] = [];
    const urlPattern = /(https?:\/\/[^\s,;"'<>]+)/gi;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawName = row[nameIdx] ? String(row[nameIdx]).trim() : `Item_${r}`;
      const foundUrls: string[] = [];

      urlIndices.forEach(colIdx => {
        const cellValue = row[colIdx];
        if (cellValue) {
          const strVal = String(cellValue).trim();
          const matches = strVal.match(urlPattern);
          if (matches) {
            matches.forEach(u => {
              if (!foundUrls.includes(u.trim())) {
                foundUrls.push(u.trim());
              }
            });
          } else if (strVal.startsWith("http://") || strVal.startsWith("https://")) {
            if (!foundUrls.includes(strVal)) {
              foundUrls.push(strVal);
            }
          }
        }
      });

      if (foundUrls.length > 0) {
        extracted.push({ name: rawName, urls: foundUrls });
      }
    }

    setItemsData(extracted);
  };

  const handleNameColChange = (idx: number) => {
    setNameCol(idx);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        extractItems(json, idx, selectedUrlCols);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUrlColToggle = (idx: number) => {
    let updated: number[];
    if (selectedUrlCols.includes(idx)) {
      updated = selectedUrlCols.filter(i => i !== idx);
    } else {
      updated = [...selectedUrlCols, idx];
    }
    setSelectedUrlCols(updated);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        extractItems(json, nameCol, updated);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleStartDownload = async () => {
    if (itemsData.length === 0) return;

    setIsProcessing(true);
    setIsFinished(false);
    setProgressPercent(0);
    setCurrentProgressText(lang === "AR" ? "بدء المعالجة وتنزيل الصور..." : "Initializing download workers...");

    const zip = new JSZip();
    const totalImagesCount = itemsData.reduce((acc, item) => acc + item.urls.length, 0);

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
      } catch {}

      try {
        const proxyRes = await fetch(`/api/images/proxy?url=${encodeURIComponent(url)}`);
        if (proxyRes.ok) {
          const buffer = await proxyRes.arrayBuffer();
          const contentType = proxyRes.headers.get("content-type") || "";
          return { buffer, contentType };
        }
      } catch {}

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

  // --- MODE 2: UPLOAD IMAGES HANDLERS ---
  const handleUploadFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartBulkUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentUploadText(lang === "AR" ? "بدء الرفع السحابي..." : "Starting cloud uploads...");

    const results: { name: string; url: string; direct_url: string; size: number }[] = [];
    const totalCount = uploadFiles.length;
    let completedCount = 0;

    const concurrency = 4;
    let currentIndex = 0;

    const uploadWorker = async () => {
      while (currentIndex < uploadFiles.length) {
        const idx = currentIndex++;
        const currentFile = uploadFiles[idx];
        if (!currentFile) break;

        setCurrentUploadText(`${currentFile.name} (${idx + 1}/${totalCount})`);

        try {
          const form = new FormData();
          form.append("image", currentFile);

          const res = await fetch("/api/images/upload", {
            method: "POST",
            body: form,
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              results.push({
                name: currentFile.name,
                url: data.url,
                direct_url: data.direct_url || data.url,
                size: currentFile.size,
              });
            }
          } else {
            console.warn("Upload failed for:", currentFile.name);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }

        completedCount++;
        setUploadProgress(Math.round((completedCount / totalCount) * 100));
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, uploadFiles.length) }, () => uploadWorker());
    await Promise.all(workers);

    setUploadedResults(results);
    setIsUploading(false);
  };

  const handleCopySingleUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllUrls = () => {
    const allText = uploadedResults.map(r => r.direct_url).join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleExportUploadedExcel = () => {
    if (uploadedResults.length === 0) return;

    const header = [
      lang === "AR" ? "اسم الصورة / المنتج" : "Image / Product Name",
      lang === "AR" ? "الرابط المباشر للإنترنت (Direct URL)" : "Direct Image URL",
      lang === "AR" ? "حجم الملف (KB)" : "File Size (KB)"
    ];

    const dataRows = uploadedResults.map(item => [
      item.name,
      item.direct_url,
      Math.round(item.size / 1024)
    ]);

    const aoa = [header, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Uploaded_Images");
    XLSX.writeFile(wb, `Uploaded_Image_Links_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
        {/* ENLARGED DYNAMIC SIDE FILL & FLIP TEXT BUTTON */}
        <button
          onClick={openClientDrawer}
          className="awsmd-royal-client-btn"
          style={{
            ["--client-btn-gradient" as any]: mode === "upload" ? "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)" : "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
            ["--client-btn-color" as any]: activeColor,
            ["--client-btn-shadow" as any]: activeGlow,
          }}
        >
          <span className="flip-box">
            <span className="flip-wrapper">
              <span className="flip-text-primary">+ {t.becomeClient}</span>
              <span className="flip-text-secondary">+ {t.becomeClient}</span>
            </span>
          </span>
        </button>

        {/* DYNAMIC BORDERED LANGUAGE SELECTOR PILL */}
        <button
          onClick={handleLangSwitch}
          style={{
            background: "#ffffff",
            border: `1.5px solid ${activeColor}`,
            color: activeColor,
            padding: "8px 18px",
            borderRadius: "50px",
            fontSize: "13.5px",
            fontWeight: "800",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: `0 4px 15px ${mode === "upload" ? "rgba(220, 38, 38, 0.15)" : "rgba(37, 99, 235, 0.15)"}`,
            transition: "all 0.35s ease"
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
            letterSpacing: "-0.01em",
            transition: "color 0.3s ease"
          }}
        >
          <svg width="22" height="18" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#000000"/>
            <rect x="0" y="13" width="16" height="7" fill="#000000"/>
            <rect x="10" y="13" width="15" height="7" fill={activeColor} style={{ transition: "fill 0.3s ease" }}/>
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
          boxShadow: `0 15px 35px ${mode === "upload" ? "rgba(220, 38, 38, 0.12)" : "rgba(37, 99, 235, 0.12)"}`,
          border: `1.5px solid ${mode === "upload" ? "rgba(220, 38, 38, 0.25)" : "rgba(37, 99, 235, 0.2)"}`,
          transition: "all 0.35s ease"
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FlipLink href="/" color="#0f111a" hoverColor={activeColor}>{t.navHome}</FlipLink>
          <FlipLink href="/#stats" color="#475569" hoverColor={activeColor}>{t.navStats}</FlipLink>
          <FlipLink href="/#about" color="#475569" hoverColor={activeColor}>{t.navAbout}</FlipLink>
          <FlipLink href="/#experience" color="#475569" hoverColor={activeColor}>{t.navExperience}</FlipLink>
          <FlipLink href="/#tools" color="#475569" hoverColor={activeColor}>{t.navTools}</FlipLink>
          <FlipLink href="/#education" color="#475569" hoverColor={activeColor}>{t.navEducation}</FlipLink>
          <FlipLink href="/#contact" color="#475569" hoverColor={activeColor}>{t.navContact}</FlipLink>
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
        {/* HEADER TITLE & MODE SWITCHER CARD */}
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
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            {mode === "download" ? t.titleDownload : t.titleUpload}
          </h1>
          <p
            style={{
              fontSize: isDesktop ? "15px" : "13.5px",
              color: "#475569",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            {mode === "download" ? t.subtitleDownload : t.subtitleUpload}
          </p>

          {/* LIQUID GLASS SWITCHER (MATCHING TUTORIAL) */}
          <div
            className="liquid-glass-switcher-track"
            style={{
              marginBottom: mode === "download" ? "15px" : "0",
              width: "fit-content",
              minWidth: isDesktop ? "500px" : "100%",
            }}
          >
            {/* LIQUID GLASS SLIDING PILL WITH MORPH STRETCH */}
            <div
              className={isMorphing ? "liquid-glass-pill morphing" : "liquid-glass-pill"}
              style={{
                left: lang === "AR" ? "auto" : "6px",
                right: lang === "AR" ? "6px" : "auto",
                background: mode === "download"
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: mode === "download"
                  ? "0 10px 25px rgba(37, 99, 235, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px rgba(0, 0, 0, 0.15)"
                  : "0 10px 25px rgba(220, 38, 38, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px rgba(0, 0, 0, 0.15)",
                transform: mode === "download"
                  ? "translateX(0%)"
                  : (lang === "AR" ? "translateX(-100%)" : "translateX(100%)"),
              }}
            />

            <button
              onClick={() => switchMode("download")}
              style={{
                position: "relative",
                zIndex: 2,
                background: "transparent",
                color: mode === "download" ? "#ffffff" : "#334155",
                border: "none",
                padding: "11px 24px",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "color 0.25s ease",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {t.modeDownload}
            </button>
            <button
              onClick={() => switchMode("upload")}
              style={{
                position: "relative",
                zIndex: 2,
                background: "transparent",
                color: mode === "upload" ? "#ffffff" : "#334155",
                border: "none",
                padding: "11px 24px",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "color 0.25s ease",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {t.modeUpload}
            </button>
          </div>

          {mode === "download" && (
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={handleDownloadSample}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  color: "#2563eb",
                  padding: "7px 18px",
                  borderRadius: "50px",
                  fontSize: "12.5px",
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
          )}
        </div>

        {/* --- MODE 1 CONTENT: DOWNLOAD FROM EXCEL --- */}
        {mode === "download" && (
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
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isSelected ? "✓ " : ""}{col}
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
        )}

        {/* --- MODE 2 CONTENT: UPLOAD IMAGES TO LINKS --- */}
        {mode === "upload" && (
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
            <label
              style={{
                background: "#fef2f2",
                border: "2px dashed #fca5a5",
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
                multiple
                accept="image/*"
                onChange={(e) => handleUploadFilesSelected(e.target.files)}
                style={{ display: "none" }}
              />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <h3 style={{ fontSize: isDesktop ? "18px" : "15.5px", fontWeight: "800", color: "#0f111a", margin: 0 }}>
                {t.dropImagesTitle}
              </h3>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                {t.dropImagesHint}
              </span>
            </label>

            {/* SELECTED FILES SUMMARY & ACTION */}
            {uploadFiles.length > 0 && (
              <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#dc2626" }}>
                      {t.selectedImagesCount} {uploadFiles.length}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", marginInlineStart: "12px" }}>
                      ({t.totalUploadSize} {(uploadFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    onClick={() => { setUploadFiles([]); setUploadedResults([]); }}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fca5a5",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {lang === "AR" ? "إلغاء وتفريغ القائمة" : "Clear List"}
                  </button>
                </div>

                {/* START UPLOAD BUTTON */}
                {!isUploading && uploadedResults.length === 0 && (
                  <button
                    onClick={handleStartBulkUpload}
                    style={{
                      width: "100%",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      padding: "16px",
                      borderRadius: "18px",
                      fontSize: "16px",
                      fontWeight: "900",
                      cursor: "pointer",
                      boxShadow: "0 10px 25px rgba(220, 38, 38, 0.35)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {t.startUploadBtn} ({uploadFiles.length})
                  </button>
                )}

                {/* UPLOADING PROGRESS BAR */}
                {isUploading && (
                  <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", marginTop: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", marginBottom: "8px" }}>
                      <span style={{ color: "#dc2626" }}>{t.uploading}</span>
                      <span style={{ color: "#0f111a" }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${uploadProgress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #dc2626, #ef4444)",
                          borderRadius: "10px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginTop: "8px", margin: 0 }}>
                      {currentUploadText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- MODE 2: UPLOADED RESULTS TABLE & EXPORT --- */}
        {mode === "upload" && uploadedResults.length > 0 && (
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
            {/* SUCCESS BANNER & ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "25px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#dc2626", margin: 0 }}>
                  ✓ {t.uploadSuccessTitle}
                </h3>
                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#475569", marginTop: "4px", display: "block" }}>
                  {lang === "AR" ? `تم رفع ${uploadedResults.length} صورة بنجاح والحصول على روابط مباشرة` : `Successfully uploaded ${uploadedResults.length} images`}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCopyAllUrls}
                  style={{
                    background: copiedAll ? "#dc2626" : "#f1f5f9",
                    color: copiedAll ? "#ffffff" : "#0f111a",
                    border: "1px solid #cbd5e1",
                    padding: "10px 20px",
                    borderRadius: "50px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {copiedAll ? t.copiedAllMsg : t.copyAllBtn}
                </button>

                <button
                  onClick={handleExportUploadedExcel}
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "50px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(220, 38, 38, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.exportExcelBtn}
                </button>
              </div>
            </div>

            {/* RESULTS TABLE */}
            <div style={{ overflowX: "auto", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "AR" ? "right" : "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colIndex}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colThumb}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colName}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colDirectUrl}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800", textAlign: "center" }}>{t.colCopy}</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedResults.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                      <td style={{ padding: "12px 18px", fontWeight: "700", color: "#94a3b8" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 18px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.direct_url}
                          alt={item.name}
                          style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: "800", color: "#0f111a" }}>{item.name}</td>
                      <td style={{ padding: "12px 18px", color: "#dc2626", fontWeight: "700", maxWidth: "380px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <a href={item.direct_url} target="_blank" rel="noopener noreferrer" style={{ color: "#dc2626", textDecoration: "none" }}>
                          {item.direct_url}
                        </a>
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "center" }}>
                        <button
                          onClick={() => handleCopySingleUrl(item.direct_url, idx)}
                          style={{
                            background: copiedIndex === idx ? "#dc2626" : "#f1f5f9",
                            color: copiedIndex === idx ? "#ffffff" : "#475569",
                            border: "1px solid #cbd5e1",
                            padding: "5px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {copiedIndex === idx ? (lang === "AR" ? "تم النسخ" : "Copied!") : (lang === "AR" ? "نسخ" : "Copy")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODE 1: DOWNLOAD PREVIEW & ACTION --- */}
        {mode === "download" && itemsData.length > 0 && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f111a", margin: 0 }}>
                  {t.previewTitle}
                </h3>
                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#475569", marginTop: "4px", display: "block" }}>
                  {t.totalItems} <strong style={{ color: "#2563eb" }}>{itemsData.length}</strong> | {t.totalImages} <strong style={{ color: "#2563eb" }}>{totalExtractedImages}</strong>
                </span>
              </div>

              {!isProcessing && !isFinished && (
                <button
                  onClick={handleStartDownload}
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: "50px",
                    fontSize: "15px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.35)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {t.startBtn} ({totalExtractedImages})
                </button>
              )}
            </div>

            {/* PROGRESS BAR */}
            {isProcessing && (
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", marginBottom: "8px" }}>
                  <span style={{ color: "#2563eb" }}>{t.processing}</span>
                  <span style={{ color: "#0f111a" }}>{progressPercent}%</span>
                </div>
                <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                      borderRadius: "10px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginTop: "8px", margin: 0 }}>
                  {currentProgressText}
                </p>
              </div>
            )}

            {/* FINISHED BANNER */}
            {isFinished && downloadStats && (
              <div style={{ background: "#f0fdf4", padding: "22px", borderRadius: "18px", border: "1px solid #bbf7d0", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#166534", margin: 0 }}>
                      ✓ {t.finishedTitle}
                    </h4>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#15803d", marginTop: "4px", display: "block" }}>
                      {lang === "AR"
                        ? `تم تنزيل ${downloadStats.downloaded} صورة بنجاح (فشل: ${downloadStats.failed}) من إجمالي ${downloadStats.total}`
                        : `Downloaded ${downloadStats.downloaded} images (${downloadStats.failed} failed) of ${downloadStats.total}`}
                    </span>
                  </div>
                  <button
                    onClick={handleStartDownload}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 22px",
                      borderRadius: "30px",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    {t.downloadAgain}
                  </button>
                </div>
              </div>
            )}

            {/* TABLE OF ITEMS (FULL DISPLAY) */}
            <div style={{ overflowX: "auto", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "AR" ? "right" : "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colIndex}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colName}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colCount}</th>
                    <th style={{ padding: "14px 18px", fontWeight: "800" }}>{t.colUrls}</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                      <td style={{ padding: "12px 18px", fontWeight: "700", color: "#94a3b8" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 18px", fontWeight: "800", color: "#0f111a" }}>{item.name}</td>
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
                <form onSubmit={handleDrawerFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                      {t.nameLabel} *
                    </label>
                    <input
                      required
                      type="text"
                      name="client_name"
                      placeholder={lang === "AR" ? "مثال: علي محمد - شركة النور" : "e.g. John Doe - Acme Corp"}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        fontSize: "14.5px",
                        fontWeight: "600",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                      {t.emailLabel} *
                    </label>
                    <input
                      required
                      type="email"
                      name="client_email"
                      placeholder="name@company.com"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        fontSize: "14.5px",
                        fontWeight: "600",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                      {t.projectLabel} *
                    </label>
                    <textarea
                      required
                      name="project_details"
                      rows={4}
                      placeholder={lang === "AR" ? "أخبرنا عن فكرة مشروعك والمهام المطلوبة..." : "Tell us about your project requirements..."}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        fontSize: "14.5px",
                        fontWeight: "600",
                        color: "#0f111a",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "16px",
                      background: activeColor,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "16px",
                      fontSize: "16px",
                      fontWeight: "900",
                      cursor: "pointer",
                      boxShadow: activeGlow,
                      transition: "transform 0.2s ease, background 0.3s ease",
                    }}
                  >
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
