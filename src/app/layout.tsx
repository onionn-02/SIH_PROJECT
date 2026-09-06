import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/shared/site-nav";
import { AuthProvider } from "@/lib/auth/auth-context";
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
  title: "Fasal Flow",
  description: "Farmer procurement scheduling, queue and status tracking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved/system theme before first paint, so there's no flash of the wrong colors. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
