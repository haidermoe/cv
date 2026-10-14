import { NextRequest, NextResponse } from "next/server";

// Comprehensive CV Dictionary for Instant, High-Precision Resume Translations
const CV_DICTIONARY: Record<string, string> = {
  // Common CV Fields & Sections
  "الملخص التنفيذي": "Executive Summary",
  "النبذة المهنية": "Professional Summary",
  "الخبرات المهنية": "Work Experience",
  "الخبرات": "Experience",
  "المهارات والخبرات": "Skills & Competencies",
  "المهارات": "Skills",
  "التعليم": "Education",
  "الشهادات": "Certifications",
  "معلومات الاتصال": "Contact Information",

  // Job Titles - Sales & Retail
  "مبيعات": "Sales Specialist",
  "مندوب مبيعات": "Sales Representative",
  "مدير مبيعات": "Sales Manager",
  "مدير مبيعات وحسابات": "Sales & Accounts Manager",
  "مبيعات ومندوب مبيعات": "Sales Representative & Field Associate",
  "مسؤول مبيعات": "Sales Executive",
  "مسؤول مبيعات وإدارة صفحة رقمية": "Sales Executive & Digital Operations Lead",
  "مسؤول مبيعات ومتجر إلكتروني": "E-Commerce & Retail Sales Specialist",
  "أخصائي مبيعات": "Sales Specialist",
  "مشرف مبيعات": "Sales Supervisor",
  "كاشير": "Cashier",
  "خدمة عملاء": "Customer Service Representative",
  "موظف استقبال": "Receptionist",

  // Job Titles - Medical & Health
  "سكرتير عيادة طبية": "Medical Clinic Secretary",
  "سكرتير عيادة": "Clinic Coordinator",
  "مساعد طبيب": "Medical Assistant",
  "طبيب عام": "General Physician",
  "طبيب أسنان": "Dentist",
  "صيدلي": "Pharmacist",
  "مساعد صيدلي": "Pharmacy Assistant",
  "ممرض": "Nurse",
  "تقني تحليلات مرضية": "Medical Laboratory Technician",
  "أخصائي تحليلات مرضية": "Pathological Analysis Specialist",

  // Job Titles - Tech & Data
  "متخصص علوم الحاسوب | استشاري عمليات البيانات والأنظمة": "Computer Science Specialist | Data Operations & Workflow Consultant",
  "أخصائي عمليات التجارة الإلكترونية، البيانات والمبيعات": "E-Commerce, Data Operations & Sales Specialist",
  "استشاري حر لعمليات البيانات والحلول التقنية": "Freelance Data & Technical Operations Consultant",
  "مسؤول عمليات ومنسق دعم الشبكات": "Operations Lead & Network Support Coordinator",
  "مهندس برمجيات": "Software Engineer",
  "مطور ويب وتطبيقات": "Full-Stack Web Developer",
  "مطور ويب": "Web Developer",
  "مطور فرونت إند": "Frontend Developer",
  "مطور باك إند": "Backend Developer",
  "محلل بيانات": "Data Analyst",
  "مهندس شبكات": "Network Engineer",
  "مدير تكنولوجيا المعلومات": "IT Manager",
  "دعم فني": "Technical Support Specialist",
  "مصمم جرافيك": "Graphic Designer",
  "مصمم واجهات وتجربة المستخدم": "UI/UX Designer",

  // Job Titles - Management & Admin
  "مدير عام": "General Manager",
  "مدير تنفيذي": "Chief Executive Officer (CEO)",
  "مدير عمليات": "Operations Manager",
  "مدير مشاريع": "Project Manager",
  "منسق مشاريع": "Project Coordinator",
  "مسؤول مشتريات": "Procurement Specialist",
  "مدير مالي": "Finance Manager",
  "محاسب": "Accountant",
  "محاسب مالي": "Financial Accountant",
  "مدقق حسابات": "Auditor",
  "أخصائي موارد بشرية": "HR Specialist",
  "مدير موارد بشرية": "HR Manager",
  "سكرتير تنفيذي": "Executive Secretary",
  "موظف إداري": "Administrative Officer",
  "مترجم": "Professional Translator",
  "محامي": "Lawyer",
  "محامي واستشاري قانوني": "Legal Consultant & Attorney",
  "معلم": "Teacher",
  "أستاذ جامعي": "University Professor",

  // Education Degrees & Universities
  "بكالوريوس تقنيات التحليلات المرضية": "Bachelor of Medical Laboratory Technology",
  "بكالوريوس علوم الحاسوب": "Bachelor of Science in Computer Science",
  "بكالوريوس هندسة البرمجيات": "B.Sc. in Software Engineering",
  "بكالوريوس إدارة أعمال": "Bachelor of Business Administration (BBA)",
  "بكالوريوس محاسبة": "Bachelor of Science in Accounting",
  "بكالوريوس صيدلة": "Bachelor of Pharmacy",
  "بكالوريوس طب وجراحة عامة": "Bachelor of Medicine & Surgery (MBBS)",
  "بكالوريوس طب أسنان": "Bachelor of Dental Surgery (BDS)",
  "بكالوريوس هندسة مدنية": "B.Sc. in Civil Engineering",
  "بكالوريوس هندسة ميكانيكية": "B.Sc. in Mechanical Engineering",
  "بكالوريوس هندسة كهربائية": "B.Sc. in Electrical Engineering",
  "بكالوريوس قانون": "Bachelor of Laws (LL.B.)",
  "بكالوريوس لغة إنجليزية": "Bachelor of Arts in English Language",
  "دبلوم عالي": "Higher Diploma",
  "ماجستير": "Master's Degree",
  "دكتوراه": "Ph.D.",
  "جامعة بغداد": "University of Baghdad",
  "الجامعة المستنصرية": "Mustansiriyah University",
  "الجامعة التكنولوجية": "University of Technology - Iraq",
  "جامعة المشرق": "Al-Mashreq University",
  "جامعة الفراهيدي": "Al-Farahidi University",
  "كلية المنصور الجامعة": "Al-Mansour University College",
  "كلية الرافدين الجامعة": "Al-Rafidain University College",
  "جامعة البصرة": "University of Basrah",
  "جامعة الموصل": "University of Mosul",
  "جامعة بابل": "University of Babylon",

  // Dates & Periods
  "حتى الآن": "Present",
  "إلى الآن": "Present",
  "الحالي": "Present",
  "كانون الثاني": "January",
  "شباط": "February",
  "آذار": "March",
  "نيسان": "April",
  "أيار": "May",
  "حزيران": "June",
  "تموز": "July",
  "آب": "August",
  "أيلول": "September",
  "تشرين الأول": "October",
  "تشرين الثاني": "November",
  "كانون الأول": "December",

  // Locations
  "العراق": "Iraq",
  "بغداد": "Baghdad",
  "بغداد، العراق": "Baghdad, Iraq",
  "البصرة": "Basra",
  "أربيل": "Erbil",
  "السليمانية": "Sulaymaniyah",
  "النجف": "Najaf",
  "كربلاء": "Karbala",
  "الموصل": "Mosul",
  "بابل": "Babylon",
  "كركوك": "Kirkuk",
};

