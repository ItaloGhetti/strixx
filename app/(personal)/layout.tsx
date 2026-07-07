import { Sidebar } from "@/components/layout/sidebar";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="p-8 lg:p-10">{children}</main>
    </div>
  );
}
