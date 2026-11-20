import type { DragEvent, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Archivable = { id: number; archived: boolean };

export function useAdminList<T extends Archivable>(
  loader: () => Promise<T[]>,
  reorderFn?: (ids: number[]) => Promise<unknown>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loader();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const visibleItems = items.filter((item) => (showArchived ? item.archived : !item.archived));

  const selectedItem =
    selectedId === "new"
      ? null
      : selectedId !== null
        ? (items.find((item) => item.id === selectedId) ?? null)
        : null;

  const notifySaved = (message = "Saved. Site content rebuilt.") => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 4000);
  };

  const reorderVisibleItems = async (orderedIds: number[]) => {
    if (!reorderFn || orderedIds.length < 2) return;

    setReordering(true);
    setError(null);
    try {
      await reorderFn(orderedIds);
      notifySaved("Order updated.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setReordering(false);
    }
  };

  return {
    items,
    visibleItems,
    loading,
    error,
    showArchived,
    setShowArchived,
    selectedId,
    setSelectedId,
    selectedItem,
    reload,
    status,
    setStatus,
    notifySaved,
    reorderVisibleItems,
    reordering,
    canReorder: Boolean(reorderFn),
  };
}

export function AdminListShell({
  title,
  description,
  loading,
  error,
  status,
  showArchived,
  onToggleArchived,
  onCreate,
  onReload,
  list,
  editor,
}: {
  title: string;
  description?: string;
  loading: boolean;
  error: string | null;
  status: string | null;
  showArchived: boolean;
  onToggleArchived: (value: boolean) => void;
  onCreate: () => void;
  onReload: () => void;
  list: ReactNode;
  editor: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onReload}>
            Refresh
          </Button>
          <Button type="button" size="sm" onClick={onCreate}>
            Add new
          </Button>
        </div>
      </div>

      {status ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          {status}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !showArchived
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground",
          )}
          onClick={() => onToggleArchived(false)}
        >
          Active
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            showArchived
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground",
          )}
          onClick={() => onToggleArchived(true)}
        >
          Archived
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-2">{list}</div>
          <div className="rounded-lg border border-border bg-card p-4">{editor}</div>
        </div>
      )}
    </div>
  );
}

export type AdminSortableListItem = {
  id: number;
  title: string;
  subtitle?: string;
  selected: boolean;
  archived?: boolean;
  onClick: () => void;
};

export function AdminSortableList({
  items,
  onReorder,
  disabled,
}: {
  items: AdminSortableListItem[];
  onReorder: (ids: number[]) => Promise<void>;
  disabled?: boolean;
}) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const moveItem = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    const ids = items.map((item) => item.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;

    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    void onReorder(next);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: number) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", String(id));
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, id: number) => {
    if (disabled || draggingId === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOverId(id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: number) => {
    event.preventDefault();
    if (disabled) return;

    const sourceId = Number(event.dataTransfer.getData("text/plain"));
    setDraggingId(null);
    setOverId(null);
    if (!Number.isFinite(sourceId)) return;
    moveItem(sourceId, targetId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries in this view.</p>;
  }

  return (
    <div className="space-y-2">
      {items.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          {disabled ? "Saving order…" : "Drag cards to reorder"}
        </p>
      ) : null}
      {items.map((item) => (
        <AdminListItem
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          selected={item.selected}
          archived={item.archived}
          onClick={item.onClick}
          draggable={!disabled && items.length > 1}
          dragging={draggingId === item.id}
          dropTarget={overId === item.id && draggingId !== item.id}
          onDragHandleStart={(event) => handleDragStart(event, item.id)}
          onDragOver={(event) => handleDragOver(event, item.id)}
          onDrop={(event) => handleDrop(event, item.id)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}

export function AdminListItem({
  title,
  subtitle,
  selected,
  archived,
  onClick,
  draggable = false,
  dragging = false,
  dropTarget = false,
  onDragHandleStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  archived?: boolean;
  onClick: () => void;
  draggable?: boolean;
  dragging?: boolean;
  dropTarget?: boolean;
  onDragHandleStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex w-full items-stretch rounded-lg border transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40",
        archived ? "opacity-70" : "",
        dragging ? "opacity-50" : "",
        dropTarget ? "border-primary ring-2 ring-primary/20" : "",
      )}
    >
      {draggable ? (
        <div
          draggable
          onDragStart={onDragHandleStart}
          onDragEnd={onDragEnd}
          className="flex cursor-grab items-center px-2 text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 px-4 py-3 text-left"
      >
        <p className="font-medium">{title}</p>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </button>
    </div>
  );
}
