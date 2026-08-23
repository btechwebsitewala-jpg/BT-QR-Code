import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative size-9 rounded-xl border border-border/60 bg-card/60 transition-colors hover:bg-secondary ${className ?? ""}`}
          aria-label="Toggle theme"
        >
          <Sun className="size-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute size-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
          <span className="sr-only">Toggle theme ({resolvedTheme})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-2xl border-border bg-card/95 backdrop-blur-md shadow-brand">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium"
          >
            <span className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span>{label}</span>
            </span>
            {theme === value && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
