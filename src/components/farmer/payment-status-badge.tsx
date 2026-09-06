import { Clock, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import type { Translations } from "@/i18n/en";
import type { PaymentStatus } from "@/types/firestore";

function paymentConfig(
  t: Translations
): Record<PaymentStatus, { label: string; icon: typeof Clock; className: string }> {
  return {
    PENDING: {
      label: t.payment.PENDING,
      icon: Clock,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    PAID: {
      label: t.payment.PAID,
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    FAILED: {
      label: t.payment.FAILED,
      icon: XCircle,
      className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
  };
}

/** Mock payment status badge (CLAUDE.md §17A) — the prototype never processes a real payment. */
export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const t = useTranslations();
  const config = paymentConfig(t)[status];
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
