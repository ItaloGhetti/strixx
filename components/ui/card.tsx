import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "warn" | "neutral";
}) {
  const toneClass = {
    up: "text-success",
    warn: "text-warning",
    neutral: "text-black/50",
  }[deltaTone];

  return (
    <Card>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className={cn("mt-1.5 text-xs font-semibold", toneClass)}>{delta}</div>}
    </Card>
  );
}
