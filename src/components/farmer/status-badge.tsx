import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  PhoneCall,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import type { Translations } from "@/i18n/en";
import type { AppointmentStatus } from "@/types/firestore";

function statusConfig(
  t: Translations
): Record<AppointmentStatus, { label: string; icon: typeof Clock; className: string }> {
  return {
    SCHEDULED: {
      label: t.status.SCHEDULED,
      icon: CalendarClock,
      className: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    WAITING: {
      label: t.status.WAITING,
      icon: Clock,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    CALLED: {
      label: t.status.CALLED,
      icon: PhoneCall,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    IN_PROGRESS: {
      label: t.status.IN_PROGRESS,
      icon: Loader2,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    COMPLETED: {
      label: t.status.COMPLETED,
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    CANCELLED: {
      label: t.status.CANCELLED,
      icon: XCircle,
      className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
    NO_SHOW: {
      label: t.status.NO_SHOW,
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
  };
}

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const t = useTranslations();
  const config = statusConfig(t)[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-transparent px-2.5 py-1 text-xs font-medium", config.className, className)}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
