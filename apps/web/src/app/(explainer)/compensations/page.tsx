import { UndoIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { CompensationsVisual } from "@/components/slides/CompensationsVisual";

export default function Compensations() {
  return (
    <Stage
      icon={<UndoIcon size={16} />}
      eyebrow="Saga"
      title={<>Cada acción tiene su <span className="text-severe">contrario</span></>}
      lede="Nada se borra: el pago queda como REFUNDED, igual que en un estado de cuenta."
      steps={1}
    >
      <CompensationsVisual />
    </Stage>
  );
}
