"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CV_TEMPLATES_PRESETS } from "@/lib/cvPresets";

interface PortfolioData {
  general: {
    nameAR: string;
    nameEN: string;
    jobTitleAR: string;
    jobTitleEN: string;
    email: string;
    phone: string;
    locationAR: string;
    locationEN: string;
    cvPdfPath?: string;
  };
  translations: {
    AR: {
      bio: string;
    };
    EN: {
      bio: string;
    };
  };
  experiences: Array<{
    id: string;
    companyAR: string;
    companyEN: string;
    roleAR: string;
    roleEN: string;
    dateAR: string;
    dateEN: string;
    bulletsAR: string[];
    bulletsEN: string[];
  }>;
  education: Array<{
    id: string;
    yearAR: string;
    yearEN: string;
    schoolAR: string;
    schoolEN: string;
    degreeAR: string;
    degreeEN: string;
  }>;
  certifications: Array<{
    id: string;
    titleAR: string;
    titleEN: string;
  }>;
  cvDocument?: {
    cvLang?: "AR" | "EN";
    photo?: string;
    fullName: string;
    fullNameAR?: string;
    fullNameEN?: string;
    jobTitle: string;
    jobTitleAR?: string;
    jobTitleEN?: string;
    summary: string;
    summaryAR?: string;
    summaryEN?: string;
    phone?: string;
    email?: string;
    location?: string;
    locationEN?: string;
    linkedin?: string;
    templatePreset?: string;
    templateStyle?: "clean-white" | "modern-dark" | "executive-blue";
    layoutFormat?: "single-column" | "two-column-sidebar" | "modern-executive" | "minimal-compact";
    fontFamily?: string;
    fontSizeScale?: "compact" | "normal" | "large";
    pageMargin?: "compact" | "normal" | "wide";
    lineSpacing?: "compact" | "normal" | "relaxed";
    accentColor?: string;
    showPhoto?: boolean;
    showSkills?: boolean;
    showEducation?: boolean;
    showCertifications?: boolean;
    showQrCode?: boolean;
    qrCodeCustomUrl?: string;
    skills?: string[];
    skillsEN?: string[];
  };
}

