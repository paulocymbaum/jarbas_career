import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { siteContent } from "@/content/site";
import { trackSkillsDrawerOpen } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PREVIEW_COUNT = 12;

type SkillsDrawerContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const SkillsDrawerContext = createContext<SkillsDrawerContextValue | null>(null);

export function useSkillsDrawer() {
  const context = useContext(SkillsDrawerContext);
  if (!context) {
    throw new Error("useSkillsDrawer must be used within SkillsDrawerProvider");
  }
  return context;
}

function clearSkillsHash() {
  if (window.location.hash === "#skills") {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

function SkillCategoryList({
  name,
  items,
}: {
  name: string;
  items: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > PREVIEW_COUNT;
  const visible = expanded || !hasMore ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <section>
      <h3 className="text-base font-medium tracking-tight">{name}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
      {hasMore ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 h-auto px-0"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
        </Button>
      ) : null}
    </section>
  );
}

export function SkillsDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    setDialogNode(node);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    clearSkillsHash();
  }, []);

  useEffect(() => {
    if (!dialogNode) return;

    if (isOpen) {
      if (!dialogNode.open) dialogNode.showModal();
    } else if (dialogNode.open) {
      dialogNode.close();
    }
  }, [dialogNode, isOpen]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#skills") {
        trackSkillsDrawerOpen("hash");
        setIsOpen(true);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <SkillsDrawerContext.Provider value={{ open, close, isOpen }}>
      {children}
      <dialog
        ref={setDialogRef}
        onClose={close}
        onCancel={close}
        className="skills-drawer z-50"
        aria-labelledby="skills-drawer-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id="skills-drawer-title" className="text-lg font-medium tracking-tight">
            Skills
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Close skills panel"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6">
          {siteContent.skills.map((category) => (
            <SkillCategoryList key={category.name} name={category.name} items={category.items} />
          ))}
        </div>
      </dialog>
    </SkillsDrawerContext.Provider>
  );
}
