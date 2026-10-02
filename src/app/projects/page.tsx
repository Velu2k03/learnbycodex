import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { PageHeading, Badge } from "@/components/ui";
import { projects } from "@/data/projects";
export default function ProjectsPage() {
  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR FUTURE PORTFOLIO"
        title="Build things worth explaining."
        description="Three capstones for AI engineering, platforms, and automation. Start small; earn the complexity."
      />
      <div className="notice">
        These are original project briefs, ready to explore. They are not
        completed projects or full advanced courses. Your starter missions
        prepare you to tackle them.
      </div>
      <div className="stack">
        {projects.map((p) => (
          <article className="card project-card" key={p.id}>
            <div className="section-heading">
              <span className="project-number">CAPSTONE / {p.number}</span>
              <Badge>{p.level}</Badge>
            </div>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <div className="tech-tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <p>{p.why}</p>
            <details>
              <summary>Open the build brief</summary>
              <ol>
                {p.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <h3 className="small-heading">What good evidence looks like</h3>
              <ul className="list-clean">
                {p.acceptance.map((a) => (
                  <li key={a}>
                    <CheckCircle2 size={17} />
                    {a}
                  </li>
                ))}
              </ul>
              <div className="coach-box">
                <h3>
                  <Lightbulb size={17} />
                  Think like an engineer
                </h3>
                <p>{p.brainstorm}</p>
              </div>
              <h3 className="small-heading">Your smallest first version</h3>
              <p>{p.first}</p>
            </details>
            <div className="action-row">
              <Link href="/roadmap" className="text-link">
                Follow the prerequisites
                <ArrowRight size={15} />
              </Link>
              <Link href="/portfolio" className="text-link">
                Save repository evidence
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
