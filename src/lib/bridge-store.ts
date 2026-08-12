import { get, put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { ImportantDate, Notice } from "./types";

// Server-only store for data pushed in from JusticeIQ over the bridge API.
// This is intentionally separate from the client-side demo store
// (src/lib/store.tsx, which is localStorage-backed) because this data
// originates server-side, from another app, and must be visible to every
// browser tab polling this JusticeChamp instance -- not just the tab that
// happened to trigger it.
//
// In production this is backed by Vercel Blob (persists across serverless
// invocations/instances). Locally, without a BLOB_READ_WRITE_TOKEN, it
// falls back to a JSON file on disk -- fine for a single long-lived dev
// server process, but NOT reliable on Vercel, where process.cwd() is
// read-only and every request can land on a different, short-lived
// instance with its own /tmp. See docs/ROADMAP.md for the real long-term
// fix (a hosted DB) if this ever needs to be more than a demo.

interface BridgeData {
  notices: Notice[];
  importantDates: ImportantDate[];
}

const EMPTY_DATA: BridgeData = { notices: [], importantDates: [] };

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_PATHNAME = "bridge-store.json";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bridge-store.json");

function normalize(parsed: unknown): BridgeData {
  const p = (parsed ?? {}) as Partial<BridgeData>;
  return { notices: p.notices ?? [], importantDates: p.importantDates ?? [] };
}

async function readData(): Promise<BridgeData> {
  if (USE_BLOB) {
    try {
      const result = await get(BLOB_PATHNAME, { access: "private" });
      if (!result) return { ...EMPTY_DATA };
      const text = await new Response(result.stream).text();
      return normalize(JSON.parse(text));
    } catch {
      return { ...EMPTY_DATA };
    }
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return normalize(JSON.parse(raw));
  } catch {
    return { ...EMPTY_DATA };
  }
}

async function writeData(data: BridgeData): Promise<void> {
  if (USE_BLOB) {
    try {
      await put(BLOB_PATHNAME, JSON.stringify(data), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } catch {
      // Best-effort: if the blob write fails, the bridge falls back to
      // in-memory-only for that request lifecycle.
    }
    return;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Best-effort: if the filesystem is read-only, fall back to
    // in-memory-only for that request lifecycle.
  }
}

export async function listNotices(): Promise<Notice[]> {
  const data = await readData();
  return data.notices.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listImportantDates(): Promise<ImportantDate[]> {
  const data = await readData();
  return data.importantDates.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export async function addNotice(notice: Notice): Promise<Notice> {
  const data = await readData();
  data.notices.push(notice);
  await writeData(data);
  return notice;
}

export async function createImportantDate(
  input: Omit<ImportantDate, "createdAt" | "updatedAt" | "status">
): Promise<ImportantDate> {
  const data = await readData();
  const now = new Date().toISOString();
  const record: ImportantDate = { ...input, status: "active", createdAt: now, updatedAt: now };
  const existingIdx = data.importantDates.findIndex((d) => d.id === input.id);
  if (existingIdx >= 0) {
    data.importantDates[existingIdx] = record;
  } else {
    data.importantDates.push(record);
  }
  await writeData(data);
  return record;
}

export async function updateImportantDate(
  id: string,
  updates: Partial<ImportantDate>
): Promise<ImportantDate | null> {
  const data = await readData();
  const idx = data.importantDates.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  data.importantDates[idx] = { ...data.importantDates[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeData(data);
  return data.importantDates[idx];
}

export async function cancelImportantDate(id: string): Promise<ImportantDate | null> {
  return updateImportantDate(id, { status: "cancelled" });
}
