import { missions } from "@/data/curriculum";
export const draftFileNames = [
  "index.html",
  "styles.css",
  "script.js",
  "main.py",
  "query.sql",
  "main.js",
  "data.json",
  "notes.md",
  "commands.ps1",
] as const;
export type DraftFileName = (typeof draftFileNames)[number];
export type DraftFiles = Partial<Record<DraftFileName, string>>;
export type Drafts = Record<string, DraftFiles>;
export const draftKey = (id: string) => `drvelu-workbench-${id}`;
export function parseDraft(raw: unknown): DraftFiles {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("files" in raw) ||
    !raw.files ||
    typeof raw.files !== "object" ||
    Array.isArray(raw.files)
  )
    throw new Error("The saved editor draft has an invalid format.");
  const files: DraftFiles = {};
  for (const name of draftFileNames) {
    const content = (raw.files as Record<string, unknown>)[name];
    if (content === undefined) continue;
    if (typeof content !== "string" || content.length > 120000)
      throw new Error(
        "A saved file is invalid or exceeds the editor limit. The original has been preserved.",
      );
    files[name] = content;
  }
  return files;
}
export function collectDrafts(storage: Pick<Storage, "getItem">): {
  drafts: Drafts;
  rawDrafts: Record<string, string>;
} {
  const drafts: Drafts = {};
  const rawDrafts: Record<string, string> = {};
  for (const mission of missions) {
    const raw = storage.getItem(draftKey(mission.id));
    if (raw === null) continue;
    try {
      drafts[mission.id] = parseDraft(JSON.parse(raw));
    } catch {
      rawDrafts[mission.id] = raw;
    }
  }
  return { drafts, rawDrafts };
}
export function parseBackupDrafts(raw: unknown): Drafts {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Invalid editor drafts in this backup.");
  const drafts: Drafts = {};
  for (const mission of missions) {
    const files = (raw as Record<string, unknown>)[mission.id];
    if (files !== undefined) drafts[mission.id] = parseDraft({ files });
  }
  return drafts;
}
export function writeRestoredBackup(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  progressKey: string,
  state: unknown,
  drafts: Drafts,
) {
  const entries = Object.entries(drafts).map(
    ([id, files]) => [draftKey(id), JSON.stringify({ files })] as const,
  );
  const writes = [...entries, [progressKey, JSON.stringify(state)] as const];
  const originals = writes.map(([key]) => [key, storage.getItem(key)] as const);
  let written = 0;
  try {
    for (const [key, value] of writes) {
      storage.setItem(key, value);
      written += 1;
    }
  } catch (error) {
    // setItem is atomic. Reverse only successful writes so quota is released
    // before restoring an earlier, larger original record.
    for (const [key, value] of originals.slice(0, written).reverse()) {
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        /* Preserve what can be recovered; caller shows failure. */
      }
    }
    throw error;
  }
}
