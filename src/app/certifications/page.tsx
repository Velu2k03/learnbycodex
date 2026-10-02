"use client";
import { PageHeading, Badge, ExternalLink } from "@/components/ui";
import { useLab } from "@/components/lab-provider";
import { certifications } from "@/data/resources";
import { safeExternalUrl } from "@/lib/progress";
export default function CertificationsPage() {
  const { state, setState } = useLab();
  return (
    <div className="page">
      <PageHeading
        eyebrow="CREDENTIALS WITH A PURPOSE"
        title="Build skills. Then make them visible."
        description="Keep official learning, exam requirements, and your certificate links together."
      />
      <div className="notice">
        Provider details reviewed on 2 October 2026. Requirements and
        availability can change; use the official source before enrolling. The
        Lab does not issue these credentials. Completion statuses are
        self-reported.
      </div>
      <div className="two-columns">
        {certifications.map((c) => {
          const progress = state.certificates[c.id] ?? {
            status: "Not started",
            url: "",
          };
          const update = (patch: Partial<typeof progress>) =>
            setState((s) => ({
              ...s,
              certificates: {
                ...s.certificates,
                [c.id]: { ...progress, ...patch },
              },
            }));
          return (
            <article className="card resource-card cert-card" key={c.id}>
              <span className="small-label">{c.provider}</span>
              <h3>{c.name}</h3>
              <Badge tone="green">{c.focus}</Badge>
              <dl className="cert-meta">
                <div>
                  <dt>COST</dt>
                  <dd>{c.cost}</dd>
                </div>
                <div>
                  <dt>COMMITMENT</dt>
                  <dd>{c.duration}</dd>
                </div>
                <div>
                  <dt>CREDENTIAL</dt>
                  <dd>{c.credential}</dd>
                </div>
                <div>
                  <dt>VALIDITY</dt>
                  <dd>{c.validity}</dd>
                </div>
              </dl>
              <p>{c.requirements}</p>
              <details>
                <summary>Eligibility, source & content permissions</summary>
                <p>{c.prerequisite}</p>
                <p>{c.license}</p>
                <ExternalLink href={c.source}>
                  Check official requirements
                </ExternalLink>
              </details>
              <label className="field">
                My progress
                <select
                  value={progress.status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  <option>Not started</option>
                  <option>In progress</option>
                  <option>Completed</option>
                </select>
              </label>
              <label className="field">
                My certificate or badge URL
                <input
                  value={progress.url}
                  onChange={(e) => update({ url: e.target.value })}
                  type="url"
                  maxLength={500}
                  placeholder="https://…"
                />
                {progress.url && !safeExternalUrl(progress.url) && (
                  <small>Enter a complete HTTPS certificate URL.</small>
                )}
              </label>
              <div className="resource-footer">
                <ExternalLink href={c.url}>Official course / exam</ExternalLink>
                {safeExternalUrl(progress.url) && (
                  <ExternalLink href={safeExternalUrl(progress.url)!}>
                    My credential
                  </ExternalLink>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="certificate-note">
        Certificate validity and ownership are not automatically verified in
        this milestone. Save separate certificate and badge links in your
        learning log if a provider issues both.
      </p>
    </div>
  );
}
