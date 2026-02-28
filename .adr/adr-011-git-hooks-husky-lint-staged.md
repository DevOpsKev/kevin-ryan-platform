# ADR-011: Git hooks with Husky and lint-staged

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** The current pre-commit configuration runs only three hooks (trailing whitespace, end-of-file fix, YAML check) via the Python-based `pre-commit` framework. No code linting, no type checking, no format enforcement. The repo is becoming polyglot (TypeScript, HCL, YAML, Dockerfile, Markdown) and needs quality gates that catch errors before they reach CI.

## Context

The repository uses `pre-commit` (the Python framework) with three hooks from `pre-commit-hooks`:

```yaml
- trailing-whitespace
- end-of-file-fixer
- check-yaml
```

This catches whitespace issues but nothing else. ESLint exists in the project (`pnpm lint`) but is not enforced at commit time. TypeScript type checking (`tsc --noEmit`) is not enforced anywhere except `pnpm build`. There is no linting for Terraform HCL, Kubernetes YAML, Dockerfiles, or Markdown — all of which are now first-class artefacts following ADRs 005–010.

The `pre-commit` framework itself is a Python tool. This is a Node.js project managed by pnpm. Developers must have Python installed and must remember to run `pre-commit install` as a separate step after `pnpm install`. This is a friction point that results in hooks simply not being installed.

The repo needs quality gates that are automatic (installed by `pnpm install`), fast (under 5 seconds on staged files), comprehensive (every file type), and native to the Node.js toolchain.

## Decision Drivers

- **Automatic installation:** Hooks must be installed as a side effect of `pnpm install`. No separate setup step, no second toolchain.
- **Fast on commit:** Pre-commit hooks must complete in under 5 seconds for a typical change. Developers (Kevin) should never be tempted to `--no-verify`.
- **Staged files only:** Linters run only on files being committed, not the entire codebase. A one-line CSS change should not trigger a full TypeScript type check.
- **Polyglot coverage:** TypeScript, HCL, YAML, Markdown, and Dockerfiles all have appropriate linters enforced.
- **Build verification before push:** The full `pnpm build` runs as a pre-push hook to catch build failures before they hit CI.
- **Node-native toolchain:** The hook framework should be a Node.js package managed by pnpm, not an external tool requiring Python or another runtime.

## Options Considered

### Option A: Husky + lint-staged

Husky is a Node.js package that manages Git hooks. It installs via the `prepare` script in `package.json`, meaning hooks are set up automatically on `pnpm install`. lint-staged runs configured linters only on staged files, supporting glob patterns for per-file-type routing.

Husky creates hook scripts in `.husky/` (committed to Git). lint-staged configuration lives in `package.json` or `.lintstagedrc`. Both are Node-native, managed by pnpm, and require no external runtime.

The combination is the dominant pattern in the Node.js ecosystem — used by React, Next.js, Prettier, and most major open-source projects.

### Option B: pre-commit framework (status quo, extended)

Extend the existing `pre-commit` configuration with additional hooks: eslint, tsc, terraform-fmt, yamllint, markdownlint, hadolint. The `pre-commit` framework supports all of these via community-maintained hook repositories.

Retains the Python dependency. Requires `pre-commit install` as a separate step — not triggered by `pnpm install`. Adding ESLint via pre-commit runs it in a separate virtualenv, duplicating the Node.js toolchain. The framework is powerful and language-agnostic, but it is a foreign tool in a Node.js project, and the separate install step is the root cause of the current enforcement gap.

### Option C: lefthook

Go-based Git hook manager. Single binary, fast, supports parallel hook execution. Configuration in `lefthook.yml`. Can be installed via npm (`lefthook` package wraps the binary).

Less established than Husky in the Node.js ecosystem. Parallel execution is a performance advantage for large monorepos but irrelevant for a portfolio project with fast linters. The Go binary adds a transitive dependency on a different compilation target. Husky's ecosystem penetration makes it the safer choice for a project that serves as a portfolio artefact — reviewers will recognise Husky immediately.

## Decision

**Replace `pre-commit` with Husky + lint-staged.** Option A.

### Pre-commit hook (fast, staged files only)

lint-staged runs the following linters on staged files, matched by glob pattern:

| Glob | Linter | Purpose |
|------|--------|---------|
| `*.{ts,tsx}` | `eslint --fix` | Code quality and style enforcement |
| `*.{ts,tsx}` | `tsc-files --noEmit` | Type checking on staged files only (not full project) |
| `*.{tf,tfvars}` | `terraform fmt -check` | HCL format enforcement |
| `*.{tf,tfvars}` | `tflint` | Terraform linting (deprecated resources, naming, best practices) |
| `*.{yaml,yml}` | `yamllint -s` | YAML syntax and style (Kubernetes manifests, GitHub Actions) |
| `*.md` | `markdownlint` | Heading levels, broken links, line length (ADRs, README) |
| `Dockerfile*` | `hadolint` | Dockerfile best practices (pinned versions, multi-stage hygiene) |
| `*` | Trailing whitespace + end-of-file fix (via lint-staged built-in or simple script) | Replaces current pre-commit hooks |

**Expected runtime:** Under 5 seconds for a typical commit touching 1–5 files.

