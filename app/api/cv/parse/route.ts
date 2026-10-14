import { NextRequest, NextResponse } from "next/server";

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

// INTELLIGENT MULTI-LAYER RESUME PARSER (HANDLES BOTH GLUED UNFORMATTED TEXT & STRUCTURED LINES)
function parseCvRuleBased(rawText: string): LanguageSpecificData {
  const text = rawText.trim();

  // 1. Email & Phone Extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0].trim() : "";

  const phoneMatch = text.match(/(?:\+?964|00964|0)?7[0-9]{9}\b|(?:\+?[0-9]{1,4}[-.\s]?)?\(?[0-9]{3,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,5}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // 2. Full Name Extraction
  let fullName = "";
  const nameMatch = text.match(/(?:(?:الاسم الكامل|اسم الشخصية|الاسم|اسم|Name)\s*:?\s*)([\u0600-\u06FF\s]+?)(?=\s*\(|\s*العنوان|\s*عنوان|\s*رقم|\s*البريد|\s*تاريخ|\s*\n|$)/i);
  if (nameMatch && nameMatch[1].trim().length > 2) {
    fullName = nameMatch[1].trim();
  }
  if (!fullName) {
    const firstLine = text.split(/\r?\n/)[0]?.trim();
    if (firstLine && !firstLine.includes("@") && !firstLine.includes("07") && firstLine.length < 40) {
      const cleanFirst = firstLine.replace(/^(?:الاسم|Name)\s*:?\s*/i, "").trim();
      if (/^[\u0600-\u06FF\sA-Za-z]+$/.test(cleanFirst)) {
        fullName = cleanFirst;
      }
    }
  }

  // 3. Location Extraction
  let location = "";
  const locMatch = text.match(/(?:العنوان|عنوان)\s*:?\s*([^\n\r]+?)(?=\s*رقم|\s*البريد|\s*تاريخ|\s*\n|$)/i);
  if (locMatch && locMatch[1].trim()) {
    location = locMatch[1].trim();
  } else if (/بغداد/.test(text)) {
    location = "بغداد، العراق";
  } else if (/أربيل|اربيل/.test(text)) {
    location = "أربيل، العراق";
  } else if (/البصرة|بصرة/.test(text)) {
    location = "البصرة، العراق";
  } else if (/النجف/.test(text)) {
    location = "النجف، العراق";
  } else if (/كربلاء/.test(text)) {
    location = "كربلاء، العراق";
  } else if (/العراق/.test(text)) {
    location = "العراق";
  }

  // 4. LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // 5. Summary Section
  const summaryM = text.match(/(?:الهدف المهني(?: والملخص التنفيذي)?|الملخص التنفيذي|النبذة المهنية|النبذة|الهدف المهني)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:التحصيل الدراسي|الشهادات الأكاديمية|المؤهلات العلمية|التعليم|Education))/i) ||
    text.match(/(?:الهدف المهني(?: والملخص التنفيذي)?|الملخص التنفيذي|النبذة المهنية|النبذة|الملخص|Summary)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:التحصيل الدراسي|التعليم|الخبرات|الخبرة|المهارات|Skills|Work Experience|$))/i);
  let summary = summaryM ? summaryM[1].trim() : "";
  summary = summary.replace(/^\s*\((?:Summary|نبذة|ملخص|الهدف)\)\s*:?\s*/i, "").trim();

  // 6. Education Section
  const eduM = text.match(/(?:التحصيل الدراسي|الشهادات الأكاديمية|المؤهلات العلمية|التعليم|Education)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:الخبرات المهنية|الخبرات والعملية|سجل الخبرات|Work Experience|الخبرات|المهارات|Skills|$))/i);
  const eduText = eduM ? eduM[1].trim() : "";
  const education: CvEducation[] = [];
  if (eduText) {
    const parenDateMatch = eduText.match(/\(([^)]*(?:(?:19|20)\d{2}|الآن)[^)]*)\)/);
    let year = parenDateMatch ? parenDateMatch[1].trim() : "2020 - 2024";
    let clean = eduText.replace(parenDateMatch ? parenDateMatch[0] : "", "").trim();
    clean = clean.replace(/[\(\)]/g, "").replace(/^[•\-\*\d\.\)]\s*/, "").replace(/[-–|،,]\s*$/, "").trim();
    const parts = clean.split(/[-–|،,]\s*|\s{3,}/);
    const degree = parts[0]?.trim() || "بكالوريوس";
    const school = parts.slice(1).join(" - ").trim() || degree;

    education.push({
      id: "1",
      degree,
      school,
      year,
    });
  }

  // 7. Experience Section (Handles glued multi-experience text or formatted lines)
  const expM = text.match(/(?:الخبرات المهنية(?:\s*\([\w\s]+\))?|الخبرات والعملية|الخبرات|سجل الخبرات|سجل العمل|Work Experience)\s*:?\s*([\s\S]*?)(?=(?:المهارات\s*\(\s*Skills\s*\)|المهارات والقدرات|المهارات والخبرات|[\n\r]\s*المهارات|Skills|الشهادات|الدورات|Certifications|$))/i);
  const expText = expM ? expM[1].trim() : "";
  const experiences: CvExperience[] = [];

  if (expText) {
    // Split into individual experience entries
    const expItems = expText.split(/(?<=[.\n]|\s{3,})(?=(?:مدير|مندوب|مسؤول|أخصائي|محاسب|سكرتير|مبيعات|شركة|محل|معرض|مذخر)\s+[^\n(]+(?:\(|\|))/);
    let prevCompany = "";

    expItems.forEach((item, idx) => {
      const trimmed = item.trim();
      if (!trimmed || trimmed.length < 8) return;

      // Extract date from parentheses
      let date = "";
      const dateMatch = trimmed.match(/\(([^)]*(?:(?:19|20)\d{2}|حتى الآن|سنة|أشهر|شهر)[^)]*)\)/);
      if (dateMatch) {
        date = dateMatch[1].trim();
      }

      const beforeDate = dateMatch ? trimmed.substring(0, dateMatch.index).trim() : trimmed;
      const afterDate = dateMatch ? trimmed.substring(dateMatch.index + dateMatch[0].length).trim() : "";

      let role = "";
      let company = "";

      if (beforeDate.includes("|")) {
        const parts = beforeDate.split("|").map((p) => p.trim());
        role = parts[0].replace(/^[•\-\*\d\.\)]\s*/, "").trim();
        company = parts.slice(1).join(" | ").trim();
      } else {
        const parts = beforeDate.split(/[-–:]\s*/);
        if (parts.length >= 2) {
          role = parts[0].trim();
          company = parts.slice(1).join(" - ").trim();
        } else {
          if (/^شركة|محل|معرض|مذخر|مستشفى|مركز/.test(beforeDate)) {
            company = beforeDate;
            role = "مسؤول مبيعات";
          } else {
            role = beforeDate;
            company = prevCompany || beforeDate;
          }
        }
      }

      if (company && company !== role) {
        prevCompany = company;
      } else if (prevCompany && (company === role || !company)) {
        company = prevCompany;
      }

      // Bullets from afterDate
      let bullets: string[] = [];
      if (afterDate) {
        bullets = afterDate
          .split(/[.\n؛]\s*/)
          .map((b) => b.replace(/^[:\-\s]+/, "").trim())
          .filter((b) => b.length > 5);
      }

      experiences.push({
        id: String(idx + 1),
        role: role || "مسؤول مبيعات",
        company: company || role,
        date: date || "2024 - حتى الآن",
        bullets: bullets.length > 0 ? bullets : ["إدارة وتنفيذ المهام الوظيفية والمستهدفات المحددة"],
      });
    });
  }

  // 8. Skills Section
  const skillsM = text.match(/(?:المهارات\s*\(\s*Skills\s*\)|المهارات والقدرات|المهارات والخبرات|[\n\r]\s*المهارات)\s*:?\s*([\s\S]*?)(?=(?:الدورات التدريبية|الشهادات والدورات|الشهادات والاعتمادات|الشهادات|Courses & Certifications|Certifications|$))/i);
  const skillsText = skillsM ? skillsM[1].trim() : "";
  const skills: string[] = [];
  if (skillsText) {
    skillsText.split(/[.\n؛]\s*/).forEach((item) => {
      const clean = item.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      if (!clean) return;
      if (clean.includes(":")) {
        const title = clean.split(":")[0].trim();
        if (title.length > 2 && title.length < 50 && !skills.includes(title)) {
          skills.push(title);
        }
      } else if (clean.length > 2 && clean.length < 50 && !skills.includes(clean)) {
        skills.push(clean);
      }
    });
  }

  // 9. Certifications Section
  const certsM = text.match(/(?:الدورات التدريبية|الشهادات والدورات|الشهادات والاعتمادات|الشهادات|Courses & Certifications|Certifications)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)$/i);
  const certsText = certsM ? certsM[1].trim() : "";
  const certifications: CvCertification[] = [];
  if (certsText) {
    certsText.split(/[.\n؛]\s*/).forEach((l, idx) => {
      const clean = l.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      if (clean.length > 5) {
        certifications.push({
          id: String(idx + 1),
          title: clean,
        });
      }
    });
  }

  // 10. Determine Job Title
  let jobTitle = experiences[0]?.role || "";
  if (!jobTitle) {
    const jobMatch = text.match(/(?:المسمى الوظيفي|الوظيفة|المهنة)\s*:?\s*([^\n\r]+)/i);
    if (jobMatch) jobTitle = jobMatch[1].trim();
  }

  // Summary generation fallback if missing
  if (!summary && experiences.length > 0) {
    summary = `مهني طموح ومتخصص في ${jobTitle || "إدارة الأعمال"}، يمتلك خبرة عملية مثبتة في تنظيم وإدارة المهام وتحقيق أعلى مستويات الأداء.`;
  }

  return {
    fullName,
    jobTitle: jobTitle || "أخصائي مبيعات",
    summary,
    email,
    phone,
    location,
    linkedin,
    skills: skills.length > 0 ? skills : ["إدارة المبيعات", "التسويق الرقمي", "البرامج المحاسبية", "خدمة العملاء"],
    experiences,
    education,
    certifications,
  };
}

