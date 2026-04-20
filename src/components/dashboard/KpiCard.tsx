import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  align?: "row" | "stack";
}

export const KpiCard = ({
  value,
  label,
  icon,
  className,
  valueClassName,
  align = "row",
}: Props) => {
  return (
    <div className={cn("kpi p-5 flex items-center justify-between gap-3 min-h-[110px]", className)}>
      <div className={cn(align === "stack" ? "flex flex-col" : "flex flex-col")}>
        <span className={cn("font-serif text-5xl font-light leading-none text-foreground", valueClassName)}>
          {value}
        </span>
        <span className="mt-2 text-sm text-foreground/85 leading-tight max-w-[160px]">
          {label}
        </span>
      </div>
      {icon && <div className="text-foreground/80 text-3xl shrink-0">{icon}</div>}
    </div>
  );
};