import logo from "@/assets/csc-logo.png";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardData } from "@/features/dashboard/context/dashboard-context";

const ALL_VALUE = "__all__";

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h2 className="font-serif text-lg font-bold tracking-wide text-foreground/95 text-center">
        {label}
      </h2>
      {children}
    </div>
  );
}

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  value: string | null;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) => onChange(nextValue === ALL_VALUE ? null : nextValue)}
      disabled={disabled}
    >
      <SelectTrigger className="bg-background/40 border-[hsl(215_40%_32%)] text-foreground/90">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const DashboardHeader = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    availableOptions,
    model,
    isLoading,
  } = useDashboardData();

  const dateBounds = model?.dateBounds;

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

        <div className="flex-1 panel px-4 py-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-foreground/80">
              <Filter size={20} />
              <span className="text-sm font-medium tracking-wide">
                Filtros Globales
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters} disabled={isLoading}>
              <RotateCcw size={14} />
              Restablecer
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            <FilterBlock label="Inicio">
              <Input
                type="date"
                value={filters.startDate ?? ""}
                min={dateBounds?.minDate ?? undefined}
                max={dateBounds?.maxDate ?? undefined}
                onChange={(event) => setFilter("startDate", event.target.value || null)}
                className="bg-background/40 border-[hsl(215_40%_32%)] text-foreground/90"
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Fin">
              <Input
                type="date"
                value={filters.endDate ?? ""}
                min={dateBounds?.minDate ?? undefined}
                max={dateBounds?.maxDate ?? undefined}
                onChange={(event) => setFilter("endDate", event.target.value || null)}
                className="bg-background/40 border-[hsl(215_40%_32%)] text-foreground/90"
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Año">
              <FilterSelect
                value={filters.year?.toString() ?? null}
                placeholder="Todos"
                options={availableOptions.years.map((option) => ({
                  value: option.value.toString(),
                  label: option.label,
                }))}
                onChange={(value) => setFilter("year", value ? Number(value) : null)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Mes">
              <FilterSelect
                value={filters.month}
                placeholder="Todos"
                options={availableOptions.months}
                onChange={(value) => setFilter("month", value)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Semana">
              <FilterSelect
                value={filters.week?.toString() ?? null}
                placeholder="Todas"
                options={availableOptions.weeks.map((option) => ({
                  value: option.value.toString(),
                  label: option.label,
                }))}
                onChange={(value) => setFilter("week", value ? Number(value) : null)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Zona">
              <FilterSelect
                value={filters.zoneId}
                placeholder="Todas"
                options={availableOptions.zones.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                onChange={(value) => setFilter("zoneId", value)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Comunidad">
              <FilterSelect
                value={filters.communityId}
                placeholder="Todas"
                options={availableOptions.communities.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                onChange={(value) => setFilter("communityId", value)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Institución">
              <FilterSelect
                value={filters.institutionId}
                placeholder="Todas"
                options={availableOptions.institutions.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                onChange={(value) => setFilter("institutionId", value)}
                disabled={isLoading}
              />
            </FilterBlock>

            <FilterBlock label="Fuente">
              <FilterSelect
                value={filters.sourceTable}
                placeholder="Todas"
                options={availableOptions.sourceTables.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(value) => setFilter("sourceTable", value)}
                disabled={isLoading}
              />
            </FilterBlock>
          </div>
        </div>
      </div>
    </header>
  );
};
