"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  MessageSquare,
  Trophy,
  BookOpen,
  Settings as SettingsIcon,
  Mic,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/practice", label: "Practice", icon: Mic },
  { href: "/app/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/app/achievements", label: "Achievements", icon: Trophy },
  { href: "/app/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/app/community", label: "Community", icon: Users },
  { href: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border/40 bg-card flex w-[230px] flex-col border-r">
      {/* Logo */}
      <div className="border-border/40 flex h-16 items-center gap-3 border-b px-6">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
          <Mic className="text-primary-foreground h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">EchoTalk</h1>
          <p className="text-muted-foreground text-xs">AI Language Partner</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="bg-primary absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full" />
              )}
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border/40 border-t p-4">
        <div className="flex items-center gap-3">
          <div className="from-primary to-cyan h-10 w-10 rounded-full bg-linear-to-br" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">Alex Morgan</p>
            <p className="text-primary truncate text-xs">Pro Member</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
