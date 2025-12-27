import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { VocabularyProvider } from "@/components/providers/VocabularyProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "FluencyAI - Master English with AI",
  description:
    "The most advanced AI-powered English learning platform. Practice speaking, interactive video lessons, and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <VocabularyProvider>{children}</VocabularyProvider>
            <OfflineIndicator />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
