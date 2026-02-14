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
              Technical Project Manager · Delivery Manager · Platform Engineering · Cloud Infrastructure · Author
            </p>
            <p className="text-lg leading-relaxed text-base-content/80 max-w-2xl">
              Technical Project Manager and Delivery Manager with 30 years leading complex technology programmes across enterprise organisations. I bring structure to ambiguity — standing up delivery functions, building teams, and driving programmes from inception through to production. Accountable for programme budgets of £10m+, managing distributed engineering teams across multiple geographies.
            </p>

            <p className="text-lg leading-relaxed text-base-content/80 max-w-2xl mt-6">
              Author of{' '}
              <Link href="https://aiimmigrants.com" target="_blank" className="text-primary hover:underline">
                AI Immigrants
              </Link>
              {' '}and founder of{' '}
              <a
                href="https://distributedequity.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DistributedEquity
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
            "I don't need a translator between the boardroom and the build team."
          </blockquote>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 font-serif">About</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-base-content/80">
            I've worked with clients ranging from startups to multinational corporations across Europe, wearing different hats depending on what they needed — delivery manager, programme director, agile coach, enterprise consultant. But software engineering has always been my foundation. It's where I started, and it's what gives me the technical fluency to govern delivery with credibility — challenging architectural decisions, assessing risk first-hand, and bridging the gap between engineering teams and senior stakeholders.
          </p>
          <p className="text-lg leading-relaxed text-base-content/80 mt-4">
            I'm based between the UK and Hungary, work remotely, and travel when projects need me there in person. Available immediately for contract and permanent roles.
          </p>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="bg-base-200/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-serif">Expertise</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Platform Engineering</h3>
                <p className="text-base-content/80">
                  Building internal platforms that make development teams more productive. I create tooling, workflows, and infrastructure abstractions that let engineers focus on shipping features instead of fighting with deployment pipelines and environment configurations.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Infrastructure as Code</h3>
                <p className="text-base-content/80">
                  Automating infrastructure with Terraform and Bicep so you can provision consistently, track changes, and eliminate configuration drift. I treat infrastructure like software—versioned, tested, and repeatable.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">DevOps & Transformation</h3>
                <p className="text-base-content/80">
                  Helping teams ship better software faster by improving how they work together and what they automate. I've guided organizations through cultural and technical shifts toward continuous delivery, focusing on sustainable change rather than quick fixes.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Programme & Portfolio Delivery</h3>
                <p className="text-base-content/80">
                 Leading complex programmes from inception through to production. I stand up governance frameworks, manage budgets, build teams, and keep distributed delivery on track — whether that's a single workstream or a multi-million pound portfolio spanning multiple geographies.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">AI Integration</h3>
                <p className="text-base-content/80">
                  Integrating AI where it makes practical sense — improving developer workflows, enhancing observability, and giving teams better operational insight. Recent work includes enterprise AI adoption strategy at board level and governance frameworks for responsible AI use.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-primary font-serif">Cloud Migration & Modernisation</h3>
                <p className="text-base-content/80">
                  Leading large-scale migrations across platforms, toolchains, and infrastructure. From Bitbucket to GitHub at Nestlé to full CI/CD re-platforming at Dematic, I plan and deliver migrations that minimise disruption while modernising how teams build and ship software.
                </p>
              </div>
            </div>


          </div>
        </div>
      </section>


      {/* Career Highlights Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-serif">Career Highlights</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">CERN</h3>
              <p className="text-base-content/80">
                Consultancy for control system architecture for the Large Hadron Collider. Architectural review of Kubernetes platforms and CI/CD pipelines for one of the world's most complex scientific instruments.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Financial Times</h3>
              <p className="text-base-content/80">
                Rebuilt core infrastructure for FT.com during the period leading to Nikkei's £844 million acquisition of the Financial Times from Pearson. Helped modernize how one of the world's leading publications delivers content.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">Lunar Zebro (TU Delft)</h3>
              <p className="text-base-content/80">
                Coached the DevOps team building Europe's first student-led moon rover. Helped university engineers apply professional practices to space exploration.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary font-serif">HelloFresh</h3>
              <p className="text-base-content/80">
                Agile coach for the Berlin-based startup during the critical period leading to their €1.5 billion IPO. Coached engineering teams on delivery practices and collaboration as they scaled from startup to public company.
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
              "Accenture", "Barclays", "CBRE", "CERN", "Deloitte Digital",
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

      {/* Education & Interests Section */}
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
            Available immediately for contract and permanent Technical Project Manager and Delivery Manager roles. Remote preferred with UK-wide availability for hybrid arrangements. Based between London and Budapest with international travel capability.
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
