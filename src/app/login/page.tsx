import Link from "next/link";
import { Sprout, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <PageHeader title={en.login.title} description={en.login.subtitle} />

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sprout className="size-4 text-emerald-600" aria-hidden="true" />
              Farmer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href={ROUTES.farmer.dashboard} />}
              className="w-full"
            >
              {en.login.continueAsFarmer}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-blue-600" aria-hidden="true" />
              Officer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href={ROUTES.officer.dashboard} />}
              variant="outline"
              className="w-full"
            >
              {en.login.continueAsOfficer}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{en.login.note}</p>
    </div>
  );
}
