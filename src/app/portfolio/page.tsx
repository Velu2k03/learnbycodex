"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  GitFork,
  RefreshCw,
} from "lucide-react";
import { PageHeading, Badge, ExternalLink } from "@/components/ui";
import { useLab } from "@/components/lab-provider";
import { parseGithubUrl, validatedEvidence } from "@/lib/progress";
import { missions } from "@/data/curriculum";
export default function PortfolioPage() {
  const { state, setState, notify } = useLab();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function check(value: string) {
    setError("");
    if (!parseGithubUrl(value)) {
      setError(
        "Enter the repository homepage: https://github.com/your-name/your-project",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/github?url=${encodeURIComponent(value)}`,
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "The repository could not be checked.");
      const evidence = validatedEvidence([result])[0];
      if (!evidence) throw new Error("GitHub returned an incomplete result.");
      setState((s) => ({
        ...s,
        evidence: [
          ...s.evidence.filter((e) => e.url !== evidence.url),
          evidence,
        ].slice(-20),
      }));
      notify("Repository metadata checked and saved.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="PROOF OF YOUR PROGRESS"
        title="Your work deserves a home."
        description="Build in your own repositories. Make each project easy to understand, run, and review."
      />
      <div className="two-columns">
        <section className="card">
          <div className="card-heading">
            <GitFork size={21} />
            <h2>Check a public GitHub repository</h2>
          </div>
          <p className="muted">
            This reads repository details, README availability, the latest
            commit, and language metadata. It does not change your repository.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              check(url);
            }}
          >
            <label className="field" style={{ marginTop: 20 }}>
              Repository URL
              <input
                type="url"
                required
                maxLength={300}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/your-name/ai-learning-lab"
              />
            </label>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? "Checking GitHub…" : "Check repository"}
              <ArrowRight size={16} />
            </button>
          </form>
          {error && (
            <div
              className="notice error"
              role="alert"
              style={{ marginTop: 20 }}
            >
              {error}
            </div>
          )}
          <p className="provider-note">
            Public repositories only. Ownership, authorship, code quality,
            tests, and deployment are not verified. GitHub OAuth comes in a
            later milestone.
          </p>
        </section>
        <section className="card">
          <h2>A repository someone else can use</h2>
          <ul className="list-clean">
            {[
              "A clear purpose and a working example",
              "Setup and run instructions",
              "Architecture and important decisions",
              "Actual tests and evaluation results",
              "Screenshots or a working demo",
              "Limitations, lessons, and next steps",
            ].map((t) => (
              <li key={t}>
                <CheckCircle2 size={17} />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/mission/your-first-repository" className="text-link">
            Learn how to publish your first repository
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <div className="section-heading" style={{ marginTop: 32 }}>
        <h2>Saved repository observations</h2>
        <span>{state.evidence.length} repositories</span>
      </div>
      {state.evidence.length === 0 ? (
        <div className="empty-state">
          <GitFork size={31} />
          <h3>Your first project goes here.</h3>
          <p>
            Start with your learning log. A small, well-explained project is a
            useful first piece of evidence.
          </p>
        </div>
      ) : (
        <div className="two-columns">
          {state.evidence.map((e) => (
            <article className="card" key={e.url}>
              <div className="section-heading">
                <h3>{e.name}</h3>
                <Badge tone="green">Metadata checked</Badge>
              </div>
              <p className="muted">
                {e.description || "No repository description was set."}
              </p>
              <div className="check-grid" style={{ marginTop: 17 }}>
                <span>
                  {e.readme ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  README {e.readme ? "found" : "not found"}
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  Commit {e.commit.slice(0, 7)}
                </span>
              </div>
              <div className="role-chips">
                {e.languages.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              <p className="provider-note">
                Checked{" "}
                {new Date(e.checkedAt).toLocaleDateString("en-PH", {
                  timeZone: "Asia/Manila",
                })}
                . This observation does not verify authorship or skill.
              </p>
              <div className="action-row">
                <ExternalLink href={e.url}>Open repository</ExternalLink>
                <button
                  className="text-button"
                  disabled={loading}
                  onClick={() => check(e.url)}
                >
                  <RefreshCw size={12} /> Recheck
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="section-heading" style={{ marginTop: 32 }}>
        <h2>Mission evidence</h2>
      </div>
      <div className="path-list">
        {missions.map((m) => (
          <Link className="path-row" href={`/mission/${m.id}`} key={m.id}>
            <span className="path-index">{m.level + 1}</span>
            <div>
              <h3>{m.title}</h3>
              <small>
                {state.missions[m.id]?.buildNotes
                  ? "BUILD NOTES SAVED"
                  : "NO BUILD NOTES YET"}
              </small>
            </div>
            <Badge
              tone={state.missions[m.id]?.completedAt ? "green" : "neutral"}
            >
              {state.missions[m.id]?.completedAt
                ? "Milestone complete"
                : "In progress / not started"}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
