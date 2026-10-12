import { Mark } from "@/components/mark";

const STEPS = [
  {
    n: "01",
    title: "Filed",
    copy: "A name, a budget band, and the actual ask. No decks required to open a row.",
  },
  {
    n: "02",
    title: "Reviewing",
    copy: "The margin note is for the studio. It is not a reply, and it is not a promise.",
  },
  {
    n: "03",
    title: "Booked",
    copy: "Dates are held. The row stays so the same brief is not pitched twice.",
  },
  {
    n: "04",
    title: "Archived",
    copy: "Closed quietly. Delete only noise. A real brief should still be findable.",
  },
];

const PRACTICES = [
  { title: "Identity", copy: "Wordmarks that can live on cloth, paper, and a quiet homepage." },
  { title: "Editorial", copy: "Issues and pamphlets where the sequence matters more than the flourish." },
  { title: "Web", copy: "A site that can carry long captions and a ledger that does not forget." },
  { title: "Spatial", copy: "Rooms, hang, and the hour the light arrives — not a build for its own sake." },
  { title: "Portrait", copy: "People, held still. Afternoon light preferred to a flash." },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-3 text-ink no-underline">
          <Mark />
          <span>
            <span className="block font-serif text-lg leading-none tracking-tight">Dayan Desk</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-ink-soft">Studio intake</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-ink-soft sm:flex">
          <a href="#method" className="hover:text-ink">Method</a>
          <a href="#practices" className="hover:text-ink">Practices</a>
          <a href="#ledger" className="hover:text-ink">Ledger</a>
          <a href="/api/health" className="hover:text-ink">Health</a>
        </nav>
        <a
          href="#ledger"
          className="rounded-full border border-ink/15 bg-card px-3 py-1.5 text-[11px] tracking-wide text-ink-soft"
        >
          <span className="sm:hidden">Live target</span>
          <span className="hidden sm:inline">dayan.azanabbaswani.online</span>
        </a>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16 lg:pb-20">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-copper">A ledger, not an inbox</p>
        <h1 className="mt-4 max-w-xl font-serif text-[clamp(2.7rem,6vw,5.15rem)] leading-[0.92] font-medium tracking-[-0.035em] text-ink">
          The brief comes in. The studio stays unhurried.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Dayan Desk keeps identity, editorial, web, spatial, and portrait inquiries in one paper ledger.
          File the ask, mark where it stands, and leave a margin for the next person at the table.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#file" className="rounded-full bg-ink px-5 py-3 text-sm text-paper no-underline hover:bg-copper">
            File a brief
          </a>
          <a href="#ledger" className="rounded-full border border-ink/20 px-5 py-3 text-sm text-ink no-underline hover:border-copper hover:text-copper">
            Read the ledger
          </a>
        </div>
        <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Reply</dt>
            <dd className="mt-1 font-serif text-2xl">1 day</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Bands</dt>
            <dd className="mt-1 font-serif text-2xl">PKR</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Store</dt>
            <dd className="mt-1 font-serif text-2xl">Postgres</dd>
          </div>
        </dl>
      </div>
      <div className="relative">
        <div className="overflow-hidden rounded-[1.6rem] border border-ink/10 shadow-[0_24px_60px_rgba(28,25,21,0.12)]">
          <img
            src="/images/workshop.jpg"
            alt="Sunlit workshop table with tools, a pale vase, and an open laptop"
            className="aspect-[4/5] h-full w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
          />
        </div>
        <figure className="absolute -bottom-6 -left-2 w-40 overflow-hidden rounded-2xl border-4 border-paper shadow-lg sm:left-[-1.5rem] sm:w-48">
          <img
            src="/images/calligraphy.jpg"
            alt="Calligraphy tools and handmade paper on a wooden table"
            className="aspect-square w-full object-cover"
          />
        </figure>
        <p className="absolute top-4 right-4 max-w-40 rounded-2xl bg-paper/92 px-3 py-2 text-xs leading-relaxed text-ink shadow-sm">
          Morning light. The row is filed before the kettle boils twice.
        </p>
      </div>
    </section>
  );
}

export function Method() {
  return (
    <section id="method" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-[1.8rem] border border-line bg-ink text-paper">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-64">
            <img
              src="/images/papers.jpg"
              alt="Close crop of handwritten pages and an ink jar"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-serif text-2xl leading-tight">
              A ledger is useful only if the next person can tell, in one glance, whether to reply, wait, or begin.
            </p>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {STEPS.map((step) => (
              <article key={step.n} className="bg-ink p-6">
                <p className="text-[11px] tracking-[0.22em] text-saffron">{step.n}</p>
                <h2 className="mt-3 font-serif text-3xl font-medium">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-paper/75">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Practices() {
  return (
    <section id="practices" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-copper">What the desk accepts</p>
          <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight">Five kinds of work</h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
          Choose one when you file. The ledger does not try to be every kind of studio software — only a clear first page.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <article className="overflow-hidden rounded-3xl border border-line bg-card md:col-span-2">
          <img
            src="/images/portrait.jpg"
            alt="A photographer holding a vintage camera in warm indoor light"
            className="h-56 w-full object-cover"
          />
          <div className="p-5">
            <h3 className="font-serif text-2xl">Portrait</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{PRACTICES[4].copy}</p>
          </div>
        </article>
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-3">
          {PRACTICES.slice(0, 4).map((item) => (
            <article key={item.title} className="rounded-3xl border border-line bg-card/80 p-5">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DatabaseNotice() {
  return (
    <section id="ledger" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="rounded-[1.6rem] border border-copper/30 bg-card p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-copper">Database</p>
        <h2 className="mt-2 font-serif text-4xl">The ledger cannot reach PostgreSQL yet.</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          The page is up. The <code>inquiries</code> table is not, or <code>DATABASE_URL</code> is pointed at the wrong host.
          Locally, run <code>npx drizzle-kit push</code>. In Docker, mount <code>db/init.sql</code> and use the service name <code>db</code>, not <code>127.0.0.1</code>.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-2xl text-ink">Dayan Desk</p>
          <p className="mt-1">Intake ledger for a small studio. Target host: dayan.azanabbaswani.online</p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed">
          Photographs via Pexels. This demo has no accounts — the studio key only gates writes. Do not store real client work here.
        </p>
      </div>
    </footer>
  );
}
