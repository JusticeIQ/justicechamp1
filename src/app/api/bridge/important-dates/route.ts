import { NextRequest, NextResponse } from "next/server";
import { addNotice, cancelImportantDate, createImportantDate, listImportantDates, updateImportantDate } from "@/lib/bridge-store";
import { Notice } from "@/lib/types";

const WEBHOOK_SECRET = process.env.JUSTICECHAMP_WEBHOOK_SECRET || "demo-shared-secret-justiceiq-justicechamp";

function fmtDate(d: string) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
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

  const existing = listImportantDates().find((d) => d.id === body.id);

  if (body.action === "create") {
    const record = createImportantDate({
      id: body.id,
      caseId: body.caseId,
      caseName: body.caseName || "Your case",
      title: body.title || "Important date",
      date: body.date || "",
      time: body.time,
      description: body.description || "",
      location: body.location,
    });
    const notice: Notice = {
      id: `notice-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      caseId: body.caseId,
      caseName: record.caseName,
      type: "important_date_added",
      subject: "New Important Date Added",
      message: `Your lawyer has added an important date to your case.\n\n${record.title}\n${fmtDate(record.date)}${record.time ? ` at ${record.time}` : ""}\n\nThe date has been added to your Important Dates calendar.`,
      firmName: "Your legal team",
      sendingLawyer: "Your lawyer",
      createdAt: new Date().toISOString(),
    };
    addNotice(notice);
    return NextResponse.json({ ok: true, id: record.id });
  }

  if (body.action === "update") {
    const previousDate = existing?.date;
    const record = updateImportantDate(body.id, {
      caseName: body.caseName ?? existing?.caseName,
      title: body.title ?? existing?.title,
      date: body.date ?? existing?.date,
      time: body.time ?? existing?.time,
      description: body.description ?? existing?.description,
      location: body.location ?? existing?.location,
    });
    if (!record) {
      return NextResponse.json({ ok: false, error: "Important date not found" }, { status: 404 });
    }
    const dateChanged = previousDate && body.date && previousDate !== body.date;
    const notice: Notice = {
      id: `notice-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      caseId: body.caseId,
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
    addNotice(notice);
    return NextResponse.json({ ok: true, id: record.id });
  }

  if (body.action === "cancel") {
    const record = cancelImportantDate(body.id);
    if (!record) {
      return NextResponse.json({ ok: false, error: "Important date not found" }, { status: 404 });
    }
    const notice: Notice = {
      id: `notice-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      caseId: body.caseId,
      caseName: record.caseName,
      type: "important_date_cancelled",
      subject: "Important Date Cancelled",
      message: `The ${record.title.toLowerCase()} previously scheduled for ${fmtDate(record.date)} has been cancelled. Your legal team will provide additional information when available.`,
      firmName: "Your legal team",
      sendingLawyer: "Your lawyer",
      createdAt: new Date().toISOString(),
    };
    addNotice(notice);
    return NextResponse.json({ ok: true, id: record.id });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ importantDates: listImportantDates() });
}
