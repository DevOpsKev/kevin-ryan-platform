---
title: "Spec NNNN: <Title>"
draft: true
---

## Task

1. Save this spec to `.sdd/specification/spec-NNNN-<slug>.md` in the repo.
2. Implement all changes described below.
3. After completing all work, create a provenance record at `.sdd/provenance/spec-NNNN-<slug>.provenance.md`. See the **Provenance Record** section for the required format.

## Prerequisites

<!-- List prior specs that must be deployed, and ADRs the agent should read for context. -->

- Spec XXXX deployed: <what must be true>
- Read ADR-NNN (`docs/adr/adr-NNN-<slug>.md`) — <why it matters>

## Context

<!-- Explain WHY this work is needed. Reference the ADR that mandates it. Describe the current state of the system and any lessons learned from prior specs that affect this one. -->

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `path/to/file` | Brief description |

### Key facts

<!-- Bullet list of concrete values the agent will need: image names, ports, hostnames, secret names, chart URLs, node taints, etc. -->

- **Item:** value
- **Item:** value

## 1. <First implementation section>

<!-- Number each major section. Be explicit about WHAT to create/modify and WHERE. Include full code blocks for manifests, HCL, or config the agent should produce. -->

### <Subsection>

```yaml
# Include complete manifests — don't leave the agent guessing
```

**Design notes:**

- Explain non-obvious choices so the agent (and future readers) understand the rationale.
- Call out constraints: why this value, why this pattern, why not the alternative.

## 2. <Second implementation section>

<!-- Continue numbering. Each section should be one logical unit of work (e.g. "Terraform changes", "Kubernetes manifests", "Flux sync"). -->

## Manual steps (not performed by the agent)

<!-- Steps the human operator must perform after the code changes are merged. Include exact commands. -->

1. `command` — what it does
2. `command` — what to expect

Verify:

```bash
verification-command
```

## Provenance Record

After completing the work, create `.sdd/provenance/spec-NNNN-<slug>.provenance.md` using the provenance template at `.sdd/provenance/template.md`.

## Validation steps

After completing all work, confirm:

<!-- Numbered checklist. Each item should be independently verifiable. Cover: file existence, content correctness, linting, formatting, no regressions, provenance completeness, commit integrity. -->

1. This spec has been saved to `.sdd/specification/spec-NNNN-<slug>.md`
2. <File/directory exists with expected contents>
3. <Specific content check — be precise about what to look for>
4. `terraform fmt -check -recursive infra/` passes (if Terraform files changed)
5. `pnpm lint` passes (if site code or markdown changed)
6. The provenance record exists at `.sdd/provenance/spec-NNNN-<slug>.provenance.md` and contains all required sections
7. All files (spec, implementation, provenance) are committed together
