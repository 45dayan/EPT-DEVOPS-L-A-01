import { deleteInquiry, updateInquiry } from "@/lib/inquiries";
import { rejectKey } from "@/lib/guard";
import { parsePatch } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = rejectKey(request);
  if (denied) return denied;

  const { id: rawId } = await context.params;
  const id = readId(rawId);
  if (!id) {
    return Response.json({ error: "Invalid inquiry id." }, { status: 400 });
  }

  try {
    const parsed = parsePatch(await request.json());
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const inquiry = await updateInquiry(id, parsed.value);
    if (!inquiry) {
      return Response.json({ error: "That row is no longer on the desk." }, { status: 404 });
    }

    return Response.json({ inquiry });
  } catch {
    return Response.json({ error: "The row could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = rejectKey(request);
  if (denied) return denied;

  const { id: rawId } = await context.params;
  const id = readId(rawId);
  if (!id) {
    return Response.json({ error: "Invalid inquiry id." }, { status: 400 });
  }

  try {
    const removed = await deleteInquiry(id);
    if (!removed) {
      return Response.json({ error: "That row is no longer on the desk." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "The row could not be removed." }, { status: 500 });
  }
}
