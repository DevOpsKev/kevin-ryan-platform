import { CONTAINER } from "@/lib/constants"

export default function SpecMcpSection() {
  return (
    <>
      <div className="specmcp__edge" />
      <section className="specmcp" id="specmcp">
        <div className="specmcp__glow specmcp__glow--1" />
        <div className="specmcp__glow specmcp__glow--2" />
        <div className="specmcp__inner" style={CONTAINER}>
          <div className="specmcp__label-bar reveal">
            <div className="specmcp__section-tag">06</div>
            <div className="specmcp__product-badge">
              <span className="pulse-dot" />
              Launching 2026
            </div>
          </div>

          <div className="specmcp__hero reveal">
            <div>
              <div className="specmcp__logo">
                <div className="specmcp__logo-icon">S</div>
                specmcp.ai
              </div>
              <h2 className="specmcp__title">
                Your specs,<br />always <span className="smcp-highlight">in context</span>
              </h2>
              <p className="specmcp__desc">
                A managed MCP server for your product specs, API docs, and architecture decisions. Give your AI tools the context they actually need — powered by Spec Driven Development.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="https://specmcp.ai" target="_blank" rel="noopener noreferrer" className="specmcp__cta">
                  Get Early Access ↗
                </a>
                <a href="https://sddbook.com" target="_blank" rel="noopener noreferrer" className="specmcp__cta-secondary">
                  Read the methodology
                </a>
              </div>
            </div>
            <div className="specmcp__terminal">
              <div className="specmcp__terminal-bar">
                <div className="specmcp__terminal-dot" />
                <div className="specmcp__terminal-dot" />
                <div className="specmcp__terminal-dot" />
                <div className="specmcp__terminal-title">claude — mcp</div>
              </div>
              <div className="specmcp__terminal-body">
                <div><span className="t-comment">{'// Your AI assistant calls specmcp'}</span></div>
                <div><span className="t-method">tool_call</span> <span className="t-muted">→</span> <span className="t-key">get_spec</span>(<span className="t-string">&quot;auth-service-v2&quot;</span>)</div>
                <div>&nbsp;</div>
                <div><span className="t-comment">{'// Instantly gets the full spec'}</span></div>
                <div><span className="t-muted">{'{'}</span> <span className="t-key">name</span>: <span className="t-string">&quot;Auth Service v2&quot;</span>,</div>
                <div>&nbsp; <span className="t-key">endpoints</span>: <span className="t-muted">[...],</span> <span className="t-key">schemas</span>: <span className="t-muted">[...],</span></div>
                <div>&nbsp; <span className="t-key">decisions</span>: <span className="t-muted">[...] {'}'}</span></div>
              </div>
            </div>
          </div>

          <div className="specmcp__features reveal">
            <div className="specmcp__feature">
              <div className="specmcp__feature-icon">📄</div>
              <h3>Upload &amp; Sync</h3>
              <p>Import specs from markdown, Notion, Confluence, or GitHub. Keep them in sync automatically.</p>
            </div>
            <div className="specmcp__feature">
              <div className="specmcp__feature-icon">🔌</div>
              <h3>MCP Native</h3>
              <p>Works instantly with Claude, Cursor, Windsurf, and any MCP-compatible AI tool. Zero config.</p>
            </div>
            <div className="specmcp__feature">
              <div className="specmcp__feature-icon">👥</div>
              <h3>Team Ready</h3>
              <p>Shared spec libraries with access controls. Everyone&rsquo;s AI tools pull from the same source of truth.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="specmcp__edge" />
    </>
  )
}
