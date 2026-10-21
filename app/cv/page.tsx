"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CV_TEMPLATES_PRESETS } from "@/lib/cvPresets";
import { useTheme } from "@/app/hooks/useTheme";

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

// BUILT-IN BIDIRECTIONAL TRANSLATION & TRANSLITERATION DICTIONARY
const TRANSLATION_MAP: Record<string, string> = {
  // Job Titles
  "متخصص علوم الحاسوب | استشاري عمليات البيانات والأنظمة": "Computer Science Specialist | Data Operations & Workflow Consultant",
  "Computer Science Specialist | Data Operations & Workflow Consultant": "متخصص علوم الحاسوب | استشاري عمليات البيانات والأنظمة",
  "حيدر محمد شوكت": "Haider M. Shwkat",
  "Haider M. Shwkat": "حيدر محمد شوكت",
  "أخصائي عمليات التجارة الإلكترونية، البيانات والمبيعات": "E-Commerce, Data Operations & Sales Specialist",
  "E-Commerce, Data Operations & Sales Specialist": "أخصائي عمليات التجارة الإلكترونية، البيانات والمبيعات",
  "استشاري حر لعمليات البيانات والحلول التقنية": "Freelance Data & Technical Operations Consultant",
  "Freelance Data & Technical Operations Consultant": "استشاري حر لعمليات البيانات والحلول التقنية",
  "مسؤول عمليات ومنسق دعم الشبكات": "Operations Lead & Network Support Coordinator",
  "Operations Lead & Network Support Coordinator": "مسؤول عمليات ومنسق دعم الشبكات",
  "مهندس برمجيات": "Software Engineer",
  "Software Engineer": "مهندس برمجيات",
  "مطور ويب وتطبيقات": "Full-Stack Web Developer",
  "Full-Stack Web Developer": "مطور ويب وتطبيقات",
  "مهندس معماري": "Architectural Engineer",
  "Architectural Engineer": "مهندس معماري",
  "مهندس مدني": "Civil Engineer",
  "Civil Engineer": "مهندس مدني",
  "مهندس ميكانيك": "Mechanical Engineer",
  "Mechanical Engineer": "مهندس ميكانيك",
  "مهندس كهرباء": "Electrical Engineer",
  "Electrical Engineer": "مهندس كهرباء",
  "محلل بيانات": "Data Analyst",
  "Data Analyst": "محلل بيانات",
  "مدير مشاريع": "Project Manager",
  "Project Manager": "مدير مشاريع",
  "مهندس شبكات": "Network Engineer",
  "Network Engineer": "مهندس شبكات",
  "طبيب عام": "General Physician",
  "General Physician": "طبيب عام",
  "طبيب أسنان": "Dentist",
  "Dentist": "طبيب أسنان",
  "صيدلي": "Pharmacist",
  "Pharmacist": "صيدلي",
  "محاسب مالي": "Financial Accountant",
  "Financial Accountant": "محاسب مالي",
  "مدير مالي": "Financial Manager",
  "Financial Manager": "مدير مالي",
  "أخصائي تسويق رقمي": "Digital Marketing Specialist",
  "Digital Marketing Specialist": "أخصائي تسويق رقمي",
  "مدير مبيعات": "Sales Manager",
  "Sales Manager": "مدير مبيعات",
  "مصمم جرافيك": "Graphic Designer",
  "Graphic Designer": "مصمم جرافيك",
  "مصمم واجهات وتجربة المستخدم": "UI/UX Designer",
  "UI/UX Designer": "مصمم واجهات وتجربة المستخدم",
  "مترجم": "Translator",
  "Translator": "مترجم",
  "محامي واستشاري قانوني": "Lawyer & Legal Consultant",
  "Lawyer & Legal Consultant": "محامي واستشاري قانوني",
  "أستاذ جامعي": "University Professor",
  "University Professor": "أستاذ جامعي",
  "معلم": "Teacher",
  "Teacher": "معلم",

  // Companies, Universities & Places
  "تكنو ستور — بغداد، العراق": "Techno Store — Baghdad, Iraq",
  "Techno Store — Baghdad, Iraq": "تكنو ستور — بغداد، العراق",
  "مشاريع قطاع الدفاع والتجارة الإلكترونية": "Multi-Client / Defense & E-commerce Projects",
  "Multi-Client / Defense & E-commerce Projects": "مشاريع قطاع الدفاع والتجارة الإلكترونية",
  "قطاع الفعاليات والاتصالات — بغداد": "Events & Telecommunications Sector — Baghdad",
  "Events & Telecommunications Sector — Baghdad": "قطاع الفعاليات والاتصالات — بغداد",
  "بغداد، العراق": "Baghdad, Iraq",
  "Baghdad, Iraq": "بغداد، العراق",
  "العراق": "Iraq",
  "Iraq": "العراق",
  "بغداد": "Baghdad",
  "Baghdad": "بغداد",
  "أربيل": "Erbil",
  "Erbil": "أربيل",
  "البصرة": "Basra",
  "Basra": "البصرة",
  "الموصل": "Mosul",
  "Mosul": "الموصل",
  "دبي، الإمارات": "Dubai, UAE",
  "Dubai, UAE": "دبي، الإمارات",
  "الرياض، السعودية": "Riyadh, KSA",
  "Riyadh, KSA": "الرياض، السعودية",
  "جامعة دجلة – بغداد": "Dijlah University – Baghdad",
  "Dijlah University – Baghdad": "جامعة دجلة – بغداد",
  "جامعة بغداد": "University of Baghdad",
  "University of Baghdad": "جامعة بغداد",
  "الجامعة المستنصرية": "Mustansiriyah University",
  "Mustansiriyah University": "الجامعة المستنصرية",
  "الجامعة التكنولوجية": "University of Technology",
  "University of Technology": "الجامعة التكنولوجية",
  "معهد التكنولوجيا – بغداد": "Institute of Technology – Baghdad",
  "Institute of Technology – Baghdad": "معهد التكنولوجيا – بغداد",

  // Dates & Degrees
  "2025 - الحالي": "2025 - Present",
  "2025 - Present": "2025 - الحالي",
  "2024 - الحالي": "2024 - Present",
  "2024 - Present": "2024 - الحالي",
  "2023 - 2025": "2023 - 2025",
  "2019 - 2023": "2019 - 2023",
  "2022 - 2026": "2022 - 2026",
  "2019 - 2021": "2019 - 2021",
  "بكالوريوس في علوم الحاسوب (Computer Science)": "Bachelor's Degree in Computer Science",
  "Bachelor's Degree in Computer Science": "بكالوريوس في علوم الحاسوب (Computer Science)",
  "بكالوريوس هندسة": "Bachelor of Engineering",
  "Bachelor of Engineering": "بكالوريوس هندسة",
  "بكالوريوس إدارة أعمال": "Bachelor of Business Administration",
  "Bachelor of Business Administration": "بكالوريوس إدارة أعمال",
  "دبلوم عالي": "Higher Diploma",
  "Higher Diploma": "دبلوم عالي",
  "ماجستير": "Master's Degree",
  "Master's Degree": "ماجستير",
  "دكتوراه": "PhD",
  "PhD": "دكتوراه",
  "دبلوم في الصناعات الكيماوية (Chemical Industry)": "Diploma in Chemical Industry",
  "Diploma in Chemical Industry": "دبلوم في الصناعات الكيماوية (Chemical Industry)",
  "شهادة CCNA 1: Introduction to Networks — جامعة دجلة": "CCNA 1: Introduction to Networks — Dijlah University",
  "CCNA 1: Introduction to Networks — Dijlah University": "شهادة CCNA 1: Introduction to Networks — جامعة دجلة",
  "شهادة مهارات المبيعات وخدمة العملاء — شركة إيرثلنك": "Sales and Customer Service Skills — EarthLink Telecommunications",
  "Sales and Customer Service Skills — EarthLink Telecommunications": "شهادة مهارات المبيعات وخدمة العملاء — شركة إيرثلنك",
  "تدريب السلامة والصحة المهنية — معهد التكنولوجيا بغداد": "Occupational Safety Training — Institute of Technology Baghdad",
  "Occupational Safety Training — Institute of Technology Baghdad": "تدريب السلامة والصحة المهنية — معهد التكنولوجيا بغداد",

  // Skills
  "أتمتة بايثون وبرمجة السكربتات": "Python Automation & Scripting",
  "Python Automation & Scripting": "أتمتة بايثون وبرمجة السكربتات",
  "هيكلة وإدارة قواعد البيانات الضخمة SQL": "SQL & High-Volume Database Architecture",
  "SQL & High-Volume Database Architecture": "هيكلة وإدارة قواعد البيانات الضخمة SQL",
  "تكامل أنظمة ERP وفودكس للتجارة الإلكترونية": "E-Commerce & Foodics ERP Workflows",
  "E-Commerce & Foodics ERP Workflows": "تكامل أنظمة ERP وفودكس للتجارة الإلكترونية",
  "إدارة وتشغيل شبكات FTTH و EPON الضوئية": "FTTH & EPON Optical Network Management",
  "FTTH & EPON Optical Network Management": "إدارة وتشغيل شبكات FTTH و EPON الضوئية",
  "تنظيف وتدقيق وضمان جودة البيانات": "Data Cleansing & Integrity Verification",
  "Data Cleansing & Integrity Verification": "تنظيف وتدقيق وضمان جودة البيانات",
  "إدارة خوادم لينكس والـ Bash Scripts": "Linux Server Operations & Bash",
  "Linux Server Operations & Bash": "إدارة خوادم لينكس والـ Bash Scripts",
  "إدارة المشاريع بالمنهجيات المرنة Agile": "Agile Project & Team Leadership",
  "Agile Project & Team Leadership": "إدارة المشاريع بالمنهجيات المرنة Agile",
  "إدارة الوقت وتنظيم المهام": "Time Management & Task Organization",
  "Time Management & Task Organization": "إدارة الوقت وتنظيم المهام",
  "التواصل الفعال والعمل الجماعي": "Effective Communication & Teamwork",
  "Effective Communication & Teamwork": "التواصل الفعال والعمل الجماعي",
  "حل المشكلات المعقدة": "Complex Problem Solving",
  "Complex Problem Solving": "حل المشكلات المعقدة",
};

