import Image from "next/image"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

export default function Page() {
  return (
    <main className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl flex-shrink-0">
            <Image
              src="/kevin.jpg"
              alt="Kevin Ryan"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-serif leading-tight pb-2">
              Kevin Ryan
            </h1>
            <p className="text-xl md:text-2xl text-base-content/70 mb-6">
              Forward Deployed Engineer · AI Native Software Engineering · Author
            </p>
            <p className="text-lg leading-relaxed text-base-content/80 max-w-2xl">
              I embed with enterprise clients and make complex technology work in production. Thirty years of forward deployment across CERN, Nestlé, NatWest, BBC Worldwide, the Financial Times, and Dematic — before the role had a name. Platform engineering, developer experience, and AI governance depth. Writing the book on what comes next.
            </p>

            <p className="text-lg leading-relaxed text-base-content/80 max-w-2xl mt-6">
              Author of{' '}
              <Link href="https://aiimmigrants.com" target="_blank" className="text-primary hover:underline">
                AI Immigrants
              </Link>
              {' '}and{' '}
              <Link href="https://sddbook.com" target="_blank" className="text-primary hover:underline">
                Spec Driven Development
              </Link>
              . Founder of{' '}
              <a
                href="https://distributedequity.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Distributed Equity
              </a>.
            </p>

            <div className="flex gap-6 mt-8 justify-center md:justify-start items-center">
              <a
                href="https://github.com/devopskev"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/github_logo_black.png"
                  alt="GitHub"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://linkedin.com/in/devopskev"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/linkedin_black_logo.png"
                  alt="LinkedIn"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-base-200/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <blockquote className="text-2xl md:text-3xl font-light text-center italic text-base-content/90 leading-relaxed">
            "I was doing forward deployment engineering for about a decade before Palantir coined the term."
          </blockquote>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 font-serif">About</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-base-content/80">
            Most people entering the FDE space are either product engineers who've never run a client engagement, or consultants who've never written production code in a customer's environment. I've done both — for thirty years. Every major engagement in my career maps to the FDE pattern: identify the problem, embed with the client, build the solution in production, transfer capability, grow the relationship.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            There's a second pattern that matters just as much: I've been early to every wave. XP and TDD when they were fringe. Agile before it was the default. Cloud-native and containerisation before the industry caught up. DORA metrics before they were fashionable. On the GitHub Copilot beta waiting list. When I say AI-native engineering is the next paradigm, that's pattern recognition backed by three decades of being right about what comes next.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            Based between London and Budapest. Available for FDE, Solutions Engineer, and AI adoption roles — FTE or contract.
          </p>
        </div>
      </section>

      {/* The FDE Trifecta */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">The FDE Trifecta</h2>
          <p className="text-lg text-base-content/60 mb-12">Forward Deployed Engineering sits at the intersection of three domains. Most candidates have one. I have all three.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Software Engineering</h3>
                <p className="text-base-content/80">
                  Write production code. Build integrations. Deploy to real infrastructure. Dematic CI/CD platform achieving 98% time-to-solution reduction. Nestlé DevOps platform build. CERN Kubernetes architecture. SpecMCP open-source. GitLab ×9, GitHub ×4 certified.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Product Thinking</h3>
                <p className="text-base-content/80">
                  Understand the customer's problem. Identify what to build and why. Feed insights back to product. NatWest AI adoption strategy at board level. BBC Worldwide £10m+ portfolio direction. SDD methodology. Won engagements through technical proposals at Nestlé and Dematic.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Customer Consulting</h3>
                <p className="text-base-content/80">
                  Embed with client teams. Translate between technical and business. Transfer capability. 11 years client-embedded at Cprime. Built and transferred teams at Nestlé and Dematic across India, Spain, UK, and Ukraine. Stakeholder management to C-suite.
                </p>
              </div>
            </div>
          </div>
          <p className="text-base-content/60 mt-8 text-center italic">
            The critical addition most FDEs lack: delivery management as a superpower. I can embed with a client, write production code, and run the programme that scales the solution across the enterprise.
          </p>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-serif">Expertise</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">AI Native Software Engineering</h3>
                <p className="text-base-content/80">
                  Not AI as a chatbot — AI as the medium through which software gets conceived, specified, built, tested, and operated. Enterprise AI adoption strategy, governance frameworks, and specification-driven development methodology. Author of AI Immigrants and the forthcoming Spec Driven Development.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Platform Engineering & DevEx</h3>
                <p className="text-base-content/80">
                  Building internal platforms that make development teams more productive. Nestlé's global DevOps platform from zero. Dematic's CI/CD transformation. CERN's Kubernetes architecture. Tooling, workflows, and infrastructure abstractions that let engineers focus on shipping.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">DevOps & CI/CD</h3>
                <p className="text-base-content/80">
                  Continuous delivery as both a technical and cultural practice. DORA four key metrics and OKRs as governance frameworks for engineering performance. GitLab ×9 and GitHub ×4 certified. Infrastructure as Code with Terraform and Bicep — versioned, tested, repeatable.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">AI Governance & Ethics</h3>
                <p className="text-base-content/80">
                  Published 70,000 words on AI governance, the EU AI Act, and the societal dynamics of automation. Trinity College Dublin AI Ethics CPD. NatWest board-level AI adoption recommendations. SpecMCP making API specifications enforceable for AI assistants.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Enterprise Forward Deployment</h3>
                <p className="text-base-content/80">
                  Embedding with client teams in complex, regulated enterprise environments. Navigating security constraints, data residency requirements, and the politics of getting production credentials. No amount of prompt engineering fixes legacy integrations.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Cloud Migration & Modernisation</h3>
                <p className="text-base-content/80">
                  Leading large-scale migrations across platforms, toolchains, and infrastructure. From Bitbucket to GitHub at Nestlé to full CI/CD re-platforming at Dematic. Migrations that minimise disruption while modernising how teams build and ship software.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early to Every Wave */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Early to Every Wave</h2>
          <p className="text-lg text-base-content/60 mb-12">Every phase of my career has operated at a higher level of abstraction than the last — and at every stage, I arrived early.</p>
          <div className="grid gap-4">
            {[
              { era: "Mid-1990s", label: "Software Engineer", detail: "Writing code. Foundation layer." },
              { era: "Late 1990s", label: "XP, TDD, BDD, CI/CD", detail: "Super early adopter. These practices were fringe — most teams hadn't heard of them." },
              { era: "2000s", label: "Agile & Scrum", detail: "Adopted agile methodologies before they became the industry default." },
              { era: "2007–2016", label: "Agile Transformation", detail: "Barclays, Heathrow, Pearson, Financial Times, BBC Worldwide, EY, McKinsey. UK Agile Award 2014." },
              { era: "2010s", label: "Cloud & Containerisation", detail: "Cloud-native development and Infrastructure as Code before it was mainstream." },
              { era: "2012–2018", label: "DevOps & DORA Metrics", detail: "Nicole Forsgren's Accelerate as a personal touchstone. DORA four key metrics as the governance framework." },
              { era: "2014–2020", label: "Platform Engineering", detail: "Nestlé, Dematic, CERN. DevEx and developer productivity before it had its own conference circuit." },
              { era: "2020 →", label: "Forward Deployed Engineer — AI Native", detail: "Writing Spec Driven Development. Building SpecMCP. The fifth paradigm of abstraction.", highlight: true },
            ].map((phase) => (
              <div key={phase.era} className={`flex flex-col md:flex-row gap-2 md:gap-6 p-4 rounded-lg ${phase.highlight ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-base-100'}`}>
                <span className="text-sm font-mono text-base-content/50 md:w-28 flex-shrink-0">{phase.era}</span>
                <span className="font-bold text-primary md:w-64 flex-shrink-0 font-serif">{phase.label}</span>
                <span className="text-base-content/70">{phase.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forward Deployment Evidence */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Forward Deployment in Practice</h2>
          <p className="text-lg text-base-content/60 mb-12">Every engagement follows the same pattern: identify, embed, build, transfer, grow.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Nestlé</h3>
              <p className="text-base-content/80">
                Embedded with global engineering teams. Built a DevOps platform from zero, assembling a distributed team across India, Spain, and the UK to serve thousands of developers. Transferred capability for long-term sustainability. Platform engineering as forward deployment.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Dematic</h3>
              <p className="text-base-content/80">
                First through the door with the client. CI/CD transformation for a warehouse automation leader — 98% reduction in time-to-solution. Built reusable pipeline architecture and transferred ownership to a nearshore team in Ukraine.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">NatWest</h3>
              <p className="text-base-content/80">
                Embedded with enterprise engineering leadership. AI-assisted development pilot and adoption strategy. Navigated regulatory and security constraints in a tier-one financial institution. Board-level recommendations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Financial Times</h3>
              <p className="text-base-content/80">
                Platform rebuild during the period leading to Nikkei's £844M acquisition. Helped modernise how one of the world's leading publications delivers content during rapid digital transformation.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">BBC Worldwide</h3>
              <p className="text-base-content/80">
                Embedded with digital product teams. £10m+ portfolio including BBC Good Food, Top Gear, and Global iPlayer. Delivered production systems in a complex media environment across product, engineering, editorial, and commercial teams.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">HelloFresh</h3>
              <p className="text-base-content/80">
                Embedded with Berlin-based engineering teams during the critical period leading to their €1.5 billion IPO. Coached delivery practices and collaboration as they scaled from startup to public company.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Notable Clients Section */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-serif">Notable Clients</h2>
          <div className="flex flex-wrap justify-center gap-4 text-base-content/60 text-sm md:text-base">
            {[
              "Accenture", "Barclays", "BBC Worldwide", "CBRE", "CERN", "Deloitte Digital",
              "Elsevier", "EY", "Financial Times", "Heathrow Airport", "HelloFresh",
              "Lloyds Bank", "Maersk", "McKinsey & Company", "NatWest", "Nestlé",
              "Pearson", "Sky", "TU Delft", "Vodafone", "Volkswagen"
            ].map((client) => (
              <span key={client} className="badge badge-lg badge-outline">
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-serif">Certifications</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary font-serif">GitHub</h3>
              <ul className="space-y-2 text-base-content/80 text-sm">
                <li>• <a href="https://www.credly.com/badges/02e9c449-9385-4c95-9cfa-e72765f0d4de" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Administration</a></li>
                <li>• <a href="https://www.credly.com/badges/b4a9987d-3a31-4cf3-8ee9-53607a4ef572" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Actions</a></li>
                <li>• <a href="https://www.credly.com/badges/74bdfd55-a572-46a9-9c00-5d4158385ca9" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Advanced Security</a></li>
                <li>• <a href="https://www.credly.com/badges/2cf756b5-013f-4336-adda-1af6ce3c11c8/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Foundations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-primary font-serif">GitLab</h3>
              <ul className="space-y-2 text-base-content/80 text-sm">
                <li>• <a href="https://www.credly.com/badges/60bf5ece-b4b0-4bec-9c56-fc4d227fc689" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Partner Technical Engineer</a></li>
                <li>• <a href="https://www.credly.com/badges/73b62343-d671-4477-b412-2d833dc4ea42/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">DevOps Professional</a></li>
                <li>• <a href="https://www.credly.com/badges/a64f651f-aa8c-4000-bf6e-9e5d3070dcb6/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Security Specialist</a></li>
                <li>• <a href="https://www.credly.com/badges/90be4ffc-c869-4d0c-8143-99fcbe7099d5/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Services Engineer Professional</a></li>
                <li>• <a href="https://www.credly.com/badges/5ed58594-5438-45df-b57a-f2f8ef7435eb/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Migration Services Specialist</a></li>
                <li>• <a href="https://www.credly.com/badges/9340463c-a5d4-418e-9342-c18b145344e4/public_url" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">CI/CD Associate</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-primary font-serif">LaunchDarkly</h3>
              <ul className="space-y-2 text-base-content/80 text-sm">
                <li>• <a href="https://verify.skilljar.com/c/b7tc7cjjjdv9" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Platinum Developer</a></li>
                <li>• <a href="https://verify.skilljar.com/c/xvvkdsp227on" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Gold Developer</a></li>
                <li>• <a href="https://verify.skilljar.com/c/cw4ix2japf23" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Silver Developer</a></li>
                <li>• <a href="https://verify.skilljar.com/c/8m35pkrme9s8" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Bronze Developer</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Education & Awards Section */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-serif">Education</h2>
              <ul className="space-y-3 text-base-content/80">
                <li>
                  <strong>Hons, Digital Media</strong><br />
                  Birmingham City University
                </li>
                <li>
                  <strong>AI and Ethics</strong><br />
                  Trinity College Dublin (HCI CPD)
                </li>
                <li>
                  <strong>MA in Applied Linguistics</strong> (Planned)<br />
                  University of Pannonia, Hungary
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 font-serif">Notable Achievement</h2>
              <ul className="space-y-3 text-base-content/80">
                <li>
                  Awarded 'Best Use of Agile in the Private Sector' at the UK Agile Awards (2014)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">Let's Work Together</h2>
          <p className="text-lg text-base-content/80 mb-8 max-w-2xl mx-auto">
            Available for Forward Deployed Engineer, Solutions Engineer, and AI adoption roles — FTE and contract. Remote preferred, based between London and Budapest with international travel capability. SDD training and AI governance advisory available through Kevin Ryan & Associates.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">

            <a href="mailto:kevin@kevinryan.io"
              className="btn btn-primary btn-lg"
            >
              Email Me
            </a>

            <a href="tel:+447402083261"
              className="btn btn-outline btn-lg"
            >
              +44 7402 083261
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
