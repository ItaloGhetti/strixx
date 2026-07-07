"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/hoje", label: "Hoje" },
  { href: "/dieta", label: "Dieta" },
  { href: "/progresso", label: "Progresso" },
  { href: "/meus-treinos", label: "Treinos" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-border bg-white px-2 pb-3.5 pt-2.5">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 text-center text-[10.5px] font-semibold text-black/35",
              active && "text-purple"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
