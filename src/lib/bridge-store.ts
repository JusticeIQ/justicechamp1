import fs from "fs";
import os from "os";
import path from "path";
import { ImportantDate, Notice } from "./types";

// Server-only JSON-file-backed store for data pushed in from JusticeIQ over
// the local bridge API. This is intentionally separate from the client-side
// demo store (src/lib/store.tsx, which is localStorage-backed) because this
// data originates server-side, from another app, and must be visible to
// every browser tab polling this JusticeChamp instance — not just the tab
// that happened to trigger it.
//
// This is a demo-appropriate persistence layer (a JSON file next to the
// dev server), not a production data store. See docs/ROADMAP.md.

interface BridgeData {
  notices: Notice[];
  importantDates: ImportantDate[];
}

// Vercel's deployment bundle (process.cwd()) is read-only at runtime, so a
// local "data/" folder only works for local dev. In production (and any
// other read-only serverless filesystem) we fall back to the OS tmp dir,
// which is writable. This is still a demo-appropriate, best-effort store
// (not guaranteed to survive across cold starts/instances) -- see
// docs/ROADMAP.md for the real fix (a hosted KV/DB).
const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "justicechamp-bridge") : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bridge-store.json");

function readData(): BridgeData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { notices: parsed.notices ?? [], importantDates: parsed.importantDates ?? [] };
  } catch {
    return { notices: [], importantDates: [] };
  }
}

function writeData(data: BridgeData) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Best-effort: if the filesystem is read-only (e.g. some serverless hosts),
    // the bridge falls back to in-memory-only for that request lifecycle.
  }
}

export function listNotices(): Notice[] {
  return readData().notices.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listImportantDates(): ImportantDate[] {
  return readData().importantDates.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function addNotice(notice: Notice): Notice {
  const data = readData();
  data.notices.push(notice);
  writeData(data);
  return notice;
}

export function createImportantDate(input: Omit<ImportantDate, "createdAt" | "updatedAt" | "status">): ImportantDate {
  const data = readData();
  const now = new Date().toISOString();
  const record: ImportantDate = { ...input, status: "active", createdAt: now, updatedAt: now };
  const existingIdx = data.importantDates.findIndex((d) => d.id === input.id);
  if (existingIdx >= 0) {
    data.importantDates[existingIdx] = record;
  } else {
    data.importantDates.push(record);
  }
  writeData(data);
  return record;
}

export function updateImportantDate(id: string, updates: Partial<ImportantDate>): ImportantDate | null {
  const data = readData();
  const idx = data.importantDates.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  data.importantDates[idx] = { ...data.importantDates[idx], ...updates, updatedAt: new Date().toISOString() };
  writeData(data);
  return data.importantDates[idx];
}

export function cancelImportantDate(id: string): ImportantDate | null {
  return updateImportantDate(id, { status: "cancelled" });
}
