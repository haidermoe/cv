import type { Metadata } from "next";
import { Tajawal, Outfit } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "حيدر محمد شوكت | أخصائي التجارة الإلكترونية والبيانات",
  description: "خبير متخصص في إدارة وتطوير عمليات التجارة الإلكترونية، تحليل البيانات المحوسبة، وإدارة أنظمة شبكات الـ FTTH بخبرة تتجاوز 6 سنوات في السوق العراقي.",
  keywords: ["حيدر محمد", "تحليل البيانات", "التجارة الإلكترونية", "FTTH", "SQL", "Python", "العراق", "بغداد"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${outfit.variable} dark scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0e0d15] text-slate-100 min-h-screen antialiased selection:bg-blue-500 selection:text-white" style={{ fontFamily: "'Tajawal', 'Outfit', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
