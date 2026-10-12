import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { inquiries, type InquiryRow } from "@/db/schema";
import { isBudget, isProjectType, isStatus, type Status } from "@/lib/constants";
import type { BoardPayload, Inquiry, LedgerStats } from "@/lib/types";
import type { CreateInput, PatchInput } from "@/lib/validators";

const SEED: Array<typeof inquiries.$inferInsert> = [
  {
    name: "Lila Qureshi",
    email: "lila@northline.press",
    company: "Northline Press",
    projectType: "editorial",
    budget: "season",
    message:
      "Issue 07 is about coastal kitchens and the people who keep them. We need a cover system, a type refresh, and eight feature openers. Print first, the site can follow.",
    status: "reviewing",
    note: "Ask for the previous issue PDF before Thursday.",
    createdAt: new Date("2026-02-18T06:20:00Z"),
  },
  {
    name: "Omar Farid",
    email: "omar@houseofsable.com",
    company: "House of Sable",
    projectType: "identity",
    budget: "retainer",
    message:
      "The mark still feels borrowed from a larger house. We want a quieter wordmark, a colour that can live on cloth, and a retainer so packaging does not restart every season.",
    status: "booked",
    note: "Kickoff held for 4 March. Swatches are in the drawer.",
    createdAt: new Date("2026-02-11T11:05:00Z"),
  },
  {
    name: "Meher Anand",
    email: "meher.anand@example.com",
    company: "",
    projectType: "portrait",
    budget: "studio",
    message:
      "A portrait sitting for a fellowship application. Natural light, no studio glare, and enough frames that I can choose one without looking posed. Karachi, late afternoon if possible.",
    status: "new",
    note: "",
    createdAt: new Date("2026-03-09T08:40:00Z"),
  },
  {
    name: "Jonah Hale",
    email: "jonah@haleandco.com",
    company: "Hale & Co",
    projectType: "web",
    budget: "season",
    message:
      "The current site reads like a catalogue. We need a slower homepage, a project index that can carry long captions, and a way for new inquiries to land somewhere other than a forgotten inbox.",
    status: "new",
    note: "They asked twice. Reply with two references, not a deck.",
    createdAt: new Date("2026-03-12T04:15:00Z"),
  },
  {
    name: "Sana Idris",
    email: "sana@ateliernoor.co",
    company: "Atelier Noor",
    projectType: "spatial",
    budget: "studio",
    message:
      "A three-day show in a rented room with one window. We need the sequence of the room more than a build: where the cloth hangs, where people pause, and how the evening light is kept.",
    status: "reviewing",
    note: "Visit the room before promising a plan.",
    createdAt: new Date("2026-03-01T13:10:00Z"),
  },
  {
    name: "Priya Menon",
    email: "priya@fieldnotes.press",
    company: "Field Notes",
    projectType: "editorial",
    budget: "explore",
    message:
      "A small pamphlet on monsoon repair shops. Budget is modest and the date slipped, so this can wait. Keeping the row so it is not pitched again by accident.",
    status: "archived",
    note: "Closed. Reopen only if they write again in autumn.",
    createdAt: new Date("2026-01-22T09:00:00Z"),
  },
];

function toDTO(row: InquiryRow): Inquiry {
  const projectType = isProjectType(row.projectType) ? row.projectType : "identity";
  const budget = isBudget(row.budget) ? row.budget : "explore";
  const status: Status = isStatus(row.status) ? row.status : "new";

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    projectType,
    budget,
    message: row.message,
    status,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

function statsFor(items: Inquiry[]): LedgerStats {
  return {
    total: items.length,
    new: items.filter((item) => item.status === "new").length,
    reviewing: items.filter((item) => item.status === "reviewing").length,
    booked: items.filter((item) => item.status === "booked").length,
    archived: items.filter((item) => item.status === "archived").length,
  };
}

let seedPromise: Promise<void> | null = null;

async function ensureSeed() {
  if (!seedPromise) {
    seedPromise = db
      .transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(84211)`);
        const existing = await tx.select({ id: inquiries.id }).from(inquiries).limit(1);
        if (existing.length === 0) {
          await tx.insert(inquiries).values(SEED);
        }
      })
      .catch((error) => {
        seedPromise = null;
        throw error;
      });
  }

  return seedPromise;
}

export async function getBoard(filters?: { status?: string; q?: string }): Promise<BoardPayload> {
  await ensureSeed();
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  const items = rows.map(toDTO);
  const stats = statsFor(items);
  const status = filters?.status && filters.status !== "all" ? filters.status : "";
  const q = filters?.q?.trim().toLowerCase() ?? "";

  const filtered = items.filter((item) => {
    if (status && item.status !== status) return false;
    if (!q) return true;
    return [item.name, item.email, item.company, item.message, item.note].join(" ").toLowerCase().includes(q);
  });

  return { inquiries: filtered, stats };
}

export async function createInquiry(input: CreateInput) {
  await ensureSeed();
  const [row] = await db
    .insert(inquiries)
    .values({
      name: input.name,
      email: input.email,
      company: input.company,
      projectType: input.projectType,
      budget: input.budget,
      message: input.message,
      status: "new",
      note: "",
    })
    .returning();

  return toDTO(row);
}

export async function updateInquiry(id: number, patch: PatchInput) {
  const [row] = await db.update(inquiries).set(patch).where(eq(inquiries.id, id)).returning();
  return row ? toDTO(row) : null;
}

export async function deleteInquiry(id: number) {
  const rows = await db.delete(inquiries).where(eq(inquiries.id, id)).returning({ id: inquiries.id });
  return rows.length > 0;
}
