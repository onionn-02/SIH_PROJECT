/**
 * Predictable demo login accounts (CLAUDE.md §21, §33). Created by
 * `npm run seed` via the Admin SDK. Shared between the login page's
 * "fill demo login" buttons and the seed script so they never drift apart.
 */
export const DEMO_ACCOUNTS = {
  farmer: { email: "farmer.demo@procurement.test", password: "Demo@1234" },
  officer: { email: "officer.demo@procurement.test", password: "Demo@1234" },
  admin: { email: "admin.demo@procurement.test", password: "Demo@1234" },
} as const;
