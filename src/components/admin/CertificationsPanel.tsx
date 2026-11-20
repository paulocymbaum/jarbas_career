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
import { adminApi, type AdminCertification } from "@/lib/admin-api";

type FormState = Omit<AdminCertification, "id" | "archived">;

const EMPTY: FormState = {
  name: "",
  issuer: "",
  issuedDate: null,
  expiryDate: null,
  credentialId: null,
  verifyUrl: null,
  sortOrder: 0,
};

export function CertificationsPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getCertifications(), []),
    adminApi.reorderCertifications,
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
        await adminApi.createCertification(form);
      } else if (list.selectedItem) {
        await adminApi.updateCertification(list.selectedItem.id, form);
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
      await adminApi.archiveCertification(list.selectedItem.id, !list.selectedItem.archived);
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
      title="Certifications"
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
            subtitle: item.issuer,
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
            <AdminFormField label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Issuer">
              <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Issued date">
              <Input
                value={form.issuedDate ?? ""}
                onChange={(e) => setForm({ ...form, issuedDate: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Expiry date">
              <Input
                value={form.expiryDate ?? ""}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Credential ID">
              <Input
                value={form.credentialId ?? ""}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value || null })}
              />
            </AdminFormField>
            <AdminFormField label="Verify URL">
              <Input
                value={form.verifyUrl ?? ""}
                onChange={(e) => setForm({ ...form, verifyUrl: e.target.value || null })}
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
