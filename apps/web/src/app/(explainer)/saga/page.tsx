import { UndoIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { SagaVisual } from "@/components/slides/SagaVisual";

export default function Saga() {
  return (
    <Stage
      icon={<UndoIcon size={16} />}
      eyebrow="Saga"
      title={<>Cada paso sabe <span className="text-severe">deshacerse</span></>}
      steps={3}
    >
      <SagaVisual />
    </Stage>
  );
}
