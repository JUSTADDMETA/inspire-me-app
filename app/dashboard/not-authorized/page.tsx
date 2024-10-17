import Link from "next/link";

export default function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Zugriff verweigert</h1>
      <p className="mb-8">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
    </div>
  );
}