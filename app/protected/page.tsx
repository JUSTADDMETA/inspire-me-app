import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UploadPage from "@/components/UploadPage";
import AdminView from "@/components/AdminView";
import UserManagement from "@/components/UserManagement";

const styles = {
  container: "flex-1 w-full flex flex-col gap-12",
  infoBox: "bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center",
  userDetails: "flex flex-col gap-2 items-start",
  sectionTitle: "font-bold text-2xl mb-4",
  userDetailsPre: "text-xs font-mono p-3 rounded border max-h-32 overflow-auto",
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
      <div>
        <h2 className={styles.sectionTitle}>Upload Files to Supabase Bucket</h2>
        <UploadPage />
        <AdminView />
        <UserManagement />
      </div>
    </div>
  );
}