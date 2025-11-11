import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";

// Make it responsive
const Social = () => {
  const { open } = useSidebar();

  return (
    <div className="flex items-center gap-2 w-full justify-center md:justify-start">
      <div
        className={cn(
          "flex items-center gap-1.5 md:gap-2",
          !open ? "flex-col" : "flex-row"
        )}
      >
        <button
          type="button"
          className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
          aria-label="Twitter"
        >
          <Twitter className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
        </button>
        <button
          type="button"
          className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
          aria-label="Facebook"
        >
          <Facebook className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
        </button>
        <button
          type="button"
          className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
          aria-label="Instagram"
        >
          <Instagram className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
        </button>
        <button
          type="button"
          className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
          aria-label="GitHub"
        >
          <Github className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Social;
