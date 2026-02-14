'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  external: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'kevinryan.io', href: '/', external: false },
  { label: 'Spec Driven Development', href: 'https://sddbook.com', external: true },
  { label: 'AI Immigrants', href: 'https://aiimmigrants.com', external: true },
  { label: 'Distributed Equity', href: 'https://distributedequity.org', external: true },
]

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

export default function SiteHeader(): React.JSX.Element {
  const pathname = usePathname()

  return (
    <header className="navbar bg-base-100 px-4">
      <div className="flex-1" />

      <nav className="hidden md:flex">
        <ul className="menu menu-horizontal gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary font-semibold'
                      : 'hover:text-primary'
                  }`}
                >
                  {item.label}
                  <ExternalLinkIcon className="w-4 h-4 ml-1 inline" />
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={`transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary font-semibold'
                      : 'hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="dropdown dropdown-end md:hidden">
        <button
          tabIndex={0}
          className="btn btn-ghost"
          aria-label="Open navigation menu"
        >
          <HamburgerIcon className="w-6 h-6" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary font-semibold'
                      : 'hover:text-primary'
                  }`}
                >
                  {item.label}
                  <ExternalLinkIcon className="w-4 h-4 ml-1 inline" />
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={`transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary font-semibold'
                      : 'hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
