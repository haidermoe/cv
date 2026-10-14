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
  const nameMatch = text.match(/(?:اسم(?: الشخصية)?|الاسم الكامل|الاسم|Name)\s*:?\s*([\u0600-\u06FF\s]+?)(?=\s*\(|\s*عنوان|\s*رقم|\s*البريد|\s*تاريخ|\s*\n|$)/i);
  if (nameMatch && nameMatch[1].trim().length > 2) {
    fullName = nameMatch[1].trim();
  }
  if (!fullName) {
    // If not found with keyword, check first line if it looks like a person's name
    const firstLine = text.split(/\r?\n/)[0]?.trim();
    if (firstLine && !firstLine.includes("@") && !firstLine.includes("07") && firstLine.length < 35) {
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

  // 5. LinkedIn Extraction
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // 6. Section Bound Extraction (Regex segmentation)
  const summaryMatch = text.match(
    /(?:الهدف المهني(?: والملخص التنفيذي)?|الملخص التنفيذي|النبذة المهنية|النبذة|Summary)\s*:?\s*([\s\S]*?)(?=(?:التحصيل الدراسي|التعليم|الخبرات المهنية|الخبرات|الخبرة|المهارات|Work Experience|$))/i
  );
  let summary = summaryMatch ? summaryMatch[1].trim() : "";

  const eduMatch = text.match(
    /(?:التحصيل الدراسي|الشهادات الأكاديمية|التعليم|Education)\s*:?\s*([\s\S]*?)(?=(?:الخبرات المهنية|الخبرات|الخبرة|المهارات|الشهادات|Work Experience|$))/i
  );
  const eduRaw = eduMatch ? eduMatch[1].trim() : "";

  const expMatch = text.match(
    /(?:الخبرات المهنية(?:\s*\([\w\s]+\))?|الخبرات|الخبرة|سجل الخبرات|Work Experience)\s*:?\s*([\s\S]*?)(?=(?:المهارات|الشهادات والدورات التدريبية|الشهادات|الدورات|Skills|Education|$))/i
  );
  const expRaw = expMatch ? expMatch[1].trim() : "";

  const skillsMatch = text.match(
    /(?:المهارات(?:\s*\([\w\s]+\))?|المهارات والقدرات|Skills)\s*:?\s*([\s\S]*?)(?=(?:الشهادات والدورات التدريبية|الشهادات|الدورات|Certifications|$))/i
  );
  const skillsRaw = skillsMatch ? skillsMatch[1].trim() : "";

  const certsMatch = text.match(
    /(?:الشهادات والدورات التدريبية(?:\s*\([\w\s&]+\))?|الشهادات|الدورات التدريبية|الدورات|Certifications)\s*:?\s*([\s\S]*?)$/i
  );
  const certsRaw = certsMatch ? certsMatch[1].trim() : "";

  // 7. Process Experience Items
  const experiences: CvExperience[] = [];
  if (expRaw) {
    const rawLines = expRaw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 5);
    rawLines.forEach((line, idx) => {
      let role = "";
      let company = "";
      let date = "";
      let bullets: string[] = [];

      // Pattern: Role | Company (Date): Bullets
      if (line.includes("|")) {
        const pipeParts = line.split("|");
        role = pipeParts[0].trim().replace(/^[•\-\*\d\.\)]\s*/, "");
        const rest = pipeParts.slice(1).join("|").trim();

        // Extract Date from parentheses e.g. (تشرين الثاني 2025 - حتى الآن)
        const dateMatch = rest.match(/\(([^)]+)\)/);
        if (dateMatch) {
          date = dateMatch[1].trim();
        }

        const afterDate = rest.replace(/\([^)]+\)/, "").trim();
        const colonIndex = afterDate.indexOf(":");
        if (colonIndex !== -1) {
          company = afterDate.substring(0, colonIndex).trim();
          const desc = afterDate.substring(colonIndex + 1).trim();
          if (desc) bullets = [desc];
        } else {
          company = afterDate.trim();
        }
      } else {
        // Line without pipe, try colon or dash
        const clean = line.replace(/^[•\-\*\d\.\)]\s*/, "");
        const dateMatch = clean.match(/\(([^)]+)\)/);
        if (dateMatch) date = dateMatch[1].trim();

        const withoutDate = clean.replace(/\([^)]+\)/, "").trim();
        const parts = withoutDate.split(/[-–:]\s*/);
        role = parts[0]?.trim() || "مسؤول";
        company = parts.slice(1).join(" - ").trim() || role;
      }

      if (role) {
        experiences.push({
          id: String(idx + 1),
          role,
          company: company || role,
          date: date || "2024 - حتى الآن",
          bullets: bullets.length ? bullets : ["إدارة وتنفيذ المهام الوظيفية وتحقيق النتائج المطلوبة"],
        });
      }
    });
  }

  // 8. Process Education Items
  const education: CvEducation[] = [];
  if (eduRaw) {
    const lines = eduRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      const yearMatch =
        line.match(/(?:(?:كانون|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}\s*[-–toإلى\s]+\s*(?:(?:(?:كانون|شباط|آذار|نيسان|أيار|حزيران|تموز|آب|أيلول|تشرين|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*)?(?:19|20)\d{2}|حتى الآن|إلى الآن|Present)/i) ||
        line.match(/(?:19|20)\d{2}\s*[-–toإلى\s]+(?:19|20)\d{2}/) ||
        line.match(/(?:19|20)\d{2}/);

      const year = yearMatch ? yearMatch[0].trim() : "2020 - 2024";
      const clean = line.replace(year, "").replace(/[\(\)]/g, "").replace(/^[•\-\*\d\.\)]\s*/, "").trim();

      const parts = clean.split(/[-–|،,]\s*/);
      const degree = parts[0]?.trim() || "بكالوريوس";
      const school = parts.slice(1).join(" - ").trim() || degree;

      education.push({
        id: String(idx + 1),
        degree,
        school,
        year,
      });
    });
  }

  // 9. Process Skills
  let skills: string[] = [];
  if (skillsRaw) {
    skills = skillsRaw
      .split(/[,،•\n\r]/)
      .map((s) => s.replace(/^[•\-\*\d\.\)]\s*/, "").trim())
      .filter((s) => s.length > 2);
  }

  // 10. Process Certifications
  const certifications: CvCertification[] = [];
  if (certsRaw) {
    const lines = certsRaw
      .split(/\r?\n/)
      .map((l) => l.replace(/^[•\-\*\d\.\)]\s*/, "").trim())
      .filter((l) => l.length > 3);

    lines.forEach((l, idx) => {
      certifications.push({
        id: String(idx + 1),
        title: l,
      });
    });
  }

  // 11. Determine Job Title
  let jobTitle = "";
  if (experiences.length > 0) {
    jobTitle = experiences[0].role;
  }
  if (!jobTitle) {
    const jobMatch = text.match(/(?:المسمى الوظيفي|الوظيفة|المهنة)\s*:?\s*([^\n\r]+)/i);
    if (jobMatch) jobTitle = jobMatch[1].trim();
    else if (/مدير مبيعات/.test(text)) jobTitle = "مدير مبيعات";
    else if (/مبيعات/.test(text)) jobTitle = "أخصائي مبيعات";
    else if (/محاسب/.test(text)) jobTitle = "محاسب مالي";
  }

  // If summary was not caught by regex, extract clean bio
  if (!summary) {
    if (experiences.length > 0) {
      summary = `مهني طموح ومتخصص في ${jobTitle || "إدارة الأعمال"}، يمتلك خبرة عملية مثبتة في تنظيم وإدارة المهام وتحقيق أعلى مستويات الأداء.`;
    }
  }

  return {
    fullName: fullName || "",
    jobTitle: jobTitle || "",
    summary,
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
