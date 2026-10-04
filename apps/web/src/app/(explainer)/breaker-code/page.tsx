import { ZapIcon } from "@primer/octicons-react";
import { SourceCode } from "@/components/code/SourceCode";
import { Stage } from "@/components/deck/Stage";

export default function BreakerCode() {
  return (
    <Stage icon={<ZapIcon size={16} />} eyebrow="Anexo · código" title="El breaker de Mollitia" steps={2}>
      <SourceCode
        file="apps/order-service/src/resilience/resilient-dependency.ts"
        symbol="createBreaker"
        notes={[
          { match: "new SlidingCountBreaker", step: 1, text: "Ventana por cantidad de llamadas, igual que pide el enunciado." },
          { match: "onError: isTechnicalFailure", step: 2, text: "Aquí se decide qué cuenta como falla: solo los errores técnicos." },
        ]}
      />
    </Stage>
  );
}
