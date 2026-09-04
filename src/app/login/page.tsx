"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Sprout, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/demo/demo-accounts";

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
  const router = useRouter();
  const { user, profile, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const noProfileError = !loading && user && !profile ? en.login.noProfile : null;
  const error = signInError ?? noProfileError;

  useEffect(() => {
    if (loading || !user || !profile) return;
    router.replace(
      profile.role === "farmer"
        ? ROUTES.farmer.dashboard
        : profile.role === "officer"
          ? ROUTES.officer.dashboard
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

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setEmail(DEMO_ACCOUNTS.farmer.email);
            setPassword(DEMO_ACCOUNTS.farmer.password);
          }}
        >
          <Sprout className="size-4 text-emerald-600" aria-hidden="true" />
          {en.login.fillFarmerDemo}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setEmail(DEMO_ACCOUNTS.officer.email);
            setPassword(DEMO_ACCOUNTS.officer.password);
          }}
        >
          <Users className="size-4 text-blue-600" aria-hidden="true" />
          {en.login.fillOfficerDemo}
        </Button>
      </div>
    </div>
  );
}
