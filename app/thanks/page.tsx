"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ThanksPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");

  return (
    <div
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#ffffff",
        color: "#0f111a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px clamp(20px, 5vw, 60px)",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* TOP HEADER BAR (APPLE-STYLE GLASSMATERIAL FROSTED BAR) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10 }}>
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#0f111a", fontSize: "20px", fontWeight: "900" }}>
          <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#0f111a"/>
            <rect x="0" y="13" width="16" height="7" fill="#0f111a"/>
            <rect x="10" y="13" width="15" height="7" fill="#64748b"/>
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
        </Link>

        {/* CENTER PILL NAV (APPLE FROSTED GLASS BAR) */}
        <div
          className="desktop-header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            background: "rgba(241, 245, 249, 0.8)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            padding: "8px 24px",
            borderRadius: "50px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
          }}
        >
          <Link href="/#about" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "النبذة" : "About Us"}
          </Link>
          <Link href="/#experience" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "الخبرات" : "Experience"}
          </Link>
          <Link href="/#education" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "التعليم" : "Education"}
          </Link>
          <Link href="/#contact" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "تواصل معي" : "Contact Us"}
          </Link>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", direction: "ltr" }}>
          <button
            onClick={() => setLang(lang === "AR" ? "EN" : "AR")}
            className="awsmd-btn-glow"
            style={{
              background: "#ffffff",
              border: "1.5px solid #4f46e5",
              color: "#4f46e5",
              padding: "6px 14px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            {lang === "AR" ? "EN" : "عربي"} ∨
          </button>

          <Link
            href="/"
            className="awsmd-btn-glow"
            style={{
              background: "#f1f5f9",
              color: "#0f111a",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13.5px",
              fontWeight: "800",
              textDecoration: "none"
            }}
          >
            ← {lang === "AR" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>

      {/* CENTER HERO CONTENT (APPLE OPTICAL TYPOGRAPHY & FLUID ENTRANCE) */}
      <div style={{ margin: "auto", maxWidth: "750px", textAlign: "center", padding: "60px 20px" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 9vw, 96px)",
            fontWeight: "900",
            color: "#0f111a",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            marginBottom: "25px"
          }}
        >
          {lang === "AR" ? "شكراً لك! 🛸" : "Thank You! 🛸"}
        </h1>

        <p
          style={{
            fontSize: "clamp(20px, 3.5vw, 28px)",
            fontWeight: "800",
            color: "#0f111a",
            marginBottom: "15px",
            lineHeight: "1.3"
          }}
        >
          {lang === "AR" ? "تم إرسال طلبك بنجاح 😉" : "Your request has been successfully sent 😉"}
        </p>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#64748b",
            lineHeight: "1.7",
            fontWeight: "600",
            maxWidth: "600px",
            margin: "0 auto 40px auto"
          }}
        >
          {lang === "AR"
            ? "انتظر رداً. وسوف يتم التواصل معك خلال الـ 24 ساعة القادمة."
            : "Wait for a response. We will contact you within the next 24 hours."}
        </p>

        <Link
          href="/"
          className="awsmd-btn-glow"
          style={{
            background: "#2563eb",
            color: "#ffffff",
            padding: "16px 36px",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)",
            display: "inline-block"
          }}
        >
          {lang === "AR" ? "تصفح بقية الأقسام" : "Explore Portfolio"}
        </Link>
      </div>

      {/* FOOTER INFO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px", width: "100%" }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700" }}>© 2026 Haider Mohamed Shwkat</span>
        
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", display: "block", fontWeight: "700" }}>Stay In Touch</span>
          <a href="mailto:haider.m.shwkat@outlook.com" style={{ fontSize: "14px", color: "#2563eb", fontWeight: "800", textDecoration: "none" }}>
            haider.m.shwkat@outlook.com
          </a>
        </div>
      </div>
    </div>
  );
}