// Common Arabic Names dictionary for perfect transliteration
const ARABIC_NAMES_MAP: Record<string, string> = {
  "محمد": "Mohammed", "أحمد": "Ahmed", "احمد": "Ahmed", "علي": "Ali", "حسين": "Hussein",
  "سجاد": "Sajjad", "هاني": "Hani", "حسن": "Hassan", "عمر": "Omar", "عثمان": "Othman", "مصطفى": "Mustafa", "يوسف": "Youssef",
  "إبراهيم": "Ibrahim", "ابراهيم": "Ibrahim", "خالد": "Khalid", "سارة": "Sarah", "ساره": "Sarah",
  "فاطمة": "Fatima", "فاطمه": "Fatima", "زينب": "Zainab", "مريم": "Maryam", "نور": "Noor",
  "هدى": "Huda", "زيد": "Zaid", "سيف": "Saif", "شوكت": "Shwkat", "عبدالله": "Abdullah",
  "عبد الله": "Abdullah", "عبدالرحمن": "Abdulrahman", "عبد الرحمن": "Abdulrahman",
  "محمود": "Mahmoud", "طارق": "Tariq", "ياسر": "Yasser", "كريم": "Karim", "سامر": "Samer",
  "ماجد": "Majid", "حمزة": "Hamza", "بلال": "Bilal", "عمار": "Ammar", "أيمن": "Ayman",
  "ليث": "Laith", "حيدر": "Haider", "جعفر": "Jaafar", "أنس": "Anas", "أوس": "Aws",
  "رائد": "Raid", "وسام": "Wissam", "مهند": "Mohannad", "زياد": "Ziad", "بشار": "Bashar"
};

function translateOrTransliterate(text: string, targetLang: "AR" | "EN"): string {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();
  if (TRANSLATION_MAP[trimmed]) return TRANSLATION_MAP[trimmed];
  if (ARABIC_NAMES_MAP[trimmed]) return ARABIC_NAMES_MAP[trimmed];

  // If it's a name with multiple known parts
  const words = trimmed.split(/\s+/);
  if (words.length <= 4 && words.every((w) => ARABIC_NAMES_MAP[w])) {
    return words.map((w) => ARABIC_NAMES_MAP[w]).join(" ");
  }

  // Fast replacement of date keywords or known phrases
  let processed = trimmed;
  for (const [ar, en] of Object.entries(TRANSLATION_MAP)) {
    if (processed.includes(ar)) {
      processed = processed.replaceAll(ar, en);
    }
  }

  return processed;
}

