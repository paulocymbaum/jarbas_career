import { animate } from "animejs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 260;

type ExpandableHoverCardProps = {
  header: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  elevateOnExpand?: boolean;
};

export function ExpandableHoverCard({
  header,
  children,
  className,
  headerClassName,
  contentClassName,
  elevateOnExpand = true,
}: ExpandableHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [canHover, setCanHover] = useState(false);

  const hasExpandableContent = Boolean(children);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

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

  const expand = useCallback(() => {
    if (!hasExpandableContent || !canHover) return;

    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return;

    setExpanded(true);
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
  }, [canHover, hasExpandableContent, reducedMotion, setBodyExpanded, stopAnimation]);

  const collapse = useCallback(() => {
    if (!hasExpandableContent || !canHover) return;

    const body = bodyRef.current;
    if (!body) return;

    setExpanded(false);
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
  }, [canHover, hasExpandableContent, reducedMotion, setBodyCollapsed, stopAnimation]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !hasExpandableContent) return;

    if (!canHover || reducedMotion) {
      setBodyExpanded(body);
      setExpanded(true);
      return;
    }

    setBodyCollapsed(body);
    setExpanded(false);
  }, [canHover, hasExpandableContent, reducedMotion, setBodyCollapsed, setBodyExpanded]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!cardRef.current?.contains(event.relatedTarget as Node)) {
        collapse();
      }
    },
    [collapse],
  );

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group transition-[box-shadow,transform] duration-200",
        expanded && canHover && elevateOnExpand && "shadow-md -translate-y-0.5",
        expanded && canHover && !elevateOnExpand && "shadow-md",
        className,
      )}
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onFocusCapture={expand}
      onBlurCapture={handleBlur}
    >
      <CardHeader className={headerClassName}>{header}</CardHeader>

      {hasExpandableContent ? (
        <div
          ref={bodyRef}
          className="overflow-hidden"
          aria-hidden={canHover ? !expanded : false}
        >
          <CardContent ref={contentRef} className={contentClassName}>
            {children}
          </CardContent>
        </div>
      ) : null}
    </Card>
  );
}
