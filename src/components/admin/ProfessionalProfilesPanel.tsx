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
import { adminApi, type AdminProfessionalProfile } from "@/lib/admin-api";

type FormState = Omit<AdminProfessionalProfile, "id" | "archived">;

const EMPTY: FormState = {
  title: "",
  slug: "",
  summary: null,
  description: null,
  accent: null,
  resumeUrl: "",
  sortOrder: 0,
  stack: [],
  skills: [],
};

export function ProfessionalProfilesPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getProfessionalProfiles(), []),
    adminApi.reorderProfessionalProfiles,
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
        await adminApi.createProfessionalProfile(form);
      } else if (list.selectedItem) {
        await adminApi.updateProfessionalProfile(list.selectedItem.id, form);
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
      await adminApi.archiveProfessionalProfile(list.selectedItem.id, !list.selectedItem.archived);
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
      title="Professional profiles"
      description="Role angles shown in the About section."
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
            subtitle: item.slug,
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
            <AdminFormField label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Slug">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Summary">
              <Textarea
                value={form.summary ?? ""}
                onChange={(e) => setForm({ ...form, summary: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Description">
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Accent">
              <Input
                value={form.accent ?? ""}
                onChange={(e) => setForm({ ...form, accent: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Resume URL">
              <Input
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </AdminFormField>
            <StringListEditor label="Stack" values={form.stack} onChange={(stack) => setForm({ ...form, stack })} />
            <StringListEditor
              label="Skills"
              values={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
            />
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
          <p className="text-sm text-muted-foreground">Select a profile or add a new one.</p>
        )
      }
    />
  );
}
