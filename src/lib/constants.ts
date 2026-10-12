export const PROJECT_TYPES = [
  {
    id: "identity",
    label: "Identity",
    detail: "Marks, type, and a system that holds.",
  },
  {
    id: "editorial",
    label: "Editorial",
    detail: "Issues, lookbooks, and sequenced pages.",
  },
  {
    id: "web",
    label: "Web",
    detail: "A site with a pulse, not a template.",
  },
  {
    id: "spatial",
    label: "Spatial",
    detail: "Rooms, sets, and how light lands.",
  },
  {
    id: "portrait",
    label: "Portrait",
    detail: "People, held still for a moment.",
  },
] as const;

export const BUDGETS = [
  { id: "explore", label: "Explore", detail: "Under 150k PKR" },
  { id: "studio", label: "Studio", detail: "150–400k PKR" },
  { id: "season", label: "Season", detail: "400k–1.2M PKR" },
  { id: "retainer", label: "Retainer", detail: "Ongoing" },
] as const;

export const STATUSES = ["new", "reviewing", "booked", "archived"] as const;

export const STATUS_META = {
  new: { label: "New", hint: "Just filed" },
  reviewing: { label: "Reviewing", hint: "On the table" },
  booked: { label: "Booked", hint: "Dates held" },
  archived: { label: "Archived", hint: "Closed quietly" },
} as const;

export type ProjectTypeId = (typeof PROJECT_TYPES)[number]["id"];
export type BudgetId = (typeof BUDGETS)[number]["id"];
export type Status = (typeof STATUSES)[number];

export function isProjectType(value: string): value is ProjectTypeId {
  return PROJECT_TYPES.some((item) => item.id === value);
}

export function isBudget(value: string): value is BudgetId {
  return BUDGETS.some((item) => item.id === value);
}

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

export function projectLabel(id: string) {
  return PROJECT_TYPES.find((item) => item.id === id)?.label ?? id;
}

export function budgetLabel(id: string) {
  const match = BUDGETS.find((item) => item.id === id);
  return match ? `${match.label} · ${match.detail}` : id;
}

export function budgetShort(id: string) {
  return BUDGETS.find((item) => item.id === id)?.label ?? id;
}
