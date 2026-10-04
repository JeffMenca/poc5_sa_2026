import { GoalIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { BreakerConfigVisual } from "@/components/slides/BreakerConfigVisual";

export default function BreakerConfig() {
  return (
    <Stage icon={<GoalIcon size={16} />} eyebrow="Circuit Breaker" title="Cómo decide cortar" steps={1}>
      <BreakerConfigVisual />
    </Stage>
  );
}
