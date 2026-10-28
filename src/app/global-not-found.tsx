const wrap: React.CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f1ece1",
  color: "#14241b",
  fontFamily:
    "'Archivo', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

/**
 * Global 404 for unmatched routes (app has two root layouts, (site) and
 * (payload), so globals.css and the brand fonts are not loaded). Styled inline
 * to stay on-brand regardless. Most 404s render the localized page instead.
 */
export default function NotFound() {
  return (
    <html lang="fi">
      <body style={wrap}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p
            style={{
              fontSize: "clamp(5rem, 18vw, 11rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: 0,
            }}
          >
            404
          </p>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontFamily: "ui-monospace, 'IBM Plex Mono', monospace",
            }}
          >
            Sivua ei löytynyt · Page not found
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "2.5rem",
              padding: "1rem 1.75rem",
              background: "#14241b",
              color: "#f1ece1",
              textDecoration: "none",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontFamily: "ui-monospace, 'IBM Plex Mono', monospace",
            }}
          >
            Etusivulle / Home
          </a>
        </div>
      </body>
    </html>
  );
}
