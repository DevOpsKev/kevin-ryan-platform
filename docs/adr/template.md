<!--
  ADR File Naming Convention
  ──────────────────────────
  Filename:  adr-NNN-short-kebab-title.md

  Rules:
  - NNN is a zero-padded three-digit sequence starting at 001
  - short-kebab-title is lowercase, hyphen-separated, max 5 words
  - Title should describe the decision, not the topic
    ✓ adr-001-containerize-with-nginx-alpine.md
    ✗ adr-001-docker.md
  - Never reuse a number, even if the ADR is deprecated
  - Superseded ADRs remain in place with status updated
  - This template lives at adr-000-template.md
-->

---
title: [Title]
---

# ADR-000: [Title]

**Status:** Proposed | Accepted | Superseded | Deprecated
**Date:** YYYY-MM-DD
**Decision Makers:** [Human, Agent, or both]
**Prompted By:** [What triggered the need for this decision]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision Drivers

- [Driver 1]
- [Driver 2]

## Options Considered

### Option A: [Name]

[Description, trade-offs, estimated impact]

### Option B: [Name]

[Description, trade-offs, estimated impact]

### Option C: [Name] *(if applicable)*

[Description, trade-offs, estimated impact]

## Decision

[What was decided and why. One or two paragraphs.]

## Consequences

### Positive

- [Consequence]

### Negative

- [Consequence]

### Risks

- [Risk and mitigation]

## Agent Decisions

Decisions made autonomously by the coding agent during implementation, not explicitly directed by the human.

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| [What the agent chose] | [Why] | Yes / No / Review |

## References

- [Links to relevant docs, specs, prior ADRs]
