"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/treinos", label: "Biblioteca de Treinos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/alunos", label: "Alunos" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col gap-1 bg-black px-4 py-6 text-white">
      <div className="mb-6 px-3 font-display text-xl font-extrabold tracking-tight">
        Str<span className="text-purple-light">i</span>x
      </div>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-white/65 transition-colors duration-150 hover:bg-white/5 hover:text-white",
              active && "bg-purple text-white hover:bg-purple"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
