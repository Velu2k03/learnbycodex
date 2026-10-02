"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { initialState, emptyProgress, restoreState, STORAGE_KEY, canComplete, validatedEvidence } from "@/lib/progress";
import { missionById } from "@/data/curriculum";
import type { LabState, MissionProgress } from "@/lib/types";

type Context = { state: LabState; ready: boolean; storageError: string; setState: React.Dispatch<React.SetStateAction<LabState>>; updateMission: (id: string, patch: Partial<MissionProgress>) => void; complete: (id: string) => boolean; notify: (message: string) => void };
const LabContext = createContext<Context | null>(null);
export function LabProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LabState>(initialState); const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(""); const [toast, setToast] = useState(""); const [storageBlocked, setStorageBlocked] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) {
    const parsed = JSON.parse(saved); const restored = restoreState(parsed);
    // Repository checks are retained locally; importing a backup discards them.
    restored.evidence = validatedEvidence(parsed.evidence);
    setState(restored);
  } } catch { setStorageBlocked(true); setStorageError("Saved progress could not be opened. The original is preserved; automatic saving is paused. Use Preferences to download the original saved data for recovery."); } setReady(true);
    const onStorage = (event: StorageEvent) => { if(event.key === STORAGE_KEY) { setStorageBlocked(true); setStorageError("Progress changed in another tab. Export this tab's progress if needed, then reload to open the latest saved version. Saving here is paused to prevent overwriting it."); } };
    window.addEventListener("storage", onStorage); return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => { if (!ready || storageBlocked) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { setStorageError("This browser could not save your progress. Export a backup before closing."); } }, [state, ready, storageBlocked]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4500); return () => clearTimeout(timer); }, [toast]);
  const updateMission = useCallback((id: string, patch: Partial<MissionProgress>) => setState(previous => {
    const updated = { ...(previous.missions[id] ?? emptyProgress()), ...patch }; const mission = missionById(id);
    if (mission && updated.completedAt && !canComplete(mission, updated)) delete updated.completedAt;
    return { ...previous, missions: { ...previous.missions, [id]: updated } };
  }), []);
  function complete(id: string) { const mission = missionById(id); const progress = state.missions[id] ?? emptyProgress(); if (!mission || !canComplete(mission, progress)) return false;
    updateMission(id, { completedAt: new Date().toISOString() }); setToast("Mission complete. You built something today."); return true;
  }
  return <LabContext.Provider value={{ state, ready, storageError, setState, updateMission, complete, notify: setToast }}>{children}{toast && <div className="toast" role="status">{toast}</div>}</LabContext.Provider>;
}
export function useLab() { const context = useContext(LabContext); if (!context) throw new Error("LabProvider is required"); return context; }
