#!/bin/bash
set -e

# Node dependencies
pnpm install

# k3d — local K3s clusters for testing
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Flux CLI — GitOps toolkit
curl -s https://fluxcd.io/install.sh | bash

# tflint — Terraform linter
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# hadolint — Dockerfile linter
curl -sL https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 -o /usr/local/bin/hadolint
chmod +x /usr/local/bin/hadolint

# yamllint — YAML linter
pip install yamllint
