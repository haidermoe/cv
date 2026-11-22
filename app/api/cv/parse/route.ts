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

// INTELLIGENT MULTI-LAYER RESUME PARSER
function parseCvRuleBased(rawText: string): LanguageSpecificData {
  const text = rawText.trim();

  // 1. Email Extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0].trim() : "";

  // 2. Phone Extraction (Iraq / International format)
  const phoneMatch = text.match(/(?:\+?964|00964|0)?7[0-9]{9}\b|(?:\+?[0-9]{1,4}[-.\s]?)?\(?[0-9]{3,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,5}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // 3. Full Name Extraction
  let fullName = "";
  const nameMatch = text.match(/(?:(?:الاسم الكامل|اسم الشخصية|اسم|الاسم|Name)\s*:?\s*)([\u0600-\u06FF\s]+?)(?=\s*\(|\s*عنوان|\s*رقم|\s*البريد|\s*تاريخ|\s*\n|$)/i);
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

  // 4. Location Extraction
  let location = "";
  const locMatch = text.match(/عنوان\s*:?\s*([^\n\r]+?)(?=\s*رقم|\s*البريد|\s*تاريخ|\s*\n|$)/i);
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

  // 5. LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // 6. Line-anchored Section Header Grouping
  const sectionHeaders = [
    { key: "summary", regex: /^(?:الهدف المهني(?: والملخص التنفيذي)?|الملخص التنفيذي|النبذة المهنية|النبذة|الملخص|Summary)(?:\s*\([^)]*\))?\s*:?/i },
    { key: "education", regex: /^(?:التحصيل الدراسي|الشهادات الأكاديمية|المؤهلات العلمية|التعليم|Education)(?:\s*\([^)]*\))?\s*:?/i },
    { key: "experience", regex: /^(?:الخبرات المهنية(?: والعملية)?|الخبرات|سجل الخبرات|الخبرة|سجل العمل|Work Experience|Experience)(?:\s*\([^)]*\))?\s*:?/i },
    { key: "skills", regex: /^(?:المهارات والقدرات|المهارات|Skills & Competencies|Skills)(?:\s*\([^)]*\))?\s*:?/i },
    { key: "certifications", regex: /^(?:الشهادات والدورات(?: التدريبية)?|الشهادات والاعتمادات|الشهادات|الدورات(?: التدريبية)?|Certifications|Courses)(?:\s*\([^)]*\))?\s*:?/i },
  ];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: {
    summary: string[];
    education: string[];
    experience: string[];
    skills: string[];
    certifications: string[];
  } = {
    summary: [],
    education: [],
    experience: [],
    skills: [],
    certifications: [],
  };

  let currentSection: keyof typeof sections | null = null;

  for (const line of lines) {
    let matchedHeader = false;
    for (const h of sectionHeaders) {
      if (h.regex.test(line)) {
        currentSection = h.key as keyof typeof sections;
        matchedHeader = true;
        const rest = line.replace(h.regex, "").trim();
        if (rest) sections[currentSection].push(rest);
        break;
      }
    }

    if (!matchedHeader) {
      if (currentSection) {
        sections[currentSection].push(line);
      }
    }
  }

  // Fallback: If sections were not detected by line headers (e.g. single-block pasted text)
  if (sections.experience.length === 0 && sections.skills.length === 0) {
    const summaryM = text.match(/(?:الهدف المهني(?: والملخص التنفيذي)?|الملخص التنفيذي|النبذة المهنية|النبذة|Summary)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:التحصيل الدراسي|التعليم|الخبرات|الخبرة|المهارات|Skills|Work Experience|$))/i);
    if (summaryM) sections.summary.push(summaryM[1].trim());

    const eduM = text.match(/(?:التحصيل الدراسي|الشهادات الأكاديمية|المؤهلات العلمية|التعليم|Education)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:الخبرات|الخبرة|المهارات|الشهادات|Skills|Work Experience|$))/i);
    if (eduM) sections.education.push(eduM[1].trim());

    const expM = text.match(/(?:الخبرات المهنية(?: والعملية)?|الخبرات|سجل الخبرات|الخبرة|Work Experience)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:المهارات|Skills|الشهادات|Certifications|$))/i);
    if (expM) sections.experience.push(expM[1].trim());

    const skillsM = text.match(/(?:المهارات والقدرات|المهارات|Skills & Competencies|Skills)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)(?=(?:الشهادات|الدورات|Certifications|$))/i);
    if (skillsM) sections.skills.push(skillsM[1].trim());

    const certsM = text.match(/(?:الشهادات والدورات(?: التدريبية)?|الشهادات والاعتمادات|الشهادات|الدورات|Certifications|Courses)(?:\s*\([^)]*\))?\s*:?\s*([\s\S]*?)$/i);
    if (certsM) sections.certifications.push(certsM[1].trim());
  }

  // Clean Summary
  let summary = sections.summary
    .join(" ")
    .replace(/^\s*\((?:Summary|نبذة|ملخص|الهدف)\)\s*:?\s*/i, "")
    .trim();

  // Clean Skills
  const rawSkillsText = sections.skills.join("، ");
  let skills = rawSkillsText
    .split(/[,،•\n\r]/)
    .map((s) => s.replace(/^[•\-\*\d\.\)]\s*/, "").trim())
    .filter((s) => s.length > 2 && s.length < 50);

  // Experience Processing
  const experiences: CvExperience[] = [];
  const roleKeywords = /مدير|مندوب|مسؤول|أخصائي|محاسب|مهندس|مشرف|فني|موظف|مساعد|مطور|مبرمج|مصمم|باحث|محلل|Manager|Specialist|Officer|Lead|Engineer|Developer/i;
  const companyKeywords = /شركة|مؤسسة|محل|معرض|مذخر|مستشفى|مركز|مكتب|وكالة|مصنع|Company|Store|Mall|Agency|Clinic|Hospital/i;

  sections.experience.forEach((line, idx) => {
    // If line contains pipe separators: Role | Company | Date | Bullets
    if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      let role = parts[0].replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      let company = parts[1] || "";
      let date = "";
      let bullets: string[] = [];

      // Check for dates in subsequent parts
      for (let i = 2; i < parts.length; i++) {
        const p = parts[i];
        if (!date && (/(?:19|20)\d{2}|الآن|سنة|أشهر|شهر|حتى/i.test(p) || p.length < 35)) {
          date = p;
        } else if (p.length > 5) {
          bullets.push(p);
        }
      }

      // Check if parts[0] is actually company and another part is role
      if (companyKeywords.test(role) && !roleKeywords.test(role)) {
        for (let i = 1; i < parts.length; i++) {
          if (roleKeywords.test(parts[i])) {
            const foundRole = parts[i].trim();
            company = role;
            role = foundRole;
            break;
          }
        }
      }

      // Check if date was inside parentheses in role or company
      if (!date) {
        const dMatch = line.match(/\(([^)]*(?:(?:19|20)\d{2}|الآن)[^)]*)\)/);
        if (dMatch) date = dMatch[1].trim();
      }

      // Filter out redundant bullets matching role or company
      bullets = bullets.filter((b) => b !== role && b !== company);

      experiences.push({
        id: String(idx + 1),
        role: role || "مسؤول",
        company: company || role,
        date: date || "2024 - حتى الآن",
        bullets: bullets.length > 0 ? bullets : ["إدارة وتنفيذ المهام الوظيفية وتحقيق النتائج المطلوبة"],
      });
    } else {
      // Dash or colon format: Role - Company (Date): Bullets
      const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "");
      const dMatch = clean.match(/\(([^)]+)\)/);
      const date = dMatch ? dMatch[1].trim() : "2024 - حتى الآن";
      const withoutDate = clean.replace(/\([^)]+\)/, "").trim();

      const parts = withoutDate.split(/[-–:]\s*/);
      const role = parts[0]?.trim() || "مسؤول";
      const company = parts[1]?.trim() || role;
      const desc = parts.slice(2).join(" - ").trim();

      experiences.push({
        id: String(idx + 1),
        role,
        company,
        date,
        bullets: desc ? [desc] : ["إدارة وتنفيذ المهام الوظيفية والمستهدفات المحددة"],
      });
    }
  });

  // Education Processing
  const education: CvEducation[] = [];
  sections.education.forEach((line, idx) => {
    // Extract date/years (parenthesized or explicit range)
    const parenDateMatch = line.match(/\(([^)]*(?:(?:19|20)\d{2}|الآن)[^)]*)\)/);
    let year = "";
    let clean = line;

    if (parenDateMatch) {
      year = parenDateMatch[1].trim();
      clean = line.replace(parenDateMatch[0], "").trim();
    } else {
      const yearMatch =
        line.match(/(?:(?:كانون الأول|كانون الثاني|تشرين الأول|تشرين الثاني|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|كانون|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}\s*[-–toإلى\s]+\s*(?:(?:كانون الأول|كانون الثاني|تشرين الأول|تشرين الثاني|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|كانون|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}|حتى الآن|إلى الآن|Present/i) ||
        line.match(/(?:19|20)\d{2}\s*[-–toإلى\s]+(?:19|20)\d{2}/) ||
        line.match(/(?:19|20)\d{2}/);

      year = yearMatch ? yearMatch[0].trim() : "2020 - 2024";
      clean = line.replace(year, "").trim();
    }

    clean = clean.replace(/[\(\)]/g, "").replace(/^[•\-\*\d\.\)]\s*/, "").replace(/[-–|،,]\s*$/, "").trim();
    const parts = clean.split(/[-–|،,]\s*/);
    const degree = parts[0]?.trim() || "بكالوريوس";
    const school = parts.slice(1).join(" - ").trim() || degree;

    education.push({
      id: String(idx + 1),
      degree,
      school,
      year: year || "2020 - 2024",
    });
  });

  // Certifications Processing
  const certifications: CvCertification[] = [];
  sections.certifications.forEach((line, idx) => {
    const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
    if (clean.length > 3) {
      certifications.push({
        id: String(idx + 1),
        title: clean,
      });
    }
  });

  // Determine Job Title
  let jobTitle = "";
  if (experiences.length > 0 && experiences[0].role) {
    jobTitle = experiences[0].role;
  }
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
    jobTitle,
    summary,
    email,
    phone,
    location,
    linkedin,
    skills,
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
