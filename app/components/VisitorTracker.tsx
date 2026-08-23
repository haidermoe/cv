"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Check if already tracked in this session to prevent spamming
    const sessionKey = "haider_cv_visit_logged";
    const alreadyTracked = sessionStorage.getItem(sessionKey);

    // Track on first entry or if referrer changed
    const currentReferrer = document.referrer || "";
    const lastReferrer = sessionStorage.getItem("haider_cv_last_referrer");

    if (alreadyTracked && lastReferrer === currentReferrer) {
      return;
    }

    sessionStorage.setItem(sessionKey, "true");
    sessionStorage.setItem("haider_cv_last_referrer", currentReferrer);

    const payload = {
      referrer: currentReferrer,
      pathname: window.location.pathname,
      searchParams: window.location.search,
      hash: window.location.hash,
      href: window.location.href,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || (navigator.languages && navigator.languages[0]) || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };

    try {
      fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => console.debug("Track error:", err));
    } catch {
      // Silently catch in case of network restriction
    }
  }, []);

  return null;
}
