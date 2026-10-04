import { WorkflowIcon } from "@primer/octicons-react";
import { SourceCode } from "@/components/code/SourceCode";
import { Stage } from "@/components/deck/Stage";
import { OrchestratorCode } from "@/components/slides/OrchestratorCode";

const FILE = "apps/order-service/src/saga/purchase-saga.ts";

export default function Orchestrator() {
  return (
    <Stage icon={<WorkflowIcon size={16} />} eyebrow="Anexo · código" title="El orquestador: dos ciclos" steps={5}>
      <OrchestratorCode
        switchAt={3}
        forward={
          <SourceCode
            file={FILE}
            symbol="place"
            notes={[
              { match: "for (const step of this.steps)", step: 1, text: "Recorre los pasos en orden." },
              { match: 'if (result.outcome !== "succeeded")', step: 2, text: "Al primer paso que falla, deja de avanzar y empieza a deshacer." },
            ]}
          />
        }
        backward={
          <SourceCode
            file={FILE}
            symbol="runCompensations"
            notes={[
              { match: 'if (result.outcome === "unavailable") return;', step: 4, text: "¿El servicio está caído? La orden queda pendiente y se reintenta cada 5 s." },
              { match: "this.cancelLocally(order);", step: 5, text: "Al final, la orden queda cancelada." },
            ]}
          />
        }
      />
    </Stage>
  );
}
