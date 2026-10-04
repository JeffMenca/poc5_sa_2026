export type Section = "Escenario" | "Saga" | "Circuit Breaker" | "En vivo" | "Saga vs CB" | "Anexo";

export interface Slide {
  href: string;
  title: string;
  section: Section;
  next?: string;
}

export const SECTIONS: Section[] = ["Escenario", "Saga", "Circuit Breaker", "En vivo", "Saga vs CB", "Anexo"];

export const SLIDES: Slide[] = [
  { href: "/", title: "Saga vs Circuit Breaker", section: "Escenario" },
  { href: "/problem", title: "Dos fallas distintas", section: "Escenario" },
  { href: "/saga", title: "Saga: deshacer paso a paso", section: "Saga" },
  { href: "/approaches", title: "Coreografía u orquestación", section: "Saga" },
  { href: "/compensations", title: "Las compensaciones", section: "Saga" },
  { href: "/circuit-breaker", title: "Circuit Breaker", section: "Circuit Breaker" },
  { href: "/breaker-config", title: "Cómo decide", section: "Circuit Breaker" },
  { href: "/resilience", title: "Cinco capas por llamada", section: "Circuit Breaker" },
  { href: "/tests", title: "Pruebas de fallos", section: "En vivo", next: "/demo" },
  { href: "/comparison", title: "Saga vs Circuit Breaker", section: "Saga vs CB" },
  { href: "/closing", title: "Cierre", section: "Saga vs CB" },
  { href: "/saga-code", title: "Código: la saga", section: "Anexo" },
  { href: "/orchestrator", title: "Código: el orquestador", section: "Anexo" },
  { href: "/breaker-code", title: "Código: el breaker", section: "Anexo" },
];

export function slideIndex(path: string): number {
  const clean = path.replace(/\/$/, "") || "/";
  return Math.max(0, SLIDES.findIndex((slide) => slide.href === clean));
}

export function firstSlideOf(section: Section): Slide {
  return SLIDES.find((slide) => slide.section === section) ?? SLIDES[0]!;
}
