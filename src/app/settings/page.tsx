"use client";
import { useState } from "react";
import { Download, Settings2, Upload } from "lucide-react";
import { useLab } from "@/components/lab-provider";
import { PageHeading } from "@/components/ui";
import { restoreState, STORAGE_KEY } from "@/lib/progress";
import { downloadText } from "@/lib/download";
import { roles } from "@/data/curriculum";
import type { LabState } from "@/lib/types";
import {
  collectDrafts,
  parseBackupDrafts,
  writeRestoredBackup,
  type Drafts,
} from "@/lib/workbench-storage";
export default function SettingsPage() {
  const { state, setState, notify, storageError } = useLab();
  const [pending, setPending] = useState<LabState | null>(null);
  const [error, setError] = useState("");
  const [pendingDrafts, setPendingDrafts] = useState<Drafts>({});
  async function readBackup(file?: File) {
    if (!file) return;
    setError("");
    setPending(null);
    try {
      if (file.size > 12_000_000)
        throw new Error("Choose a Lab JSON backup smaller than 12 MB.");
      const raw = JSON.parse(await file.text());
      const drafts = parseBackupDrafts(raw.drafts);
      setPendingDrafts(drafts);
      setPending(restoreState(raw));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open that backup.");
    }
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="MAKE ROOM FOR YOUR PACE"
        title="Your lab, your rhythm."
        description="Adjust your daily target and keep a copy of your progress."
      />
      <div className="stack settings-card">
        <section className="card">
          <div className="card-heading">
            <Settings2 size={20} />
            <h2>Learning preferences</h2>
          </div>
          <label className="field">
            What should we call you?
            <input
              value={state.profile.name}
              maxLength={50}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  profile: { ...s.profile, name: e.target.value },
                }))
              }
            />
          </label>
          <label className="field">
            Daily time target
            <select
              value={state.profile.dailyMinutes}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  profile: {
                    ...s.profile,
                    dailyMinutes: Number(e.target.value),
                  },
                }))
              }
            >
              <option value={30}>30 minutes · a smaller daily step</option>
              <option value={60}>
                60 minutes · a balanced learning session
              </option>
              <option value={90}>90 minutes · room for a longer build</option>
            </select>
            <small>
              Missions are designed for about 60 minutes. Split one across days
              when your target is shorter.
            </small>
          </label>
          <label className="field">
            Current career focus
            <select
              value={state.profile.role}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  profile: { ...s.profile, role: e.target.value },
                }))
              }
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <p className="muted">
            Your starting point is beginner. AI platforms and automation remain
            part of your broader direction. Shared foundations come first.
          </p>
        </section>
        <section className="card">
          <h2>Keep your progress safe</h2>
          <p className="muted">
            This milestone saves in this browser, on this device. Clearing
            browser data removes that copy. There is no account or cloud sync
            yet. Your download folder is controlled by your browser—choose an F:
            folder when saving a backup.
          </p>
          <div className="action-row">
            <button
              className="button primary"
              onClick={() => {
                try {
                  downloadText(
                    "drvelu-lab-backup.json",
                    JSON.stringify(
                      { ...state, ...collectDrafts(localStorage) },
                      null,
                      2,
                    ),
                  );
                } catch {
                  setError(
                    "Could not read editor drafts. Your original browser data is unchanged.",
                  );
                }
              }}
            >
              <Download size={16} />
              Export my progress
            </button>
            <button
              className="button secondary"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(STORAGE_KEY);
                  if (!raw) {
                    notify("No saved browser record was found.");
                    return;
                  }
                  downloadText("drvelu-lab-original-save.json", raw);
                } catch {
                  notify("The browser is blocking access to its stored data.");
                }
              }}
            >
              Download original saved data
            </button>
          </div>
          <div className="divider" />
          <label className="field">
            <span>
              <Upload size={15} /> Restore a Lab backup
            </span>
            <input
              className="file-input"
              type="file"
              accept="application/json,.json"
              onChange={(e) => readBackup(e.target.files?.[0])}
            />
            <small>
              Preview the backup before replacing the progress in this browser.
              Included editor drafts are restored too; existing drafts absent
              from the backup stay intact. Damaged raw drafts are retained in
              exports for manual recovery. GitHub checks must be run again after
              importing.
            </small>
          </label>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          {pending && (
            <div className="coach-box">
              <h3>Backup preview</h3>
              <p>
                {pending.profile.name} ·{" "}
                {
                  Object.values(pending.missions).filter((m) => m.completedAt)
                    .length
                }{" "}
                completed missions · {pending.profile.dailyMinutes} minutes/day
                · {Object.keys(pendingDrafts).length} editor drafts
              </p>
              <p>
                This replaces the current local progress. Export your current
                progress first if you want to keep it.
              </p>
              <div className="action-row">
                <button
                  className="button primary"
                  onClick={() => {
                    try {
                      writeRestoredBackup(
                        localStorage,
                        STORAGE_KEY,
                        pending,
                        pendingDrafts,
                      );
                      window.location.reload();
                    } catch {
                      setError(
                        "The browser could not save the restored backup. Your current in-memory progress is still available.",
                      );
                    }
                  }}
                >
                  Replace with this backup
                </button>
                <button
                  className="button secondary"
                  onClick={() => setPending(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {storageError && (
            <p className="provider-note">
              Automatic saving is paused or unavailable. Download the original
              data and your current progress separately before attempting
              recovery.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
