import type { Metadata } from "next";
import { Demo } from "@/components/demo/Demo";

export const metadata: Metadata = { title: "Demo en vivo · Saga vs Circuit Breaker" };

export default function DemoPage() {
  return <Demo />;
}
