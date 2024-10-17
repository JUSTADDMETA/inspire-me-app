import Link from "next/link";
import HeaderAuth from "@/components/ui/header-auth";
import { EnvVarWarning } from "@/components/ui/env-var-warning";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default function Nav() {
  return (
    <nav className="bg-black absolute top-0 w-full flex justify-center border-b border-b-foreground/10 h-16 z-50">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>JUSTADDSUGAR</Link>
        </div>
        {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
      </div>
    </nav>
  );
}