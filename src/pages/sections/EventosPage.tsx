import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Users, AlertCircle, Activity, Network, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, AreaChart, Area, Tooltip } from "recharts";

const distComunidad = [
  { n: "Bet-El", v: 60, c: "hsl(var(--chart-blue))" },
  { n: "Monte Sinai", v: 50, c: "hsl(var(--chart-brown))" },
  { n: "Independiente", v: 42, c: "hsl(var(--chart-pink))" },
  { n: "Kehilá Ashkenazi", v: 33, c: "hsl(var(--chart-purple))" },
  { n: "Maguen David", v: 25, c: "hsl(var(--chart-red))" },
  { n: "Sefaradi", v: 17, c: "hsl(220 70% 35%)" },
];

const afluencia = [
  { m: "dic 2025", est: 100, real: 80 },
  { m: "ene 2026", est: 300, real: 280 },
  { m: "feb 2026", est: 1200, real: 1100 },
  { m: "mar 2026", est: 2900, real: 4000 },
  { m: "abr 2026", est: 100, real: 50 },
];

const voluntariosTipo = [
  { name: "Entrada a no socios", values: [27, 48, 33, 63] },
  { name: "Exclusivo para socios", values: [22, 18, 23, 36] },
  { name: "Totalmente Abierto", values: [0, 1, 2, 2] },
];
const tipoColors = ["hsl(var(--chart-brown))", "hsl(var(--chart-yellow))", "hsl(var(--chart-red))", "hsl(var(--chart-blue))"];

export const EventosPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    <div className="col-span-3 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <KpiCard value="227" label="Total de eventos" />
        <KpiCard value="294" label="Asistencia estimada prom." icon={<Users />} />
        <KpiCard value="302" label="Total de Voluntarios asignados" />
        <KpiCard value="--" label="Eventos con situación" />
      </div>
      <Panel title="Afluencia real vs. estimada" icon={<Activity size={16} />}>
        <div className="flex justify-center gap-4 text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-orange))]" />Afluencia estimada</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Afluencia real</span></div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={afluencia} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <XAxis dataKey="m" stroke="hsl(var(--foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
              <Line type="monotone" dataKey="est" stroke="hsl(var(--chart-orange))" strokeDasharray="4 3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="real" stroke="hsl(var(--chart-red))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-sm pt-1">
          <span>Margen de error en estimación:</span>
          <span className="px-3 py-1 rounded bg-[hsl(215_50%_28%)] font-semibold">-42,1%</span>
        </div>
      </Panel>
    </div>

    <div className="col-span-5">
      <Panel title="Distribución de eventos por comunidad" className="h-full">
        <div className="h-96 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distComunidad} dataKey="v" innerRadius={70} outerRadius={130} paddingAngle={1} stroke="hsl(var(--background))" strokeWidth={2}>
                {distComunidad.map((d) => <Cell key={d.n} fill={d.c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>

    <div className="col-span-4 flex flex-col gap-4">
      <Panel title="Voluntarios por tipo de evento" iconRight={<ShieldCheck size={18} />}>
        <div className="space-y-3 mt-2">
          {voluntariosTipo.map((t) => {
            const total = t.values.reduce((a, b) => a + b, 0) || 1;
            return (
              <div key={t.name} className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="text-xs text-foreground/85 text-right">{t.name}</span>
                <div className="flex h-8 rounded overflow-hidden">
                  {t.values.map((v, i) => v > 0 && (
                    <div key={i} className="grid place-items-center text-xs text-white" style={{ width: `${(v / total) * 100}%`, background: tipoColors[i] }}>{v}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 text-xs mt-3 flex-wrap">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-brown))]" />Marshall</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Lojem</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Mefaked</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-blue))]" />Protector</span>
        </div>
      </Panel>
      <Panel title="Asignación de personal según afluencia estimada" iconRight={<Network size={18} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={afluencia}>
              <XAxis dataKey="m" stroke="hsl(var(--foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
              <Area type="monotone" dataKey="est" stroke="hsl(var(--chart-pink))" fill="hsl(var(--chart-pink))" fillOpacity={0.4} />
              <Area type="monotone" dataKey="real" stroke="hsl(var(--chart-purple))" fill="hsl(var(--chart-purple))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 bg-[hsl(var(--chart-blue))]" />Voluntarios</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-pink))]" />Flocs</span><span className="flex items-center gap-1"><span className="h-2 w-2 bg-[hsl(var(--chart-green))]" />Miembros CSC</span></div>
      </Panel>
    </div>
  </div>
);