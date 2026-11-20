import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toFormState } from "@/components/admin/admin-form-utils";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { ProjectImagePicker } from "@/components/admin/ProjectImagePicker";
import {
  AdminListShell,
  AdminSortableList,
  useAdminList,
} from "@/components/admin/AdminListShell";
import { StringListEditor } from "@/components/admin/StringListEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type AdminProjectLink, type AdminProjectImageOption, type GithubRepoListing } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type FormState = Omit<import("@/lib/admin-api").AdminProject, "id" | "archived">;

const EMPTY: FormState = {
  title: "",
  slug: "",
  description: "",
  imageUrl: null,
  gradient: "from-primary/20 to-primary/5",
  featured: false,
  privateRepo: false,
  sortOrder: 0,
  links: [{ kind: "github", url: "", label: null }],
  tech: [],
};

export function ProjectsPanel() {
  const list = useAdminList(
    useCallback(() => adminApi.getProjects(), []),
    adminApi.reorderProjects,
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingAssets, setSyncingAssets] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepoListing[]>([]);
  const [projectImages, setProjectImages] = useState<AdminProjectImageOption[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadProjectImages = useCallback(async (slug: string) => {
    const trimmed = slug.trim();
    if (!trimmed) {
      setProjectImages([]);
      return;
    }

    setLoadingImages(true);
    try {
      setProjectImages(await adminApi.getProjectImages(trimmed));
    } catch {
      setProjectImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  const loadGithubRepos = useCallback(async () => {
    setLoadingRepos(true);
    setFormError(null);
    try {
      setGithubRepos(await adminApi.getGithubRepos());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    void loadGithubRepos();
  }, [loadGithubRepos]);

  useEffect(() => {
    if (list.selectedId === "new") {
      setForm(EMPTY);
      return;
    }
    if (list.selectedItem) {
      setForm(toFormState(list.selectedItem));
    }
  }, [list.selectedId, list.selectedItem]);

  useEffect(() => {
    if (!form.slug.trim()) {
      setProjectImages([]);
      return;
    }
    void loadProjectImages(form.slug);
  }, [form.slug, loadProjectImages]);

  const missingRepos = githubRepos.filter((repo) => !repo.inDatabase);

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        links: form.links.filter((link) => link.url.trim()),
        tech: form.tech.filter((item) => item.trim()),
      };
      if (list.selectedId === "new") {
        await adminApi.createProject(payload);
      } else if (list.selectedItem) {
        await adminApi.updateProject(list.selectedItem.id, payload);
      }
      list.notifySaved();
      await list.reload();
      await loadGithubRepos();
      if (list.selectedId === "new") {
        list.setSelectedId(null);
      } else if (list.selectedItem) {
        const keepId = list.selectedItem.id;
        list.setSelectedId(keepId);
        await loadProjectImages(form.slug);
      }
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
      await adminApi.archiveProject(list.selectedItem.id, !list.selectedItem.archived);
      list.notifySaved(list.selectedItem.archived ? "Restored." : "Archived.");
      await list.reload();
      list.setSelectedId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const syncGithub = async () => {
    setSyncing(true);
    setFormError(null);
    try {
      const slugs = list.selectedItem ? [list.selectedItem.slug] : undefined;
      const result = await adminApi.syncGithubProjects(slugs);
      const scope = slugs ? `"${slugs[0]}"` : `${result.total} projects`;
      const errorNote = result.errors?.length ? ` Errors: ${result.errors.join("; ")}` : "";
      list.notifySaved(
        `Synced ${result.synced}/${result.total} READMEs (${scope}).${errorNote}`,
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  const syncProjectAssets = async () => {
    const slug = form.slug.trim();
    if (!slug) return;

    setSyncingAssets(true);
    setFormError(null);
    try {
      const result = await adminApi.syncProjectAssets(slug);
      const errorNote = result.errors?.length ? ` Errors: ${result.errors.join("; ")}` : "";
      list.notifySaved(
        result.synced
          ? `Synced images for "${slug}".${errorNote}`
          : `No new images synced for "${slug}".${errorNote}`,
      );
      await loadProjectImages(slug);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncingAssets(false);
    }
  };

  const importRepo = async (repo: GithubRepoListing) => {
    setImportingRepo(repo.fullName);
    setFormError(null);
    try {
      const result = await adminApi.importGithubRepo({
        owner: repo.owner,
        repo: repo.name,
        title: repo.name,
        description: repo.description,
        url: repo.url,
        privateRepo: repo.private,
      });
      const readmeNote = result.readmeSynced
        ? " README synced."
        : " No README found on GitHub — add one or sync again later.";
      list.notifySaved(`Imported ${repo.fullName} as "${result.slug}".${readmeNote}`);
      await list.reload();
      await loadGithubRepos();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setImportingRepo(null);
    }
  };

  const updateLink = (index: number, patch: Partial<AdminProjectLink>) => {
    const links = form.links.map((link, i) => (i === index ? { ...link, ...patch } : link));
    setForm({ ...form, links });
  };

  return (
    <AdminListShell
      title="Projects"
      description="Portfolio projects from the database. Import missing GitHub repos below."
      loading={list.loading}
      error={list.error}
      status={list.status}
      showArchived={list.showArchived}
      onToggleArchived={list.setShowArchived}
      onCreate={() => list.setSelectedId("new")}
      onReload={() => {
        void list.reload();
        void loadGithubRepos();
      }}
      list={
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void syncGithub()} disabled={syncing}>
              {syncing
                ? "Syncing…"
                : list.selectedItem
                  ? `Sync README: ${list.selectedItem.slug}`
                  : "Sync all READMEs"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void loadGithubRepos()}
              disabled={loadingRepos}
            >
              {loadingRepos ? "Loading repos…" : "Refresh GitHub repos"}
            </Button>
          </div>

          {missingRepos.length > 0 ? (
            <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium">
                GitHub repos not in portfolio ({missingRepos.length})
              </p>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {missingRepos.map((repo) => (
                  <div
                    key={repo.fullName}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{repo.fullName}</p>
                      {repo.description ? (
                        <p className="truncate text-xs text-muted-foreground">{repo.description}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={importingRepo === repo.fullName}
                      onClick={() => void importRepo(repo)}
                    >
                      {importingRepo === repo.fullName ? "Importing…" : "Import"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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
        </>
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
            <AdminFormField label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField
              label="Cover image"
              hint={
                loadingImages
                  ? "Loading synced repo images…"
                  : projectImages.length
                    ? "Choose a cover from synced GitHub assets or paste a custom URL below."
                    : "No synced images yet — sync from GitHub or paste a URL."
              }
            >
              {form.imageUrl ? (
                <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              ) : null}
              {projectImages.length > 0 ? (
                <ProjectImagePicker
                  images={projectImages}
                  value={form.imageUrl}
                  onChange={(publicUrl) => setForm({ ...form, imageUrl: publicUrl })}
                  className={form.imageUrl ? "mt-3" : undefined}
                />
              ) : null}
              <div className={cn("flex flex-wrap gap-2", (form.imageUrl || projectImages.length) && "mt-3")}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!form.slug.trim() || syncingAssets}
                  onClick={() => void syncProjectAssets()}
                >
                  {syncingAssets ? "Syncing images…" : "Sync images from GitHub"}
                </Button>
              </div>
              <Input
                value={form.imageUrl ?? ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value || null })}
                placeholder="/assets/projects/{slug}/cover.png"
                className="mt-3"
              />
            </AdminFormField>
            <AdminFormField label="Gradient">
              <Input
                value={form.gradient}
                onChange={(e) => setForm({ ...form, gradient: e.target.value })}
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.privateRepo}
                onChange={(e) => setForm({ ...form, privateRepo: e.target.checked })}
              />
              Private repo
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium">Links</p>
              {form.links.map((link, index) => (
                <div key={index} className="grid gap-2 rounded-md border border-border p-3">
                  <select
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    value={link.kind}
                    onChange={(e) =>
                      updateLink(index, { kind: e.target.value as AdminProjectLink["kind"] })
                    }
                  >
                    <option value="github">GitHub</option>
                    <option value="demo">Demo</option>
                    <option value="case_study">Case study</option>
                    <option value="other">Other</option>
                  </select>
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                  />
                  <Input
                    placeholder="Label (optional)"
                    value={link.label ?? ""}
                    onChange={(e) => updateLink(index, { label: e.target.value || null })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm({ ...form, links: form.links.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove link
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    links: [...form.links, { kind: "github", url: "", label: null }],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add link
              </Button>
            </div>
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
          <p className="text-sm text-muted-foreground">Select a project or add a new one.</p>
        )
      }
    />
  );
}
