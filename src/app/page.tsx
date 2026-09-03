import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Know your procurement status, always.
        </h1>
        <p className="text-muted-foreground">
          Schedule, token and queue information for farmers and procurement
          centers — in one trusted place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">I&apos;m a farmer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              See your appointment, token and live queue position.
            </p>
            <Link
              href={ROUTES.farmer.dashboard}
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to farmer dashboard →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">I&apos;m an officer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage today&apos;s queue and update procurement status.
            </p>
            <Link
              href={ROUTES.officer.dashboard}
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to officer dashboard →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
