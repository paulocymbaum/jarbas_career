import { useCallback, useEffect, useState } from "react";
import { toFormState } from "@/components/admin/admin-form-utils";
import { AdminFormField } from "@/components/admin/AdminFormField";
import {
  AdminListShell,
  AdminSortableList,
  useAdminList,
} from "@/components/admin/AdminListShell";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type AdminSkillCategory } from "@/lib/admin-api";

type FormState = Omit<AdminSkillCategory, "id" | "archived">;

const EMPTY: FormState = {
  name: "",
  sortOrder: 0,
  items: [],
};

export function SkillsPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getSkills(), []),
    adminApi.reorderSkillCategories,
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
      const payload = { ...form, items: form.items.filter((item) => item.trim()) };
      if (list.selectedId === "new") {
        await adminApi.createSkillCategory(payload);
      } else if (list.selectedItem) {
        await adminApi.updateSkillCategory(list.selectedItem.id, payload);
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
      await adminApi.archiveSkillCategory(list.selectedItem.id, !list.selectedItem.archived);
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
      title="Skills"
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
            title: item.name,
            subtitle: `${item.items.length} items`,
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
            <AdminFormField label="Category name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </AdminFormField>
            <StringListEditor label="Items" values={form.items} onChange={(items) => setForm({ ...form, items })} />
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
          <p className="text-sm text-muted-foreground">Select a category or add a new one.</p>
        )
      }
    />
  );
}
