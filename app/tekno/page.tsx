"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// REUSABLE FLIP-TEXT LINK COMPONENT (MATCHING PAGE.TSX)
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

export default function TeknoPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Language ripple state
  const [isLangAnimating, setIsLangAnimating] = useState(false);
  const [langOrigin, setLangOrigin] = useState({ x: 0, y: 0 });
  const [circleActive, setCircleActive] = useState(false);

  // Client Drawer Tab State
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isClientDrawerClosing, setIsClientDrawerClosing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // File states
  const [fileOld, setFileOld] = useState<File | null>(null);
  const [fileNew, setFileNew] = useState<File | null>(null);
  const [fileRef, setFileRef] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Options
  const [ignorePunct, setIgnorePunct] = useState(true);
  const [filterKeywords, setFilterKeywords] = useState("");

  useEffect(() => {
    const handleCheckDesktop = () => setIsDesktop(window.innerWidth > 960);
    handleCheckDesktop();
    window.addEventListener("resize", handleCheckDesktop);
    return () => window.removeEventListener("resize", handleCheckDesktop);
  }, []);

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

  const closeClientDrawer = () => {
    setIsClientDrawerClosing(true);
    setTimeout(() => {
      setIsClientDrawerOpen(false);
      setIsClientDrawerClosing(false);
    }, 450);
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

  const handleProcessFiles = async () => {
    if (!fileOld || !fileNew) {
      setErrorMessage(lang === "AR" ? "يرجى اختيار ملف الموقع وملف المخزن للبدء" : "Please select website file and warehouse file to start");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file_old", fileOld);
      formData.append("file_new", fileNew);
      if (fileRef) formData.append("file_ref", fileRef);

      formData.append("ignore_punct", String(ignorePunct));
      formData.append("filter_keywords", filterKeywords);

      // Call Vercel Python API route running comparator.py!
      const res = await fetch("/api/compare", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "حدث خطأ أثناء معالجة الملفات");
      }

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
      setErrorMessage(err.message || "حدث خطأ أثناء المعالجة بواسطة برنامج بايثون");
    } finally {
      setLoading(false);
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
            <rect x="10" y="13" width="15" height="7" fill="#4f46e5" />
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
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
          <FlipLink href="/#about" color="#475569" hoverColor="#2563eb">
            {lang === "AR" ? "النبذة" : "About Us"}
          </FlipLink>
          <FlipLink href="/#experience" color="#475569" hoverColor="#2563eb">
            {lang === "AR" ? "الخبرات" : "Experience"}
          </FlipLink>
          <FlipLink href="/#education" color="#475569" hoverColor="#2563eb">
            {lang === "AR" ? "التعليم" : "Education"}
          </FlipLink>
          <FlipLink href="/#contact" color="#475569" hoverColor="#2563eb">
            {lang === "AR" ? "تواصل معي" : "Contact Us"}
          </FlipLink>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
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
            onClick={() => setIsClientDrawerOpen(true)}
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
            padding: isDesktop ? "40px" : "25px 20px",
            borderRadius: "28px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: isDesktop ? "42px" : "28px",
              fontWeight: "900",
              color: "#0f111a",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            ⚡ {lang === "AR" ? "أداة تكنو (Tekno Tool)" : "Tekno Tool"}
          </h1>
          <p
            style={{
              fontSize: isDesktop ? "17px" : "14.5px",
              color: "#475569",
              fontWeight: "600",
            }}
          >
            {lang === "AR"
              ? "أداة مقارنة وسحب بيانات الإكسل الذكية بالمحرك الأصلي لـ Python"
              : "Smart Excel comparison & data extraction tool powered natively by Python"}
          </p>
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
                    background: "#2563eb",
                    color: "#ffffff",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "14px",
                  }}
                >
                  1
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f111a" }}>
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
                padding: "20px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                display: "block",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileOld(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>📂</span>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileOld ? "#166534" : "#475569" }}>
                {fileOld ? fileOld.name : (lang === "AR" ? "رفع الملف" : "Upload File")}
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
                    background: "#2563eb",
                    color: "#ffffff",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "14px",
                  }}
                >
                  2
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f111a" }}>
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
                padding: "20px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                display: "block",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileNew(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>📦</span>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileNew ? "#166534" : "#475569" }}>
                {fileNew ? fileNew.name : (lang === "AR" ? "رفع الملف" : "Upload File")}
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
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "14px",
                  }}
                >
                  3
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f111a" }}>
                  {lang === "AR" ? "ملف التصحيح (اختياري)" : "Correction File (Optional)"}
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "16px" }}>
                {lang === "AR" ? "اختر ملف التوافق والمراجع (Excel أو CSV)" : "Select Reference mapping file (Excel or CSV)"}
              </p>
            </div>

            <label
              style={{
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: "18px",
                padding: "20px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                display: "block",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFileRef(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>📝</span>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: fileRef ? "#166534" : "#475569" }}>
                {fileRef ? fileRef.name : (lang === "AR" ? "رفع ملف التصحيح" : "Upload Reference File")}
              </span>
            </label>
          </div>
        </div>

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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14.5px" }}>
              <input
                type="checkbox"
                checked={ignorePunct}
                onChange={(e) => setIgnorePunct(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
              />
              <span>{lang === "AR" ? "تجاهل الفواصل والرموز على عمود المعرف" : "Ignore punctuation and symbols"}</span>
            </label>
          </div>

          {errorMessage && (
            <div style={{ padding: "14px 20px", background: "#fef2f2", color: "#991b1b", borderRadius: "14px", border: "1px solid #fecaca", marginBottom: "20px", fontSize: "14.5px", fontWeight: "700" }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {success && (
            <div style={{ padding: "14px 20px", background: "#f0fdf4", color: "#166534", borderRadius: "14px", border: "1px solid #bbf7d0", marginBottom: "20px", fontSize: "14.5px", fontWeight: "700" }}>
              🎉 {lang === "AR" ? "تمت معالجة البيانات بنجاح بمحرك بايثون! جاري تحميل التقرير النهائي..." : "Data processed successfully via Python engine! Downloading final report..."}
            </div>
          )}

          <button
            onClick={handleProcessFiles}
            disabled={loading}
            className="awsmd-btn-glow"
            style={{
              width: "100%",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#ffffff",
              padding: "18px 30px",
              borderRadius: "50px",
              fontSize: "17px",
              fontWeight: "900",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 12px 35px rgba(37, 99, 235, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <span>⏳ {lang === "AR" ? "جاري تشغيل برنامج بايثون لمعالجة وتوحيد البيانات..." : "Running Python engine to compare & process data..."}</span>
            ) : (
              <span>🚀 {lang === "AR" ? "بدء معالجة الملفات والمقارنة (بايثون)" : "Start Processing & Compare (Python)"}</span>
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
          © {new Date().getFullYear()} Haider Mohamed Shwkat - Tekno Tool (Python Engine)
        </span>
      </footer>

      {/* BECOME A CLIENT DRAWER TAB MODAL */}
      {(isClientDrawerOpen || isClientDrawerClosing) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            justifyContent: lang === "AR" ? "flex-start" : "flex-end",
          }}
        >
          <div
            onClick={closeClientDrawer}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 17, 26, 0.6)",
              backdropFilter: "blur(8px)",
              opacity: isClientDrawerClosing ? 0 : 1,
              transition: "opacity 0.45s ease",
            }}
          />
          <div
            style={{
              position: "relative",
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
              transform: isClientDrawerClosing
                ? lang === "AR" ? "translateX(-100%)" : "translateX(100%)"
                : "translateX(0)",
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
                </div>
                <button onClick={closeClientDrawer} style={{ background: "#f1f5f9", border: "none", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
