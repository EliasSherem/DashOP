import { AlertCircle, DatabaseZap, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardPageMessageProps {
  title: string;
  description: string;
  variant?: "empty" | "error" | "loading";
}

const ICONS = {
  empty: DatabaseZap,
  error: AlertCircle,
  loading: Loader2,
} as const;

export function DashboardPageMessage({
  title,
  description,
  variant = "empty",
}: DashboardPageMessageProps) {
  const Icon = ICONS[variant];

  return (
    <div className="px-12 pb-4 flex-1">
      <Alert className="panel border-[hsl(215_40%_30%)] bg-[hsl(var(--panel-bg))] text-foreground">
        <Icon className={variant === "loading" ? "animate-spin" : undefined} />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="kpi min-h-[110px] animate-pulse" />
          <div className="kpi min-h-[110px] animate-pulse" />
          <div className="kpi min-h-[110px] animate-pulse" />
          <div className="kpi min-h-[110px] animate-pulse" />
        </div>
        <div className="panel flex-1 animate-pulse" />
      </div>
      <div className="col-span-6 flex flex-col gap-4">
        <div className="panel h-[320px] animate-pulse" />
        <div className="panel h-[260px] animate-pulse" />
      </div>
      <div className="col-span-3 flex flex-col gap-4">
        <div className="panel h-[250px] animate-pulse" />
        <div className="panel flex-1 animate-pulse" />
      </div>
    </div>
  );
}
