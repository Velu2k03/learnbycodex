"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page">
      <div className="empty-state" role="alert">
        <h1>We couldn’t open this part of your lab.</h1>
        <p>
          Your saved browser data has not been cleared. Try again, or return to
          your workspace.
        </p>
        <div className="action-row" style={{ justifyContent: "center" }}>
          <button className="button primary" onClick={reset}>
            Try again
          </button>
          <Link className="button secondary" href="/">
            Back to workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
