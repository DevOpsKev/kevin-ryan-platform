# kevinryan.io

Professional portfolio website for Kevin Ryan - DevOps & Agile Coach, AI Adoption & Governance Specialist, and Author.

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
- [pre-commit](https://pre-commit.com) (for git hooks)
- [Tessl CLI](https://docs.tessl.io) (for agent skills management)

### Installing pnpm

```bash
npm install -g pnpm
```

### Installing Tessl CLI

```bash
npm install -g @tessl/cli
```

### Installing pre-commit

```bash
# macOS
brew install pre-commit

# Linux
pip install pre-commit

# Windows
pip install pre-commit
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

### 4. Set up pre-commit hooks

```bash
pre-commit install
```

This will configure git hooks to automatically run code quality checks before each commit:
- Trailing whitespace removal
- End-of-file fixing
- YAML validation
- Large file detection

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Docker Compose)

### Commands

- `pnpm docker:build` — Build the production Docker image locally
- `pnpm docker:up` — Build and start the container (add `-d` for detached mode)
- `pnpm docker:down` — Stop and remove the container

### Verify

```bash
curl http://localhost:8080/healthz   # expect: ok
```

### Architecture

Multi-stage build: Node.js builds the static export, then nginx serves the `out/` directory. The final image runs as non-root on port 8080 with JSON structured access logs. Image size is under 50MB.

## Tessl Skills

This project uses [Tessl](https://tessl.io) to manage context and skills for AI coding agents. Skills provide structured, versioned guidance so agents produce code that follows project conventions, framework best practices, and avoids common pitfalls.

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

- `pnpm dev` - Start the development server on http://localhost:3000
- `pnpm build` - Build the production-ready static site
- `pnpm start` - Start the production server (after building)
- `pnpm lint` - Run ESLint to check code quality

## Project Structure

```
kevinryan-io/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── favicon.ico        # Site favicon
├── components/            # React components
│   └── SiteHeader.tsx     # Header component
├── public/                # Static assets
│   ├── kevin.jpg          # Profile photo
│   ├── github_logo_black.png
│   └── linkedin_black_logo.png
├── .tessl/                # Tessl agent context (managed by Tessl CLI)
│   └── tiles/             # Installed skills and documentation
├── .github/
│   └── workflows/
│       └── nextjs.yml     # GitHub Pages deployment
├── .pre-commit-config.yaml # Pre-commit hook configuration
├── tessl.json             # Tessl tile manifest
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
└── package.json           # Project dependencies
```

## Building for Production

This project is configured to export as a static site:

```bash
pnpm build
```

The static files will be generated in the `out/` directory.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

The deployment workflow:
1. Detects the package manager automatically
2. Installs dependencies
3. Builds the Next.js static site
4. Deploys to GitHub Pages

Configuration is in `.github/workflows/nextjs.yml`.

## Development Guidelines

### Code Quality

Pre-commit hooks ensure code quality by:
- Removing trailing whitespace
- Fixing file endings
- Validating YAML syntax
- Preventing large files from being committed

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

The site uses static export mode (`output: 'export'`) for GitHub Pages deployment with:
- Unoptimized images (for static hosting)
- Trailing slashes enabled
- React strict mode

### Pre-commit Hooks

Configured hooks from `pre-commit-hooks`:
- `trailing-whitespace` - Trims trailing whitespace
- `end-of-file-fixer` - Ensures files end with newline
- `check-yaml` - Validates YAML files
- `check-added-large-files` - Prevents large files

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
