'use client'

import Image from "next/image"
import { CONTAINER } from "@/lib/constants"

export default function HeroSection() {
  return (
    <>
      <section
        className="hero-section flex flex-col justify-end"
        style={{ paddingTop: '7rem', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        {/* Grid texture background */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 0, opacity: 0.25, pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(var(--grey-200) 1px, transparent 1px), linear-gradient(90deg, var(--grey-200) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div style={{ ...CONTAINER, position: 'relative', zIndex: 1 }}>
          {/* Top bar: section number + availability */}
          <div
            className="flex items-center justify-between flex-wrap"
            style={{ gap: '1rem', marginBottom: 'clamp(2rem, 4vw, 4rem)' }}
          >
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 5vw, 5rem)',
              color: 'var(--accent)', lineHeight: 1,
            }}>
              00
            </span>
            <div className="flex items-center" style={{ gap: '0.7rem' }}>
              <span
                className="hero-dot"
                style={{
                  width: 9, height: 9, background: 'var(--accent)',
                  borderRadius: '50%', display: 'inline-block',
                }}
              />
              <span style={{
                fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--grey-600)',
              }}>
                Available for contract
              </span>
            </div>
          </div>

          {/* Main two-column grid */}
          <div
            className="hero-grid grid items-center"
            style={{
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 'clamp(2rem, 4vw, 5rem)',
              paddingBottom: '4rem',
            }}
          >
            {/* Text column */}
            <div>
              <div
                className="flex flex-wrap"
                style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--accent-dim, var(--accent))',
                  marginBottom: '1.5rem', gap: '1.5rem',
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

              <h1 style={{ marginBottom: '0.5rem' }}>
                <img
                  src="./kevin-ryan-logo-outlined.svg"
                  alt="Kevin Ryan & Associates"
                  style={{ width: 'clamp(280px, 45vw, 540px)', height: 'auto' }}
                />
              </h1>

              {/* Lime rule */}
              <div style={{
                width: 100, height: 4, background: 'var(--accent)',
                margin: '1.8rem 0',
              }} />

              {/* Description */}
              <p style={{
                fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--grey-600)',
                maxWidth: 500, marginBottom: '2.2rem',
              }}>
                I used to direct teams of software engineers. Now I coordinate AI agents. Thirty years of building software and shipping products taught me the job was never about the tools — it's specification, role clarity, and amplifying human ingenuity. The tools change. Great teams building great products don't. Agents just mean we do it faster.
              </p>

              {/* CTAs */}
              <div className="flex items-center" style={{ gap: '1rem' }}>
                <a
                  href="#contact"
                  style={{
                    display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem',
                    fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '1rem 2.2rem', background: 'var(--black)',
                    border: '2px solid var(--black)', color: 'var(--white)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--black)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--black)'
                    e.currentTarget.style.borderColor = 'var(--black)'
                    e.currentTarget.style.color = 'var(--white)'
                  }}
                >
                  Get in touch
                </a>
                <a
                  href="#delivery"
                  style={{
                    display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem',
                    fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '1rem 2.2rem', background: 'transparent',
                    border: '2px solid var(--grey-200)', color: 'var(--black)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--black)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-200)' }}
                >
                  Case studies
                </a>
              </div>
            </div>

            {/* Photo column */}
            <div className="hero-image-col">
              <div
                className="hero-image-frame"
                style={{
                  position: 'relative', aspectRatio: '3 / 4',
                  overflow: 'hidden', background: 'var(--black)',
                }}
              >
                <Image
                  src="/kevin.jpg"
                  alt="Kevin Ryan"
                  fill
                  className="object-cover"
                  style={{ filter: 'grayscale(100%)', opacity: 0.9 }}
                  priority
                />
                {/* Lime stripe */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 5, background: 'var(--accent)',
                }} />
                {/* Badge top-left */}
                <div style={{
                  position: 'absolute', top: '1.5rem', left: '1.5rem',
                  background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                  padding: '0.7rem 1.2rem',
                  fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--white)',
                }}>
                  Remote First
                </div>
                {/* Location bottom-left */}
                <div style={{
                  position: 'absolute', bottom: '1.5rem', left: '1.5rem',
                  fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--white)',
                }}>
                  Budapest <span style={{ color: 'var(--accent)' }}>·</span> Dublin
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style jsx>{`
        .hero-dot {
          animation: heroPulse 2s ease-in-out infinite;
        }
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,225,12,0.4); }
          50% { box-shadow: 0 0 0 7px rgba(168,225,12,0); }
        }
        @media (max-width: 768px) {
          .hero-image-col { order: -1; }
          .hero-image-frame { aspect-ratio: 1 / 1 !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
