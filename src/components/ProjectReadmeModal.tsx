import { X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "@/content/types";
import { projectReadmes } from "@/content/project-readmes";
import { preprocessReadme } from "@/lib/readme-markdown";
import { ProjectGithubLink } from "@/components/ProjectGithubLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectReadmeModalProps = {
  project: Project | null;
  onClose: () => void;
};

function ReadmeImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;

  return (
    <figure className="my-5 overflow-hidden rounded-lg border border-border bg-muted/30">
      <img
        src={src}
        alt={alt ?? "README illustration"}
        loading="lazy"
        decoding="async"
        className="h-auto w-full object-contain"
        onError={(event) => {
          const target = event.currentTarget;
          target.style.display = "none";
          const fallback = target.nextElementSibling;
          if (fallback instanceof HTMLElement) {
            fallback.hidden = false;
          }
        }}
      />
      <figcaption
        hidden
        className="px-4 py-6 text-center text-sm text-muted-foreground"
      >
        Image unavailable in preview. View the full README on GitHub.
      </figcaption>
      {alt ? (
        <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ProjectReadmeModal({ project, onClose }: ProjectReadmeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rawReadme = project ? projectReadmes[project.slug] : undefined;
  const githubLink = project?.links.find((link) => link.kind === "github");

  const readme = useMemo(() => {
    if (!rawReadme || !project) return undefined;
    return preprocessReadme(rawReadme, {
      githubUrl: githubLink?.url,
      title: project.title,
    });
  }, [rawReadme, project, githubLink?.url]);

  const handleClose = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [project]);

  const markdownComponents = useMemo<Components>(
    () => ({
      h1: ({ children }) => (
        <h3 className="mb-4 mt-8 border-b border-border pb-2 text-lg font-semibold first:mt-0">
          {children}
        </h3>
      ),
      h2: ({ children }) => (
        <h4 className="mb-3 mt-7 text-base font-semibold text-foreground">{children}</h4>
      ),
      h3: ({ children }) => (
        <h5 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {children}
        </h5>
      ),
      p: ({ children }) => <p className="mb-4 leading-7 text-foreground/90">{children}</p>,
      ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5">{children}</ul>,
      ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-5">{children}</ol>,
      li: ({ children }) => <li className="leading-7">{children}</li>,
      a: ({ href, children }) => (
        <a
          href={href}
          className="font-medium text-primary underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-4 rounded-md border-l-4 border-primary/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {children}
        </blockquote>
      ),
      code: ({ className, children }) => {
        const isBlock = Boolean(className);
        if (isBlock) {
          return <code className={cn("font-mono text-[0.85em]", className)}>{children}</code>;
        }
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
            {children}
          </code>
        );
      },
      pre: ({ children }) => (
        <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-xs leading-6">
          {children}
        </pre>
      ),
      table: ({ children }) => (
        <div className="my-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[32rem] border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b border-border bg-muted px-3 py-2 text-left font-semibold">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-border px-3 py-2 align-top text-foreground/90">{children}</td>
      ),
      hr: () => <hr className="my-8 border-border" />,
      img: ({ src, alt }) => <ReadmeImage src={src} alt={alt} />,
    }),
    [],
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        "content-modal z-50 overflow-hidden border border-border bg-card text-card-foreground",
      )}
      aria-labelledby={project ? `project-modal-title-${project.slug}` : undefined}
    >
      {project && readme ? (
        <>
          <div className="shrink-0 border-b border-border bg-card">
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="min-w-0 pr-2">
                <h2
                  id={`project-modal-title-${project.slug}`}
                  className="text-2xl font-medium tracking-tight"
                >
                  {project.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
                {githubLink ? (
                  <ProjectGithubLink
                    privateRepo={project.privateRepo}
                    url={githubLink.url}
                    size="md"
                    label="View on GitHub"
                    className="mt-4 text-primary hover:text-primary/80"
                    projectSlug={project.slug}
                    analyticsSource={`project_${project.slug}_readme_github`}
                  />
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Close"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6 sm:pb-8">
            <article className="project-readme max-w-none pt-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {readme}
              </ReactMarkdown>
            </article>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
