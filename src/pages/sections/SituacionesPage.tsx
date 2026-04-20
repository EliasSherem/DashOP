import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Flag, Building2, Timer, Clipboard, AlertTriangle, ShieldCheck, Sun, Menu } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LabelList, Tooltip } from "recharts";

const gravedad = [
  { m: "diciembre 2025", media: 8, baja: 2, alta: 0 },
  { m: "enero", media: 10, baja: 2, alta: 0 },
  { m: "febrero 2026", media: 7, baja: 0, alta: 1 },
  { m: "marzo", media: 1, baja: 0, alta: 0 },
];

const categoria = [
  { n: "Pinta", v: 14 },
  { n: "Persona", v: 4 },
  { n: "Acceso", v: 2 },
  { n: "Llamada extorsión", v: 2 },
  { n: "Agresión", v: 1 },
  { n: "Amenaza", v: 1 },
  { n: "Coche", v: 1 },
  { n: "Grupo", v: 1 },
  { n: "Incendio", v: 1 },
  { n: "Insultos", v: 1 },
  { n: "Localización", v: 1 },
];

const turnoDist = [
  { n: "Vespertino", v: 23, c: "hsl(var(--chart-purple))" },
  { n: "Matutino", v: 7, c: "hsl(var(--chart-blue))" },
  { n: "Nocturno", v: 1, c: "hsl(var(--chart-green))" },
];

const indice = [
  { name: "v", value: 45, color: "hsl(var(--chart-yellow))" },
  { name: "rest", value: 55, color: "hsl(0 0% 90%)" },
];

export const SituacionesPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    <div className="col-span-3 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-foreground/80 text-center mb-1">Total de situaciones</div>
          <KpiCard value="31" label="" icon={<Flag />} />
        </div>
        <div>
          <div className="text-xs text-foreground/80 text-center mb-1">Instituciones con situación</div>
          <KpiCard value="12" label={<span className="px-2 py-1 rounded bg-[hsl(var(--chart-yellow))] text-foreground font-semibold">54,8%</span>} icon={<Building2 />} />
        </div>
        <KpiCard value="3,7" label={<>Velocidad prom. de atención en CR (min)</>} icon={<Timer />} />
        <KpiCard value="4,06" label={<><span className="text-2xl">/ 5</span><br/>Evaluación prom. de reacción Operadores</>} icon={<Clipboard />} />
      </div>
      <Panel title="Gravedad de situaciones por mes" iconRight={<AlertTriangle size={18} />}>
        <div className="flex justify-end gap-3 text-xs mb-1">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Alta</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Baja</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-orange))]" />Media</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gravedad} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="m" stroke="hsl(var(--foreground))" fontSize={10} />
              <YAxis hide />
              <Bar dataKey="media" stackId="a" fill="hsl(var(--chart-orange))"><LabelList dataKey="media" position="center" fill="white" fontSize={11} /></Bar>
              <Bar dataKey="baja" stackId="a" fill="hsl(var(--chart-yellow))"><LabelList dataKey="baja" position="center" fill="hsl(var(--background))" fontSize={11} /></Bar>
              <Bar dataKey="alta" stackId="a" fill="hsl(var(--chart-red))"><LabelList dataKey="alta" position="center" fill="white" fontSize={11} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>

    <div className="col-span-5 flex flex-col gap-4">
      <Panel title="Índice de Resolución de situaciones" icon={<ShieldCheck size={18} />}>
        <div className="h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={indice} dataKey="value" startAngle={180} endAngle={0} innerRadius={80} outerRadius={130} stroke="hsl(var(--background))">
                {indice.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <span className="font-serif text-6xl font-bold mt-12">45%</span>
          </div>
          <div className="absolute bottom-2 left-8 text-sm">0%</div>
          <div className="absolute bottom-2 right-8 text-sm">100%</div>
        </div>
      </Panel>
      <Panel title="Estatus de Instituciones con situación" icon={<Menu size={18} />}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(215_40%_35%)] text-left">
              <th className="py-2">Institución/Ubic ▾</th><th className="py-2 text-right">Abierta</th><th className="py-2 text-right">Resuelta</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Yavne", "1", ""],["Tepoz", "", "2"],["Sin Institución", "10", "7"],["Shuva Israel", "", "1"],["Secretaría de Marina", "", "1"],["Ramat", "", "1"],
            ].map(([n, a, r], i) => (
              <tr key={i} className={i % 2 ? "bg-[hsl(215_50%_28%)]" : "bg-[hsl(215_55%_30%)]"}>
                <td className="py-1.5 px-2">{n}</td><td className="py-1.5 px-2 text-right">{a}</td><td className="py-1.5 px-2 text-right">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>

    <div className="col-span-4 flex flex-col gap-4">
      <Panel title="Frecuencia de situaciones por categoría" icon={<ShieldCheck size={18} />}>
        <div className="space-y-1.5 mt-2 text-sm">
          {categoria.map((c) => (
            <div key={c.n} className="grid grid-cols-[140px_1fr_30px] items-center gap-2">
              <span className="text-right text-xs">{c.n}</span>
              <div className="h-4 bg-background/20 rounded-sm"><div className="h-full bg-[hsl(var(--chart-orange))] rounded-sm" style={{ width: `${(c.v / 14) * 100}%` }} /></div>
              <span className="text-xs">{c.v}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 text-xs mt-2"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Alta</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Baja</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-orange))]" />Media</span></div>
      </Panel>
      <Panel title="Ocurrencia de situaciones por turno" iconRight={<Sun size={18} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={turnoDist} dataKey="v" outerRadius={90} stroke="hsl(var(--background))">
                {turnoDist.map((d) => <Cell key={d.n} fill={d.c} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Vespertino</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-blue))]" />Matutino</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-green))]" />Nocturno</span></div>
      </Panel>
    </div>
  </div>
);