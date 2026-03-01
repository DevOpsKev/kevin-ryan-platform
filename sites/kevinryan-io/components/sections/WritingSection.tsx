import { CONTAINER } from "@/lib/constants"

export default function WritingSection() {
  return (
    <section className="section" id="projects">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">07</div>
          <div>
            <div className="section__subtitle">Writing &amp; Projects</div>
            <h2 className="display-lg">Published<br />Work</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 reveal" style={{ gap: 0 }}>
          {[
            { label: 'Book — Forthcoming', title: 'Spec Driven Development', desc: 'AI-native software engineering methodology where specifications become the primary artifact and code becomes a generated side effect. The book that documents the shift.', url: 'https://sddbook.com', urlLabel: 'sddbook.com' },
            { label: 'Book — Published', title: 'AI Immigrants', desc: '70,000 words on AI governance, the EU AI Act, and the societal dynamics of automation. The governance thinking enterprises need before letting AI into production.', url: 'https://aiimmigrants.com', urlLabel: 'aiimmigrants.com' },
            { label: 'Non-Profit', title: 'Distributed Equity', desc: 'Ensuring the benefits of AI are distributed equitably across society. Research, advocacy, and community building.', url: 'https://distributedequity.org', urlLabel: 'distributedequity.org' },
          ].map((p) => (
            <div key={p.title} className="project">
              <div className="project__label">{p.label}</div>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__desc">{p.desc}</p>
              <a href={p.url} className="project__link" target="_blank" rel="noopener noreferrer">
                {p.urlLabel} <span className="arrow">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
