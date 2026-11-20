import { animate } from "animejs";
import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SectionHeading } from "@/components/bento";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { pageShellClass, sectionYClass } from "@/lib/panel";

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 260;

type SectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Trailing content aligned with the headline (mono link, switcher, button). */
  action?: ReactNode;
  alt?: boolean;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Section({
  id,
  title,
  subtitle,
  eyebrow,
  action,
  alt = false,
  children,
  className,
  collapsible = false,
  defaultOpen = false,
  onOpenChange,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const reducedMotion = useReducedMotion();
  const contentId = `${id}-content`;

  const stopAnimation = useCallback(() => {
    animationRef.current?.pause();
    animationRef.current = null;
  }, []);

  const setBodyExpanded = useCallback((body: HTMLDivElement) => {
    body.style.height = "auto";
    body.style.opacity = "1";
    body.style.overflow = "visible";
  }, []);

  const setBodyCollapsed = useCallback((body: HTMLDivElement) => {
    body.style.height = "0px";
    body.style.opacity = "0";
    body.style.overflow = "hidden";
  }, []);

  const expandContent = useCallback(() => {
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return;

    setOpen(true);
    onOpenChange?.(true);
    stopAnimation();

    if (reducedMotion) {
      setBodyExpanded(body);
      return;
    }

    const startHeight = body.offsetHeight;
    const targetHeight = content.scrollHeight;
    body.style.overflow = "hidden";
    body.style.height = `${startHeight}px`;

    const startOpacity = Number.parseFloat(getComputedStyle(body).opacity) || 0;

    animationRef.current = animate(body, {
      height: [startHeight, targetHeight],
      opacity: [startOpacity, 1],
      duration: EXPAND_DURATION,
      ease: "outCubic",
      onComplete: () => {
        if (bodyRef.current) {
          setBodyExpanded(bodyRef.current);
        }
      },
    });
  }, [onOpenChange, reducedMotion, setBodyExpanded, stopAnimation]);

  const collapseContent = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;

    setOpen(false);
    onOpenChange?.(false);
    stopAnimation();

    if (reducedMotion) {
      setBodyCollapsed(body);
      return;
    }

    const currentHeight = body.offsetHeight;
    body.style.overflow = "hidden";
    body.style.height = `${currentHeight}px`;

    animationRef.current = animate(body, {
      height: [currentHeight, 0],
      opacity: [1, 0],
      duration: COLLAPSE_DURATION,
      ease: "outCubic",
      onComplete: () => {
        if (bodyRef.current) {
          setBodyCollapsed(bodyRef.current);
        }
      },
    });
  }, [onOpenChange, reducedMotion, setBodyCollapsed, stopAnimation]);

  const toggle = () => {
    if (open) {
      collapseContent();
    } else {
      expandContent();
    }
  };

  useLayoutEffect(() => {
    if (!collapsible) return;

    const body = bodyRef.current;
    if (!body) return;

    if (defaultOpen || reducedMotion) {
      setBodyExpanded(body);
      return;
    }

    setBodyCollapsed(body);
  }, [collapsible, defaultOpen, reducedMotion, setBodyCollapsed, setBodyExpanded]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        sectionYClass,
        alt && "border-y border-border/60 bg-muted/30",
        className,
      )}
    >
      <div className={pageShellClass}>
        <header className={cn(collapsible && !open ? "mb-0" : "mb-5")}>
          {collapsible ? (
            <button
              type="button"
              className="group flex w-full items-start justify-between gap-4 rounded-lg text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={toggle}
            >
              <SectionHeading
                id={`${id}-heading`}
                eyebrow={eyebrow}
                title={title}
                subtitle={subtitle}
                className="min-w-0 flex-1"
              />
              <ChevronDown
                className={cn(
                  "mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out group-hover:text-foreground",
                  open && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          ) : (
            <SectionHeading
              id={`${id}-heading`}
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              action={action}
            />
          )}
        </header>
        {collapsible ? (
          <div
            id={contentId}
            ref={bodyRef}
            className="overflow-hidden"
            aria-hidden={!open}
          >
            <div ref={contentRef}>{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
