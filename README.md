# kevinryan.io

Multi-site platform monorepo for Kevin Ryan's web properties. Currently hosts [kevinryan.io](https://kevinryan.io) — a professional portfolio site. See [ADR-013](.adr/adr-013-monorepo-pnpm-workspaces.md) for the monorepo architecture decision.

## Tech Stack

- [Next.js 16](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com) - Tailwind CSS component library
- [Fitty](https://github.com/rikschennink/fitty) - Text fitting library
- [Tessl](https://tessl.io) - Agent context and skills management

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org) (v20 or higher)
- [pnpm](https://pnpm.io) (recommended package manager)
- [Tessl CLI](https://docs.tessl.io) (for agent skills management)
- [yamllint](https://github.com/adrienverge/yamllint) (for YAML linting in git hooks)
- [hadolint](https://github.com/hadolint/hadolint) (for Dockerfile linting in git hooks)
- [tflint](https://github.com/terraform-linters/tflint) (for Terraform linting in git hooks — needed once infra/ directory is added)

### Installing pnpm

```bash
npm install -g pnpm
```

### Installing Tessl CLI

```bash
npm install -g @tessl/cli
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DevOpsKev/kevinryan-io.git
cd kevinryan-io
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up Tessl

Initialize Tessl and sync agent skills:

```bash
tessl init --agent claude-code
tessl install
```

This reads `tessl.json` and installs all configured tiles and skills into `.tessl/tiles/`. Skills are automatically loaded by coding agents when relevant to the current task.

To verify installed tiles:

```bash
tessl list
```

### 4. Git hooks (automatic)

Git hooks are installed automatically by Husky when you run `pnpm install`. No additional setup required.

The pre-commit hook runs lint-staged (ESLint, TypeScript type checking, markdownlint, yamllint,
hadolint, terraform fmt, tflint) on staged files only. The pre-push hook runs `pnpm build` to
catch build failures before they reach CI.

### 5. Run the development server

```bash
pnpm dev:kevinryan-io
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Docker Compose)

### Commands

```bash
cd sites/kevinryan-io
pnpm docker:build    # Build the production Docker image locally
pnpm docker:up       # Build and start the container
pnpm docker:down     # Stop and remove the container
```

### Verify

```bash
curl http://localhost:8080/healthz   # expect: ok
```

### Architecture

Multi-stage build: Node.js builds the static export, then nginx serves the `out/` directory. The final image runs as non-root on port 8080 with JSON structured access logs. Image size is under 50MB.

## Tessl Skills

This project uses [Tessl](https://tessl.io) to manage context and skills for AI coding agents. Skills provide structured, versioned
guidance so agents produce code that follows project conventions, framework best practices, and avoids common pitfalls.

### Installed Tiles

| Tile | Version | Purpose |
|------|---------|---------|
| `tessl/npm-next` | 16.0.0 | Next.js 16 documentation and API context |
| `tessl/npm-react` | 19.2.0 | React 19 documentation and API context |
| `tessl/npm-react-dom` | 19.2.0 | React DOM 19 documentation and API context |
| `vercel-labs/agent-skills` | e23951b | React and Next.js performance best practices from Vercel Engineering |
| `tessl/npm-tailwindcss--typography` | 0.5.0 | Tailwind CSS Typography plugin documentation |
| `tessl/npm-tailwindcss--forms` | 0.5.0 | Tailwind CSS Forms plugin documentation |
| `secondsky/claude-skills` | 6ebd12c | Aceternity UI — animated React components for Next.js with Tailwind |
| `microsoft/agent-skills` | — | Microsoft skill-creator with cloud-deploy patterns (AWS, GCP, Azure) |
| `tessl/pypi-azure-mgmt-containerservice` | 39.1.0 | Azure Container Service SDK docs for AKS provisioning |

### Custom Skills (Planned)

The following skills are being authored for this project and will be published to the Tessl Registry:

| Skill | Covers |
|-------|--------|
| `nextjs-docker` | Multi-stage Dockerfile for Next.js static export with pnpm, distroless runtime, .dockerignore patterns |
| `azure-bicep-k3s` | Bicep modules for Azure VM + k3s bootstrap, ACR, NSG, managed identity, role assignments |
| `k3s-deployment` | k3s cluster setup, Traefik ingress config, Kubernetes manifests for containerised Next.js apps |

To scaffold a new skill:

```bash
tessl skill new
```

### Adding Skills

Browse the [Tessl Registry](https://tessl.io/registry) to find additional skills, or install directly:

```bash
# Search the registry
tessl search "keyword"

# Install from registry
tessl install tessl-labs/skill-name

# Install from GitHub
tessl install github:owner/repo --skill skill-name
```

## Available Scripts

### Workspace root

- `pnpm build` — Build all sites
- `pnpm lint` — Lint all sites
- `pnpm dev:kevinryan-io` — Start kevinryan.io dev server

### Site-level (from `sites/kevinryan-io/`)

- `pnpm dev` — Start the development server
- `pnpm build` — Build the static site
- `pnpm lint` — Run ESLint

### Or from repo root using filters

- `pnpm --filter kevinryan-io dev`
- `pnpm --filter kevinryan-io build`

## Project Structure

```text
kevinryan-io/
├── .adr/                   # Architecture Decision Records
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Build → push ACR + GHCR → update manifest
│       └── terraform.yml   # Plan on push to infra/, gated apply
├── .husky/                 # Git hooks (managed by Husky)
│   ├── pre-commit          # Runs lint-staged on staged files
│   └── pre-push            # Runs pnpm build (all sites)
├── .tessl/                 # Tessl agent context (managed by Tessl CLI)
├── infra/                  # Terraform infrastructure-as-code
│   ├── bootstrap/          # State storage (applied once)
│   ├── modules/            # network, compute, registry, cloudflare
│   ├── main.tf             # Root module wiring
│   └── variables.tf        # Input variables
├── k8s/                    # Kubernetes manifests (watched by Flux CD)
│   └── kevinryan-io/       # App namespace, deployment, service, ingress
├── sites/
│   └── kevinryan-io/       # kevinryan.io Next.js app
│       ├── app/            # Next.js App Router pages
│       ├── components/     # React components (one per file)
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Shared utilities
│       ├── public/         # Static assets
│       ├── Dockerfile      # Multi-stage Docker build
│       ├── nginx.conf      # nginx configuration
│       ├── docker-compose.yml
│       ├── next.config.ts  # Next.js configuration
│       ├── tsconfig.json   # TypeScript configuration
│       ├── eslint.config.mjs
│       ├── postcss.config.mjs
│       └── package.json    # Site dependencies
├── pnpm-workspace.yaml     # Workspace configuration
├── AGENTS.md               # Agent rules and conventions
├── CLAUDE.md               # Claude Code instructions
├── tessl.json              # Tessl tile manifest
└── package.json            # Workspace root
```

## Building for Production

```bash
pnpm build                              # Build all sites
pnpm --filter kevinryan-io build        # Build kevinryan.io only
```

Static files are generated in `sites/kevinryan-io/out/`.

## Infrastructure

The site runs as a containerised static site on K3s (lightweight Kubernetes) on an Azure Spot VM, with Cloudflare as the CDN and edge layer. See [ADR-005](.adr/adr-005-k3s-azure-spot-cloudflare-cdn.md) for the full architecture decision.

```text
Cloudflare (DNS + CDN + TLS)
     │
     │  HTTPS origin pull
     ▼
Azure Spot VM (B2ms, North Europe)
├── K3s (Traefik Ingress)
├── Flux CD (GitOps reconciliation)
└── kevinryan-io (nginx container)
```

### Prerequisites for infrastructure

- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Terraform](https://developer.hashicorp.com/terraform/install) (>= 1.5)
- [Flux CLI](https://fluxcd.io/flux/installation/)
- Cloudflare API token with DNS edit permissions
- GitHub PAT for Flux bootstrap

### Bootstrap

Infrastructure is provisioned in two stages:

1. **State storage** (one-time): Creates the Azure Storage Account for Terraform state.

    ```bash
    cd infra/bootstrap
    terraform init
    terraform apply -var="storage_account_name=krtfstateXXXXX"
    ```

2. **Main infrastructure**: Provisions the VM, ACR, networking, and Cloudflare DNS.

    ```bash
    cd infra
    cp terraform.tfvars.example terraform.tfvars
    # Edit terraform.tfvars with real values
    terraform init -backend-config="storage_account_name=<from step 1>"
    terraform plan
    terraform apply
    ```

### GitHub environment setup

Create a `production` environment in the GitHub repo settings (Settings > Environments) with Kevin as a required reviewer. This gates Terraform apply in CI.

## Deployment

The site deploys via GitOps using GitHub Actions and Flux CD:

1. Push application code to `main`
2. GitHub Actions builds the Docker image, pushes to ACR and GHCR with SHA tags
3. GitHub Actions updates the image tag in `k8s/kevinryan-io/deployment.yaml` and commits
4. Flux CD (running inside K3s) detects the manifest change and applies it to the cluster
5. Kubernetes performs a rolling update

Infrastructure changes (pushes to `infra/`) trigger a separate workflow with a manual approval gate before `terraform apply`.

Configuration is in `.github/workflows/deploy.yml` and `.github/workflows/terraform.yml`.

## Development Guidelines

### Code Quality

Husky + lint-staged enforce code quality automatically at commit time:

- **TypeScript** (`*.ts`, `*.tsx`): ESLint with autofix + `tsc-files` type checking on staged files
- **Markdown** (`*.md`): markdownlint for heading levels, line length, and structure
- **YAML** (`*.yaml`, `*.yml`): yamllint for syntax and style
- **Dockerfiles** (`Dockerfile*`): hadolint for best practices
- **Terraform** (`*.tf`, `*.tfvars`): `terraform fmt` + tflint

The pre-push hook runs `pnpm build` to catch build failures before they reach CI.

### Styling

The project uses:

- Tailwind CSS for utility classes
- DaisyUI for pre-built components
- Custom color scheme with primary/secondary gradients
- Responsive design (mobile-first approach)

### TypeScript

Strict TypeScript is enabled with:

- Type checking on build
- Path aliases (`@/*` maps to project root)
- React JSX compilation

## Configuration

### Next.js Config

Configuration lives at `sites/kevinryan-io/next.config.ts`. The site uses static export mode (`output: 'export'`) for GitHub Pages deployment with:

- Unoptimized images (for static hosting)
- Trailing slashes enabled
- React strict mode

### Git Hooks

Managed by [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged). Hooks are installed automatically via `pnpm install`.

- **pre-commit**: Runs lint-staged on staged files (ESLint, tsc-files, markdownlint, yamllint, hadolint, terraform fmt, tflint)
- **pre-push**: Runs `pnpm build` which delegates to all workspace sites via `--filter`

To skip hooks temporarily (not recommended):

```bash
git commit --no-verify
```

## Browser Support

The site targets modern browsers with ES2017+ support.

## License

© 2026 Kevin Ryan. All rights reserved.

## Contact

- Email: kevin@kevinryan.io
- Phone: +44 7402 083261
- GitHub: [@devopskev](https://github.com/devopskev)
- LinkedIn: [/in/devopskev](https://linkedin.com/in/devopskev)
- Website: [distributedequity.org](https://distributedequity.org)
