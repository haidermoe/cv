"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ThanksPage() {
  const [lang, setLang] = useState<"AR" | "EN">("AR");

  return (
    <div
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#0e0d15",
        color: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "30px clamp(20px, 5vw, 60px)",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* BACKGROUND AMBIENT RADIAL GLOW */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1
        }}
      />

      {/* TOP HEADER BAR (AWSMD DARK GLASS FLOATING HEADER) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10 }}>
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#ffffff", fontSize: "20px", fontWeight: "900" }}>
          <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#ffffff"/>
            <rect x="0" y="13" width="16" height="7" fill="#ffffff"/>
            <rect x="10" y="13" width="15" height="7" fill="#60a5fa"/>
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
        </Link>

        {/* CENTER PILL NAV (AWSMD FROSTED GLASS BAR) */}
        <div
          className="desktop-header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            padding: "8px 24px",
            borderRadius: "50px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
          }}
        >
          <Link href="/#about" style={{ textDecoration: "none", color: "#cbd5e1", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "النبذة" : "About Us"}
          </Link>
          <Link href="/#experience" style={{ textDecoration: "none", color: "#cbd5e1", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "الخبرات" : "Experience"}
          </Link>
          <Link href="/#education" style={{ textDecoration: "none", color: "#cbd5e1", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "التعليم" : "Education"}
          </Link>
          <Link href="/#contact" style={{ textDecoration: "none", color: "#cbd5e1", fontWeight: "700", fontSize: "14px" }}>
            {lang === "AR" ? "تواصل معي" : "Contact Us"}
          </Link>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", direction: "ltr" }}>
          <button
            onClick={() => setLang(lang === "AR" ? "EN" : "AR")}
            className="awsmd-btn-glow"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              color: "#60a5fa",
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
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13.5px",
              fontWeight: "800",
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.15)"
            }}
          >
            ← {lang === "AR" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>

      {/* CENTER LUXURY AWSMD THANK YOU CARD / HERO CONTENT */}
      <div style={{ margin: "auto", maxWidth: "720px", textAlign: "center", padding: "60px 20px", zIndex: 10 }}>
        {/* ICON BADGE */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(99, 102, 241, 0.2))",
            border: "1px solid rgba(96, 165, 250, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "42px",
            margin: "0 auto 28px auto",
            boxShadow: "0 15px 35px rgba(37, 99, 235, 0.25)"
          }}
        >
          🚀
        </div>

        <h1
          style={{
            fontSize: "clamp(48px, 9vw, 92px)",
            fontWeight: "900",
            color: "#ffffff",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            marginBottom: "20px"
          }}
        >
          {lang === "AR" ? "شكراً لك !" : "Thank You !"}
        </h1>

        <p
          style={{
            fontSize: "clamp(20px, 3.5vw, 28px)",
            fontWeight: "800",
            color: "#60a5fa",
            marginBottom: "15px",
            lineHeight: "1.3"
          }}
        >
          {lang === "AR" ? "تم إرسال طلبك بنجاح 😉" : "Your request has been successfully sent 😉"}
        </p>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#94a3b8",
            lineHeight: "1.7",
            fontWeight: "600",
            maxWidth: "580px",
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
            background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
            color: "#ffffff",
            padding: "16px 38px",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: "0 12px 35px rgba(37, 99, 235, 0.45)",
            display: "inline-block",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
          {lang === "AR" ? "تصفح بقية الأقسام" : "Explore Portfolio"}
        </Link>
      </div>

      {/* FOOTER INFO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "20px", width: "100%", zIndex: 10 }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>© 2026 Haider Mohamed Shwkat</span>
        
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block", fontWeight: "700" }}>Stay In Touch</span>
          <a href="mailto:haider.m.shwkat@outlook.com" style={{ fontSize: "14px", color: "#60a5fa", fontWeight: "800", textDecoration: "none" }}>
            haider.m.shwkat@outlook.com
          </a>
        </div>
      </div>
    </div>
  );
}
