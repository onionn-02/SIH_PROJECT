/**
 * Central route map (CLAUDE.md §24). Keep in sync with src/app.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  about: "/about",
  farmer: {
    dashboard: "/farmer/dashboard",
    schedule: "/farmer/schedule",
    procurement: (id: string) => `/farmer/procurement/${id}`,
    history: "/farmer/history",
  },
  officer: {
    dashboard: "/officer/dashboard",
    queue: "/officer/queue",
  },
} as const;