**Note on `tsc-files`:** Standard `tsc --noEmit` type-checks the entire project regardless of which files are staged. The `tsc-files` package (or equivalent) runs type checking only on the staged `.ts`/`.tsx` files and their direct dependencies, keeping the pre-commit hook fast.

### Pre-push hook (heavier, full project)

The pre-push hook runs checks that are too slow for every commit but must pass before code reaches the remote:

| Check | Command | Purpose |
|-------|---------|---------|
| Full build | `pnpm build` | Catches build failures (static export, TypeScript compilation, CSS processing) before CI |

**Expected runtime:** 15–30 seconds (Next.js static export of a portfolio site).

### Package changes

**Add (devDependencies):**
- `husky` — Git hook management
- `lint-staged` — Run linters on staged files
- `tsc-files` — Staged-only TypeScript type checking
- `markdownlint-cli` — Markdown linting CLI
- `yamllint` — installed globally or via pip (system dependency, documented in README)
- `hadolint` — installed as a binary (system dependency, documented in README)
- `tflint` — installed as a binary (system dependency, documented in README)

**Remove:**
- `.pre-commit-config.yaml`
- `pre-commit` from prerequisites in README

**Add to `package.json`:**
```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "tsc-files --noEmit"],
    "*.{tf,tfvars}": ["terraform fmt -check", "tflint"],
    "*.{yaml,yml}": ["yamllint -s"],
    "*.md": ["markdownlint"],
    "Dockerfile*": ["hadolint"]
  }
}
```

**Add `.husky/` directory (committed to Git):**
```
.husky/
├── pre-commit    # npx lint-staged
└── pre-push      # pnpm build
```

### System dependencies

`yamllint`, `hadolint`, and `tflint` are not Node.js packages. They are installed as system binaries. The README and AGENTS.md must document these as prerequisites. If a system dependency is missing at commit time, lint-staged will fail with a clear error — this is intentional. It surfaces the missing tool immediately rather than silently skipping the check.

For CI (GitHub Actions), these tools are installed as workflow steps. For local development, they are documented in the README prerequisites section alongside Node.js and pnpm.

## Consequences

### Positive

- **Automatic hook installation.** `pnpm install` triggers the `prepare` script, which runs `husky`. No separate step, no forgotten hooks. Anyone cloning the repo gets hooks on first install
- **Staged files only.** A one-file Markdown fix runs markdownlint on that file in under a second, not ESLint across the whole project. Pre-commit stays fast enough that `--no-verify` is never tempting
- **Polyglot coverage.** Every file type in the repo has an appropriate linter enforced at commit time. TypeScript, HCL, YAML, Markdown, and Dockerfiles are all first-class citizens
- **Build gate before push.** `pnpm build` on pre-push catches static export failures, TypeScript errors, and CSS issues before they consume CI minutes. Faster feedback than waiting for GitHub Actions
- **Node-native toolchain.** Husky and lint-staged are pnpm-managed devDependencies. No Python runtime required for hook management
- **Consistent with ecosystem conventions.** Husky + lint-staged is the standard pattern in Node.js projects. Anyone reviewing the repo recognises the setup immediately

### Negative

- **System dependencies for non-Node linters.** `yamllint`, `hadolint`, and `tflint` must be installed separately. This is documented in the README but cannot be enforced by `pnpm install`. A developer without hadolint installed will fail on their first Dockerfile commit — by design, but initially surprising
- **`tsc-files` is a workaround.** Staged-only type checking is an approximation — it may miss errors in files that depend on the staged changes but are not themselves staged. The pre-push `pnpm build` catches these, but there is a gap between commit and push where type errors can exist
- **Husky's `prepare` script runs on CI too.** In CI environments where hooks are not needed, `husky` detects CI and skips installation. But if CI configuration is unusual, the prepare step can fail. Mitigation: Husky v9+ handles this gracefully with the `HUSKY=0` environment variable

### Risks

- **lint-staged + ESLint autofix modifies staged files.** `eslint --fix` can change file contents after staging but before commit. lint-staged handles this by re-adding fixed files to the staging area. If ESLint fix produces unexpected changes, they are included in the commit. Mitigation: review `git diff --staged` after lint-staged runs if unsure; ESLint rules should be stable and predictable
- **Pre-push build blocks on slow builds.** If `pnpm build` takes longer than expected (e.g., a large content addition), the pre-push hook blocks the push. Mitigation: the portfolio site builds in 15–30 seconds. If build time grows significantly, the pre-push check can be moved to CI only. `git push --no-verify` is available as an escape hatch but should be rare
- **Tool version drift between local and CI.** ESLint, markdownlint, tflint, and hadolint versions installed locally may differ from CI. Mitigation: pin Node.js tool versions in `package.json`. Document system tool versions in README and match them in GitHub Actions workflow

## Agent Decisions

*To be completed after Claude Code implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [Husky documentation](https://typicode.github.io/husky/)
- [lint-staged documentation](https://github.com/lint-staged/lint-staged)
- [tsc-files](https://github.com/gustavopch/tsc-files)
- [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli)
- [yamllint](https://github.com/adrienverge/yamllint)
- [hadolint](https://github.com/hadolint/hadolint)
- [tflint](https://github.com/terraform-linters/tflint)
- [AGENTS.md](../AGENTS.md) — project constraints and pre-commit checklist
