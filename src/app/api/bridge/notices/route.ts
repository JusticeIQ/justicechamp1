import { NextRequest, NextResponse } from "next/server";
import { addNotice, listNotices } from "@/lib/bridge-store";
import { Notice } from "@/lib/types";

// Inbound webhook from JusticeIQ: creates a Notice once a lawyer has
// explicitly approved and sent a client update. See docs/INTEGRATION_SPEC.md
// ("Authentication between systems").
const WEBHOOK_SECRET = process.env.JUSTICECHAMP_WEBHOOK_SECRET || "demo-shared-secret-justiceiq-justicechamp";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Invalid webhook secret" }, { status: 401 });
  }

  let body: {
    caseId?: string; caseName?: string; subject?: string; message?: string; sendingLawyer?: string; firmName?: string; sentAt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!body.caseId || !body.message) {
    return NextResponse.json({ ok: false, error: "caseId and message are required" }, { status: 400 });
  }

  const notice: Notice = {
    id: `notice-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    caseId: body.caseId,
    caseName: body.caseName || "Your case",
    type: "case_update",
    subject: body.subject || "Case Update",
    message: body.message,
    firmName: body.firmName || "Your legal team",
    sendingLawyer: body.sendingLawyer || "Your lawyer",
    createdAt: body.sentAt || new Date().toISOString(),
  };

  await addNotice(notice);
  return NextResponse.json({ ok: true, id: notice.id });
}

export async function GET() {
  return NextResponse.json({ notices: await listNotices() });
}
