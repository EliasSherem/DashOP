import { Panel } from "@/components/dashboard/Panel";
import { Building2, Eye, EyeOff, AlertTriangle, HardDrive, CheckCircle2, MousePointerClick } from "lucide-react";

const stat = [
  { v: "61", l: "" },
  { v: "20", l: "32,8%" },
  { v: "7", l: "11,5%" },
  { v: "34", l: "55,7%" },
  { v: "81", l: "" },
  { v: "74,9%", l: "" },
  { v: "5.673", l: "" },
];
const cams = [
  { v: "1.287", l: "" },
  { v: "944", l: "73,3%" },
  { v: "343", l: "26,7%", sub: "187 sin señal" },
  { v: "156", l: "12,1%" },
  { v: "79", l: "sin fallas" },
  { v: "73,2%", l: "Eficiencia histórica prom." },
  { v: "100%", l: "" },
];

const comunidades = [
  { n: "Maguen David", con: 68.1, sin: 18.8, par: 13.2 },
  { n: "Independiente", con: 74.6, sin: 0, par: 15.4 },
  { n: "Kehilá Askenazi", con: 61.3, sin: 28.9, par: 0 },
  { n: "Monte Sinai", con: 83.0, sin: 0, par: 13.5 },
  { n: "Sefaradí", con: 84.9, sin: 0, par: 15.1 },
  { n: "Bet-El", con: 95.0, sin: 0, par: 0 },
  { n: "CSC", con: 100.0, sin: 0, par: 0 },
];

const instituciones = [
  ["Huerta", 85, "y"], ["Bet-el Bosques", 76, "y"], ["Olami", 61, "y"], ["Emuna", 58, "g"],
  ["Sefa", 46, "y"], ["Lev Eliyahu", 44, "y"], ["Bet Hayladim", 43, "y"], ["Yavne", 41, "y"],
  ["Guemaj", 31, "y"], ["Or Hajayim", 27, "y"], ["Estrella", 25, "g"], ["Palma", 25, "y"],
  ["Bet-el Polanco", 20, "g"], ["Depor", 16, "y"], ["Templanza", 16, "y"], ["CMD", 15, "y"],
  ["Shaare", 15, "g"],
] as const;

const Cell = ({ value, label, sub, highlight }: { value: string; label?: string; sub?: string; highlight?: boolean }) => (
  <div className="kpi flex flex-col items-center justify-center px-3 py-3 min-h-[78px] text-center">
    <span className="font-serif text-3xl font-light leading-none">{value}</span>
    {label && <span className={`text-xs mt-1 px-2 py-0.5 rounded ${highlight ? "bg-[hsl(215_50%_30%)]" : ""}`}>{label}</span>}
    {sub && <span className="text-xs mt-1 text-foreground/80">{sub}</span>}
  </div>
);

export const EficienciaPage = () => (
  <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
    <div className="col-span-9 flex flex-col gap-4">
      <div className="grid grid-cols-7 gap-2 text-xs">
        {[
          ["Total", null], ["Con visual", <Eye size={14} />], ["Sin visual", <EyeOff size={14} />], ["Parcial", <AlertTriangle size={14} />],
          ["DVR's", <HardDrive size={14} />], ["UpTime", <CheckCircle2 size={14} />], ["Barridos totales", null],
        ].map(([t, i], idx) => (
          <div key={idx} className="flex items-center justify-center gap-1 text-foreground/85">{i}<span>{t as string}</span></div>
        ))}
      </div>
      <div className="grid grid-cols-[36px_repeat(7,1fr)] gap-2 items-center">
        <div className="text-foreground/85 text-xs flex flex-col items-center gap-1"><Building2 size={20} /><span>Instituciones</span></div>
        {stat.map((s, i) => <Cell key={i} value={s.v} label={s.l} highlight={!!s.l} />)}
        <div className="text-foreground/85 text-xs flex flex-col items-center gap-1 row-start-2 col-start-1"><span className="text-2xl">📷</span><span>Cámaras</span></div>
        {cams.map((s, i) => <Cell key={i} value={s.v} label={s.l} sub={s.sub} highlight={!!s.l && !s.sub} />)}
        <div className="col-start-7 col-span-1 flex justify-around text-xs">
          <span>79 sin fallas</span><span>2 con fallas</span>
        </div>
      </div>
      <Panel title="Relación de cámaras por Comunidad" className="flex-1">
        <div className="grid grid-cols-7 gap-3 h-72 items-end">
          {comunidades.map((c) => {
            const total = c.con + c.sin + c.par;
            return (
              <div key={c.n} className="flex flex-col items-center h-full">
                <div className="flex-1 w-full flex flex-col-reverse rounded overflow-hidden">
                  <div className="bg-[hsl(var(--chart-yellow))] grid place-items-center text-xs text-foreground" style={{ height: `${c.par}%` }}>{c.par > 0 ? `${c.par}%` : ""}</div>
                  <div className="bg-[hsl(var(--chart-red))] grid place-items-center text-xs text-white" style={{ height: `${c.sin}%` }}>{c.sin > 0 ? `${c.sin}%` : ""}</div>
                  <div className="bg-[hsl(var(--chart-green))] grid place-items-center text-xs text-white" style={{ height: `${c.con}%` }}>{c.con}%</div>
                </div>
                <span className="text-xs mt-2">{c.n}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 text-xs mt-2">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-yellow))]" />Parcial</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-red))]" />Sin Conexión</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-green))]" />Con Conexión</span>
        </div>
      </Panel>
      <div className="grid grid-cols-2 gap-4">
        <Panel title="Instituciones por estatus de conexión de cámaras">
          <div className="space-y-2 mt-2">
            {[
              ["Institución", 61, "hsl(var(--chart-blue))"],
              ["ConexionParcial", 34, "hsl(var(--chart-yellow))"],
              ["ConexionTotal", 20, "hsl(var(--chart-green))"],
              ["SinConexion", 7, "hsl(var(--chart-red))"],
            ].map(([n, v, c]: any) => (
              <div key={n} className="flex items-center gap-2">
                <div className="h-4" style={{ width: `${(v / 61) * 80}%`, background: c }} />
                <span className="text-sm">{v}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Botón de pánico" icon={<MousePointerClick size={18} />}>
          <div className="text-center">
            <div className="font-serif text-5xl">3</div>
            <div className="text-sm text-foreground/85 mt-1">Instituciones</div>
            <div className="mt-3 inline-block px-4 py-1 rounded bg-[hsl(215_50%_30%)] font-semibold">4.9%</div>
            <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-foreground/85">
              <span>Falsas alarmas</span><span>Incidentes</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>

    <div className="col-span-3">
      <Panel title="Estatus de cámaras por institución" className="h-full">
        <div className="space-y-1 text-xs">
          {instituciones.map(([n, v, t]) => (
            <div key={n} className="grid grid-cols-[100px_1fr_28px] items-center gap-2">
              <span className="text-right">{n}</span>
              <div className="h-3 bg-background/20"><div className="h-full" style={{ width: `${(v as number / 85) * 100}%`, background: t === "g" ? "hsl(var(--chart-green))" : "hsl(var(--chart-yellow))" }} /></div>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);