import React from "react";
import Link from "next/link";

const styles = {
  container: "flex h-screen",
  sidebar: "pt-24 w-64 bg-gray-800 text-white flex flex-col p-4",
  mainContent: "flex-1 p-8",
  link: "text-white hover:bg-gray-700 p-2 rounded",
  sectionTitle: "font-bold text-2xl mb-4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

        <div className={styles.container}>
          <aside className={styles.sidebar}>
            <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className={styles.link}>
                Overview
              </Link>
              <Link href="/dashboard/admin/upload" className={styles.link}>
                Upload
              </Link>
              <Link href="/dashboard/admin/content-management" className={styles.link}>
                Content Management
              </Link>
            </nav>
          </aside>
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
  );
}