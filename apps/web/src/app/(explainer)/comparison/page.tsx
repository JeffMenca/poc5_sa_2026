import { GitCompareIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ComparisonVisual } from "@/components/slides/ComparisonVisual";

export default function Comparison() {
  return (
    <Stage icon={<GitCompareIcon size={16} />} eyebrow="Saga vs CB" title="Saga vs Circuit Breaker" steps={3}>
      <ComparisonVisual />
    </Stage>
  );
}
