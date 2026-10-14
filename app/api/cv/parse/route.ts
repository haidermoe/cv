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

// 1. RULE-BASED SMART PARSER (ZERO EXTERNAL DEPENDENCY FALLBACK)
function parseCvRuleBased(rawText: string): LanguageSpecificData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let fullName = "";
  let jobTitle = "";
  let summary = "";
  let email = "";
  let phone = "";
  let location = "";
  let linkedin = "";
  const skills: string[] = [];
  const experiences: CvExperience[] = [];
  const education: CvEducation[] = [];
  const certifications: CvCertification[] = [];

  // Extract Email
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) email = emailMatch[0];

  // Extract Phone (Iraq / International)
  const phoneMatch = rawText.match(/(?:\+?964|00964|0)?7[0-9]{9}\b|(?:\+?[0-9]{1,4}[-.\s]?)?\(?[0-9]{3,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,5}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Extract LinkedIn
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/);
  if (linkedinMatch) linkedin = linkedinMatch[0];

  // Extract Location
  if (/بغداد/.test(rawText)) location = "بغداد، العراق";
  else if (/أربيل|اربيل/.test(rawText)) location = "أربيل، العراق";
  else if (/البصرة|بصرة/.test(rawText)) location = "البصرة، العراق";
  else if (/النجف/.test(rawText)) location = "النجف، العراق";
  else if (/كربلاء/.test(rawText)) location = "كربلاء، العراق";
  else if (/العراق/.test(rawText)) location = "العراق";

  // Section parsing state
  type Section = "none" | "summary" | "experience" | "education" | "skills" | "certifications";
  let currentSection: Section = "none";
  let expCounter = 1;
  let eduCounter = 1;
  let certCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a section header
    if (/^(?:الخبرات|الخبرة|العمل|الوظائف|work experience|experience)\s*:?$/i.test(line)) {
      currentSection = "experience";
      continue;
    }
    if (/^(?:التعليم|الدراسة|الشهادات الأكاديمية|التحصيل الدراسي|education)\s*:?$/i.test(line)) {
      currentSection = "education";
      continue;
    }
    if (/^(?:المهارات|المهارات والقدرات|المهارات التقنية|skills)\s*:?$/i.test(line)) {
      currentSection = "skills";
      continue;
    }
    if (/^(?:الدورات|الكورسات|الشهادات التدريبية|الشهادات|certifications|courses)\s*:?$/i.test(line)) {
      currentSection = "certifications";
      continue;
    }
    if (/^(?:النبذة|الملخص|النبذة المهنية|الملخص التنفيذي|عني|summary|about|profile)\s*:?$/i.test(line)) {
      currentSection = "summary";
      continue;
    }

    // Name and Job Title heuristic from header lines
    if (!fullName && !line.includes("@") && !line.includes("07") && line.length < 40 && !line.includes(":")) {
      fullName = line.replace(/^(?:الاسم|الاسم الكامل|name)\s*:?\s*/i, "");
      continue;
    }
    if (!jobTitle && fullName && !line.includes("@") && !line.includes("07") && line.length < 60 && !line.includes("http")) {
      jobTitle = line.replace(/^(?:المسمى الوظيفي|الوظيفة|المهنة|title|role)\s*:?\s*/i, "");
      continue;
    }

    // Process according to active section
    if (currentSection === "summary") {
      summary += (summary ? " " : "") + line;
    } else if (currentSection === "skills") {
      const items = line.split(/[,،•\-\n]/).map((s) => s.trim()).filter(Boolean);
      skills.push(...items);
    } else if (currentSection === "certifications") {
      const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      if (clean) {
        certifications.push({ id: String(certCounter++), title: clean });
      }
    } else if (currentSection === "education") {
      const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      // Try to extract year range e.g. 2020 - 2024
      const yearMatch = clean.match(/(?:19|20)\d{2}\s*[-–toإلى\s]+\s*(?:(?:19|20)\d{2}|حتى الآن|Present)/i);
      const year = yearMatch ? yearMatch[0] : "";
      const textWithoutYear = clean.replace(year, "").replace(/[\(\)]/g, "").trim();

      const parts = textWithoutYear.split(/[-–|،,]\s*/);
      const degree = parts[0] || "بكالوريوس";
      const school = parts.slice(1).join(" - ") || "جامعة";

      if (clean) {
        education.push({
          id: String(eduCounter++),
          degree: degree.trim(),
          school: school.trim() || degree.trim(),
          year: year.trim() || "2020 - 2024",
        });
      }
    } else if (currentSection === "experience") {
      const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      const dateMatch = clean.match(/(?:(?:كانون|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}\s*[-–toإلى\s]+\s*(?:(?:(?:كانون|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}|حتى الآن|إلى الآن|Present)/i);
      const date = dateMatch ? dateMatch[0] : "";
      const textWithoutDate = clean.replace(date, "").replace(/[\(\)]/g, "").trim();

      const parts = textWithoutDate.split(/[-–|،]\s*/);
      const role = parts[0] || "مسؤول";
      const company = parts.slice(1).join(" - ") || parts[0];

      if (clean.length > 5) {
        experiences.push({
          id: String(expCounter++),
          role: role.trim(),
          company: company.trim(),
          date: date.trim() || "2023 - حتى الآن",
          bullets: ["إدارة وتنفيذ المهام الوظيفية وتحقيق أهداف العمل بدقة واحترافية"],
        });
      }
    } else {
      // If line is long and no section active, it's likely the summary
      if (line.length > 50 && !summary) {
        summary = line;
      }
    }
  }

  // Fallbacks if some fields missing
  if (!summary && experiences.length > 0) {
    summary = `مهني متخصص وطموح في مجال ${jobTitle || "العمل"}، يمتلك خبرة عملية في إدارة المهام وتحقيق أفضل النتائج والعمل بروح الفريق.`;
  }

  return {
    fullName: fullName || "",
    jobTitle: jobTitle || "",
    summary: summary || "",
    email,
    phone,
    location: location || "",
    linkedin,
    skills,
    experiences,
    education,
    certifications,
  };
}

// 2. GEMINI AI PARSER (FOR DEEP SEMANTIC UNDERSTANDING)
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
- Formulate a strong, professional Arabic 'summary' (if not already written, generate a cohesive 2-sentence summary based on their background)
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
