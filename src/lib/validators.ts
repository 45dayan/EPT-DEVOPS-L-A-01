import {
  isBudget,
  isProjectType,
  isStatus,
  type BudgetId,
  type ProjectTypeId,
  type Status,
} from "@/lib/constants";

export type CreateInput = {
  name: string;
  email: string;
  company: string;
  projectType: ProjectTypeId;
  budget: BudgetId;
  message: string;
};

export type PatchInput = {
  status?: Status;
  note?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseCreate(body: unknown): { ok: true; value: CreateInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a JSON object." };
  }

  const raw = body as Record<string, unknown>;
  const name = text(raw.name);
  const email = text(raw.email).toLowerCase();
  const company = text(raw.company);
  const projectType = text(raw.projectType);
  const budget = text(raw.budget);
  const message = text(raw.message);

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Name should be between 2 and 80 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (company.length > 120) {
    return { ok: false, error: "Company should be 120 characters or fewer." };
  }
  if (!isProjectType(projectType)) {
    return { ok: false, error: "Choose a project type." };
  }
  if (!isBudget(budget)) {
    return { ok: false, error: "Choose a budget band." };
  }
  if (message.length < 12 || message.length > 1000) {
    return { ok: false, error: "The brief should be between 12 and 1000 characters." };
  }

  return {
    ok: true,
    value: { name, email, company, projectType, budget, message },
  };
}

export function parsePatch(body: unknown): { ok: true; value: PatchInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a JSON object." };
  }

  const raw = body as Record<string, unknown>;
  const value: PatchInput = {};

  if ("status" in raw) {
    const status = text(raw.status);
    if (!isStatus(status)) {
      return { ok: false, error: "Status must be new, reviewing, booked, or archived." };
    }
    value.status = status;
  }

  if ("note" in raw) {
    if (typeof raw.note !== "string") {
      return { ok: false, error: "Note must be text." };
    }
    const note = raw.note.trim();
    if (note.length > 400) {
      return { ok: false, error: "Note should be 400 characters or fewer." };
    }
    value.note = note;
  }

  if (value.status === undefined && value.note === undefined) {
    return { ok: false, error: "Send a status or a note to update." };
  }

  return { ok: true, value };
}
