import { DeskApp } from "@/components/desk-app";
import { DatabaseNotice, Footer, Header, Hero, Method, Practices } from "@/components/studio-shell";
import { getBoard } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let payload = null;
  try {
    payload = await getBoard();
  } catch {
    payload = null;
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Method />
        <Practices />
        {payload ? <DeskApp initial={payload} /> : <DatabaseNotice />}
      </main>
      <Footer />
    </>
  );
}
