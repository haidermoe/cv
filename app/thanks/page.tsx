"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const JellyfishViewer = dynamic(() => import("../components/JellyfishViewer"), {
  ssr: false
});

export default function ThanksPage() {
  const [lang, setLang] = useState<"AR" | "EN">("EN");
  const [jellyColor, setJellyColor] = useState<string | null>("#ff007f"); // Default to Neon Pink matching Noomo Labs screenshot!
  const [matMode, setMatMode] = useState<"solid" | "glass" | "wireframe">("solid");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = x;
      targetY = y;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      dir={lang === "AR" ? "rtl" : "ltr"}
      style={{
        background: "#f2f1f6",
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
      {/* 3D CONCAVE DOT GRID BACKGROUND LAYER WITH DYNAMIC MOUSE PARALLAX TILT */}
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          perspective: "1000px"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: "radial-gradient(rgba(15, 17, 26, 0.22) 2.5px, transparent 2.5px)",
            backgroundSize: "36px 36px",
            transform: `perspective(1000px) rotateX(${16 + mousePos.y * 14}deg) rotateY(${mousePos.x * 16}deg) scale(1.25)`,
            transformOrigin: "center center",
            transition: "transform 0.08s linear",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)"
          }}
        />
      </div>

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
          className="noomo-giant-title-float"
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
          <JellyfishViewer size={750} customColor={jellyColor} materialMode={matMode} />
        </div>

        {/* FOREGROUND SUB-CONTENT & CTA BUTTON (IN FRONT - Z-INDEX 20) */}
        <div
          className="noomo-content-float"
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

      {/* NOOMO LABS SIGNATURE 3D CUSTOMIZER FLOATING WIDGET */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "10px",
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {/* EXPANDABLE COLOR & MATERIAL PALETTE BOX */}
        {isCustomizerOpen && (
          <div
            style={{
              background: "rgba(15, 17, 26, 0.94)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255, 0, 127, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              minWidth: "250px"
            }}
          >
            {/* COLOR PALETTE GRID */}
            <div>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                {lang === "AR" ? "لون القنديل 3D" : "3D Jellyfish Color"}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { color: "#ff007f", label: "Neon Pink" },
                  { color: "#00f0ff", label: "Cyber Cyan" },
                  { color: "#a855f7", label: "Electric Violet" },
                  { color: "#2563eb", label: "Royal Blue" },
                  { color: "#10b981", label: "Emerald Green" },
                  { color: "#f59e0b", label: "Golden Amber" },
                  { color: "#ef4444", label: "Crimson Red" },
                  { color: null, label: "Original" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setJellyColor(item.color)}
                    title={item.label}
                    style={{
                      width: "100%",
                      height: "34px",
                      borderRadius: "10px",
                      border: jellyColor === item.color ? "2.5px solid #ffffff" : "1.5px solid rgba(255,255,255,0.15)",
                      background: item.color ? item.color : "linear-gradient(135deg, #e087ff 0%, #00f0ff 100%)",
                      cursor: "pointer",
                      transform: jellyColor === item.color ? "scale(1.08)" : "scale(1)",
                      transition: "all 0.2s ease",
                      boxShadow: jellyColor === item.color ? "0 4px 12px rgba(255,255,255,0.3)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "12px"
                    }}
                  >
                    {item.color === null && "🌈"}
                  </button>
                ))}
              </div>
            </div>

            {/* MATERIAL RENDER MODE */}
            <div>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                {lang === "AR" ? "نوع الخامة" : "Material Mode"}
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { id: "solid", label: lang === "AR" ? "صلب ✦" : "Solid ✦" },
                  { id: "glass", label: lang === "AR" ? "زجاج ✧" : "Glass ✧" },
                  { id: "wireframe", label: lang === "AR" ? "شبكي ⬡" : "Wireframe ⬡" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMatMode(m.id as any)}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: matMode === m.id ? "#2563eb" : "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM TRIGGER PILL BUTTON */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* RESET BUTTON */}
          <button
            onClick={() => {
              setJellyColor("#ff007f");
              setMatMode("solid");
            }}
            title="Reset"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "#0f111a",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
            }}
          >
            ↺
          </button>

          {/* CUSTOMIZE ME PILL BUTTON */}
          <button
            onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
            style={{
              background: "#0f111a",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "11px 22px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "900",
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ fontSize: "16px" }}>🪼</span>
            <span>CUSTOMIZE ME</span>
            <span style={{ fontSize: "10px", opacity: 0.7 }}>{isCustomizerOpen ? "▼" : "▲"}</span>
          </button>
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
