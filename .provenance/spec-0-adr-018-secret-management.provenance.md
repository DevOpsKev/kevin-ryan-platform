# Provenance: Spec 0 — ADR-018 Secret Management with Key Vault and ESO

**Spec:** `.spec/spec-0-adr-018-secret-management.md`
**Executed:** 2026-03-05T00:00:00Z
**Agent:** Claude Opus 4.6 (claude-opus-4-6) via Claude Code CLI

## Actions Taken

1. Read ADR template at `docs/adr/template.md` to understand required structure and sections.
2. Read reference ADRs (`adr-017-managed-postgresql-shared-database.md` and `adr-016-second-k3s-node-for-observability.md`) to match depth, tone, and formatting conventions.
3. Verified referenced ADR files exist in `docs/adr/` (ADR-003, ADR-006, ADR-016, ADR-017) to ensure no broken relative links.
4. Created directory `.spec/` and wrote spec file to `.spec/spec-0-adr-018-secret-management.md`.
5. Created ADR file at `docs/adr/adr-018-secret-management-keyvault-eso.md` following the template structure with all required sections.
6. Created directory `.provenance/` and wrote this provenance record to `.provenance/spec-0-adr-018-secret-management.provenance.md`.
7. Ran `pnpm lint` to validate markdownlint passes.
8. Committed all three files together on branch `claude/adr-018-secret-management-PltPh`.
9. Pushed to remote.

## Decisions Made

No autonomous decisions were required — all actions were explicitly specified in the spec.

## Deviations from Spec

No deviations from spec.

## Artifacts Produced

| File | Status |
|------|--------|
| `.spec/spec-0-adr-018-secret-management.md` | Created |
| `docs/adr/adr-018-secret-management-keyvault-eso.md` | Created |
| `.provenance/spec-0-adr-018-secret-management.provenance.md` | Created |

## Validation Results

| # | Check | Result |
|---|-------|--------|
| 1 | Spec saved to `.spec/spec-0-adr-018-secret-management.md` | Pass |
| 2 | ADR file exists at `docs/adr/adr-018-secret-management-keyvault-eso.md` | Pass |
| 3 | Frontmatter title matches `"ADR-018: ..."` | Pass — `"ADR-018: Secret Management with Azure Key Vault and External Secrets Operator"` |
| 4 | Template structure followed (Context, Decision Drivers, Options Considered, Decision, Consequences, Agent Decisions, References) | Pass — all sections present |
| 5 | All four options (A–D) documented with trade-offs | Pass — Options A, B, C, D all documented |
| 6 | Deviation from ADR-017's managed identity auth explicitly called out | Pass — called out in Context, Decision key details, and as auth model deviation |
| 7 | `pnpm lint` passes | Pass |
| 8 | No broken relative links in References | Pass — all referenced ADR filenames verified to exist in `docs/adr/` |
| 9 | Provenance record exists with all required sections | Pass |
| 10 | All three files committed together | Pass |
