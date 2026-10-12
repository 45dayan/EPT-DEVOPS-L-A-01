"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BUDGETS,
  PROJECT_TYPES,
  STATUSES,
  STATUS_META,
  budgetShort,
  projectLabel,
  type BudgetId,
  type ProjectTypeId,
  type Status,
} from "@/lib/constants";
import { formatWhen, ledgerNo } from "@/lib/format";
import type { BoardPayload, Inquiry } from "@/lib/types";

const fieldClass =
  "w-full rounded-xl border border-line bg-white/80 px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-copper focus:bg-white";

type Props = {
  initial: BoardPayload;
};

export function DeskApp({ initial }: Props) {
  const [inquiries, setInquiries] = useState(initial.inquiries);
  const [stats, setStats] = useState(initial.stats);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [studioKey, setStudioKey] = useState("dayan-studio");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("dayan-desk-key");
    if (saved) setStudioKey(saved);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("dayan-desk-key", studioKey);
  }, [studioKey]);

  async function reload() {
    const response = await fetch("/api/inquiries", { cache: "no-store" });
    const data = (await response.json()) as BoardPayload & { error?: string };
    if (!response.ok) {
      throw new Error(data.error || "Could not load the ledger.");
    }
    setInquiries(data.inquiries);
    setStats(data.stats);
  }

  async function mutate(path: string, init: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-studio-key": studioKey,
        ...(init.headers ?? {}),
      },
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; inquiry?: Inquiry };
    if (!response.ok) {
      throw new Error(data.error || "The desk could not complete that.");
    }
    return data;
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = inquiries.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!q) return true;
      return [item.name, item.email, item.company, item.message, item.note, projectLabel(item.projectType)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    next.sort((a, b) => {
      const delta = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "oldest" ? delta : -delta;
    });
    return next;
  }, [filter, inquiries, query, sort]);

  return (
    <section id="ledger" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-copper">The working desk</p>
          <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Open the ledger</h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          Writes need the studio key. The preview key is <span className="text-ink">dayan-studio</span>. Change <code>STUDIO_KEY</code> before this sits on the public domain.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="On the desk" value={stats.total} />
        <Stat label="New" value={stats.new} />
        <Stat label="Reviewing" value={stats.reviewing} />
        <Stat label="Booked" value={stats.booked} />
        <Stat label="Archived" value={stats.archived} />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl border border-copper/40 bg-[#f8e7dc] px-4 py-3 text-sm text-copper">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <BriefForm
          studioKey={studioKey}
          onKeyChange={setStudioKey}
          busy={busy}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await mutate("/api/inquiries", {
                method: "POST",
                body: JSON.stringify(input),
              });
              await reload();
              return data.inquiry ?? null;
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "The brief could not be filed.");
              return null;
            } finally {
              setBusy(false);
            }
          }}
        />

        <div className="rounded-[1.6rem] border border-line bg-card/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`All ${stats.total}`} />
              {STATUSES.map((status) => (
                <FilterChip
                  key={status}
                  active={filter === status}
                  onClick={() => setFilter(status)}
                  label={`${STATUS_META[status].label} ${stats[status]}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}
              className="text-xs uppercase tracking-[0.16em] text-ink-soft hover:text-ink"
            >
              {sort === "newest" ? "Newest first" : "Oldest first"}
            </button>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Search the ledger</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, studio, or the brief itself"
              className={fieldClass}
            />
          </label>
          <p className="mt-3 text-xs text-ink-soft">
            Showing {visible.length} of {inquiries.length}
          </p>
          <div className="mt-3 space-y-3">
            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
                Nothing on this page of the ledger. Clear the filter or file a new brief.
              </p>
            ) : (
              visible.map((item) => (
                <LedgerRow
                  key={item.id}
                  item={item}
                  onError={setError}
                  onChange={async (patch) => {
                    setError(null);
                    await mutate(`/api/inquiries/${item.id}`, {
                      method: "PATCH",
                      body: JSON.stringify(patch),
                    });
                    await reload();
                  }}
                  onDelete={async () => {
                    setError(null);
                    await mutate(`/api/inquiries/${item.id}`, { method: "DELETE" });
                    await reload();
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-1 font-serif text-3xl leading-none">{value}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs ${active ? "bg-ink text-paper" : "bg-paper text-ink-soft hover:text-ink"}`}
    >
      {label}
    </button>
  );
}

function BriefForm({
  studioKey,
  onKeyChange,
  busy,
  onSubmit,
}: {
  studioKey: string;
  onKeyChange: (value: string) => void;
  busy: boolean;
  onSubmit: (input: {
    name: string;
    email: string;
    company: string;
    projectType: ProjectTypeId;
    budget: BudgetId;
    message: string;
  }) => Promise<Inquiry | null>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState<ProjectTypeId | "">("");
  const [budget, setBudget] = useState<BudgetId | "">("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<Inquiry | null>(null);

  const ready = name.trim().length >= 2 && email.includes("@") && projectType && budget && message.trim().length >= 12 && studioKey.trim();

  return (
    <form
      id="file"
      className="rounded-[1.6rem] border border-line bg-card p-5 shadow-[0_18px_40px_rgba(28,25,21,0.05)] lg:sticky lg:top-24"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!projectType || !budget) return;
        const created = await onSubmit({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          projectType,
          budget,
          message: message.trim(),
        });
        if (created) {
          setReceipt(created);
          setName("");
          setEmail("");
          setCompany("");
          setProjectType("");
          setBudget("");
          setMessage("");
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-copper">01 / File</p>
          <h3 className="mt-1 font-serif text-3xl">New brief</h3>
        </div>
        <span className="stamp stamp-new">Intake</span>
      </div>

      <label className="mt-5 block text-sm">
        <span className="mb-1.5 block text-ink-soft">Studio key</span>
        <input value={studioKey} onChange={(event) => onKeyChange(event.target.value)} className={fieldClass} autoComplete="off" />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-soft">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="Meher Anand" required />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-soft">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className={fieldClass} placeholder="meher@example.com" required />
        </label>
      </div>

      <label className="mt-3 block text-sm">
        <span className="mb-1.5 block text-ink-soft">Studio or company, if any</span>
        <input value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass} placeholder="Atelier Noor" />
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm text-ink-soft">Practice</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROJECT_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={projectType === item.id}
              onClick={() => setProjectType(item.id)}
              className={`rounded-2xl border px-3 py-2 text-left text-sm ${projectType === item.id ? "border-ink bg-ink text-paper" : "border-line bg-white/70 text-ink hover:border-copper"}`}
            >
              <span className="block font-medium">{item.label}</span>
              <span className={`mt-1 block text-[11px] leading-snug ${projectType === item.id ? "text-paper/70" : "text-ink-soft"}`}>{item.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm text-ink-soft">Budget band</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={budget === item.id}
              onClick={() => setBudget(item.id)}
              className={`rounded-full border px-3 py-1.5 text-xs ${budget === item.id ? "border-copper bg-copper text-paper" : "border-line bg-white/70 text-ink-soft hover:text-ink"}`}
            >
              {item.label} · {item.detail}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 flex items-center justify-between text-ink-soft">
          The brief
          <span>{message.length}/1000</span>
        </span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={1000}
          className={`${fieldClass} resize-y`}
          placeholder="What needs making, by when, and what should stay untouched."
          required
        />
      </label>

      <button
        type="submit"
        disabled={!ready || busy}
        className="mt-4 w-full rounded-full bg-ink px-5 py-3 text-sm text-paper hover:bg-copper disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Filing…" : "File the inquiry"}
      </button>

      {receipt ? (
        <div className="mt-4 rounded-2xl border border-dashed border-moss/40 bg-[#eef4ef] px-4 py-3 text-sm text-moss">
          Filed as <strong>{ledgerNo(receipt.id)}</strong> for {receipt.name}. Refresh the page — the row should still be here. That is the database, not the browser.
        </div>
      ) : null}
    </form>
  );
}

function LedgerRow({
  item,
  onChange,
  onDelete,
  onError,
}: {
  item: Inquiry;
  onChange: (patch: { status?: Status; note?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [note, setNote] = useState(item.note);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setNote(item.note);
  }, [item.note]);

  const dirty = note !== item.note;

  return (
    <article className="rounded-2xl border border-line bg-white/75 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-ink-soft">{ledgerNo(item.id)} · {formatWhen(item.createdAt)}</p>
          <h3 className="mt-1 font-serif text-2xl leading-tight">{item.name}</h3>
          <p className="text-sm text-ink-soft">
            {item.company ? `${item.company} · ` : ""}
            {item.email}
          </p>
        </div>
        <span className={`stamp stamp-${item.status}`}>{STATUS_META[item.status].label}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{item.message}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        <span className="rounded-full bg-paper px-2.5 py-1">{projectLabel(item.projectType)}</span>
        <span className="rounded-full bg-paper px-2.5 py-1">{budgetShort(item.budget)}</span>
        <span className="rounded-full bg-paper px-2.5 py-1">{STATUS_META[item.status].hint}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
        <label className="text-xs text-ink-soft">
          Status
          <select
            value={item.status}
            onChange={async (event) => {
              setSaving(true);
              try {
                await onChange({ status: event.target.value as Status });
              } catch (cause) {
                onError(cause instanceof Error ? cause.message : "Could not update status.");
              } finally {
                setSaving(false);
              }
            }}
            className={`${fieldClass} mt-1`}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-soft">
          Studio margin
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            maxLength={400}
            className={`${fieldClass} mt-1 resize-y`}
            placeholder="For the studio, not the client."
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onChange({ note });
            } catch (cause) {
              onError(cause instanceof Error ? cause.message : "Could not save the note.");
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
        {confirming ? (
          <>
            <button
              type="button"
              onClick={async () => {
                setSaving(true);
                try {
                  await onDelete();
                } catch (cause) {
                  onError(cause instanceof Error ? cause.message : "Could not remove the row.");
                  setSaving(false);
                }
              }}
              className="rounded-full border border-copper px-3 py-1.5 text-xs text-copper"
            >
              Remove row
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-xs text-ink-soft">
              Keep
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="text-xs text-ink-soft hover:text-copper">
            Remove
          </button>
        )}
      </div>
    </article>
  );
}
