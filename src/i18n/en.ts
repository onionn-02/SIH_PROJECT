/**
 * English UI strings. Translation-ready structure (CLAUDE.md §13) —
 * Marathi/Hindi files can be added later as sibling modules with the
 * same key shape. Keep language simple and farmer-friendly.
 */
export const en = {
  app: {
    name: "Procurement Tracker",
  },
  nav: {
    home: "Home",
    login: "Login",
    about: "About",
    farmerDashboard: "Dashboard",
    schedule: "Schedule",
    history: "History",
    officerDashboard: "Officer Dashboard",
    officerQueue: "Queue",
  },
  farmer: {
    greeting: "Welcome",
    status: "Procurement Status",
    token: "Token",
    queuePosition: "Your Queue Position",
    center: "Procurement Center",
    appointment: "Appointment",
  },
  officer: {
    waiting: "Waiting",
    inProgress: "In Progress",
    completed: "Completed",
    callNext: "Call Next",
    startProcurement: "Start Procurement",
    completeProcurement: "Complete Procurement",
    noShow: "No Show",
  },
} as const;

export type Translations = typeof en;
