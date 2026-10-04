import { AlertIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ProblemVisual } from "@/components/slides/ProblemVisual";

export default function Problem() {
  return (
    <Stage icon={<AlertIcon size={16} />} eyebrow="Escenario" title="Dos fallas distintas" steps={2}>
      <ProblemVisual />
    </Stage>
  );
}
