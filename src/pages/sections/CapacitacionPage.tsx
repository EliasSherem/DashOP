import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Clock, GraduationCap, Network, Award, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
  LabelList,
} from "recharts";

const monthly = [
  { m: "enero", v: 31 },
  { m: "febrero", v: 62 },
  { m: "marzo", v: 53 },
  { m: "abril", v: 49 },
  { m: "mayo", v: 26 },
  { m: "junio", v: 12 },
  { m: "julio", v: 23 },
  { m: "octubre", v: 25 },
  { m: "noviembre", v: 30 },
];

const ranking = [
  { name: "Moshe S...", v: 0.91 },
  { name: "Ari Achar", v: 0.86 },
  { name: "Jessica F...", v: 0.86 },
  { name: "Mauricio ...", v: 0.86 },
  { name: "Rafael N...", v: 0.86 },
  { name: "Uri Littman", v: 0.82 },
  { name: "Alberto S...", v: 0.77 },
  { name: "Jonathan...", v: 0.77 },
  { name: "Miriam H...", v: 0.77 },
  { name: "Bernardo...", v: 0.73 },
  { name: "Aaron W...", v: 0.68 },
  { name: "Dylan Levy", v: 0.68 },
  { name: "Eyal Reznik", v: 0.68 },
  { name: "Isaac Yan...", v: 0.68 },
  { name: "Mordejai ...", v: 0.64 },
  { name: "Nathan B...", v: 0.64 },
  { name: "Amos Gur", v: 0.55 },
  { name: "Eliezer G...", v: 0.55 },
  { name: "Nessim K...", v: 0.5 },
  { name: "Michal Pi...", v: 0.18 },
  { name: "Mario Po...", v: 0.14 },
];

export const CapacitacionPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    {/* Left column */}
    <div className="col-span-3 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <KpiCard value="5,10" label={<>Horas-Hombre Capacitación</>} icon={<Clock />} />
        <KpiCard value="35" label={<>Total de personas capacitadas</>} icon={<GraduationCap />} />
      </div>
      <Panel title="Ranking de capacitación de instructores">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-foreground/85 border-b border-[hsl(215_40%_35%)]">
              <th className="text-left py-2 font-medium">Instructor</th>
              <th className="text-right py-2 font-medium">Alcance Capacitación ▾</th>
            </tr>
          </thead>
          <tbody className="text-foreground/90">
            <tr className="border-b border-[hsl(215_40%_35%)]"><td className="py-2">Michal pinski</td><td className="text-right">25</td></tr>
            <tr className="border-b border-[hsl(215_40%_35%)]"><td className="py-2">URI y Gabriel</td><td className="text-right">10</td></tr>
            <tr><td className="py-2 font-semibold">Total</td><td className="text-right font-semibold">35</td></tr>
          </tbody>
        </table>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-foreground/85">Instructores certificados</span>
          <span className="px-3 py-1 rounded bg-background/40 border border-[hsl(215_40%_32%)] text-sm">--</span>
        </div>
      </Panel>
      <Panel title="Cobertura de competencias impactadas" iconRight={<Award size={18} />}>
        <div className="grid grid-cols-2 gap-1 h-32">
          <div className="bg-[hsl(var(--chart-blue))] rounded-l p-3 flex flex-col justify-between text-white">
            <span className="text-sm font-medium">Interrogatorio</span>
            <span>1</span>
          </div>
          <div className="bg-[hsl(var(--chart-orange))] rounded-r p-3 flex flex-col justify-between text-white">
            <span className="text-sm font-medium">Transporte</span>
            <span>1</span>
          </div>
        </div>
      </Panel>
    </div>

    {/* Center column */}
    <div className="col-span-6 flex flex-col gap-4">
      <Panel title="Capacitación por tipo y categoría" icon={<Network size={20} />}>
        <div className="h-44 flex items-center">
          <div className="w-10 text-center text-2xl font-light">H</div>
          <div className="flex-1 flex h-12 rounded overflow-hidden">
            <div className="bg-[hsl(var(--chart-purple))] flex items-center justify-center text-white font-semibold" style={{ width: "28%" }}>10</div>
            <div className="bg-[hsl(var(--chart-cyan))] flex items-center justify-center text-white font-semibold" style={{ width: "72%" }}>25</div>
          </div>
        </div>
        <div className="flex justify-center gap-6 text-sm mt-2">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-magenta))]" />Mixto</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-cyan))]" />Teórico</span>
        </div>
      </Panel>

      <Panel title="Asistencia mensual a reuniones de Kabatim">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="kabatimFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-magenta))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-magenta))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="v" stroke="hsl(var(--chart-magenta))" strokeWidth={2.5} fill="url(#kabatimFill)">
                <LabelList dataKey="v" position="top" fill="hsl(var(--foreground))" fontSize={11} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>

    {/* Right column */}
    <div className="col-span-3">
      <Panel title="Tasa de asistencia a juntas de Kabatim" iconRight={<BarChart3 size={18} />} className="h-full">
        <div className="space-y-1.5 text-sm overflow-auto max-h-[500px] pr-2">
          {ranking.map((r) => (
            <div key={r.name} className="grid grid-cols-[80px_1fr_36px] items-center gap-2">
              <span className="text-foreground/90 text-xs text-right truncate">{r.name}</span>
              <div className="h-4 bg-background/30 rounded-sm overflow-hidden">
                <div className="h-full bg-[hsl(var(--chart-green))]" style={{ width: `${r.v * 100}%` }} />
              </div>
              <span className="text-foreground/90 text-xs">{r.v.toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[hsl(215_40%_35%)] flex items-center justify-between">
          <span className="text-sm">Tasa de asistencia promedio:</span>
          <span className="font-serif text-3xl font-bold text-[hsl(var(--chart-yellow))]">67,3%</span>
        </div>
      </Panel>
    </div>
  </div>
);