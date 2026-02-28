'use client'

import { CONTAINER } from "@/lib/constants"

export default function ContactSection() {
  return (
    <section className="section section--dark" id="contact">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">09</div>
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
  )
}
