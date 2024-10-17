import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const styles = {
  container: "p-4 mt-12",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  card: "bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300",
  cardTitle: "text-xl font-semibold mb-2",
  cardDescription: "text-gray-400",
};

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <Link href="/dashboard/admin/upload">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Upload</h2>
            <p className={styles.cardDescription}>Laden Sie neue Inhalte hoch</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/content-management">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Content Management</h2>
            <p className={styles.cardDescription}>Verwalten Sie Ihre Inhalte</p>
          </div>
        </Link>
      </div>
    </div>
  );
}