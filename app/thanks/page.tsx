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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Client Drawer Tab State
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isClientDrawerClosing, setIsClientDrawerClosing] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const closeClientDrawer = () => {
    setIsClientDrawerClosing(true);
    setTimeout(() => {
      setIsClientDrawerOpen(false);
      setIsClientDrawerClosing(false);
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((res) => {
        if (res.ok) {
          setFormSubmitted(true);
        } else {
          form.submit();
        }
      })
      .catch(() => {
        form.submit();
      });
  };

  const handleLangSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLangAnimating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setLangOrigin({ x, y });
    setIsLangAnimating(true);

    requestAnimationFrame(() => {
      setCircleActive(true);
    });

    // Slow, smooth cinematic expansion (700ms)
    setTimeout(() => {
      setLang((prev) => (prev === "AR" ? "EN" : "AR"));
      setCircleActive(false);

      // Slow, smooth contraction back to tab (700ms)
      setTimeout(() => {
        setIsLangAnimating(false);
      }, 700);
    }, 700);
  };

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
      // Silky smooth inertia lerp factor 0.025 for ultra-professional fluid feel
      currentX += (targetX - currentX) * 0.025;
      currentY += (targetY - currentY) * 0.025;
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
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px clamp(16px, 5vw, 80px)",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflow: "hidden"
      }}
    >
      {/* CIRCULAR LANGUAGE RIPPLE TRANSITION OVERLAY */}
      {isLangAnimating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            background: "#0f111a",
            clipPath: circleActive
              ? `circle(150vmax at ${langOrigin.x}px ${langOrigin.y}px)`
              : `circle(0px at ${langOrigin.x}px ${langOrigin.y}px)`,
            transition: "clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "900",
              letterSpacing: "0.08em",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {lang === "AR" ? "ENGLISH" : "العربية"}
          </span>
        </div>
      )}

      {/* 3D CONCAVE HIGH-DENSITY FINE DOT GRID BACKGROUND LAYER WITH SILKY MOUSE PARALLAX */}
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
            backgroundImage: "radial-gradient(rgba(15, 17, 26, 0.16) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#0f111a", fontSize: "clamp(16px, 4.5vw, 22px)", fontWeight: "900" }}>
          <svg width="22" height="18" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleLangSwitch}
            className="awsmd-btn-glow"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              color: "#0f111a",
              padding: "8px 14px",
              borderRadius: "50px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            {lang === "AR" ? "EN" : "عربي"} ∨
          </button>

          <button
            onClick={() => setIsClientDrawerOpen(true)}
            className="awsmd-royal-client-btn"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span className="flip-box">
              <span className="flip-wrapper">
                <span className="flip-text-primary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
                <span className="flip-text-secondary">+ {lang === "AR" ? "كن عميلاً" : "Become a Client"}</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* 3D JELLYFISH FIXED FULLPAGE VIEWPORT OVERLAY (FLOATS UNBOUNDED OVER ALL SECTIONS - Z-INDEX 10) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100dvw",
          height: "100dvh",
          zIndex: 10,
          pointerEvents: "none",
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
          <JellyfishViewer customColor={jellyColor} materialMode={matMode} />
        </div>
      </div>

      {/* NOOMO LABS SIGNATURE CENTER HERO: GIANT TYPOGRAPHY BEHIND 3D JELLYFISH */}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "68dvh",
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
            fontSize: "clamp(44px, 12vw, 210px)",
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

      {/* BECOME A CLIENT SLIDING DRAWER TAB MODAL */}
      {(isClientDrawerOpen || isClientDrawerClosing) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            justifyContent: lang === "AR" ? "flex-start" : "flex-end"
          }}
        >
          {/* BACKDROP OVERLAY */}
          <div
            onClick={closeClientDrawer}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 17, 26, 0.6)",
              backdropFilter: "blur(8px)",
              opacity: isClientDrawerClosing ? 0 : 1,
              transition: "opacity 0.45s ease"
            }}
          />

          {/* SLIDING PANEL */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "540px",
              height: "100dvh",
              background: "#ffffff",
              color: "#0f111a",
              padding: "45px 35px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: lang === "AR" ? "-20px 0 50px rgba(0,0,0,0.3)" : "20px 0 50px rgba(0,0,0,0.3)",
              zIndex: 2001,
              overflowY: "auto",
              transform: isClientDrawerClosing
                ? lang === "AR" ? "translateX(-100%)" : "translateX(100%)"
                : "translateX(0)",
              transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0f111a", lineHeight: "1.2" }}>
                    {lang === "AR" ? "مرحباً! أخبرنا بكل التفاصيل" : "Hey! Tell us all the things"}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "14.5px", marginTop: "8px", fontWeight: "600" }}>
                    {lang === "AR" ? "يسعدنا التعاون معك لبناء وتطوير حلول برمجية وبيانات استثنائية." : "We'd love to hear about your project and build something amazing together."}
                  </p>
                </div>

                <button
                  onClick={closeClientDrawer}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#0f111a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease",
                    flexShrink: 0
                  }}
                >
                  ✕
                </button>
              </div>

              {formSubmitted ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0", marginTop: "40px" }}>
                  <span style={{ fontSize: "48px", display: "block", marginBottom: "15px" }}>🎉</span>
                  <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#166534" }}>
                    {lang === "AR" ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
                  </h3>
                  <p style={{ color: "#15803d", fontSize: "16px", marginTop: "8px", fontWeight: "600" }}>
                    {lang === "AR" ? "سنقوم بالتواصل معك في أسرع وقت ممكن." : "We will get back to you as soon as possible."}
                  </p>
                </div>
              ) : (
                <form
                  action="https://formsubmit.co/haider.m.shwkat@outlook.com"
                  method="POST"
                  onSubmit={handleFormSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <input type="hidden" name="_subject" value="📩 طلب عمل جديد من صفحة الـ 3D!" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {lang === "AR" ? "الاسم والشركة" : "Name & Company"}
                    </label>
                    <input
                      required
                      type="text"
                      name="الاسم والشركة / Client Name"
                      placeholder={lang === "AR" ? "حيدر من تكنو ستور" : "Haider from Techno Store"}
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {lang === "AR" ? "البريد الإلكتروني" : "Your Email"}
                    </label>
                    <input
                      required
                      type="email"
                      name="البريد الإلكتروني / Client Email"
                      placeholder="haider@example.com"
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "800", marginBottom: "8px", color: "#0f111a" }}>
                      {lang === "AR" ? "أخبرنا المزيد عن مشروعك" : "Tell us more about your project"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="تفاصيل المشروع / Project Details"
                      placeholder={lang === "AR" ? "اكتب تفاصيل مشروعك أو فكرتك المميزة هنا..." : "Write your project details or great ideas here..."}
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "15px",
                        color: "#0f111a",
                        outline: "none",
                        resize: "none"
                      }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginTop: "10px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>
                      haider.m.shwkat@outlook.com
                    </span>

                    <button
                      type="submit"
                      className="awsmd-btn-glow"
                      style={{
                        background: "#0f111a",
                        color: "#ffffff",
                        padding: "14px 28px",
                        borderRadius: "50px",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "14.5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <span>{lang === "AR" ? "إرسال الطلب" : "Submit Request"}</span>
                      <span style={{ fontSize: "18px" }}>←</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
