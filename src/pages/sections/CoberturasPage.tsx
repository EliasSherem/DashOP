import { Activity, Clock, Hammer, Star, TableIcon, ToggleLeft } from "lucide-react";
import {
  Area,
  AreaChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardPageMessage, DashboardPageSkeleton } from "@/components/dashboard/PageState";
import { Panel } from "@/components/dashboard/Panel";
import { formatHours, formatInteger } from "@/features/dashboard/format";
import { useCoberturasSection } from "@/features/dashboard/hooks";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
};

export const CoberturasPage = () => {
  const {
    summary,
    isLoading,
    error,
    isSourceTableMismatch,
  } = useCoberturasSection();

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Coberturas"
        description="La vista `vw_turnos_dashboard` no respondió correctamente. Reintenta la consulta o revisa la conexión."
      />
    );
  }

  if (isSourceTableMismatch) {
    return (
      <DashboardPageMessage
        title="La fuente seleccionada no alimenta esta pantalla"
        description="Coberturas está conectada a `shift_log` mediante `vw_turnos_dashboard`. Cambia la fuente global a `Turnos` o a `Todas` para volver a ver métricas."
      />
    );
  }

  if (!summary || summary.totalRows === 0) {
    return (
      <DashboardPageMessage
        title="No hay coberturas para los filtros actuales"
        description="La combinación actual de filtros no devolvió registros en `vw_turnos_dashboard`."
      />
    );
  }

  const maxTurnCount = Math.max(
    ...summary.shiftByRole.map((item) => item.profesional + item.voluntario + item.sinClasificar),
    1,
  );

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            value={formatHours(summary.volunteerAverageHours)}
            label={<>Hrs prom por voluntario<br />(turnos con horas visibles)</>}
            icon={<Clock />}
          />
          <KpiCard value={formatHours(summary.totalHours)} label="Horas totales de cobertura" icon={<Hammer />} />
        </div>

        <Panel title="Coberturas por turno y rol" iconRight={<ToggleLeft size={18} />}>
          <div className="space-y-4 mt-2">
            {summary.shiftByRole.map((item) => (
              <div key={item.name}>
                <span className="text-sm text-foreground/85">{item.name}</span>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 bg-white/80"
                      style={{ width: `${(item.sinClasificar / maxTurnCount) * 100}%` }}
                    />
                    <span>{formatInteger(item.sinClasificar)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 bg-[hsl(var(--chart-purple))]"
                      style={{ width: `${(item.profesional / maxTurnCount) * 100}%` }}
                    />
                    <span>{formatInteger(item.profesional)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 bg-[hsl(var(--chart-yellow))]"
                      style={{ width: `${(item.voluntario / maxTurnCount) * 100}%` }}
                    />
                    <span>{formatInteger(item.voluntario)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-3">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white" />Sin clasificar</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Profesional</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Voluntario</span>
          </div>
        </Panel>

        <Panel title="Horas prom. de cobertura por rol" icon={<TableIcon size={16} />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(215_40%_35%)] text-left">
                <th className="py-2">Rol</th>
                <th className="py-2 text-right">Personas que cubrieron</th>
                <th className="py-2 text-right">Hrs prom por turno</th>
              </tr>
            </thead>
            <tbody>
              {summary.roleTable.map((row, index) => (
                <tr
                  key={row.role}
                  className={index % 2 ? "bg-[hsl(215_50%_28%)]" : "bg-[hsl(215_55%_30%)]"}
                >
                  <td className="py-1.5 px-2">{row.role}</td>
                  <td className="text-right px-2">{formatInteger(row.peopleCount)}</td>
                  <td className="text-right px-2">{formatHours(row.averageHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="col-span-6 flex flex-col gap-4">
        <Panel title="Evolución mensual de horas de cobertura" icon={<Activity size={18} />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyHours} margin={{ top: 25, right: 20, left: 0, bottom: 10 }}>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="profesional"
                  stroke="hsl(var(--chart-purple))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--chart-purple))" }}
                >
                  <LabelList dataKey="profesional" position="top" fill="hsl(var(--foreground))" fontSize={10} formatter={(value: number) => formatInteger(value)} />
                </Line>
                <Line
                  type="monotone"
                  dataKey="voluntario"
                  stroke="hsl(var(--chart-yellow))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--chart-yellow))" }}
                >
                  <LabelList dataKey="voluntario" position="bottom" fill="hsl(var(--foreground))" fontSize={10} formatter={(value: number) => formatInteger(value)} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Profesional</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Voluntario</span>
          </div>
        </Panel>

        <Panel title="Horas cubiertas por comunidad" iconRight={<Clock size={18} />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.communityHours} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-purple))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="hsl(var(--foreground))" fontSize={10} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                <Area type="monotone" dataKey="profesional" stroke="hsl(var(--chart-purple))" strokeWidth={2} fill="url(#profFill)">
                  <LabelList dataKey="profesional" position="top" fill="hsl(var(--foreground))" fontSize={10} formatter={(value: number) => formatInteger(value)} />
                </Area>
                <Line type="monotone" dataKey="voluntario" stroke="hsl(var(--chart-yellow))" strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="col-span-3">
        <Panel title="Estatus de asistencia a coberturas" iconRight={<Star size={18} />} className="h-full">
          <div className="space-y-4 mt-6">
            {summary.attendance.map((row) => (
              <div key={row.status}>
                <span className="text-sm">{row.status}</span>
                <div className="flex h-7 mt-1 rounded overflow-hidden">
                  {row.profesional > 0 ? (
                    <div
                      className="bg-[hsl(var(--chart-purple))] grid place-items-center text-white text-sm font-medium"
                      style={{ width: `${row.total ? (row.profesional / row.total) * 100 : 0}%` }}
                    >
                      {formatInteger(row.profesional)}
                    </div>
                  ) : null}
                  {row.voluntario > 0 ? (
                    <div
                      className="bg-[hsl(var(--chart-yellow))] grid place-items-center text-foreground text-sm font-medium"
                      style={{ width: `${row.total ? (row.voluntario / row.total) * 100 : 0}%` }}
                    >
                      {formatInteger(row.voluntario)}
                    </div>
                  ) : null}
                  {row.sinClasificar > 0 ? (
                    <div
                      className="bg-white/80 grid place-items-center text-foreground text-sm font-medium"
                      style={{ width: `${row.total ? (row.sinClasificar / row.total) * 100 : 0}%` }}
                    >
                      {formatInteger(row.sinClasificar)}
                    </div>
                  ) : null}
                  <div className="grid place-items-center text-sm pl-2">{formatInteger(row.total)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-6">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white" />Sin clasificar</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Profesional</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Voluntario</span>
          </div>
        </Panel>
      </div>
    </div>
  );
};
