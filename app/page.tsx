"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortfolioData } from "@/lib/portfolio";
import { useTheme } from "./hooks/useTheme";

// REUSABLE FLIP-TEXT LINK COMPONENT
function FlipLink({ children, href, download, target, style, color = "#0f111a", hoverColor = "#2563eb" }: { children: React.ReactNode; href: string; download?: string; target?: string; style?: React.CSSProperties; color?: string; hoverColor?: string }) {
  return (
    <a
      href={href}
      download={download}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      style={{
        fontSize: "14px",
        fontWeight: "800",
        fontFamily: "'Tajawal', 'Outfit', sans-serif",
        padding: "0 4px",
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

const translations = {
  AR: {
    logo: "حيدر محمد",
    navHome: "الرئيسية",
    navStats: "الإحصائيات والمهارات",
    navAbout: "النبذة",
    navExperience: "الخبرات",
    navEducation: "التعليم",
    navContact: "تواصل معي",
    downloadCV: "تحميل ملف السيرة PDF",
    becomeClient: "كُن عميلاً",
    heroLine1: "نصنع أفضل",
    heroLine2: "النتائج",
    heroLine3: "الرقمية",
    bio: "حيدر محمد شوكت — متخصص في علوم الحاسوب واستشاري عمليات البيانات والأتمتة بلغة Python، إدارة قواعد البيانات الضخمة (+22K سجل)، تكامل التجارة الإلكترونية، ونشر أنظمة ERP وشبكات FTTH.",
    statsTag: "01 — الإحصائيات والأرقام",
    statsTitle: "أرقام مثبتة من المسيرة المهنية",
    stat1: "سجل بيانات متكامل تمت هندسته وأرشفته لمشروع في قطاع الدفاع",
    stat2: "مشترك نشط تم تقديم الدعم الفني والصيانة الميدانية الكاملة لهم",
    stat3: "مطاعم تعمل بنظام ERP & POS المتكامل الذي طوّره ونشره حيدر",
    stat4: "مستخدم تم ربطهم وتغطيتهم بشبكات الـ FTTH الحديثة بنظام EPON",
    expTag: "02 — الخبرات العملية",
    expTitle: "سجل مهني حافل بتحقيق الأهداف والنتائج",
    exp1Date: "2025 - حتى الآن",
    exp1Company: "تكنو ستور — بغداد",
    exp1Role: "أخصائي عمليات التجارة الإلكترونية، البيانات والمبيعات",
    exp1Bullets: [
      "أتمتة وهندسة سكربتات بايثون وأدوات متصفح لرفع وتحديث آلاف المنتجات (SKUs)، مقلصاً زمن المعالجة من أيام إلى دقائق معدودة.",
      "إدارة كتالوجات المنتجات والتسعير والمخزون لآلاف المنتجات النشطة مع الحفاظ على سلامة البيانات بنسبة خطأ 0%.",
      "الربط والمزامنة الآلية للمخزون والمنتجات بين قواعد البيانات وتطبيقات التوصيل العراقية الكبرى (مسواك، طماطة، جاهز، الريان).",
      "الإشراف على مبيعات الفروع اليومية، وإدارة التسويق الرقمي عبر الريلز، واستثمار ملاحظات الزبائن لزيادة الإيرادات."
    ],
    exp2Date: "2023 - 2025",
    exp2Company: "مشاريع متعددة / قطاع الدفاع والتجارة الإلكترونية",
    exp2Role: "استشاري حر لعمليات البيانات والحلول التقنية",
    exp2Bullets: [
      "هندسة وبناء منظومة قواعد بيانات شاملة تضم أكثر من 22,000 سجل لقطاع الدفاع مع نظام فلترة للمناطق والاتصال.",
      "تصميم ونشر نظام ERP و POS متكامل لإدارة المطاعم يعمل حالياً بنجاح ويقود العمليات في 3 مطاعم نشطة.",
      "حل المشكلات التقنية الحرجة وتجاوز قيود الـ API وهيكلة الكتالوجات لمنصات تجارة إلكترونية كبرى مثل منصة الريان.",
      "إنتاج وتنفيذ أكثر من 60 فيديو ترويجي وحملات ريلز تعليمية لشركاء التجزئة (Lito Store, Techno Store)."
    ],
    exp3Date: "2019 - 2023",
    exp3Company: "قطاع الفعاليات والاتصالات — بغداد",
    exp3Role: "مسؤول عمليات ومنسق دعم الشبكات",
    exp3Bullets: [
      "قيادة وإدارة فرق العمل لتخطيط وتنفيذ فعاليات ومؤتمرات كبرى لأكثر من 150 ضيفاً بأعلى معايير الجودة.",
      "الإشراف على مد وبناء شبكات الألياف الضوئية FTTH عبر 3 مناطق، وربط أكثر من 2000 مستخدم نشط بنظام EPON.",
      "إدارة وتنسيق الدعم الفني والصيانة الميدانية لقاعدة مشتركين تضم أكثر من 3000 عميل شبكات."
    ],
    navTools: "الأدوات",
    toolsTag: "03 — الأدوات والنظم التفاعلية",
    toolsTitle: "أدوات برمجية طوّرتها لتسريع وأتمتة العمليات",
    toolsSubtitle: "حلول ويب وأتمتة سريعة صممتها لمعالجة ملفات الإكسل الضخمة وتنزيل الصور وتحديث الأسعار والمخزون.",
    tool1Title: "مقارنة وتحديث أسعار إكسل (Tekno Diff)",
    tool1Desc: "أداة ويب تفاعلية لمقارنة ملفات الإكسل الكبيرة، كشف فروقات الأسعار والمخزون، وتحديث آلاف المنتجات بنقرة زر وبكل دقة.",
    tool1Action: "مقارنة ملفات الإكسل",
    tool2Title: "تنزيل وتسمية الصور من الإكسل (Image Downloader)",
    tool2Desc: "أداة لاستخراج روابط الصور من ملفات الإكسل والـ CSV، تنزيلها وتسميتها بأسماء المنتجات الصحيحة، وحفظها في ملف ZIP بضغطة زر.",
    tool2Action: "تنزيل الصور من الإكسل",
    tool3Title: "إنشاء سيرة ذاتية احترافية",
    tool3Desc: "أداة تفاعلية ثنائية اللغة (عربي / إنجليزي) تتيح تخصيص وتصميم السيرة الذاتية عبر قوالب متخصصة، مع توليد فوري للـ QR Code وتصدير ملف PDF عالي الدقة مطابق للمعايير.",
    tool3Action: "إنشاء سيرة ذاتية",
    eduTag: "04 — التعليم والشهادات",
    eduTitle: "المؤهلات الأكاديمية والتدريب المعتمد",
    edu1Year: "2022 - 2026",
    edu1School: "جامعة دجلة – بغداد",
    edu1Degree: "بكالوريوس في علوم الحاسوب (Computer Science)",
    edu2Year: "2019 - 2021",
    edu2School: "معهد التكنولوجيا – بغداد",
    edu2Degree: "دبلوم في الصناعات الكيماوية (Chemical Industry)",
    cert1: "شهادة CCNA 1: Introduction to Networks — جامعة دجلة",
    cert2: "شهادة مهارات المبيعات وخدمة العملاء — شركة إيرثلنك",
    cert3: "تدريب السلامة والصحة المهنية — معهد التكنولوجيا بغداد",
    footerSubtitle: "جاهز لمساعدتك في بناء وإدارة أفضل نظام بيانات، أتمتة برمجية، وتجارة إلكترونية.",
    drawerTitle: "مرحباً! أخبرنا بكل التفاصيل",
    drawerSubtitle: "يسعدنا التعاون معك لبناء وتطوير حلول برمجية وبيانات استثنائية.",
    nameLabel: "الاسم والشركة / Name & Company",
    emailLabel: "البريد الإلكتروني / Your Email",
    projectLabel: "أخبرنا المزيد عن مشروعك / Tell us more about your project",
    namePlaceholder: "حيدر من تكنو ستور",
    emailPlaceholder: "haider@example.com",
    projectPlaceholder: "اكتب تفاصيل مشروعك أو فكرتك المميزة هنا...",
    submitBtn: "إرسال الطلب",
    submittedTitle: "تم إرسال طلبك بنجاح!",
    submittedText: "سنقوم بالتواصل معك في أسرع وقت ممكن."
  },
  EN: {
    logo: "Haider Mohamed",
    navHome: "Home",
    navStats: "Stats & Skills",
    navAbout: "About",
    navExperience: "Experience",
    navTools: "Tools",
    navEducation: "Education",
    navContact: "Contact Us",
    downloadCV: "Download PDF",
    becomeClient: "Become a Client",
    heroLine1: "WE CREATE",
    heroLine2: "AWESOME",
    heroLine3: "DIGITAL RESULTS",
    bio: "Haider M. Shwkat — Computer Science Specialist & Data Operations Consultant with extensive experience in workflow automation, large-scale database management (22K+ records), e-commerce catalog integrity, and network infrastructure.",
    statsTag: "01 — STATS & NUMBERS",
    statsTitle: "Proven Track Record Numbers",
    stat1: "Multi-platform data records engineered and managed for a Defense Sector project",
    stat2: "Active network subscribers and clients provided with full technical support",
    stat3: "Active restaurants powered by custom-built ERP & POS management system",
    stat4: "Active users connected via modern FTTH / EPON fiber optic networks",
    expTag: "02 — WORK EXPERIENCE",
    expTitle: "Proven Career Journey & High-Impact Results",
    exp1Date: "2025 - Present",
    exp1Company: "Techno Store — Baghdad, Iraq",
    exp1Role: "E-Commerce, Data Operations & Sales Specialist",
    exp1Bullets: [
      "Engineered custom Python scripts and browser automation tools to streamline large-scale SKU uploads, cutting data processing time from days to minutes.",
      "Managed cataloging, stock accuracy, and pricing across platforms for thousands of active SKUs with zero error rates.",
      "Automated inventory feeds and content sync between internal databases and major Iraqi delivery apps (Miswag, Tamata, Jahez, Al-Rayan).",
      "Supervised daily branch sales operations, managed digital video reels marketing, and leveraged customer insights to boost revenue."
    ],
    exp2Date: "2023 - 2025",
    exp2Company: "Multi-Client / Defense & E-commerce Projects",
    exp2Role: "Freelance Data & Technical Operations Consultant",
    exp2Bullets: [
      "Built a comprehensive database system of 22,000+ multi-platform records for a Defense Sector project with region and contact filtering.",
      "Designed and deployed a fully functional ERP & POS restaurant management system currently driving operations across 3 active restaurants.",
      "Resolved critical catalog structures, API rate limits, and product feature bugs for prominent Iraqi e-commerce platforms (e.g. Al-Rayan).",
      "Produced and executed over 60 commercial reels, technical tutorials, and brand video campaigns for retail partners (Lito Store, Techno Store)."
    ],
    exp3Date: "2019 - 2023",
    exp3Company: "Events & Telecommunications Sector — Baghdad",
    exp3Role: "Operations Lead & Network Support Coordinator",
    exp3Bullets: [
      "Led operational teams to plan, coordinate, and execute large-scale corporate and public events for 150+ guests with high efficiency.",
      "Directed the construction and deployment of FTTH networks across 3 districts, connecting 2,000+ active users using EPON systems.",
      "Managed end-to-end troubleshooting and maintenance coordination for a subscriber base of 3,000+ active network clients."
    ],
    toolsTag: "03 — INTERACTIVE TOOLS",
    toolsTitle: "Custom-Built Software Tools & Automation",
    toolsSubtitle: "High-performance browser-based tools built for large-scale Excel processing, bulk image downloads, and data syncing.",
    tool1Title: "Tekno Excel Diff & Price Matcher",
    tool1Desc: "Fast browser-based tool to compare large Excel sheets, detect price & stock discrepancies, and sync catalog products accurately.",
    tool1Action: "Open Excel Diff",
    tool2Title: "Bulk Excel Image Downloader & Renamer",
    tool2Desc: "Extract image URLs from Excel/CSV catalogs, download concurrently, rename with product names, and export as ZIP with one click.",
    tool2Action: "Open Image Downloader",
    tool3Title: "Professional ATS CV Builder",
    tool3Desc: "Interactive bilingual (AR/EN) CV builder with industry-specialized presets, dynamic QR code studio, and instant print-ready ISO A4 PDF export.",
    tool3Action: "Build Your CV",
    eduTag: "04 — EDUCATION & CERTIFICATES",
    eduTitle: "Academic Qualifications & Certified Training",
    edu1Year: "2022 - 2026",
    edu1School: "Dijlah University – Baghdad",
    edu1Degree: "Bachelor's Degree in Computer Science",
    edu2Year: "2019 - 2021",
    edu2School: "Institute of Technology – Baghdad",
    edu2Degree: "Diploma in Chemical Industry",
    cert1: "CCNA 1: Introduction to Networks — Dijlah University",
    cert2: "Sales and Customer Service Skills — EarthLink Telecommunications",
    cert3: "Occupational Safety Training — Institute of Technology Baghdad",
    footerSubtitle: "Ready to help you build and scale data-driven software, automation pipelines & e-commerce systems.",
    drawerTitle: "Hey! Tell us all the things",
    drawerSubtitle: "We’d love to hear about your project and build something amazing together.",
    nameLabel: "Name & Company",
    emailLabel: "Your Email",
    projectLabel: "Tell us more about your project",
    namePlaceholder: "Haider from Techno Store",
    emailPlaceholder: "haider@example.com",
    projectPlaceholder: "Write your project details or great ideas here...",
    submitBtn: "Submit Request",
    submittedTitle: "Request Submitted Successfully!",
    submittedText: "We will get back to you as soon as possible."
  }
};

export default function Home() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const { theme, isDark, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isClientDrawerClosing, setIsClientDrawerClosing] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isNavMenuClosing, setIsNavMenuClosing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  // Circular Language Transition Ripple State
  const [isLangAnimating, setIsLangAnimating] = useState(false);
  const [langOrigin, setLangOrigin] = useState({ x: 0, y: 0 });
  const [circleActive, setCircleActive] = useState(false);

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

    // Slow, smooth cinematic expansion (700ms)
    setTimeout(() => {
      setLang((prev) => (prev === "AR" ? "EN" : "AR"));
      setCircleActive(false);

      // Slow, smooth contraction back to tab (700ms)
      setTimeout(() => {
        setIsLangAnimating(false);
      }, 700);
    }, 700);
  };

  const t = translations[lang];

  const closeNavMenu = (targetHref?: string) => {
    setIsNavMenuClosing(true);
    setTimeout(() => {
      setIsNavMenuOpen(false);
      setIsNavMenuClosing(false);
      if (targetHref) {
        const targetId = targetHref.replace("#", "");
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 750);
  };

  const closeClientDrawer = () => {
    setIsClientDrawerClosing(true);
    setTimeout(() => {
      setIsClientDrawerOpen(false);
      setIsClientDrawerClosing(false);
    }, 500);
  };

  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const updateFromLocalOrApi = () => {
      try {
        const localBackup = localStorage.getItem("haider_portfolio_admin_backup");
        if (localBackup) {
          const parsed = JSON.parse(localBackup);
          setPortfolioData(parsed);
        }
      } catch {}

      fetch("/api/admin/portfolio")
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.data) {
            const localBackup = localStorage.getItem("haider_portfolio_admin_backup");
            if (!localBackup) {
              setPortfolioData(json.data);
            }
          }
        })
        .catch(() => {});
    };

    updateFromLocalOrApi();
    window.addEventListener("haider-portfolio-updated", updateFromLocalOrApi);
    return () => window.removeEventListener("haider-portfolio-updated", updateFromLocalOrApi);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPastHero(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const vids = document.querySelectorAll("video");
    vids.forEach((v) => {
      v.play().catch(() => {});
    });
  }, []);

  // PORTFOLIO KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleSiteKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "l") {
        setLang((prev) => (prev === "AR" ? "EN" : "AR"));
      } else if (key === "d" || key === "c") {
        const cvLink = document.createElement("a");
        cvLink.href = portfolioData?.general.cvPdfPath || "/HAIDER_M_SHWKAT_CV_2026.pdf";
        cvLink.download = "HAIDER_M_SHWKAT_CV_2026.pdf";
        cvLink.click();
      } else if (key === "s") {
        document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" });
      } else if (key === "e") {
        document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleSiteKeyDown);
    return () => window.removeEventListener("keydown", handleSiteKeyDown);
  }, [portfolioData]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "AR" ? "EN" : "AR"));
  };

  const handleScrollDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const statsSec = document.getElementById("stats");
    if (statsSec) {
      statsSec.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitted(true);

    try {
      await fetch("https://formsubmit.co/ajax/haider.m.shwkat@outlook.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          "الاسم والشركة / Client Name": formData.get("الاسم والشركة / Client Name"),
          "البريد الإلكتروني / Client Email": formData.get("البريد الإلكتروني / Client Email"),
          "تفاصيل المشروع / Project Details": formData.get("تفاصيل المشروع / Project Details"),
          "_subject": "طلب عمل جديد من موقعك الشخصي"
        })
      });
    } catch (err) {
      console.error("FormSubmit Error:", err);
    }

    window.location.href = "/thanks";
  };

  const neonAccent = isDark ? "#ef4444" : "#2563eb";
  const tColors = {
    bg: isDark ? "#0e0d15" : "#f2f1f6",
    text: isDark ? "#ffffff" : "#0f111a",
    cardBg: isDark ? "#151624" : "#f2f0f1",
    cardBorder: isDark ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid #e2e8f0",
    cardShadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(0,0,0,0.04)",
    subtext: isDark ? "#94a3b8" : "#475569",
    mutedText: isDark ? "#64748b" : "#64748b",
    dotColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 17, 26, 0.16)",
    headerBg: isDark ? "rgba(21, 22, 36, 0.95)" : "rgba(255, 255, 255, 0.95)",
    headerBorder: isDark ? "1.5px solid rgba(239, 68, 68, 0.4)" : "1.5px solid rgba(37, 99, 235, 0.25)",
    headerShadow: isDark ? "0 15px 35px rgba(0,0,0,0.6), 0 0 25px rgba(239, 68, 68, 0.2)" : "0 15px 35px rgba(37, 99, 235, 0.12)",
    marqueeBg: isDark ? "#0d0f19" : "#f2f0f1",
    marqueeBorder: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0",
    footerBorder: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
    btnPillBg: isDark ? "#1e2235" : "#ffffff",
    btnPillBorder: isDark ? "1px solid rgba(239, 68, 68, 0.4)" : "1.5px solid #2563eb",
    btnPillColor: isDark ? "#ef4444" : "#2563eb",
  };

  const marqueeContent = (
    <div style={{ display: "flex", gap: "30px", alignItems: "center", whiteSpace: "nowrap", fontSize: "16px", fontWeight: "900", letterSpacing: "1px", color: tColors.text, fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif", paddingRight: "30px", flexShrink: 0 }}>
      {lang === "AR" ? (
        <>
          <span style={{ color: tColors.text }}>تحليل البيانات</span> • <span style={{ color: neonAccent }}>التجارة الإلكترونية</span> • <span style={{ color: tColors.text }}>إدارة شبكات FTTH</span> • <span style={{ color: neonAccent }}>أتمتة PYTHON</span> • <span style={{ color: tColors.text }}>قواعد بيانات SQL</span> • 
          <span style={{ color: neonAccent }}>DATA DRIVEN</span> • <span style={{ color: tColors.text }}>USER FOCUSED</span> • <span style={{ color: neonAccent }}>VALUE BASED</span> • <span style={{ color: tColors.text }}>E-COMMERCE OPS</span> • 
        </>
      ) : (
        <>
          <span style={{ color: tColors.text }}>DATA ANALYSIS</span> • <span style={{ color: neonAccent }}>E-COMMERCE OPS</span> • <span style={{ color: tColors.text }}>FTTH NETWORKS</span> • <span style={{ color: neonAccent }}>PYTHON AUTOMATION</span> • <span style={{ color: tColors.text }}>SQL DATABASES</span> • 
          <span style={{ color: neonAccent }}>DATA DRIVEN</span> • <span style={{ color: tColors.text }}>USER FOCUSED</span> • <span style={{ color: neonAccent }}>VALUE BASED</span> • 
        </>
      )}
    </div>
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`main-layout ${isDark ? "theme-dark" : "theme-light"}`}
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: tColors.bg,
        color: tColors.text,
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        fontFamily: lang === "AR" ? `'${portfolioData?.typography?.fontFamilyAR || "Tajawal"}', sans-serif` : `'${portfolioData?.typography?.fontFamilyEN || "Outfit"}', sans-serif`,
        transition: "background 0.3s ease, color 0.3s ease"
      }}
    >
      {/* 3D CONCAVE DOT GRID BACKGROUND LAYER (MATCHING /images, /tekno & /cv) */}
      <div
        style={{
          position: "fixed",
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
            backgroundImage: `radial-gradient(${tColors.dotColor} 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
            transform: `perspective(1000px) rotateX(${16 + mousePos.y * 14}deg) rotateY(${mousePos.x * 16}deg) scale(1.25)`,
            transformOrigin: "center center",
            transition: "transform 0.08s linear, background-image 0.3s ease",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
          }}
        />
      </div>

      {/* AWSMD TOP ACTION BUTTONS MATCHING SCREENSHOT */}
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
        {/* ENLARGED ROYAL BLUE / NEON RED SIDE FILL & FLIP TEXT BUTTON */}
        <button
          onClick={() => setIsClientDrawerOpen(true)}
          className="awsmd-royal-client-btn"
          style={{
            ["--client-btn-gradient" as any]: isDark ? "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
            ["--client-btn-color" as any]: neonAccent,
            ["--client-btn-shadow" as any]: isDark ? "rgba(239, 68, 68, 0.55)" : "rgba(37, 99, 235, 0.4)",
          }}
        >
          <span className="flip-box">
            <span className="flip-wrapper">
              <span className="flip-text-primary">+ {t.becomeClient}</span>
              <span className="flip-text-secondary">+ {t.becomeClient}</span>
            </span>
          </span>
        </button>

        {/* THEME TOGGLE BUTTON (ICON ONLY) */}
        <button
          onClick={toggleTheme}
          title={lang === "AR" ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : (isDark ? "Light Mode" : "Dark Mode")}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: tColors.btnPillBg,
            border: tColors.btnPillBorder,
            color: tColors.btnPillColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: isDark ? "0 4px 15px rgba(239, 68, 68, 0.2)" : "0 4px 15px rgba(37, 99, 235, 0.12)",
            transition: "all 0.3s ease"
          }}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* BORDERED LANGUAGE SELECTOR PILL */}
        <button
          onClick={handleLangSwitch}
          style={{
            background: tColors.btnPillBg,
            border: tColors.btnPillBorder,
            color: isDark ? "#ffffff" : "#2563eb",
            padding: "8px 18px",
            borderRadius: "50px",
            fontSize: "13.5px",
            fontWeight: "800",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: isDark ? "0 4px 15px rgba(239, 68, 68, 0.15)" : "0 4px 15px rgba(37, 99, 235, 0.12)",
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
            background: isDark ? "#1e2235" : "#e2e8f0",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.2s ease, background 0.2s ease"
          }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="2.5" rx="1.25" fill={isDark ? "#ffffff" : "#475569"}/>
            <rect y="6.5" width="13" height="2.5" rx="1.25" fill={isDark ? "#ffffff" : "#475569"}/>
          </svg>
        </button>
      </div>

      {/* INDEPENDENT FLOATING BRAND LOGO / NAME (TOP LEFT) */}
      <div
        className="awsmd-brand-logo"
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "19px",
            fontWeight: "900",
            color: isDark ? "#ffffff" : (isScrolledPastHero ? "#0f111a" : "#000000"),
            textDecoration: "none",
            letterSpacing: "-0.01em",
            transition: "color 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <svg width="22" height="18" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill={isDark ? "#ffffff" : (isScrolledPastHero ? "#0f111a" : "#000000")} style={{ transition: "fill 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}/>
            <rect x="0" y="13" width="16" height="7" fill={isDark ? "#ffffff" : (isScrolledPastHero ? "#0f111a" : "#000000")} style={{ transition: "fill 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}/>
            <rect x="10" y="13" width="15" height="7" fill={neonAccent} style={{ transition: "fill 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}/>
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
          background: tColors.headerBg,
          backdropFilter: "blur(16px)",
          padding: "8px 24px",
          borderRadius: "50px",
          boxShadow: tColors.headerShadow,
          border: tColors.headerBorder,
          transition: "all 0.35s ease"
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FlipLink href="#home" color={tColors.text} hoverColor={neonAccent}>{t.navHome}</FlipLink>
          <FlipLink href="#stats" color={tColors.subtext} hoverColor={neonAccent}>{t.navStats}</FlipLink>
          <FlipLink href="#experience" color={tColors.subtext} hoverColor={neonAccent}>{t.navExperience}</FlipLink>
          <FlipLink href="#tools" color={tColors.subtext} hoverColor={neonAccent}>{t.navTools}</FlipLink>
          <FlipLink href="#education" color={tColors.subtext} hoverColor={neonAccent}>{t.navEducation}</FlipLink>
          <FlipLink href="#contact" color={tColors.subtext} hoverColor={neonAccent}>{t.navContact}</FlipLink>
        </nav>

        <a
          href="/HAIDER_M_SHWKAT_CV_2026.pdf"
          download="HAIDER_M_SHWKAT_CV_2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="awsmd-btn-glow"
          style={{
            background: isDark ? "#ef4444" : "#2563eb",
            color: "#ffffff",
            padding: "8px 20px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: isDark ? "0 4px 18px rgba(239, 68, 68, 0.45)" : "0 4px 18px rgba(37, 99, 235, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease"
          }}
        >
          <span>{t.downloadCV}</span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home" style={{ position: "relative", minHeight: "100vh", paddingTop: "120px", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div className="hero-background" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
          <video
            src="media/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 1,
              pointerEvents: "none"
            }}
          ></video>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1500px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "flex-start", direction: "ltr" }}>
          <div style={{ maxWidth: "550px", textAlign: lang === "AR" ? "right" : "left", direction: lang === "AR" ? "rtl" : "ltr" }}>
            <div className="hero-title-text" style={{ fontSize: "72px", fontWeight: "900", lineHeight: "1.0", letterSpacing: "-1.5px", color: "#ffffff", marginBottom: "25px" }}>
              <div style={{ display: "block" }}>{t.heroLine1}</div>

              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "8px", marginBottom: "8px" }}>
                <a href="#stats" onClick={handleScrollDown} className="arrow-scroll-circle">
                  ↓
                </a>
                <span>{t.heroLine2}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#60a5fa" }}>
                <span>{t.heroLine3}</span>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "65px",
                    background: "#60a5fa",
                    marginRight: lang === "EN" ? "6px" : "0",
                    marginLeft: lang === "AR" ? "6px" : "0",
                    animation: "blink 1s infinite"
                  }}
                ></span>
              </div>
            </div>

            <p style={{ fontSize: "18.5px", color: "#ffffff", lineHeight: "1.65", fontWeight: "500" }}>
              {t.bio}
            </p>

            <div className="mobile-only-cv-btn" style={{ marginTop: "25px" }}>
              <a
                href="/HAIDER_M_SHWKAT_CV_2026.pdf"
                download="HAIDER_M_SHWKAT_CV_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="awsmd-btn-glow"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  fontSize: "15px",
                  fontWeight: "800",
                  textDecoration: "none",
                  boxShadow: "0 8px 25px rgba(37, 99, 235, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span>{t.downloadCV}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker Banner */}
      <div
        className="marquee-banner"
        style={{
          width: "100%",
          overflow: "hidden",
          background: tColors.marqueeBg,
          padding: "20px 0",
          borderTop: tColors.marqueeBorder,
          borderBottom: tColors.marqueeBorder,
          direction: "ltr",
          position: "relative",
          zIndex: 2,
          transition: "background 0.3s ease, border-color 0.3s ease"
        }}
      >
        <div className="news-ticker-track" style={{ display: "flex", width: "max-content", direction: "ltr" }}>
          {marqueeContent}
          {marqueeContent}
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>

      {/* Stats Section */}
      <section className="section" id="stats" style={{ padding: "110px 40px", maxWidth: "1300px", margin: "0 auto", background: "transparent", position: "relative", zIndex: 2 }}>
        <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
          <span style={{ color: "#2563eb", fontSize: "15px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>{t.statsTag}</span>
          <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: tColors.text }}>{t.statsTitle}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "25px" }}>
          
          {/* STAT CARD 1 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+22K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat1}</p>
            </div>
            <video src="media/volchek-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 1, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 2 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+3K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat2}</p>
            </div>
            <video src="media/pruzina-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 1, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 3 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>3</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat3}</p>
            </div>
            <video src="media/time-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 1, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 4 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+2K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat4}</p>
            </div>
            <video src="media/ball-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 1, transition: "transform 0.4s ease" }}></video>
          </div>

        </div>
      </section>

      {/* Experience Section */}
      <section className="section" id="experience" style={{ padding: "110px 40px", background: "transparent", position: "relative", overflow: "hidden", zIndex: 2 }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#2563eb", fontSize: "15px", fontWeight: "800", textTransform: "uppercase" }}>{t.expTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: tColors.text }}>{t.expTitle}</h2>
          </div>

          {/* 3 HIGH-IMPACT CARDS RESPONSIVE GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {/* CARD 1: TECHNO STORE */}
            <Link
              href="/tekno"
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "30px 26px",
                borderRadius: "24px",
                border: "1.5px solid rgba(37, 99, 235, 0.35)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
                color: tColors.text,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 30px rgba(37, 99, 235, 0.08)",
                minHeight: "280px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>{t.exp1Date}</span>
                  <span style={{ background: "#2563eb", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>{lang === "AR" ? "تشغيل أداة تكنو" : "Launch Tekno Tool"}</span>
                  </span>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: tColors.text, marginBottom: "4px" }}>{t.exp1Company}</h3>
                <p style={{ color: "#2563eb", fontSize: "14px", fontWeight: "700", marginBottom: "14px" }}>{t.exp1Role}</p>
              </div>
              <ul style={{ color: tColors.subtext, fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp1Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </Link>

            {/* CARD 2: FREELANCE CONSULTANT / DEFENSE & E-COMMERCE */}
            <div
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "30px 26px",
                borderRadius: "24px",
                border: tColors.cardBorder,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "280px",
                boxShadow: tColors.cardShadow,
                transition: "all 0.3s ease"
              }}
            >
              <div>
                <span style={{ background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)", color: tColors.text, padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", display: "inline-block", marginBottom: "14px" }}>{t.exp2Date}</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: tColors.text, marginBottom: "4px" }}>{t.exp2Company}</h3>
                <p style={{ color: tColors.mutedText, fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{t.exp2Role}</p>
              </div>
              <ul style={{ color: tColors.subtext, fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp2Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* CARD 3: EVENTS & TELECOMMUNICATIONS */}
            <div
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "30px 26px",
                borderRadius: "24px",
                border: tColors.cardBorder,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "280px",
                boxShadow: tColors.cardShadow,
                transition: "all 0.3s ease"
              }}
            >
              <div>
                <span style={{ background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)", color: tColors.text, padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", display: "inline-block", marginBottom: "14px" }}>{t.exp3Date}</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: tColors.text, marginBottom: "4px" }}>{t.exp3Company}</h3>
                <p style={{ color: tColors.mutedText, fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{t.exp3Role}</p>
              </div>
              <ul style={{ color: tColors.subtext, fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp3Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="section" id="tools" style={{ padding: "110px 40px", background: "transparent", position: "relative", overflow: "hidden", zIndex: 2 }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#2563eb", fontSize: "15px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>{t.toolsTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: tColors.text }}>{t.toolsTitle}</h2>
            <p style={{ color: tColors.mutedText, fontSize: "16.5px", marginTop: "12px", maxWidth: "680px", lineHeight: "1.6", fontWeight: "500" }}>{t.toolsSubtitle}</p>
          </div>

          {/* 3 TOOLS RESPONSIVE GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "28px",
            }}
          >
            {/* TOOL 1: TEKNO EXCEL DIFF */}
            <div
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "36px 30px",
                borderRadius: "28px",
                border: "1.5px solid rgba(37, 99, 235, 0.35)",
                boxShadow: "0 10px 30px rgba(37, 99, 235, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "310px",
                transition: "all 0.3s ease"
              }}
            >
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: "900", color: tColors.text, marginBottom: "14px", lineHeight: "1.3" }}>{t.tool1Title}</h3>
                
                <p style={{ color: tColors.subtext, fontSize: "14.5px", lineHeight: "1.8", fontWeight: "500", margin: 0 }}>
                  {t.tool1Desc}
                </p>
              </div>

              <div style={{ marginTop: "28px" }}>
                <Link
                  href="/tekno"
                  className="awsmd-btn-glow"
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    padding: "12px 28px",
                    borderRadius: "50px",
                    fontSize: "14px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  <span>{t.tool1Action}</span>
                </Link>
              </div>
            </div>

            {/* TOOL 2: BULK IMAGE DOWNLOADER */}
            <div
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "36px 30px",
                borderRadius: "28px",
                border: "1.5px solid rgba(124, 58, 237, 0.35)",
                boxShadow: "0 10px 30px rgba(124, 58, 237, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "310px",
                transition: "all 0.3s ease"
              }}
            >
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: "900", color: tColors.text, marginBottom: "14px", lineHeight: "1.3" }}>{t.tool2Title}</h3>
                
                <p style={{ color: tColors.subtext, fontSize: "14.5px", lineHeight: "1.8", fontWeight: "500", margin: 0 }}>
                  {t.tool2Desc}
                </p>
              </div>

              <div style={{ marginTop: "28px" }}>
                <Link
                  href="/images"
                  className="awsmd-btn-glow"
                  style={{
                    background: "#7c3aed",
                    color: "#ffffff",
                    padding: "12px 28px",
                    borderRadius: "50px",
                    fontSize: "14px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 25px rgba(124, 58, 237, 0.35)",
                  }}
                >
                  <span>{t.tool2Action}</span>
                </Link>
              </div>
            </div>

            {/* TOOL 3: PROFESSIONAL ATS CV BUILDER */}
            <div
              className="awsmd-dark-card"
              style={{
                background: tColors.cardBg,
                padding: "36px 30px",
                borderRadius: "28px",
                border: "1.5px solid rgba(5, 150, 105, 0.35)",
                boxShadow: "0 10px 30px rgba(5, 150, 105, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "310px",
                transition: "all 0.3s ease"
              }}
            >
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: "900", color: tColors.text, marginBottom: "14px", lineHeight: "1.3" }}>{t.tool3Title}</h3>
                
                <p style={{ color: tColors.subtext, fontSize: "14.5px", lineHeight: "1.8", fontWeight: "500", margin: 0 }}>
                  {t.tool3Desc}
                </p>
              </div>

              <div style={{ marginTop: "28px" }}>
                <Link
                  href="/cv"
                  className="awsmd-btn-glow"
                  style={{
                    background: "#059669",
                    color: "#ffffff",
                    padding: "12px 28px",
                    borderRadius: "50px",
                    fontSize: "14px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 25px rgba(5, 150, 105, 0.35)",
                  }}
                >
                  <span>{t.tool3Action}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Education & Certificates Section */}
      <section className="section" id="education" style={{ padding: "110px 40px", background: "transparent", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#2563eb", fontSize: "15px", fontWeight: "800", textTransform: "uppercase" }}>{t.eduTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: tColors.text }}>{t.eduTitle}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
            <div className="awsmd-dark-card" style={{ background: tColors.cardBg, padding: "35px", borderRadius: "24px", border: tColors.cardBorder, boxShadow: tColors.cardShadow, position: "relative", overflow: "hidden", transition: "all 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "6px 14px", borderRadius: "20px", fontSize: "13.5px", fontWeight: "800" }}>{t.edu1Year}</span>
              </div>
              <h3 style={{ fontSize: "26px", fontWeight: "800", marginTop: "16px", color: tColors.text }}>{t.edu1School}</h3>
              <p style={{ color: tColors.subtext, fontSize: "16.5px", marginTop: "8px", fontWeight: "500" }}>{t.edu1Degree}</p>
            </div>

            <div className="awsmd-dark-card" style={{ background: tColors.cardBg, padding: "35px", borderRadius: "24px", border: tColors.cardBorder, boxShadow: tColors.cardShadow, position: "relative", overflow: "hidden", transition: "all 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)", color: tColors.text, padding: "6px 14px", borderRadius: "20px", fontSize: "13.5px", fontWeight: "800" }}>{t.edu2Year}</span>
              </div>
              <h3 style={{ fontSize: "26px", fontWeight: "800", marginTop: "16px", color: tColors.text }}>{t.edu2School}</h3>
              <p style={{ color: tColors.subtext, fontSize: "16.5px", marginTop: "8px", fontWeight: "500" }}>{t.edu2Degree}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <span className="awsmd-cert-pill" style={{ background: tColors.cardBg, border: tColors.cardBorder, padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: tColors.text, fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: tColors.cardShadow, transition: "all 0.3s ease" }}><span>{t.cert1}</span></span>
            <span className="awsmd-cert-pill" style={{ background: tColors.cardBg, border: tColors.cardBorder, padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: tColors.text, fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: tColors.cardShadow, transition: "all 0.3s ease" }}><span>{t.cert2}</span></span>
            <span className="awsmd-cert-pill" style={{ background: tColors.cardBg, border: tColors.cardBorder, padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: tColors.text, fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: tColors.cardShadow, transition: "all 0.3s ease" }}><span>{t.cert3}</span></span>
          </div>
        </div>
      </section>

      {/* Footer Contact Section */}
      <footer className="footer" id="contact" style={{ background: "transparent", padding: "110px 40px 40px", borderTop: tColors.footerBorder, textAlign: "center", position: "relative", zIndex: 2, transition: "border-color 0.3s ease" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "68px", fontWeight: "900", letterSpacing: "-1px", marginBottom: "20px", color: tColors.text }}>LET&apos;S TALK</h2>
          <p style={{ fontSize: "21px", color: tColors.mutedText, marginBottom: "40px", fontWeight: "500" }}>{t.footerSubtitle}</p>
          <a
            href="mailto:haider.m.shwkat@outlook.com"
            className="awsmd-btn-glow"
            style={{ fontSize: "24px", color: "#2563eb", fontWeight: "800", textDecoration: "none", background: isDark ? "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.08)", padding: "18px 38px", borderRadius: "40px", border: "1px solid rgba(37, 99, 235, 0.25)", display: "inline-block", marginBottom: "60px" }}
          >
            haider.m.shwkat@outlook.com
          </a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: tColors.mutedText, fontSize: "14.5px", borderTop: tColors.footerBorder, paddingTop: "30px", fontWeight: "500" }}>
            <span>© {new Date().getFullYear()} Haider Mohamed Shwkat</span>
            <span>Baghdad, Iraq</span>
          </div>
        </div>
      </footer>

      {/* AWSMD Side Drawer Modal */}
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
            transition: "opacity 0.45s ease"
          }}
          onClick={() => closeClientDrawer()}
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
              width: "100%",
              maxWidth: "540px",
              height: "100vh",
              background: "#ffffff",
              color: "#0f111a",
              padding: "45px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: lang === "AR" ? "-20px 0 50px rgba(0,0,0,0.3)" : "20px 0 50px rgba(0,0,0,0.3)",
              zIndex: 2001,
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px" }}>
                <div>
                  <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#0f111a", lineHeight: "1.2" }}>
                    {t.drawerTitle}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "15px", marginTop: "8px", fontWeight: "600" }}>
                    {t.drawerSubtitle}
                  </p>
                </div>

                <button
                  onClick={() => setIsClientDrawerOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#0f111a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease"
                  }}
                >
                  ✕
                </button>
              </div>

              {submitted ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0", marginTop: "40px" }}>
                  <span style={{ fontSize: "48px", display: "block", marginBottom: "15px" }}>🎉</span>
                  <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#166534" }}>{t.submittedTitle}</h3>
                  <p style={{ color: "#15803d", fontSize: "16px", marginTop: "8px", fontWeight: "600" }}>{t.submittedText}</p>
                </div>
              ) : (
                <form
                  action="https://formsubmit.co/haider.m.shwkat@outlook.com"
                  method="POST"
                  onSubmit={handleFormSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <input type="hidden" name="_subject" value="📩 طلب عمل جديد من موقعك الشخصي!" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />

                  <div>
                    <label style={{ display: "block", fontSize: "14.5px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {t.nameLabel}
                    </label>
                    <input
                      required
                      type="text"
                      name="الاسم والشركة / Client Name"
                      placeholder={t.namePlaceholder}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14.5px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {t.emailLabel}
                    </label>
                    <input
                      required
                      type="email"
                      name="البريد الإلكتروني / Client Email"
                      placeholder={t.emailPlaceholder}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14.5px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {t.projectLabel}
                    </label>
                    <textarea
                      required
                      rows={5}
                      name="تفاصيل المشروع / Project Details"
                      placeholder={t.projectPlaceholder}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none",
                        resize: "none"
                      }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "25px", marginTop: "10px" }}>
                    <span style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "700" }}>
                      haider.m.shwkat@outlook.com
                    </span>

                    <button
                      type="submit"
                      className="awsmd-btn-glow"
                      style={{
                        background: "#0f111a",
                        color: "#ffffff",
                        padding: "14px 30px",
                        borderRadius: "50px",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <span>{t.submitBtn}</span>
                      <span style={{ fontSize: "18px" }}>←</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AWSMD FULLSCREEN NAVIGATION MENU OVERLAY (VERTICAL OPPOSITE SLIDE COLUMNS) */}
      {(isNavMenuOpen || isNavMenuClosing) && (
        <React.Fragment>
          {/* DARK BLUE SIDEBAR COLUMN (SLIDES UP FROM BOTTOM TO FULL HEIGHT, SLIDES DOWN ON EXIT) */}
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

          {/* LIGHT COBALT BLUE MAIN PANEL (SLIDES DOWN FROM TOP TO FULL HEIGHT, SLIDES UP ON EXIT) */}
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

          {/* MAIN MENU CONTENT (FADES OUT SLOWLY ON EXIT) */}
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
                onClick={() => { closeNavMenu(); setIsClientDrawerOpen(true); }}
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
              { num: "01", label: t.navHome, href: "#home" },
              { num: "02", label: t.navStats, href: "#stats" },
              { num: "03", label: t.navAbout, href: "#about" },
              { num: "04", label: t.navExperience, href: "#experience" },
              { num: "05", label: t.navTools, href: "#tools" },
              { num: "06", label: t.navEducation, href: "#education" },
              { num: "07", label: t.navContact, href: "#contact" }
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => { e.preventDefault(); closeNavMenu(item.href); }}
                className="awsmd-nav-item"
                style={{
                  fontSize: "72px",
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
              href="/HAIDER_M_SHWKAT_CV_2026.pdf"
              download="HAIDER_M_SHWKAT_CV_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#ffffff",
                color: "#0f111a",
                padding: "12px 24px",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "900",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}
            >
              <span>{t.downloadCV}</span>
            </a>

            <div style={{ textAlign: lang === "AR" ? "left" : "right" }}>
              <span style={{ fontSize: "13px", opacity: 0.8, display: "block" }}>© Haider Mohamed Shwkat 2026</span>
              <span style={{ fontSize: "13px", opacity: 0.8 }}>Baghdad, Iraq</span>
            </div>
          </div>
        </div>
      </React.Fragment>
    )}

      {/* GLOBAL KEYFRAME ANIMATION FOR TICKER */}
      <style jsx global>{`
        @keyframes tickerMoveLoop {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .news-ticker-track {
          animation: tickerMoveLoop 20s linear infinite !important;
        }
      `}</style>

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
            transition: "clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1)"
          }}
        />
      )}
    </div>
  );
}