const DEFAULT_AR_DATA: LanguageSpecificData = {
  fullName: "سجاد هاني",
  jobTitle: "أخصائي مبيعات وإدارة العمليات التجارية",
  summary: "مهني طموح ومتعدد المهارات بخبرة عملية قوية في إدارة المبيعات، الحسابات، التسويق الرقمي، والمبيعات الميدانية والطبية. أمتلك سجلاً حافلاً في العمل على البرامج المحاسبية (مثل برنامج البيان)، وإدارة المخزون، وتحليل البيانات عبر برامج Office، بالإضافة إلى مهارات عالية في صناعة الحملات الإعلانية وإدارة العمليات التجارية.",
  email: "hany76734@gmail.com",
  phone: "07859312867",
  location: "بغداد / بغداد الجديدة (تولد: 28 نيسان 2002)",
  linkedin: "linkedin.com/in/sajjadhani",
  skills: [
    "صناعة وإدارة الإعلانات الممولة (Facebook & Instagram)",
    "البرامج المكتبية ومعالجة البيانات المتقدمة (Excel & Word)",
    "أنظمة وبيانات التطبيقات والاشتراكات الرقمية (IPTV)",
    "البرامج المحاسبية وجرد المخازن (برنامج البيان)",
    "مهارات البيع، التفاوض المباشر وإدارة علاقات العملاء",
  ],
  experiences: [
    {
      id: "exp-1",
      role: "مدير مبيعات",
      company: "محل للألعاب – مول الجادرية، بغداد",
      date: "تشرين الثاني 2025 – حتى الآن",
      bullets: [
        "الإشراف الكامل على عمليات البيع داخل المعرض وإدارة تجربة العملاء وتقديم خدمة متميزة.",
        "متابعة حركة المنتجات وحركة المخزون وتحقيق الأهداف البيعية الشهرية المحددة بدقة."
      ]
    },
    {
      id: "exp-2",
      role: "مندوب مبيعات ميداني",
      company: "شركة الهدف المباشر الطبية – بغداد",
      date: "أيلول 2025 – تشرين الأول 2025",
      bullets: [
        "العمل الميداني على ترويج وبيع المنتجات والأجهزة الطبية وبناء علاقات متينة مع الصيدليات والمراكز الطبية والمستشفيات."
      ]
    },
    {
      id: "exp-3",
      role: "مدير مبيعات",
      company: "شركة توديا لتجارة كاميرات المراقبة ومنظومات الطاقة الشمسية",
      date: "آب 2024 – أيلول 2025",
      bullets: [
        "قيادة المبيعات المباشرة داخل الشركة، إدارة المفاوضات مع كبار العملاء وتطوير استراتيجيات البيع وتوسيع قنوات التوزيع."
      ]
    },
    {
      id: "exp-4",
      role: "مدير حسابات ومخازن",
      company: "شركة توديا لتجارة كاميرات المراقبة ومنظومات الطاقة الشمسية",
      date: "آب 2024 – شباط 2025",
      bullets: [
        "إدارة العمليات المالية والحسابية والفواتير باستخدام برنامج البيان، إدخال المواد (Items)، ومتابعة الجرد الدوري للمخزن."
      ]
    },
    {
      id: "exp-5",
      role: "مبيعات ومندوب تجاري وعلمي",
      company: "مذخر المنجد للأدوية – بغداد",
      date: "كانون الثاني 2023 – تموز 2024",
      bullets: [
        "إدارة مبيعات الجملة داخل المذخر مع معالجة وإصدار الفواتير بدقة على الأنظمة المحاسبية (برنامج البيان).",
        "العمل كمندوب مبيعات علمي وتجاري على الصيدليات والعيادات الطبية، عرض وبيع الأدوية وإعداد فواتير الحسابات والتحصيلات."
      ]
    },
    {
      id: "exp-6",
      role: "مسؤول مبيعات وإدارة صفحة رقمية",
      company: "منصة بيع الاشتراكات الرقمية",
      date: "كانون الثاني 2024 – حتى الآن",
      bullets: [
        "إدارة مبيعات الاشتراكات الشهرية والسنوية للقنوات المشفرة والأفلام والمسلسلات (IPTV).",
        "إدارة مدخلات ومخرجات بيانات التطبيقات والاشتراكات وتفعيل الحسابات بكفاءة وسرعة عالية."
      ]
    },
    {
      id: "exp-7",
      role: "مسؤول مبيعات ومتجر إلكتروني",
      company: "صفحة لافندر (Lavender) للساعات والإكسسوارات",
      date: "نيسان 2022 – تشرين الأول 2023",
      bullets: [
        "إدارة الطلبات والحجوزات عبر فيسبوك وإنستغرام، تجهيز الطلبيات والتنسيق الكامل مع شركات التوصيل والشحن."
      ]
    },
    {
      id: "exp-8",
      role: "سكرتير عيادة طبية",
      company: "عيادة جراحة العظام والكسور (د. مروان سليم)",
      date: "كانون الثاني 2018 – شباط 2020",
      bullets: [
        "إدارة حجوزات واستقبال المراجعين، حفظ وتنظيم السجلات الطبية وجدول مواعيد العيادة بدقة واحترافية."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "جامعة المشرق – بغداد",
      degree: "بكالوريوس تقنيات التحليلات المرضية",
      year: "تشرين الأول 2020 – أيار 2024"
    }
  ],
  certifications: [
    { id: "cert-1", title: "دورة متخصصة في صناعة الحملات الإعلانية على Facebook & Instagram" },
    { id: "cert-2", title: "دورة متقدمة في البرامج المكتبية ومعالجة الجداول والنصوص (Microsoft Excel & Word)" }
  ]
};

const DEFAULT_EN_DATA: LanguageSpecificData = {
  fullName: "Sajjad Hani",
  jobTitle: "Sales Specialist & Commercial Operations Lead",
  summary: "Ambitious and versatile professional with extensive practical experience in sales management, financial accounting, digital marketing, as well as field and pharmaceutical sales. Proven track record in operating accounting software (such as Al-Bayan ERP), inventory control, and business data analytics via Microsoft Office suite, alongside high proficiency in executing high-ROI advertising campaigns and optimizing commercial operations.",
  email: "hany76734@gmail.com",
  phone: "07859312867",
  location: "Baghdad, Iraq (DOB: 28 Apr 2002)",
  linkedin: "linkedin.com/in/sajjadhani",
  skills: [
    "Paid Advertising & Social Media Campaigns (Facebook & Instagram)",
    "Advanced Data Sheets & Microsoft Office (Excel & Word)",
    "Digital Subscription Systems & App Data Management (IPTV)",
    "Accounting & Inventory ERP Software (Al-Bayan)",
    "Direct & Field Sales, Negotiations & Client Relationship Management",
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Sales Manager",
      company: "Gaming & Retail Store — Al-Jadriya Mall, Baghdad",
      date: "Nov 2025 – Present",
      bullets: [
        "Supervising complete showroom sales operations, team workflow, and elevating customer retail experience.",
        "Monitoring inventory turnover, restocking schedules, and consistently surpassing monthly revenue targets."
      ]
    },
    {
      id: "exp-2",
      role: "Field Medical Sales Representative",
      company: "Al-Hadaf Al-Mubashir Medical Co. — Baghdad",
      date: "Sep 2025 – Oct 2025",
      bullets: [
        "Managing field distribution and promotion of pharmaceuticals and medical supplies, cultivating strategic partnerships with pharmacies, clinics, and hospitals."
      ]
    },
    {
      id: "exp-3",
      role: "Sales Manager",
      company: "Tudia Security Cameras & Solar Energy Systems",
      date: "Aug 2024 – Sep 2025",
      bullets: [
        "Leading in-house commercial sales, B2B client negotiations, and expanding wholesale distribution networks."
      ]
    },
    {
      id: "exp-4",
      role: "Accounts & Inventory Manager",
      company: "Tudia Security Cameras & Solar Energy Systems",
      date: "Aug 2024 – Feb 2025",
      bullets: [
        "Managing financial records, billing, and SKU item cataloging using Al-Bayan ERP, while conducting periodic warehouse inventory audits."
      ]
    },
    {
      id: "exp-5",
      role: "Medical & Commercial Sales Associate",
      company: "Al-Munjid Pharmaceutical Store — Baghdad",
      date: "Jan 2023 – Jul 2024",
      bullets: [
        "Handling wholesale pharmacy sales counter, billing workflows, and invoice processing via Al-Bayan ERP.",
        "Serving as commercial and scientific representative across community clinics and pharmacies, presenting product lines and reconciling accounts."
      ]
    },
    {
      id: "exp-6",
      role: "Digital Sales & Operations Lead",
      company: "Digital Subscriptions Platform",
      date: "Jan 2024 – Present",
      bullets: [
        "Directing monthly and annual subscription sales for premium streaming channels, video on demand, and IPTV services.",
        "Managing application database input/output, user credentials, and service activation workflows with high precision."
      ]
    },
    {
      id: "exp-7",
      role: "E-Commerce Sales Specialist",
      company: "Lavender Watches & Accessories Store",
      date: "Apr 2022 – Oct 2023",
      bullets: [
        "Managing customer inquiries, reservations, and order fulfillment via Facebook and Instagram, coordinating courier delivery logistics."
      ]
    },
    {
      id: "exp-8",
      role: "Medical Clinic Secretary",
      company: "Orthopedic & Fracture Clinic (Dr. Marwan Saleem)",
      date: "Jan 2018 – Feb 2020",
      bullets: [
        "Directing patient reception, appointments scheduling, clinic filing, and medical calendar management with high professionalism."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "Al-Mashreq University — Baghdad",
      degree: "B.Sc. in Medical Laboratory Technology",
      year: "Oct 2020 – May 2024"
    }
  ],
  certifications: [
    { id: "cert-1", title: "Professional Advertising Specialist — Facebook & Instagram Ads" },
    { id: "cert-2", title: "Advanced Microsoft Office Productivity & Data Processing (Excel & Word)" }
  ]
};

function convertDocLanguage(sourceDoc: LanguageSpecificData, targetLang: "AR" | "EN"): LanguageSpecificData {
  return {
    fullName: translateOrTransliterate(sourceDoc.fullName, targetLang),
    jobTitle: translateOrTransliterate(sourceDoc.jobTitle, targetLang),
    summary: translateOrTransliterate(sourceDoc.summary, targetLang),
    email: sourceDoc.email || "",
    phone: sourceDoc.phone || "",
    location: translateOrTransliterate(sourceDoc.location, targetLang),
    linkedin: sourceDoc.linkedin || "",
    skills: (sourceDoc.skills || []).map((s) => translateOrTransliterate(s, targetLang)),
    experiences: (sourceDoc.experiences || []).map((exp) => ({
      ...exp,
      role: translateOrTransliterate(exp.role, targetLang),
      company: translateOrTransliterate(exp.company, targetLang),
      date: translateOrTransliterate(exp.date, targetLang),
      bullets: (exp.bullets || []).map((b) => translateOrTransliterate(b, targetLang)),
    })),
    education: (sourceDoc.education || []).map((edu) => ({
      ...edu,
      school: translateOrTransliterate(edu.school, targetLang),
      degree: translateOrTransliterate(edu.degree, targetLang),
      year: translateOrTransliterate(edu.year, targetLang),
    })),
    certifications: (sourceDoc.certifications || []).map((c) => ({
      ...c,
      title: translateOrTransliterate(c.title, targetLang),
    })),
  };
}

export default function PublicCvBuilderPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");
  const { theme, isDark, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "presets" | "styling">("personal");

  // SEPARATE BILINGUAL STATE STORES
  const [docAR, setDocAR] = useState<LanguageSpecificData>(DEFAULT_AR_DATA);
  const [docEN, setDocEN] = useState<LanguageSpecificData>(DEFAULT_EN_DATA);

  // SHARED ASSET & VISIBILITY STATES
  const [photo, setPhoto] = useState<string>("");
  const [showPhoto, setShowPhoto] = useState<boolean>(false);
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
  const [fontScalePercent, setFontScalePercent] = useState<number>(100);
  const [pageMargin, setPageMargin] = useState<"compact" | "normal" | "wide">("normal");
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed">("normal");

  const [a4Zoom, setA4Zoom] = useState<number>(0.85);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSmartParserOpen, setIsSmartParserOpen] = useState<boolean>(false);
  const [smartParserInput, setSmartParserInput] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const curDoc = lang === "AR" ? docAR : docEN;
  const setCurDoc = (updater: (prev: LanguageSpecificData) => LanguageSpecificData) => {
    if (lang === "AR") {
      setDocAR((prev) => updater(prev));
    } else {
      setDocEN((prev) => updater(prev));
    }
  };

  // SMART AI RESUME PARSER HANDLER
  const handleExecuteSmartParse = async () => {
    if (!smartParserInput.trim()) {
      showToast("يرجى لصق النص أو المعلومات أولاً");
      return;
    }
    setIsParsing(true);
    showToast("جاري القراءة والترتيب الذكي بالذكاء الاصطناعي... ✨");

    try {
      const res = await fetch("/api/cv/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: smartParserInput }),
      });
      const data = await res.json();
      if (data?.success && data?.doc) {
        setDocAR(data.doc);
        setIsSmartParserOpen(false);
        setSmartParserInput("");
        showToast("تم استخراج كافة البيانات وتعبئة السيرة الذاتية بنجاح! ✨");

        // Automatically prepare English translation in background
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc: data.doc }),
        })
          .then((r) => r.json())
          .then((trData) => {
            if (trData?.success && trData?.doc) {
              setDocEN(trData.doc);
            }
          })
          .catch(() => {});
      } else {
        showToast("تعذر استخراج البيانات من النص");
      }
    } catch (err) {
      console.error("Parse error:", err);
      showToast("حدث خطأ أثناء معالجة النص");
    } finally {
      setIsParsing(false);
    }
  };

  // PROFESSIONAL ASYNC TRANSLATION TO ENGLISH
  const translateDocumentToEnglish = async () => {
    setIsTranslating(true);
    showToast("جاري الترجمة الذكية الاحترافية للإنجليزية...");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc: docAR }),
      });
      const data = await res.json();
      if (data?.success && data?.doc) {
        setDocEN(data.doc);
        setLang("EN");
        setFontFamily("Outfit");
        showToast("تمت الترجمة الاحترافية بنجاح!");
      } else {
        setDocEN(convertDocLanguage(docAR, "EN"));
        setLang("EN");
        setFontFamily("Outfit");
      }
    } catch (err) {
      console.error("Translation error:", err);
      setDocEN(convertDocLanguage(docAR, "EN"));
      setLang("EN");
      setFontFamily("Outfit");
    } finally {
      setIsTranslating(false);
    }
  };

  // INSTANT BIDIRECTIONAL LANGUAGE SWITCH & TRANSLATION
  const handleInstantSwitchLanguage = async (targetLang: "AR" | "EN") => {
    if (targetLang === lang) return;

    if (targetLang === "EN") {
      const hasEnglishData =
        Boolean(docEN.fullName && /[a-zA-Z]/.test(docEN.fullName)) ||
        Boolean(docEN.summary && /[a-zA-Z]/.test(docEN.summary));

      if (hasEnglishData) {
        setLang("EN");
        setFontFamily("Outfit");
        showToast("تم التحويل للنسخة الإنجليزية الاحترافية ✨");
        return;
      }

      // If no English data exists at all and Arabic exists, translate
      if (docAR.summary || docAR.fullName) {
        await translateDocumentToEnglish();
      } else {
        setLang("EN");
        setFontFamily("Outfit");
        showToast("English Mode");
      }
    } else {
      setLang("AR");
      setFontFamily("Tajawal");
      showToast("تم التحويل للنسخة العربية 🇮🇶");
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

  const handleLoadSampleData = () => {
    if (lang === "AR") {
      setDocAR({ ...DEFAULT_AR_DATA });
      setDocEN({ ...DEFAULT_EN_DATA });
      showToast("تم تحميل نموذج سيرة ذاتية جاهز باللغة العربية");
    } else {
      setDocEN({ ...DEFAULT_EN_DATA });
      setDocAR({ ...DEFAULT_AR_DATA });
      showToast("Loaded ready English sample resume");
    }
  };

  const handleClearCurrent = () => {
    if (window.confirm(lang === "AR" ? "هل أنت متأكد من تفريغ كافة الحقول؟" : "Are you sure you want to clear all fields?")) {
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
        certifications: [],
      };
      setDocAR(emptyDoc);
      setDocEN(emptyDoc);
      showToast(lang === "AR" ? "تم تفريغ كافة الحقول بنجاح" : "All fields cleared");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
        setShowPhoto(true);
        showToast(lang === "AR" ? "تم تعيين الصورة الشخصية بنجاح" : "Profile photo uploaded successfully");
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
    setFontScalePercent(p.fontSize === "compact" ? 90 : p.fontSize === "large" ? 115 : 100);
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
    setCurDoc((prev) => ({ ...prev, education: prev.education.filter((edu) => edu.id !== id) }));
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

  // FLAWLESS CAPTURE DIRECTLY FROM DEDICATED UNSCALED EXPORT ELEMENT
  const generateSinglePdfFromExportDom = async (targetLang: "AR" | "EN") => {
    const isTargetArabic = targetLang === "AR";
    const elementId = isTargetArabic ? "cv-export-arabic-desk" : "cv-export-english-desk";
    const element = document.getElementById(elementId);
    if (!element) return;

    const activeData = isTargetArabic ? docAR : docEN;
    const sanitizedName = (activeData.fullName || "My_CV").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
    const pdfFileName = `${sanitizedName}_CV_${targetLang}_2026.pdf`;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: templateStyle === "clean-white" ? "#ffffff" : templateStyle === "executive-blue" ? "#0f172a" : "#0d0f18",
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

    // Multi-page protection
    while (heightLeft > 5) {
      position = position - pdfPageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfPageHeight;
    }

    pdf.save(pdfFileName);
  };

  // 100% SELECTABLE VECTOR TEXT PDF (ATS FRIENDLY) VIA NATIVE PRINT/SAVE
  const generateSelectableTextPdf = (targetLang: "AR" | "EN") => {
    setIsExportModalOpen(false);
    const isTargetArabic = targetLang === "AR";
    const elementId = isTargetArabic ? "cv-export-arabic-desk" : "cv-export-english-desk";
    const element = document.getElementById(elementId);
    if (!element) {
      showToast("تعذر العثور على عنصر التصدير");
      return;
    }

    const activeData = isTargetArabic ? docAR : docEN;
    const docTitle = `${(activeData.fullName || "CV").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_")}_${targetLang}_ATS`;

    showToast(isTargetArabic ? "جاري فتح نافذة حفظ الـ PDF بنصوص حقيقية قابلة للتحديد (Vector Text)..." : "Opening Selectable Text PDF Export (ATS Compliant)...");

    // Remove any previous print iframe
    const oldIframe = document.getElementById("ats-vector-print-iframe");
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "ats-vector-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "-9999px";
    iframe.style.bottom = "-9999px";
    iframe.style.width = "794px";
    iframe.style.height = "1123px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.style.margin = "0 auto";
    cloned.style.boxShadow = "none";
    cloned.style.border = "none";
    cloned.style.width = "100%";

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="${isTargetArabic ? 'rtl' : 'ltr'}" lang="${isTargetArabic ? 'ar' : 'en'}">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: ${isTargetArabic ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"};
            -webkit-font-smoothing: antialiased;
          }
          body {
            width: 794px;
            margin: 0 auto;
          }
          @media print {
            body {
              width: 100%;
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${cloned.outerHTML}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print to PDF error:", e);
      }
      setTimeout(() => {
        try {
          iframe.remove();
        } catch (_) {}
      }, 5000);
    }, 600);
  };

  // DOWNLOAD HANDLER (CHOICES: AR, EN, OR BOTH)
  const handleExecuteExport = async (choice: "AR" | "EN" | "BOTH") => {
    setIsExportModalOpen(false);
    setIsGeneratingPdf(true);

    try {
      // Smart synchronization: Translate professionally for English export only if not already translated
      if (choice === "EN" || choice === "BOTH") {
        const hasEnglishData =
          Boolean(docEN.fullName && /[a-zA-Z]/.test(docEN.fullName)) ||
          Boolean(docEN.summary && /[a-zA-Z]/.test(docEN.summary));

        if (!hasEnglishData && docAR.summary) {
          showToast("جاري تجهيز الترجمة الإنجليزية الاحترافية قبل التصدير...");
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ doc: docAR }),
            });
            const data = await res.json();
            if (data?.success && data?.doc) {
              setDocEN(data.doc);
              await new Promise((res) => setTimeout(res, 400));
            }
          } catch (e) {
            console.warn("Translation failed before export", e);
          }
        }
      }

      // Small delay to allow React to update export DOM elements
      await new Promise((res) => setTimeout(res, 250));

      if (choice === "AR") {
        showToast("جاري تنزيل ملف الـ PDF باللغة العربية...");
        await generateSinglePdfFromExportDom("AR");
        showToast("تم تنزيل النسخة العربية بنجاح");
      } else if (choice === "EN") {
        showToast("Generating English PDF resume...");
        await generateSinglePdfFromExportDom("EN");
        showToast("English PDF Downloaded successfully");
      } else if (choice === "BOTH") {
        showToast("جاري تجهيز وتنزيل النسختين (العربية والإنجليزية)...");
        // 1. Download Arabic
        await generateSinglePdfFromExportDom("AR");
        await new Promise((res) => setTimeout(res, 800));
        // 2. Download English
        await generateSinglePdfFromExportDom("EN");
        showToast("تم تنزيل النسختين العربية والإنجليزية بنجاح");
      }
    } catch (err) {
      console.error("PDF Export Error:", err);
      showToast("حدث خطأ أثناء تصدير الـ PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isArabic = lang === "AR";

  // REUSABLE DOCUMENT RENDERER (USED FOR BOTH PREVIEW AND ZERO-SCALE EXPORT CANVAS)
  const renderDocumentContent = (docData: LanguageSpecificData, isDocArabic: boolean, canvasId?: string) => {
    const docFontFamily = isDocArabic ? `'${fontFamily || "Tajawal"}', sans-serif` : `'${fontFamily || "Outfit"}', sans-serif`;
    const scale = (basePx: number) => `${(basePx * (fontScalePercent / 100)).toFixed(1)}px`;

    return (
      <div
        id={canvasId}
        style={{
          width: "794px",
          minHeight: "1123px",
          background: templateStyle === "clean-white" ? "#ffffff" : templateStyle === "executive-blue" ? "#0f172a" : "#0d0f18",
          color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff",
          padding: pageMargin === "compact" ? "28px 32px" : pageMargin === "wide" ? "56px 60px" : "44px 48px",
          boxSizing: "border-box",
          fontFamily: docFontFamily,
          fontSize: scale(11.5),
          lineHeight: lineSpacing === "compact" ? "1.45" : lineSpacing === "relaxed" ? "1.85" : "1.65",
          letterSpacing: "normal",
          textRendering: "geometricPrecision",
        }}
        dir={isDocArabic ? "rtl" : "ltr"}
      >
        {/* TWO COLUMN SIDEBAR LAYOUT MODE */}
        {layoutFormat === "two-column-sidebar" ? (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px", alignItems: "start" }}>
            
            {/* SIDEBAR */}
            <div style={{ borderRight: isDocArabic ? "none" : `2px solid ${accentColor}30`, borderLeft: isDocArabic ? `2px solid ${accentColor}30` : "none", paddingRight: isDocArabic ? "0" : "20px", paddingLeft: isDocArabic ? "20px" : "0", display: "flex", flexDirection: "column", gap: "18px" }}>
              {showPhoto && photo && (
                <div style={{ width: "100px", height: "100px", borderRadius: "14px", overflow: "hidden", border: `2.5px solid ${accentColor}`, margin: "0 auto", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <img src={photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div>
                <div style={{ fontSize: scale(11.5), fontWeight: "900", color: accentColor, marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                  {isDocArabic ? "بيانات الاتصال" : "Contact Info"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: scale(10), color: templateStyle === "clean-white" ? "#475569" : "#94a3b8" }}>
                  {docData.email && <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{docData.email}</span></div>}
                  {docData.phone && <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{docData.phone}</span></div>}
                  {docData.location && <div>📍 {docData.location}</div>}
                  {docData.linkedin && <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{docData.linkedin}</span></div>}
                </div>
              </div>

              {showSkills && docData.skills.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(11.5), fontWeight: "900", color: accentColor, marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                    {isDocArabic ? "المهارات والقدرات" : "Skills & Competencies"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {docData.skills.map((sk, i) => (
                      <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "2px 7px", borderRadius: "5px", fontSize: scale(9.5), fontWeight: "700" }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showEducation && docData.education.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(11.5), fontWeight: "900", color: accentColor, marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                    {isDocArabic ? "المؤهلات العلمية" : "Education"}
                  </div>
                  {docData.education.map((edu, i) => (
                    <div key={i} style={{ fontSize: scale(10), marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                      <strong>{edu.degree}</strong>
                      <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8" }}>{edu.school} {edu.year ? `(${edu.year})` : ""}</div>
                    </div>
                  ))}
                </div>
              )}

              {showCertifications && docData.certifications.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(11.5), fontWeight: "900", color: accentColor, marginBottom: "8px", borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "3px" }}>
                    {isDocArabic ? "الشهادات والاعتمادات" : "Certifications"}
                  </div>
                  {docData.certifications.map((cert, i) => (
                    <div key={i} style={{ fontSize: scale(10), marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                      • {cert.title}
                    </div>
                  ))}
                </div>
              )}

              {showQrCode && qrCodeDataUrl && (
                <div style={{ marginTop: "12px", padding: "8px", background: templateStyle === "clean-white" ? "#f8fafc" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: `1.5px solid ${accentColor}40`, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                  <img src={qrCodeDataUrl} alt="QR Code" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
                  <span style={{ fontSize: scale(8), fontWeight: "900", color: accentColor }}>
                    {isDocArabic ? "الموقع التفاعلي" : "LIVE PORTFOLIO"}
                  </span>
                </div>
              )}
            </div>

            {/* MAIN BODY */}
            <div>
              <div style={{ borderBottom: `2.5px solid ${accentColor}`, paddingBottom: "14px", marginBottom: "18px" }}>
                <h2 style={{ fontSize: scale(28), fontWeight: "900", margin: "0 0 4px 0", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                  {docData.fullName || (isDocArabic ? "الاسم الكامل" : "Your Name")}
                </h2>
                <div style={{ fontSize: scale(13.5), fontWeight: "700", color: accentColor }}>
                  {docData.jobTitle || (isDocArabic ? "المسمى الوظيفي" : "Professional Title")}
                </div>
              </div>

              {docData.summary && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ fontSize: scale(12), fontWeight: "900", color: accentColor, marginBottom: "6px" }}>
                    {isDocArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                  </div>
                  <p style={{ fontSize: scale(11), color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                    {docData.summary}
                  </p>
                </div>
              )}

              {docData.experiences.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(12), fontWeight: "900", color: accentColor, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                    {isDocArabic ? "الخبرات المهنية والعملية" : "Work Experience"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {docData.experiences.map((exp, i) => (
                      <div key={exp.id || i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                          <div>
                            <strong style={{ fontSize: scale(12.5), color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                              {exp.role}
                            </strong>
                            <span style={{ fontSize: scale(11.5), color: accentColor, marginLeft: isDocArabic ? "0" : "6px", marginRight: isDocArabic ? "6px" : "0", fontWeight: "700" }}>
                              | {exp.company}
                            </span>
                          </div>
                          <span style={{ fontSize: scale(10.5), color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontWeight: "700" }}>
                            {exp.date}
                          </span>
                        </div>

                        <ul style={{ margin: "3px 0 0 0", paddingLeft: isDocArabic ? "0" : "16px", paddingRight: isDocArabic ? "16px" : "0", fontSize: scale(10.5), color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", lineHeight: "1.5" }}>
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
                <h2 style={{ fontSize: scale(28), fontWeight: "900", margin: "0 0 4px 0", color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                  {docData.fullName || (isDocArabic ? "الاسم الكامل" : "Your Name")}
                </h2>
                <div style={{ fontSize: scale(13.5), fontWeight: "700", color: accentColor, marginBottom: "10px" }}>
                  {docData.jobTitle || (isDocArabic ? "المسمى الوظيفي" : "Professional Title")}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: scale(11), color: templateStyle === "clean-white" ? "#475569" : "#94a3b8", fontWeight: "600" }}>
                  {docData.email && <div>📧 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{docData.email}</span></div>}
                  {docData.phone && <div>📞 <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{docData.phone}</span></div>}
                  {docData.location && <div>📍 {docData.location}</div>}
                  {docData.linkedin && <div>🔗 <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{docData.linkedin}</span></div>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                {showQrCode && qrCodeDataUrl && (
                  <div style={{ padding: "4px", background: "#ffffff", borderRadius: "8px", border: `1.5px solid ${accentColor}`, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <img src={qrCodeDataUrl} alt="QR" style={{ width: "55px", height: "55px", objectFit: "contain" }} />
                    <span style={{ fontSize: scale(6.5), fontWeight: "900", color: "#0f172a", marginTop: "1px" }}>
                      {isDocArabic ? "الموقع" : "PORTFOLIO"}
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
            {docData.summary && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: scale(12.5), fontWeight: "900", color: accentColor, marginBottom: "6px" }}>
                  {isDocArabic ? "الهدف المهني والملخص التنفيذي" : "Executive Summary"}
                </div>
                <p style={{ fontSize: scale(11), lineHeight: "1.65", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0, textAlign: "justify" }}>
                  {docData.summary}
                </p>
              </div>
            )}

            {/* WORK EXPERIENCE */}
            {docData.experiences.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: scale(12.5), fontWeight: "900", color: accentColor, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "12px" }}>
                  {isDocArabic ? "الخبرات المهنية والعملية" : "Professional Work Experience"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {docData.experiences.map((exp, i) => (
                    <div key={exp.id || i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                        <div>
                          <strong style={{ fontSize: scale(13), color: templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                            {exp.role}
                          </strong>
                          <span style={{ fontSize: scale(12), color: accentColor, marginLeft: isDocArabic ? "0" : "8px", marginRight: isDocArabic ? "8px" : "0", fontWeight: "700" }}>
                            | {exp.company}
                          </span>
                        </div>
                        <span style={{ fontSize: scale(11), color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontWeight: "700" }}>
                          {exp.date}
                        </span>
                      </div>

                      <ul style={{ margin: "4px 0 0 0", paddingLeft: isDocArabic ? "0" : "18px", paddingRight: isDocArabic ? "18px" : "0", fontSize: scale(11), color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1", lineHeight: "1.55" }}>
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
            {showSkills && docData.skills.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: scale(12.5), fontWeight: "900", color: accentColor, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "10px" }}>
                  {isDocArabic ? "المهارات التقنية والقدرات" : "Core Technical Skills"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {docData.skills.map((sk, i) => (
                    <span key={i} style={{ background: templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)", border: `1px solid ${accentColor}40`, color: templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0", padding: "3px 9px", borderRadius: "6px", fontSize: scale(10.5), fontWeight: "700" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION & CERTIFICATIONS DUAL ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {showEducation && docData.education.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(12.5), fontWeight: "900", color: accentColor, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                    {isDocArabic ? "المؤهلات العلمية" : "Academic Education"}
                  </div>
                  {docData.education.map((edu, i) => (
                    <div key={i} style={{ fontSize: scale(11), marginBottom: "6px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                      <strong>{edu.degree}</strong>
                      <div style={{ color: templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontSize: scale(10.5) }}>{edu.school} {edu.year ? `(${edu.year})` : ""}</div>
                    </div>
                  ))}
                </div>
              )}

              {showCertifications && docData.certifications.length > 0 && (
                <div>
                  <div style={{ fontSize: scale(12.5), fontWeight: "900", color: accentColor, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: "4px", marginBottom: "8px" }}>
                    {isDocArabic ? "الشهادات والاعتمادات" : "Certified Training"}
                  </div>
                  {docData.certifications.map((cert, i) => (
                    <div key={i} style={{ fontSize: scale(10.5), marginBottom: "4px", color: templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                      • {cert.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`cv-studio-layout ${isDark ? "theme-dark" : "theme-light"}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        background: isDark ? "#0e0d15" : "#f2f1f6",
        color: isDark ? "#ffffff" : "#0f111a",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* 3D CONCAVE DOT GRID BACKGROUND LAYER (MATCHING /images & /tekno) */}
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
            backgroundImage: `radial-gradient(${isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 17, 26, 0.16)"} 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
            transform: `perspective(1000px) rotateX(${16 + mousePos.y * 14}deg) rotateY(${mousePos.x * 16}deg) scale(1.25)`,
            transformOrigin: "center center",
            transition: "transform 0.08s linear, background-image 0.3s ease",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
          }}
        />
      </div>

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
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "800",
            boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* DEDICATED HIDDEN FULL-SCALE EXPORT ELEMENTS FOR FLAWLESS PDF RENDERING */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none", zIndex: -100 }}>
        {renderDocumentContent(docAR, true, "cv-export-arabic-desk")}
        {renderDocumentContent(docEN, false, "cv-export-english-desk")}
      </div>

      {/* DOWNLOAD CHOICE MODAL */}
      {isExportModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "24px",
              padding: "32px 28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 style={{ fontSize: "21px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px 0" }}>
                {isArabic ? "خيارات تصدير السيرة الذاتية (PDF)" : "Resume PDF Export Options"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                {isArabic ? "اختر الطريقة المناسبة: حفظ كملف PDF بنصوص حقيقية قابلة للتحديد والنسخ (متوافق مع أنظمة التوظيف ATS) أو تنزيل مباشر" : "Select between Vector ATS-friendly text PDF or direct file download"}
              </p>
            </div>

            {/* SECTION 1: ATS VECTOR TEXT PDF (SELECTABLE & SEARCHABLE) */}
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "16px", padding: "16px", textAlign: isArabic ? "right" : "left" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "900", color: "#166534" }}>
                  ✨ {isArabic ? "حفظ كـ PDF نصي عالي الدقة (نصوص قابلة للتحديد والنسخ)" : "Vector Selectable Text PDF (ATS Approved)"}
                </span>
                <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>ATS 100%</span>
              </div>
              <p style={{ fontSize: "12px", color: "#15803d", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                {isArabic ? "أفضل خيار للتقديم للشركات وأنظمة التوظيف: نصوص رقمية حقيقية قابلة للنسخ والبحث بدون أن تتحول لصورة." : "Standard vector text format: enables text selection, copying, and seamless parsing by recruitment ATS scanners."}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => generateSelectableTextPdf("AR")}
                  style={{
                    flex: 1,
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(22,163,74,0.3)",
                  }}
                >
                  📄 {isArabic ? "حفظ النسخة العربية (نص حقيقي)" : "Save Arabic (Text PDF)"}
                </button>
                <button
                  onClick={() => generateSelectableTextPdf("EN")}
                  style={{
                    flex: 1,
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(2,132,199,0.3)",
                  }}
                >
                  📄 {isArabic ? "حفظ النسخة الإنجليزية (نص حقيقي)" : "Save English (Text PDF)"}
                </button>
              </div>
            </div>

            {/* SECTION 2: DIRECT DOWNLOAD */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", marginBottom: "10px", textAlign: "center" }}>
                {isArabic ? "أو التنزيل المباشر كملف فوري:" : "Or Direct File Download:"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => handleExecuteExport("AR")}
                  style={{
                    background: "#f8fafc",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>⬇️ {isArabic ? "تنزيل النسخة العربية كملف مباشر" : "Download Arabic PDF File"}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>AR PDF</span>
                </button>
                <button
                  onClick={() => handleExecuteExport("EN")}
                  style={{
                    background: "#f8fafc",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>⬇️ {isArabic ? "تنزيل النسخة الإنجليزية كملف مباشر" : "Download English PDF File"}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>EN PDF</span>
                </button>
                <button
                  onClick={() => handleExecuteExport("BOTH")}
                  style={{
                    background: "#f1f5f9",
                    color: "#2563eb",
                    border: "1px dashed #93c5fd",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>⬇️ {isArabic ? "تنزيل اللغتين معاً (2x PDF)" : "Download Both (AR + EN)"}</span>
                  <span style={{ fontSize: "11px", color: "#2563eb" }}>AR + EN</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsExportModalOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* AI SMART PARSER MODAL */}
      {isSmartParserOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsSmartParserOpen(false)}
        >
          <div
            style={{
              background: isDark ? "#1e2235" : "#ffffff",
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              borderRadius: "24px",
              padding: "28px 24px",
              maxWidth: "580px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>✨</span>
                <h2 style={{ fontSize: "19px", fontWeight: "900", color: isDark ? "#ffffff" : "#0f172a", margin: 0 }}>
                  {isArabic ? "القارئ الذكي للسيرة الذاتية (AI Smart Parser)" : "AI Smart Resume Parser"}
                </h2>
              </div>
              <p style={{ fontSize: "12.5px", color: isDark ? "#94a3b8" : "#64748b", margin: 0, lineHeight: "1.6" }}>
                {isArabic
                  ? "الصق أي نص عشوائي، رسالة واتساب، نبذة عن خبراتك، أو سيرة ذاتية قديمة هنا، وسيقوم النظام الذكي باستخراج اسمك، وظيفتك، خبراتك، دراستك، ومهاراتك وترتيبها وتعبئتها فوراً في السيرة الذاتية!"
                  : "Paste any unstructured text, WhatsApp message, or raw bio notes here. The Smart Parser will extract and format your information into the CV automatically!"}
              </p>
            </div>

            <textarea
              rows={9}
              value={smartParserInput}
              onChange={(e) => setSmartParserInput(e.target.value)}
              placeholder={isArabic ? "الصق النص أو الرسالة أو النبذة هنا..." : "Paste your text, message, or bio notes here..."}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: isDark ? "#0f172a" : "#f8fafc",
                border: isDark ? "1px solid #334155" : "1px solid #cbd5e1",
                borderRadius: "12px",
                fontSize: "13px",
                color: isDark ? "#ffffff" : "#0f172a",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.6",
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsSmartParserOpen(false)}
                disabled={isParsing}
                style={{
                  background: "transparent",
                  border: isDark ? "1px solid #475569" : "1px solid #cbd5e1",
                  color: isDark ? "#cbd5e1" : "#64748b",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={handleExecuteSmartParse}
                disabled={isParsing}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: "900",
                  cursor: isParsing ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 18px rgba(124, 58, 237, 0.4)",
                  opacity: isParsing ? 0.7 : 1,
                }}
              >
                <span>{isParsing ? "جاري الترتيب الذكي... ✨" : "ترتيب وتعبئة السيرة الذاتية ✨"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header
        style={{
          background: isDark ? "rgba(21, 22, 36, 0.9)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0,0,0,0.06)",
          padding: "14px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.03)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          
          {/* LOGO & TITLE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                background: isDark ? "#1e2235" : "#f1f5f9",
                color: isDark ? "#ffffff" : "#0f172a",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                padding: "6px 12px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease",
              }}
            >
              <span>←</span>
              <span>{isArabic ? "الرئيسية" : "Home"}</span>
            </Link>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "17px", fontWeight: "900", margin: 0, color: isDark ? "#ffffff" : "#0f172a" }}>
                  {isArabic ? "إنشاء سيرة ذاتية احترافية" : "Professional ATS CV Builder"}
                </h1>
                <span style={{ background: "#16a34a", color: "#ffffff", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "900" }}>
                  BILINGUAL AR / EN
                </span>
              </div>
              <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                {isArabic ? "أنشئ سيرتك وقم بالتحويل اللحظي بين اللغتين وتصدير ملفات PDF قياسية جاهزة للطباعة" : "Build your CV, switch languages instantly & download print-ready PDFs"}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS: THEME TOGGLE + INSTANT SWITCH + UNIFIED DOWNLOAD BUTTON */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            
            {/* THEME TOGGLE BUTTON (ICON ONLY) */}
            <button
              onClick={toggleTheme}
              title={isArabic ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : (isDark ? "Light Mode" : "Dark Mode")}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: isDark ? "#1e2235" : "#ffffff",
                border: isDark ? "1px solid rgba(96, 165, 250, 0.3)" : "1.5px solid #2563eb",
                color: isDark ? "#60a5fa" : "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
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

            {/* AI SMART PARSER BUTTON */}
            <button
              onClick={() => setIsSmartParserOpen(true)}
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "900",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                transition: "all 0.3s ease",
              }}
            >
              <span>✨ {isArabic ? "القارئ الذكي (لصق وترتيب)" : "AI Smart Parser"}</span>
            </button>

            {/* INSTANT BILINGUAL TRANSLATE TOGGLE BUTTON */}
            <button
              onClick={() => handleInstantSwitchLanguage(isArabic ? "EN" : "AR")}
              disabled={isTranslating}
              style={{
                background: isDark ? "#1e2235" : "#ffffff",
                color: isDark ? "#ffffff" : "#0f172a",
                border: "1.5px solid #2563eb",
                padding: "9px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "900",
                cursor: isTranslating ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(37,99,235,0.12)",
                transition: "all 0.3s ease",
                opacity: isTranslating ? 0.7 : 1,
              }}
            >
              <span>
                {isTranslating
                  ? "جاري التحويل..."
                  : isArabic
                  ? "🇬🇧 النسخة الإنجليزية (EN)"
                  : "🇮🇶 النسخة العربية (AR)"}
              </span>
            </button>

            {/* DIRECT ATS SELECTABLE TEXT VECTOR PDF BUTTON */}
            <button
              onClick={() => generateSelectableTextPdf(lang)}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(2,132,199,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📄 {isArabic ? "حفظ كـ PDF نصي (ATS)" : "Save Text PDF (ATS)"}</span>
            </button>

            {/* UNIFIED DOWNLOAD PDF BUTTON (OPENS MODAL WITH ALL CHOICES) */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={isGeneratingPdf}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(22,163,74,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{isGeneratingPdf ? (isArabic ? "جاري التصدير..." : "Exporting...") : (isArabic ? "📥 خيارات التصدير والتحميل" : "📥 Export Options")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px 16px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 430px) 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* LEFT INTERACTIVE EDITOR PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* TOP BAR ACTIONS (LOAD SAMPLE, CLEAR) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{isArabic ? "لغة التعديل الحالية:" : "Active Language:"}</span>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "#2563eb" }}>
                  {isArabic ? "العربية (RTL)" : "English (LTR)"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setIsSmartParserOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>✨ {isArabic ? "القارئ الذكي (لصق وترتيب)" : "AI Parser"}</span>
                </button>

                <button
                  onClick={handleClearCurrent}
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {isArabic ? "تفريغ الحقول" : "Clear All"}
                </button>
              </div>
            </div>

            {/* SUB-TABS NAVIGATION BAR */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "6px",
                background: "#ffffff",
                padding: "6px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
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
                    color: activeTab === tb.id ? "#ffffff" : "#64748b",
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
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    {isArabic ? "البيانات الشخصية والنبذة" : "Personal Information & Bio"}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "800" }}>
                    {isArabic ? "اللغة: العربية" : "Language: English"}
                  </span>
                </div>

                {/* PHOTO UPLOAD */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: "65px", height: "65px", borderRadius: "12px", overflow: "hidden", background: "#ffffff", border: "1.5px solid #2563eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", cursor: "pointer" }}>
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
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                    {isArabic ? "الاسم الكامل:" : "Full Name:"}
                  </label>
                  <input
                    type="text"
                    value={curDoc.fullName}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder={isArabic ? "مثال: حيدر محمد شوكت" : "e.g. Haider M. Shwkat"}
                    style={{ width: "100%", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                    {isArabic ? "المسمى الوظيفي والمهني:" : "Professional Job Title:"}
                  </label>
                  <input
                    type="text"
                    value={curDoc.jobTitle}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder={isArabic ? "مثال: مبرمج بايثون ومحلل بيانات" : "e.g. Computer Science Specialist"}
                    style={{ width: "100%", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                      {isArabic ? "البريد الإلكتروني:" : "Email Address:"}
                    </label>
                    <input
                      type="email"
                      value={curDoc.email}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      style={{ width: "100%", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                      {isArabic ? "رقم الهاتف:" : "Phone Number:"}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={curDoc.phone}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+964 770 000 0000"
                      style={{ width: "100%", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                      {isArabic ? "المدينة / الدولة:" : "Location:"}
                    </label>
                    <input
                      type="text"
                      value={curDoc.location}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder={isArabic ? "بغداد، العراق" : "Baghdad, Iraq"}
                      style={{ width: "100%", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                      {isArabic ? "رابط لينكد إن / الموقع:" : "LinkedIn / Portfolio:"}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={curDoc.linkedin}
                      onChange={(e) => setCurDoc((prev) => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/username"
                      style={{ width: "100%", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                    {isArabic ? "الهدف المهني والملخص التنفيذي:" : "Executive Summary & Bio:"}
                  </label>
                  <textarea
                    rows={4}
                    value={curDoc.summary}
                    onChange={(e) => setCurDoc((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder={isArabic ? "اكتب نبذة موجزة عن خبرتك وأهدافك المهنية..." : "Write a concise summary of your background and achievements..."}
                    style={{ width: "100%", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px", outline: "none", resize: "vertical", lineHeight: "1.5" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
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
                        background: "#f8fafc",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb" }}>
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
                          style={{ padding: "6px 10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f172a", fontSize: "12px" }}
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
                          style={{ padding: "6px 10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f172a", fontSize: "12px" }}
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
                          style={{ width: "100%", padding: "6px 10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f172a", fontSize: "12px" }}
                        />
                      </div>

                      {/* BULLETS */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{isArabic ? "نقاط المهام والإنجازات:" : "Bullet Points:"}</span>
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                              style={{ flex: 1, padding: "5px 8px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f172a", fontSize: "11.5px" }}
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
                            background: "#ffffff",
                            border: "1px dashed #2563eb",
                            color: "#2563eb",
                            padding: "4px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
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
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* EDUCATION */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                      {isArabic ? "المؤهلات العلمية (Education)" : "Education"}
                    </h3>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
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
                      <div key={edu.id} style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "6px", alignItems: "center" }}>
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
                          style={{ padding: "5px 8px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "5px", color: "#0f172a", fontSize: "11.5px" }}
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
                          style={{ padding: "5px 8px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "5px", color: "#0f172a", fontSize: "11.5px" }}
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
                    <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                      {isArabic ? "الشهادات والاعتمادات (Certifications)" : "Certifications"}
                    </h3>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
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
                      <div key={cert.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", gap: "6px", alignItems: "center" }}>
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
                          style={{ flex: 1, padding: "5px 8px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "5px", color: "#0f172a", fontSize: "11.5px" }}
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
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    {isArabic ? "المهارات والقدرات التقنية" : "Skills & Competencies"}
                  </h3>

                  <label style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
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
                    style={{ flex: 1, padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px" }}
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
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1d4ed8",
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
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "11px", padding: 0 }}
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
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1.5px solid #2563eb", boxShadow: "0 10px 30px rgba(37,99,235,0.08)" }}>
                <div style={{ marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0" }}>
                    {isArabic ? "مكتبة القوالب المتخصصة (9 مجالات)" : "Specialized Industry Presets (9 Domains)"}
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
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
                          background: isSelected ? "#eff6ff" : "#f8fafc",
                          border: isSelected ? `2px solid ${p.accent}` : "1px solid #e2e8f0",
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
                          <strong style={{ fontSize: "13px", color: isSelected ? "#1d4ed8" : "#0f172a", fontWeight: "800" }}>{p.title}</strong>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.accent, display: "inline-block" }} />
                        </div>
                        <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: "700" }}>{p.field}</div>
                        <p style={{ fontSize: "10.5px", color: "#64748b", margin: 0, lineHeight: "1.35" }}>{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: STYLING & QR */}
            {activeTab === "styling" && (
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                  {isArabic ? "تنسيق الصفحة والألوان ورمز الـ QR" : "Layout, Colors & QR Studio"}
                </h3>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "6px" }}>
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
                          background: layoutFormat === fmt.id ? "#2563eb" : "#f8fafc",
                          color: layoutFormat === fmt.id ? "#ffffff" : "#475569",
                          border: "1px solid #e2e8f0",
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
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "6px" }}>
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
                          background: templateStyle === th.id ? "#2563eb" : "#f8fafc",
                          color: templateStyle === th.id ? "#ffffff" : "#475569",
                          border: "1px solid #e2e8f0",
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

                {/* FONT FAMILY SELECTOR */}
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "6px" }}>
                    {isArabic ? "نوع الخط (Font Family):" : "Font Family:"}
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      color: "#0f172a",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {isArabic ? (
                      <>
                        <option value="Tajawal">تجوال (Tajawal - قياسي رسمي)</option>
                        <option value="Cairo">القاهرة (Cairo - عصري بارز)</option>
                        <option value="Alexandria">الإسكندرية (Alexandria - أنيق)</option>
                        <option value="Almarai">المراعي (Almarai - شاشة مريح)</option>
                        <option value="Readex Pro">ريدكس برو (Readex Pro - حديث)</option>
                      </>
                    ) : (
                      <>
                        <option value="Outfit">Outfit (Modern Clean)</option>
                        <option value="Inter">Inter (Global Corporate)</option>
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Executive)</option>
                        <option value="Poppins">Poppins (Friendly Bold)</option>
                        <option value="Montserrat">Montserrat (Classic Clean)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* FONT SIZE CONTROLLER */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                      {isArabic ? "حجم الخط (Font Size):" : "Font Size Scale:"}
                    </label>
                    <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>
                      {fontScalePercent}%
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                    {[
                      { id: "compact", percent: 90, label: isArabic ? "مضغوط (90%)" : "Compact (90%)" },
                      { id: "normal", percent: 100, label: isArabic ? "قياسي (100%)" : "Normal (100%)" },
                      { id: "large", percent: 115, label: isArabic ? "كبير (115%)" : "Large (115%)" },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => {
                          setFontSizeScale(sz.id as any);
                          setFontScalePercent(sz.percent);
                        }}
                        style={{
                          background: fontScalePercent === sz.percent ? "#2563eb" : "#f8fafc",
                          color: fontScalePercent === sz.percent ? "#ffffff" : "#475569",
                          border: "1px solid #e2e8f0",
                          padding: "7px 4px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>

                  {/* Fine-tuning Slider & Stepper */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <button
                      type="button"
                      onClick={() => setFontScalePercent((prev) => Math.max(80, prev - 5))}
                      title={isArabic ? "تصغير الخط" : "Decrease font size"}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontWeight: "900",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="2"
                      value={fontScalePercent}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFontScalePercent(val);
                        if (val <= 92) setFontSizeScale("compact");
                        else if (val >= 112) setFontSizeScale("large");
                        else setFontSizeScale("normal");
                      }}
                      style={{ flex: 1, accentColor: "#2563eb", cursor: "pointer" }}
                    />
                    <button
                      type="button"
                      onClick={() => setFontScalePercent((prev) => Math.min(130, prev + 5))}
                      title={isArabic ? "تكبير الخط" : "Increase font size"}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontWeight: "900",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "6px" }}>
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
                      style={{ flex: 1, padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px" }}
                    />
                  </div>
                </div>

                {/* QR CODE INPUT */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11.5px", color: "#64748b" }}>
                      {isArabic ? "رابط رمز الـ QR المخصص:" : "Custom QR URL:"}
                    </label>
                    <label style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
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
                    style={{ width: "100%", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", fontSize: "12px" }}
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
              background: "#ffffff",
              padding: "20px 14px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            {/* DESK TOOLBAR */}
            <div style={{ width: "100%", maxWidth: "794px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isArabic ? "#16a34a" : "#0284c7" }} />
                <span style={{ fontSize: "12.5px", fontWeight: "900", color: "#0f172a" }}>
                  {isArabic ? "معاينة السيرة (بالعربية AR: ISO A4)" : "Live Preview (English EN: ISO A4)"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{isArabic ? "مقياس العرض:" : "Scale:"}</span>
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
                      background: a4Zoom === z.val ? "#2563eb" : "#f1f5f9",
                      color: a4Zoom === z.val ? "#ffffff" : "#64748b",
                      border: "1px solid #e2e8f0",
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
              <div style={{ boxShadow: "0 15px 45px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                {renderDocumentContent(curDoc, isArabic)}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
