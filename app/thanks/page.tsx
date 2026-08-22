"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const JellyfishViewer = dynamic(() => import("../components/JellyfishViewer"), {
  ssr: false,
});

export default function ThanksPage() {
  const [lang, setLang] = useState<"AR" | "EN">("EN");
  const [jellyColor] = useState<string | null>("#ff007f");
  const [matMode] = useState<"solid" | "glass" | "wireframe">("solid");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleCheckDesktop = () => {
      setIsDesktop(window.innerWidth > 960);
    };
    handleCheckDesktop();
    window.addEventListener("resize", handleCheckDesktop);
    return () => window.removeEventListener("resize", handleCheckDesktop);
  }, []);

  // Circular Language Transition Ripple State
  const [isLangAnimating, setIsLangAnimating] = useState(false);
  const [langOrigin, setLangOrigin] = useState({ x: 0, y: 0 });
  const [circleActive, setCircleActive] = useState(false);

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
      headers: { Accept: "application/json" },
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

    // Smooth cinematic expansion (700ms)
    setTimeout(() => {
      setLang((prev) => (prev === "AR" ? "EN" : "AR"));
      setCircleActive(false);

      setTimeout(() => {
        setIsLangAnimating(false);
      }, 700);
    }, 700);
  };

  useEffect(() => {
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
        padding: isDesktop ? "20px clamp(16px, 5vw, 80px)" : "16px 14px 20px",
        position: "relative",
        fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
        overflowX: "hidden",
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
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "900",
              letterSpacing: "0.08em",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {lang === "AR" ? "ENGLISH" : "العربية"}
          </span>
        </div>
      )}

      {/* 3D CONCAVE HIGH-DENSITY FINE DOT GRID BACKGROUND LAYER */}
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          perspective: "1000px",
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
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.15) 100%)",
          }}
        />
      </div>

      {/* TOP HEADER BAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          zIndex: 30,
          gap: "8px",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            color: "#0f111a",
            fontSize: "clamp(14px, 3.6vw, 20px)",
            fontWeight: "900",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="16" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="8" height="10" fill="#0f111a" />
            <rect x="0" y="13" width="16" height="7" fill="#0f111a" />
            <rect x="10" y="13" width="15" height="7" fill="#4f46e5" />
          </svg>
          <span>{lang === "AR" ? "حيدر محمد" : "Haider Mohamed"}</span>
        </Link>

        {/* CENTER PILL NAV - HIDDEN ON MOBILE VIA CSS */}
        <div
          className="desktop-header-nav"
          style={{
            display: isDesktop ? "flex" : "none",
            alignItems: "center",
            gap: "28px",
            background: "#ffffff",
            padding: "10px 28px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid rgba(15, 17, 26, 0.06)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={handleLangSwitch}
            className="awsmd-btn-glow"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              color: "#0f111a",
              padding: isDesktop ? "7px 14px" : "6px 10px",
              borderRadius: "50px",
              fontSize: isDesktop ? "12px" : "11px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {lang === "AR" ? "EN" : "عربي"} ∨
          </button>

          <button
            onClick={() => setIsClientDrawerOpen(true)}
            className="awsmd-royal-client-btn"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span className="flip-box">
              <span className="flip-wrapper">
                <span className="flip-text-primary">
                  + {isDesktop ? (lang === "AR" ? "كن عميلاً" : "Become a Client") : (lang === "AR" ? "تواصل" : "Client")}
                </span>
                <span className="flip-text-secondary">
                  + {isDesktop ? (lang === "AR" ? "كن عميلاً" : "Become a Client") : (lang === "AR" ? "تواصل" : "Client")}
                </span>
              </span>
            </span>
          </button>
        </div>
      </header>

      {/* 3D JELLYFISH FIXED FULLPAGE OVERLAY (PERFECTLY CENTERED & ELEVATED ON MOBILE) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100dvw",
          height: "100dvh",
          zIndex: 10,
          pointerEvents: "none",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
          <JellyfishViewer
            customColor={jellyColor}
            materialMode={matMode}
            positionX={isDesktop ? (lang === "AR" ? 1.5 : 0) : 0}
            positionY={isDesktop ? -0.18 : 0}
            scaleMultiplier={isDesktop ? 1.15 : 1.05}
          />
        </div>
      </div>

      {/* HERO SECTION CONTAINER */}
      <main
        style={{
          position: "relative",
          width: "100%",
          minHeight: "72dvh",
          display: "flex",
          flexDirection: isDesktop ? (lang === "AR" ? "row-reverse" : "row") : "column",
          alignItems: "center",
          justifyContent: isDesktop ? "space-between" : "center",
          margin: "auto 0",
          zIndex: 20,
        }}
      >
        {/* DESKTOP LEFT COLUMN SPACER FOR 3D JELLYFISH */}
        {isDesktop && <div style={{ flex: "1 1 45%", minHeight: "100px" }} />}

        {/* CONTENT COLUMN: GIANT TYPOGRAPHY & SUBTEXT */}
        <div
          className="noomo-content-float"
          style={{
            position: "relative",
            zIndex: 20,
            flex: isDesktop ? "1 1 55%" : "1 1 100%",
            maxWidth: isDesktop ? "650px" : "100%",
            width: "100%",
            textAlign: isDesktop ? (lang === "AR" ? "right" : "left") : "center",
            display: "flex",
            flexDirection: "column",
            alignItems: isDesktop ? (lang === "AR" ? "flex-end" : "flex-start") : "center",
            paddingRight: isDesktop && lang === "EN" ? "20px" : "0",
            paddingLeft: isDesktop && lang === "AR" ? "20px" : "0",
            marginTop: isDesktop ? "0" : "min(40vh, 370px)",
          }}
        >
          {/* GIANT TITLE */}
          <h1
            className="noomo-giant-title-float"
            style={{
              fontSize: isDesktop ? "clamp(48px, 6.5vw, 120px)" : "clamp(32px, 8.8vw, 60px)",
              fontWeight: "900",
              color: "#0f111a",
              letterSpacing: "-0.03em",
              margin: "0 0 10px 0",
              lineHeight: "1.05",
              zIndex: 1,
              userSelect: "none",
              textShadow: "0 2px 24px rgba(242, 241, 246, 0.95), 0 0 40px rgba(255, 255, 255, 0.8)",
            }}
          >
            {lang === "AR" ? "شكراً لك !" : "THANK YOU !"}
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              fontSize: isDesktop ? "clamp(20px, 2.5vw, 26px)" : "clamp(16px, 4.4vw, 20px)",
              fontWeight: "800",
              color: "#0f111a",
              marginBottom: "8px",
              lineHeight: "1.3",
              textShadow: "0 2px 16px rgba(242, 241, 246, 0.9)",
            }}
          >
            {lang === "AR" ? "تم إرسال طلبك بنجاح 🚀" : "Your request has been successfully sent 🚀"}
          </p>

          {/* DESCRIPTION */}
          <p
            style={{
              fontSize: isDesktop ? "clamp(15px, 1.5vw, 17.5px)" : "14px",
              color: "#475569",
              lineHeight: "1.6",
              fontWeight: "600",
              marginBottom: isDesktop ? "32px" : "22px",
              maxWidth: "460px",
              textShadow: "0 1px 12px rgba(242, 241, 246, 0.9)",
            }}
          >
            {lang === "AR"
              ? "شكراً لاهتمامك. سيتم مراجعة طلبك والتواصل معك خلال الـ 24 ساعة القادمة."
              : "Wait for a response from our manager. If the manager didn't answer, he will contact you within the next 24 hours."}
          </p>

          {/* EXPLORE PORTFOLIO CTA */}
          <Link
            href="/"
            className="awsmd-btn-glow"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              padding: isDesktop ? "16px 38px" : "13px 30px",
              borderRadius: "50px",
              fontSize: isDesktop ? "15.5px" : "14.5px",
              fontWeight: "800",
              textDecoration: "none",
              boxShadow: "0 12px 35px rgba(37, 99, 235, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {lang === "AR" ? "← تصفح بقية الأقسام" : "Explore Portfolio →"}
          </Link>
        </div>
      </main>

      {/* FOOTER INFO */}
      <footer
        style={{
          display: "flex",
          flexDirection: isDesktop ? "row" : "column-reverse",
          justifyContent: "space-between",
          alignItems: isDesktop ? "flex-end" : "center",
          width: "100%",
          zIndex: 30,
          paddingTop: "16px",
          gap: isDesktop ? "0" : "10px",
          textAlign: isDesktop ? (lang === "AR" ? "left" : "right") : "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>
          © 2026 Haider Mohamed Shwkat
        </span>

        <div>
          <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "700", marginBottom: "2px" }}>
            Stay In Touch
          </span>
          <a
            href="mailto:haider.m.shwkat@outlook.com"
            style={{ fontSize: "13px", color: "#0f111a", fontWeight: "800", textDecoration: "none" }}
          >
            haider.m.shwkat@outlook.com
          </a>
        </div>
      </footer>

      {/* BECOME A CLIENT SLIDING DRAWER TAB MODAL */}
      {(isClientDrawerOpen || isClientDrawerClosing) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            justifyContent: lang === "AR" ? "flex-start" : "flex-end",
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
              transition: "opacity 0.45s ease",
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
              padding: isDesktop ? "45px 35px" : "30px 20px",
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
              fontFamily: lang === "AR" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
                <div>
                  <h2 style={{ fontSize: isDesktop ? "30px" : "24px", fontWeight: "900", color: "#0f111a", lineHeight: "1.2" }}>
                    {lang === "AR" ? "مرحباً! أخبرنا بكل التفاصيل" : "Hey! Tell us all the things"}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px", fontWeight: "600" }}>
                    {lang === "AR" ? "يسعدنا التعاون معك لبناء وتطوير حلول برمجية وبيانات استثنائية." : "We'd love to hear about your project and build something amazing together."}
                  </p>
                </div>

                <button
                  onClick={closeClientDrawer}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#0f111a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>

              {formSubmitted ? (
                <div style={{ padding: "35px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #bbf7d0", marginTop: "30px" }}>
                  <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>🎉</span>
                  <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#166534" }}>
                    {lang === "AR" ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
                  </h3>
                  <p style={{ color: "#15803d", fontSize: "15px", marginTop: "6px", fontWeight: "600" }}>
                    {lang === "AR" ? "سنقوم بالتواصل معك في أسرع وقت ممكن." : "We will get back to you as soon as possible."}
                  </p>
                </div>
              ) : (
                <form
                  action="https://formsubmit.co/haider.m.shwkat@outlook.com"
                  method="POST"
                  onSubmit={handleFormSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "18px" }}
                >
                  <input type="hidden" name="_subject" value="📩 طلب عمل جديد من صفحة الـ 3D!" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {lang === "AR" ? "الاسم والشركة" : "Name & Company"}
                    </label>
                    <input
                      required
                      type="text"
                      name="الاسم والشركة / Client Name"
                      placeholder={lang === "AR" ? "حيدر من تكنو ستور" : "Haider from Techno Store"}
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {lang === "AR" ? "البريد الإلكتروني" : "Your Email"}
                    </label>
                    <input
                      required
                      type="email"
                      name="البريد الإلكتروني / Client Email"
                      placeholder="haider@example.com"
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "800", marginBottom: "6px", color: "#0f111a" }}>
                      {lang === "AR" ? "أخبرنا المزيد عن مشروعك" : "Tell us more about your project"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="تفاصيل المشروع / Project Details"
                      placeholder={lang === "AR" ? "اكتب تفاصيل مشروعك أو فكرتك المميزة هنا..." : "Write your project details or great ideas here..."}
                      style={{
                        width: "100%",
                        padding: "13px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "14.5px",
                        color: "#0f111a",
                        outline: "none",
                        resize: "none",
                      }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "6px" }}>
                    <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "700" }}>
                      haider.m.shwkat@outlook.com
                    </span>

                    <button
                      type="submit"
                      className="awsmd-btn-glow"
                      style={{
                        background: "#0f111a",
                        color: "#ffffff",
                        padding: "12px 24px",
                        borderRadius: "50px",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{lang === "AR" ? "إرسال الطلب" : "Submit Request"}</span>
                      <span style={{ fontSize: "16px" }}>←</span>
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
