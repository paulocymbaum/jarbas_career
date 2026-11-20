import { useCallback, useEffect, useState } from "react";
import { toFormState } from "@/components/admin/admin-form-utils";
import { AdminFormField } from "@/components/admin/AdminFormField";
import {
  AdminListShell,
  AdminSortableList,
  useAdminList,
} from "@/components/admin/AdminListShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type AdminArticle } from "@/lib/admin-api";

type FormState = Omit<AdminArticle, "id" | "archived">;

const EMPTY: FormState = {
  kind: "article",
  title: "",
  url: "",
  author: null,
  source: null,
  readTime: null,
  reactions: null,
  comments: null,
  externalId: null,
  featured: false,
  sortOrder: 0,
};

export function ArticlesPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getArticles(), []),
    adminApi.reorderArticles,
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (list.selectedId === "new") {
      setForm(EMPTY);
      return;
    }
    if (list.selectedItem) {
      setForm(toFormState(list.selectedItem));
    }
  }, [list.selectedId, list.selectedItem]);

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (list.selectedId === "new") {
        await adminApi.createArticle(form);
      } else if (list.selectedItem) {
        await adminApi.updateArticle(list.selectedItem.id, form);
      }
      list.notifySaved();
      await list.reload();
      list.setSelectedId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async () => {
    if (!list.selectedItem) return;
    setSaving(true);
    try {
      await adminApi.archiveArticle(list.selectedItem.id, !list.selectedItem.archived);
      list.notifySaved(list.selectedItem.archived ? "Restored." : "Archived.");
      await list.reload();
      list.setSelectedId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminListShell
      title="Writing"
      description="Articles and posts. Only articles appear on the landing page."
      loading={list.loading}
      error={list.error}
      status={list.status}
      showArchived={list.showArchived}
      onToggleArchived={list.setShowArchived}
      onCreate={() => list.setSelectedId("new")}
      onReload={() => void list.reload()}
      list={
        <AdminSortableList
          items={list.visibleItems.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: `${item.kind} · ${item.url}`,
            selected: list.selectedId === item.id,
            archived: item.archived,
            onClick: () => list.setSelectedId(item.id),
          }))}
          onReorder={list.reorderVisibleItems}
          disabled={list.reordering}
        />
      }
      editor={
        list.selectedId ? (
          <div className="space-y-4">
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <AdminFormField label="Kind">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as AdminArticle["kind"] })}
              >
                <option value="article">Article</option>
                <option value="post">Post</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="URL">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Author">
              <Input
                value={form.author ?? ""}
                onChange={(e) => setForm({ ...form, author: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Source">
              <Input
                value={form.source ?? ""}
                onChange={(e) => setForm({ ...form, source: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Read time">
              <Input
                value={form.readTime ?? ""}
                onChange={(e) => setForm({ ...form, readTime: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Reactions">
              <Input
                type="number"
                value={form.reactions ?? ""}
                onChange={(e) =>
                  setForm({ ...form, reactions: e.target.value ? Number(e.target.value) : null })
                }
              />
            </AdminFormField>
            <AdminFormField label="Comments">
              <Input
                type="number"
                value={form.comments ?? ""}
                onChange={(e) =>
                  setForm({ ...form, comments: e.target.value ? Number(e.target.value) : null })
                }
              />
            </AdminFormField>
            <AdminFormField label="External ID">
              <Input
                value={form.externalId ?? ""}
                onChange={(e) => setForm({ ...form, externalId: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              {list.selectedItem ? (
                <Button type="button" variant="secondary" onClick={() => void toggleArchive()} disabled={saving}>
                  {list.selectedItem.archived ? "Restore" : "Archive"}
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an entry or add a new one.</p>
        )
      }
    />
  );
}
