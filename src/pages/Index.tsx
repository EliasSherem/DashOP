import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageFooter } from "@/components/dashboard/PageFooter";
import { SectionLabel } from "@/components/dashboard/SectionLabel";
import { TopNav } from "@/components/dashboard/TopNav";
import { CapacitacionPage } from "./sections/CapacitacionPage";
import { AccesosPage } from "./sections/AccesosPage";
import { CoberturasPage } from "./sections/CoberturasPage";
import { EventosPage } from "./sections/EventosPage";
import { SituacionesPage } from "./sections/SituacionesPage";
import { EficienciaPage } from "./sections/EficienciaPage";

const SECTIONS = [
  { key: "capacitacion", label: "Capacitación", filters: undefined, Component: CapacitacionPage },
  { key: "accesos", label: "Accesos", filters: [{ label: "Fecha" }], Component: AccesosPage },
  { key: "coberturas", label: "Coberturas", filters: undefined, Component: CoberturasPage },
  { key: "eventos", label: "Análisis de Eventos", filters: undefined, Component: EventosPage },
  { key: "situaciones", label: "Situaciones", filters: undefined, Component: SituacionesPage },
  { key: "eficiencia", label: "vigilancia", filters: [{ label: "Fecha", value: "2026 (Año) + enero (Mes)" }, { label: "Zona" }, { label: "Comunidad" }, { label: "Tipo" }, { label: "Institución" }], Component: EficienciaPage },
] as const;

const Index = () => {
  const [idx, setIdx] = useState(0);
  const current = SECTIONS[idx];
  const Page = current.Component;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <TopNav
        items={SECTIONS.map((s) => s.label)}
        activeIndex={idx}
        onSelect={setIdx}
      />
      <DashboardHeader filters={current.filters as any} />
      <div className="relative flex-1 flex flex-col">
        <SectionLabel label={current.label} />
        <Page />
      </div>
      <PageFooter />
    </div>
  );
};

export default Index;
