import { Bell } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import type { DemoNotification } from "@/lib/demo/types";

export function NotificationList({ notifications }: { notifications: DemoNotification[] }) {
  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title={en.farmer.noNotifications} />;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={cn("flex gap-3 p-3", !notification.read && "bg-muted/40")}
        >
          <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">{notification.createdAtLabel}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
