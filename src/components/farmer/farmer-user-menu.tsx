"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/**
 * Compact avatar + name in the site header, opening a small Profile / Sign out
 * menu. Replaces the farmer's old horizontal "Profile" tab (CLAUDE.md-driven
 * request) without touching the profile page or any auth logic.
 */
export function FarmerUserMenu() {
  const t = useTranslations();
  const { profile, signOutUser } = useAuth();
  const router = useRouter();

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:pr-3"
        aria-label={`${profile.full_name} — ${t.nav.profile}`}
      >
        <Avatar>
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">{profile.full_name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push(ROUTES.farmer.profile)}>
          <User className="size-4" aria-hidden="true" />
          {t.nav.profile}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOutUser();
            router.push(ROUTES.home);
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
