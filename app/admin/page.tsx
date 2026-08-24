"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PortfolioData } from "@/lib/portfolio";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setInternalData] = useState<PortfolioData | null>(null);
  const [undoStack, setUndoStack] = useState<PortfolioData[]>([]);
  const [redoStack, setRedoStack] = useState<PortfolioData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "stats" | "experiences" | "education" | "cv" | "typography">("general");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Function to update data while recording undo history
  const setData = (updater: PortfolioData | ((prev: PortfolioData | null) => PortfolioData | null), skipHistory = false) => {
    setInternalData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!skipHistory && prev && next && JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((u) => [...u.slice(-50), prev]);
        setRedoStack([]);
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !data) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    setRedoStack((r) => [...r, data]);
    setUndoStack(newUndo);
    setInternalData(previous);
    showToast("تراجع عن آخر تعديل (Undo: Ctrl + Z)");
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !data) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    setUndoStack((u) => [...u, data]);
    setRedoStack(newRedo);
    setInternalData(next);
    showToast("إعادة التعديل (Redo: Ctrl + Y)");
  };

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [uploadCvStatus, setUploadCvStatus] = useState("");
  const [cvMode, setCvMode] = useState<"builder" | "upload">("builder");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatePdfStatus, setGeneratePdfStatus] = useState("");

  // Live Instant Preview States
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewLang, setPreviewLang] = useState<"AR" | "EN">("AR");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [previewSectionTab, setPreviewSectionTab] = useState<"auto" | "general" | "stats" | "experiences" | "education" | "cv" | "typography" | "all">("auto");
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [shortcutToast, setShortcutToast] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const json = await res.json();
      if (json.authenticated) {
        setIsAuthenticated(true);
        loadPortfolioData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (json.ok) {
        setIsAuthenticated(true);
        loadPortfolioData();
      } else {
        setLoginError(json.message || "كلمة المرور غير صحيحة");
      }
    } catch {
      setLoginError("فشل الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  const loadPortfolioData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data, true);
      }
    } catch (err) {
      console.error("Failed to load portfolio data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveData = async () => {
    if (!data) return;

    setSaveStatus("saving");
    setSaveMessage("جاري حفظ التعديلات في قاعدة البيانات...");

    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        setSaveStatus("saved");
        setSaveMessage("تم حفظ وتحديث جميع البيانات بنجاح في الموقع!");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setSaveMessage("حدث خطأ أثناء الحفظ: " + (json.message || ""));
      }
    } catch {
      setSaveStatus("error");
      setSaveMessage("فشل الاتصال بالخادم لحفظ التعديلات");
    }
  };

  const showToast = (msg: string) => {
    setShortcutToast(msg);
    setTimeout(() => setShortcutToast(""), 2800);
  };

  // KEYBOARD SHORTCUTS LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // Ctrl+Z or Cmd+Z -> Undo (if shift is also pressed, then Redo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Ctrl+Y or Cmd+Y -> Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl+S or Cmd+S -> Save all data
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveData();
        showToast("تم الحفظ عبر الاختصار: (Ctrl + S)");
        return;
      }

      // Ctrl+P or Cmd+P -> Toggle Live Preview
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowLivePreview((prev) => !prev);
        showToast("تبديل المعاينة الحية: (Ctrl + P)");
        return;
      }

      // Ctrl+L or Cmd+L -> Toggle Language in preview
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setPreviewLang((prev) => (prev === "AR" ? "EN" : "AR"));
        showToast("تبديل لغة المعاينة: (Ctrl + L)");
        return;
      }

      // Ctrl + 1..6 -> Switch Tabs
      if ((e.ctrlKey || e.metaKey) && ["1", "2", "3", "4", "5", "6"].includes(e.key)) {
        e.preventDefault();
        const tabList: Array<"general" | "stats" | "experiences" | "education" | "cv" | "typography"> = [
          "general",
          "stats",
          "experiences",
          "education",
          "cv",
          "typography",
        ];
        const idx = parseInt(e.key, 10) - 1;
        if (tabList[idx]) {
          setActiveTab(tabList[idx]);
          showToast(`الانتقال للتبويب ${idx + 1}: (Ctrl + ${e.key})`);
        }
        return;
      }

      // '?' -> Toggle Shortcuts Help Modal (when not typing in an input)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Escape -> Close Shortcuts Modal
      if (e.key === "Escape") {
        setShowShortcutsModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setData({
        ...data,
        cvDocument: {
          ...(data.cvDocument || {
            fullName: data.general.nameEN || "HAIDER M. SHWKAT",
            jobTitle: "Computer Science Specialist | Data Operations & Workflow Consultant",
            summary: data.translations.EN?.bio || "",
            email: data.general.email,
            phone: data.general.phone,
            location: data.general.locationEN,
            linkedin: "linkedin.com/in/haidermoe",
            website: "cv-wine-tau.vercel.app",
            skills: [],
            languages: ["Arabic (Native)", "English (Professional)"],
            experiences: [],
            education: [],
            certifications: [],
            templateStyle: "modern-dark",
            accentColor: "#2563eb",
          }),
          photo: base64,
        }
      });
      showToast("تم تحديث صورة السيرة الذاتية");
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePdf = async (downloadLocal = false) => {
    const element = document.getElementById("cv-pdf-canvas");
    if (!element) {
      setGeneratePdfStatus("تعذر العثور على ورقة السيرة الذاتية لتوليدها.");
      return;
    }

    setIsGeneratingPdf(true);
    setGeneratePdfStatus(downloadLocal ? "جاري توليد ملف الـ PDF وتنزيله..." : "جاري توليد ملف الـ PDF وحفظه في الموقع...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      if (downloadLocal) {
        pdf.save("HAIDER_M_SHWKAT_CV_2026.pdf");
        setGeneratePdfStatus("تم تنزيل ملف الـ PDF إلى جهازك بنجاح!");
      } else {
        const blob = pdf.output("blob");
        const file = new File([blob], "HAIDER_M_SHWKAT_CV_2026.pdf", { type: "application/pdf" });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("customName", "HAIDER_M_SHWKAT_CV_2026.pdf");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (json.ok) {
          setGeneratePdfStatus("تم توليد ملف الـ PDF بنجاح واعتماده كملف السيرة الرسمي للموقع!");
          if (data) {
            setData({
              ...data,
              general: {
                ...data.general,
                cvPdfPath: "/HAIDER_M_SHWKAT_CV_2026.pdf",
              }
            });
          }
        } else {
          setGeneratePdfStatus("حدث خطأ أثناء حفظ الملف: " + (json.message || ""));
        }
      }
    } catch (err: any) {
      console.error(err);
      setGeneratePdfStatus("فشل توليد ملف الـ PDF: " + (err?.message || ""));
    } finally {
      setIsGeneratingPdf(false);
      setTimeout(() => setGeneratePdfStatus(""), 6000);
    }
  };

  const handleUploadCv = async () => {
    if (!cvFile) return;

    setIsUploadingCv(true);
    setUploadCvStatus("جاري رفع واستبدال ملف السيرة الذاتية...");

    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("customName", "HAIDER_M_SHWKAT_CV_2026.pdf");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.ok) {
        setUploadCvStatus("تم رفع ملف السيرة الذاتية بنجاح وتحديثه لجميع الزوار!");
        if (data) {
          setData({
            ...data,
            general: {
              ...data.general,
              cvPdfPath: "/HAIDER_M_SHWKAT_CV_2026.pdf",
            },
          });
        }
        setCvFile(null);
      } else {
        setUploadCvStatus("فشل الرفع: " + (json.message || ""));
      }
    } catch {
      setUploadCvStatus("حدث خطأ أثناء رفع الملف");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const updateStat = (index: number, field: string, value: string) => {
    if (!data) return;
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData({ ...data, stats: newStats });
  };

  const addStat = () => {
    if (!data) return;
    const newStat = {
      id: `stat-${Date.now()}`,
      value: "+10",
      textAR: "وصف الإحصائية بالعربية",
      textEN: "Stat description in English",
      video: "media/volchek-color.mp4",
    };
    setData({ ...data, stats: [...data.stats, newStat] });
  };

  const deleteStat = (index: number) => {
    if (!data) return;
    const newStats = data.stats.filter((_, i) => i !== index);
    setData({ ...data, stats: newStats });
  };

  const updateExp = (index: number, field: string, value: any) => {
    if (!data) return;
    const newExp = [...data.experiences];
    newExp[index] = { ...newExp[index], [field]: value };
    setData({ ...data, experiences: newExp });
  };

  const addExpBullet = (expIndex: number, lang: "AR" | "EN") => {
    if (!data) return;
    const newExp = [...data.experiences];
    const key = lang === "AR" ? "bulletsAR" : "bulletsEN";
    newExp[expIndex] = {
      ...newExp[expIndex],
      [key]: [...newExp[expIndex][key], lang === "AR" ? "نقطة إنجاز جديدة..." : "New achievement bullet..."],
    };
    setData({ ...data, experiences: newExp });
  };

  const updateExpBullet = (expIndex: number, bulletIndex: number, lang: "AR" | "EN", value: string) => {
    if (!data) return;
    const newExp = [...data.experiences];
    const key = lang === "AR" ? "bulletsAR" : "bulletsEN";
    const updatedBullets = [...newExp[expIndex][key]];
    updatedBullets[bulletIndex] = value;
    newExp[expIndex] = { ...newExp[expIndex], [key]: updatedBullets };
    setData({ ...data, experiences: newExp });
  };

  const deleteExpBullet = (expIndex: number, bulletIndex: number, lang: "AR" | "EN") => {
    if (!data) return;
    const newExp = [...data.experiences];
    const key = lang === "AR" ? "bulletsAR" : "bulletsEN";
    const updatedBullets = newExp[expIndex][key].filter((_, i) => i !== bulletIndex);
    newExp[expIndex] = { ...newExp[expIndex], [key]: updatedBullets };
    setData({ ...data, experiences: newExp });
  };

  const addExperience = () => {
    if (!data) return;
    const newExp = {
      id: `exp-${Date.now()}`,
      dateAR: "2026 - حتى الآن",
      dateEN: "2026 - Present",
      companyAR: "اسم الشركة أو المشروع",
      companyEN: "Company or Project Name",
      roleAR: "المسمى الوظيفي بالعربية",
      roleEN: "Job Role in English",
      link: "",
      actionAR: "",
      actionEN: "",
      bulletsAR: ["إنجاز أو مسؤولية رئيسية..."],
      bulletsEN: ["Key achievement or responsibility..."],
    };
    setData({ ...data, experiences: [...data.experiences, newExp] });
  };

  const deleteExperience = (index: number) => {
    if (!data) return;
    const newExp = data.experiences.filter((_, i) => i !== index);
    setData({ ...data, experiences: newExp });
  };

  const updateEdu = (index: number, field: string, value: string) => {
    if (!data) return;
    const newEdu = [...data.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setData({ ...data, education: newEdu });
  };

  const addEdu = () => {
    if (!data) return;
    const newEdu = {
      id: `edu-${Date.now()}`,
      yearAR: "2026",
      yearEN: "2026",
      schoolAR: "اسم الجامعة أو المعهد",
      schoolEN: "University or College Name",
      degreeAR: "الدرجة الأكاديمية والتخصص",
      degreeEN: "Academic Degree & Major",
    };
    setData({ ...data, education: [...data.education, newEdu] });
  };

  const deleteEdu = (index: number) => {
    if (!data) return;
    const newEdu = data.education.filter((_, i) => i !== index);
    setData({ ...data, education: newEdu });
  };

  const updateCert = (index: number, field: string, value: string) => {
    if (!data) return;
    const newCerts = [...data.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setData({ ...data, certifications: newCerts });
  };

  const addCert = () => {
    if (!data) return;
    const newCert = {
      id: `cert-${Date.now()}`,
      titleAR: "اسم الشهادة والجهة المانحة بالعربية",
      titleEN: "Certificate Title & Provider in English",
    };
    setData({ ...data, certifications: [...data.certifications, newCert] });
  };

  const deleteCert = (index: number) => {
    if (!data) return;
    const newCerts = data.certifications.filter((_, i) => i !== index);
    setData({ ...data, certifications: newCerts });
  };

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#090a10", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontFamily: "Tajawal, sans-serif" }}>
        <p style={{ fontSize: "18px", fontWeight: "700" }}>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#090a10", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Tajawal, sans-serif" }}>
        <div style={{ background: "#12131f", padding: "40px 35px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: "440px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", textAlign: "center" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", marginBottom: "8px" }}>لوحة التحكم الإدارية</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "28px" }}>يرجى إدخال رمز المرور للوصول إلى إدارة السيرة الذاتية والمحتوى</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px", textAlign: "right" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#cbd5e1", marginBottom: "8px" }}>رمز المرور (Admin Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "16px", outline: "none" }}
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: "700", marginBottom: "18px", textAlign: "right" }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "#2563eb", color: "#ffffff", fontSize: "15px", fontWeight: "800", border: "none", cursor: "pointer", boxShadow: "0 8px 25px rgba(37, 99, 235, 0.4)" }}
            >
              {isLoggingIn ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>
          </form>

          <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/" style={{ color: "#60a5fa", fontSize: "13.5px", textDecoration: "none", fontWeight: "700" }}>
              الرجوع إلى الموقع الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#090a10", color: "#ffffff", fontFamily: "Tajawal, sans-serif", paddingBottom: "80px" }} dir="rtl">
      <header style={{ background: "#12131f", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 30px", position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: 0 }}>لوحة تحكم السيرة الذاتية (CMS)</h1>
          <span style={{ background: "rgba(37, 99, 235, 0.2)", color: "#60a5fa", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>مدير النظام</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* UNDO & REDO BUTTONS */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            style={{
              background: undoStack.length > 0 ? "#1e2130" : "#11121d",
              color: undoStack.length > 0 ? "#ffffff" : "#475569",
              border: "1px solid #334155",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: undoStack.length > 0 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: undoStack.length > 0 ? 1 : 0.5,
            }}
            title="تراجع عن آخر تعديل (Ctrl + Z)"
          >
            <span>تراجع</span>
            <kbd style={{ background: "#0a0b12", border: "1px solid #475569", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: undoStack.length > 0 ? "#60a5fa" : "#475569" }}>Ctrl+Z</kbd>
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            style={{
              background: redoStack.length > 0 ? "#1e2130" : "#11121d",
              color: redoStack.length > 0 ? "#ffffff" : "#475569",
              border: "1px solid #334155",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: redoStack.length > 0 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: redoStack.length > 0 ? 1 : 0.5,
            }}
            title="إعادة التعديل (Ctrl + Y)"
          >
            <span>إعادة</span>
            <kbd style={{ background: "#0a0b12", border: "1px solid #475569", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: redoStack.length > 0 ? "#60a5fa" : "#475569" }}>Ctrl+Y</kbd>
          </button>

          {/* SHORTCUTS HELP BUTTON */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            style={{
              background: "#151728",
              color: "#93c5fd",
              border: "1px solid #334155",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="عرض اختصارات لوحة المفاتيح (Shift + ?)"
          >
            <span>الاختصارات</span>
            <kbd style={{ background: "#0a0b12", border: "1px solid #475569", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: "#60a5fa" }}>?</kbd>
          </button>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            style={{
              background: showLivePreview ? "#10b981" : "#1e2130",
              color: "#ffffff",
              border: "1px solid #059669",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>{showLivePreview ? "إخفاء المعاينة" : "إظهار المعاينة"}</span>
            <kbd style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.2)", padding: "1px 5px", borderRadius: "4px", fontSize: "10px", color: "#ffffff" }}>Ctrl+P</kbd>
          </button>

          <Link
            href="/"
            target="_blank"
            style={{ background: "#1e2130", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}
          >
            معاينة الموقع
          </Link>

          <button
            onClick={handleSaveData}
            disabled={saveStatus === "saving"}
            style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "9px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>{saveStatus === "saving" ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            <kbd style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.3)", padding: "1px 6px", borderRadius: "4px", fontSize: "10.5px", color: "#ffffff" }}>Ctrl+S</kbd>
          </button>

          <button
            onClick={handleLogout}
            style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "8px 12px", borderRadius: "10px", fontSize: "12.5px", fontWeight: "800", cursor: "pointer" }}
          >
            خروج
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION FOR SHORTCUTS */}
      {shortcutToast && (
        <div style={{ position: "fixed", top: "85px", right: "30px", zIndex: 9999, background: "#1e293b", border: "1px solid #60a5fa", color: "#60a5fa", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "13.5px", boxShadow: "0 10px 30px rgba(0,0,0,0.6)", animation: "fadeIn 0.2s ease-out" }}>
          {shortcutToast}
        </div>
      )}

      {saveMessage && (
        <div style={{ background: saveStatus === "saved" ? "rgba(22, 163, 74, 0.9)" : saveStatus === "error" ? "rgba(220, 38, 38, 0.9)" : "rgba(37, 99, 235, 0.9)", color: "#ffffff", padding: "12px 24px", textAlign: "center", fontWeight: "800", fontSize: "14px" }}>
          {saveMessage}
        </div>
      )}

      <div style={{ maxWidth: "1600px", margin: "25px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "25px" }}>
          {[
            { id: "general", label: "النبذة والمعلومات الأساسية", key: "1" },
            { id: "stats", label: "الإحصائيات والأرقام", key: "2" },
            { id: "experiences", label: "الخبرات العملية", key: "3" },
            { id: "education", label: "التعليم والشهادات", key: "4" },
            { id: "cv", label: "ملف السيرة الذاتية (PDF)", key: "5" },
            { id: "typography", label: "الخطوط والطباعة", key: "6" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? "#2563eb" : "#151624",
                color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "11px 18px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <span>{tab.label}</span>
              <kbd style={{ background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "#0c0d17", border: "1px solid rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: activeTab === tab.id ? "#ffffff" : "#64748b" }}>
                Ctrl+{tab.key}
              </kbd>
            </button>
          ))}
        </div>

        {/* SPLIT SCREEN CONTAINER: FORM ON RIGHT, PREVIEW ON LEFT */}
        <div style={{ display: "grid", gridTemplateColumns: showLivePreview ? "minmax(0, 1fr) minmax(360px, 440px)" : "minmax(0, 1fr)", gap: "28px", alignItems: "start" }}>
          {/* MAIN EDITING FORM COLUMN */}
          <div style={{ minWidth: 0 }}>

        {activeTab === "general" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ background: "#12131f", padding: "28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "20px", color: "#60a5fa" }}>معلومات الاتصال والنبذة</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>الاسم بالعربية</label>
                  <input
                    type="text"
                    value={data.general.nameAR}
                    onChange={(e) => setData({ ...data, general: { ...data.general, nameAR: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={data.general.nameEN}
                    onChange={(e) => setData({ ...data, general: { ...data.general, nameEN: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>البريد الإلكتروني</label>
                  <input
                    type="text"
                    value={data.general.email}
                    onChange={(e) => setData({ ...data, general: { ...data.general, email: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>رقم الهاتف</label>
                  <input
                    type="text"
                    value={data.general.phone}
                    onChange={(e) => setData({ ...data, general: { ...data.general, phone: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>الموقع الجغرافي (عربي)</label>
                  <input
                    type="text"
                    value={data.general.locationAR}
                    onChange={(e) => setData({ ...data, general: { ...data.general, locationAR: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>الموقع الجغرافي (إنجليزي)</label>
                  <input
                    type="text"
                    value={data.general.locationEN}
                    onChange={(e) => setData({ ...data, general: { ...data.general, locationEN: e.target.value } })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>مسار فيديو الهيرو (Hero Video Path or URL)</label>
                <input
                  type="text"
                  value={data.general.heroVideo}
                  onChange={(e) => setData({ ...data, general: { ...data.general, heroVideo: e.target.value } })}
                  placeholder="media/hero.mp4"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>النبذة التعريفية (Bio بالعربية)</label>
                <textarea
                  rows={3}
                  value={data.translations.AR.bio || ""}
                  onChange={(e) => setData({ ...data, translations: { ...data.translations, AR: { ...data.translations.AR, bio: e.target.value } } })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px", lineHeight: "1.6" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>النبذة التعريفية (Bio بالإنجليزية)</label>
                <textarea
                  rows={3}
                  value={data.translations.EN.bio || ""}
                  onChange={(e) => setData({ ...data, translations: { ...data.translations, EN: { ...data.translations.EN, bio: e.target.value } } })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "14px", lineHeight: "1.6" }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>بطاقات الإحصائيات والأرقام ({data.stats.length})</h3>
              <button
                onClick={addStat}
                style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "800", cursor: "pointer" }}
              >
                + إضافة بطاقة إحصائية
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {data.stats.map((st, idx) => (
                <div key={st.id || idx} style={{ background: "#12131f", padding: "24px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ background: "#1e2130", color: "#60a5fa", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "800" }}>بطاقة رقم {idx + 1}</span>
                    <button
                      onClick={() => deleteStat(idx)}
                      style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                      حذف
                    </button>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>الرقم / القيمة (مثل: +22K, 3)</label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "16px", fontWeight: "800" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>الوصف بالعربية</label>
                    <textarea
                      rows={2}
                      value={st.textAR}
                      onChange={(e) => updateStat(idx, "textAR", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>الوصف بالإنجليزية</label>
                    <textarea
                      rows={2}
                      value={st.textEN}
                      onChange={(e) => updateStat(idx, "textEN", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>مقطع الفيديو الخلفي (Video)</label>
                    <input
                      type="text"
                      value={st.video}
                      onChange={(e) => updateStat(idx, "video", e.target.value)}
                      placeholder="media/volchek-color.mp4"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "experiences" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>بطاقات الخبرات العملية ({data.experiences.length})</h3>
              <button
                onClick={addExperience}
                style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "800", cursor: "pointer" }}
              >
                + إضافة خبرة جديدة
              </button>
            </div>

            {data.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} style={{ background: "#12131f", padding: "26px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ background: "#2563eb", color: "#ffffff", padding: "5px 14px", borderRadius: "14px", fontSize: "13px", fontWeight: "800" }}>
                    الخبرة {expIdx + 1}: {exp.companyAR}
                  </span>
                  <button
                    onClick={() => deleteExperience(expIdx)}
                    style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", padding: "5px 12px", borderRadius: "10px", fontSize: "12.5px", fontWeight: "800", cursor: "pointer" }}
                  >
                    حذف الخبرة بالكامل
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>الفترة الزمنية (عربي)</label>
                    <input
                      type="text"
                      value={exp.dateAR}
                      onChange={(e) => updateExp(expIdx, "dateAR", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>الفترة الزمنية (إنجليزي)</label>
                    <input
                      type="text"
                      value={exp.dateEN}
                      onChange={(e) => updateExp(expIdx, "dateEN", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>اسم الشركة / الجهة (عربي)</label>
                    <input
                      type="text"
                      value={exp.companyAR}
                      onChange={(e) => updateExp(expIdx, "companyAR", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>اسم الشركة / الجهة (إنجليزي)</label>
                    <input
                      type="text"
                      value={exp.companyEN}
                      onChange={(e) => updateExp(expIdx, "companyEN", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>المسمى الوظيفي (عربي)</label>
                    <input
                      type="text"
                      value={exp.roleAR}
                      onChange={(e) => updateExp(expIdx, "roleAR", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#60a5fa", fontSize: "13.5px", fontWeight: "700" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>المسمى الوظيفي (إنجليزي)</label>
                    <input
                      type="text"
                      value={exp.roleEN}
                      onChange={(e) => updateExp(expIdx, "roleEN", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#0a0b12", border: "1px solid #334155", color: "#60a5fa", fontSize: "13.5px", fontWeight: "700" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "18px", background: "#0d0e17", padding: "16px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#cbd5e1" }}>نقاط الإنجاز والمسؤوليات (بالعربية)</span>
                    <button
                      onClick={() => addExpBullet(expIdx, "AR")}
                      style={{ background: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "4px 10px", borderRadius: "8px", fontSize: "11.5px", fontWeight: "800", cursor: "pointer" }}
                    >
                      + إضافة نقطة
                    </button>
                  </div>
                  {exp.bulletsAR.map((b, bIdx) => (
                    <div key={bIdx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => updateExpBullet(expIdx, bIdx, "AR", e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                      />
                      <button
                        onClick={() => deleteExpBullet(expIdx, bIdx, "AR")}
                        style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", padding: "0 10px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#0d0e17", padding: "16px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#cbd5e1" }}>نقاط الإنجاز والمسؤوليات (بالإنجليزية)</span>
                    <button
                      onClick={() => addExpBullet(expIdx, "EN")}
                      style={{ background: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "4px 10px", borderRadius: "8px", fontSize: "11.5px", fontWeight: "800", cursor: "pointer" }}
                    >
                      + إضافة نقطة
                    </button>
                  </div>
                  {exp.bulletsEN.map((b, bIdx) => (
                    <div key={bIdx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => updateExpBullet(expIdx, bIdx, "EN", e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                      />
                      <button
                        onClick={() => deleteExpBullet(expIdx, bIdx, "EN")}
                        style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", padding: "0 10px", borderRadius: "8px", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "education" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div style={{ background: "#12131f", padding: "26px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>المؤهلات الأكاديمية (التعليم)</h3>
                <button
                  onClick={addEdu}
                  style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                >
                  + إضافة مؤهل
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {data.education.map((edu, idx) => (
                  <div key={edu.id || idx} style={{ background: "#0a0b12", padding: "18px", borderRadius: "14px", border: "1px solid #334155" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "#60a5fa" }}>مؤهل {idx + 1}</span>
                      <button
                        onClick={() => deleteEdu(idx)}
                        style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                      >
                        حذف
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>السنوات (عربي)</label>
                        <input
                          type="text"
                          value={edu.yearAR}
                          onChange={(e) => updateEdu(idx, "yearAR", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>السنوات (إنجليزي)</label>
                        <input
                          type="text"
                          value={edu.yearEN}
                          onChange={(e) => updateEdu(idx, "yearEN", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الجامعة / الكلية (عربي)</label>
                        <input
                          type="text"
                          value={edu.schoolAR}
                          onChange={(e) => updateEdu(idx, "schoolAR", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الجامعة / الكلية (إنجليزي)</label>
                        <input
                          type="text"
                          value={edu.schoolEN}
                          onChange={(e) => updateEdu(idx, "schoolEN", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الدرجة والتخصص (عربي)</label>
                        <input
                          type="text"
                          value={edu.degreeAR}
                          onChange={(e) => updateEdu(idx, "degreeAR", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الدرجة والتخصص (إنجليزي)</label>
                        <input
                          type="text"
                          value={edu.degreeEN}
                          onChange={(e) => updateEdu(idx, "degreeEN", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#12131f", padding: "26px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>الشهادات المهنية المعتمدة</h3>
                <button
                  onClick={addCert}
                  style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                >
                  + إضافة شهادة
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.certifications.map((cert, idx) => (
                  <div key={cert.id || idx} style={{ background: "#0a0b12", padding: "14px", borderRadius: "12px", border: "1px solid #334155", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الشهادة (بالعربية)</label>
                      <input
                        type="text"
                        value={cert.titleAR}
                        onChange={(e) => updateCert(idx, "titleAR", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الشهادة (بالإنجليزية)</label>
                      <input
                        type="text"
                        value={cert.titleEN}
                        onChange={(e) => updateCert(idx, "titleEN", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px" }}
                      />
                    </div>
                    <button
                      onClick={() => deleteCert(idx)}
                      style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer", marginTop: "18px" }}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cv" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ background: "#12131f", padding: "30px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: 0 }}>محرر ومصمم السيرة الذاتية (Visual PDF Editor & Builder)</h3>
                  <p style={{ fontSize: "13.5px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                    عدّل النصوص، الصورة، الخبرات، والمهارات مباشرة في ورقة الـ PDF، وولّد الملف بنقرة زر ليتم حفظه وتحديثه لجميع زوار الموقع فوراً.
                  </p>
                </div>

                {/* MODE TOGGLE */}
                <div style={{ display: "flex", background: "#0a0b12", padding: "4px", borderRadius: "10px", border: "1px solid #334155" }}>
                  <button
                    onClick={() => setCvMode("builder")}
                    style={{
                      background: cvMode === "builder" ? "#2563eb" : "transparent",
                      color: cvMode === "builder" ? "#ffffff" : "#94a3b8",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    محرر الـ PDF المباشر
                  </button>
                  <button
                    onClick={() => setCvMode("upload")}
                    style={{
                      background: cvMode === "upload" ? "#2563eb" : "transparent",
                      color: cvMode === "upload" ? "#ffffff" : "#94a3b8",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    رفع ملف PDF خارجي
                  </button>
                </div>
              </div>

              {/* ACTION TOOLBAR */}
              {cvMode === "builder" && (
                <div style={{ background: "#0a0b12", padding: "16px 20px", borderRadius: "14px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "25px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => handleGeneratePdf(false)}
                      disabled={isGeneratingPdf}
                      style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 15px rgba(22, 163, 74, 0.4)", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <span>{isGeneratingPdf ? "جاري التوليد والحفظ..." : "توليد وحفظ الـ PDF كملف الموقع الرسمي"}</span>
                    </button>

                    <button
                      onClick={() => handleGeneratePdf(true)}
                      disabled={isGeneratingPdf}
                      style={{ background: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px 18px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "800", cursor: "pointer" }}
                    >
                      تنزيل نسخة PDF إلى جهازي
                    </button>
                  </div>

                  <a
                    href={data.general.cvPdfPath}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "#151624", color: "#cbd5e1", border: "1px solid #334155", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}
                  >
                    معاينة الملف الحالي: <code style={{ color: "#60a5fa" }}>{data.general.cvPdfPath}</code>
                  </a>
                </div>
              )}

              {generatePdfStatus && (
                <div style={{ marginBottom: "20px", background: generatePdfStatus.includes("نجاح") ? "rgba(22, 163, 74, 0.2)" : "rgba(37, 99, 235, 0.2)", border: `1px solid ${generatePdfStatus.includes("نجاح") ? "#22c55e" : "#3b82f6"}`, color: generatePdfStatus.includes("نجاح") ? "#4ade80" : "#93c5fd", padding: "12px 18px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "800", textAlign: "center" }}>
                  {generatePdfStatus}
                </div>
              )}

              {/* BUILDER MODE */}
              {cvMode === "builder" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "25px", alignItems: "start" }}>
                  {/* LEFT: FORM CONTROLS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {/* PHOTO & BASIC HEADER */}
                    <div style={{ background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", marginBottom: "14px" }}>الصورة والمعلومات الشخصية</h4>

                      <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#1e2130", overflow: "hidden", border: "2px solid #60a5fa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {data.cvDocument?.photo ? (
                            <img src={data.cvDocument.photo} alt="CV Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>بدون صورة</span>
                          )}
                        </div>

                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="cvPhotoInput"
                            style={{ display: "none" }}
                            onChange={handlePhotoUpload}
                          />
                          <label htmlFor="cvPhotoInput" style={{ cursor: "pointer" }}>
                            <div style={{ background: "#2563eb", color: "#ffffff", padding: "7px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "800", display: "inline-block", marginBottom: "6px" }}>
                              تغيير / رفع صورة السيرة
                            </div>
                          </label>
                          {data.cvDocument?.photo && (
                            <button
                              onClick={() => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), photo: "" } })}
                              style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", display: "block" }}
                            >
                              إزالة الصورة
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الاسم الكامل (Full Name)</label>
                          <input
                            type="text"
                            value={data.cvDocument?.fullName || ""}
                            onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), fullName: e.target.value } })}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px", fontWeight: "700" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>المسمى المهني (Job Title)</label>
                          <input
                            type="text"
                            value={data.cvDocument?.jobTitle || ""}
                            onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), jobTitle: e.target.value } })}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13.5px" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الملخص المهني (Professional Summary)</label>
                          <textarea
                            rows={4}
                            value={data.cvDocument?.summary || ""}
                            onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), summary: e.target.value } })}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "13px", lineHeight: "1.6" }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>البريد الإلكتروني</label>
                            <input
                              type="text"
                              value={data.cvDocument?.email || ""}
                              onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), email: e.target.value } })}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>رقم الهاتف</label>
                            <input
                              type="text"
                              value={data.cvDocument?.phone || ""}
                              onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), phone: e.target.value } })}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>الموقع الجغرافي</label>
                            <input
                              type="text"
                              value={data.cvDocument?.location || ""}
                              onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), location: e.target.value } })}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>رابط LinkedIn</label>
                            <input
                              type="text"
                              value={data.cvDocument?.linkedin || ""}
                              onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), linkedin: e.target.value } })}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SKILLS TAGS */}
                    <div style={{ background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>المهارات التقنية (Skills)</h4>
                        <button
                          onClick={() => {
                            const newSkills = [...(data.cvDocument?.skills || []), "مهارة تقنية جديدة"];
                            setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), skills: newSkills } });
                          }}
                          style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                        >
                          + إضافة مهارة
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(data.cvDocument?.skills || []).map((sk, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                              type="text"
                              value={sk}
                              onChange={(e) => {
                                const newSkills = [...(data.cvDocument?.skills || [])];
                                newSkills[idx] = e.target.value;
                                setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), skills: newSkills } });
                              }}
                              style={{ flex: 1, padding: "7px 10px", borderRadius: "6px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                            />
                            <button
                              onClick={() => {
                                const newSkills = (data.cvDocument?.skills || []).filter((_, i) => i !== idx);
                                setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), skills: newSkills } });
                              }}
                              style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* STYLING & ACCENT */}
                    <div style={{ background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", marginBottom: "12px" }}>ثيم وتصميم الـ PDF</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                        {[
                          { id: "modern-dark", label: "داكن عصري (Dark)" },
                          { id: "clean-white", label: "أبيض بسيط (White)" },
                          { id: "executive-blue", label: "أزرق ملكي (Executive)" },
                        ].map((th) => (
                          <button
                            key={th.id}
                            onClick={() => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), templateStyle: th.id as any } })}
                            style={{
                              background: data.cvDocument?.templateStyle === th.id ? "#2563eb" : "#151624",
                              color: data.cvDocument?.templateStyle === th.id ? "#ffffff" : "#94a3b8",
                              border: "1px solid #334155",
                              padding: "8px 6px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                            }}
                          >
                            {th.label}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>لون التمييز (Accent Color):</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="color"
                            value={data.cvDocument?.accentColor || "#2563eb"}
                            onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), accentColor: e.target.value } })}
                            style={{ width: "36px", height: "36px", borderRadius: "6px", border: "none", cursor: "pointer", background: "none" }}
                          />
                          <input
                            type="text"
                            value={data.cvDocument?.accentColor || "#2563eb"}
                            onChange={(e) => setData({ ...data, cvDocument: { ...(data.cvDocument || ({} as any)), accentColor: e.target.value } })}
                            style={{ width: "120px", padding: "6px 10px", borderRadius: "6px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "12.5px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: LIVE A4 SHEET CANVAS PREVIEW */}
                  <div style={{ background: "#05060a", padding: "16px", borderRadius: "18px", border: "1px solid #334155", overflowX: "auto" }}>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: "#60a5fa", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                      <span>معاينة ورقة الـ PDF الحقيقية (A4 Sheet):</span>
                      <span>210mm x 297mm</span>
                    </div>

                    {/* THE EXACT A4 CANVAS ELEMENT TO BE RENDERED INTO PDF */}
                    <div
                      id="cv-pdf-canvas"
                      style={{
                        width: "100%",
                        maxWidth: "680px",
                        margin: "0 auto",
                        minHeight: "880px",
                        background: data.cvDocument?.templateStyle === "clean-white" ? "#ffffff" : data.cvDocument?.templateStyle === "executive-blue" ? "#0f172a" : "#0d0f18",
                        color: data.cvDocument?.templateStyle === "clean-white" ? "#0f172a" : "#ffffff",
                        padding: "36px 32px",
                        boxSizing: "border-box",
                        fontFamily: "'Outfit', 'Tajawal', sans-serif",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                      }}
                      dir="ltr"
                    >
                      {/* HEADER ROW */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${data.cvDocument?.accentColor || "#2563eb"}`, paddingBottom: "18px", marginBottom: "20px", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <h1 style={{ fontSize: "26px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "0.5px", color: data.cvDocument?.templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                            {data.cvDocument?.fullName || "HAIDER M. SHWKAT"}
                          </h1>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: data.cvDocument?.accentColor || "#2563eb", marginBottom: "10px" }}>
                            {data.cvDocument?.jobTitle || "Computer Science Specialist | Data Operations & Workflow Consultant"}
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: data.cvDocument?.templateStyle === "clean-white" ? "#475569" : "#94a3b8" }}>
                            <div>📧 {data.cvDocument?.email || data.general.email}</div>
                            <div>📞 {data.cvDocument?.phone || data.general.phone}</div>
                            <div>📍 {data.cvDocument?.location || data.general.locationEN}</div>
                            <div>🔗 {data.cvDocument?.linkedin || "linkedin.com/in/haidermoe"}</div>
                          </div>
                        </div>

                        {data.cvDocument?.photo && (
                          <div style={{ width: "80px", height: "80px", borderRadius: "12px", overflow: "hidden", border: `2px solid ${data.cvDocument.accentColor || "#2563eb"}`, flexShrink: 0 }}>
                            <img src={data.cvDocument.photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>

                      {/* SUMMARY BOX */}
                      {data.cvDocument?.summary && (
                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "900", color: data.cvDocument?.accentColor || "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                            Executive Summary
                          </div>
                          <p style={{ fontSize: "11.5px", lineHeight: "1.6", color: data.cvDocument?.templateStyle === "clean-white" ? "#334155" : "#cbd5e1", margin: 0 }}>
                            {data.cvDocument.summary}
                          </p>
                        </div>
                      )}

                      {/* WORK EXPERIENCE */}
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "900", color: data.cvDocument?.accentColor || "#2563eb", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "4px", marginBottom: "12px" }}>
                          Professional Work Experience
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          {(data.cvDocument?.experiences?.length ? data.cvDocument.experiences : data.experiences).map((exp, i) => (
                            <div key={exp.id || i}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                                <div>
                                  <strong style={{ fontSize: "12.5px", color: data.cvDocument?.templateStyle === "clean-white" ? "#0f172a" : "#ffffff" }}>
                                    {(exp as any).role || (exp as any).roleEN}
                                  </strong>
                                  <span style={{ fontSize: "11.5px", color: data.cvDocument?.accentColor || "#2563eb", marginLeft: "6px" }}>
                                    | {(exp as any).company || (exp as any).companyEN}
                                  </span>
                                </div>
                                <span style={{ fontSize: "10.5px", color: data.cvDocument?.templateStyle === "clean-white" ? "#64748b" : "#94a3b8", fontWeight: "700" }}>
                                  {(exp as any).date || (exp as any).dateEN}
                                </span>
                              </div>

                              <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", fontSize: "11px", color: data.cvDocument?.templateStyle === "clean-white" ? "#334155" : "#cbd5e1", lineHeight: "1.5" }}>
                                {((exp as any).bullets || (exp as any).bulletsEN || []).map((b: string, bi: number) => (
                                  <li key={bi} style={{ marginBottom: "2px" }}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SKILLS GRID */}
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "900", color: data.cvDocument?.accentColor || "#2563eb", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "4px", marginBottom: "10px" }}>
                          Technical Skills & Core Competencies
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {(data.cvDocument?.skills || []).map((sk, i) => (
                            <span
                              key={i}
                              style={{
                                background: data.cvDocument?.templateStyle === "clean-white" ? "#f1f5f9" : "rgba(37,99,235,0.15)",
                                border: `1px solid ${data.cvDocument?.accentColor || "#2563eb"}40`,
                                color: data.cvDocument?.templateStyle === "clean-white" ? "#0f172a" : "#e2e8f0",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: "700",
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* EDUCATION & CERTS */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "900", color: data.cvDocument?.accentColor || "#2563eb", textTransform: "uppercase", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "3px", marginBottom: "6px" }}>
                            Education
                          </div>
                          {data.education.map((edu, i) => (
                            <div key={i} style={{ fontSize: "10.5px", marginBottom: "4px", color: data.cvDocument?.templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              <strong>{edu.degreeEN}</strong>
                              <div>{edu.schoolEN} ({edu.yearEN})</div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "900", color: data.cvDocument?.accentColor || "#2563eb", textTransform: "uppercase", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "3px", marginBottom: "6px" }}>
                            Certifications
                          </div>
                          {data.certifications.map((cert, i) => (
                            <div key={i} style={{ fontSize: "10.5px", marginBottom: "3px", color: data.cvDocument?.templateStyle === "clean-white" ? "#334155" : "#cbd5e1" }}>
                              • {cert.titleEN}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MANUAL UPLOAD MODE */}
              {cvMode === "upload" && (
                <div>
                  <div style={{ background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "25px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px" }}>رابط الملف الحالي المعتمد:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <code style={{ background: "#1e293b", color: "#60a5fa", padding: "8px 14px", borderRadius: "8px", fontSize: "14px" }}>{data.general.cvPdfPath}</code>
                      <a
                        href={data.general.cvPdfPath}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: "#2563eb", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "800", textDecoration: "none" }}
                      >
                        فتح ومعاينة الملف الحالي
                      </a>
                    </div>
                  </div>

                  <div style={{ border: "2px dashed #475569", borderRadius: "18px", padding: "30px 20px", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
                    <input
                      type="file"
                      accept=".pdf"
                      id="cvFileInput"
                      style={{ display: "none" }}
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="cvFileInput" style={{ cursor: "pointer", display: "inline-block" }}>
                      <div style={{ background: "#2563eb", color: "#ffffff", padding: "12px 26px", borderRadius: "12px", fontSize: "14px", fontWeight: "800", marginBottom: "12px", display: "inline-block" }}>
                        اختر ملف PDF جديد من جهازك
                      </div>
                    </label>
                    <div style={{ fontSize: "13.5px", color: "#cbd5e1", fontWeight: "600" }}>
                      {cvFile ? `الملف المختار: ${cvFile.name} (${(cvFile.size / 1024).toFixed(1)} KB)` : "أو اسحب ملف الـ PDF هنا"}
                    </div>

                    {cvFile && (
                      <div style={{ marginTop: "20px" }}>
                        <button
                          onClick={handleUploadCv}
                          disabled={isUploadingCv}
                          style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "12px 28px", borderRadius: "12px", fontSize: "14.5px", fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 20px rgba(22, 163, 74, 0.4)" }}
                        >
                          {isUploadingCv ? "جاري الرفع والاستبدال..." : "تأكيد رفع واستبدال الملف فوراً"}
                        </button>
                      </div>
                    )}

                    {uploadCvStatus && (
                      <div style={{ marginTop: "16px", fontSize: "14px", fontWeight: "800", color: uploadCvStatus.includes("نجاح") ? "#4ade80" : "#f87171" }}>
                        {uploadCvStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: TYPOGRAPHY & FONTS */}
        {activeTab === "typography" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ background: "#12131f", padding: "30px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "8px", color: "#60a5fa" }}>إعدادات الخطوط والطباعة (Typography Settings)</h3>
              <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "24px" }}>
                تحكم بنوع الخط العربي والإنجليزي، أحجام العناوين، وسُمك الخطوط وارتفاع الأسطر عبر كل صفحات الموقع.
              </p>

              {/* 1. ARABIC FONT SELECTOR */}
              <div style={{ marginBottom: "28px", background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#ffffff", marginBottom: "12px" }}>
                  نوع الخط العربي الأساسي (Arabic Font Family)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  {[
                    { name: "Tajawal", label: "تجاول (Tajawal)", font: "Tajawal, sans-serif" },
                    { name: "Cairo", label: "كايرو (Cairo)", font: "Cairo, sans-serif" },
                    { name: "Alexandria", label: "الإسكندرية (Alexandria)", font: "Alexandria, sans-serif" },
                    { name: "Almarai", label: "المراعي (Almarai)", font: "Almarai, sans-serif" },
                    { name: "IBM Plex Sans Arabic", label: "آي بي إم بلكس (IBM Plex)", font: "'IBM Plex Sans Arabic', sans-serif" },
                    { name: "Readex Pro", label: "ريدكس برو (Readex Pro)", font: "'Readex Pro', sans-serif" },
                    { name: "Changa", label: "شانغا (Changa)", font: "Changa, sans-serif" },
                    { name: "Vazirmatn", label: "وزير متن (Vazirmatn)", font: "Vazirmatn, sans-serif" },
                  ].map((f) => {
                    const isSelected = (data.typography?.fontFamilyAR || "Tajawal").includes(f.name);
                    return (
                      <button
                        key={f.name}
                        onClick={() => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            fontFamilyAR: f.name,
                          }
                        })}
                        style={{
                          background: isSelected ? "#2563eb" : "#151624",
                          color: isSelected ? "#ffffff" : "#cbd5e1",
                          border: isSelected ? "2px solid #60a5fa" : "1px solid #334155",
                          padding: "14px 12px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          textAlign: "center",
                          fontFamily: f.font,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "4px" }}>{f.label}</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>أبجد هوز حطي كلمن</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ENGLISH FONT SELECTOR */}
              <div style={{ marginBottom: "28px", background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#ffffff", marginBottom: "12px" }}>
                  نوع الخط الإنجليزي الأساسي (English Font Family)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  {[
                    { name: "Outfit", label: "Outfit", font: "'Outfit', sans-serif" },
                    { name: "Inter", label: "Inter", font: "'Inter', sans-serif" },
                    { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", font: "'Plus Jakarta Sans', sans-serif" },
                    { name: "Space Grotesk", label: "Space Grotesk", font: "'Space Grotesk', sans-serif" },
                    { name: "Poppins", label: "Poppins", font: "'Poppins', sans-serif" },
                    { name: "Montserrat", label: "Montserrat", font: "'Montserrat', sans-serif" },
                    { name: "Syne", label: "Syne", font: "'Syne', sans-serif" },
                    { name: "Sora", label: "Sora", font: "'Sora', sans-serif" },
                  ].map((f) => {
                    const isSelected = (data.typography?.fontFamilyEN || "Outfit").includes(f.name);
                    return (
                      <button
                        key={f.name}
                        onClick={() => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            fontFamilyEN: f.name,
                          }
                        })}
                        style={{
                          background: isSelected ? "#2563eb" : "#151624",
                          color: isSelected ? "#ffffff" : "#cbd5e1",
                          border: isSelected ? "2px solid #60a5fa" : "1px solid #334155",
                          padding: "14px 12px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          textAlign: "center",
                          fontFamily: f.font,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "4px" }}>{f.label}</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>Digital Results & Engineering</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SIZES & LINE HEIGHTS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
                {/* BIO FONT SIZE */}
                <div style={{ background: "#0a0b12", padding: "16px", borderRadius: "14px", border: "1px solid #334155" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                    حجم خط النبذة التعريفية (Bio Font Size)
                  </label>
                  <select
                    value={data.typography?.bioFontSize || "18px"}
                    onChange={(e) => setData({
                      ...data,
                      typography: {
                        ...(data.typography || {
                          fontFamilyAR: "Tajawal",
                          fontFamilyEN: "Outfit",
                          heroTitleScale: "normal",
                          bioFontSize: "18px",
                          bodyLineHeight: "1.7",
                          headingWeight: "900",
                          letterSpacing: "normal",
                        }),
                        bioFontSize: e.target.value,
                      }
                    })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  >
                    <option value="15px">صغير (15px)</option>
                    <option value="16px">متوسط قياسي (16px)</option>
                    <option value="18px">كبير مريح (18px - المقترح)</option>
                    <option value="20px">كبير جداً (20px)</option>
                    <option value="22px">ضخم بارز (22px)</option>
                  </select>
                </div>

                {/* HEADING WEIGHT */}
                <div style={{ background: "#0a0b12", padding: "16px", borderRadius: "14px", border: "1px solid #334155" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                    سُمك العناوين (Heading Weight)
                  </label>
                  <select
                    value={data.typography?.headingWeight || "900"}
                    onChange={(e) => setData({
                      ...data,
                      typography: {
                        ...(data.typography || {
                          fontFamilyAR: "Tajawal",
                          fontFamilyEN: "Outfit",
                          heroTitleScale: "normal",
                          bioFontSize: "18px",
                          bodyLineHeight: "1.7",
                          headingWeight: "900",
                          letterSpacing: "normal",
                        }),
                        headingWeight: e.target.value,
                      }
                    })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  >
                    <option value="600">نصف عريض (Semi-Bold 600)</option>
                    <option value="700">عريض قياسي (Bold 700)</option>
                    <option value="800">عريض بارز (Extra-Bold 800)</option>
                    <option value="900">سُمك فائق فاخر (Black 900 - المقترح)</option>
                  </select>
                </div>

                {/* LINE HEIGHT */}
                <div style={{ background: "#0a0b12", padding: "16px", borderRadius: "14px", border: "1px solid #334155" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                    تباعد الأسطر والفقرات (Line Height)
                  </label>
                  <select
                    value={data.typography?.bodyLineHeight || "1.7"}
                    onChange={(e) => setData({
                      ...data,
                      typography: {
                        ...(data.typography || {
                          fontFamilyAR: "Tajawal",
                          fontFamilyEN: "Outfit",
                          heroTitleScale: "normal",
                          bioFontSize: "18px",
                          bodyLineHeight: "1.7",
                          headingWeight: "900",
                          letterSpacing: "normal",
                        }),
                        bodyLineHeight: e.target.value,
                      }
                    })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  >
                    <option value="1.5">مضغوط (1.5)</option>
                    <option value="1.7">متوازن ومريح (1.7 - المقترح)</option>
                    <option value="1.9">واسع ومفتوح (1.9)</option>
                    <option value="2.1">واسع جداً (2.1)</option>
                  </select>
                </div>

                {/* HERO TITLE SCALE */}
                <div style={{ background: "#0a0b12", padding: "16px", borderRadius: "14px", border: "1px solid #334155" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                    مقياس عناوين الهيرو (Hero Title Scale)
                  </label>
                  <select
                    value={data.typography?.heroTitleScale || "normal"}
                    onChange={(e) => setData({
                      ...data,
                      typography: {
                        ...(data.typography || {
                          fontFamilyAR: "Tajawal",
                          fontFamilyEN: "Outfit",
                          heroTitleScale: "normal",
                          bioFontSize: "18px",
                          bodyLineHeight: "1.7",
                          headingWeight: "900",
                          letterSpacing: "normal",
                        }),
                        heroTitleScale: e.target.value,
                      }
                    })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#151624", border: "1px solid #334155", color: "#ffffff", fontSize: "14px" }}
                  >
                    <option value="normal">قياسي متناسق (Normal)</option>
                    <option value="large">كبير بارز (Large +15%)</option>
                    <option value="huge">عملاق وجريء (Huge +30%)</option>
                  </select>
                </div>
              </div>

              {/* 4. FONT & TEXT COLORS */}
              <div style={{ marginTop: "28px", background: "#0a0b12", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff", display: "block" }}>
                      ألوان الخطوط والنصوص (Font & Text Colors)
                    </label>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>تحكم بلون العناوين، النصوص الفرعية، وألوان التمييز التفاعلية</span>
                  </div>

                  {/* QUICK PALETTE PRESETS */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      { name: "الأزرق التقني", primary: "#ffffff", accent: "#60a5fa", muted: "#94a3b8" },
                      { name: "الزمردي النيون", primary: "#f0fdf4", accent: "#34d399", muted: "#94a3b8" },
                      { name: "الذهبي الملكي", primary: "#fffbeb", accent: "#fbbf24", muted: "#a8a29e" },
                      { name: "البنفسجي المستقبلي", primary: "#faf5ff", accent: "#a78bfa", muted: "#a1a1aa" },
                      { name: "السيان المتوهج", primary: "#ecfeff", accent: "#22d3ee", muted: "#94a3b8" },
                      { name: "الوردي المتألق", primary: "#fff1f2", accent: "#fb7185", muted: "#9ca3af" },
                    ].map((pal) => (
                      <button
                        key={pal.name}
                        onClick={() => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorPrimary: pal.primary,
                            textColorAccent: pal.accent,
                            textColorMuted: pal.muted,
                          }
                        })}
                        style={{
                          background: "#151624",
                          border: `1px solid ${pal.accent}`,
                          color: "#ffffff",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: pal.accent, display: "inline-block" }} />
                        {pal.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INDIVIDUAL COLOR PICKERS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  {/* PRIMARY TEXT COLOR */}
                  <div style={{ background: "#151624", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
                      لون العناوين والنصوص الأساسية
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="color"
                        value={data.typography?.textColorPrimary || "#ffffff"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorPrimary: e.target.value,
                          }
                        })}
                        style={{ width: "42px", height: "42px", borderRadius: "8px", border: "none", cursor: "pointer", background: "none" }}
                      />
                      <input
                        type="text"
                        value={data.typography?.textColorPrimary || "#ffffff"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorPrimary: e.target.value,
                          }
                        })}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "#0a0b12", border: "1px solid #334155", color: "#ffffff", fontSize: "13px", fontWeight: "700", fontFamily: "monospace" }}
                      />
                    </div>
                  </div>

                  {/* ACCENT / HIGHLIGHT COLOR */}
                  <div style={{ background: "#151624", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#60a5fa", marginBottom: "8px" }}>
                      لون التمييز والروابط (Accent Color)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="color"
                        value={data.typography?.textColorAccent || "#60a5fa"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorAccent: e.target.value,
                          }
                        })}
                        style={{ width: "42px", height: "42px", borderRadius: "8px", border: "none", cursor: "pointer", background: "none" }}
                      />
                      <input
                        type="text"
                        value={data.typography?.textColorAccent || "#60a5fa"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorAccent: e.target.value,
                          }
                        })}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "#0a0b12", border: "1px solid #334155", color: "#60a5fa", fontSize: "13px", fontWeight: "700", fontFamily: "monospace" }}
                      />
                    </div>
                  </div>

                  {/* MUTED / SECONDARY TEXT COLOR */}
                  <div style={{ background: "#151624", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                      لون النصوص الفرعية والوصف (Muted Text)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="color"
                        value={data.typography?.textColorMuted || "#94a3b8"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorMuted: e.target.value,
                          }
                        })}
                        style={{ width: "42px", height: "42px", borderRadius: "8px", border: "none", cursor: "pointer", background: "none" }}
                      />
                      <input
                        type="text"
                        value={data.typography?.textColorMuted || "#94a3b8"}
                        onChange={(e) => setData({
                          ...data,
                          typography: {
                            ...(data.typography || {
                              fontFamilyAR: "Tajawal",
                              fontFamilyEN: "Outfit",
                              heroTitleScale: "normal",
                              bioFontSize: "18px",
                              bodyLineHeight: "1.7",
                              headingWeight: "900",
                              letterSpacing: "normal",
                            }),
                            textColorMuted: e.target.value,
                          }
                        })}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "#0a0b12", border: "1px solid #334155", color: "#94a3b8", fontSize: "13px", fontWeight: "700", fontFamily: "monospace" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>

        {/* STICKY SIDE-BY-SIDE LIVE PREVIEW COLUMN */}
        {showLivePreview && data && (
          <div
            style={{
              position: "sticky",
              top: "85px",
              height: "calc(100vh - 110px)",
              width: "100%",
              background: "#0c0d17",
              border: "2px solid #2563eb",
              borderRadius: "20px",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 50,
            }}
          >
            {/* PREVIEW WINDOW HEADER */}
            <div
              style={{
                background: "#151728",
                padding: "12px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "13px", fontWeight: "900", color: "#ffffff" }}>معاينة حية (0ms Live)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* LANG TOGGLE */}
              {!isPreviewMinimized && (
                <>
                  <button
                    onClick={() => setPreviewLang(previewLang === "AR" ? "EN" : "AR")}
                    style={{
                      background: "#1e2130",
                      color: "#60a5fa",
                      border: "1px solid #334155",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {previewLang === "AR" ? "عرض بالإنجليزية" : "عرض بالعربية"}
                  </button>

                  <button
                    onClick={() => setPreviewDevice(previewDevice === "mobile" ? "desktop" : "mobile")}
                    style={{
                      background: "#1e2130",
                      color: "#cbd5e1",
                      border: "1px solid #334155",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {previewDevice === "mobile" ? "شاشة عريضة" : "هاتف"}
                  </button>
                </>
              )}

              {/* MINIMIZE BUTTON */}
              <button
                onClick={() => setIsPreviewMinimized(!isPreviewMinimized)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "2px 6px",
                  fontWeight: "900",
                }}
                title={isPreviewMinimized ? "تكبير المعاينة" : "تصغير المعاينة"}
              >
                {isPreviewMinimized ? "□" : "—"}
              </button>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowLivePreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "2px 6px",
                  fontWeight: "900",
                }}
                title="إغلاق المعاينة"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SECTION FILTER PILLS */}
          {!isPreviewMinimized && (
            <div
              style={{
                background: "#0f101d",
                padding: "8px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "6px",
                overflowX: "auto",
              }}
            >
              {[
                { id: "auto", label: "القسم الحالي (تلقائي)" },
                { id: "general", label: "النبذة" },
                { id: "stats", label: "الإحصائيات" },
                { id: "experiences", label: "الخبرات" },
                { id: "education", label: "التعليم" },
                { id: "cv", label: "ملف السيرة" },
                { id: "typography", label: "الخطوط" },
                { id: "all", label: "عرض الكل" },
              ].map((pill) => {
                const isPillActive = previewSectionTab === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setPreviewSectionTab(pill.id as any)}
                    style={{
                      background: isPillActive ? "#2563eb" : "#1a1c2e",
                      color: isPillActive ? "#ffffff" : "#94a3b8",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.2s",
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* PREVIEW CONTENT BODY */}
          {!isPreviewMinimized && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                background: "#08090f",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                fontFamily: previewLang === "AR" ? `'${data.typography?.fontFamilyAR || "Tajawal"}', sans-serif` : `'${data.typography?.fontFamilyEN || "Outfit"}', sans-serif`,
                lineHeight: data.typography?.bodyLineHeight || "1.7",
              }}
              dir={previewLang === "AR" ? "rtl" : "ltr"}
            >
              {/* NOTICE PILL */}
              <div
                style={{
                  background: "rgba(37, 99, 235, 0.12)",
                  border: "1px solid rgba(37, 99, 235, 0.25)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  color: "#93c5fd",
                  fontWeight: "700",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                معاينة مباشرة للقسم: {
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "general" ? "النبذة والمعلومات الأساسية" :
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "stats" ? "الإحصائيات والأرقام" :
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "experiences" ? "الخبرات العملية" :
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "education" ? "التعليم والشهادات" :
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "cv" ? "ملف السيرة الذاتية" :
                  (previewSectionTab === "auto" ? activeTab : previewSectionTab) === "typography" ? "الخطوط والطباعة" : "كل الأقسام"
                }
              </div>

              {/* TYPOGRAPHY SAMPLE PREVIEW */}
              {((previewSectionTab === "auto" && activeTab === "typography") || previewSectionTab === "typography") && (
                <div style={{ background: "#11121d", padding: "16px", borderRadius: "14px", border: `1px solid ${data.typography?.textColorAccent || "rgba(255,255,255,0.06)"}` }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: data.typography?.textColorAccent || "#60a5fa", display: "block", marginBottom: "8px" }}>
                    معاينة عينة الخط والألوان (Active Typography & Colors)
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: data.typography?.headingWeight || "900", color: data.typography?.textColorPrimary || "#ffffff", marginBottom: "6px" }}>
                    {previewLang === "AR" ? "نصنع أفضل النتائج الرقمية" : "WE CREATE AWESOME DIGITAL RESULTS"}
                  </div>
                  <div style={{ fontSize: "13px", color: data.typography?.textColorAccent || "#60a5fa", fontWeight: "700", marginBottom: "10px" }}>
                    الخط: {previewLang === "AR" ? data.typography?.fontFamilyAR || "Tajawal" : data.typography?.fontFamilyEN || "Outfit"} | السُمك: {data.typography?.headingWeight || "900"}
                  </div>
                  <p style={{ fontSize: data.typography?.bioFontSize || "16px", color: data.typography?.textColorMuted || "#cbd5e1", lineHeight: data.typography?.bodyLineHeight || "1.7", margin: 0 }}>
                    {data.translations[previewLang]?.bio || (previewLang === "AR" ? data.translations.AR.bio : data.translations.EN.bio)}
                  </p>
                </div>
              )}

              {/* 1. LIVE HERO & BIO SECTION */}
              {((previewSectionTab === "auto" && activeTab === "general") || previewSectionTab === "general" || previewSectionTab === "all") && (
                <div style={{ background: "#11121d", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: data.typography?.textColorAccent || "#60a5fa", display: "block", marginBottom: "8px" }}>
                    قسم النبذة والهيرو (Bio & Hero)
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "15px", fontWeight: data.typography?.headingWeight || "900", color: data.typography?.textColorPrimary || "#ffffff" }}>
                      {previewLang === "AR" ? data.general.nameAR : data.general.nameEN}
                    </span>
                    <span style={{ background: data.typography?.textColorPrimary || "#ffffff", color: "#000000", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", fontWeight: "900" }}>
                      {previewLang === "AR" ? "تحميل السيرة الذاتية" : "Download CV"}
                    </span>
                  </div>

                  <p style={{ fontSize: data.typography?.bioFontSize || "14px", color: data.typography?.textColorMuted || "#94a3b8", lineHeight: data.typography?.bodyLineHeight || "1.6", margin: "0 0 10px 0" }}>
                    {data.translations[previewLang]?.bio || (previewLang === "AR" ? data.translations.AR.bio : data.translations.EN.bio)}
                  </p>

                  <div style={{ background: "#0a0b12", padding: "8px 10px", borderRadius: "8px", fontSize: "11px", color: data.typography?.textColorMuted || "#cbd5e1" }}>
                    <div>فيديو الخلفية: <code style={{ color: data.typography?.textColorAccent || "#60a5fa" }}>{data.general.heroVideo}</code></div>
                    <div>الموقع: {previewLang === "AR" ? data.general.locationAR : data.general.locationEN} | الهاتف: {data.general.phone}</div>
                  </div>
                </div>
              )}

              {/* 2. LIVE STATS SECTION */}
              {((previewSectionTab === "auto" && activeTab === "stats") || previewSectionTab === "stats" || previewSectionTab === "all") && (
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: data.typography?.textColorAccent || "#60a5fa", display: "block", marginBottom: "8px" }}>
                    {previewLang === "AR" ? "الإحصائيات والأرقام" : "Stats & Numbers"} ({data.stats.length})
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: previewDevice === "mobile" ? "1fr 1fr" : "1fr 1fr", gap: "8px" }}>
                    {data.stats.map((st, i) => (
                      <div key={st.id || i} style={{ background: "#11121d", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "16px", fontWeight: "900", color: data.typography?.textColorPrimary || "#ffffff", marginBottom: "4px" }}>
                          {st.value}
                        </div>
                        <div style={{ fontSize: "11px", color: data.typography?.textColorMuted || "#94a3b8", lineHeight: "1.4", marginBottom: "6px" }}>
                          {previewLang === "AR" ? st.textAR : st.textEN}
                        </div>
                        <div style={{ fontSize: "9.5px", color: data.typography?.textColorAccent || "#60a5fa", opacity: 0.8 }}>
                          فيديو: {st.video}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. LIVE EXPERIENCES SECTION */}
              {((previewSectionTab === "auto" && activeTab === "experiences") || previewSectionTab === "experiences" || previewSectionTab === "all") && (
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: data.typography?.textColorAccent || "#60a5fa", display: "block", marginBottom: "8px" }}>
                    {previewLang === "AR" ? "الخبرات العملية" : "Work Experience"} ({data.experiences.length})
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {data.experiences.map((exp, i) => (
                      <div key={exp.id || i} style={{ background: "#11121d", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "900", color: data.typography?.textColorPrimary || "#ffffff" }}>
                              {previewLang === "AR" ? exp.companyAR : exp.companyEN}
                            </div>
                            <div style={{ fontSize: "11.5px", fontWeight: "700", color: data.typography?.textColorAccent || "#60a5fa" }}>
                              {previewLang === "AR" ? exp.roleAR : exp.roleEN}
                            </div>
                          </div>
                          <span style={{ fontSize: "10px", color: data.typography?.textColorMuted || "#94a3b8", background: "#1c1e2e", padding: "3px 6px", borderRadius: "6px" }}>
                            {previewLang === "AR" ? exp.dateAR : exp.dateEN}
                          </span>
                        </div>

                        <ul style={{ margin: "6px 0 0 0", paddingInlineStart: "16px", fontSize: "11px", color: data.typography?.textColorMuted || "#cbd5e1", lineHeight: "1.5" }}>
                          {(previewLang === "AR" ? exp.bulletsAR : exp.bulletsEN).map((b, bi) => (
                            <li key={bi} style={{ marginBottom: "3px" }}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. LIVE EDUCATION & CERTS SECTION */}
              {((previewSectionTab === "auto" && activeTab === "education") || previewSectionTab === "education" || previewSectionTab === "all") && (
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#60a5fa", display: "block", marginBottom: "8px" }}>
                    {previewLang === "AR" ? "التعليم والشهادات" : "Education & Certifications"}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#cbd5e1" }}>المؤهلات:</div>
                    {data.education.map((edu, i) => (
                      <div key={edu.id || i} style={{ background: "#11121d", padding: "10px 12px", borderRadius: "10px", fontSize: "11px" }}>
                        <strong style={{ color: "#ffffff", display: "block" }}>{previewLang === "AR" ? edu.degreeAR : edu.degreeEN}</strong>
                        <span style={{ color: "#94a3b8" }}>{previewLang === "AR" ? edu.schoolAR : edu.schoolEN} ({previewLang === "AR" ? edu.yearAR : edu.yearEN})</span>
                      </div>
                    ))}

                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#cbd5e1", marginTop: "6px" }}>الشهادات:</div>
                    {data.certifications.map((cert, i) => (
                      <div key={cert.id || i} style={{ background: "#11121d", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", color: "#cbd5e1" }}>
                        • {previewLang === "AR" ? cert.titleAR : cert.titleEN}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. LIVE CV PDF SECTION */}
              {((previewSectionTab === "auto" && activeTab === "cv") || previewSectionTab === "cv" || previewSectionTab === "all") && (
                <div style={{ background: "#11121d", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#60a5fa", display: "block", marginBottom: "6px" }}>
                    ملف السيرة الذاتية النشط
                  </span>
                  <div style={{ fontSize: "12px", color: "#ffffff", fontWeight: "700", marginBottom: "8px" }}>
                    المسار: <code style={{ color: "#60a5fa" }}>{data.general.cvPdfPath}</code>
                  </div>
                  <a
                    href={data.general.cvPdfPath}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "#2563eb", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", textDecoration: "none", display: "inline-block" }}
                  >
                    معاينة ملف الـ PDF الحالي
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS CHEAT SHEET MODAL */}
      {showShortcutsModal && (
        <div
          onClick={() => setShowShortcutsModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#11121e",
              border: "1px solid #3b82f6",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#60a5fa" }} />
                <h3 style={{ fontSize: "17px", fontWeight: "900", color: "#ffffff", margin: 0 }}>اختصارات لوحة المفاتيح (Keyboard Shortcuts)</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { shortcut: "Ctrl + Z", desc: "تراجع عن آخر تعديل (Undo)" },
                { shortcut: "Ctrl + Y / Ctrl+Shift+Z", desc: "إعادة التعديل المتراجع عنه (Redo)" },
                { shortcut: "Ctrl + S", desc: "حفظ ونشر جميع التعديلات فوراً" },
                { shortcut: "Ctrl + P", desc: "إظهار أو إخفاء نافذة المعاينة الحية" },
                { shortcut: "Ctrl + L", desc: "تبديل لغة المعاينة بين العربية والإنجليزية" },
                { shortcut: "Ctrl + 1", desc: "الذهاب لتبويب: النبذة والمعلومات الأساسية" },
                { shortcut: "Ctrl + 2", desc: "الذهاب لتبويب: الإحصائيات والأرقام" },
                { shortcut: "Ctrl + 3", desc: "الذهاب لتبويب: الخبرات العملية" },
                { shortcut: "Ctrl + 4", desc: "الذهاب لتبويب: التعليم والشهادات" },
                { shortcut: "Ctrl + 5", desc: "الذهاب لتبويب: ملف السيرة الذاتية (PDF)" },
                { shortcut: "Ctrl + 6", desc: "الذهاب لتبويب: الخطوط والطباعة" },
                { shortcut: "Shift + ?", desc: "فتح / إغلاق نافذة الاختصارات" },
                { shortcut: "Escape", desc: "إغلاق النوافذ المنبثقة" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0a0b12", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "13.5px", color: "#cbd5e1", fontWeight: "600" }}>{item.desc}</span>
                  <kbd style={{ background: "#1e2130", border: "1px solid #475569", color: "#60a5fa", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", fontFamily: "monospace" }}>
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                onClick={() => setShowShortcutsModal(false)}
                style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "800", cursor: "pointer" }}
              >
                فهمت ذلك (إغلاق)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
