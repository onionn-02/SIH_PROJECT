"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { ShieldCheck, Sprout, Users } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/demo/demo-accounts";

type DemoRole = "farmer" | "officer" | "admin";

const DEMO_ROLES: DemoRole[] = ["farmer", "officer", "admin"];

const DEMO_BUTTON: Record<
  DemoRole,
  { icon: typeof Sprout; iconClassName: string; label: string }
> = {
  farmer: { icon: Sprout, iconClassName: "text-emerald-600", label: en.login.fillFarmerDemo },
  officer: { icon: Users, iconClassName: "text-blue-600", label: en.login.fillOfficerDemo },
  admin: { icon: ShieldCheck, iconClassName: "text-slate-600", label: en.login.fillAdminDemo },
};

function friendlySignInError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return en.login.invalidCredentials;
      case "auth/too-many-requests":
        return en.login.tooManyAttempts;
    }
  }
  return en.login.genericError;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [showAllDemoLogins, setShowAllDemoLogins] = useState(false);

  const requestedRoleParam = searchParams.get("role");
  const requestedRole =
    requestedRoleParam && (DEMO_ROLES as string[]).includes(requestedRoleParam)
      ? (requestedRoleParam as DemoRole)
      : null;
  const demoRolesToShow = requestedRole && !showAllDemoLogins ? [requestedRole] : DEMO_ROLES;

  const noProfileError = !loading && user && !profile ? en.login.noProfile : null;
  const error = signInError ?? noProfileError;

  useEffect(() => {
    if (loading || !user || !profile) return;
    router.replace(
      profile.role === "farmer"
        ? ROUTES.farmer.dashboard
        : profile.role === "officer"
          ? ROUTES.officer.dashboard
          : profile.role === "admin"
            ? ROUTES.admin.dashboard
            : ROUTES.home
    );
  }, [loading, user, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSignInError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setSignInError(friendlySignInError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-6 flex justify-center">
        <Logo size={56} />
      </div>
      <PageHeader title={en.login.title} description={en.login.subtitle} />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{en.login.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{en.login.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? en.login.signingIn : en.login.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        {demoRolesToShow.map((role) => {
          const { icon: Icon, iconClassName, label } = DEMO_BUTTON[role];
          return (
            <Button
              key={role}
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setEmail(DEMO_ACCOUNTS[role].email);
                setPassword(DEMO_ACCOUNTS[role].password);
              }}
            >
              <Icon className={`size-4 ${iconClassName}`} aria-hidden="true" />
              {label}
            </Button>
          );
        })}
        {requestedRole && !showAllDemoLogins ? (
          <button
            type="button"
            onClick={() => setShowAllDemoLogins(true)}
            className="mt-1 text-left text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {en.login.showOtherDemoLogins}
          </button>
        ) : null}
      </div>
    </div>
  );
}
