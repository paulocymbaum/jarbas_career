import { ExternalLink } from "lucide-react";
import type { Article } from "@/content/types";
import { trackArticleOpen } from "@/lib/analytics";

function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-id={`article-${article.url}`}
      className="bento-panel bento-panel-hover group flex h-full flex-col p-5"
      onClick={(event) => trackArticleOpen(article.title, article.url, event)}
    >
      <p className="label-caps">{article.readTime ? article.readTime : "LINKEDIN"}</p>
      <h3 className="mt-3 text-base font-semibold leading-6 tracking-[-0.01em] transition-colors group-hover:text-primary">
        {article.title}
      </h3>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-[13px] font-medium text-primary">
        Read on LinkedIn
        <ExternalLink
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </a>
  );
}

export function WritingStack({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.url} article={article} />
      ))}
    </div>
  );
}
