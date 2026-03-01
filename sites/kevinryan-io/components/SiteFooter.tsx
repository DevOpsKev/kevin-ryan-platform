export default function SiteFooter(): React.JSX.Element {
  return (
    <footer
      style={{
        padding: '1.5rem 0',
        borderTop: '2px solid var(--accent)',
        background: 'var(--black)',
        color: 'var(--grey-600)',
      }}
    >
      <div
        className="flex justify-between items-center mx-auto"
        style={{
          maxWidth: '1400px',
          padding: '0 clamp(1.5rem, 5vw, 6rem)',
          fontSize: '0.72rem',
          letterSpacing: '0.05em',
        }}
      >
        <span>© {new Date().getFullYear()} Kevin Ryan. All rights reserved.</span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', opacity: 0.5 }}>
          {process.env.NEXT_PUBLIC_COMMIT_SHA}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Budapest · Dublin · <a href="https://devopskev.github.io/professional-hq/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-800)', textDecoration: 'none' }}>HQ</a>
        </span>
      </div>
    </footer>
  )
}
