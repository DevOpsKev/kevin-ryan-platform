---
title: "Provenance: Spec NNNN — <Title>"
draft: true
---

**Spec:** `.spec/spec-NNNN-<slug>.md`
**Executed:** <YYYY-MM-DD or ISO timestamp>
**Agent:** <agent model and interface, e.g. "Cursor (claude-4.6-opus)" or "Claude Code CLI (claude-sonnet-4-6)">

## Actions Taken

<!-- Chronological numbered list of EVERY action: files read, files created, files modified, files deleted, commands run, external lookups. Be specific — include file paths and what changed. -->

1. Read `path/to/file` for context
2. Created `path/to/new-file`
3. Modified `path/to/existing-file` — description of change
4. Ran `command` — result

## Decisions Made

<!-- Document any decisions the agent made that were NOT explicitly dictated by the spec. Use the table format below. If the spec was fully prescriptive, use the "no autonomous decisions" statement instead. -->

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| ... | ... | ... | ... |

<!-- OR, if no decisions were needed: -->
<!-- No autonomous decisions were required — all actions were explicitly specified in the spec. -->

## Deviations from Spec

<!-- Any points where the agent deviated from what the spec instructed, and why. If none: -->

No deviations from spec.

## Artifacts Produced

| File | Status |
|------|--------|
| `.spec/spec-NNNN-<slug>.md` | Created |
| `path/to/file` | Created / Modified / Deleted |
| `.provenance/spec-NNNN-<slug>.provenance.md` | Created |

## Validation Results

<!-- One entry per validation step from the spec. Use either table or numbered list format — be consistent within a single provenance file. Include PASS/FAIL and brief details. -->

| # | Check | Result |
|---|-------|--------|
| 1 | Spec saved to `.spec/` | Pass |
| 2 | Description of check | Pass / Fail — details |
