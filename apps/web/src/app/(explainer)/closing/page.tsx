import { HeartIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ClosingVisual } from "@/components/slides/ClosingVisual";

export default function Closing() {
  return (
    <Stage icon={<HeartIcon size={16} />} eyebrow="Saga vs CB" title="Tres ideas para llevarse">
      <ClosingVisual />
    </Stage>
  );
}
