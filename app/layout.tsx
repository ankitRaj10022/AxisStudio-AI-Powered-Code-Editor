import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { logDatabaseError } from "@/lib/database-error";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AxisStudio - Browser IDE",
  description:
    "AxisStudio is an AI-assisted browser IDE for building, previewing, and shipping full-stack projects with more control.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logDatabaseError("RootLayout.auth", error);
  }
  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${sans.variable} ${mono.variable} ${sans.className} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Toaster />
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
          <SpeedInsights />
        </body>
      </html>
    </SessionProvider>
  );
}
