"use client";

import { useEffect, useRef, useState } from "react";

interface TicketPost {
  id: string;
  address?: string;
  note?: string;
  name?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function TicketModal({
  eventKey,
  eventTitle,
  onClose,
}: {
  eventKey: string;
  eventTitle: string;
  onClose: () => void;
}) {
  const [posts, setPosts] = useState<TicketPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    try {
      const r = await fetch(`/api/tickets?event=${encodeURIComponent(eventKey)}`, {
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load");
      setPosts(j.posts as TicketPost[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setPosts([]);
    }
  }

  useEffect(() => {
    load();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("event", eventKey);
    fd.set("eventTitle", eventTitle);
    setSubmitting(true);
    try {
      const r = await fetch("/api/tickets", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to post");
      form.reset();
      setPosts((prev) => [j.post as TicketPost, ...(prev ?? [])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-lineStrong bg-bg2 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div>
            <div className="font-display text-[11px] uppercase tracking-[0.18em] text-muted2">
              🎟 Tickets &amp; address
            </div>
            <h3 className="mt-1 font-display text-[16px] font-semibold leading-tight">
              {eventTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[13px] text-muted hover:border-lineStrong hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* posts */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <p className="text-[12.5px] text-muted2">
            Shared by the community — spare tickets, the real venue address, or tips to get
            in. Anyone can view and add.
          </p>
          {posts === null ? (
            <div className="py-8 text-center text-[13px] text-muted">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-8 text-center text-[13px] text-muted">
              Nothing shared yet. Be the first to post the address or a spare ticket.
            </div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-line bg-white/[0.03] p-3">
                <div className="mb-1 flex items-center gap-2 text-[12px] text-muted2">
                  <span className="font-medium text-muted">{p.name || "Anonymous"}</span>
                  <span>·</span>
                  <span>{timeAgo(p.createdAt)}</span>
                </div>
                {p.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-1 flex items-start gap-1.5 text-[14px] text-cyan hover:underline"
                  >
                    <span>📍</span>
                    <span>{p.address}</span>
                  </a>
                )}
                {p.note && <p className="whitespace-pre-wrap text-[13.5px] text-ink">{p.note}</p>}
                {p.fileUrl && (
                  <a
                    href={p.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.04] px-2.5 py-1.5 text-[12.5px] text-ink hover:border-lineStrong"
                  >
                    🎟 {p.fileName || "View ticket"}
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* form */}
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="space-y-2.5 border-t border-line p-4"
        >
          <input
            name="address"
            placeholder="Venue address (optional)"
            maxLength={300}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-[14px] outline-none placeholder:text-muted2 focus:border-white/40"
          />
          <textarea
            name="note"
            placeholder="Note — spare ticket details, how to get in, a +1 code…"
            maxLength={1000}
            rows={2}
            className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-[14px] outline-none placeholder:text-muted2 focus:border-white/40"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="name"
              placeholder="Your name (optional)"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[13px] outline-none placeholder:text-muted2 focus:border-white/40"
            />
            <label className="cursor-pointer rounded-lg border border-line bg-bg px-3 py-2 text-[13px] text-muted hover:border-lineStrong hover:text-ink">
              📎 Ticket
              <input
                type="file"
                name="file"
                accept="image/*,application/pdf"
                className="hidden"
              />
            </label>
          </div>
          {error && <p className="text-[12.5px] text-coral">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-white/90 py-2.5 text-[14px] font-semibold text-bg transition-opacity hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post to the board"}
          </button>
          <p className="text-center text-[11px] text-muted2">
            Public board · don’t share anything you wouldn’t want everyone to see.
          </p>
        </form>
      </div>
    </div>
  );
}
