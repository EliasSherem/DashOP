import { Award, DoorOpen, Globe, Timer } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
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

const PIE_COLORS = [
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-cyan))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-green))",
  "hsl(var(--chart-yellow))",
  "hsl(var(--chart-red))",
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
};

export const AccesosPage = () => {
  const {
    summary,
    isLoading,
    error,
    isSourceTableMismatch,
  } = useSourceTableSection("access_request");

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Accesos"
        description="La vista pública de operaciones no respondió correctamente. Reintenta la consulta o revisa la conexión con Supabase."
      />
    );
  }

  if (isSourceTableMismatch) {
    return (
      <DashboardPageMessage
        title="La fuente seleccionada no alimenta esta pantalla"
        description="La pantalla de Accesos usa `access_request`. Cambia la fuente global a `Accesos` o a `Todas` para volver a ver métricas."
      />
    );
  }

  if (!summary || summary.totalCount === 0) {
    return (
      <DashboardPageMessage
        title="No hay accesos para los filtros actuales"
        description="La combinación actual de fecha, semana, zona, comunidad o institución no devolvió registros de `access_request`."
      />
    );
  }

  const maxInstitutionCount = Math.max(...summary.topInstitutions.map((item) => item.value), 1);
  const communityPie = summary.topCommunities.slice(0, 6).map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            value={formatInteger(summary.totalCount)}
            label="Total de accesos visibles"
            icon={<DoorOpen />}
          />
          <KpiCard
            value={formatInteger(summary.distinctInstitutions)}
            label="Instituciones con solicitudes"
            icon={<Timer />}
          />
        </div>

        <Panel title="Top 10 de instituciones con solicitudes" icon={<Globe size={18} />} className="flex-1">
          <div className="space-y-2 mt-2">
            {summary.topInstitutions.map((item) => (
              <div key={item.label} className="grid grid-cols-[110px_1fr_44px] items-center gap-2 text-sm">
                <span className="text-right text-foreground/90 truncate">{item.label}</span>
                <div className="h-5 bg-background/20 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--chart-orange))] rounded-sm"
                    style={{ width: `${(item.value / maxInstitutionCount) * 100}%` }}
                  />
                </div>
                <span className="text-foreground/90">{formatInteger(item.value)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="col-span-6 flex flex-col gap-4">
        <Panel title="Distribución de solicitudes por comunidad">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={communityPie}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={105}
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
          <div className="flex justify-center gap-4 text-xs flex-wrap">
            {communityPie.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Evolución mensual de solicitudes" iconRight={<DoorOpen size={18} />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyTrend} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-cyan))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--chart-cyan))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="col-span-3 flex flex-col gap-4">
        <Panel title="Comunidades con más solicitudes" icon={<Award size={18} />}>
          <div className="space-y-2 mt-2 text-sm">
            {summary.topCommunities.slice(0, 8).map((item) => (
              <div key={item.label} className="grid grid-cols-[1fr_48px] items-center gap-2">
                <span className="truncate">{item.label}</span>
                <span className="text-right">{formatInteger(item.value)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Cobertura del dato visible" iconRight={<Timer size={18} />} className="flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(215_40%_35%)] text-left text-foreground/85">
                <th className="py-2">Campo visible</th>
                <th className="py-2 text-right">Registros</th>
                <th className="py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {summary.dataQuality.map((item) => (
                <tr key={item.id ?? item.label} className="border-b border-[hsl(215_40%_35%)] bg-[hsl(215_50%_28%)]/50">
                  <td className="py-1.5 px-2">{item.label}</td>
                  <td className="py-1.5 px-2 text-right">{formatInteger(item.value)}</td>
                  <td className="py-1.5 px-2 text-right">
                    {formatPercent(summary.totalCount ? (item.value / summary.totalCount) * 100 : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-foreground/70 mt-3">
            El frontend público no expone todavía columnas como origen, resolución o duración de visita, así que esta pantalla usa métricas volumétricas reproducibles desde `vw_operaciones_filters`.
          </p>
        </Panel>
      </div>
    </div>
  );
};
