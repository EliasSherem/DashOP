import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageFooter } from "@/components/dashboard/PageFooter";
import { SectionLabel } from "@/components/dashboard/SectionLabel";
import { TopNav } from "@/components/dashboard/TopNav";
import { DashboardDataProvider } from "@/features/dashboard/context/dashboard-context";
import { CapacitacionPage } from "./sections/CapacitacionPage";
import { AccesosPage } from "./sections/AccesosPage";
import { CoberturasPage } from "./sections/CoberturasPage";
import { EventosPage } from "./sections/EventosPage";
import { SituacionesPage } from "./sections/SituacionesPage";
import { EficienciaPage } from "./sections/EficienciaPage";

const SECTIONS = [
  { key: "capacitacion", label: "Capacitación", Component: CapacitacionPage },
  { key: "accesos", label: "Accesos", Component: AccesosPage },
  { key: "coberturas", label: "Coberturas", Component: CoberturasPage },
  { key: "eventos", label: "Análisis de Eventos", Component: EventosPage },
  { key: "situaciones", label: "Gestión de situaciones", Component: SituacionesPage },
  { key: "eficiencia", label: "Eficiencia Tecnológica", Component: EficienciaPage },
] as const;

const Index = () => {
  const [idx, setIdx] = useState(0);
  const current = SECTIONS[idx];
  const Page = current.Component;

  return (
    <DashboardDataProvider>
      <div className="min-h-screen bg-background flex flex-col relative">
        <TopNav
          items={SECTIONS.map((s) => s.label)}
          activeIndex={idx}
          onSelect={setIdx}
        />
        <DashboardHeader />
        <div className="relative flex-1 flex flex-col">
          <SectionLabel label={current.label} />
          <Page />
        </div>
        <PageFooter />
      </div>
    </DashboardDataProvider>
  );
};

export default Index;
