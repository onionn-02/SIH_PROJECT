"use client";

import { Card, CardContent } from "@/components/ui/card";
import { en } from "@/i18n/en";
import { useOfficerQueue } from "@/lib/officer/queue-context";

export function SummaryCards() {
  const { summary } = useOfficerQueue();

  const cards = [
    { label: en.queue.todayTotal, value: summary.total },
    { label: en.officer.waiting, value: summary.waiting },
    { label: en.officer.inProgress, value: summary.inProgress },
    { label: en.officer.completed, value: summary.completed },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardContent className="text-center">
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
