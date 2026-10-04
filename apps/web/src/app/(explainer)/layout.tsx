import type { ReactNode } from "react";
import { Shell } from "@/components/deck/Shell";

export default function ExplainerLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
