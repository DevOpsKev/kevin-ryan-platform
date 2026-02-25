# kevinryan.io

Professional portfolio website for Kevin Ryan - DevOps & Agile Coach, AI Adoption & Governance Specialist, and Author.

## Tech Stack

- [Next.js 16](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com) - Tailwind CSS component library
- [Fitty](https://github.com/rikschennink/fitty) - Text fitting library

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org) (v20 or higher)
- [pnpm](https://pnpm.io) (recommended package manager)
- [pre-commit](https://pre-commit.com) (for git hooks)

### Installing pnpm

```bash
npm install -g pnpm
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

### 3. Set up pre-commit hooks

```bash
pre-commit install
```

This will configure git hooks to automatically run code quality checks before each commit:
- Trailing whitespace removal
- End-of-file fixing
- YAML validation
- Large file detection

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

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
├── .github/
│   └── workflows/
│       └── nextjs.yml     # GitHub Pages deployment
├── .pre-commit-config.yaml # Pre-commit hook configuration
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
