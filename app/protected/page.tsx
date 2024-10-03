import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import DragAndDropUpload from "@/components/trend/DragAndDropUpload";

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
      <div className="w-full">
        <div className={styles.infoBox}>
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div className={styles.userDetails}>
        <h2 className={styles.sectionTitle}>Your user details</h2>
        <pre className={styles.userDetailsPre}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className={styles.sectionTitle}>Next steps lol</h2>
        <FetchDataSteps />
      </div>
      <div>
        <h2 className={styles.sectionTitle}>Upload Files to Supabase Bucket</h2>
        <DragAndDropUpload />
      </div>
    </div>
  );
}