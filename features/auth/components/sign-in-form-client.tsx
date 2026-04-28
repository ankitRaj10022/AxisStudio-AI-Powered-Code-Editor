"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome, Github, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const authErrorMessages: Record<string, string> = {
  Configuration:
    "Provider sign-in could not be completed. If you are using GitHub locally, make sure the OAuth app callback URL exactly matches the origin you opened in the browser.",
  AccessDenied:
    "Access was denied by the provider. Retry the sign-in flow and confirm the account permissions.",
  Verification:
    "The sign-in link or provider verification expired. Start the sign-in flow again.",
};

const SignInFormClient = () => {
  const searchParams = useSearchParams();
  const [activeProvider, setActiveProvider] = useState<"google" | "github" | null>(null);

  const authError = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    return authErrorMessages[error] ?? "Sign-in failed. Please try again.";
  }, [searchParams]);

  const handleSignIn = async (provider: "google" | "github") => {
    setActiveProvider(provider);
    try {
      await signIn(provider, { redirectTo: "/" });
    } catch {
      setActiveProvider(null);
    }
  };

  return (
    <div className="axis-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div className="mb-8 space-y-4">
        <div className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure Workspace Access
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Sign in to axisStudio
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Pick your preferred provider and continue into your AI-assisted browser IDE.
          </p>
        </div>
      </div>

      {authError ? (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
          {authError}
        </div>
      ) : null}

      <div className="grid gap-4">
        <Button
          type="button"
          variant={"outline"}
          disabled={activeProvider !== null}
          onClick={() => void handleSignIn("google")}
          className="h-14 w-full justify-between rounded-2xl border-border/80 bg-background/80 px-5 text-sm font-medium hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center gap-3">
            <Chrome className="h-4 w-4" />
            {activeProvider === "google" ? "Connecting Google..." : "Sign in with Google"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={"outline"}
          disabled={activeProvider !== null}
          onClick={() => void handleSignIn("github")}
          className="h-14 w-full justify-between rounded-2xl border-border/80 bg-background/80 px-5 text-sm font-medium hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center gap-3">
            <Github className="h-4 w-4" />
            {activeProvider === "github" ? "Connecting GitHub..." : "Sign in with GitHub"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 border-t border-border/70 pt-5">
        <p className="w-full text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default SignInFormClient;
