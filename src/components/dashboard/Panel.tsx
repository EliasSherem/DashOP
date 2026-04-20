import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title?: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Panel = ({ title, icon, iconRight, children, className, bodyClassName }: Props) => (
  <section className={cn("panel p-4 flex flex-col", className)}>
    {(title || icon || iconRight) && (
      <header className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-foreground/85">
          {icon}
        </div>
        <h3 className="panel-title text-center flex-1">{title}</h3>
        <div className="text-foreground/80">{iconRight}</div>
      </header>
    )}
    <div className={cn("flex-1 min-h-0", bodyClassName)}>{children}</div>
  </section>
);