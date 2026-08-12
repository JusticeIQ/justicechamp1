import { NextRequest, NextResponse } from "next/server";
import { listImportantDates, withBridgeData } from "@/lib/bridge-store";
import { ImportantDate, Notice } from "@/lib/types";

const WEBHOOK_SECRET = process.env.JUSTICECHAMP_WEBHOOK_SECRET || "demo-shared-secret-justiceiq-justicechamp";

function fmtDate(d: string) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

function newNoticeId() {
  return `notice-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Invalid webhook secret" }, { status: 401 });
  }

  let body: {
    action?: "create" | "update" | "cancel";
    id?: string; caseId?: string; caseName?: string; title?: string; date?: string; time?: string;
    description?: string; location?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!body.id || !body.caseId || !body.action) {
    return NextResponse.json({ ok: false, error: "id, caseId, and action are required" }, { status: 400 });
  }
  const { id, caseId, action } = body;

  // Each branch below reads and writes the bridge store exactly once (via
  // withBridgeData), so the important-date change and the notice that
  // describes it are saved together atomically. Doing this as two separate
  // read-modify-write calls (one for the date, one for the notice) used to
  // let the second call's read silently overwrite the first call's write.
  if (action === "create") {
    const outcome = await withBridgeData((data) => {
      const now = new Date().toISOString();
      const record: ImportantDate = {
        id,
        caseId,
        caseName: body.caseName || "Your case",
        title: body.title || "Important date",
        date: body.date || "",
        time: body.time,
        description: body.description || "",
        location: body.location,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
      const existingIdx = data.importantDates.findIndex((d) => d.id === id);
      if (existingIdx >= 0) data.importantDates[existingIdx] = record;
      else data.importantDates.push(record);

      const notice: Notice = {
        id: newNoticeId(),
        caseId,
        caseName: record.caseName,
        type: "important_date_added",
        subject: "New Important Date Added",
        message: `Your lawyer has added an important date to your case.\n\n${record.title}\n${fmtDate(record.date)}${record.time ? ` at ${record.time}` : ""}\n\nThe date has been added to your Important Dates calendar.`,
        firmName: "Your legal team",
        sendingLawyer: "Your lawyer",
        createdAt: now,
      };
      data.notices.push(notice);
      return record;
    });
    return NextResponse.json({ ok: true, id: outcome.id });
  }

  if (action === "update") {
    const existing = (await listImportantDates()).find((d) => d.id === id);
    const previousDate = existing?.date;
    const outcome = await withBridgeData((data) => {
      const idx = data.importantDates.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const record: ImportantDate = {
        ...data.importantDates[idx],
        caseName: body.caseName ?? data.importantDates[idx].caseName,
        title: body.title ?? data.importantDates[idx].title,
        date: body.date ?? data.importantDates[idx].date,
        time: body.time ?? data.importantDates[idx].time,
        description: body.description ?? data.importantDates[idx].description,
        location: body.location ?? data.importantDates[idx].location,
        updatedAt: new Date().toISOString(),
      };
      data.importantDates[idx] = record;

      const dateChanged = previousDate && body.date && previousDate !== body.date;
      const notice: Notice = {
        id: newNoticeId(),
        caseId,
        caseName: record.caseName,
        type: "important_date_changed",
        subject: "Important Date Changed",
        message: dateChanged
          ? `Your ${record.title.toLowerCase()} date has changed from ${fmtDate(previousDate!)} to ${fmtDate(record.date)}.`
          : `An important date in your case has been updated: ${record.title} — ${fmtDate(record.date)}${record.time ? ` at ${record.time}` : ""}.`,
        firmName: "Your legal team",
        sendingLawyer: "Your lawyer",
        createdAt: new Date().toISOString(),
      };
      data.notices.push(notice);
      return record;
    });
    if (!outcome) {
      return NextResponse.json({ ok: false, error: "Important date not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: outcome.id });
  }

  if (action === "cancel") {
    const outcome = await withBridgeData((data) => {
      const idx = data.importantDates.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const record: ImportantDate = { ...data.importantDates[idx], status: "cancelled", updatedAt: new Date().toISOString() };
      data.importantDates[idx] = record;

      const notice: Notice = {
        id: newNoticeId(),
        caseId,
        caseName: record.caseName,
        type: "important_date_cancelled",
        subject: "Important Date Cancelled",
        message: `The ${record.title.toLowerCase()} previously scheduled for ${fmtDate(record.date)} has been cancelled. Your legal team will provide additional information when available.`,
        firmName: "Your legal team",
        sendingLawyer: "Your lawyer",
        createdAt: new Date().toISOString(),
      };
      data.notices.push(notice);
      return record;
    });
    if (!outcome) {
      return NextResponse.json({ ok: false, error: "Important date not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: outcome.id });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ importantDates: await listImportantDates() });
}
