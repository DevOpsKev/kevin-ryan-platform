import { CONTAINER } from "@/lib/constants"

const CASES = [
  { tag: "Global Platform", client: "Nestlé", url: "https://www.nestle.com", desc: "Built a global DevOps platform from zero. Distributed team across India, Spain, and the UK serving thousands of developers. Migrated Jenkins into AKS, Terraform IaC governance. Transferred capability for long-term sustainability." },
  { tag: "CI/CD Transformation", client: "Dematic", url: "https://www.dematic.com", desc: "First through the door. CI/CD transformation for a warehouse automation leader. GitLab and Azure-based platform. Reusable pipeline templates, Helm-based Kubernetes deployments.", stat: "98%", statLabel: "Reduction in time-to-solution" },
  { tag: "Architecture Review", client: "CERN", url: "https://home.cern", desc: "Kubernetes and CI/CD architectural review for the Large Hadron Collider control systems. Delivered recommendations that shipped to production infrastructure." },
  { tag: "AI Adoption", client: "NatWest", url: "https://www.natwest.com", desc: "Enterprise AI-assisted development pilot. Assessment framework across Java, Python, and Node.js. Board-level AI adoption recommendations in a tier-one financial institution." },
  { tag: "Platform Rebuild", client: "Financial Times", url: "https://www.ft.com", desc: "Platform rebuild during the period leading to Nikkei's £844M acquisition. Modernised how one of the world's leading publications delivers content during rapid digital transformation." },
  { tag: "Digital Portfolio", client: "BBC Worldwide", url: "https://www.bbc.com", desc: "£10m+ digital portfolio including BBC Good Food, Top Gear, and Global iPlayer. Agile programme management across product, engineering, editorial, and commercial teams." },
]

export default function DeliverySection() {
  return (
    <section className="section section--dark" id="delivery">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">03</div>
          <div>
            <div className="section__subtitle">Enterprise Delivery</div>
            <h2 className="display-lg">Embed. Build.<br />Transfer.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 reveal" style={{ gap: 0 }}>
          {CASES.map((c) => (
            <a key={c.client} href={c.url} target="_blank" rel="noopener noreferrer" className="case" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="case__tag">{c.tag}</div>
              <h3 className="case__client">{c.client}</h3>
              <p className="case__desc">{c.desc}</p>
              {c.stat && <div className="case__stat">{c.stat}</div>}
              {c.statLabel && <div className="case__stat-label">{c.statLabel}</div>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
