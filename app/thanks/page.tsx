"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const JellyfishViewer = dynamic(() => import("../components/JellyfishViewer"), {
  ssr: false
});

export default function ThanksPage() {
  const [lang, setLang] = useState<"AR" | "EN">("EN");

  return (
    <div
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#f2f1f6",
        backgroundImage: "radial-gradient(rgba(15, 17, 26, 0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: "#0f111a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px clamp(20px, 6vw, 80px)",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* TOP HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 30 }}>
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#0f111a", fontSize: "22px", fontWeight: "900" }}>
          <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#0f111a"/>
            <rect x="0" y="13" width="16" height="7" fill="#0f111a"/>
            <rect x="10" y="13" width="15" height="7" fill="#4f46e5"/>
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
        </Link>

        {/* CENTER PILL NAV */}
        <div
          className="desktop-header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            background: "#ffffff",
            padding: "10px 28px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)"
          }}
        >
          <Link href="/#about" className="flip-link-group" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14.5px" }}>
            <span className="flip-wrapper">
              <span className="flip-text-primary">{lang === "AR" ? "النبذة" : "About Us"}</span>
              <span className="flip-text-secondary" style={{ color: "#2563eb" }}>{lang === "AR" ? "النبذة" : "About Us"}</span>
            </span>
          </Link>
          <Link href="/#experience" className="flip-link-group" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14.5px" }}>
            <span className="flip-wrapper">
              <span className="flip-text-primary">{lang === "AR" ? "الخبرات" : "Experience"}</span>
              <span className="flip-text-secondary" style={{ color: "#2563eb" }}>{lang === "AR" ? "الخبرات" : "Experience"}</span>
            </span>
          </Link>
          <Link href="/#education" className="flip-link-group" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14.5px" }}>
            <span className="flip-wrapper">
              <span className="flip-text-primary">{lang === "AR" ? "التعليم" : "Education"}</span>
              <span className="flip-text-secondary" style={{ color: "#2563eb" }}>{lang === "AR" ? "التعليم" : "Education"}</span>
            </span>
          </Link>
          <Link href="/#contact" className="flip-link-group" style={{ textDecoration: "none", color: "#475569", fontWeight: "700", fontSize: "14.5px" }}>
            <span className="flip-wrapper">
              <span className="flip-text-primary">{lang === "AR" ? "تواصل معي" : "Contact Us"}</span>
              <span className="flip-text-secondary" style={{ color: "#2563eb" }}>{lang === "AR" ? "تواصل معي" : "Contact Us"}</span>
            </span>
          </Link>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setLang(lang === "AR" ? "EN" : "AR")}
            className="awsmd-btn-glow"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              color: "#0f111a",
              padding: "10px 18px",
              borderRadius: "50px",
              fontSize: "13.5px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            {lang === "AR" ? "EN" : "عربي"} ∨
          </button>

          <Link href="/" className="awsmd-royal-client-btn">
            <span className="flip-box">
              <span className="flip-wrapper">
                <span className="flip-text-primary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
                <span className="flip-text-secondary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* NOOMO LABS SIGNATURE CENTER HERO: GIANT TYPOGRAPHY BEHIND 3D JELLYFISH */}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "68vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: "auto 0"
        }}
      >
        {/* GIANT BACKGROUND TITLE (BEHIND JELLYFISH - Z-INDEX 1) */}
        <h1
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(85px, 15vw, 210px)",
            fontWeight: "900",
            color: "#0f111a",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            margin: 0,
            lineHeight: "0.9",
            zIndex: 1,
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.95
          }}
        >
          {lang === "AR" ? "شكراً لك !" : "THANK YOU !"}
        </h1>

        {/* CENTERED FLOATING 3D JELLYFISH (IN FRONT OF GIANT TEXT - Z-INDEX 10) */}
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            pointerEvents: "auto"
          }}
        >
          <JellyfishViewer size={750} />
        </div>

        {/* FOREGROUND SUB-CONTENT & CTA BUTTON (IN FRONT - Z-INDEX 20) */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            marginTop: "min(34vh, 320px)",
            maxWidth: "640px",
            marginRight: "auto",
            marginLeft: "auto"
          }}
        >
          <p
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: "800",
              color: "#0f111a",
              marginBottom: "12px",
              lineHeight: "1.25"
            }}
          >
            {lang === "AR" ? "تم إرسال طلبك بنجاح 😉" : "Your request has been successfully sent 🫡"}
          </p>

          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "#64748b",
              lineHeight: "1.6",
              fontWeight: "600",
              marginBottom: "28px"
            }}
          >
            {lang === "AR"
              ? "انتظر رداً. وسوف يتم التواصل معك خلال الـ 24 ساعة القادمة."
              : "Wait for a response from our manager. If the manager didn't answer, he will contact you within the next 24 hours."}
          </p>

          <Link
            href="/"
            className="awsmd-btn-glow"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              padding: "16px 36px",
              borderRadius: "50px",
              fontSize: "15.5px",
              fontWeight: "800",
              textDecoration: "none",
              boxShadow: "0 12px 35px rgba(37, 99, 235, 0.4)",
              display: "inline-block"
            }}
          >
            ← {lang === "AR" ? "تصفح بقية الأقسام" : "Explore Portfolio"}
          </Link>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", zIndex: 30, paddingTop: "20px" }}>
        <span style={{ fontSize: "14px", color: "#0f111a", fontWeight: "800" }}>© 2026 Haider Mohamed Shwkat</span>
        
        <div style={{ textAlign: lang === "AR" ? "left" : "right" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", display: "block", fontWeight: "700", marginBottom: "4px" }}>Stay In Touch</span>
          <a href="mailto:haider.m.shwkat@outlook.com" style={{ fontSize: "14px", color: "#64748b", fontWeight: "700", textDecoration: "none" }}>
            haider.m.shwkat@outlook.com
          </a>
        </div>
      </div>
    </div>
  );
}
