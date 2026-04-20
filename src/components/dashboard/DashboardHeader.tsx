import logo from "@/assets/csc-logo.png";
import { Filter, ChevronDown } from "lucide-react";

interface FilterDef {
  label: string;
  value?: string;
}

interface Props {
  filters?: FilterDef[];
}

const DEFAULT_FILTERS: FilterDef[] = [
  { label: "Fecha" },
  { label: "Zona" },
  { label: "Comunidad" },
  { label: "Tipo" },
  { label: "Institución" },
];

export const DashboardHeader = ({
  filters = DEFAULT_FILTERS,
}: Props) => {
  return (
    <header className="px-6 pt-4 pb-3">
      <div className="flex items-start gap-4">
        <img
          src={logo}
          alt="CSC logo"
          width={72}
          height={72}
          className="h-16 w-16 rounded-full object-contain shrink-0"
          loading="lazy"
        />

        <div className="flex-1">
          <div
            className="grid gap-x-4 gap-y-1 items-end"
            style={{ gridTemplateColumns: `48px repeat(${filters.length}, minmax(0,1fr))` }}
          >
            <div />
            {filters.map((f) => (
              <div key={f.label} className="text-center">
                <h2 className="font-serif text-xl font-bold tracking-wide text-foreground/95">
                  {f.label}
                </h2>
              </div>
            ))}

            <div className="flex items-center justify-center text-foreground/70">
              <Filter size={22} />
            </div>
            {filters.map((f, i) => (
              <div
                key={f.label + i}
                className="flex items-center justify-between gap-2 rounded-md bg-background/40 border border-[hsl(215_40%_32%)] px-3 py-2 text-sm text-foreground/85 relative"
              >
                <span>{f.value ?? "Todas"}</span>
                <ChevronDown size={16} className="opacity-70" />
                {i < filters.length - 1 && (
                  <span className="absolute -right-2 top-1 bottom-1 w-px bg-[hsl(215_40%_38%)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};