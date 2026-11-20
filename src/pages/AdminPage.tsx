import { ArrowLeft } from "lucide-react";
import { ArticlesPanel } from "@/components/admin/ArticlesPanel";
import { CertificationsPanel } from "@/components/admin/CertificationsPanel";
import { EducationPanel } from "@/components/admin/EducationPanel";
import { ExperiencePanel } from "@/components/admin/ExperiencePanel";
import { ProfessionalProfilesPanel } from "@/components/admin/ProfessionalProfilesPanel";
import { ProjectsPanel } from "@/components/admin/ProjectsPanel";
import { SiteProfilePanel } from "@/components/admin/SiteProfilePanel";
import { SkillsPanel } from "@/components/admin/SkillsPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminRoute } from "@/hooks/use-admin-route";
import { type AdminTab } from "@/lib/admin-routing";

const ADMIN_TAB_LABELS: Record<AdminTab, string> = {
  profile: "Profile",
  profiles: "Profiles",
  experience: "Experience",
  writing: "Writing",
  education: "Education",
  certifications: "Certifications",
  projects: "Projects",
  skills: "Skills",
};

export function AdminPage() {
  const { activeTab, setActiveTab } = useAdminRoute();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Local only</p>
            <h1 className="text-xl font-bold sm:text-2xl">Content admin</h1>
            <p className="text-sm text-muted-foreground">
              Edit portfolio content in SQLite — not included in production builds.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="#top">
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/90">
          Changes save to <code className="rounded bg-muted px-1 py-0.5 text-xs">portfolio.db</code> and
          automatically rebuild <code className="rounded bg-muted px-1 py-0.5 text-xs">site.ts</code>. To
          deploy, update <code className="rounded bg-muted px-1 py-0.5 text-xs">db/seed.sql</code> manually.
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)}>
          <TabsList className="w-full justify-start">
            {(Object.keys(ADMIN_TAB_LABELS) as AdminTab[]).map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {ADMIN_TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile">
            <SiteProfilePanel />
          </TabsContent>
          <TabsContent value="profiles">
            <ProfessionalProfilesPanel />
          </TabsContent>
          <TabsContent value="experience">
            <ExperiencePanel />
          </TabsContent>
          <TabsContent value="writing">
            <ArticlesPanel />
          </TabsContent>
          <TabsContent value="education">
            <EducationPanel />
          </TabsContent>
          <TabsContent value="certifications">
            <CertificationsPanel />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsPanel />
          </TabsContent>
          <TabsContent value="skills">
            <SkillsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
