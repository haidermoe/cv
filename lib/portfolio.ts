import fs from 'fs';
import path from 'path';

export interface PortfolioData {
  general: {
    nameAR: string;
    nameEN: string;
    email: string;
    phone: string;
    locationAR: string;
    locationEN: string;
    heroVideo: string;
    cvPdfPath: string;
  };
  translations: {
    AR: Record<string, string>;
    EN: Record<string, string>;
  };
  stats: Array<{
    id: string;
    value: string;
    textAR: string;
    textEN: string;
    video: string;
  }>;
  experiences: Array<{
    id: string;
    dateAR: string;
    dateEN: string;
    companyAR: string;
    companyEN: string;
    roleAR: string;
    roleEN: string;
    link?: string;
    actionAR?: string;
    actionEN?: string;
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
  typography?: {
    fontFamilyAR: string;
    fontFamilyEN: string;
    heroTitleScale: string;
    bioFontSize: string;
    bodyLineHeight: string;
    headingWeight: string;
    letterSpacing: string;
    textColorPrimary?: string;
    textColorAccent?: string;
    textColorMuted?: string;
  };
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
    email: string;
    phone: string;
    location: string;
    locationAR?: string;
    locationEN?: string;
    linkedin: string;
    website: string;
    skills: string[];
    skillsAR?: string[];
    skillsEN?: string[];
    languages: string[];
    experiences: Array<{
      id: string;
      role: string;
      company: string;
      date: string;
      location?: string;
      bullets: string[];
    }>;
    education: Array<{
      id: string;
      degree: string;
      school: string;
      year: string;
    }>;
    certifications: Array<{
      id: string;
      title: string;
      issuer?: string;
      year?: string;
    }>;
    templateStyle: "modern-dark" | "clean-white" | "executive-blue";
    templatePreset?: 
      | "classic-ats-standard"
      | "ats-tech-software"
      | "hybrid-tech-sidebar"
      | "executive-business"
      | "executive-gold-slate"
      | "marketing-product"
      | "emerald-creative"
      | "arabic-professional"
      | "arabic-modern-blue";
    accentColor: string;
    layoutFormat?: "single-column" | "two-column-sidebar" | "modern-executive" | "minimal-compact";
    headerAlignment?: "left" | "center" | "split";
    fontSizeScale?: "compact" | "normal" | "large";
    pageMargin?: "compact" | "normal" | "wide";
    lineSpacing?: "compact" | "normal" | "relaxed";
    showPhoto?: boolean;
    showSummary?: boolean;
    showSkills?: boolean;
    showEducation?: boolean;
    showCertifications?: boolean;
    showQrCode?: boolean;
    qrCodeTarget?: "portfolio" | "linkedin" | "custom";
    qrCodeCustomUrl?: string;
    fontFamily?: string;
  };
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'portfolio.json');
const TMP_FILE_PATH = path.join('/tmp', 'portfolio.json');

// In-memory cache for fast response and fallback in serverless environments
let memoryCache: PortfolioData | null = null;

export function getPortfolioData(): PortfolioData {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try reading from /tmp (persisted across warm serverless invocations)
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const fileContents = fs.readFileSync(TMP_FILE_PATH, 'utf8');
      const data = JSON.parse(fileContents) as PortfolioData;
      memoryCache = data;
      return data;
    }
  } catch {
    // Ignore /tmp read error
  }

  // 2. Try reading from project data file
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContents = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      const data = JSON.parse(fileContents) as PortfolioData;
      memoryCache = data;
      return data;
    }
  } catch (error) {
    console.error('Error reading portfolio.json:', error);
  }

  // Fallback default
  return {
    general: {
      nameAR: 'حيدر محمد شوكت',
      nameEN: 'Haider M. Shwkat',
      email: 'haider.m.shwkat@outlook.com',
      phone: '+964 771 896 4778',
      locationAR: 'بغداد، العراق',
      locationEN: 'Baghdad, Iraq',
      heroVideo: 'media/hero.mp4',
      cvPdfPath: '/HAIDER_M_SHWKAT_CV_2026.pdf',
    },
    translations: { AR: {}, EN: {} },
    stats: [],
    experiences: [],
    education: [],
    certifications: [],
    typography: {
      fontFamilyAR: "'Tajawal', sans-serif",
      fontFamilyEN: "'Outfit', sans-serif",
      heroTitleScale: "normal",
      bioFontSize: "18px",
      bodyLineHeight: "1.7",
      headingWeight: "900",
      letterSpacing: "normal",
      textColorPrimary: "#ffffff",
      textColorAccent: "#60a5fa",
      textColorMuted: "#94a3b8",
    },
  };
}

export function savePortfolioData(newData: PortfolioData): boolean {
  try {
    memoryCache = newData;

    // 1. Try writing to /tmp directory (supported in serverless / Vercel)
    try {
      if (fs.existsSync('/tmp')) {
        fs.writeFileSync(TMP_FILE_PATH, JSON.stringify(newData, null, 2), 'utf8');
      }
    } catch {
      // ignore tmp write error
    }

    // 2. Try writing to local project directory (local development & persistent servers)
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(newData, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Persistent disk write skipped (serverless read-only runtime):', fsErr);
    }

    return true;
  } catch (error) {
    console.error('Error in savePortfolioData:', error);
    return true; // Still return true as memoryCache holds the state
  }
}
