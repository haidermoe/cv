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
        background: "#ffffff",
        color: "#0f111a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "36px clamp(20px, 6vw, 80px)",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* FLOATING 3D JELLYFISH IN EMPTY SIDE SPACE */}
      <div
        className="jellyfish-side-container"
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          ...(lang === "AR" ? { left: "4vw" } : { right: "4vw" }),
          zIndex: 5,
          pointerEvents: "auto"
        }}
      >
        <JellyfishViewer size={360} />
      </div>

      {/* TOP HEADER BAR (AWSMD EXACT HEADER LAYOUT) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10 }}>
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#0f111a", fontSize: "22px", fontWeight: "900" }}>
          <svg width="24" height="20" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#0f111a"/>
            <rect x="0" y="13" width="16" height="7" fill="#0f111a"/>
            <rect x="10" y="13" width="15" height="7" fill="#4f46e5"/>
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
        </Link>

        {/* CENTER PILL NAV WITH FLIP ROLL TEXT LINKS */}
        <div
          className="desktop-header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            background: "#f1f5f9",
            padding: "10px 28px",
            borderRadius: "50px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
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

        {/* RIGHT TOP ACTIONS WITH ENLARGED ROYAL BLUE SIDE-FILL BUTTON */}
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

          <Link
            href="/"
            className="awsmd-royal-client-btn flip-link-group"
          >
            <span className="flip-wrapper">
              <span className="flip-text-primary" style={{ color: "#0f111a" }}>+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
              <span className="flip-text-secondary" style={{ color: "#ffffff" }}>+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* MAIN HERO CONTENT (MATCHING AWSMD SCREENSHOT) */}
      <div style={{ margin: "auto 0", maxWidth: "680px", textAlign: lang === "AR" ? "right" : "left", zIndex: 10, padding: "40px 0" }}>
        {/* HUGE TITLE WITH INLINE 3D SPINNING TOP VIDEO */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "clamp(56px, 9.5vw, 110px)",
              fontWeight: "900",
              color: "#0f111a",
              lineHeight: "1.0",
              letterSpacing: "-0.03em",
              margin: 0
            }}
          >
            {lang === "AR" ? "شكراً لك !" : "Thank You !"}
          </h1>

          {/* INLINE 3D SPINNING ELEMENT VIDEO */}
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <video
              src="/media/volchek-color.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* SUBTITLE */}
        <p
          style={{
            fontSize: "clamp(22px, 3.5vw, 30px)",
            fontWeight: "800",
            color: "#0f111a",
            marginBottom: "16px",
            lineHeight: "1.25"
          }}
        >
          {lang === "AR" ? "تم إرسال طلبك بنجاح 😉" : "Your request has been successfully sent 🫡"}
        </p>

        {/* DESCRIPTION */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "#64748b",
            lineHeight: "1.65",
            fontWeight: "500",
            maxWidth: "540px",
            margin: "0 0 36px 0"
          }}
        >
          {lang === "AR"
            ? "انتظر رداً. وسوف يتم التواصل معك خلال الـ 24 ساعة القادمة."
            : "Wait for a response from our manager. If the manager didn't answer, he will contact you within the next 24 hours."}
        </p>

        {/* CTA BUTTON */}
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
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)",
            display: "inline-block"
          }}
        >
          ← {lang === "AR" ? "تصفح بقية الأقسام" : "Explore Portfolio"}
        </Link>
      </div>

      {/* FOOTER INFO (AWSMD EXACT FOOTER LAYOUT) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", zIndex: 10, paddingTop: "20px" }}>
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
