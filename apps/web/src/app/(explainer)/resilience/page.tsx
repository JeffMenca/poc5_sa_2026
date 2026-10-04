import { ShieldCheckIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { ResilienceVisual } from "@/components/slides/ResilienceVisual";

export default function Resilience() {
  return (
    <Stage icon={<ShieldCheckIcon size={16} />} eyebrow="Circuit Breaker" title="Cinco capas por llamada" steps={5}>
      <ResilienceVisual />
    </Stage>
  );
}
