"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { en } from "@/i18n/en";
import type {
  CenterActivityEntry,
  StatusDistributionEntry,
} from "@/hooks/use-admin-analytics";
import type { DailyCompletedCount } from "@/services/admin";
import type { AppointmentStatus } from "@/types/firestore";

/** Mirrors the hue families used by StatusBadge (CLAUDE.md §16 — never rely on color alone; labels/legend accompany every color here). */
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "#3b82f6",
  WAITING: "#fbbf24",
  CALLED: "#f59e0b",
  IN_PROGRESS: "#d97706",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  NO_SHOW: "#f43f5e",
};

const ACCENT = "#059669";

export function DailyCompletedChart({ data }: { data: DailyCompletedCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{en.admin.dailyCompleted}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" name="Completed" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StatusDistributionChart({ data }: { data: StatusDistributionEntry[] }) {
  const chartData = data.map((entry) => ({
    name: en.status[entry.status],
    count: entry.count,
    status: entry.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{en.admin.statusDistribution}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyState title={en.admin.noActivityToday} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function CenterActivityChart({ data }: { data: CenterActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{en.admin.centerActivity}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title={en.admin.noActivityToday} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="centerName"
                width={120}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="count" name="Appointments" fill={ACCENT} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function AverageWaitCard({ minutes }: { minutes: number | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{en.admin.averageWait}</CardTitle>
      </CardHeader>
      <CardContent>
        {minutes === null ? (
          <p className="text-sm text-muted-foreground">{en.admin.notEnoughData}</p>
        ) : (
          <p className="text-3xl font-semibold">{en.admin.averageWaitMinutes(minutes)}</p>
        )}
      </CardContent>
    </Card>
  );
}
