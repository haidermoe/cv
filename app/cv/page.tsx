"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CV_TEMPLATES_PRESETS } from "@/lib/cvPresets";

interface CvExperience {
  id: string;
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

interface CvEducation {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface CvCertification {
  id: string;
  title: string;
}

interface LanguageSpecificData {
  fullName: string;
  jobTitle: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  skills: string[];
  experiences: CvExperience[];
  education: CvEducation[];
  certifications: CvCertification[];
}

const DEFAULT_AR_DATA: LanguageSpecificData = {
  fullName: "حيدر محمد شوكت",
  jobTitle: "متخصص علوم الحاسوب | استشاري عمليات البيانات والأنظمة",
  summary: "متخصص في علوم الحاسوب وهندسة نظم البيانات وإدارة العمليات التقنية، بخبرة عملية مثبتة في أتمتة العمليات البرمجية وبناء وتطوير قواعد البيانات الضخمة (+22,000 سجل) وتكامل منصات التجارة الإلكترونية وإدارة شبكات الألياف الضوئية FTTH.",
  email: "haider.m.shwkat@outlook.com",
  phone: "+964 771 896 4778",
  location: "بغداد، العراق",
  linkedin: "linkedin.com/in/haidermoe",
  skills: [
    "أتمتة بايثون وبرمجة السكربتات",
    "هيكلة وإدارة قواعد البيانات الضخمة SQL",
    "تكامل أنظمة ERP وفودكس للتجارة الإلكترونية",
    "إدارة وتشغيل شبكات FTTH و EPON الضوئية",
    "تنظيف وتدقيق وضمان جودة البيانات",
    "إدارة خوادم لينكس والـ Bash Scripts",
    "إدارة المشاريع بالمنهجيات المرنة Agile",
  ],
  experiences: [
    {
      id: "exp-1",
      role: "أخصائي عمليات التجارة الإلكترونية، البيانات والمبيعات",
      company: "تكنو ستور — بغداد، العراق",
      date: "2025 - الحالي",
      bullets: [
        "برمجة وتطوير سكربتات أتمتة مخصصة بلغة بايثون لمعالجة ورفع آلاف المنتجات والبيانات الضخمة واختصار وقت الإنجاز من عدة أيام إلى دقائق معدودة.",
        "إدارة كتالوج المنتجات والمخزون الحي والأسعار لآلاف المنتجات عبر المنصات المختلفة بدقة تامة وبنسبة خطأ 0%.",
        "أتمتة وتكامل مزامنة المخزون والأسعار بين قواعد البيانات الداخلية وأبرز تطبيقات التوصيل العراقية (مسواق، طماطة، جاهز، الريان).",
        "الإشراف على عمليات المبيعات اليومية وإدارة حملات الفيديو التسويقية الرقمية وتحليل سلوك العملاء لزيادة الإيرادات."
      ]
    },
    {
      id: "exp-2",
      role: "استشاري حر لعمليات البيانات والحلول التقنية",
      company: "مشاريع قطاع الدفاع والتجارة الإلكترونية",
      date: "2023 - 2025",
      bullets: [
        "بناء وهيكلة قاعدة بيانات ضخمة تضم أكثر من 22,000 سجل متعدد المنصات لمشروع في قطاع الدفاع مع إمكانية الفرز المتقدم حسب المناطق وجهات الاتصال.",
        "تصميم وإطلاق نظام ERP و POS متكامل لإدارة المطاعم والمخزون يعمل حالياً بكفاءة في 3 فروع نشطة.",
        "حل مشاكل هيكلة الكتالوجات البرمجية والـ API Rate Limits لمنصات تجارة إلكترونية عراقية رائدة (مثل شركة الريان).",
        "إنتاج وإخراج أكثر من 60 فيديو إعلاني تجاري وشروحات تقنية لشركاء التجزئة (Lito Store, Techno Store)."
      ]
    },
    {
      id: "exp-3",
      role: "مسؤول عمليات ومنسق دعم الشبكات",
      company: "قطاع الفعاليات والاتصالات — بغداد",
      date: "2019 - 2023",
      bullets: [
        "قيادة فرق العمليات لتخطيط وتنظيم وتنفيذ فعاليات ومؤتمرات كبرى لأكثر من 150+ شخص بكفاءة عالية.",
        "الإشراف الميداني على إنشاء وتشغيل شبكات الألياف الضوئية FTTH عبر 3 قواطع وربط أكثر من 2,000+ مستخدم بتقنية EPON.",
        "إدارة ومعالجة الأعطال التقنية والصيانة الشاملة لقاعدة مشتركين تضم أكثر من 3,000+ عميل نشط."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "جامعة دجلة – بغداد",
      degree: "بكالوريوس في علوم الحاسوب (Computer Science)",
      year: "2022 - 2026"
    },
    {
      id: "edu-2",
      school: "معهد التكنولوجيا – بغداد",
      degree: "دبلوم في الصناعات الكيماوية (Chemical Industry)",
      year: "2019 - 2021"
    }
  ],
  certifications: [
    { id: "cert-1", title: "شهادة CCNA 1: Introduction to Networks — جامعة دجلة" },
    { id: "cert-2", title: "شهادة مهارات المبيعات وخدمة العملاء — شركة إيرثلنك" },
    { id: "cert-3", title: "تدريب السلامة والصحة المهنية — معهد التكنولوجيا بغداد" }
  ]
};

const DEFAULT_EN_DATA: LanguageSpecificData = {
  fullName: "Haider M. Shwkat",
  jobTitle: "Computer Science Specialist | Data Operations & Workflow Consultant",
  summary: "Computer Science Specialist & Data Operations Consultant with extensive experience in workflow automation, large-scale database management (22K+ records), e-commerce catalog integrity, and optical network infrastructure (FTTH/EPON).",
  email: "haider.m.shwkat@outlook.com",
  phone: "+964 771 896 4778",
  location: "Baghdad, Iraq",
  linkedin: "linkedin.com/in/haidermoe",
  skills: [
    "Python Automation & Scripting",
    "SQL & High-Volume Database Architecture",
    "E-Commerce & Foodics ERP Workflows",
    "FTTH & EPON Optical Network Management",
    "Data Cleansing & Integrity Verification",
    "Linux Server Operations & Bash",
    "Agile Project & Team Leadership"
  ],
  experiences: [
    {
      id: "exp-1",
      role: "E-Commerce, Data Operations & Sales Specialist",
      company: "Techno Store — Baghdad, Iraq",
      date: "2025 - Present",
      bullets: [
        "Engineered custom Python scripts and browser automation tools to streamline large-scale SKU uploads, cutting data processing time from days to minutes.",
        "Managed cataloging, stock accuracy, and pricing across platforms for thousands of active SKUs with zero error rates.",
        "Automated inventory feeds and content sync between internal databases and major Iraqi delivery apps (Miswag, Tamata, Jahez, Al-Rayan).",
        "Supervised daily branch sales operations, managed digital video reels marketing, and leveraged customer insights to boost revenue."
      ]
    },
    {
      id: "exp-2",
      role: "Freelance Data & Technical Operations Consultant",
      company: "Multi-Client / Defense & E-commerce Projects",
      date: "2023 - 2025",
      bullets: [
        "Built a comprehensive database system of 22,000+ multi-platform records for a Defense Sector project with region and contact filtering.",
        "Designed and deployed a fully functional ERP & POS restaurant management system currently driving operations across 3 active restaurants.",
        "Resolved critical catalog structures, API rate limits, and product feature bugs for prominent Iraqi e-commerce platforms (e.g. Al-Rayan).",
        "Produced and executed over 60 commercial reels, technical tutorials, and brand video campaigns for retail partners (Lito Store, Techno Store)."
      ]
    },
    {
      id: "exp-3",
      role: "Operations Lead & Network Support Coordinator",
      company: "Events & Telecommunications Sector — Baghdad",
      date: "2019 - 2023",
      bullets: [
        "Led operational teams to plan, coordinate, and execute large-scale corporate and public events for 150+ guests with high efficiency.",
        "Directed the construction and deployment of FTTH networks across 3 districts, connecting 2,000+ active users using EPON systems.",
        "Managed end-to-end troubleshooting and maintenance coordination for a subscriber base of 3,000+ active network clients."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "Dijlah University – Baghdad",
      degree: "Bachelor's Degree in Computer Science",
      year: "2022 - 2026"
    },
    {
      id: "edu-2",
      school: "Institute of Technology – Baghdad",
      degree: "Diploma in Chemical Industry",
      year: "2019 - 2021"
    }
  ],
  certifications: [
    { id: "cert-1", title: "CCNA 1: Introduction to Networks — Dijlah University" },
    { id: "cert-2", title: "Sales and Customer Service Skills — EarthLink Telecommunications" },
    { id: "cert-3", title: "Occupational Safety Training — Institute of Technology Baghdad" }
  ]
};

export default function PublicCvBuilderPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const [activeTab, setActiveTab] = useState<"presets" | "personal" | "experience" | "education" | "skills" | "styling" | "qr">("personal");

  // SEPARATE BILINGUAL STATE STORES
  const [docAR, setDocAR] = useState<LanguageSpecificData>(DEFAULT_AR_DATA);
  const [docEN, setDocEN] = useState<LanguageSpecificData>(DEFAULT_EN_DATA);

  // SHARED ASSET & VISIBILITY STATES
  const [photo, setPhoto] = useState<string>("/cv-photo.png");
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [qrUrl, setQrUrl] = useState<string>("https://cv-wine-tau.vercel.app");
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showSkills, setShowSkills] = useState<boolean>(true);
  const [showEducation, setShowEducation] = useState<boolean>(true);
  const [showCertifications, setShowCertifications] = useState<boolean>(true);

  // FORMATTING & PRESET STATES
  const [activePreset, setActivePreset] = useState<string>("arabic-modern-blue");
  const [layoutFormat, setLayoutFormat] = useState<"single-column" | "two-column-sidebar" | "modern-executive" | "minimal-compact">("two-column-sidebar");
  const [templateStyle, setTemplateStyle] = useState<"clean-white" | "modern-dark" | "executive-blue">("clean-white");
  const [accentColor, setAccentColor] = useState<string>("#2563eb");
  const [fontFamily, setFontFamily] = useState<string>("Tajawal");
  const [fontSizeScale, setFontSizeScale] = useState<"compact" | "normal" | "large">("normal");
  const [pageMargin, setPageMargin] = useState<"compact" | "normal" | "wide">("normal");
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed">("normal");

  const [a4Zoom, setA4Zoom] = useState<number>(0.85);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Active current document based on selected language
  const curDoc = lang === "AR" ? docAR : docEN;
  const setCurDoc = (updater: (prev: LanguageSpecificData) => LanguageSpecificData) => {
    if (lang === "AR") {
      setDocAR(updater);
    } else {
      setDocEN(updater);
    }
  };

  // Generate QR Code dynamically
  useEffect(() => {
    let isMounted = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrUrl || "https://cv-wine-tau.vercel.app", {
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
  }, [qrUrl]);

  // Track visitor
  useEffect(() => {
    fetch("/api/track?path=/cv&page=Public_Bilingual_CV_Builder").catch(() => {});
  }, []);

  const handleSwitchLanguage = (newLang: "AR" | "EN") => {
    setLang(newLang);
    setFontFamily(newLang === "AR" ? "Tajawal" : "Outfit");
    showToast(newLang === "AR" ? "تم التحويل إلى وضع السيرة باللغة العربية (RTL)" : "Switched to English Resume mode (LTR)");
  };

  const handleCopyCurrentToOther = () => {
    if (lang === "AR") {
      setDocEN({ ...docAR });
      showToast("تم نسخ البيانات العربية إلى النموذج الإنجليزي بنجاح");
    } else {
      setDocAR({ ...docEN });
      showToast("Copied English data to Arabic resume template");
    }
  };

  const handleLoadSampleData = () => {
    if (lang === "AR") {
      setDocAR({ ...DEFAULT_AR_DATA });
      showToast("تم تحميل نموذج سيرة ذاتية جاهز باللغة العربية");
    } else {
      setDocEN({ ...DEFAULT_EN_DATA });
      showToast("Loaded ready English sample resume");
    }
  };

  const handleClearCurrent = () => {
    if (window.confirm(lang === "AR" ? "هل أنت متأكد من تفريغ كافة الحقول للغة الحالية؟" : "Are you sure you want to clear all fields for the active language?")) {
      const emptyDoc: LanguageSpecificData = {
        fullName: "",
        jobTitle: "",
        summary: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        skills: [],
        experiences: [],
        education: [],
        certifications: []
      };
      setCurDoc(() => emptyDoc);
      showToast(lang === "AR" ? "تم تفريغ الحقول" : "Cleared all fields");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
        showToast(lang === "AR" ? "تم تحميل وتعيين الصورة الشخصية بنجاح" : "Profile photo uploaded successfully");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetId: string) => {
    const p = CV_TEMPLATES_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(p.id);
    setAccentColor(p.accent);
    setTemplateStyle(p.style);
    setLayoutFormat(p.format);
    setFontFamily(lang === "AR" ? "Tajawal" : p.font);
    setFontSizeScale(p.fontSize);
    setPageMargin(p.margin);
    setLineSpacing(p.spacing);
    showToast(lang === "AR" ? `تم تطبيق قالب: ${p.title}` : `Applied preset: ${p.title}`);
  };

  // EXPERIENCE HANDLERS
  const handleAddExperience = () => {
    const newExp: CvExperience = {
      id: `exp-${Date.now()}`,
      role: lang === "AR" ? "المسمى الوظيفي الجديد" : "Job Title",
      company: lang === "AR" ? "اسم الشركة / الجهة" : "Company Name",
      date: lang === "AR" ? "2024 - الحالي" : "2024 - Present",
      bullets: [lang === "AR" ? "أدخل نقطة إنجاز أو مهمة وظيفية هنا..." : "Describe a key achievement or responsibility here..."]
    };
    setCurDoc((prev) => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
    showToast(lang === "AR" ? "تمت إضافة خبرة جديدة" : "Added new experience");
  };

  const handleRemoveExperience = (id: string) => {
    setCurDoc((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  };

  const handleAddBullet = (expId: string) => {
    setCurDoc((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, lang === "AR" ? "مهمة أو إنجاز جديد..." : "New bullet point..."] } : exp
      )
    }));
  };

  const handleUpdateBullet = (expId: string, bIndex: number, text: string) => {
    setCurDoc((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const nextBullets = [...exp.bullets];
          nextBullets[bIndex] = text;
          return { ...exp, bullets: nextBullets };
        }
        return exp;
      })
    }));
  };

  const handleRemoveBullet = (expId: string, bIndex: number) => {
    setCurDoc((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const nextBullets = exp.bullets.filter((_, idx) => idx !== bIndex);
          return { ...exp, bullets: nextBullets };
        }
        return exp;
      })
    }));
  };

  // EDUCATION & CERTS HANDLERS
  const handleAddEducation = () => {
    const newEdu: CvEducation = {
      id: `edu-${Date.now()}`,
      school: lang === "AR" ? "اسم الجامعة أو المعهد" : "University / School",
      degree: lang === "AR" ? "اسم الشهادة أو التخصص" : "Degree / Field",
      year: lang === "AR" ? "2022 - 2026" : "2022 - 2026"
    };
    setCurDoc((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const handleRemoveEducation = (id: string) => {
    setCurDoc((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  const handleAddCertification = () => {
    const newCert: CvCertification = {
      id: `cert-${Date.now()}`,
      title: lang === "AR" ? "اسم الشهادة التدريبية أو المهنية" : "Certificate Title"
    };
    setCurDoc((prev) => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const handleRemoveCertification = (id: string) => {
    setCurDoc((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  };

  // SKILLS HANDLERS
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    setCurDoc((prev) => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillIndex: number) => {
    setCurDoc((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== skillIndex) }));
  };

  // DUAL EXPORT PDF FUNCTION (SUPPORTS ARABIC & ENGLISH DIRECTLY)
  const handleDownloadPdf = async (targetLang: "AR" | "EN") => {
    const isTargetArabic = targetLang === "AR";
    
    // Switch active view to the export language if different
    if (lang !== targetLang) {
      setLang(targetLang);
      setFontFamily(isTargetArabic ? "Tajawal" : "Outfit");
      // Wait a tick for DOM re-render
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    const element = document.getElementById("cv-pdf-canvas");
    if (!element) return;

    const activeData = isTargetArabic ? docAR : docEN;
    const sanitizedName = (activeData.fullName || "My_CV").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
    const pdfFileName = `${sanitizedName}_CV_${targetLang}_2026.pdf`;

    setIsGeneratingPdf(true);
    showToast(isTargetArabic ? "جاري تحويل وتجهيز ملف الـ PDF باللغة العربية..." : "Rendering English PDF file...");

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

      // Multi-page protection loop
      while (heightLeft > 5) {
        position = position - pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(pdfFileName);
      showToast(isTargetArabic ? `تم تنزيل السيرة الذاتية (بالعربية) بنجاح` : `Successfully downloaded English CV PDF`);
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast(isTargetArabic ? "حدث خطأ أثناء تنزيل الـ PDF" : "Error generating PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isArabic = lang === "AR";

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
      {/* HIDDEN FILE INPUT FOR PHOTO */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

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

      {/* TOP HEADER WITH DUAL EXPORT CONTROLS */}
      <header
        style={{
          background: "rgba(10, 11, 18, 0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          
          {/* LOGO & TITLE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                background: "#1e293b",
                color: "#60a5fa",
                border: "1px solid #334155",
                padding: "6px 12px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "17px", fontWeight: "900", margin: 0, color: "#ffffff" }}>
                  {isArabic ? "صانع السيرة الذاتية ثنائي اللغة (عربي / English)" : "Bilingual ATS CV Builder & PDF Studio"}
                </h1>
                <span style={{ background: "#16a34a", color: "#ffffff", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "900" }}>
                  BILINGUAL AR / EN
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {isArabic ? "صمم سيرتك الذاتية وصدر ملف PDF منفصل بالعربية أو بالإنجليزية بنقرة زر واحدة" : "Build your CV and export dedicated print-ready PDFs in Arabic or English with 1-click"}
              </span>
            </div>
          </div>

          {/* DUAL LANGUAGE TOGGLE & DUAL PDF EXPORT BUTTONS */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            
            {/* ACTIVE EDITING LANGUAGE SELECTOR */}
            <div style={{ display: "flex", background: "#151624", padding: "3px", borderRadius: "8px", border: "1.5px solid #3b82f6" }}>
              <button
                onClick={() => handleSwitchLanguage("AR")}
                style={{
                  background: isArabic ? "#2563eb" : "transparent",
                  color: isArabic ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                تعديل العربية (AR)
              </button>
              <button
                onClick={() => handleSwitchLanguage("EN")}
                style={{
                  background: !isArabic ? "#2563eb" : "transparent",
                  color: !isArabic ? "#ffffff" : "#94a3b8",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Edit English (EN)
              </button>
            </div>

            {/* DIRECT EXPORT BUTTON 1: ARABIC PDF */}
            <button
              onClick={() => handleDownloadPdf("AR")}
              disabled={isGeneratingPdf}
              style={{
                background: "#15803d",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(21, 128, 61, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>تصدير PDF (بالعربية)</span>
            </button>

            {/* DIRECT EXPORT BUTTON 2: ENGLISH PDF */}
            <button
              onClick={() => handleDownloadPdf("EN")}
              disabled={isGeneratingPdf}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>Export PDF (English)</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main style={{ maxWidth: "1440px", margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 430px) 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* LEFT INTERACTIVE EDITOR PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* TOP BAR ACTIONS (COPY TO OTHER LANG, LOAD SAMPLE, CLEAR) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0e101d", padding: "10px 14px", borderRadius: "12px", border: "1px solid #334155", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{isArabic ? "الوضع النشط:" : "Active:"}</span>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "#60a5fa" }}>
                  {isArabic ? "النسخة العربية" : "English Version"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCopyCurrentToOther}
                  title={isArabic ? "نسخ البيانات الحالية إلى النموذج الإنجليزي" : "Copy current data to Arabic model"}
                  style={{
                    background: "#1e293b",
                    color: "#38bdf8",
                    border: "1px solid #0284c740",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {isArabic ? "نسخ إلى الإنجليزية ⇄" : "Copy to Arabic ⇄"}
                </button>

                <button
                  onClick={handleLoadSampleData}
                  style={{
                    background: "#1e293b",
                    color: "#93c5fd",
                    border: "1px solid #3b82f640",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {isArabic ? "نموذج تجريبي" : "Load Sample"}
                </button>

                <button
                  onClick={handleClearCurrent}
                  style={{
                    background: "#1e1e2d",
                    color: "#f87171",
                    border: "1px solid #ef444440",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {isArabic ? "تفريغ" : "Clear"}
                </button>
              </div>
            </div>

            {/* SUB-TABS NAVIGATION BAR */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "6px",
                background: "#0d0f1a",
                padding: "6px",
                borderRadius: "14px",
                border: "1px solid #334155",
              }}
            >
              {[
                { id: "personal", label: isArabic ? "1. البيانات والنبذة" : "1. Personal & Bio" },
                { id: "experience", label: isArabic ? "2. الخبرات المهنية" : "2. Experience" },
                { id: "education", label: isArabic ? "3. التعليم والشهادات" : "3. Education & Certs" },
                { id: "skills", label: isArabic ? "4. المهارات" : "4. Skills" },
                { id: "presets", label: isArabic ? "5. القوالب الـ 9" : "5. Templates" },
                { id: "styling", label: isArabic ? "6. التنسيق والـ QR" : "6. Style & QR" },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setActiveTab(tb.id as any)}
                  style={{
                    background: activeTab === tb.id ? "#2563eb" : "transparent",
                    color: activeTab === tb.id ? "#ffffff" : "#94a3b8",
                    border: "none",
                    padding: "8px 4px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PERSONAL INFO */}
            {activeTab === "personal" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                    {isArabic ? "البيانات الشخصية (النسخة العربية)" : "Personal Information (English Version)"}
                  </h3>
                  <span style={{ fontSize: "11px", color: isArabic ? "#34d399" : "#60a5fa", fontWeight: "800" }}>
                    {isArabic ? "وضع الكتابة: عربي" : "Mode: English"}
                  </span>
                </div>

                {/* PHOTO UPLOAD */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "#151624", borderRadius: "12px", border: "1px solid #334155" }}>
                  <div style={{ width: "65px", height: "65px", borderRadius: "12px", overflow: "hidden", background: "#1e293b", border: "1.5px solid #60a5fa", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photo ? (
                      <img src={photo} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{isArabic ? "بدون صورة" : "No Photo"}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      {isArabic ? "رفع صورتك الشخصية" : "Upload Your Photo"}
                    </button>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94a3b8", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={showPhoto}
                        onChange={(e) => setShowPhoto(e.target.checked)}
                      />
                      <span>{isArabic ? "إظهار الصورة في السيرة" : "Show Photo in CV"}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                    {isArabic ? "الاسم الكامل:" : "Full Name:"}
                  </label>
                  <input
                    type="text"
                    value={curDoc.fullName}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder={isArabic ? "مثال: حيدر محمد شوكت" : "e.g. Haider M. Shwkat"}
                    style={{ width: "100%", padding: "8px 12px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                    {isArabic ? "المسمى الوظيفي والمهني:" : "Professional Job Title:"}
                  </label>
                  <input
                    type="text"
                    value={curDoc.jobTitle}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder={isArabic ? "مثال: مبرمج بايثون ومحلل بيانات" : "e.g. Computer Science Specialist"}
                    style={{ width: "100%", padding: "8px 12px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                      {isArabic ? "البريد الإلكتروني:" : "Email Address:"}
                    </label>
                    <input
                      type="email"
                      value={curDoc.email}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      style={{ width: "100%", padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                      {isArabic ? "رقم الهاتف:" : "Phone Number:"}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={curDoc.phone}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+964 770 000 0000"
                      style={{ width: "100%", padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                      {isArabic ? "المدينة / الدولة:" : "Location:"}
                    </label>
                    <input
                      type="text"
                      value={curDoc.location}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder={isArabic ? "بغداد، العراق" : "Baghdad, Iraq"}
                      style={{ width: "100%", padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                      {isArabic ? "رابط لينكد إن / الموقع:" : "LinkedIn / Portfolio:"}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={curDoc.linkedin}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/username"
                      style={{ width: "100%", padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "4px" }}>
                    {isArabic ? "الهدف المهني والملخص التنفيذي:" : "Executive Summary & Bio:"}
                  </label>
                  <textarea
                    rows={4}
                    value={curDoc.summary}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder={isArabic ? "اكتب نبذة موجزة عن خبرتك وأهدافك المهنية..." : "Write a concise summary of your background and achievements..."}
                    style={{ width: "100%", padding: "8px 12px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px", outline: "none", resize: "vertical", lineHeight: "1.5" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                    {isArabic ? "الخبرات المهنية والعملية" : "Work Experience"}
                  </h3>

                  <button
                    onClick={handleAddExperience}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    + {isArabic ? "إضافة خبرة" : "Add Role"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "460px", overflowY: "auto" }}>
                  {curDoc.experiences.map((exp, expIdx) => (
                    <div
                      key={exp.id}
                      style={{
                        background: "#151624",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#38bdf8" }}>
                          #{expIdx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveExperience(exp.id)}
                          style={{
                            background: "transparent",
                            color: "#ef4444",
                            border: "none",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                          }}
                        >
                          ✕ {isArabic ? "حذف" : "Remove"}
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => x.id === exp.id ? { ...x, role: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "المسمى الوظيفي" : "Role"}
                          style={{ padding: "6px 10px", background: "#0e101d", border: "1px solid #334155", borderRadius: "6px", color: "#ffffff", fontSize: "12px" }}
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => x.id === exp.id ? { ...x, company: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "اسم الشركة" : "Company"}
                          style={{ padding: "6px 10px", background: "#0e101d", border: "1px solid #334155", borderRadius: "6px", color: "#ffffff", fontSize: "12px" }}
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={exp.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => x.id === exp.id ? { ...x, date: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "الفترة (مثال: 2023 - الحالي)" : "Date range"}
                          style={{ width: "100%", padding: "6px 10px", background: "#0e101d", border: "1px solid #334155", borderRadius: "6px", color: "#ffffff", fontSize: "12px" }}
                        />
                      </div>

                      {/* BULLETS */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{isArabic ? "نقاط المهام والإنجازات:" : "Bullet Points:"}</span>
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                              style={{ flex: 1, padding: "5px 8px", background: "#0e101d", border: "1px solid #334155", borderRadius: "6px", color: "#ffffff", fontSize: "11.5px" }}
                            />
                            <button
                              onClick={() => handleRemoveBullet(exp.id, bIdx)}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => handleAddBullet(exp.id)}
                          style={{
                            background: "transparent",
                            border: "1px dashed #3b82f6",
                            color: "#60a5fa",
                            padding: "4px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                            marginTop: "2px",
                          }}
                        >
                          + {isArabic ? "إضافة نقطة إنجاز" : "Add Bullet"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EDUCATION & CERTS */}
            {activeTab === "education" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* EDUCATION */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                      {isArabic ? "المؤهلات العلمية (Education)" : "Education"}
                    </h3>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          type="checkbox"
                          checked={showEducation}
                          onChange={(e) => setShowEducation(e.target.checked)}
                        />
                        <span>{isArabic ? "إظهار" : "Show"}</span>
                      </label>
                      <button
                        onClick={handleAddEducation}
                        style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {curDoc.education.map((edu) => (
                      <div key={edu.id} style={{ background: "#151624", padding: "10px", borderRadius: "8px", border: "1px solid #334155", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "6px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              education: prev.education.map((x) => x.id === edu.id ? { ...x, degree: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "الشهادة والتخصص" : "Degree"}
                          style={{ padding: "5px 8px", background: "#0e101d", border: "1px solid #334155", borderRadius: "5px", color: "#ffffff", fontSize: "11.5px" }}
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              education: prev.education.map((x) => x.id === edu.id ? { ...x, school: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "الجامعة / المعهد" : "School"}
                          style={{ padding: "5px 8px", background: "#0e101d", border: "1px solid #334155", borderRadius: "5px", color: "#ffffff", fontSize: "11.5px" }}
                        />
                        <button
                          onClick={() => handleRemoveEducation(edu.id)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CERTIFICATIONS */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                      {isArabic ? "الشهادات والاعتمادات (Certifications)" : "Certifications"}
                    </h3>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          type="checkbox"
                          checked={showCertifications}
                          onChange={(e) => setShowCertifications(e.target.checked)}
                        />
                        <span>{isArabic ? "إظهار" : "Show"}</span>
                      </label>
                      <button
                        onClick={handleAddCertification}
                        style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {curDoc.certifications.map((cert) => (
                      <div key={cert.id} style={{ background: "#151624", padding: "8px 10px", borderRadius: "8px", border: "1px solid #334155", display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurDoc((prev) => ({
                              ...prev,
                              certifications: prev.certifications.map((x) => x.id === cert.id ? { ...x, title: val } : x)
                            }));
                          }}
                          placeholder={isArabic ? "اسم الشهادة المعتمدة" : "Certification Title"}
                          style={{ flex: 1, padding: "5px 8px", background: "#0e101d", border: "1px solid #334155", borderRadius: "5px", color: "#ffffff", fontSize: "11.5px" }}
                        />
                        <button
                          onClick={() => handleRemoveCertification(cert.id)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: SKILLS */}
            {activeTab === "skills" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                    {isArabic ? "المهارات والقدرات التقنية" : "Skills & Competencies"}
                  </h3>

                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <input
                      type="checkbox"
                      checked={showSkills}
                      onChange={(e) => setShowSkills(e.target.checked)}
                    />
                    <span>{isArabic ? "إظهار في السيرة" : "Show"}</span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSkill(); }}
                    placeholder={isArabic ? "أدخل مهارة واضغط Enter..." : "Enter skill and press Enter..."}
                    style={{ flex: 1, padding: "8px 12px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px" }}
                  />
                  <button
                    onClick={handleAddSkill}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    + {isArabic ? "إضافة" : "Add"}
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                  {curDoc.skills.map((sk, skIdx) => (
                    <span
                      key={skIdx}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #3b82f640",
                        color: "#93c5fd",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{sk}</span>
                      <button
                        onClick={() => handleRemoveSkill(skIdx)}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "11px", padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PRESETS */}
            {activeTab === "presets" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1.5px solid #2563eb", boxShadow: "0 8px 25px rgba(37,99,235,0.15)" }}>
                <div style={{ marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: "0 0 4px 0" }}>
                    {isArabic ? "مكتبة القوالب المتخصصة (9 مجالات)" : "Specialized Industry Presets (9 Domains)"}
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {isArabic ? "اختر قالباً يتناسب مع مجالك المهني:" : "Select a preset tailored to your professional domain:"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", maxHeight: "460px", overflowY: "auto", paddingRight: "4px" }}>
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
                          padding: "10px 12px",
                          textAlign: isArabic ? "right" : "left",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "13px", color: isSelected ? "#60a5fa" : "#ffffff", fontWeight: "800" }}>{p.title}</strong>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.accent, display: "inline-block" }} />
                        </div>
                        <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700" }}>{p.field}</div>
                        <p style={{ fontSize: "10.5px", color: "#94a3b8", margin: 0, lineHeight: "1.35" }}>{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: STYLING & QR */}
            {activeTab === "styling" && (
              <div style={{ background: "#0e101d", padding: "20px", borderRadius: "18px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>
                  {isArabic ? "تنسيق الصفحة والألوان ورمز الـ QR" : "Layout, Colors & QR Studio"}
                </h3>

                <div>
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
                          padding: "8px 6px",
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

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#94a3b8", marginBottom: "6px" }}>
                    {isArabic ? "لون التمييز (Accent Color):" : "Accent Color:"}
                  </label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{ width: "38px", height: "38px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px" }}
                    />
                  </div>
                </div>

                {/* QR CODE INPUT */}
                <div style={{ borderTop: "1px solid #334155", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                      {isArabic ? "رابط رمز الـ QR المخصص:" : "Custom QR URL:"}
                    </label>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <input
                        type="checkbox"
                        checked={showQrCode}
                        onChange={(e) => setShowQrCode(e.target.checked)}
                      />
                      <span>{isArabic ? "إظهار الـ QR" : "Show"}</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://yourportfolio.com or WhatsApp link"
                    style={{ width: "100%", padding: "8px 10px", background: "#151624", border: "1px solid #334155", borderRadius: "8px", color: "#ffffff", fontSize: "12px" }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* RIGHT STICKY A4 PREVIEW DESK */}
          <section
            style={{
              position: "sticky",
              top: "80px",
              alignSelf: "start",
              background: "#06070d",
              padding: "20px 14px",
              borderRadius: "20px",
              border: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            {/* DESK TOOLBAR */}
            <div style={{ width: "100%", maxWidth: "794px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isArabic ? "#16a34a" : "#0284c7" }} />
                <span style={{ fontSize: "12.5px", fontWeight: "900", color: "#ffffff" }}>
                  {isArabic ? "معاينة السيرة (بالعربية AR: ISO A4)" : "Live Preview (English EN: ISO A4)"}
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
                      {showPhoto && photo && (
                        <div style={{ width: "100px", height: "100px", borderRadius: "14px", overflow: "hidden", border: `2.5px solid ${accentColor}`, margin: "0 auto", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                          <img src={photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                          {isArabic ? "بيانات الاتصال" : "Contact Info"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "10px", color: templateStyle === "clean-white" ? "#475569" : "#94a3b8" }}>
                          {curDoc.email && <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{curDoc.email}</span></div>}
                          {curDoc.phone && <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{curDoc.phone}</span></div>}
                          {curDoc.location && <div>📍 {curDoc.location}</div>}
                          {curDoc.linkedin && <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{curDoc.linkedin}</span></div>}
                        </div>
                      </div>

                      {showSkills && curDoc.skills.length > 0 && (
                        <div>
                          <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                            {isArabic ? "المهارات والقدرات" : "Skills & Competencies"}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {curDoc.skills.map((sk, i) => (
                              <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", fontWeight: "700" }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {showEducation && curDoc.education.length > 0 && (
                        <div>
                          <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                            {isArabic ? "المؤهلات العلمية" : "Education"}
                          </div>
                          {curDoc.education.map((edu, i) => (
                            <div key={i} style={{ fontSize: "10px", marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              <strong>{edu.degree}</strong>
                              <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8" }}>{edu.school} {edu.year ? `(${edu.year})` : ""}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showCertifications && curDoc.certifications.length > 0 && (
                        <div>
                          <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                            {isArabic ? "الشهادات والاعتمادات" : "Certifications"}
                          </div>
                          {curDoc.certifications.map((cert, i) => (
                            <div key={i} style={{ fontSize: "10px", marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              • {cert.title}
                            </div>
                          ))}
                        </div>
                      )}

                      {showQrCode && qrCodeDataUrl && (
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
                          {curDoc.fullName || (isArabic ? "الاسم الكامل" : "Your Name")}
                        </h2>
                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: accentColor }}>
                          {curDoc.jobTitle || (isArabic ? "المسمى الوظيفي" : "Professional Title")}
                        </div>
                      </div>

                      {curDoc.summary && (
                        <div style={{ marginBottom: "18px" }}>
                          <div style={{ fontSize: "12px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                            {isArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                          </div>
                          <p style={{ fontSize: "11px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                            {curDoc.summary}
                          </p>
                        </div>
                      )}

                      {curDoc.experiences.length > 0 && (
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                            {isArabic ? "الخبرات المهنية والعملية" : "Work Experience"}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {curDoc.experiences.map((exp, i) => (
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
                      )}
                    </div>
                  </div>
                ) : (
                  /* SINGLE COLUMN / EXECUTIVE / MINIMAL LAYOUT */
                  <div>
                    {/* HEADER ROW */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accentColor}`, paddingBottom: "16px", marginBottom: "20px", gap: "20px" }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "0.5px", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                          {curDoc.fullName || (isArabic ? "الاسم الكامل" : "Your Name")}
                        </h2>
                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: accentColor, marginBottom: "10px" }}>
                          {curDoc.jobTitle || (isArabic ? "المسمى الوظيفي" : "Professional Title")}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "11px", color: templateStyle === "clean-white" ? "#475569" : "#94a3b8", fontWeight: "600" }}>
                          {curDoc.email && <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{curDoc.email}</span></div>}
                          {curDoc.phone && <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{curDoc.phone}</span></div>}
                          {curDoc.location && <div>📍 {curDoc.location}</div>}
                          {curDoc.linkedin && <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{curDoc.linkedin}</span></div>}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        {showQrCode && qrCodeDataUrl && (
                          <div style={{ padding: "4px", background: "#ffffff", borderRadius: "8px", border: `1.5px solid ${accentColor}`, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                            <img src={qrCodeDataUrl} alt="QR" style={{ width: "55px", height: "55px", objectFit: "contain" }} />
                            <span style={{ fontSize: "6.5px", fontWeight: "900", color: "#0f172a", marginTop: "1px" }}>
                              {isArabic ? "الموقع" : "PORTFOLIO"}
                            </span>
                          </div>
                        )}

                        {showPhoto && photo && (
                          <div style={{ width: "75px", height: "75px", borderRadius: "12px", overflow: "hidden", border: `2px solid ${accentColor}`, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                            <img src={photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EXECUTIVE SUMMARY */}
                    {curDoc.summary && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                          {isArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                        </div>
                        <p style={{ fontSize: "11px", lineHeight: "1.65", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                          {curDoc.summary}
                        </p>
                      </div>
                    )}

                    {/* WORK EXPERIENCE */}
                    {curDoc.experiences.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                          {isArabic ? "الخبرات المهنية والعملية" : "Professional Work Experience"}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          {curDoc.experiences.map((exp, i) => (
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
                    )}

                    {/* TECHNICAL SKILLS */}
                    {showSkills && curDoc.skills.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "10px" }}>
                          {isArabic ? "المهارات التقنية والقدرات" : "Core Technical Skills"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {curDoc.skills.map((sk, i) => (
                            <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "3px 9px", borderRadius: "6px", fontSize: "10.5px", fontWeight: "700" }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EDUCATION & CERTIFICATIONS DUAL ROW */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {showEducation && curDoc.education.length > 0 && (
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                            {isArabic ? "المؤهلات العلمية" : "Academic Education"}
                          </div>
                          {curDoc.education.map((edu, i) => (
                            <div key={i} style={{ fontSize: "11px", marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              <strong>{edu.degree}</strong>
                              <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontSize: "10.5px" }}>{edu.school} {edu.year ? `(${edu.year})` : ""}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showCertifications && curDoc.certifications.length > 0 && (
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                            {isArabic ? "الشهادات والاعتمادات" : "Certified Training"}
                          </div>
                          {curDoc.certifications.map((cert, i) => (
                            <div key={i} style={{ fontSize: "10.5px", marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              • {cert.title}
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
