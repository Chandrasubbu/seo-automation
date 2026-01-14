import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Automation Platform",
  description: "AI-powered SEO strategy, content optimization, and competitive analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-900`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300 ease-in-out">
              {/* Mobile header spacer if needed, or just padding */}
              <div className="p-4 md:p-8 pt-16 md:pt-8">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
