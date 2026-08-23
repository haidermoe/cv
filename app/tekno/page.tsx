"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

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

// Client-side Fallback Header Parser (0ms instant)
const parseHeadersClientSide = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return [];
    const ws = wb.Sheets[firstSheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const firstRow = data[0] || [];

    const numToColStr = (n: number): string => {
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };

    return firstRow.map((val, idx) => {
      const colLetter = numToColStr(idx);
      const strVal = String(val).trim();
      return strVal ? `${colLetter} (${strVal})` : `${colLetter}`;
    });
  } catch (err) {
    return [];
  }
};

export default function TeknoPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Language ripple state
  const [isLangAnimating, setIsLangAnimating] = useState(false);
  const [langOrigin, setLangOrigin] = useState({ x: 0, y: 0 });
  const [circleActive, setCircleActive] = useState(false);

  // Client Drawer Tab State (+ كُن عميلاً) with smooth enter/exit animation states
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

  // Operation Mode: "compare" | "pull"
  const [mode, setMode] = useState<"compare" | "pull">("compare");

  // Dynamic Theme Colors based on selected mode
  const activeColor = mode === "pull" ? "#16a34a" : "#2563eb";
  const activeGlow = mode === "pull" ? "0 12px 35px rgba(22, 163, 74, 0.35)" : "0 12px 35px rgba(37, 99, 235, 0.35)";

  // File states
  const [fileOld, setFileOld] = useState<File | null>(null);
  const [fileNew, setFileNew] = useState<File | null>(null);
  const [fileRef, setFileRef] = useState<File | null>(null);

  // Column Headers state
  const [oldHeaders, setOldHeaders] = useState<string[]>([]);
  const [newHeaders, setNewHeaders] = useState<string[]>([]);

  // Selected Columns
  const [keyColOld, setKeyColOld] = useState<string>("");
  const [keyColNew, setKeyColNew] = useState<string>("");
  const [compColOld, setCompColOld] = useState<string>("Compare All Columns");
  const [compColNew, setCompColNew] = useState<string>("Compare All Columns");
  const [newColName, setNewColName] = useState<string>("المخزون الساحب");

  // Options
  const [ignorePunct, setIgnorePunct] = useState(true);
  const [enableFuzzy, setEnableFuzzy] = useState(true);
  const [simThresh, setSimThresh] = useState<number>(70);
  const [filterKeywords, setFilterKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCheckDesktop = () => setIsDesktop(window.innerWidth > 960);
    handleCheckDesktop();
    window.addEventListener("resize", handleCheckDesktop);
    return () => window.removeEventListener("resize", handleCheckDesktop);
  }, []);

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.ok) {
          setFormSubmitted(true);
        } else {
          form.submit();
        }
      })
      .catch(() => {
        form.submit();
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

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.025;
      currentY += (targetY - currentY) * 0.025;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Fetch headers for Old File
  useEffect(() => {
    if (!fileOld) {
      setOldHeaders([]);
      setKeyColOld("");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileOld);

    const applyHeaders = (headers: string[]) => {
      if (headers && headers.length > 0) {
        setOldHeaders(headers);
        const defaultKey = headers.find((h: string) => h.toLowerCase().includes("sku") || h.startsWith("C ")) || headers[0];
        setKeyColOld(defaultKey);

        const defaultComp = headers.find((h: string) => h.toLowerCase().includes("qty") || h.toLowerCase().includes("رصيد") || h.startsWith("E ")) || "Compare All Columns";
        setCompColOld(defaultComp);
      }
    };

    fetch("/api/headers", { method: "POST", body: formData })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data.headers && data.headers.length > 0) {
          applyHeaders(data.headers);
        } else {
          parseHeadersClientSide(fileOld).then(applyHeaders);
        }
      })
      .catch(() => {
        parseHeadersClientSide(fileOld).then(applyHeaders);
      });
  }, [fileOld]);

  // Fetch headers for New File
  useEffect(() => {
    if (!fileNew) {
      setNewHeaders([]);
      setKeyColNew("");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileNew);

    const applyHeaders = (headers: string[]) => {
      if (headers && headers.length > 0) {
        setNewHeaders(headers);
        const defaultKey = headers.find((h: string) => h.includes("الاسم") || h.toLowerCase().includes("name") || h.startsWith("C ")) || headers[0];
        setKeyColNew(defaultKey);

        const defaultComp = headers.find((h: string) => h.includes("الرصيد") || h.toLowerCase().includes("qty") || h.startsWith("D ")) || "Compare All Columns";
        setCompColNew(defaultComp);
      }
    };

    fetch("/api/headers", { method: "POST", body: formData })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data.headers && data.headers.length > 0) {
          applyHeaders(data.headers);
        } else {
          parseHeadersClientSide(fileNew).then(applyHeaders);
        }
      })
      .catch(() => {
        parseHeadersClientSide(fileNew).then(applyHeaders);
      });
  }, [fileNew]);

  const handleProcessFiles = async () => {
    if (!fileOld || !fileNew) {
      setErrorMessage(lang === "AR" ? "يرجى تحديد ملف الموقع وملف المخزن للبدء" : "Please select website file and warehouse file to start");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setLoadingStep(lang === "AR" ? "جاري رفع وتدقيق الملفات..." : "Uploading and validating files...");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file_old", fileOld);
      formData.append("file_new", fileNew);
      if (fileRef) formData.append("file_ref", fileRef);

      formData.append("mode", mode);
      formData.append("key_col_old", keyColOld);
      formData.append("key_col_new", keyColNew);
      formData.append("comp_col_old", compColOld);
      formData.append("comp_col_new", compColNew);
      formData.append("new_col_name", newColName);

      formData.append("ignore_punct", String(ignorePunct));
      formData.append("similarity_threshold", String(enableFuzzy ? simThresh : 101));
      formData.append("filter_keywords", filterKeywords);

      setTimeout(() => {
        setLoadingStep(lang === "AR" ? "جاري تحليل البيانات ومطابقة السجلات..." : "Analyzing data & matching records...");
      }, 1500);

      const res = await fetch("/api/compare", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "حدث خطأ أثناء معالجة البيانات");
      }

      setLoadingStep(lang === "AR" ? "اكتملت المعالجة. جاري تنزيل التقرير النهائي..." : "Processing complete. Downloading final report...");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Tekno_Data_Report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء معالجة البيانات");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div
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
            ["--client-btn-gradient" as any]: mode === "pull" ? "linear-gradient(90deg, #16a34a 0%, #15803d 100%)" : "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
            ["--client-btn-color" as any]: activeColor,
            ["--client-btn-shadow" as any]: mode === "pull" ? "rgba(22, 163, 74, 0.4)" : "rgba(37, 99, 235, 0.4)",
          }}
        >
          <span className="flip-box">
            <span className="flip-wrapper">
              <span className="flip-text-primary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
              <span className="flip-text-secondary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
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
            boxShadow: `0 4px 15px ${mode === "pull" ? "rgba(22, 163, 74, 0.15)" : "rgba(37, 99, 235, 0.15)"}`,
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
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
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
          boxShadow: `0 15px 35px ${mode === "pull" ? "rgba(22, 163, 74, 0.12)" : "rgba(37, 99, 235, 0.12)"}`,
          border: `1.5px solid ${mode === "pull" ? "rgba(22, 163, 74, 0.25)" : "rgba(37, 99, 235, 0.2)"}`,
          transition: "all 0.35s ease"
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FlipLink href="/" color="#0f111a" hoverColor={activeColor}>{lang === "AR" ? "الرئيسية" : "Home"}</FlipLink>
          <FlipLink href="/#stats" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "الإحصائيات والمهارات" : "Stats & Skills"}</FlipLink>
          <FlipLink href="/#about" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "النبذة" : "About Us"}</FlipLink>
          <FlipLink href="/#experience" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "الخبرات" : "Experience"}</FlipLink>
          <FlipLink href="/#tools" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "الأدوات" : "Tools"}</FlipLink>
          <FlipLink href="/#education" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "التعليم" : "Education"}</FlipLink>
          <FlipLink href="/#contact" color="#475569" hoverColor={activeColor}>{lang === "AR" ? "تواصل معي" : "Contact Us"}</FlipLink>
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
          <span>{lang === "AR" ? "تحميل ملف السيرة PDF" : "Download PDF"}</span>
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
              <span style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff" }}>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
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
                <span style={{ fontSize: "20px", fontWeight: "900" }}>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
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
                  + {lang === "AR" ? "كن عميلاً" : "Become a Client"}
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
                { num: "01", label: lang === "AR" ? "الرئيسية" : "Home", href: "/" },
                { num: "02", label: lang === "AR" ? "الإحصائيات والمهارات" : "Stats & Skills", href: "/#stats" },
                { num: "03", label: lang === "AR" ? "النبذة" : "About Us", href: "/#about" },
                { num: "04", label: lang === "AR" ? "الخبرات" : "Experience", href: "/#experience" },
                { num: "05", label: lang === "AR" ? "الأدوات" : "Tools", href: "/#tools" },
                { num: "06", label: lang === "AR" ? "التعليم" : "Education", href: "/#education" },
                { num: "07", label: lang === "AR" ? "تواصل معي" : "Contact Us", href: "/#contact" }
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
                {lang === "AR" ? "تحميل ملف السيرة PDF" : "Download PDF"}
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
        {/* HEADER TITLE CARD & MODE SWITCHER */}
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
            {lang === "AR" ? "أداة تكنو لإدارة وتحليل البيانات (Tekno Tool)" : "Tekno Tool (Data Management & Analysis)"}
          </h1>
          <p
            style={{
              fontSize: isDesktop ? "15px" : "13.5px",
              color: "#475569",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            {lang === "AR"
              ? "منظومة احترافية لمطابقة ومعالجة بيانات المنتجات والمخزون للمتاجر الإلكترونية والمخازن"
              : "Enterprise data matching and inventory management platform"}
          </p>

          {/* LIQUID MERCURY FLUID MODE TOGGLE PILLS */}
          <div
            className="awsmd-liquid-pill-track"
            style={{
              width: "fit-content",
              minWidth: isDesktop ? "500px" : "100%",
            }}
          >
            {/* LIQUID GLASS SLIDING PILL WITH GLOSSY FLUID HIGHLIGHTS */}
            <div
              style={{
                position: "absolute",
                top: "5px",
                bottom: "5px",
                left: lang === "AR" ? "auto" : "5px",
                right: lang === "AR" ? "5px" : "auto",
                width: "calc(50% - 5px)",
                borderRadius: "50px",
                background: mode === "compare"
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #3b82f6 100%)"
                  : "linear-gradient(135deg, #16a34a 0%, #15803d 55%, #22c55e 100%)",
                boxShadow: mode === "compare"
                  ? "0 10px 28px rgba(37, 99, 235, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.15)"
                  : "0 10px 28px rgba(22, 163, 74, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.15)",
                transform: mode === "compare"
                  ? "translateX(0%) scale(1)"
                  : (lang === "AR" ? "translateX(-100%) scale(1)" : "translateX(100%) scale(1)"),
                transition: "transform 0.55s cubic-bezier(0.68, -0.4, 0.32, 1.4), background 0.4s ease, box-shadow 0.4s ease",
                zIndex: 1,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              {/* LIQUID GLOSS SPECULAR REFLECTION */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse 70% 50% at 50% 15%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 70%, transparent 100%)",
                  borderRadius: "50px",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "3px",
                  left: "15%",
                  right: "15%",
                  height: "3px",
                  background: "rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  filter: "blur(1px)",
                  pointerEvents: "none",
                }}
              />
            </div>

            <button
              onClick={() => setMode("compare")}
              style={{
                position: "relative",
                zIndex: 2,
                background: "transparent",
                color: mode === "compare" ? "#ffffff" : "#475569",
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
              {lang === "AR" ? "وضع المقارنة (Compare Mode)" : "Compare Mode"}
            </button>
            <button
              onClick={() => setMode("pull")}
              style={{
                position: "relative",
                zIndex: 2,
                background: "transparent",
                color: mode === "pull" ? "#ffffff" : "#475569",
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
              {lang === "AR" ? "وضع سحب البيانات (Pull Data Mode)" : "Pull Data Mode"}
            </button>
          </div>
        </div>

        {/* 3 FILE UPLOAD CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* CARD 1: WEBSITE FILE */}
          <div
            style={{
              background: "#ffffff",
              padding: "26px 22px",
              borderRadius: "24px",
              boxShadow: "0 6px 25px rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(15, 17, 26, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    background: activeColor,
                    color: "#ffffff",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "13px",
                    transition: "background 0.3s ease",
                  }}
                >
                  1
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f111a" }}>
                  {lang === "AR" ? "ملف الموقع الإلكتروني" : "Website File"}
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "16px" }}>
                {lang === "AR" ? "اختر ملف الموقع (Excel أو CSV)" : "Select Website file (Excel or CSV)"}
              </p>
            </div>

            <label
              style={{
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: "18px",
                padding: "22px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileOld(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s ease" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <polyline points="9 15 12 12 15 15"></polyline>
              </svg>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileOld ? "#166534" : "#475569" }}>
                {fileOld ? fileOld.name : (lang === "AR" ? "تحميل الملف" : "Upload File")}
              </span>
            </label>
          </div>

          {/* CARD 2: WAREHOUSE FILE */}
          <div
            style={{
              background: "#ffffff",
              padding: "26px 22px",
              borderRadius: "24px",
              boxShadow: "0 6px 25px rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(15, 17, 26, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    background: activeColor,
                    color: "#ffffff",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "13px",
                    transition: "background 0.3s ease",
                  }}
                >
                  2
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f111a" }}>
                  {lang === "AR" ? "ملف جرد المخزن" : "Warehouse File"}
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "16px" }}>
                {lang === "AR" ? "اختر ملف المخزن (Excel أو CSV)" : "Select Warehouse file (Excel or CSV)"}
              </p>
            </div>

            <label
              style={{
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: "18px",
                padding: "22px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileNew(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s ease" }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileNew ? "#166534" : "#475569" }}>
                {fileNew ? fileNew.name : (lang === "AR" ? "تحميل الملف" : "Upload File")}
              </span>
            </label>
          </div>

          {/* CARD 3: REFERENCE / CORRECTION FILE */}
          <div
            style={{
              background: "#ffffff",
              padding: "26px 22px",
              borderRadius: "24px",
              boxShadow: "0 6px 25px rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(15, 17, 26, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    background: "#64748b",
                    color: "#ffffff",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "13px",
                  }}
                >
                  3
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f111a" }}>
                  {lang === "AR" ? "ملف التصحيح والجدول المرجعي" : "Reference Mapping File"}
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "16px" }}>
                {lang === "AR" ? "اختر ملف التوافق والمراجع (اختياري)" : "Select Reference mapping file (Optional)"}
              </p>
            </div>

            <label
              style={{
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: "18px",
                padding: "22px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileRef(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileRef ? "#166534" : "#475569" }}>
                {fileRef ? fileRef.name : (lang === "AR" ? "تحميل ملف المرجع" : "Upload Reference File")}
              </span>
            </label>
          </div>
        </div>

        {/* COLUMN SELECTION SECTION */}
        {(fileOld || fileNew) && (
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(15, 17, 26, 0.06)",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ fontSize: "19px", fontWeight: "900", color: "#0f111a", marginBottom: "20px" }}>
              {lang === "AR" ? "تحديد أعمدة الربط والمقارنة" : "Select Key & Comparison Columns"}
            </h3>

            {/* KEY COLUMNS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                  {lang === "AR" ? "عمود المعرف الأساسي في ملف الموقع:" : "Website Key Column (SKU/Name):"}
                </label>
                <select
                  value={keyColOld}
                  onChange={(e) => setKeyColOld(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#0f111a",
                  }}
                >
                  <option value="Row-by-Row">Row-by-Row (سطر بسطر)</option>
                  {oldHeaders.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                  {lang === "AR" ? "عمود المعرف الأساسي في ملف المخزن:" : "Warehouse Key Column (SKU/Name):"}
                </label>
                <select
                  value={keyColNew}
                  onChange={(e) => setKeyColNew(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#0f111a",
                  }}
                >
                  <option value="Row-by-Row">Row-by-Row (سطر بسطر)</option>
                  {newHeaders.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COMPARISON COLUMNS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                  {lang === "AR" ? "عمود المقارنة المستهدف في ملف الموقع:" : "Website Comparison Column:"}
                </label>
                <select
                  value={compColOld}
                  onChange={(e) => setCompColOld(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#0f111a",
                  }}
                >
                  <option value="Compare All Columns">Compare All Columns (مقارنة كافة الأعمدة)</option>
                  {oldHeaders.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                  {mode === "pull" ? (lang === "AR" ? "العمود المراد سحبه من ملف المخزن:" : "Target Column to Pull:") : (lang === "AR" ? "عمود المقارنة المستهدف في ملف المخزن:" : "Warehouse Comparison Column:")}
                </label>
                <select
                  value={compColNew}
                  onChange={(e) => setCompColNew(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#0f111a",
                  }}
                >
                  <option value="Compare All Columns">Compare All Columns (مقارنة كافة الأعمدة)</option>
                  {newHeaders.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PULL MODE EXTRA FIELD */}
            {mode === "pull" && (
              <div style={{ marginTop: "15px" }}>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                  {lang === "AR" ? "عنوان العمود الساحب الجديد:" : "New Pulled Column Name:"}
                </label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#0f111a",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* OPTIONS & PROCESS CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ fontSize: "19px", fontWeight: "900", color: "#0f111a", marginBottom: "20px" }}>
            {lang === "AR" ? "خيارات وإعدادات المطابقة المتقدمة" : "Advanced Matching Options"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={ignorePunct}
                onChange={(e) => setIgnorePunct(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: activeColor }}
              />
              <span>{lang === "AR" ? "تجاهل الفواصل والرموز الخاصة أثناء مطابقة المعرفات" : "Ignore symbols and punctuation during key matching"}</span>
            </label>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", marginBottom: "10px" }}>
                <input
                  type="checkbox"
                  checked={enableFuzzy}
                  onChange={(e) => setEnableFuzzy(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: activeColor }}
                />
                <span>{lang === "AR" ? "تفعيل نظام الاقتراحات والتشابه الذكي (Fuzzy Matching)" : "Enable Fuzzy Matching"}</span>
              </label>

              {enableFuzzy && (
                <div style={{ paddingRight: "28px", display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#475569" }}>
                    {lang === "AR" ? "نسبة التشابه المطلوبة:" : "Similarity Threshold:"} <b>{simThresh}%</b>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simThresh}
                    onChange={(e) => setSimThresh(Number(e.target.value))}
                    style={{ flex: 1, accentColor: activeColor }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f111a", display: "block", marginBottom: "6px" }}>
                {lang === "AR" ? "تصفية الفئات حسب كلمات مفتاحية (مفصولة بفاصلة):" : "Filter Keywords (comma separated):"}
              </label>
              <input
                type="text"
                value={filterKeywords}
                onChange={(e) => setFilterKeywords(e.target.value)}
                placeholder={lang === "AR" ? "مثال: ps5, ps4, ns" : "e.g. ps5, ps4, ns"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "700",
                  background: "#f8fafc",
                  color: "#0f111a",
                }}
              />
            </div>
          </div>

          {loadingStep && (
            <div style={{ padding: "14px 20px", background: "#eff6ff", color: activeColor, borderRadius: "14px", border: `1px solid ${activeColor}40`, marginBottom: "20px", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="spinner" style={{ display: "inline-block", width: "16px", height: "16px", border: `2.5px solid ${activeColor}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>{loadingStep}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: "14px 20px", background: "#fef2f2", color: "#991b1b", borderRadius: "14px", border: "1px solid #fecaca", marginBottom: "20px", fontSize: "14px", fontWeight: "700" }}>
              {errorMessage}
            </div>
          )}

          {success && (
            <div style={{ padding: "14px 20px", background: "#f0fdf4", color: "#166534", borderRadius: "14px", border: "1px solid #bbf7d0", marginBottom: "20px", fontSize: "14px", fontWeight: "700" }}>
              {lang === "AR" ? "اكتملت معالجة البيانات بنجاح! جاري تحميل التقرير النهائي..." : "Data processed successfully! Downloading final report..."}
            </div>
          )}

          <button
            onClick={handleProcessFiles}
            disabled={loading}
            className="awsmd-btn-glow"
            style={{
              width: "100%",
              background: loading ? "#94a3b8" : activeColor,
              color: "#ffffff",
              padding: "18px 30px",
              borderRadius: "50px",
              fontSize: "16.5px",
              fontWeight: "900",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: activeGlow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <span>{lang === "AR" ? "جاري معالجة وتوحيد البيانات..." : "Processing & matching data..."}</span>
            ) : (
              <span>
                {mode === "pull" ? (lang === "AR" ? "بدء سحب ومعالجة البيانات" : "Start Pulling Data") : (lang === "AR" ? "بدء معالجة ومطابقة البيانات" : "Start Comparison")}
              </span>
            )}
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          zIndex: 30,
          paddingTop: "16px",
          borderTop: "1px solid rgba(15, 17, 26, 0.06)",
        }}
      >
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>
          © {new Date().getFullYear()} Haider Mohamed Shwkat - Tekno Tool
        </span>
      </footer>

      {/* BECOME A CLIENT DRAWER TAB MODAL (+ كُن عميلاً) WITH CORRECT RTL/LTR SLIDING DIRECTIONS */}
      {(isClientDrawerOpen || isClientDrawerClosing) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            pointerEvents: "auto",
          }}
        >
          {/* BACKDROP OVERLAY WITH FADE IN/OUT */}
          <div
            onClick={closeClientDrawer}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 17, 26, 0.6)",
              backdropFilter: "blur(8px)",
              opacity: isClientDrawerActive && !isClientDrawerClosing ? 1 : 0,
              transition: "opacity 0.45s ease",
            }}
          />

          {/* SLIDING PANEL WITH ACCURATE DIRECTION: ARABIC (SLIDES RIGHT), ENGLISH (SLIDES LEFT) */}
          <div
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              ...(lang === "AR" ? { right: 0 } : { left: 0 }),
              width: "100%",
              maxWidth: "540px",
              height: "100dvh",
              background: "#ffffff",
              color: "#0f111a",
              padding: isDesktop ? "45px 35px" : "30px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: lang === "AR" ? "-20px 0 50px rgba(0,0,0,0.3)" : "20px 0 50px rgba(0,0,0,0.3)",
              zIndex: 2001,
              overflowY: "auto",
              transform: isClientDrawerActive && !isClientDrawerClosing
                ? "translateX(0)"
                : (lang === "AR" ? "translateX(100%)" : "translateX(-100%)"),
              transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
                <div>
                  <h2 style={{ fontSize: isDesktop ? "30px" : "24px", fontWeight: "900", color: "#0f111a", lineHeight: "1.2" }}>
                    {lang === "AR" ? "مرحباً! أخبرنا بكل التفاصيل" : "Hey! Tell us all the things"}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px", fontWeight: "600" }}>
                    {lang === "AR" ? "يسعدنا التعاون معك لبناء وتطوير حلول برمجية وبيانات استثنائية." : "We'd love to hear about your project and build something amazing together."}
                  </p>
                </div>

                <button
                  onClick={closeClientDrawer}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#0f111a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
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
                  action="https://formsubmit.co/haider.m.shwkat@outlook.com"
                  method="POST"
                  onSubmit={handleFormSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "18px" }}
                >
                  <input type="hidden" name="_subject" value="📩 طلب عمل جديد من صفحة أداة تكنو!" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {lang === "AR" ? "الاسم والشركة" : "Name & Company"}
                    </label>
                    <input
                      required
                      type="text"
                      name="الاسم والشركة / Client Name"
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
                      {lang === "AR" ? "البريد الإلكتروني" : "Your Email"}
                    </label>
                    <input
                      required
                      type="email"
                      name="البريد الإلكتروني / Client Email"
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
                      {lang === "AR" ? "أخبرنا المزيد عن مشروعك" : "Tell us more about your project"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="تفاصيل المشروع / Project Details"
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
                      <span>{lang === "AR" ? "إرسال الطلب" : "Submit Request"}</span>
                      <span style={{ fontSize: "16px" }}>←</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
