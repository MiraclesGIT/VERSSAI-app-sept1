#!/bin/bash
# Auto-versioning daemon for VERSSAI

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/.verssai-safety-config"

log_auto() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "${SCRIPT_DIR}/auto-version.log"
}

while true; do
    if git diff --quiet && git diff --cached --quiet; then
        log_auto "No changes detected, skipping version..."
    else
        log_auto "Changes detected, creating auto-version..."
        "${SCRIPT_DIR}/enhanced-version-manager.sh" commit "Auto-version: $(date)" false
        "${SCRIPT_DIR}/enhanced-version-manager.sh" version-tag "auto"
    fi
    
    sleep $((AUTO_BACKUP_INTERVAL_MINUTES * 60))
done
