import { Activity, CalendarRange, Network, ShieldCheck, Users } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { formatDecimal, formatInteger } from "@/features/dashboard/format";
import { useSourceTableSection } from "@/features/dashboard/hooks";

const COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-brown))",
  "hsl(var(--chart-pink))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-red))",
  "hsl(var(--chart-yellow))",
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
};

export const EventosPage = () => {
  const {
    summary,
    isLoading,
    error,
    isSourceTableMismatch,
  } = useSourceTableSection("event_record");

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Eventos"
        description="La vista pública no devolvió información de `event_record`. Reintenta la consulta o revisa la conexión."
      />
    );
  }

  if (isSourceTableMismatch) {
    return (
      <DashboardPageMessage
        title="La fuente seleccionada no alimenta esta pantalla"
        description="La pantalla de Eventos usa `event_record`. Cambia la fuente global a `Eventos` o a `Todas` para volver a ver métricas."
      />
    );
  }

  if (!summary || summary.totalCount === 0) {
    return (
      <DashboardPageMessage
        title="No hay eventos para los filtros actuales"
        description="La combinación actual de filtros no devolvió registros públicos de eventos."
      />
    );
  }

  const averagePerMonth = summary.monthlyTrend.length ? summary.totalCount / summary.monthlyTrend.length : 0;
  const communityPie = summary.topCommunities.slice(0, 6).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard value={formatInteger(summary.totalCount)} label="Total de eventos visibles" />
          <KpiCard value={formatDecimal(averagePerMonth, 1)} label="Promedio por mes activo" icon={<Users />} />
          <KpiCard value={formatInteger(summary.distinctInstitutions)} label="Instituciones con eventos" />
          <KpiCard value={formatInteger(summary.distinctCommunities)} label="Comunidades activas" icon={<CalendarRange />} />
        </div>

        <Panel title="Evolución semanal de eventos" icon={<Activity size={16} />}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.weeklyTrend} margin={{ top: 12, right: 12, left: 0, bottom: 10 }}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-orange))"
                  fill="hsl(var(--chart-orange))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="col-span-5">
        <Panel title="Distribución de eventos por comunidad" className="h-full">
          <div className="h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={communityPie}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={1}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
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
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        <Panel title="Instituciones con mayor volumen de eventos" iconRight={<ShieldCheck size={18} />}>
          <div className="space-y-3 mt-2">
            {summary.topInstitutions.slice(0, 8).map((item) => {
              const maxValue = summary.topInstitutions[0]?.value || 1;

              return (
                <div key={item.label} className="grid grid-cols-[120px_1fr_40px] items-center gap-2">
                  <span className="text-xs text-foreground/85 text-right truncate">{item.label}</span>
                  <div className="h-8 rounded overflow-hidden bg-background/30">
                    <div
                      className="h-full grid place-items-center text-xs text-white bg-[hsl(var(--chart-brown))]"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    >
                      {formatInteger(item.value)}
                    </div>
                  </div>
                  <span className="text-xs text-right">{formatInteger(item.value)}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Evolución mensual de eventos" iconRight={<Network size={18} />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrend}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-pink))"
                  fill="hsl(var(--chart-pink))"
                  fillOpacity={0.35}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-foreground/70">
            La vista pública actual no expone afluencia real/estimada ni voluntarios asignados; por eso esta pantalla usa series reales de volumen, comunidad e institución.
          </p>
        </Panel>
      </div>
    </div>
  );
};
