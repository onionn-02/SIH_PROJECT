import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";

const links = [
  { href: ROUTES.farmer.dashboard, label: en.nav.farmerDashboard },
  { href: ROUTES.officer.dashboard, label: en.nav.officerDashboard },
  { href: ROUTES.about, label: en.nav.about },
];

export function SiteNav() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="text-sm font-semibold">
          {en.app.name}
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Link
            href={ROUTES.login}
            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
          >
            {en.nav.login}
          </Link>
        </div>
      </nav>
    </header>
  );
}