export default function PublicCvStudioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const [activePreset, setActivePreset] = useState<string>("arabic-modern-blue");
  const [layoutFormat, setLayoutFormat] = useState<"single-column" | "two-column-sidebar" | "modern-executive" | "minimal-compact">("two-column-sidebar");
  const [templateStyle, setTemplateStyle] = useState<"clean-white" | "modern-dark" | "executive-blue">("clean-white");
  const [accentColor, setAccentColor] = useState<string>("#2563eb");
  const [fontFamily, setFontFamily] = useState<string>("Tajawal");
  const [fontSizeScale, setFontSizeScale] = useState<"compact" | "normal" | "large">("normal");
  const [pageMargin, setPageMargin] = useState<"compact" | "normal" | "wide">("normal");
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed">("normal");
  const [a4Zoom, setA4Zoom] = useState<number>(0.85);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/portfolio")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          const d: PortfolioData = json.data;
          setData(d);
          if (d.cvDocument?.cvLang) setLang(d.cvDocument.cvLang);
          if (d.cvDocument?.templatePreset) setActivePreset(d.cvDocument.templatePreset);
          if (d.cvDocument?.layoutFormat) setLayoutFormat(d.cvDocument.layoutFormat);
          if (d.cvDocument?.templateStyle) setTemplateStyle(d.cvDocument.templateStyle);
          if (d.cvDocument?.accentColor) setAccentColor(d.cvDocument.accentColor);
          if (d.cvDocument?.fontFamily) setFontFamily(d.cvDocument.fontFamily);
          if (d.cvDocument?.fontSizeScale) setFontSizeScale(d.cvDocument.fontSizeScale);
          if (d.cvDocument?.pageMargin) setPageMargin(d.cvDocument.pageMargin);
          if (d.cvDocument?.lineSpacing) setLineSpacing(d.cvDocument.lineSpacing);
        }
      })
      .catch(() => {});
  }, []);

  // Generate QR Code dynamically
  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      const urlToEncode = data?.cvDocument?.qrCodeCustomUrl || "https://cv-wine-tau.vercel.app";
      QRCode.toDataURL(urlToEncode, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      }).catch((e) => console.error("QR Error:", e));
    });
    return () => { isMounted = false; };
  }, [data?.cvDocument?.qrCodeCustomUrl, templateStyle]);

  // Track visitor
  useEffect(() => {
    fetch("/api/track?path=/cv&page=Public_CV_Studio").catch(() => {});
  }, []);

  const handleSwitchLanguage = (newLang: "AR" | "EN") => {
    setLang(newLang);
    if (newLang === "AR") {
      setFontFamily("Tajawal");
      showToast("تم تحويل العرض إلى اللغة العربية");
    } else {
      setFontFamily("Outfit");
      showToast("Switched preview to English");
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const p = CV_TEMPLATES_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(p.id);
    setAccentColor(p.accent);
    setTemplateStyle(p.style);
    setLayoutFormat(p.format);
    setFontFamily(p.font);
    setFontSizeScale(p.fontSize);
    setPageMargin(p.margin);
    setLineSpacing(p.spacing);
    showToast(lang === "AR" ? `تم تطبيق قالب: ${p.title}` : `Applied preset: ${p.title}`);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("cv-pdf-canvas");
    if (!element) return;

    const isArabic = lang === "AR";
    const pdfFileName = isArabic ? "HAIDER_M_SHWKAT_CV_AR_2026.pdf" : "HAIDER_M_SHWKAT_CV_2026.pdf";

    setIsGeneratingPdf(true);
    showToast(isArabic ? "جاري تجهيز وتنزيل ملف الـ PDF..." : "Generating print-ready PDF...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const totalPdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalPdfHeight;
      let position = 0;

      // Render First Page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfPageHeight;

      // Render Additional Pages if content extends beyond 1 A4 Page
      while (heightLeft > 5) {
        position = position - pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(pdfFileName);
      showToast(isArabic ? "تم تنزيل السيرة الذاتية بنجاح" : "CV PDF Downloaded successfully");
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast(isArabic ? "حدث خطأ أثناء تنزيل الـ PDF" : "Error generating PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isArabic = lang === "AR";

  // Data helpers
  const general = data?.general || {
    nameAR: "حيدر محمد شوكت",
    nameEN: "HAIDER M. SHWKAT",
    jobTitleAR: "متخصص علوم الحاسوب | استشاري عمليات البيانات والأنظمة",
    jobTitleEN: "Computer Science Specialist | Data Operations & Workflow Consultant",
    locationAR: "بغداد، العراق",
    locationEN: "Baghdad, Iraq",
    email: "haider.m.shwkat@outlook.com",
    phone: "+964 771 896 4778",
  };

  const fullName = isArabic ? (data?.cvDocument?.fullName || general.nameAR) : (data?.cvDocument?.fullNameEN || general.nameEN);
  const jobTitle = isArabic ? (data?.cvDocument?.jobTitle || general.jobTitleAR) : (data?.cvDocument?.jobTitleEN || general.jobTitleEN);
  const summary = isArabic ? (data?.cvDocument?.summary || data?.translations?.AR?.bio || "") : (data?.cvDocument?.summaryEN || data?.translations?.EN?.bio || "");
  const location = isArabic ? (data?.cvDocument?.location || general.locationAR) : (data?.cvDocument?.locationEN || general.locationEN);
  const email = data?.cvDocument?.email || general.email;
  const phone = data?.cvDocument?.phone || general.phone;
  const linkedin = data?.cvDocument?.linkedin || "linkedin.com/in/haidermoe";
  const photo = data?.cvDocument?.photo || "/cv-photo.png";

  const experiences = (data?.experiences || []).map((exp) => {
    if (isArabic) {
      return {
        id: exp.id,
        role: exp.roleAR || exp.roleEN,
        company: exp.companyAR || exp.companyEN,
        date: exp.dateAR || exp.dateEN,
        bullets: exp.bulletsAR && exp.bulletsAR.length > 0 ? exp.bulletsAR : exp.bulletsEN,
      };
    } else {
      return {
        id: exp.id,
        role: exp.roleEN || exp.roleAR,
        company: exp.companyEN || exp.companyAR,
        date: exp.dateEN || exp.dateAR,
        bullets: exp.bulletsEN && exp.bulletsEN.length > 0 ? exp.bulletsEN : exp.bulletsAR,
      };
    }
  });

  const skills = isArabic ? (data?.cvDocument?.skills || [
    "أتمتة بايثون وبرمجة السكربتات",
    "هيكلة وإدارة قواعد البيانات الضخمة SQL",
    "تكامل أنظمة ERP وفودكس للتجارة الإلكترونية",
    "إدارة وتشغيل شبكات FTTH و EPON الضوئية",
    "تنظيف وتدقيق وضمان جودة البيانات",
    "إدارة خوادم لينكس والـ Bash Scripts",
    "إدارة المشاريع بالمنهجيات المرنة Agile",
  ]) : (data?.cvDocument?.skillsEN || [
    "Python Automation & Scripting",
    "SQL & High-Volume Database Architecture",
    "E-Commerce & Foodics ERP Workflows",
    "FTTH & EPON Optical Network Management",
    "Data Cleansing & Integrity Verification",
    "Linux Server Operations & Bash",
    "Agile Project & Team Leadership",
  ]);

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        background: "#080911",
        color: "#ffffff",
        minHeight: "100vh",
        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
      }}
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2563eb",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "800",
            boxShadow: "0 10px 30px rgba(37,99,235,0.6)",
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER / NAVIGATION */}
      <header
        style={{
          background: "rgba(10, 11, 18, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          
          {/* LOGO & TITLE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                background: "#1e293b",
                color: "#60a5fa",
                border: "1px solid #334155",
                padding: "7px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>←</span>
              <span>{isArabic ? "الرئيسية" : "Home"}</span>
            </Link>

            <div>
              <h1 style={{ fontSize: "17px", fontWeight: "900", margin: 0, color: "#ffffff" }}>
                {isArabic ? "محرك السيرة الذاتية التفاعلي ومولد الـ PDF" : "Interactive ATS CV Studio & PDF Engine"}
              </h1>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {isArabic ? "معاينة وتخصيص حي بدقة A4 القياسية وتصدير مباشر" : "Live A4 ISO Preview & 100% ATS-Compliant PDF Export"}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS & LANGUAGE SWITCHER */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* LANGUAGE SWITCHER */}
            <div style={{ display: "flex", background: "#151624", padding: "4px", borderRadius: "10px", border: "1px solid #334155" }}>
              <button
                onClick={() => handleSwitchLanguage("AR")}
                style={{
                  background: isArabic ? "#2563eb" : "transparent",
                  color: isArabic ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                العربية (AR)
              </button>
              <button
                onClick={() => handleSwitchLanguage("EN")}
                style={{
                  background: !isArabic ? "#2563eb" : "transparent",
                  color: !isArabic ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                English (EN)
              </button>
            </div>

            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(22, 163, 74, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{isGeneratingPdf ? (isArabic ? "جاري التوليد..." : "Generating...") : (isArabic ? "تنزيل نسخة PDF جاهزة للطباعة" : "Download Print-Ready PDF")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 380px) 1fr", gap: "28px", alignItems: "start" }}>
          
          {/* LEFT/RIGHT CONTROLS PANEL */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* SPECIALIZED PRESETS CARD */}
            <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1.5px solid #2563eb", boxShadow: "0 8px 25px rgba(37,99,235,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                    {isArabic ? "مكتبة القوالب المتخصصة (9 مجالات)" : "Specialized Industry Presets (9 Domains)"}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {isArabic ? "انقر على أي قالب لتطبيقه ومعاينته فورياً:" : "Click any preset to instantly apply and preview:"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                {CV_TEMPLATES_PRESETS.map((p) => {
                  const isSelected = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      style={{
                        background: isSelected ? "#1e293b" : "#151624",
                        border: isSelected ? `2px solid ${p.accent}` : "1px solid #334155",
                        borderRadius: "10px",
                        padding: "9px 12px",
                        textAlign: isArabic ? "right" : "left",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "12.5px", color: isSelected ? "#60a5fa" : "#ffffff", fontWeight: "800" }}>{p.title}</strong>
                        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: p.accent, display: "inline-block" }} />
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#38bdf8", fontWeight: "700" }}>{p.field}</div>
                      <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0, lineHeight: "1.35" }}>{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LAYOUT FORMAT & STYLE CONTROLS */}
            <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", marginBottom: "12px" }}>
                {isArabic ? "هيكل وتصميم الصفحة" : "Page Structure & Format"}
              </h3>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "6px" }}>
                  {isArabic ? "نمط وهيكل الصفحة (Layout Format):" : "Layout Format:"}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "single-column", label: isArabic ? "عمود واحد ATS" : "Single Column ATS" },
                    { id: "two-column-sidebar", label: isArabic ? "عمودين جانبي" : "Two-Column Sidebar" },
                    { id: "modern-executive", label: isArabic ? "تنفيذي عريض" : "Executive Wide" },
                    { id: "minimal-compact", label: isArabic ? "مضغوط مكثف" : "Minimal Compact" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setLayoutFormat(fmt.id as any)}
                      style={{
                        background: layoutFormat === fmt.id ? "#2563eb" : "#151624",
                        color: layoutFormat === fmt.id ? "#ffffff" : "#94a3b8",
                        border: "1px solid #334155",
                        padding: "7px 6px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* THEME & ACCENT COLOR */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "6px" }}>
                  {isArabic ? "ثيم الألوان:" : "Color Theme:"}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "clean-white", label: isArabic ? "أبيض قياسي" : "Clean White" },
                    { id: "modern-dark", label: isArabic ? "داكن عصري" : "Modern Dark" },
                    { id: "executive-blue", label: isArabic ? "أزرق ملكي" : "Executive Blue" },
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setTemplateStyle(th.id as any)}
                      style={{
                        background: templateStyle === th.id ? "#2563eb" : "#151624",
                        color: templateStyle === th.id ? "#ffffff" : "#94a3b8",
                        border: "1px solid #334155",
                        padding: "7px 4px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QR CODE & VERIFICATION */}
            <div style={{ background: "#0e101d", padding: "18px", borderRadius: "18px", border: "1px solid #334155", display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ width: "70px", height: "70px", background: "#ffffff", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: "9px", color: "#64748b" }}>QR</span>
                )}
              </div>

              <div>
                <strong style={{ fontSize: "13px", color: "#ffffff", display: "block", marginBottom: "2px" }}>
                  {isArabic ? "ماسح التحقق السريع (QR)" : "Live Verification QR"}
                </strong>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 6px 0" }}>
                  {isArabic ? "امسح الرمز لفتح الموقع التفاعلي والتواصل المباشر." : "Scan to verify live interactive portfolio and direct contact."}
                </p>
              </div>
            </div>

          </aside>

          {/* RIGHT/LEFT A4 PREVIEW DESK */}
          <section
            style={{
              position: "sticky",
              top: "90px",
              alignSelf: "start",
              background: "#06070d",
              padding: "24px 16px",
              borderRadius: "20px",
              border: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            {/* DESK TOOLBAR */}
            <div style={{ width: "100%", maxWidth: "794px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#60a5fa" }} />
                <span style={{ fontSize: "12.5px", fontWeight: "900", color: "#ffffff" }}>
                  {isArabic ? "ورقة السيرة الذاتية القياسية (ISO A4: 210mm × 297mm)" : "Standard Document (ISO A4: 210mm × 297mm)"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{isArabic ? "مقياس العرض:" : "Scale:"}</span>
                {[
                  { label: "65%", val: 0.65 },
                  { label: "75%", val: 0.75 },
                  { label: "85%", val: 0.85 },
                  { label: "100%", val: 1.0 },
                ].map((z) => (
                  <button
                    key={z.label}
                    onClick={() => setA4Zoom(z.val)}
                    style={{
                      background: a4Zoom === z.val ? "#2563eb" : "#151624",
                      color: a4Zoom === z.val ? "#ffffff" : "#94a3b8",
                      border: "1px solid #334155",
                      padding: "3px 7px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SCALABLE TRUE A4 CANVAS */}
            <div style={{ transform: `scale(${a4Zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease", marginBottom: `${(1 - a4Zoom) * -1123}px` }}>
              <div
                id="cv-pdf-canvas"
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  background: templateStyle === "clean-white" ? "#ffffff" : templateStyle === "executive-blue" ? "#0f172a" : "#0d0f18",
                  color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff",
                  padding: pageMargin === "compact" ? "28px 32px" : pageMargin === "wide" ? "56px 60px" : "44px 48px",
                  boxSizing: "border-box",
                  fontFamily: `'${fontFamily}', 'Tajawal', sans-serif`,
                  fontSize: fontSizeScale === "compact" ? "10.5px" : fontSizeScale === "large" ? "12.5px" : "11.5px",
                  lineHeight: lineSpacing === "compact" ? "1.45" : lineSpacing === "relaxed" ? "1.85" : "1.65",
                  boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
                  borderRadius: "4px",
                }}
                dir={isArabic ? "rtl" : "ltr"}
              >
                {/* TWO COLUMN SIDEBAR LAYOUT MODE */}
                {layoutFormat === "two-column-sidebar" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px", alignItems: "start" }}>
                    
                    {/* SIDEBAR */}
                    <div style={{ borderRight: isArabic ? "none" : `2px solid ${accentColor}30`, borderLeft: isArabic ? `2px solid ${accentColor}30` : "none", paddingRight: isArabic ? "0" : "20px", paddingLeft: isArabic ? "20px" : "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                      {photo && (
                        <div style={{ width: "100px", height: "100px", borderRadius: "14px", overflow: "hidden", border: `2.5px solid ${accentColor}`, margin: "0 auto", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                          <img src={photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                          {isArabic ? "بيانات الاتصال" : "Contact Info"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "10px", color: templateStyle === "clean-white" ? "#475569" : "#94a3b8" }}>
                          <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{email}</span></div>
                          <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{phone}</span></div>
                          <div>📍 {location}</div>
                          <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{linkedin}</span></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                          {isArabic ? "المهارات والقدرات" : "Skills & Competencies"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {skills.map((sk, i) => (
                            <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", fontWeight: "700" }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {data?.education && (
                        <div>
                          <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                            {isArabic ? "المؤهلات العلمية" : "Education"}
                          </div>
                          {data.education.map((edu, i) => (
                            <div key={i} style={{ fontSize: "10px", marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              <strong>{isArabic ? (edu.degreeAR || edu.degreeEN) : (edu.degreeEN || edu.degreeAR)}</strong>
                              <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8" }}>{isArabic ? (edu.schoolAR || edu.schoolEN) : (edu.schoolEN || edu.schoolAR)} ({isArabic ? (edu.yearAR || edu.yearEN) : (edu.yearEN || edu.yearAR)})</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {data?.certifications && (
                        <div>
                          <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                            {isArabic ? "الشهادات والاعتمادات" : "Certifications"}
                          </div>
                          {data.certifications.map((cert, i) => (
                            <div key={i} style={{ fontSize: "10px", marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              • {isArabic ? (cert.titleAR || cert.titleEN) : (cert.titleEN || cert.titleAR)}
                            </div>
                          ))}
                        </div>
                      )}

                      {qrCodeDataUrl && (
                        <div style={{ marginTop: "12px", padding: "8px", background: templateStyle === "clean-white" ? "#f8fafc" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: `1.5px solid ${accentColor}40`, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <img src={qrCodeDataUrl} alt="QR Code" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
                          <span style={{ fontSize: "8px", fontWeight: "900", color: accentColor, letterSpacing: "0.5px" }}>
                            {isArabic ? "الموقع التفاعلي" : "LIVE PORTFOLIO"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* MAIN BODY */}
                    <div>
                      <div style={{ borderBottom: `2.5px solid ${accentColor}`, paddingBottom: "14px", marginBottom: "18px" }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                          {fullName}
                        </h2>
                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: accentColor }}>
                          {jobTitle}
                        </div>
                      </div>

                      {summary && (
                        <div style={{ marginBottom: "18px" }}>
                          <div style={{ fontSize: "12px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                            {isArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                          </div>
                          <p style={{ fontSize: "11px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                            {summary}
                          </p>
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                          {isArabic ? "الخبرات المهنية والعملية" : "Work Experience"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          {experiences.map((exp, i) => (
                            <div key={exp.id || i}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                                <div>
                                  <strong style={{ fontSize: "12.5px", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                                    {exp.role}
                                  </strong>
                                  <span style={{ fontSize: "11.5px", color: accentColor, marginLeft: isArabic ? "0" : "6px", marginRight: isArabic ? "6px" : "0", fontWeight: "700" }}>
                                    | {exp.company}
                                  </span>
                                </div>
                                <span style={{ fontSize: "10.5px", color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontWeight: "700" }}>
                                  {exp.date}
                                </span>
                              </div>

                              <ul style={{ margin: "3px 0 0 0", paddingLeft: isArabic ? "0" : "16px", paddingRight: isArabic ? "16px" : "0", fontSize: "10.5px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", lineHeight: "1.5" }}>
                                {exp.bullets.map((b: string, bi: number) => (
                                  <li key={bi} style={{ marginBottom: "2px" }}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SINGLE COLUMN / EXECUTIVE / MINIMAL LAYOUT */
                  <div>
                    {/* HEADER ROW */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accentColor}`, paddingBottom: "16px", marginBottom: "20px", gap: "20px" }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "0.5px", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                          {fullName}
                        </h2>
                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: accentColor, marginBottom: "10px" }}>
                          {jobTitle}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "11px", color: templateStyle === "clean-white" ? "#475569" : "#94a3b8", fontWeight: "600" }}>
                          <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{email}</span></div>
                          <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{phone}</span></div>
                          <div>📍 {location}</div>
                          <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{linkedin}</span></div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        {qrCodeDataUrl && (
                          <div style={{ padding: "4px", background: "#ffffff", borderRadius: "8px", border: `1.5px solid ${accentColor}`, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                            <img src={qrCodeDataUrl} alt="QR" style={{ width: "55px", height: "55px", objectFit: "contain" }} />
                            <span style={{ fontSize: "6.5px", fontWeight: "900", color: "#0f172a", marginTop: "1px" }}>
                              {isArabic ? "الموقع" : "PORTFOLIO"}
                            </span>
                          </div>
                        )}

                        {photo && (
                          <div style={{ width: "75px", height: "75px", borderRadius: "12px", overflow: "hidden", border: `2px solid ${accentColor}`, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                            <img src={photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EXECUTIVE SUMMARY */}
                    {summary && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                          {isArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                        </div>
                        <p style={{ fontSize: "11px", lineHeight: "1.65", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                          {summary}
                        </p>
                      </div>
                    )}

                    {/* WORK EXPERIENCE */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                        {isArabic ? "الخبرات المهنية والعملية" : "Professional Work Experience"}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {experiences.map((exp, i) => (
                          <div key={exp.id || i}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                              <div>
                                <strong style={{ fontSize: "13px", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                                  {exp.role}
                                </strong>
                                <span style={{ fontSize: "12px", color: accentColor, marginLeft: isArabic ? "0" : "8px", marginRight: isArabic ? "8px" : "0", fontWeight: "700" }}>
                                  | {exp.company}
                                </span>
                              </div>
                              <span style={{ fontSize: "11px", color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontWeight: "700" }}>
                                {exp.date}
                              </span>
                            </div>

                            <ul style={{ margin: "4px 0 0 0", paddingLeft: isArabic ? "0" : "18px", paddingRight: isArabic ? "18px" : "0", fontSize: "11px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", lineHeight: "1.55" }}>
                              {exp.bullets.map((b: string, bi: number) => (
                                <li key={bi} style={{ marginBottom: "2px" }}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TECHNICAL SKILLS */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "10px" }}>
                        {isArabic ? "المهارات التقنية والقدرات" : "Core Technical Skills"}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {skills.map((sk, i) => (
                          <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "3px 9px", borderRadius: "6px", fontSize: "10.5px", fontWeight: "700" }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* EDUCATION & CERTIFICATIONS DUAL ROW */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {data?.education && (
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                            {isArabic ? "المؤهلات العلمية" : "Academic Education"}
                          </div>
                          {data.education.map((edu, i) => (
                            <div key={i} style={{ fontSize: "11px", marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              <strong>{isArabic ? (edu.degreeAR || edu.degreeEN) : (edu.degreeEN || edu.degreeAR)}</strong>
                              <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontSize: "10.5px" }}>{isArabic ? (edu.schoolAR || edu.schoolEN) : (edu.schoolEN || edu.schoolAR)} ({isArabic ? (edu.yearAR || edu.yearEN) : (edu.yearEN || edu.yearAR)})</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {data?.certifications && (
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                            {isArabic ? "الشهادات والاعتمادات" : "Certified Training"}
                          </div>
                          {data.certifications.map((cert, i) => (
                            <div key={i} style={{ fontSize: "10.5px", marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              • {isArabic ? (cert.titleAR || cert.titleEN) : (cert.titleEN || cert.titleAR)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
