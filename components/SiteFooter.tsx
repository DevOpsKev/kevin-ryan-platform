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
        <span
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Budapest · Dublin
        </span>
      </div>
    </footer>
  )
}
