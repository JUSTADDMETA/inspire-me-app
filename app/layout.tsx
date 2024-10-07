import React, { Suspense } from 'react';
import DeployButton from "@/components/deploy-button";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

// Memoize components to prevent unnecessary re-renders
const MemoizedNav = React.memo(Nav);
const MemoizedFooter = React.memo(Footer);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className=" flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <Suspense fallback={<div>Loading...</div>}>
                <MemoizedNav />
                <div className="flex flex-col w-full">
                  {children}
                </div>
                <MemoizedFooter />
              </Suspense>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}