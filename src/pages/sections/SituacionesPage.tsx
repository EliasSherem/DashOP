import { AlertTriangle, Building2, Clipboard, Flag, Menu, ShieldCheck, Sun, Timer } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardPageMessage, DashboardPageSkeleton } from "@/components/dashboard/PageState";
import { Panel } from "@/components/dashboard/Panel";
import { formatInteger, formatPercent } from "@/features/dashboard/format";
import { useSourceTableSection } from "@/features/dashboard/hooks";

const COLORS = [
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-green))",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-yellow))",
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
};

export const SituacionesPage = () => {
  const {
    summary,
    isLoading,
    error,
    isSourceTableMismatch,
  } = useSourceTableSection("incident");

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Situaciones"
        description="La vista pública no devolvió información de `incident`. Reintenta la consulta o revisa la conexión."
      />
    );
  }

  if (isSourceTableMismatch) {
    return (
      <DashboardPageMessage
        title="La fuente seleccionada no alimenta esta pantalla"
        description="La pantalla de Situaciones usa `incident`. Cambia la fuente global a `Situaciones` o a `Todas` para volver a ver métricas."
      />
    );
  }

  if (!summary || summary.totalCount === 0) {
    return (
      <DashboardPageMessage
        title="No hay incidentes para los filtros actuales"
        description="La combinación actual de filtros no devolvió registros públicos de incidentes."
      />
    );
  }

  const communityPie = summary.topCommunities.slice(0, 5).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));
  const datedPct = summary.totalCount ? (summary.rowsWithDate / summary.totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-foreground/80 text-center mb-1">Total de situaciones</div>
            <KpiCard value={formatInteger(summary.totalCount)} label="" icon={<Flag />} />
          </div>
          <div>
            <div className="text-xs text-foreground/80 text-center mb-1">Instituciones con situación</div>
            <KpiCard
              value={formatInteger(summary.distinctInstitutions)}
              label={
                <span className="px-2 py-1 rounded bg-[hsl(var(--chart-yellow))] text-foreground font-semibold">
                  {formatPercent(summary.totalCount ? (summary.distinctInstitutions / summary.totalCount) * 100 : 0)}
                </span>
              }
              icon={<Building2 />}
            />
          </div>
          <KpiCard value={formatPercent(datedPct)} label="Incidentes con fecha visible" icon={<Timer />} />
          <KpiCard value={formatInteger(summary.nullDateCount)} label="Incidentes sin fecha visible" icon={<Clipboard />} />
        </div>
        <Panel title="Volumen mensual de incidentes" iconRight={<AlertTriangle size={18} />}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="hsl(var(--chart-orange))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="col-span-5 flex flex-col gap-4">
        <Panel title="Distribución de incidentes por comunidad" icon={<ShieldCheck size={18} />}>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={communityPie}
                  dataKey="value"
                  nameKey="label"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={130}
                  stroke="hsl(var(--background))"
                >
                  {communityPie.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Instituciones con mayor recurrencia" icon={<Menu size={18} />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(215_40%_35%)] text-left">
                <th className="py-2">Institución ▾</th>
                <th className="py-2 text-right">Incidentes</th>
              </tr>
            </thead>
            <tbody>
              {summary.topInstitutions.slice(0, 8).map((item, index) => (
                <tr key={item.label} className={index % 2 ? "bg-[hsl(215_50%_28%)]" : "bg-[hsl(215_55%_30%)]"}>
                  <td className="py-1.5 px-2">{item.label}</td>
                  <td className="py-1.5 px-2 text-right">{formatInteger(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        <Panel title="Comunidades más afectadas" icon={<ShieldCheck size={18} />}>
          <div className="space-y-1.5 mt-2 text-sm">
            {summary.topCommunities.map((item) => {
              const maxValue = summary.topCommunities[0]?.value || 1;

              return (
                <div key={item.label} className="grid grid-cols-[140px_1fr_34px] items-center gap-2">
                  <span className="text-right text-xs">{item.label}</span>
                  <div className="h-4 bg-background/20 rounded-sm">
                    <div
                      className="h-full bg-[hsl(var(--chart-orange))] rounded-sm"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs">{formatInteger(item.value)}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Evolución anual de incidentes" iconRight={<Sun size={18} />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.yearlyTrend}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="hsl(var(--chart-purple))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-foreground/70">
            La vista pública actual no expone severidad, categorías, turnos ni evaluaciones operativas, así que aquí se muestran series reales de incidencia reproducibles desde `vw_operaciones_filters`.
          </p>
        </Panel>
      </div>
    </div>
  );
};
