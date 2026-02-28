'use client'

import Image from "next/image"
import { CONTAINER } from "@/lib/constants"

export default function HeroSection() {
  return (
    <>
      <section
        className="flex items-end"
        style={{ paddingTop: '7rem', minHeight: '100vh' }}
      >
        <div style={CONTAINER}>
          <div
            className="grid items-start"
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
              <h1 style={{ marginBottom: '2rem' }}>
                <img
                  src="/brand/kevin-ryan-logo-outlined.svg"
                  alt="Kevin Ryan & Associates"
                  style={{ width: 'clamp(280px, 45vw, 540px)', height: 'auto' }}
                />
              </h1>
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
                  style={{ filter: 'grayscale(100%) contrast(1.15)' }}
                  priority
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '0.9rem 1.25rem', background: 'var(--black)',
                  color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  display: 'flex', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '0.5rem',
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

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-image-col { order: -1; }
          .hero-image-frame { aspect-ratio: 1 / 1 !important; }
          section:first-of-type > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
