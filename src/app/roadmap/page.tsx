"use client";
import Link from "next/link";
import { ArrowRight, Check, Flag, LockKeyhole } from "lucide-react";
import { PageHeading, Badge } from "@/components/ui";
import { useLab } from "@/components/lab-provider";
import { levels, missions } from "@/data/curriculum";
import { currentMission } from "@/lib/progress";
export default function RoadmapPage() {
  const { state } = useLab();
  const current = currentMission(state);
  const phases = [...new Set(levels.map((l) => l[2]))];
  return (
    <div className="page">
      <PageHeading
        eyebrow="THE BIG PICTURE"
        title="A path, not a pile of courses."
        description="Foundations first. AI engineering next. One practical milestone at a time."
      />
      <div className="notice">
        Your first six missions are ready inside the Lab. Levels 6–18 are the
        planned curriculum; their complete lessons are still to be built.
        Preview any available mission, or follow the suggested order.
      </div>
      {phases.map((phase, p) => (
        <section className="roadmap-phase" key={phase}>
          <div className="phase-title">
            <span>PHASE 0{p + 1}</span>
            <h2>{phase}</h2>
          </div>
          {levels.map((level, i) => {
            if (level[2] !== phase) return null;
            const mission = missions.find((m) => m.level === i);
            const done = mission && !!state.missions[mission.id]?.completedAt;
            const active = mission?.id === current.id && !done;
            return (
              <article
                className={`roadmap-item ${active ? "current" : ""} ${done ? "completed" : ""} ${!mission ? "planned" : ""}`}
                key={level[0]}
              >
                <span className="level-number">
                  {done ? (
                    <Check size={20} />
                  ) : !mission ? (
                    <LockKeyhole size={17} />
                  ) : (
                    String(i).padStart(2, "0")
                  )}
                </span>
                <div>
                  <h3>{level[0]}</h3>
                  <p>{level[1]}</p>
                </div>
                <div className="roadmap-meta">
                  <Badge tone={done ? "green" : mission ? "blue" : "neutral"}>
                    {done
                      ? "Complete"
                      : active
                        ? "Current mission"
                        : mission
                          ? "Later · preview open"
                          : "Not built yet"}
                  </Badge>
                  {mission && (
                    <Link className="text-link" href={`/mission/${mission.id}`}>
                      {done
                        ? "Review"
                        : mission.id === current.id
                          ? "Your next step"
                          : "Preview"}
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ))}
      <div className="card">
        <div className="card-heading">
          <Flag size={20} />
          <h2>Where this leads</h2>
        </div>
        <p className="muted">
          A hybrid RAG pipeline, an agent orchestration system, and an LLM
          gateway—with GitHub evidence and a resume grounded in what you
          actually built.
        </p>
        <div className="action-row">
          <Link className="button primary" href="/projects">
            Explore the project briefs
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
