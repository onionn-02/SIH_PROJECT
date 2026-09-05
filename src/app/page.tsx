import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";

const AUDIENCES = [
  {
    role: "farmer",
    title: "I'm a farmer",
    description: "See your appointment, token and live queue position.",
    cta: "Go to farmer dashboard →",
  },
  {
    role: "officer",
    title: "I'm an officer",
    description: "Manage today's queue and update procurement status.",
    cta: "Go to officer dashboard →",
  },
  {
    role: "admin",
    title: "I'm an administrator",
    description: "Manage centers, schedules and view operational analytics.",
    cta: "Go to admin dashboard →",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Know your procurement status, always.
        </h1>
        <p className="text-muted-foreground">
          Schedule, token and queue information for farmers and procurement
          centers — in one trusted place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {AUDIENCES.map((audience) => (
          <Card key={audience.role}>
            <CardHeader>
              <CardTitle className="text-base">{audience.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{audience.description}</p>
              <Link
                href={`${ROUTES.login}?role=${audience.role}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {audience.cta}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
