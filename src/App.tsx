import { lazy, Suspense, useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useSectionTracking } from "@/hooks/use-section-tracking";
import { Experience } from "@/components/sections/Experience";
import { ParallaxIntro } from "@/components/sections/ParallaxIntro";
import { Projects } from "@/components/sections/Projects";
import { Resumes } from "@/components/sections/Resumes";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { useAdminRoute } from "@/hooks/use-admin-route";
import { useRecruitmentRoute } from "@/hooks/use-recruitment-route";
import { isLocalAdminEnabled } from "@/lib/is-local-admin-enabled";
import { isLocalRecruitmentEnabled } from "@/lib/is-local-recruitment-enabled";

// Below-the-fold sections ship as separate cacheable chunks; a post-mount
// warm-up (see PortfolioSite) keeps in-page anchors (#writing, #activity…)
// reliable while splitting the initial parse.
const GithubActivity = lazy(() =>
  import("@/components/sections/GithubActivity").then((module) => ({
    default: module.GithubActivity,
  })),
);
const Writing = lazy(() =>
  import("@/components/sections/Writing").then((module) => ({
    default: module.Writing,
  })),
);
const Education = lazy(() =>
  import("@/components/sections/Education").then((module) => ({
    default: module.Education,
  })),
);
const Certifications = lazy(() =>
  import("@/components/sections/Certifications").then((module) => ({
    default: module.Certifications,
  })),
);

const RecruitmentPage = isLocalRecruitmentEnabled
  ? lazy(() =>
      import("@/pages/RecruitmentPage").then((module) => ({ default: module.RecruitmentPage })),
    )
  : null;

const AdminPage = isLocalAdminEnabled
  ? lazy(() => import("@/pages/AdminPage").then((module) => ({ default: module.AdminPage })))
  : null;

function PortfolioSite() {
  useSectionTracking();

  // Warm the lazy chunks right after load: they download in the background
  // immediately, so anchor navigation never races the network.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void import("@/components/sections/GithubActivity");
      void import("@/components/sections/Writing");
      void import("@/components/sections/Education");
      void import("@/components/sections/Certifications");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main id="main">
        <div id="top" />
        <ParallaxIntro />
        <Resumes />
        <Experience />
        <Skills />
        <Suspense fallback={null}>
          <Writing />
        </Suspense>
        <Suspense fallback={null}>
          <Education />
        </Suspense>
        <Suspense fallback={null}>
          <Certifications />
        </Suspense>
        <Projects />
        <Suspense fallback={null}>
          <GithubActivity />
        </Suspense>
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export function App() {
  const isRecruitmentView = useRecruitmentRoute();
  const { isAdminView } = useAdminRoute();

  if (isLocalRecruitmentEnabled && isRecruitmentView && RecruitmentPage) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-muted-foreground">
            Loading recruitment toolkit…
          </div>
        }
      >
        <RecruitmentPage />
      </Suspense>
    );
  }

  if (isLocalAdminEnabled && isAdminView && AdminPage) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-muted-foreground">
            Loading content admin…
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <PortfolioSite />
    </>
  );
}
