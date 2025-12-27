"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background/80 border-border/40 fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md"
    >
      <Link href="/" className="group flex items-center gap-2">
        <div className="from-primary to-accent h-8 w-8 rounded-lg bg-linear-to-br transition-transform group-hover:scale-110" />
        <span className="from-primary to-cyan bg-linear-to-r bg-clip-text text-xl font-bold text-transparent">
          FluencyAI
        </span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <NavLink href="#features">Features</NavLink>
        <NavLink href="#how-it-works">How it Works</NavLink>
        <NavLink href="#pricing">Pricing</NavLink>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NavLink href="/auth/login">Log in</NavLink>
        <Link href="/auth/register">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary shadow-primary/25 hover:bg-primary/90 relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-colors"
          >
            <span className="relative z-10">Get Started</span>
            <div className="hover:animate-shimmer absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group relative px-1 py-2">
      <span className="text-muted-foreground group-hover:text-foreground relative z-10 text-sm font-medium transition-colors">
        {children}
      </span>
      <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 ease-out group-hover:w-full" />
      <span className="bg-primary/5 absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}
