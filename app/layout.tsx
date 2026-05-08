import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";
import { logDatabaseError } from "@/lib/database-error";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className={`${sans.className} antialiased`}>
        <AppProviders session={session}>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">{children}</div>
            </div>
        </AppProviders>
      </body>
    </html>
  );
}
