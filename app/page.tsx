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
              DevOps Engineer · Platform Engineer · AI-Native · Cloud-Native · Author
            </p>
            <p className="text-lg leading-relaxed text-base-content/80 max-w-2xl">
              I embed with enterprise clients and make complex technology work in production. Thirty years of platform engineering and DevOps delivery across CERN, Nestlé, NatWest, BBC Worldwide, the Financial Times, and Dematic. CI/CD architecture, Kubernetes, Terraform, and AI governance depth. Writing the book on what comes next.
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
            "AI-native engineering is an unprecedented shift — I've never been happier than when I'm walking the cutting edge."
          </blockquote>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 font-serif">About</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-base-content/80">
            Most DevOps contractors are infrastructure specialists who have never managed a client engagement, or consultants who have never built a production pipeline. I have done both. What sets me apart is a rare combination: I can build the pipeline architecture, operate the platform, and run the programme that scales delivery across the enterprise.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            There is a second pattern that matters just as much: I have been early to every wave. XP and TDD when they were fringe. Agile before it was the default. Cloud-native and containerisation before the industry caught up. DORA metrics before they were fashionable. On the GitHub Copilot beta waiting list. AI-native engineering is the next shift — and I am writing the book on it.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            The industry is shifting toward engineers whose breadth lets them leverage AI across the full delivery lifecycle. Thirty years spanning code, architecture, platform engineering, delivery, and governance means AI amplifies what I already know — and you cannot shortcut that context. I am not theorising about AI-native engineering. I am practising it, writing the book on it, and building the tooling.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            Based in Budapest and Dublin. Available for DevOps and Platform Engineering contracts. Remote preferred.
          </p>
        </div>
      </section>

      {/* What I Bring */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">What I Bring</h2>
          <p className="text-lg text-base-content/60 mb-12">Enterprise DevOps and Platform Engineering with delivery depth. Most candidates have one of these. I have all three.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Platform Engineering</h3>
                <p className="text-base-content/80">
                  Build and operate internal developer platforms. CI/CD architecture, Kubernetes, Terraform, infrastructure as code. Nestlé global DevOps platform from zero. Dematic CI/CD transformation — 98% time-to-solution reduction. CERN Kubernetes architecture review. GitLab ×9, GitHub ×4 certified.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">DevOps Delivery</h3>
                <p className="text-base-content/80">
                  Pipeline architecture, automation, migration, modernisation. Jenkins-to-AKS migration at Nestlé. Reusable CI/CD templates at Dematic. Terraform IaC governance. Bitbucket-to-GitHub migration strategy. DORA four key metrics as the governance framework for engineering performance.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Delivery Management</h3>
                <p className="text-base-content/80">
                  Embed with client teams. Run the programme that scales the solution. 11 years client-embedded at Cprime. Built and transferred teams at Nestlé (India/Spain/UK) and Dematic (Ukraine). Stakeholder management to C-suite. £10m+ programme budgets. The capability most contractors lack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-serif">Expertise</h2>
          <div className="grid md:grid-cols-2 gap-6">
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
                <h3 className="card-title text-primary font-serif">AI Native Software Engineering</h3>
                <p className="text-base-content/80">
                  Not AI as a chatbot — AI as the medium through which software gets conceived, specified, built, tested, and operated. Enterprise AI adoption strategy, governance frameworks, and specification-driven development methodology. Author of AI Immigrants and the forthcoming Spec Driven Development.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">AI Governance & Ethics</h3>
                <p className="text-base-content/80">
                  Published 70,000 words on AI governance, the EU AI Act, and the societal dynamics of automation. Trinity College Dublin AI Ethics CPD. NatWest board-level AI adoption recommendations. The governance thinking that regulated enterprises need before they let AI into production.
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

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Enterprise Delivery</h3>
                <p className="text-base-content/80">
                  Embedding with client teams in complex, regulated enterprise environments. Navigating security constraints, data residency requirements, and the politics of getting production credentials. Technical pre-sales, proposal authorship, and client acquisition.
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
              { era: "2020 →", label: "AI-Native Engineering", detail: "GitHub Copilot beta. Writing Spec Driven Development. The next level of abstraction — and I'm early again.", highlight: true },
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

      {/* Enterprise Delivery */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Enterprise Delivery</h2>
          <p className="text-lg text-base-content/60 mb-12">Every engagement follows the same pattern: embed with the client, build the platform, transfer capability.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Nestlé</h3>
              <p className="text-base-content/80">
                Built a global DevOps platform from zero, assembling a distributed team across India, Spain, and the UK to serve thousands of developers. Migrated Jenkins into AKS, optimised CI/CD pipelines, implemented Terraform IaC governance. Transferred capability for long-term sustainability.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Dematic</h3>
              <p className="text-base-content/80">
                First through the door. CI/CD transformation for a warehouse automation leader — 98% reduction in time-to-solution. GitLab and Azure-based platform. Reusable pipeline templates, Terraform IaC, Helm-based Kubernetes deployments. Transferred ownership to nearshore team.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">CERN</h3>
              <p className="text-base-content/80">
                Kubernetes and CI/CD architectural review for the Large Hadron Collider control systems. Delivered recommendations that shipped to production infrastructure.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">NatWest</h3>
              <p className="text-base-content/80">
                Enterprise AI-assisted development pilot. Assessment framework across Java, Python, and Node.js. Board-level AI adoption recommendations. Navigated regulatory and security constraints in a tier-one financial institution.
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
                £10m+ digital portfolio including BBC Good Food, Top Gear, and Global iPlayer. Agile programme management, product re-platform, cross-functional stakeholder management across product, engineering, editorial, and commercial teams.
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
            Available for DevOps and Platform Engineering contracts. Remote preferred, based in Budapest and Dublin. SDD training and AI governance advisory available through Kevin Ryan & Associates.
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
