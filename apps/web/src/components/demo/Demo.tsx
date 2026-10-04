"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertFillIcon, ArrowLeftIcon, ArrowRightIcon, PulseIcon, RepoIcon, SyncIcon } from "@primer/octicons-react";
import { SERVICE_KEYS, type ChaosMode, type PlaceOrderRequest, type ServiceKey } from "@poc5/contracts";
import { useLiveSystem } from "@/hooks/useLiveSystem";
import { api } from "@/lib/api";
import { DataPanels } from "./DataPanels";
import { RunLauncher } from "./RunLauncher";
import { RunView } from "./RunView";
import { SystemMap } from "./SystemMap";

const PREVIOUS_SLIDE = "/tests?step=1";
const NEXT_SLIDE = "/comparison";

export function Demo() {
  const router = useRouter();
  const system = useLiveSystem();
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const servicesUp = SERVICE_KEYS.filter((service) => system.health[service]).length;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === "ArrowRight") router.push(NEXT_SLIDE);
      if (event.key === "ArrowLeft") router.push(PREVIOUS_SLIDE);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  async function placeOrder(order: PlaceOrderRequest) {
    const response = await api.placeOrder(order);
    if (response.body?.id) setSelectedOrderId(response.body.id);
    return response;
  }

  async function setChaos(service: ServiceKey, mode: ChaosMode) {
    await api.setChaos(service, mode);
  }

  async function resetAll() {
    await Promise.all(SERVICE_KEYS.map((service) => api.reset(service).catch(() => undefined)));
    setSelectedOrderId(undefined);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-canvas-inset">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-6">
          <RepoIcon className="text-fg-muted" />
          <Link href="/" className="text-[15px]">
            <span className="text-accent">poc5</span>
            <span className="px-1 text-fg-muted">/</span>
            <span className="font-semibold text-accent">saga-vs-circuit-breaker</span>
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-success/50 px-2 py-0.5 text-[12px] text-success">
            <PulseIcon size={12} /> en vivo
          </span>
          <span className="text-[12.5px] text-fg-muted">{servicesUp} de 4 servicios responden</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href={PREVIOUS_SLIDE} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[13px] text-fg-muted hover:text-fg">
              <ArrowLeftIcon size={14} /> Pruebas
            </Link>
            <Link href={NEXT_SLIDE} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[13px] text-fg-muted hover:text-fg">
              Comparación <ArrowRightIcon size={14} />
            </Link>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 rounded-md border border-border bg-overlay px-3 py-1 text-[13px] font-medium hover:border-fg-subtle"
            >
              <SyncIcon size={14} /> Reiniciar todo
            </button>
          </div>
        </div>
      </header>

      <main className="dot-grid flex-1">
        <div className="mx-auto max-w-[1400px] space-y-8 px-6 py-8">
          {servicesUp === 0 && system.observedAt > 0 && (
            <p className="flex items-center gap-2 rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-[14px]">
              <AlertFillIcon className="text-danger" />
              Ningún servicio responde. Levántalos con <code className="font-mono">npm run dev</code> en la raíz del proyecto.
            </p>
          )}

          <Section number={1} title="El sistema" caption="Cada punto es una llamada real de Order a otro servicio. El interruptor es su Circuit Breaker.">
            <SystemMap system={system} onChaos={setChaos} />
          </Section>

          <Section number={2} title="La saga de cada compra" caption="Cada compra es un flujo de pasos. Si uno falla, los anteriores se deshacen en naranja.">
            <div className="grid items-start gap-5 xl:grid-cols-[320px_1fr]">
              <RunLauncher onPlace={placeOrder} />
              <RunView
                orders={system.orders}
                selectedId={selectedOrderId}
                onSelect={setSelectedOrderId}
                onCancel={(id) => api.cancelOrder(id)}
              />
            </div>
          </Section>

          <Section number={3} title="Lo que quedó guardado" caption="Cada servicio tiene su propia base. Aquí se ven los reembolsos y el stock devuelto.">
            <DataPanels system={system} />
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ number, title, caption, children }: { number: number; title: string; caption: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-overlay font-mono text-[13px] text-fg-muted">
          {number}
        </span>
        <div>
          <h2 className="font-display text-[24px] font-bold [font-stretch:110%]">{title}</h2>
          <p className="text-[14px] text-fg-muted">{caption}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
