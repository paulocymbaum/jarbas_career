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
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type AdminEducation } from "@/lib/admin-api";

type FormState = Omit<AdminEducation, "id" | "archived">;

const EMPTY: FormState = {
  institution: "",
  degree: "",
  field: null,
  startDate: null,
  endDate: null,
  location: null,
  summary: null,
  sortOrder: 0,
};

export function EducationPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getEducation(), []),
    adminApi.reorderEducation,
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
        await adminApi.createEducation(form);
      } else if (list.selectedItem) {
        await adminApi.updateEducation(list.selectedItem.id, form);
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
      await adminApi.archiveEducation(list.selectedItem.id, !list.selectedItem.archived);
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
      title="Education"
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
            title: item.institution,
            subtitle: item.degree,
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
            <AdminFormField label="Institution">
              <Input
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField label="Degree">
              <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Field">
              <Input
                value={form.field ?? ""}
                onChange={(e) => setForm({ ...form, field: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Start date">
              <Input
                value={form.startDate ?? ""}
                onChange={(e) => setForm({ ...form, startDate: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="End date">
              <Input
                value={form.endDate ?? ""}
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
