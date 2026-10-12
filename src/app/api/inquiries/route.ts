import { getBoard, createInquiry } from "@/lib/inquiries";
import { isStatus } from "@/lib/constants";
import { rejectKey } from "@/lib/guard";
import { parseCreate } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q") ?? undefined;

    if (status && status !== "all" && !isStatus(status)) {
      return Response.json({ error: "Unknown status filter." }, { status: 400 });
    }

    const payload = await getBoard({ status: status ?? undefined, q });
    return Response.json(payload);
  } catch {
    return Response.json({ error: "The ledger could not be read." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = rejectKey(request);
  if (denied) return denied;

  try {
    const parsed = parseCreate(await request.json());
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const inquiry = await createInquiry(parsed.value);
    return Response.json({ inquiry }, { status: 201 });
  } catch {
    return Response.json({ error: "The brief could not be filed." }, { status: 500 });
  }
}
