"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { en } from "@/i18n/en";
import { getAllCenters } from "@/services/centers";
import { createSchedule, updateSchedule, type ScheduleInput } from "@/services/schedules";
import type { AdminCenter, AdminSchedule } from "@/lib/demo/types";

interface ScheduleFormProps {
  schedule?: AdminSchedule;
  onDone: () => void;
}

function emptyValues(defaultCenterId: string): ScheduleInput {
  return {
    centerId: defaultCenterId,
    date: "",
    startTime: "08:00",
    endTime: "13:00",
    commodity: "",
    capacity: 20,
    notes: null,
  };
}

/** Create/edit form for a procurement schedule (CLAUDE.md §9 Schedule Management). */
export function ScheduleForm({ schedule, onDone }: ScheduleFormProps) {
  const [centers, setCenters] = useState<AdminCenter[]>([]);
  const [values, setValues] = useState<ScheduleInput>(
    schedule
      ? {
          centerId: schedule.centerId,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          commodity: schedule.commodity,
          capacity: schedule.capacity,
          notes: schedule.notes,
        }
      : emptyValues("")
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllCenters()
      .then((all) => {
        setCenters(all);
        if (!schedule && all.length > 0) {
          setValues((v) => (v.centerId ? v : { ...v, centerId: all[0].id }));
        }
      })
      .catch(() => setCenters([]));
  }, [schedule]);

  function set<K extends keyof ScheduleInput>(key: K, value: ScheduleInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (schedule) {
        await updateSchedule(schedule.id, values);
      } else {
        await createSchedule(values);
      }
      onDone();
    } catch {
      setError("Could not save this schedule right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label htmlFor="schedule-center">{en.admin.scheduleCenter}</Label>
        <select
          id="schedule-center"
          required
          value={values.centerId}
          onChange={(e) => set("centerId", e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Select a center
          </option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
              {!center.active ? " (inactive)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="schedule-date">{en.admin.scheduleDate}</Label>
          <Input
            id="schedule-date"
            type="date"
            required
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="schedule-start">{en.admin.scheduleStart}</Label>
          <Input
            id="schedule-start"
            type="time"
            required
            value={values.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="schedule-end">{en.admin.scheduleEnd}</Label>
          <Input
            id="schedule-end"
            type="time"
            required
            value={values.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="schedule-commodity">{en.admin.scheduleCommodity}</Label>
          <Input
            id="schedule-commodity"
            required
            value={values.commodity}
            onChange={(e) => set("commodity", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="schedule-capacity">{en.admin.scheduleCapacity}</Label>
          <Input
            id="schedule-capacity"
            type="number"
            min={1}
            required
            value={values.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="schedule-notes">{en.admin.scheduleNotes}</Label>
        <textarea
          id="schedule-notes"
          rows={2}
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || !values.centerId}>
          {saving ? en.admin.saving : en.admin.save}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          {en.admin.cancelForm}
        </Button>
      </div>
    </form>
  );
}
