import { AlertTriangle, Building2, CheckCircle2, Eye, HardDrive, MousePointerClick } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardPageMessage, DashboardPageSkeleton } from "@/components/dashboard/PageState";
import { Panel } from "@/components/dashboard/Panel";
import { formatInteger, formatPercent } from "@/features/dashboard/format";
import { useSourceTableSection } from "@/features/dashboard/hooks";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
};

const StatCell = ({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) => (
  <div className="kpi flex flex-col items-center justify-center px-3 py-3 min-h-[78px] text-center">
    <span className="font-serif text-3xl font-light leading-none">{value}</span>
    <span className="text-xs mt-1 px-2 py-0.5 rounded bg-[hsl(215_50%_30%)]">{label}</span>
    {sub ? <span className="text-xs mt-1 text-foreground/80">{sub}</span> : null}
  </div>
);

export const EficienciaPage = () => {
  const {
    summary,
    isLoading,
    error,
    isSourceTableMismatch,
  } = useSourceTableSection("surveillance_snapshot");

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Eficiencia Tecnológica"
        description="La vista pública no devolvió información de `surveillance_snapshot`. Reintenta la consulta o revisa la conexión."
      />
    );
  }

  if (isSourceTableMismatch) {
    return (
      <DashboardPageMessage
        title="La fuente seleccionada no alimenta esta pantalla"
        description="La pantalla de Eficiencia usa `surveillance_snapshot`. Cambia la fuente global a `Eficiencia` o a `Todas` para volver a ver métricas."
      />
    );
  }

  if (!summary || summary.totalCount === 0) {
    return (
      <DashboardPageMessage
        title="No hay snapshots tecnológicos para los filtros actuales"
        description="La combinación actual de filtros no devolvió registros públicos de monitoreo."
      />
    );
  }

  const visibleDatePct = summary.totalCount ? (summary.rowsWithDate / summary.totalCount) * 100 : 0;
  const visibleInstitutionPct = summary.totalCount ? (summary.dataQuality[2]?.value / summary.totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-9 flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-2 text-xs">
          {[
            ["Snapshots", null],
            ["Instituciones", <Building2 size={14} />],
            ["Comunidades", <Eye size={14} />],
            ["Zonas", <Eye size={14} />],
            ["Con fecha", <CheckCircle2 size={14} />],
            ["Sin fecha", <AlertTriangle size={14} />],
            ["Semanas", <HardDrive size={14} />],
          ].map(([title, icon], index) => (
            <div key={index} className="flex items-center justify-center gap-1 text-foreground/85">
              {icon}
              <span>{title as string}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[36px_repeat(7,1fr)] gap-2 items-center">
          <div className="text-foreground/85 text-xs flex flex-col items-center gap-1">
            <Building2 size={20} />
            <span>Visible</span>
          </div>
          <StatCell value={formatInteger(summary.totalCount)} label="Total" />
          <StatCell value={formatInteger(summary.distinctInstitutions)} label="Activas" />
          <StatCell value={formatInteger(summary.distinctCommunities)} label="Activas" />
          <StatCell value={formatInteger(summary.distinctZones)} label="Activas" />
          <StatCell value={formatPercent(visibleDatePct)} label="Con fecha" />
          <StatCell value={formatInteger(summary.nullDateCount)} label="Sin fecha" />
          <StatCell value={formatInteger(summary.weeklyTrend.length)} label="Con actividad" />
        </div>

        <Panel title="Relación de actividad visible por comunidad" className="flex-1">
          <div className="grid grid-cols-7 gap-3 h-72 items-end">
            {summary.topCommunities.slice(0, 7).map((item) => {
              const pct = summary.totalCount ? (item.value / summary.totalCount) * 100 : 0;

              return (
                <div key={item.label} className="flex flex-col items-center h-full">
                  <div className="flex-1 w-full flex flex-col-reverse rounded overflow-hidden bg-background/20">
                    <div
                      className="bg-[hsl(var(--chart-green))] grid place-items-center text-xs text-white"
                      style={{ height: `${Math.max(pct, 6)}%` }}
                    >
                      {formatPercent(pct)}
                    </div>
                  </div>
                  <span className="text-xs mt-2 text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-green))]" />
              Participación sobre snapshots visibles
            </span>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-4">
          <Panel title="Evolución mensual de snapshots visibles">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthlyTrend}>
                  <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-cyan))"
                    fill="hsl(var(--chart-cyan))"
                    fillOpacity={0.35}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Cobertura visible del dataset" icon={<MousePointerClick size={18} />}>
            <div className="text-center">
              <div className="font-serif text-5xl">{formatPercent(visibleInstitutionPct)}</div>
              <div className="text-sm text-foreground/85 mt-1">Snapshots con institución visible</div>
              <div className="mt-3 inline-block px-4 py-1 rounded bg-[hsl(215_50%_30%)] font-semibold">
                {formatInteger(summary.dataQuality[2]?.value ?? 0)} registros
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-foreground/85">
                <span>Con comunidad: {formatInteger(summary.dataQuality[3]?.value ?? 0)}</span>
                <span>Con zona: {formatInteger(summary.dataQuality[4]?.value ?? 0)}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="col-span-3">
        <Panel title="Instituciones con actividad de monitoreo" className="h-full">
          <div className="space-y-1 text-xs">
            {summary.topInstitutions.slice(0, 15).map((item) => {
              const maxValue = summary.topInstitutions[0]?.value || 1;

              return (
                <div key={item.label} className="grid grid-cols-[104px_1fr_28px] items-center gap-2">
                  <span className="text-right truncate">{item.label}</span>
                  <div className="h-3 bg-background/20">
                    <div
                      className="h-full bg-[hsl(var(--chart-yellow))]"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span>{formatInteger(item.value)}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};
