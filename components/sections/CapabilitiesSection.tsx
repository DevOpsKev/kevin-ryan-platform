import { CONTAINER } from "@/lib/constants"

const CAPABILITIES = [
  {
    number: "01",
    title: "Platform Engineering & DevEx",
    text: "Build and operate internal developer platforms. CI/CD architecture, Kubernetes, Terraform, infrastructure as code. Nestlé global DevOps platform from zero. Dematic CI/CD transformation. CERN Kubernetes architecture review. GitLab ×9, GitHub ×4 certified.",
  },
  {
    number: "02",
    title: "DevOps & CI/CD",
    text: "Pipeline architecture, automation, migration, modernisation. DORA four key metrics and OKRs as governance frameworks. Infrastructure as Code with Terraform and Bicep — versioned, tested, repeatable.",
  },
  {
    number: "03",
    title: "Delivery Management",
    text: "Embed with client teams. Run the programme that scales the solution. 11 years client-embedded at Cprime. Built and transferred teams at Nestlé and Dematic. Stakeholder management to C-suite. The capability most contractors lack.",
  },
  {
    number: "04",
    title: "AI-Native Engineering",
    text: "AI as the medium through which software gets conceived, specified, built, tested, and operated. Enterprise AI adoption strategy, governance frameworks, and specification-driven development. Author of the forthcoming Spec Driven Development.",
  },
  {
    number: "05",
    title: "AI Governance & Ethics",
    text: "Published 70,000 words on AI governance, the EU AI Act, and societal dynamics of automation. Trinity College Dublin AI Ethics CPD. NatWest board-level AI adoption recommendations.",
  },
  {
    number: "06",
    title: "Cloud Migration",
    text: "Large-scale migrations across platforms, toolchains, and infrastructure. From Bitbucket to GitHub at Nestlé to full CI/CD re-platforming at Dematic. Minimise disruption while modernising delivery.",
  },
]

export default function CapabilitiesSection() {
  return (
    <section className="section" id="capabilities">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">02</div>
          <div>
            <div className="section__subtitle">Capabilities</div>
            <h2 className="display-lg">What I<br />Bring</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 reveal" style={{ gap: 0 }}>
          {CAPABILITIES.map((cap) => (
            <div key={cap.number} className="capability">
              <div className="capability__number">{cap.number}</div>
              <h3 className="capability__title">{cap.title}</h3>
              <p className="capability__text">{cap.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
