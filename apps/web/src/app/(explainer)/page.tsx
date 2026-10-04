import { WorkflowIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { CoverVisual } from "@/components/slides/CoverVisual";

export default function Cover() {
  return (
    <Stage icon={<WorkflowIcon size={16} />} eyebrow="Una compra, cuatro microservicios" title={<>Saga <span className="text-fg-subtle">vs</span> Circuit Breaker</>} lede="Dos patrones para dos fallas distintas. Cada servicio guarda sus datos en su propia base." steps={2}>
      <CoverVisual />
    </Stage>
  );
}
