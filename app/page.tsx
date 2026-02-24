'use client'

import Image from "next/image"
import { useEffect } from "react"
import SiteFooter from "@/components/SiteFooter"

const TICKER_ITEMS = [
  "DevOps", "Platform Engineering", "AI-Native", "Kubernetes", "CI/CD",
  "Terraform", "Spec Driven Development", "Enterprise Delivery", "DORA Metrics", "Cloud Migration",
]

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

const CASES = [
  { tag: "Global Platform", client: "Nestlé", desc: "Built a global DevOps platform from zero. Distributed team across India, Spain, and the UK serving thousands of developers. Migrated Jenkins into AKS, Terraform IaC governance. Transferred capability for long-term sustainability." },
  { tag: "CI/CD Transformation", client: "Dematic", desc: "First through the door. CI/CD transformation for a warehouse automation leader. GitLab and Azure-based platform. Reusable pipeline templates, Helm-based Kubernetes deployments.", stat: "98%", statLabel: "Reduction in time-to-solution" },
  { tag: "Architecture Review", client: "CERN", desc: "Kubernetes and CI/CD architectural review for the Large Hadron Collider control systems. Delivered recommendations that shipped to production infrastructure." },
  { tag: "AI Adoption", client: "NatWest", desc: "Enterprise AI-assisted development pilot. Assessment framework across Java, Python, and Node.js. Board-level AI adoption recommendations in a tier-one financial institution." },
  { tag: "Platform Rebuild", client: "Financial Times", desc: "Platform rebuild during the period leading to Nikkei's £844M acquisition. Modernised how one of the world's leading publications delivers content during rapid digital transformation." },
  { tag: "Digital Portfolio", client: "BBC Worldwide", desc: "£10m+ digital portfolio including BBC Good Food, Top Gear, and Global iPlayer. Agile programme management across product, engineering, editorial, and commercial teams." },
]

const CLIENTS = [
  { name: "Accenture", url: "https://www.accenture.com" },
  { name: "Barclays", url: "https://www.barclays.co.uk" },
  { name: "BBC Worldwide", url: "https://www.bbcstudios.com" },
  { name: "CBRE", url: "https://www.cbre.com" },
  { name: "CERN", url: "https://home.cern" },
  { name: "Deloitte Digital", url: "https://www.deloittedigital.com" },
  { name: "Elsevier", url: "https://www.elsevier.com" },
  { name: "EY", url: "https://www.ey.com" },
  { name: "Financial Times", url: "https://www.ft.com" },
  { name: "Heathrow Airport", url: "https://www.heathrow.com" },
  { name: "HelloFresh", url: "https://www.hellofresh.com" },
  { name: "Lloyds Bank", url: "https://www.lloydsbank.com" },
  { name: "Maersk", url: "https://www.maersk.com" },
  { name: "McKinsey & Co", url: "https://www.mckinsey.com" },
  { name: "NatWest", url: "https://www.natwest.com" },
  { name: "Nestlé", url: "https://www.nestle.com" },
  { name: "Pearson", url: "https://www.pearson.com" },
  { name: "Sky", url: "https://www.sky.com" },
  { name: "Vodafone", url: "https://www.vodafone.com" },
  { name: "Volkswagen", url: "https://www.volkswagen.com" },
]

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

const CONTAINER = { maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 6rem)' }

