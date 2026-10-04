import { ZapIcon } from "@primer/octicons-react";
import { Stage } from "@/components/deck/Stage";
import { BreakerStory } from "@/components/slides/BreakerStory";

export default function CircuitBreaker() {
  return (
    <Stage
      icon={<ZapIcon size={16} />}
      eyebrow="Circuit Breaker"
      title={<>Como el <span className="text-accent">breaker</span> de la casa</>}
      lede="Si algo hace corto, corta la corriente antes de que se queme todo."
      steps={3}
    >
      <BreakerStory />
    </Stage>
  );
}
