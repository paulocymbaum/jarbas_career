import { useEffect, useRef, useState } from "react";

const PHASES = [
  { id: "top", label: "THE MEETING" },
  { id: "services", label: "SERVICES" },
  { id: "objections", label: "REALITY CHECK" },
  { id: "skills", label: "THE TOOLKIT" },
  { id: "work", label: "THE EVIDENCE" },
  { id: "process", label: "THE JOURNEY" },
  { id: "faq", label: "CROSS-EXAMINATION" },
  { id: "contact", label: "THE HANDSHAKE" },
] as const;

export function ProgressRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }
      let current = 0;
      for (let index = 0; index < PHASES.length; index++) {
        const el = document.getElementById(PHASES[index].id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = index;
      }
      setPhase((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] hidden lg:block"
    >
      <div className="h-0.5 w-full bg-border/40">
        <div
          ref={fillRef}
          className="h-full w-full origin-left bg-primary/80"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <p className="mt-1.5 pr-6 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
        PHASE {String(phase + 1).padStart(2, "0")} — {PHASES[phase].label}
      </p>
    </div>
  );
}
