import Link from "next/link";
import Image from "next/image";
import UserButton from "../auth/components/user-button";
import { Button } from "@/components/ui/button";
import { axisAssets } from "@/lib/axis-assets";

export function Header() {
  const navLinks = [
    { href: "/#overview", label: "Overview" },
    { href: "/#workflow", label: "Workflow" },
    { href: "/#playground", label: "Playground" },
    { href: "/#enterprise", label: "Enterprise" },
  ];

  return (
    <div className="sticky top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-6">
      <div className="axis-panel mx-auto flex w-full max-w-7xl items-center justify-between rounded-full px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-300 shadow-[0_18px_40px_rgba(244,63,94,0.24)]">
            <Image src={axisAssets.brand.logoMark} alt="axisStudio logo" height={22} width={22} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Browser IDE
            </p>
            <Image
              src={axisAssets.brand.titleWordmark}
              alt="axisStudio"
              width={168}
              height={44}
              className="mt-1 h-auto w-36"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <UserButton />
          <Button asChild className="hidden rounded-full bg-primary px-5 text-primary-foreground shadow-[0_12px_30px_rgba(239,68,68,0.24)] hover:bg-primary/90 md:inline-flex">
            <Link href="/auth/sign-in">Launch Studio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
