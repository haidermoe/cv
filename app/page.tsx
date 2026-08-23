"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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
    bio: "حيدر محمد شوكت — خبير متخصص في أتمتة العمليات بلغة Python، تطوير التجارة الإلكترونية، إدارة قواعد البيانات الضخمة (+22K سجل)، وبناء شبكات الـ FTTH.",
    statsTag: "01 — الإحصائيات والأرقام",
    statsTitle: "أرقام مثبتة من المسيرة المهنية",
    stat1: "سجل بيانات تمت إدارتها وأرشفتها بدقة عالية لوزارة الدفاع",
    stat2: "مشترك نشط تم تقديم الدعم الفني الكامل لهم",
    stat3: "سنوات من الخبرة العملية المتنوعة في السوق العراقي",
    stat4: "مستخدم تم تغطيتهم بشبكات الـ FTTH الحديثة",
    expTag: "02 — الخبرات العملية",
    expTitle: "سجل مهني حافل بتحقيق الأهداف",
    exp1Date: "2025 - حتى الآن",
    exp1Company: "تكنو ستور",
    exp1Role: "أخصائي عمليات التجارة الإلكترونية والبيانات",
    exp1Bullets: [
      "إدارة وتحديث كتالوجات المنتجات والتسعير.",
      "أتمتة سير العمل باستخدام بايثون لرفع المنتجات.",
      "فهرسة آلاف المنتجات بدقة خالية من الأخطاء."
    ],
    exp2Date: "2024 - 2025",
    exp2Company: "مكتبة محلية",
    exp2Role: "مساعد مكتبة / إدخال بيانات",
    exp2Bullets: [
      "تطوير قاعدة بيانات لوزارة الدفاع (أكثر من 22,000 سجل).",
      "دمج وتصفية البيانات المتقدمة للاسترجاع السلس.",
      "تبسيط أرشفة المستندات الورقية والرقمية."
    ],
    exp3Date: "2021 - 2024",
    exp3Company: "منسق فريق",
    exp3Role: "مسؤول عمليات وتنظيم",
    exp3Bullets: [
      "قيادة فريق عمل وتنفيذ فعاليات لأكثر من 150 ضيفاً.",
      "تحسين كفاءة سير العمل ومراقبة الجودة."
    ],
    exp4Date: "2019 - 2020",
    exp4Company: "شركة إنترنت",
    exp4Role: "خدمة الزبائن والدعم الفني",
    exp4Bullets: [
      "بناء شبكات FTTH لأكثر من 2000 مستخدم.",
      "إدارة الدعم الفني لأكثر من 3000 مشترك نشط."
    ],
    navTools: "الأدوات",
    toolsTag: "03 — الأدوات والنظم التفاعلية",
    toolsTitle: "أدوات برمجية طوّرتها لتسريع وأتمتة العمليات",
    toolsSubtitle: "حلول ويب وأتمتة سريعة صممتها لمعالجة ملفات الإكسل الضخمة وتنزيل الصور وتحديث الأسعار والمخزون.",
    tool1Badge: "أداة حية تفاعلية • 0ms Engine",
    tool1Title: "مقارنة وتحديث أسعار إكسل (Tekno Diff)",
    tool1Desc: "أداة ويب تفاعلية فائقة السرعة تعمل داخل المتصفح مباشرة، لمقارنة ملفات الإكسل الكبيرة، كشف فروقات الأسعار والمخزون، وتحديث آلاف المنتجات بنقرة زر بدون أي تأخير.",
    tool1Action: "تشغيل أداة مقارنة الإكسل مباشرة",
    tool2Badge: "أتمتة سريعة • Bulk Downloader",
    tool2Title: "تنزيل وتسمية الصور من الإكسل (Image Downloader)",
    tool2Desc: "أداة لاستخراج روابط الصور من ملفات الإكسل والـ CSV، تنزيلها بالتوازي وتسميتها بأسماء المنتجات الصحيحة، وضغطها في ملف ZIP بضغطة زر واحدة.",
    tool2Action: "تشغيل أداة تنزيل الصور مباشرة",
    eduTag: "04 — التعليم والشهادات",
    eduTitle: "المؤهلات الأكاديمية والتدريب المستمر",
    edu1Year: "2026",
    edu1School: "جامعة دجلة – بغداد",
    edu1Degree: "بكالوريوس في علوم الحاسوب",
    edu2Year: "2019 - 2021",
    edu2School: "معهد التكنولوجيا – بغداد",
    edu2Degree: "دبلوم في الصناعات الكيميائية",
    cert1: "شهادة في السلامة المهنية",
    cert2: "شهادة المبيعات - إيرثلنك",
    cert3: "تدريب صيفي CCNA 1",
    footerSubtitle: "جاهز لمساعدتك في بناء وإدارة أفضل نظام بيانات وتجارة إلكترونية.",
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
    bio: "Haider Mohamed Shwkat — Specialist in Python process automation, E-commerce operations, large-scale database management (+22K records), and FTTH network deployment.",
    statsTag: "01 — STATS & NUMBERS",
    statsTitle: "Proven Track Record Numbers",
    stat1: "Data records managed and archived with high precision for the Ministry of Defense",
    stat2: "Active subscribers provided with full technical support",
    stat3: "Years of diverse practical experience in the Iraqi market",
    stat4: "Users covered with modern FTTH fiber networks",
    expTag: "02 — WORK EXPERIENCE",
    expTitle: "Proven Career Journey & Impact",
    exp1Date: "2025 - Present",
    exp1Company: "Techno Store",
    exp1Role: "E-Commerce Operations & Data Specialist",
    exp1Bullets: [
      "Product catalog & pricing management.",
      "Python workflow automation for bulk product uploads.",
      "Error-free indexing of thousands of products."
    ],
    exp2Date: "2024 - 2025",
    exp2Company: "Local Library",
    exp2Role: "Library Assistant / Data Entry Specialist",
    exp2Bullets: [
      "Developed database system for MoD (+22,000 records).",
      "Advanced data merging and filtering for seamless retrieval.",
      "Streamlined physical and digital document archiving."
    ],
    exp3Date: "2021 - 2024",
    exp3Company: "Team Coordinator",
    exp3Role: "Operations & Event Coordinator",
    exp3Bullets: [
      "Led teams and executed events for over 150 guests.",
      "Optimized workflow efficiency and quality assurance."
    ],
    exp4Date: "2019 - 2020",
    exp4Company: "ISP Company",
    exp4Role: "Customer Service & Technical Support",
    exp4Bullets: [
      "Deployed FTTH fiber networks for 2,000+ users.",
      "Managed technical support for 3,000+ active subscribers."
    ],
    toolsTag: "03 — INTERACTIVE TOOLS",
    toolsTitle: "Custom-Built Software Tools & Automation",
    toolsSubtitle: "High-performance browser-based tools built for large-scale Excel processing, bulk image downloads, and data syncing.",
    tool1Badge: "Live Interactive Tool • 0ms Engine",
    tool1Title: "Tekno Excel Diff & Price Matcher",
    tool1Desc: "Instant client-side web tool to compare massive Excel sheets, detect price & inventory discrepancies, and sync thousands of products in milliseconds.",
    tool1Action: "Launch Excel Diff Tool Live",
    tool2Badge: "Fast Automation • Bulk Downloader",
    tool2Title: "Bulk Excel Image Downloader & Renamer",
    tool2Desc: "Extract image URLs from Excel or CSV catalogs, download concurrently, rename by product names, and package into a ZIP archive instantly.",
    tool2Action: "Launch Image Downloader Live",
    eduTag: "04 — EDUCATION & CERTIFICATES",
    eduTitle: "Academic Qualifications & Training",
    edu1Year: "2026",
    edu1School: "Dijlah University College – Baghdad",
    edu1Degree: "B.Sc. in Computer Science",
    edu2Year: "2019 - 2021",
    edu2School: "Institute of Technology – Baghdad",
    edu2Degree: "Diploma in Chemical Industries",
    cert1: "Occupational Safety Cert",
    cert2: "Sales Cert - Earthlink",
    cert3: "CCNA 1 Summer Training",
    footerSubtitle: "Ready to help you build and scale data-driven software & e-commerce systems.",
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
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isClientDrawerClosing, setIsClientDrawerClosing] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isNavMenuClosing, setIsNavMenuClosing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    const vids = document.querySelectorAll("video");
    vids.forEach((v) => {
      v.play().catch(() => {});
    });
  }, []);

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

  const marqueeContent = (
    <div style={{ display: "flex", gap: "30px", alignItems: "center", whiteSpace: "nowrap", fontSize: "16px", fontWeight: "900", letterSpacing: "1px", color: "#ffffff", fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif", paddingRight: "30px", flexShrink: 0 }}>
      {lang === "AR" ? (
        <>
          <span style={{ color: "#ffffff" }}>تحليل البيانات</span> • <span style={{ color: "#60a5fa" }}>التجارة الإلكترونية</span> • <span style={{ color: "#ffffff" }}>إدارة شبكات FTTH</span> • <span style={{ color: "#60a5fa" }}>أتمتة PYTHON</span> • <span style={{ color: "#ffffff" }}>قواعد بيانات SQL</span> • 
          <span style={{ color: "#60a5fa" }}>DATA DRIVEN</span> • <span style={{ color: "#ffffff" }}>USER FOCUSED</span> • <span style={{ color: "#60a5fa" }}>VALUE BASED</span> • <span style={{ color: "#ffffff" }}>E-COMMERCE OPS</span> • 
        </>
      ) : (
        <>
          <span style={{ color: "#ffffff" }}>DATA ANALYSIS</span> • <span style={{ color: "#60a5fa" }}>E-COMMERCE OPS</span> • <span style={{ color: "#ffffff" }}>FTTH NETWORKS</span> • <span style={{ color: "#60a5fa" }}>PYTHON AUTOMATION</span> • <span style={{ color: "#ffffff" }}>SQL DATABASES</span> • 
          <span style={{ color: "#60a5fa" }}>DATA DRIVEN</span> • <span style={{ color: "#ffffff" }}>USER FOCUSED</span> • <span style={{ color: "#60a5fa" }}>VALUE BASED</span> • 
        </>
      )}
    </div>
  );

  return (
    <div
      className="main-layout"
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#0e0d15",
        color: "#ffffff",
        minHeight: "100vh",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
      }}
    >
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
        {/* ENLARGED ROYAL BLUE SIDE FILL & FLIP TEXT BUTTON */}
        <button
          onClick={() => setIsClientDrawerOpen(true)}
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
          border: "1px solid rgba(255,255,255,0.8)"
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FlipLink href="#home" color="#0f111a" hoverColor="#2563eb">{t.navHome}</FlipLink>
          <FlipLink href="#stats" color="#475569" hoverColor="#2563eb">{t.navStats}</FlipLink>
          <FlipLink href="#about" color="#475569" hoverColor="#2563eb">{t.navAbout}</FlipLink>
          <FlipLink href="#experience" color="#475569" hoverColor="#2563eb">{t.navExperience}</FlipLink>
          <FlipLink href="#tools" color="#475569" hoverColor="#2563eb">{t.navTools}</FlipLink>
          <FlipLink href="#education" color="#475569" hoverColor="#2563eb">{t.navEducation}</FlipLink>
          <FlipLink href="#contact" color="#475569" hoverColor="#2563eb">{t.navContact}</FlipLink>
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
                href="/HAIDER-MOHAMED-SHWKAT-CV.pdf"
                download="HAIDER-MOHAMED-SHWKAT-CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="awsmd-btn-glow"
                style={{
                  background: "#4f46e5",
                  color: "#ffffff",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  fontSize: "15px",
                  fontWeight: "800",
                  textDecoration: "none",
                  boxShadow: "0 8px 25px rgba(79, 70, 229, 0.4)",
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
          background: "#0d0f19",
          padding: "20px 0",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          direction: "ltr"
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
      <section className="section" id="stats" style={{ padding: "110px 40px", maxWidth: "1300px", margin: "0 auto", background: "#0e0d15" }}>
        <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
          <span style={{ color: "#60a5fa", fontSize: "15px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>{t.statsTag}</span>
          <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: "#ffffff" }}>{t.statsTitle}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "25px" }}>
          
          {/* STAT CARD 1 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 15px 35px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+22K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat1}</p>
            </div>
            <video src="media/volchek-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 0.9, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 2 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 15px 35px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+3K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat2}</p>
            </div>
            <video src="media/pruzina-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 0.9, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 3 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 15px 35px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+6</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat3}</p>
            </div>
            <video src="media/time-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 0.9, transition: "transform 0.4s ease" }}></video>
          </div>

          {/* STAT CARD 4 */}
          <div className="awsmd-stat-card" style={{ background: "#f2f0f1", padding: "26px 26px 40px 26px", borderRadius: "24px", boxShadow: "0 15px 35px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "280px", border: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span dir="ltr" style={{ fontSize: "52px", fontWeight: "900", color: "#0f111a", display: "block", textAlign: lang === "AR" ? "right" : "left", lineHeight: "1.0", marginBottom: "8px" }}>+2K</span>
              <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.5", fontWeight: "700", textAlign: lang === "AR" ? "right" : "left", maxWidth: "88%" }}>{t.stat4}</p>
            </div>
            <video src="media/ball-color.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" style={{ width: "120px", height: "120px", position: "absolute", bottom: "-5px", left: lang === "AR" ? "-5px" : "auto", right: lang === "EN" ? "-5px" : "auto", objectFit: "cover", pointerEvents: "none", zIndex: 1, opacity: 0.9, transition: "transform 0.4s ease" }}></video>
          </div>

        </div>
      </section>

      {/* Experience Section */}
      <section className="section" id="experience" style={{ padding: "110px 40px", background: "#0c0d18", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        {/* TECH MATRIX GRID & AMBIENT GLOW LINES */}
        <div className="tech-grid-container">
          <div className="tech-grid-pattern" />
          <div className="tech-ambient-glow-1" />
          <div className="tech-ambient-glow-2" />
          <div className="tech-light-beam-1" />
          <div className="tech-light-beam-2" />
        </div>

        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#60a5fa", fontSize: "15px", fontWeight: "800", textTransform: "uppercase" }}>{t.expTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px" }}>{t.expTitle}</h2>
          </div>

          {/* 4 CARDS CLEAN RESPONSIVE GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {/* CARD 1: TECHNO STORE */}
            <Link
              href="/tekno"
              className="awsmd-dark-card"
              style={{
                background: "#151624",
                padding: "28px 24px",
                borderRadius: "24px",
                border: "1.5px solid rgba(96, 165, 250, 0.35)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
                color: "#ffffff",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 30px rgba(37, 99, 235, 0.15)",
                minHeight: "260px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>{t.exp1Date}</span>
                  <span style={{ background: "#2563eb", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>{lang === "AR" ? "تشغيل أداة تكنو" : "Launch Tekno Tool"}</span>
                  </span>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>{t.exp1Company}</h3>
                <p style={{ color: "#60a5fa", fontSize: "14px", fontWeight: "700", marginBottom: "14px" }}>{t.exp1Role}</p>
              </div>
              <ul style={{ color: "#94a3b8", fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp1Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </Link>

            {/* CARD 2: LOCAL LIBRARY */}
            <div
              className="awsmd-dark-card"
              style={{
                background: "#151624",
                padding: "28px 24px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "260px",
              }}
            >
              <div>
                <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", display: "inline-block", marginBottom: "14px" }}>{t.exp2Date}</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>{t.exp2Company}</h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{t.exp2Role}</p>
              </div>
              <ul style={{ color: "#64748b", fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp2Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* CARD 3: TEAM COORDINATOR */}
            <div
              className="awsmd-dark-card"
              style={{
                background: "#151624",
                padding: "28px 24px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "260px",
              }}
            >
              <div>
                <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", display: "inline-block", marginBottom: "14px" }}>{t.exp3Date}</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>{t.exp3Company}</h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{t.exp3Role}</p>
              </div>
              <ul style={{ color: "#64748b", fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp3Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* CARD 4: ISP COMPANY */}
            <div
              className="awsmd-dark-card"
              style={{
                background: "#151624",
                padding: "28px 24px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "260px",
              }}
            >
              <div>
                <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", display: "inline-block", marginBottom: "14px" }}>{t.exp4Date}</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>{t.exp4Company}</h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{t.exp4Role}</p>
              </div>
              <ul style={{ color: "#64748b", fontSize: "13.5px", margin: 0, paddingRight: lang === "AR" ? "16px" : "0", paddingLeft: lang === "EN" ? "16px" : "0", lineHeight: "1.7", fontWeight: "500" }}>
                {t.exp4Bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="section" id="tools" style={{ padding: "110px 40px", background: "#0a0b12", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#8b5cf6", fontSize: "15px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>{t.toolsTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px", color: "#ffffff" }}>{t.toolsTitle}</h2>
            <p style={{ color: "#94a3b8", fontSize: "16.5px", marginTop: "12px", maxWidth: "680px", lineHeight: "1.6", fontWeight: "500" }}>{t.toolsSubtitle}</p>
          </div>

          {/* 2 TOOLS RESPONSIVE GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            {/* TOOL 1: TEKNO EXCEL DIFF */}
            <div
              className="awsmd-dark-card"
              style={{
                background: "linear-gradient(145deg, #151728 0%, #0d0f1a 100%)",
                padding: "36px 30px",
                borderRadius: "28px",
                border: "1.5px solid rgba(96, 165, 250, 0.4)",
                boxShadow: "0 20px 45px rgba(37, 99, 235, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "800" }}>
                    {t.tool1Badge}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", padding: "4px 10px", borderRadius: "14px", fontSize: "11.5px", fontWeight: "700" }}>
                    XLSX / XLS / CSV
                  </span>
                </div>

                <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginBottom: "12px" }}>{t.tool1Title}</h3>
                
                <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: "1.75", fontWeight: "500", margin: 0 }}>
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
                    fontSize: "14.5px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.4)",
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
                background: "linear-gradient(145deg, #151728 0%, #0d0f1a 100%)",
                padding: "36px 30px",
                borderRadius: "28px",
                border: "1.5px solid rgba(139, 92, 246, 0.4)",
                boxShadow: "0 20px 45px rgba(139, 92, 246, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "800" }}>
                    {t.tool2Badge}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", padding: "4px 10px", borderRadius: "14px", fontSize: "11.5px", fontWeight: "700" }}>
                    Multi-threading / ZIP
                  </span>
                </div>

                <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginBottom: "12px" }}>{t.tool2Title}</h3>
                
                <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: "1.75", fontWeight: "500", margin: 0 }}>
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
                    fontSize: "14.5px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 25px rgba(124, 58, 237, 0.4)",
                  }}
                >
                  <span>{t.tool2Action}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Education & Certificates Section */}
      <section className="section" id="education" style={{ padding: "110px 40px", background: "#0e0d15" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ marginBottom: "60px", textAlign: lang === "AR" ? "right" : "left" }}>
            <span style={{ color: "#60a5fa", fontSize: "15px", fontWeight: "800", textTransform: "uppercase" }}>{t.eduTag}</span>
            <h2 style={{ fontSize: "40px", fontWeight: "900", marginTop: "10px" }}>{t.eduTitle}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
            <div className="awsmd-dark-card" style={{ background: "#151624", padding: "35px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "6px 14px", borderRadius: "20px", fontSize: "13.5px", fontWeight: "800" }}>{t.edu1Year}</span>
              </div>
              <h3 style={{ fontSize: "26px", fontWeight: "800", marginTop: "16px", color: "#ffffff" }}>{t.edu1School}</h3>
              <p style={{ color: "#94a3b8", fontSize: "16.5px", marginTop: "8px", fontWeight: "500" }}>{t.edu1Degree}</p>
            </div>

            <div className="awsmd-dark-card" style={{ background: "#151624", padding: "35px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#ffffff", padding: "6px 14px", borderRadius: "20px", fontSize: "13.5px", fontWeight: "800" }}>{t.edu2Year}</span>
              </div>
              <h3 style={{ fontSize: "26px", fontWeight: "800", marginTop: "16px", color: "#ffffff" }}>{t.edu2School}</h3>
              <p style={{ color: "#94a3b8", fontSize: "16.5px", marginTop: "8px", fontWeight: "500" }}>{t.edu2Degree}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <span className="awsmd-cert-pill" style={{ background: "#151624", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: "#cbd5e1", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}><span>{t.cert1}</span></span>
            <span className="awsmd-cert-pill" style={{ background: "#151624", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: "#cbd5e1", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}><span>{t.cert2}</span></span>
            <span className="awsmd-cert-pill" style={{ background: "#151624", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 28px", borderRadius: "30px", fontSize: "15.5px", color: "#cbd5e1", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}><span>{t.cert3}</span></span>
          </div>
        </div>
      </section>

      {/* Footer Contact Section */}
      <footer className="footer" id="contact" style={{ background: "#06070a", padding: "110px 40px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "68px", fontWeight: "900", letterSpacing: "-1px", marginBottom: "20px" }}>LET&apos;S TALK</h2>
          <p style={{ fontSize: "21px", color: "#94a3b8", marginBottom: "40px", fontWeight: "500" }}>{t.footerSubtitle}</p>
          <a
            href="mailto:haider.m.shwkat@outlook.com"
            className="awsmd-btn-glow"
            style={{ fontSize: "24px", color: "#60a5fa", fontWeight: "800", textDecoration: "none", background: "rgba(96, 165, 250, 0.1)", padding: "18px 38px", borderRadius: "40px", border: "1px solid rgba(96, 165, 250, 0.25)", display: "inline-block", marginBottom: "60px" }}
          >
            haider.m.shwkat@outlook.com
          </a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#475569", fontSize: "14.5px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "30px", fontWeight: "500" }}>
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
              href="/HAIDER-MOHAMED-SHWKAT-CV.pdf"
              download="HAIDER-MOHAMED-SHWKAT-CV.pdf"
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
              <span>📥</span>
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
