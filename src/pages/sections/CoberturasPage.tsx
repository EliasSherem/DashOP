import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Hammer, ToggleLeft, Clock, Star, TableIcon, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, AreaChart, Area, LabelList, Tooltip } from "recharts";

const evolucion = [
  { m: "enero", prof: 349, vol: 32 },
  { m: "febrero", prof: 341, vol: 49 },
  { m: "marzo", prof: 201, vol: 84 },
  { m: "abril", prof: 136, vol: 27 },
  { m: "mayo", prof: 200, vol: 31 },
  { m: "junio", prof: 186, vol: 42 },
  { m: "julio", prof: 134, vol: 19 },
  { m: "agosto", prof: 145, vol: 27 },
  { m: "septiembre", prof: 214, vol: 210 },
  { m: "octubre", prof: 193, vol: 128 },
  { m: "noviembre", prof: 166, vol: 24 },
  { m: "diciembre", prof: 161, vol: 31 },
];

const comunidad = [
  { c: "Kehilá A...", prof: 849, vol: 63 },
  { c: "CSC", prof: 538, vol: 17 },
  { c: "Maguen David", prof: 374, vol: 83 },
  { c: "Independiente", prof: 191, vol: 12 },
  { c: "Monte Sinai", prof: 233, vol: 18 },
  { c: "Bet-El", prof: 195, vol: 13 },
  { c: "Sefaradi", prof: 128, vol: 30 },
  { c: "(En blanco)", prof: 82, vol: 24 },
];

const turnos = [
  { name: "Matutino", grey: 81, prof: 5963, vol: 1238 },
  { name: "Vespertino", grey: 328, prof: 2433, vol: 2828 },
  { name: "Nocturno", grey: 18, prof: 978, vol: 349 },
];
const maxTurno = 6500;

export const CoberturasPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    <div className="col-span-3 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <KpiCard value="77,86" label={<>Hrs prom por voluntario<br/>(coberturas de voluntarios)</>} icon={<Clock />} />
        <KpiCard value="3.197" label="Horas totales de cobertura" icon={<Hammer />} />
      </div>
      <Panel title="Coberturas por turno y rol" iconRight={<ToggleLeft size={18} />}>
        <div className="space-y-4 mt-2">
          {turnos.map((t) => (
            <div key={t.name}>
              <span className="text-sm text-foreground/85">{t.name}</span>
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 bg-white/80" style={{ width: `${(t.grey / maxTurno) * 100}%` }} /><span>{t.grey}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 bg-[hsl(var(--chart-purple))]" style={{ width: `${(t.prof / maxTurno) * 100}%` }} /><span>{t.prof.toLocaleString("es")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 bg-[hsl(var(--chart-yellow))]" style={{ width: `${(t.vol / maxTurno) * 100}%` }} /><span>{t.vol.toLocaleString("es")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 text-xs mt-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white" />⬜</span>
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
              <th className="py-2 text-right">Hrs prom por Cobertura</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[hsl(215_55%_30%)]"><td className="py-1.5 px-2">Profesional</td><td className="text-right px-2">37</td><td className="text-right px-2">6,21</td></tr>
            <tr className="bg-[hsl(215_50%_28%)]"><td className="py-1.5 px-2">Voluntario</td><td className="text-right px-2">217</td><td className="text-right px-2">3,83</td></tr>
            <tr className="bg-[hsl(215_55%_30%)] font-semibold"><td className="py-1.5 px-2">Total</td><td className="text-right px-2">254</td><td className="text-right px-2">5,45</td></tr>
          </tbody>
        </table>
      </Panel>
    </div>

    <div className="col-span-6 flex flex-col gap-4">
      <Panel title="Evolución mensual de horas de cobertura" icon={<Activity size={18} />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucion} margin={{ top: 25, right: 20, left: 0, bottom: 10 }}>
              <XAxis dataKey="m" stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="prof" stroke="hsl(var(--chart-purple))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--chart-purple))" }}>
                <LabelList dataKey="prof" position="top" fill="hsl(var(--foreground))" fontSize={10} />
              </Line>
              <Line type="monotone" dataKey="vol" stroke="hsl(var(--chart-yellow))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--chart-yellow))" }}>
                <LabelList dataKey="vol" position="bottom" fill="hsl(var(--foreground))" fontSize={10} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Profesional</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Voluntario</span></div>
      </Panel>
      <Panel title="Horas cubiertas por comunidad" iconRight={<Clock size={18} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={comunidad} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--chart-purple))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="c" stroke="hsl(var(--foreground))" fontSize={10} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
              <Area type="monotone" dataKey="prof" stroke="hsl(var(--chart-purple))" strokeWidth={2} fill="url(#profFill)">
                <LabelList dataKey="prof" position="top" fill="hsl(var(--foreground))" fontSize={10} />
              </Area>
              <Line type="monotone" dataKey="vol" stroke="hsl(var(--chart-yellow))" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>

    <div className="col-span-3">
      <Panel title="Estatus de asistencia a coberturas" iconRight={<Star size={18} />} className="h-full">
        <div className="space-y-4 mt-6">
          <div>
            <span className="text-sm">Asistió</span>
            <div className="flex h-7 mt-1 rounded overflow-hidden">
              <div className="bg-[hsl(var(--chart-purple))] grid place-items-center text-white text-sm font-medium" style={{ width: "70%" }}>8.458</div>
              <div className="bg-[hsl(var(--chart-yellow))] grid place-items-center text-foreground text-sm font-medium" style={{ width: "25%" }}>3.612</div>
              <div className="grid place-items-center text-sm pl-2">12.383</div>
            </div>
          </div>
          <div>
            <span className="text-sm">No asistió</span>
            <div className="flex h-7 mt-1 items-center gap-2">
              <div className="h-full bg-[hsl(var(--chart-purple))] w-2"></div>
              <span className="text-sm">182</span>
            </div>
          </div>
          <div>
            <span className="text-sm">Retardo</span>
            <div className="flex h-7 mt-1 items-center gap-2">
              <div className="h-full bg-[hsl(var(--chart-purple))] w-1"></div>
              <span className="text-sm">7</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-xs mt-6"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white" />⬜</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-purple))]" />Profesional</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Voluntario</span></div>
      </Panel>
    </div>
  </div>
);