import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page">
      <div className="empty-state">
        <h1>This page is still off the map.</h1>
        <p>Head back to your workspace to find your next mission.</p>
        <Link className="button primary" href="/">
          Back to my workspace
        </Link>
      </div>
    </div>
  );
}
