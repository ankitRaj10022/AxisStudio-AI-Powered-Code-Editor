import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const jetbrains_mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-press-start-2p",
});

export const metadata: Metadata = {
  icons: "/icons8-code-100.svg",
  title: "AI Code Editor",
  description: "A code editor for web based IDE with AI support",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${jetbrains_mono.className} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Toaster/>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