// 2. GEMINI AI PARSER (OPTIONAL CLOUD ENHANCEMENT)
async function parseCvWithGemini(rawText: string, apiKey: string): Promise<LanguageSpecificData | null> {
  try {
    const prompt = `You are an expert AI Resume and CV parser.
Given the following raw text or notes written by a user in Arabic, English, or Iraqi dialect, accurately parse and extract all details into a clean, structured JSON format for their CV.

Raw Text:
"""
${rawText}
"""

Instructions:
- Extract 'fullName'
- Extract 'jobTitle'
- Extract 'summary' (only the bio/summary paragraph, NEVER include the entire document or other sections here)
- Extract 'email', 'phone', 'location' (e.g. 'بغداد، العراق')
- Extract list of 'skills' (array of strings)
- Extract 'experiences': array of { id, role, company, date, bullets: string[] }
- Extract 'education': array of { id, school, degree, year }
- Extract 'certifications': array of { id, title }

Respond ONLY with valid JSON. Do not include markdown or backticks. Format:
{
  "fullName": "...",
  "jobTitle": "...",
  "summary": "...",
  "email": "...",
  "phone": "...",
  "location": "...",
  "linkedin": "...",
  "skills": ["..."],
  "experiences": [{ "id": "1", "role": "...", "company": "...", "date": "...", "bullets": ["..."] }],
  "education": [{ "id": "1", "school": "...", "degree": "...", "year": "..." }],
  "certifications": [{ "id": "1", "title": "..." }]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return parsed as LanguageSpecificData;
      }
    }
  } catch (err) {
    console.warn("Gemini CV parsing error, falling back to rule-based parser:", err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || body.rawText;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json({ error: "No text provided to parse" }, { status: 400 });
    }

    // Check if Gemini API key exists in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    let result: LanguageSpecificData | null = null;

    if (geminiKey) {
      result = await parseCvWithGemini(rawText, geminiKey);
    }

    // Fallback to intelligent rule-based parser if AI wasn't used or failed
    if (!result) {
      result = parseCvRuleBased(rawText);
    }

    return NextResponse.json({
      success: true,
      doc: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to parse text" },
      { status: 500 }
    );
  }
}
