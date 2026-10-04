import { CodeIcon } from "@primer/octicons-react";
import { SourceCode } from "@/components/code/SourceCode";
import { Stage } from "@/components/deck/Stage";

export default function SagaCode() {
  return (
    <Stage
      icon={<CodeIcon size={16} />}
      eyebrow="Anexo · código"
      title="La saga completa es una lista"
      lede="Archivo real del repositorio, leído al abrir la página."
      steps={4}
    >
      <SourceCode
        file="apps/order-service/src/saga/purchase-steps.ts"
        symbol="PURCHASE_STEPS"
        notes={[
          { match: 'service: "payment"', step: 1, text: "Un paso por servicio. El orden de la lista es el orden de la saga." },
          { match: 'path: "/payments", body', step: 2, text: "action: lo que avanza. Aquí, cobrar." },
          { match: "/refund", step: 3, text: "compensation: lo que lo deshace. Aquí, reembolsar." },
          { match: "order.paymentId = payment.id", step: 4, text: "remember: guarda el id del pago, porque el reembolso lo necesita." },
        ]}
      />
    </Stage>
  );
}
