/** Put the restrictive policy before all learner HTML, including headless documents. */
export function previewDocument(html: string, css: string, javascript: string) {
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'">`;
  const bridge = `<script>(() => {
    const text = value => { try { return typeof value === "string" ? value : JSON.stringify(value); } catch { return String(value); } };
    for (const level of ["log", "info", "warn", "error"]) {
      const original = console[level].bind(console);
      console[level] = (...values) => { original(...values); parent.postMessage({ source: "drvelu-preview", error: level === "error", text: values.map(text).join(" ") }, "*"); };
    }
    addEventListener("error", event => parent.postMessage({ source: "drvelu-preview", error: true, text: event.message }, "*"));
  })();</script>`;
  // Learner markup stays inside the trusted shell. Additional policies can only
  // restrict this policy; missing/malformed learner head tags cannot remove it.
  return `<!doctype html><html><head>${policy}${bridge}<style>${css}</style></head><body>${html}<script>${javascript}</script></body></html>`;
}
