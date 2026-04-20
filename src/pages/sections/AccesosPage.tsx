import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DoorOpen, Timer, Globe, Award, Monitor, Code2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const origins = [
  { c: "USA", v: 167 },
  { c: "MÉXICO", v: 35 },
  { c: "Canadá", v: 24 },
  { c: "ISRAEL", v: 23 },
  { c: "Argentina", v: 6 },
  { c: "FRANCIA", v: 6 },
  { c: "SUECIA", v: 5 },
  { c: "Australia", v: 4 },
  { c: "Costa Rica", v: 4 },
  { c: "IRÁN", v: 4 },
];
const max = Math.max(...origins.map((o) => o.v));

const resoluciones = [
  { name: "Limpio", value: 178, color: "hsl(var(--chart-green))", pct: "53,61%" },
  { name: "En investigación", value: 74, color: "hsl(var(--chart-blue))", pct: "22,29%" },
  { name: "(En blanco)", value: 52, color: "hsl(0 0% 85%)", pct: "15,66%" },
  { name: "Denegado", value: 28, color: "hsl(var(--chart-red))", pct: "8,43%" },
];

const tipos = [
  { name: "LINK", values: [50, 71, 175, 0], totalDanger: true },
  { name: "FISICO", values: [2, 3, 3, 3] },
  { name: "DIRECTO KBT", values: [0, 2, 0, 0] },
];
const tipoColors = ["hsl(0 0% 90%)", "hsl(var(--chart-red))", "hsl(var(--chart-blue))", "hsl(var(--chart-green))"];

const operadores = [
  { n: "REBECA", v: 92 },
  { n: "LUNA", v: 75 },
  { n: "", v: 63 },
  { n: "ALLISON", v: 19 },
  { n: "AARON", v: 12 },
  { n: "LUNA y REBECA", v: 9 },
  { n: "LUNA y REBECA", v: 4 },
  { n: "AARON/LUNA", v: 2 },
  { n: "ARI", v: 1 },
];

export const AccesosPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    <div className="col-span-3 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <KpiCard value="332" label="Total Accesos Solicitados" icon={<DoorOpen />} />
        <KpiCard value="" label="Duración prom. de visita" icon={<Timer />} />
      </div>
      <Panel title="Top 10 de Lugares de Origen de solicitudes" icon={<Globe size={18} />} className="flex-1">
        <div className="space-y-2 mt-2">
          {origins.map((o) => (
            <div key={o.c} className="grid grid-cols-[90px_1fr_40px] items-center gap-2 text-sm">
              <span className="text-right text-foreground/90">{o.c}</span>
              <div className="h-5 bg-background/20 rounded-sm">
                <div className="h-full bg-[hsl(var(--chart-orange))] rounded-sm" style={{ width: `${(o.v / max) * 100}%` }} />
              </div>
              <span className="text-foreground/90">{o.v}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>

    <div className="col-span-6 flex flex-col gap-4">
      <Panel title="Resoluciones emitidas de CR a accesos solicitados">
        <div className="h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={resoluciones} dataKey="value" innerRadius={0} outerRadius={110} stroke="hsl(var(--background))" strokeWidth={2}>
                {resoluciones.map((r) => <Cell key={r.name} fill={r.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Pie labels approximation */}
          <div className="absolute top-2 right-12 text-xs text-foreground">28 (8,43%)</div>
          <div className="absolute top-10 right-2 text-xs text-foreground">52 (15,66%)</div>
          <div className="absolute bottom-12 left-12 text-xs text-foreground">74 (22,29%)</div>
          <div className="absolute bottom-12 right-12 text-xs text-foreground">178 (53,61%)</div>
        </div>
        <div className="flex justify-center gap-4 text-xs flex-wrap">
          {resoluciones.map((r) => (
            <span key={r.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Tipo de solicitud de acceso por resolución" iconRight={<Monitor size={18} />}>
        <div className="space-y-3">
          {tipos.map((t) => {
            const total = t.values.reduce((a, b) => a + b, 0) || 1;
            return (
              <div key={t.name} className="grid grid-cols-[80px_1fr] items-center gap-3">
                <span className="text-sm text-foreground/90">{t.name}</span>
                <div className="flex h-9 rounded overflow-hidden">
                  {t.values.map((v, i) =>
                    v > 0 ? (
                      <div key={i} className="grid place-items-center text-xs font-medium text-foreground" style={{ width: `${(v / total) * 100}%`, background: tipoColors[i], color: i === 0 ? "hsl(var(--background))" : "white" }}>{v}</div>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 text-xs mt-3 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" />(En blanco)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Denegado</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-blue))]" />En investigación</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-green))]" />Limpio</span>
        </div>
      </Panel>
    </div>

    <div className="col-span-3 flex flex-col gap-4">
      <Panel title="Top 5 de Instituciones de visita" icon={<Award size={18} />}>
        <div className="grid grid-cols-3 grid-rows-2 gap-1 h-44 text-white text-xs">
          <div className="col-span-1 row-span-2 bg-[hsl(260_40%_55%)] p-2 flex flex-col justify-between"><span className="font-medium">BET EL</span><span>131</span></div>
          <div className="col-span-1 bg-[hsl(var(--chart-orange))] p-2 flex flex-col justify-between"><span className="font-medium">Maguen D...</span><span>49</span></div>
          <div className="col-span-1 bg-[hsl(0_0%_75%)] p-2 flex flex-col justify-between text-foreground"><span className="font-medium">(En blanco)</span><span>48</span></div>
          <div className="col-span-1 bg-[hsl(var(--chart-cyan))] p-2 flex flex-col justify-between"><span className="font-medium">CDI</span><span>16</span></div>
          <div className="col-span-1 bg-[hsl(var(--chart-magenta))] p-2 flex flex-col justify-between"><span className="font-medium">Parral</span><span>14</span></div>
        </div>
      </Panel>
      <Panel title="Accesos pre-autorizados por Operador" iconRight={<Code2 size={18} />} className="flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(215_40%_35%)] text-left text-foreground/85">
              <th className="py-2">Operador CR pre-autorización</th>
              <th className="py-2 text-right"># Resoluciones CR ▾</th>
            </tr>
          </thead>
          <tbody>
            {operadores.map((o, i) => (
              <tr key={i} className="border-b border-[hsl(215_40%_35%)] bg-[hsl(215_50%_28%)]/50">
                <td className="py-1.5 px-2">{o.n || "\u00A0"}</td>
                <td className="py-1.5 px-2 text-right">{o.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  </div>
);