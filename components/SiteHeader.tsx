'use client'

import React, { useState } from 'react'

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Delivery', href: '#delivery' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Writing', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function SiteHeader(): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      const navHeight = 80
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'smooth' })
      setOpen(false)
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: 'var(--white)', borderBottom: '2px solid var(--black)' }}
    >
      <div
        className="flex justify-between items-center mx-auto"
        style={{ maxWidth: '1400px', padding: '1rem clamp(1.5rem, 5vw, 6rem)' }}
      >
        <a
          href="#"
          style={{
            fontFamily: "'UnifrakturMaguntia', cursive",
            fontSize: '1.8rem',
            lineHeight: 1,
          }}
        >
          Kevin<span style={{ color: 'var(--accent-dim)', marginLeft: '0.15em' }}>Ryan</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center" style={{ gap: '2.5rem', listStyle: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className="nav-link"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  position: 'relative' as const,
                  paddingBottom: '2px',
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
        >
          <span style={{ display: 'block', width: '26px', height: '2px', background: 'var(--black)', margin: '6px 0' }} />
          <span style={{ display: 'block', width: '26px', height: '2px', background: 'var(--black)', margin: '6px 0' }} />
          <span style={{ display: 'block', width: '26px', height: '2px', background: 'var(--black)', margin: '6px 0' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul
          className="md:hidden flex flex-col"
          style={{
            background: 'var(--white)',
            borderBottom: '2px solid var(--black)',
            padding: '2rem clamp(1.5rem, 5vw, 6rem)',
            gap: '1.25rem',
            listStyle: 'none',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  )
}
