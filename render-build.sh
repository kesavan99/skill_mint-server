#!/usr/bin/env bash
set -euo pipefail

# Script to install ClamAV on Render build instances.
# Run this from the Render `buildCommand` before `npm install`.

echo "Installing ClamAV (apt-get may require appropriate privileges on the build image)..."
apt-get update && apt-get install -y clamav clamav-daemon

# Update virus database
freshclam || true

echo "ClamAV installation finished."