// Common Arabic Names mapping for natural English spelling
const NAMES_MAP: Record<string, string> = {
  "سجاد": "Sajjad", "هاني": "Hani", "محمد": "Mohammed", "أحمد": "Ahmed", "احمد": "Ahmed",
  "علي": "Ali", "حسين": "Hussein", "حسن": "Hassan", "عمر": "Omar", "عثمان": "Othman",
  "مصطفى": "Mustafa", "يوسف": "Youssef", "إبراهيم": "Ibrahim", "ابراهيم": "Ibrahim",
  "خالد": "Khalid", "سارة": "Sarah", "فاطمة": "Fatima", "زينب": "Zainab", "مريم": "Maryam",
  "نور": "Noor", "محمود": "Mahmoud", "طارق": "Tariq", "ياسر": "Yasser", "كريم": "Karim",
  "سامر": "Samer", "ماجد": "Majid", "حمزة": "Hamza", "بلال": "Bilal", "عمار": "Ammar",
  "أيمن": "Ayman", "ليث": "Laith", "حيدر": "Haider", "جعفر": "Jaafar", "أنس": "Anas",
  "أوس": "Aws", "رائد": "Raid", "وسام": "Wissam", "مهند": "Mohannad", "زياد": "Ziad",
  "بشار": "Bashar", "شوكت": "Shwkat", "عبدالله": "Abdullah", "عبد الرحمن": "Abdulrahman"
};

