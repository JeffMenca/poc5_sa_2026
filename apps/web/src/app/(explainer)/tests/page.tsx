import { ChecklistIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ChecksVisual } from "@/components/slides/ChecksVisual";

export default function Tests() {
  return (
    <Stage icon={<ChecklistIcon size={16} />} eyebrow="En vivo" title="10 fallas provocadas a propósito" steps={1}>
      <ChecksVisual />
    </Stage>
  );
}