export default function Page() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      {/* ═══ HERO ═══ */}
      <section
        className="flex items-end"
        style={{ paddingTop: '7rem', minHeight: '100vh' }}
      >
        <div style={CONTAINER}>
          <div
            className="grid items-end"
            style={{
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 'calc(2rem * 2)',
              paddingBottom: '4rem',
            }}
          >
            <div>
              <div
                className="flex flex-wrap"
                style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--grey-400)',
                  marginBottom: '2rem', gap: '1.5rem',
                }}
              >
                {['DevOps', 'Platform', 'AI-Native', 'Author'].map((item, i, arr) => (
                  <span key={item}>
                    {item}
                    {i < arr.length - 1 && (
                      <span style={{ marginLeft: '1.5rem', color: 'var(--accent)', fontWeight: 900 }}>·</span>
                    )}
                  </span>
                ))}
              </div>
              <h1 style={{ fontFamily: "'UnifrakturMaguntia', cursive", fontSize: 'clamp(4.5rem, 13vw, 12rem)', lineHeight: 0.9, marginBottom: '2rem' }}>
                Kevin<br /><span style={{ color: 'var(--accent-dim)' }}>Ryan</span>
              </h1>
              <p style={{
                fontSize: '1.1rem', lineHeight: 1.75, maxWidth: '48ch',
                marginBottom: '2.5rem', color: 'var(--grey-800)',
              }}>
                I embed with enterprise clients and make complex technology work in production. Thirty years of platform engineering and DevOps delivery. Writing the book on what comes next.
              </p>
              <div className="flex items-center" style={{ gap: '1rem' }}>
                <a
                  href="#contact"
                  style={{
                    display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem',
                    fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '0.85rem 2rem', background: 'var(--accent)',
                    border: '2px solid var(--accent)', color: 'var(--black)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--black)'; e.currentTarget.style.borderColor = 'var(--black)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--black)' }}
                >
                  Get in touch
                </a>
                <a
                  href="#delivery"
                  style={{
                    display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem',
                    fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '0.85rem 2rem', border: '2px solid var(--black)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--black)'; e.currentTarget.style.color = 'var(--white)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--black)' }}
                >
                  Case studies
                </a>
              </div>
            </div>
            <div className="hero-image-col">
              <div style={{ position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--grey-100)' }} className="hero-image-frame">
                <Image
                  src="/kevin.jpg"
                  alt="Kevin Ryan"
                  fill
                  className="object-cover"
                  style={{ filter: 'grayscale(100%) contrast(1.15)', transition: 'filter 0.5s ease' }}
                  priority
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.filter = 'grayscale(0%) contrast(1.05)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = 'grayscale(100%) contrast(1.15)' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '0.9rem 1.25rem', background: 'var(--black)',
                  color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>Budapest / Dublin</span>
                  <span>&nbsp;</span>
                  <span>Available for contract</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="ticker">
        <div className="ticker__track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker__item">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══ ABOUT ═══ */}
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
                  { num: '13', label: 'Certifications' },
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

      {/* ═══ CAPABILITIES ═══ */}
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

      {/* ═══ ENTERPRISE DELIVERY ═══ */}
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
              <div key={c.client} className="case">
                <div className="case__tag">{c.tag}</div>
                <h3 className="case__client">{c.client}</h3>
                <p className="case__desc">{c.desc}</p>
                {c.stat && <div className="case__stat">{c.stat}</div>}
                {c.statLabel && <div className="case__stat-label">{c.statLabel}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLIENTS ═══ */}
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

      {/* ═══ TIMELINE ═══ */}
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

      {/* ═══ WRITING & PROJECTS ═══ */}
      <section className="section" id="projects">
        <div style={CONTAINER}>
          <div className="section__header reveal">
            <div className="section__number">06</div>
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

      {/* ═══ CERTIFICATIONS ═══ */}
      <section className="section section--black" id="certs">
        <div style={CONTAINER}>
          <div className="section__header reveal">
            <div className="section__number">07</div>
            <div>
              <div className="section__subtitle">Certifications</div>
              <h2 className="display-lg">Verified<br />Expertise</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
            <div className="cert-group">
              <h3 className="cert-group__title">GitHub ×4</h3>
              <ul className="cert-group__list">
                <li><a href="https://www.credly.com/badges/02e9c449-9385-4c95-9cfa-e72765f0d4de" target="_blank" rel="noopener noreferrer">Administration</a></li>
                <li><a href="https://www.credly.com/badges/b4a9987d-3a31-4cf3-8ee9-53607a4ef572" target="_blank" rel="noopener noreferrer">Actions</a></li>
                <li><a href="https://www.credly.com/badges/74bdfd55-a572-46a9-9c00-5d4158385ca9" target="_blank" rel="noopener noreferrer">Advanced Security</a></li>
                <li><a href="https://www.credly.com/badges/2cf756b5-013f-4336-adda-1af6ce3c11c8/public_url" target="_blank" rel="noopener noreferrer">Foundations</a></li>
              </ul>
            </div>
            <div className="cert-group">
              <h3 className="cert-group__title">GitLab ×6</h3>
              <ul className="cert-group__list">
                <li><a href="https://www.credly.com/badges/60bf5ece-b4b0-4bec-9c56-fc4d227fc689" target="_blank" rel="noopener noreferrer">Partner Technical Engineer</a></li>
                <li><a href="https://www.credly.com/badges/73b62343-d671-4477-b412-2d833dc4ea42/public_url" target="_blank" rel="noopener noreferrer">DevOps Professional</a></li>
                <li><a href="https://www.credly.com/badges/a64f651f-aa8c-4000-bf6e-9e5d3070dcb6/public_url" target="_blank" rel="noopener noreferrer">Security Specialist</a></li>
                <li><a href="https://www.credly.com/badges/90be4ffc-c869-4d0c-8143-99fcbe7099d5/public_url" target="_blank" rel="noopener noreferrer">Services Engineer Professional</a></li>
                <li><a href="https://www.credly.com/badges/5ed58594-5438-45df-b57a-f2f8ef7435eb/public_url" target="_blank" rel="noopener noreferrer">Migration Services Specialist</a></li>
                <li><a href="https://www.credly.com/badges/9340463c-a5d4-418e-9342-c18b145344e4/public_url" target="_blank" rel="noopener noreferrer">CI/CD Associate</a></li>
              </ul>
            </div>
            <div className="cert-group">
              <h3 className="cert-group__title">LaunchDarkly ×4</h3>
              <ul className="cert-group__list">
                <li><a href="https://verify.skilljar.com/c/b7tc7cjjjdv9" target="_blank" rel="noopener noreferrer">Platinum Developer</a></li>
                <li><a href="https://verify.skilljar.com/c/xvvkdsp227on" target="_blank" rel="noopener noreferrer">Gold Developer</a></li>
                <li><a href="https://verify.skilljar.com/c/cw4ix2japf23" target="_blank" rel="noopener noreferrer">Silver Developer</a></li>
                <li><a href="https://verify.skilljar.com/c/8m35pkrme9s8" target="_blank" rel="noopener noreferrer">Bronze Developer</a></li>
              </ul>
            </div>
            <div className="cert-group">
              <h3 className="cert-group__title">Education</h3>
              <ul className="cert-group__list">
                <li>Hons, Digital Media — Birmingham City University</li>
                <li>AI and Ethics — Trinity College Dublin</li>
                <li>MA Applied Linguistics — University of Pannonia <em style={{ color: 'var(--accent)', fontStyle: 'normal', fontSize: '0.68rem', fontWeight: 700 }}>(PLANNED)</em></li>
              </ul>
            </div>
          </div>
          <div className="award-banner reveal">
            <div className="award-banner__year">2014</div>
            <div className="award-banner__text">
              <strong>UK Agile Awards — Best Use of Agile in the Private Sector</strong>
              National recognition for enterprise agile delivery excellence.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section className="section section--dark" id="contact">
        <div style={CONTAINER}>
          <div className="section__header reveal">
            <div className="section__number">08</div>
            <div>
              <div className="section__subtitle">Contact</div>
              <h2 className="display-lg">Let&rsquo;s Work<br />Together</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 reveal" style={{ gap: 'calc(2rem * 3)', alignItems: 'end' }}>
            <div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--grey-400)', marginTop: '1.5rem', maxWidth: '45ch' }}>
                Available for DevOps and Platform Engineering contracts. Remote preferred, based in Budapest and Dublin. SDD training and AI governance advisory available through Kevin Ryan &amp; Associates.
              </p>
            </div>
            <div className="md:text-right">
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--grey-600)', marginBottom: '0.5rem' }}>Email</div>
                <a href="mailto:kevin@kevinryan.io" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--white)', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--white)' }}
                >kevin@kevinryan.io</a>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--grey-600)', marginBottom: '0.5rem' }}>Phone</div>
                <a href="tel:+447402083261" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--white)', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--white)' }}
                >+44 7402 083261</a>
              </div>
              <div className="flex gap-4 md:justify-end" style={{ marginTop: '2rem' }}>
                {[
                  { label: 'GitHub', href: 'https://github.com/devopskev' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/devopskev' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: 'var(--grey-400)',
                      padding: '0.6rem 1.4rem', border: '1px solid var(--grey-600)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-600)'; e.currentTarget.style.color = 'var(--grey-400)' }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* ═══ RESPONSIVE HERO ═══ */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hero-image-col { order: -1; }
          .hero-image-frame { aspect-ratio: 1 / 1 !important; }
          section:first-of-type > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
