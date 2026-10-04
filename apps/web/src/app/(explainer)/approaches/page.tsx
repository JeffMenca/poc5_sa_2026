import { GitCompareIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ApproachesVisual } from "@/components/slides/ApproachesVisual";

export default function Approaches() {
  return (
    <Stage icon={<GitCompareIcon size={16} />} eyebrow="Saga" title="Dos formas de hacer una saga" steps={1}>
      <ApproachesVisual />
    </Stage>
  );
}
