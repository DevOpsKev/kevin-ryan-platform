import { CONTAINER } from "@/lib/constants"

export default function AboutSection() {
  return (
    <section className="section section--grey" id="about">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">01</div>
          <div>
            <div className="section__subtitle">About</div>
            <h2 className="display-lg">Breadth<br />Is Depth</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'calc(2rem * 3)' }}>
          <div className="reveal">
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '60ch', marginBottom: '1.5rem' }}>
              Most DevOps contractors are infrastructure specialists who have never managed a client engagement, or consultants who have never built a production pipeline. I have done both. What sets me apart is a rare combination: I can build the pipeline architecture, operate the platform, and run the programme that scales delivery across the enterprise.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '60ch', marginBottom: '1.5rem' }}>
              The industry is shifting toward engineers whose breadth lets them leverage AI across the full delivery lifecycle. Thirty years spanning code, architecture, platform engineering, delivery, and governance means AI amplifies what I already know — and you cannot shortcut that context.
            </p>
            <blockquote style={{
              borderLeft: '4px solid var(--accent)', paddingLeft: '1.5rem',
              fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.65,
              marginTop: '2.5rem', maxWidth: '50ch',
            }}>
              &ldquo;AI-native engineering is an unprecedented shift — I&rsquo;ve never been happier than when I&rsquo;m walking the cutting edge.&rdquo;
            </blockquote>
          </div>
          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '60ch', marginBottom: '1.5rem' }}>
              I have been early to every wave. XP and TDD when they were fringe. Agile before it was the default. Cloud-native and containerisation before the industry caught up. DORA metrics before they were fashionable. On the GitHub Copilot beta waiting list. AI-native engineering is the next shift — and I am writing the book on it.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '60ch', marginBottom: '1.5rem' }}>
              I am not theorising about AI-native engineering. I am practising it, writing the book on it, and building the tooling.
            </p>
            <div className="grid grid-cols-2 gap-8" style={{ marginTop: '3rem' }}>
              {[
                { num: '30', label: 'Years in technology' },
                { num: '14', label: 'Certifications' },
                { num: '40+', label: 'Enterprise clients' },
                { num: '£20m+', label: 'Programme budgets' },
              ].map((s) => (
                <div key={s.label} style={{ borderTop: '3px solid var(--black)', paddingTop: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', lineHeight: 1, marginBottom: '0.25rem' }}>{s.num}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-600)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
