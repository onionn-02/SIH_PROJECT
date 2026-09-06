"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { en } from "@/i18n/en";
import { getActiveCenters } from "@/services/centers";
import { broadcastAnnouncement } from "@/services/notifications";
import type { DemoCenter } from "@/lib/demo/types";

/** Admin-only broadcast panel for the CENTER_ANNOUNCEMENT notification type (CLAUDE.md §17, Day 5). */
export function AnnouncementForm() {
  const [centers, setCenters] = useState<DemoCenter[]>([]);
  const [centerId, setCenterId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveCenters()
      .then(setCenters)
      .catch(() => setCenters([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const count = await broadcastAnnouncement(centerId || null, title.trim(), message.trim());
      setResult(en.admin.announcementSent(count));
      setTitle("");
      setMessage("");
    } catch {
      setError("Could not send the announcement right now.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-4" aria-hidden="true" />
          {en.admin.announcementTitle}
        </CardTitle>
        <CardDescription>{en.admin.announcementDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="announcement-center">{en.admin.scheduleCenter}</Label>
            <select
              id="announcement-center"
              value={centerId}
              onChange={(e) => setCenterId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{en.admin.announcementAllFarmers}</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title">{en.admin.announcementTitleLabel}</Label>
            <Input
              id="announcement-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="announcement-message">{en.admin.announcementMessageLabel}</Label>
            <textarea
              id="announcement-message"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {result ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{result}</p> : null}
          <Button type="submit" disabled={sending}>
            {sending ? en.admin.announcementSending : en.admin.announcementSend}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
