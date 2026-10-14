import { list, put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];
const KEY_RE = /^[a-zA-Z0-9-]{1,120}$/;

export interface TicketPost {
  id: string;
  eventKey: string;
  eventTitle: string;
  address?: string;
  note?: string;
  name?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

function clean(v: FormDataEntryValue | null, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// GET /api/tickets?event=<key> → all community posts for that event.
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("event") || "";
  if (!KEY_RE.test(key)) {
    return Response.json({ error: "Invalid event key" }, { status: 400 });
  }
  try {
    const { blobs } = await list({ prefix: `tickets/${key}/posts/`, limit: 1000 });
    const posts = await Promise.all(
      blobs
        .filter((b) => b.pathname.endsWith(".json"))
        .map(async (b) => {
          try {
            const r = await fetch(b.url, { cache: "no-store" });
            return (await r.json()) as TicketPost;
          } catch {
            return null;
          }
        }),
    );
    const list2 = posts
      .filter((p): p is TicketPost => !!p)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return Response.json({ posts: list2 });
  } catch (err) {
    return Response.json(
      { error: "Storage unavailable", detail: String(err) },
      { status: 500 },
    );
  }
}

// POST /api/tickets (multipart) → add a ticket/address post for an event.
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const eventKey = clean(form.get("event"), 120);
  if (!KEY_RE.test(eventKey)) {
    return Response.json({ error: "Invalid event key" }, { status: 400 });
  }
  const eventTitle = clean(form.get("eventTitle"), 200);
  const address = clean(form.get("address"), 300);
  const note = clean(form.get("note"), 1000);
  const name = clean(form.get("name"), 80);

  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;

  if (!address && !note && !hasFile) {
    return Response.json(
      { error: "Add an address, a note, or a ticket file." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  let fileUrl: string | undefined;
  let fileName: string | undefined;

  try {
    if (hasFile) {
      const f = file as File;
      if (f.size > MAX_FILE_BYTES) {
        return Response.json({ error: "File too large (max 6 MB)." }, { status: 400 });
      }
      if (f.type && !ALLOWED_TYPES.includes(f.type)) {
        return Response.json(
          { error: "Only images or PDFs are allowed." },
          { status: 400 },
        );
      }
      const safeName = (f.name || "ticket").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
      const uploaded = await put(`tickets/${eventKey}/files/${id}-${safeName}`, f, {
        access: "public",
        addRandomSuffix: false,
        contentType: f.type || "application/octet-stream",
      });
      fileUrl = uploaded.url;
      fileName = safeName;
    }

    const post: TicketPost = {
      id,
      eventKey,
      eventTitle,
      address: address || undefined,
      note: note || undefined,
      name: name || undefined,
      fileUrl,
      fileName,
      createdAt: new Date().toISOString(),
    };

    await put(`tickets/${eventKey}/posts/${id}.json`, JSON.stringify(post), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });

    return Response.json({ post }, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: "Could not save your post. Try again.", detail: String(err) },
      { status: 500 },
    );
  }
}
