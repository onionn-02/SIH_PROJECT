"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { en } from "@/i18n/en";
import { createCenter, updateCenter, type CenterInput } from "@/services/centers";
import type { AdminCenter } from "@/lib/demo/types";

interface CenterFormProps {
  center?: AdminCenter;
  onDone: () => void;
}

const EMPTY: CenterInput = {
  name: "",
  code: "",
  address: "",
  district: "",
  state: "",
  contactPhone: "",
  operatingStart: "08:00",
  operatingEnd: "17:00",
};

/** Create/edit form for a procurement center (CLAUDE.md §9 Center Management). */
export function CenterForm({ center, onDone }: CenterFormProps) {
  const [values, setValues] = useState<CenterInput>(
    center
      ? {
          name: center.name,
          code: center.code,
          address: center.address,
          district: center.district,
          state: center.state,
          contactPhone: center.contactPhone,
          operatingStart: center.operatingStart,
          operatingEnd: center.operatingEnd,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CenterInput>(key: K, value: CenterInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (center) {
        await updateCenter(center.id, values);
      } else {
        await createCenter(values);
      }
      onDone();
    } catch {
      setError("Could not save this center right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="center-name">{en.admin.centerName}</Label>
          <Input id="center-name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="center-code">{en.admin.centerCode}</Label>
          <Input id="center-code" required value={values.code} onChange={(e) => set("code", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="center-address">{en.admin.centerAddress}</Label>
        <Input
          id="center-address"
          required
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="center-district">{en.admin.centerDistrict}</Label>
          <Input
            id="center-district"
            required
            value={values.district}
            onChange={(e) => set("district", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="center-state">{en.admin.centerState}</Label>
          <Input id="center-state" required value={values.state} onChange={(e) => set("state", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="center-phone">{en.admin.centerPhone}</Label>
          <Input
            id="center-phone"
            required
            value={values.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="center-start">{en.admin.centerOperatingStart}</Label>
          <Input
            id="center-start"
            type="time"
            required
            value={values.operatingStart}
            onChange={(e) => set("operatingStart", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="center-end">{en.admin.centerOperatingEnd}</Label>
          <Input
            id="center-end"
            type="time"
            required
            value={values.operatingEnd}
            onChange={(e) => set("operatingEnd", e.target.value)}
          />
        </div>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? en.admin.saving : en.admin.save}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          {en.admin.cancelForm}
        </Button>
      </div>
    </form>
  );
}
