import { CalendarDays, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/content/site";
import { useTheme } from "@/hooks/use-theme";
import { ResumeMenu } from "@/components/ResumeMenu";
import { Button } from "@/components/ui/button";
import { trackOutbound } from "@/lib/analytics";
import { SCHEDULE_LINK } from "@/lib/links";
import { pageShellClass } from "@/lib/panel";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className={cn(pageShellClass, "flex h-16 items-center gap-2")}>
        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>

        <nav
          id="site-nav"
          aria-label="Primary"
          className={cn(
            "fixed inset-x-0 top-16 z-40 border-b border-border bg-background p-5 transition-transform duration-200 lg:static lg:ml-4 lg:flex lg:min-w-0 lg:flex-1 lg:justify-center lg:border-0 lg:bg-transparent lg:p-0",
            menuOpen ? "translate-y-0" : "-translate-y-[120%] lg:translate-y-0",
          )}
        >
          <ul className="flex flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-0">
            {navItems.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  data-analytics-id={`nav-${item.id}`}
                  className="block whitespace-nowrap px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground lg:px-2.5 lg:py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button asChild variant="secondary" size="sm">
            <a
              href={SCHEDULE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              title="Schedule a conversation about opportunities"
              data-analytics-id="header-schedule"
              onClick={(event) => trackOutbound("calendly", SCHEDULE_LINK, event)}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Schedule
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-analytics-id="header-theme-toggle-desktop"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <ResumeMenu />
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Button asChild variant="secondary" size="icon">
            <a
              href={SCHEDULE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Schedule a conversation about opportunities"
              data-analytics-id="header-schedule"
              onClick={(event) => trackOutbound("calendly", SCHEDULE_LINK, event)}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <ResumeMenu />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-analytics-id="header-theme-toggle-mobile"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
