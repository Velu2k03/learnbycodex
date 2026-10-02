export default function Loading() {
  return (
    <div
      className="page"
      role="status"
      aria-label="Loading your learning workspace"
    >
      <div className="loading-skeleton title" />
      <div className="loading-skeleton subtitle" />
      <div className="loading-skeleton panel" />
      <p className="muted">Opening your next step…</p>
    </div>
  );
}
