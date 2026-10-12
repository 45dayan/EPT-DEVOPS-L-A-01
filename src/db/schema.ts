import { index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 180 }).notNull(),
    company: varchar("company", { length: 140 }).notNull().default(""),
    projectType: varchar("project_type", { length: 40 }).notNull(),
    budget: varchar("budget", { length: 48 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("new"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inquiries_created_at_idx").on(table.createdAt)],
);

export type InquiryRow = typeof inquiries.$inferSelect;
