import type { BudgetId, ProjectTypeId, Status } from "@/lib/constants";

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  company: string;
  projectType: ProjectTypeId;
  budget: BudgetId;
  message: string;
  status: Status;
  note: string;
  createdAt: string;
};

export type LedgerStats = {
  total: number;
  new: number;
  reviewing: number;
  booked: number;
  archived: number;
};

export type BoardPayload = {
  inquiries: Inquiry[];
  stats: LedgerStats;
};
