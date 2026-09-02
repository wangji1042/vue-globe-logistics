#!/usr/bin/env bash
set -euo pipefail

# Idempotent dependency bootstrap for the Vite + Vue 3 app.
#
# Two properties of the committed package-lock.json need handling here:
#   1. Its resolved URLs point at registry.npmmirror.com, which is not on the
#      Cloud Agent egress allowlist. registry.npmjs.org is allowlisted, so we
#      force the official registry and rewrite the resolved hosts.
#   2. It was generated on Windows, so the packages map only contains the
#      win32 native binaries (rollup, esbuild). Combined with npm's optional
#      dependency bug this leaves the Linux rollup native module uninstalled,
#      which breaks `vite build`. We install the matching binary afterwards.
REGISTRY="https://registry.npmjs.org/"

npm ci --registry="$REGISTRY" --replace-registry-host=always

ROLLUP_VERSION="$(node -p "require('./node_modules/rollup/package.json').version")"
npm install --no-save --registry="$REGISTRY" --replace-registry-host=always \
  "@rollup/rollup-linux-x64-gnu@${ROLLUP_VERSION}"
