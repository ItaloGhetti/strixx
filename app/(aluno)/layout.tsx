import { BottomNav } from "@/components/layout/bottom-nav";

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gray-light">
      <main className="flex-1 overflow-auto p-4">{children}</main>
      <BottomNav />
    </div>
  );
}
