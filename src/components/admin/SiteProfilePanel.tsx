import { useEffect, useState } from "react";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type AdminSiteProfile } from "@/lib/admin-api";

const EMPTY: AdminSiteProfile = {
  name: "",
  title: "",
  pitch: "",
  aboutParagraphs: [""],
  photoUrl: null,
  email: "",
  city: "",
  country: "",
  githubUrl: null,
  linkedinUrl: null,
  twitterUrl: null,
  footerNote: null,
};

export function SiteProfilePanel() {
  const [form, setForm] = useState<AdminSiteProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setForm(await adminApi.getSiteProfile());
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateSiteProfile({
        ...form,
        aboutParagraphs: form.aboutParagraphs.filter((p) => p.trim()),
      });
      setStatus("Profile saved. Site content rebuilt.");
      window.setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Site profile</h2>
        <p className="text-sm text-muted-foreground">Hero, about, and contact fields.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </AdminFormField>
        <AdminFormField label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </AdminFormField>
        <AdminFormField label="Email" className="md:col-span-2">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </AdminFormField>
        <AdminFormField label="City">
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </AdminFormField>
        <AdminFormField label="Country">
          <Input
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </AdminFormField>
        <AdminFormField label="Photo URL" className="md:col-span-2">
          <Input
            value={form.photoUrl ?? ""}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value || null })}
          />
        </AdminFormField>
        <AdminFormField label="Pitch" className="md:col-span-2">
          <Textarea
            value={form.pitch}
            onChange={(e) => setForm({ ...form, pitch: e.target.value })}
          />
        </AdminFormField>
        <div className="md:col-span-2">
          <StringListEditor
            label="About paragraphs"
            values={form.aboutParagraphs}
            onChange={(aboutParagraphs) => setForm({ ...form, aboutParagraphs })}
          />
        </div>
        <AdminFormField label="GitHub URL">
          <Input
            value={form.githubUrl ?? ""}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value || null })}
          />
        </AdminFormField>
        <AdminFormField label="LinkedIn URL">
          <Input
            value={form.linkedinUrl ?? ""}
            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value || null })}
          />
        </AdminFormField>
        <AdminFormField label="Twitter URL" className="md:col-span-2">
          <Input
            value={form.twitterUrl ?? ""}
            onChange={(e) => setForm({ ...form, twitterUrl: e.target.value || null })}
          />
        </AdminFormField>
        <AdminFormField label="Footer note" className="md:col-span-2">
          <Textarea
            value={form.footerNote ?? ""}
            onChange={(e) => setForm({ ...form, footerNote: e.target.value || null })}
          />
        </AdminFormField>
      </div>

      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}
