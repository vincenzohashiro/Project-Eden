#!/usr/bin/env bash
# Redeploys panel-server on the VPS. Run from /opt/mc-panel/panel-server
# (or wherever the repo is checked out) as the `panel` user or via sudo -u panel.

set -euo pipefail

git pull
npm ci
npm run build
sudo systemctl restart mc-panel-api
sudo systemctl status mc-panel-api --no-pager
