import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap not-found">
      <span className="code" aria-hidden="true">
        404
      </span>
      <span className="label">Specimen not found</span>
      <p className="dim" style={{ maxWidth: "40ch" }}>
        Nothing is catalogued at this address. It may have moved, or it hasn&apos;t left the bench yet.
      </p>
      <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-ghost">
          Lab index
        </Link>
        <Link href="/forge" className="btn btn-primary">
          Open Prompt Forge <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
