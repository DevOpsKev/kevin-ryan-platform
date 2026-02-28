import { CONTAINER } from "@/lib/constants"

const CLIENTS = [
  { name: "Accenture", url: "https://www.accenture.com" },
  { name: "Barclays", url: "https://www.barclays.co.uk" },
  { name: "CBRE", url: "https://www.cbre.com" },
  { name: "Deloitte Digital", url: "https://www.deloittedigital.com" },
  { name: "Elsevier", url: "https://www.elsevier.com" },
  { name: "EY", url: "https://www.ey.com" },
  { name: "Heathrow Airport", url: "https://www.heathrow.com" },
  { name: "HelloFresh", url: "https://www.hellofresh.com" },
  { name: "Informa", url: "https://www.informa.com" },
  { name: "Lantum", url: "https://www.lantum.com" },
  { name: "Lely", url: "https://www.lely.com" },
  { name: "Lloyds Bank", url: "https://www.lloydsbank.com" },
  { name: "Maersk", url: "https://www.maersk.com" },
  { name: "McKinsey & Co", url: "https://www.mckinsey.com" },
  { name: "Pearson", url: "https://www.pearson.com" },
  { name: "Sky", url: "https://www.sky.com" },
  { name: "TU Delft", url: "https://www.tudelft.nl" },
  { name: "Vodafone", url: "https://www.vodafone.com" },
  { name: "Volkswagen", url: "https://www.volkswagen.com" },
  { name: "WorldRemit", url: "https://www.worldremit.com" },
]

export default function ClientsSection() {
  return (
    <section className="section">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">04</div>
          <div>
            <div className="section__subtitle">Notable Clients</div>
            <h2 className="display-lg">Who I&rsquo;ve<br />Worked With</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 reveal" style={{ gap: 0 }}>
          {CLIENTS.map((c) => (
            <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" className="client">{c.name}</a>
          ))}
        </div>
      </div>
    </section>
  )
}
