import type { Metadata } from "next";
import { Hubot_Sans, JetBrains_Mono, Mona_Sans } from "next/font/google";
import { PresenterPointer } from "@/components/PresenterPointer";
import "./globals.css";

const mona = Mona_Sans({ variable: "--font-mona", subsets: ["latin"] });

const hubot = Hubot_Sans({ variable: "--font-hubot", subsets: ["latin"], axes: ["wdth"] });

const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Saga vs Circuit Breaker",
  description: "Una compra repartida en cuatro microservicios: consistencia con Saga y resiliencia con Circuit Breaker.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${mona.variable} ${hubot.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-fg">
        {children}
        <PresenterPointer />
      </body>
    </html>
  );
}
