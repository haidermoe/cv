import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8691099548:AAHub3cQvf3c_YRUOMtBkxRUW69khkCeqZ0";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6915067646";

// Cache recently notified IPs to avoid spamming the user on refreshes (5-minute cooldown per IP)
const recentVisitors = new Map<string, number>();

function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function parseUserAgent(ua: string) {
  let browser = "متصفح غير معروف";
  let os = "نظام غير معروف";
  let device = "كمبيوتر / Desktop 💻";

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? "جهاز لوحي / Tablet 📱" : "هاتف ذكي / Mobile 📱";
  }

  if (/iPhone/i.test(ua)) os = "iOS (iPhone)";
  else if (/iPad/i.test(ua)) os = "iPadOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//i.test(ua)) browser = "Google Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Apple Safari";
  else if (/Firefox\//i.test(ua)) browser = "Mozilla Firefox";
  else if (/Opera|OPR\//i.test(ua)) browser = "Opera";

  return { browser, os, device };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      referrer = "",
      pathname = "/",
      screen = "",
      language = "",
      timezone = "",
      searchParams = "",
    } = body;

    // Extract Client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const ip = rawIp.replace(/^::ffff:/, "");

    // Ignore known bots or health checkers
    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot/i.test(ua)) {
      return NextResponse.json({ ok: true, ignored: "bot" });
    }

    // Cooldown check (5 minutes per IP to prevent spamming on rapid reload)
    const now = Date.now();
    const lastVisit = recentVisitors.get(ip);
    if (lastVisit && now - lastVisit < 5 * 60 * 1000) {
      return NextResponse.json({ ok: true, skipped: "cooldown" });
    }
    recentVisitors.set(ip, now);

    // Clean up old entries from memory cache
    if (recentVisitors.size > 1000) {
      for (const [key, time] of recentVisitors.entries()) {
        if (now - time > 10 * 60 * 1000) {
          recentVisitors.delete(key);
        }
      }
    }

    // Geolocation from Vercel headers or fallback IP API
    let country = req.headers.get("x-vercel-ip-country") || "";
    let city = req.headers.get("x-vercel-ip-city") || "";
    let region = req.headers.get("x-vercel-ip-country-region") || "";
    let isp = "";

    if ((!country || country === "ZZ") && ip && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            country = geoData.countryCode || geoData.country || "";
            city = geoData.city || "";
            region = geoData.regionName || "";
            isp = geoData.isp || "";
          }
        }
      } catch (err) {
        console.error("Geo lookup error:", err);
      }
    }

    const flag = getCountryFlag(country);
    const { browser, os, device } = parseUserAgent(ua);

    // Source / Referrer Beautification
    let referrerLabel = "دخول مباشر (Direct / Bookmark)";
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        if (refUrl.hostname.includes("github.com")) {
          referrerLabel = `🐙 GitHub (${refUrl.pathname})`;
        } else if (refUrl.hostname.includes("linkedin.com")) {
          referrerLabel = "💼 LinkedIn";
        } else if (refUrl.hostname.includes("google.")) {
          referrerLabel = "🔍 بحث Google";
        } else if (refUrl.hostname.includes("t.me") || refUrl.hostname.includes("telegram.org")) {
          referrerLabel = "✈️ Telegram";
        } else if (refUrl.hostname.includes("instagram.com")) {
          referrerLabel = "📸 Instagram";
        } else if (refUrl.hostname.includes("facebook.com")) {
          referrerLabel = "📘 Facebook";
        } else if (refUrl.hostname.includes("x.com") || refUrl.hostname.includes("twitter.com")) {
          referrerLabel = "🐦 X (Twitter)";
        } else {
          referrerLabel = `🔗 ${refUrl.hostname}`;
        }
      } catch {
        referrerLabel = `🔗 ${referrer}`;
      }
    }

    // Format local Baghdad/Iraq time or UTC
    const baghdadTime = new Intl.DateTimeFormat("ar-IQ", {
      timeZone: "Asia/Baghdad",
      dateStyle: "full",
      timeStyle: "medium",
      hour12: true,
    }).format(new Date());

    const locationText = [city, region, country].filter(Boolean).join("، ") || "غير محدد";

    // Build Telegram Message
    const messageLines = [
      `🔔 <b>زائر جديد لملفك الشخصي (CV)!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🕒 <b>الوقت:</b> ${baghdadTime}`,
      `🔗 <b>المصدر (Referrer):</b> ${referrerLabel}`,
      ...(referrer ? [`🌐 <b>الرابط الكامل:</b> <code>${referrer}</code>`] : []),
      `📄 <b>الصفحة:</b> <code>${pathname}${searchParams ? `?${searchParams}` : ""}</code>`,
      `📍 <b>الموقع التقديري:</b> ${flag} ${locationText}`,
      ...(isp ? [`🏢 <b>شبكة الإنترنت:</b> ${isp}`] : []),
      `📱 <b>نوع الجهاز:</b> ${device}`,
      `💻 <b>المتصفح والنظام:</b> ${os} | ${browser}`,
      ...(screen ? [`🖥️ <b>دقة الشاشة:</b> ${screen}`] : []),
      ...(language ? [`🗣️ <b>لغة الجهاز:</b> ${language}`] : []),
      `🌐 <b>عنوان IP:</b> <code>${ip}</code>`,
      `━━━━━━━━━━━━━━━━━━`,
    ];

    const messageText = messageLines.join("\n");

    // Target chat id
    let targetChatId = TELEGRAM_CHAT_ID;

    if (!targetChatId) {
      // Auto-fetch latest chat_id who sent /start to the bot
      try {
        const updateRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
        if (updateRes.ok) {
          const updateData = await updateRes.json();
          if (updateData.result && updateData.result.length > 0) {
            // Find most recent message with a valid chat id
            for (let i = updateData.result.length - 1; i >= 0; i--) {
              const u = updateData.result[i];
              const chatId = u.message?.chat?.id || u.channel_post?.chat?.id || u.my_chat_member?.chat?.id;
              if (chatId) {
                targetChatId = String(chatId);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to auto-detect chat_id:", err);
      }
    }

    if (targetChatId) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: messageText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
    }

    return NextResponse.json({ ok: true, sent: !!targetChatId });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
