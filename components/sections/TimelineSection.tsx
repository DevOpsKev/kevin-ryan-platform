import { CONTAINER } from "@/lib/constants"

const TIMELINE = [
  { date: "Mid-1990s", title: "Software Engineer", desc: "Writing code. Foundation layer." },
  { date: "Late 1990s", title: "XP, TDD, BDD, CI/CD", desc: "Super early adopter. These practices were fringe — most teams hadn't heard of them." },
  { date: "2000s", title: "Agile & Scrum", desc: "Adopted agile methodologies before they became the industry default." },
  { date: "2007–2016", title: "Agile Transformation", desc: "Barclays, Heathrow, Pearson, Financial Times, BBC Worldwide, EY, McKinsey. UK Agile Award 2014." },
  { date: "2010s", title: "Cloud & Containerisation", desc: "Cloud-native development and Infrastructure as Code before it was mainstream." },
  { date: "2012–2018", title: "DevOps & DORA Metrics", desc: "Nicole Forsgren's Accelerate as a personal touchstone. DORA four key metrics as the governance framework." },
  { date: "2014–2020", title: "Platform Engineering", desc: "Nestlé, Dematic, CERN. DevEx and developer productivity before it had its own conference circuit." },
  { date: "2020 →", title: "AI-Native Engineering", desc: "GitHub Copilot beta. Writing Spec Driven Development. The next level of abstraction — and I'm early again." },
]

export default function TimelineSection() {
  return (
    <section className="section section--black" id="timeline">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">05</div>
          <div>
            <div className="section__subtitle">Career Arc</div>
            <h2 className="display-lg">Early to<br />Every Wave</h2>
          </div>
        </div>
        <div className="reveal">
          {TIMELINE.map((t) => (
            <div key={t.date} className="timeline__item">
              <div className="timeline__date">
                <div className="timeline__date-text">{t.date}</div>
              </div>
              <div className="timeline__line">
                <div className="timeline__dot" />
              </div>
              <div className="timeline__content">
                <h4 className="timeline__title">{t.title}</h4>
                <p className="timeline__desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