async function translateSinglePhrase(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();

  // 1. Direct dictionary lookup
  if (CV_DICTIONARY[trimmed]) return CV_DICTIONARY[trimmed];

  // 2. Check if name
  const nameParts = trimmed.split(/\s+/);
  if (nameParts.length <= 4 && nameParts.every(p => NAMES_MAP[p])) {
    return nameParts.map(p => NAMES_MAP[p]).join(" ");
  }

  // 3. Fast date replacement
  let processed = trimmed;
  let hasReplaced = false;
  for (const [ar, en] of Object.entries(CV_DICTIONARY)) {
    if (processed.includes(ar)) {
      processed = processed.replaceAll(ar, en);
      hasReplaced = true;
    }
  }
  if (!/[\u0600-\u06FF]/.test(processed)) {
    return processed;
  }

  // 4. Translate full sentence / paragraph using MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|en&de=support@haidermoe.com`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const translation = data?.responseData?.translatedText;
      if (
        translation &&
        translation.trim() &&
        translation !== trimmed &&
        !translation.includes("MYMEMORY WARNING") &&
        !translation.includes("INVALID")
      ) {
        return translation.trim();
      }
    }
  } catch (err) {
    console.warn("Translation API error:", err);
  }

  // 5. If translation API didn't return a result, return the partially translated/original text cleanly
  return hasReplaced ? processed : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Single text translation
    if (body.text && typeof body.text === "string") {
      const result = await translateSinglePhrase(body.text);
      return NextResponse.json({ success: true, translated: result });
    }

    // 2. Array of texts
    if (Array.isArray(body.texts)) {
      const results = await Promise.all(
        body.texts.map((t: string) => translateSinglePhrase(t))
      );
      return NextResponse.json({ success: true, translated: results });
    }

    // 3. Full CV Document Translation
    if (body.doc && typeof body.doc === "object") {
      const doc = body.doc;

      // Translate top fields in parallel
      const [fullName, jobTitle, summary, location] = await Promise.all([
        translateSinglePhrase(doc.fullName || ""),
        translateSinglePhrase(doc.jobTitle || ""),
        translateSinglePhrase(doc.summary || ""),
        translateSinglePhrase(doc.location || ""),
      ]);

      // Translate skills
      const skills = await Promise.all(
        (doc.skills || []).map((s: string) => translateSinglePhrase(s))
      );

      // Translate experiences
      const experiences = await Promise.all(
        (doc.experiences || []).map(async (exp: any) => {
          const [role, company, date] = await Promise.all([
            translateSinglePhrase(exp.role || ""),
            translateSinglePhrase(exp.company || ""),
            translateSinglePhrase(exp.date || ""),
          ]);
          const bullets = await Promise.all(
            (exp.bullets || []).map((b: string) => translateSinglePhrase(b))
          );
          return { ...exp, role, company, date, bullets };
        })
      );

      // Translate education
      const education = await Promise.all(
        (doc.education || []).map(async (edu: any) => {
          const [school, degree, year] = await Promise.all([
            translateSinglePhrase(edu.school || ""),
            translateSinglePhrase(edu.degree || ""),
            translateSinglePhrase(edu.year || ""),
          ]);
          return { ...edu, school, degree, year };
        })
      );

      // Translate certifications
      const certifications = await Promise.all(
        (doc.certifications || []).map(async (c: any) => {
          const title = await translateSinglePhrase(c.title || "");
          return { ...c, title };
        })
      );

      return NextResponse.json({
        success: true,
        doc: {
          fullName,
          jobTitle,
          summary,
          email: doc.email || "",
          phone: doc.phone || "",
          location,
          linkedin: doc.linkedin || "",
          skills,
          experiences,
          education,
          certifications,
        },
      });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Translation failed" },
      { status: 500 }
    );
  }
}
