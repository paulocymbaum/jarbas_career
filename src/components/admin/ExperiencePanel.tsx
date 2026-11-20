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
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type AdminExperience } from "@/lib/admin-api";

type FormState = Omit<AdminExperience, "id" | "archived">;

const EMPTY: FormState = {
  role: "",
  company: "",
  startDate: "",
  endDate: null,
  location: null,
  summary: null,
  sortOrder: 0,
  highlights: [],
  tech: [],
};

export function ExperiencePanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getExperience(), []),
    adminApi.reorderExperience,
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
        await adminApi.createExperience(form);
      } else if (list.selectedItem) {
        await adminApi.updateExperience(list.selectedItem.id, form);
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
      await adminApi.archiveExperience(list.selectedItem.id, !list.selectedItem.archived);
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
      title="Experience"
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
            title: `${item.role} @ ${item.company}`,
            subtitle: `${item.startDate} – ${item.endDate ?? "Present"}`,
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
            <AdminFormField label="Role">
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Company">
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField label="Start date">
              <Input
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField label="End date">
              <Input
                value={form.endDate ?? ""}
                placeholder="Leave empty for present"
                onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Location">
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Summary">
              <Textarea
                value={form.summary ?? ""}
                onChange={(e) => setForm({ ...form, summary: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </AdminFormField>
            <StringListEditor
              label="Highlights"
              values={form.highlights}
              onChange={(highlights) => setForm({ ...form, highlights })}
            />
            <StringListEditor label="Tech" values={form.tech} onChange={(tech) => setForm({ ...form, tech })} />
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
