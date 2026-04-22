import { Award, BarChart3, Clock, DatabaseZap, GraduationCap, Network } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardPageMessage, DashboardPageSkeleton } from "@/components/dashboard/PageState";
import { Panel } from "@/components/dashboard/Panel";
import { formatInteger } from "@/features/dashboard/format";
import { useCapacitacionAvailability } from "@/features/dashboard/hooks";

export const CapacitacionPage = () => {
  const {
    model,
    exposedSourceTables,
    hasTrainingSources,
    isLoading,
    error,
  } = useCapacitacionAvailability();

  if (isLoading && !model) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <DashboardPageMessage
        variant="error"
        title="No fue posible cargar Capacitación"
        description="La capa de filtros no respondió correctamente. Reintenta la consulta o revisa la conexión con Supabase."
      />
    );
  }

  const dateBounds = model?.dateBounds;

  return (
    <div className="grid grid-cols-12 gap-4 px-12 pb-2 flex-1 min-h-0">
      <div className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            value={hasTrainingSources ? "1" : "0"}
            label="Vistas públicas de capacitación expuestas"
            icon={<Clock />}
          />
          <KpiCard
            value={formatInteger(exposedSourceTables.length)}
            label="Fuentes operativas visibles hoy"
            icon={<GraduationCap />}
          />
        </div>

        <Panel title="Estado de integración">
          <div className="space-y-3 text-sm text-foreground/85">
            <p>
              Esta sección ya usa la misma infraestructura real de filtros y backend que el resto del dashboard.
            </p>
            <p>
              Aun así, el frontend público todavía no tiene una vista expuesta para `training_session` ni `kabat_meeting_attendance`.
            </p>
          </div>
        </Panel>

        <Panel title="Rango de datos visible" iconRight={<Award size={18} />}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Inicio</span>
              <span>{dateBounds?.minDate ?? "N/D"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fin</span>
              <span>{dateBounds?.maxDate ?? "N/D"}</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="col-span-6 flex flex-col gap-4">
        <Panel title="Fuentes actualmente expuestas al frontend" icon={<Network size={20} />}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {exposedSourceTables.map((sourceTable) => (
              <div key={sourceTable.value} className="rounded-md border border-[hsl(215_40%_32%)] bg-background/30 px-3 py-2">
                <div className="font-medium">{sourceTable.label}</div>
                <div className="text-xs text-foreground/70">{sourceTable.value}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Qué falta para dejar esta sección completamente live">
          <div className="space-y-4 text-sm text-foreground/90">
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/20 px-4 py-3">
              <div className="font-medium">`training_session`</div>
              <div className="text-xs text-foreground/70 mt-1">
                Requerido para horas-hombre, instructores, categorías y competencias impactadas.
              </div>
            </div>
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/20 px-4 py-3">
              <div className="font-medium">`kabat_meeting_attendance`</div>
              <div className="text-xs text-foreground/70 mt-1">
                Requerido para asistencia mensual y ranking de Kabatim.
              </div>
            </div>
            <p className="text-xs text-foreground/70">
              Mientras esas vistas no estén expuestas, esta pantalla evita valores simulados y muestra únicamente el estado real de disponibilidad del backend.
            </p>
          </div>
        </Panel>
      </div>

      <div className="col-span-3">
        <Panel title="Disponibilidad backend" iconRight={<BarChart3 size={18} />} className="h-full">
          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/25 px-3 py-2">
              <div className="flex items-center justify-between">
                <span>Filtros globales</span>
                <span className="text-[hsl(var(--chart-green))] font-semibold">Listo</span>
              </div>
            </div>
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/25 px-3 py-2">
              <div className="flex items-center justify-between">
                <span>RPC de filtros</span>
                <span className="text-[hsl(var(--chart-green))] font-semibold">Listo</span>
              </div>
            </div>
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/25 px-3 py-2">
              <div className="flex items-center justify-between">
                <span>View de capacitación</span>
                <span className="text-[hsl(var(--chart-red))] font-semibold">Pendiente</span>
              </div>
            </div>
            <div className="rounded-md border border-[hsl(215_40%_32%)] bg-background/25 px-3 py-2">
              <div className="flex items-center justify-between">
                <span>View de Kabatim</span>
                <span className="text-[hsl(var(--chart-red))] font-semibold">Pendiente</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[hsl(215_40%_32%)] bg-background/20 px-4 py-4 text-sm text-foreground/80">
            <DatabaseZap className="mb-3" />
            Sin una vista pública adicional para capacitación, cualquier KPI numérico aquí volvería a ser mock. Esta sección queda aislada hasta que el backend exponga esos datos.
          </div>
        </Panel>
      </div>
    </div>
  );
};
