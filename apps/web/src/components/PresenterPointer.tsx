"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "poc5.pointer";
const SMOOTHING = 0.28;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function readOnServer(): boolean {
  return false;
}

function write(value: boolean) {
  window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  listeners.forEach((listener) => listener());
}

export function usePointer(): [boolean, () => void] {
  const active = useSyncExternalStore(subscribe, read, readOnServer);
  return [active, () => write(!read())];
}

export function PresenterPointer() {
  const active = useSyncExternalStore(subscribe, read, readOnServer);
  const [pressing, setPressing] = useState(false);
  const haloRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const focused = event.target as HTMLElement | null;
      if (focused?.tagName === "INPUT" || focused?.tagName === "TEXTAREA") return;
      if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        write(!read());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!active) return;

    function onMove(event: PointerEvent) {
      target.current = { x: event.clientX, y: event.clientY };
    }

    let frame = 0;
    function animate() {
      current.current.x += (target.current.x - current.current.x) * SMOOTHING;
      current.current.y += (target.current.y - current.current.y) * SMOOTHING;
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(animate);
    }

    window.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const down = () => setPressing(true);
    const up = () => setPressing(false);

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={haloRef}
      aria-hidden
      className={`pointer-halo ${pressing ? "pointer-halo--active" : ""}`}
    />
  );
}
