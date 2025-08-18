#!/bin/bash

# Enhanced VERSSAI Version Manager with GitHub Integration
# Supports dev/test/prod environments and 15-minute versioning

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/.verssai-safety-config"
BACKUP_DIR="${SCRIPT_DIR}/backups"
PROJECT_ROOT="${SCRIPT_DIR}"

# Environment settings
ENVIRONMENTS=("development" "staging" "production")
DEFAULT_ENV="development"

# GitHub settings
GITHUB_REMOTE="origin"
GITHUB_AUTO_PUSH=${GITHUB_AUTO_PUSH:-true}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
    else
        # Create default config
        cat > "$CONFIG_FILE" << EOF
# VERSSAI Development Safety Configuration
AUTO_BACKUP_INTERVAL_MINUTES=15
MAX_AUTO_BACKUPS=96
AUTO_VERSIONING=true
GITHUB_AUTO_PUSH=true
DEFAULT_ENVIRONMENT=development
BACKUP_COMPRESSION=true
SAFETY_CHECKS=true
VERSION_PREFIX="v"
VERSSAI_PROJECT_NAME="VERSSAI-engineAug10"
EOF
        source "$CONFIG_FILE"
    fi
}

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${timestamp} - $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
        "DEBUG")
            echo -e "${PURPLE}[DEBUG]${NC} ${timestamp} - $message"
            ;;
    esac
}

# Initialize safety system
init_safety_system() {
    log "INFO" "🛡️ Initializing VERSSAI Development Safety System..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Setup Git hooks for safety
    setup_git_hooks
    
    # Initialize environment branches
    setup_environment_branches
    
    # Setup auto-versioning
    setup_auto_versioning
    
    # Create initial configuration
    create_safety_configuration
    
    log "SUCCESS" "✅ Safety system initialized successfully!"
    log "INFO" "📍 Configuration saved to: $CONFIG_FILE"
    log "INFO" "📁 Backups will be stored in: $BACKUP_DIR"
}

# Create safety configuration
create_safety_configuration() {
    cat > "${SCRIPT_DIR}/.verssai-dev-safety.json" << EOF
{
  "version": "2.1.0",
  "initialized": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": {
    "name": "VERSSAI VC Intelligence Platform",
    "repository": "MiraclesGIT/VERSSAI-engineAug10",
    "environments": ["development", "staging", "production"]
  },
  "safety": {
    "auto_backup_enabled": true,
    "auto_versioning_enabled": true,
    "github_auto_push": true,
    "safety_checks": true
  },
  "metrics": {
    "total_backups": 0,
    "total_versions": 0,
    "last_backup": null,
    "last_deploy": null
  }
}
EOF
}

# Setup environment branches
setup_environment_branches() {
    log "INFO" "🌿 Setting up environment branches..."
    
    # Ensure we're in a git repository
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        log "WARNING" "Not in a git repository, initializing..."
        git init
        git add .
        git commit -m "Initial VERSSAI commit with safety system"
    fi
    
    # Create develop branch if it doesn't exist
    if ! git show-ref --verify --quiet "refs/heads/develop"; then
        log "INFO" "Creating develop branch..."
        git checkout -b develop 2>/dev/null || git checkout develop
        git push -u "$GITHUB_REMOTE" develop 2>/dev/null || log "WARNING" "Could not push develop branch to remote"
    fi
    
    for env in "${ENVIRONMENTS[@]}"; do
        if ! git show-ref --verify --quiet "refs/heads/env/$env"; then
            log "INFO" "Creating env/$env branch..."
            git checkout -b "env/$env" 2>/dev/null || true
            git push -u "$GITHUB_REMOTE" "env/$env" 2>/dev/null || log "WARNING" "Could not push env/$env to remote"
        fi
    done
    
    # Return to develop branch
    git checkout develop 2>/dev/null || git checkout -b develop
    log "SUCCESS" "Environment branches created successfully"
}

# Enhanced feature command with environment support
start_feature() {
    local feature_name="$1"
    local environment="${2:-$DEFAULT_ENVIRONMENT}"
    
    if [[ -z "$feature_name" ]]; then
        log "ERROR" "Feature name required"
        echo "Usage: $0 feature <name> [environment]"
        exit 1
    fi
    
    log "INFO" "🚀 Starting feature: $feature_name (env: $environment)"
    
    # Create safety backup
    create_backup "before-feature-$feature_name"
    
    # Switch to environment branch
    git checkout "env/$environment" 2>/dev/null || {
        log "WARNING" "Environment branch env/$environment not found, creating..."
        git checkout -b "env/$environment"
        git push -u "$GITHUB_REMOTE" "env/$environment" 2>/dev/null || log "WARNING" "Could not push to remote"
    }
    
    # Create feature branch
    local branch_name="feature/$feature_name"
    git checkout -b "$branch_name"
    
    # Create version tag
    create_version_tag "$feature_name-start"
    
    log "SUCCESS" "✅ Feature branch '$branch_name' created successfully"
    log "INFO" "📍 Working on environment: $environment"
}

# Enhanced commit with auto-versioning
safe_commit() {
    local message="$1"
    local auto_version="${2:-true}"
    
    if [[ -z "$message" ]]; then
        log "ERROR" "Commit message required"
        exit 1
    fi
    
    log "INFO" "💾 Creating safety commit..."
    
    # Pre-commit safety backup
    create_backup "pre-commit-$(date +%Y%m%d-%H%M%S)"
    
    # Safety checks
    if [[ "$SAFETY_CHECKS" == "true" ]]; then
        run_safety_checks
    fi
    
    # Stage and commit
    git add -A
    git commit -m "$message"
    
    # Auto-versioning if enabled
    if [[ "$auto_version" == "true" && "$AUTO_VERSIONING" == "true" ]]; then
        create_version_tag "auto-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Auto-push if enabled
    if [[ "$GITHUB_AUTO_PUSH" == "true" ]]; then
        local current_branch=$(git branch --show-current)
        git push "$GITHUB_REMOTE" "$current_branch" 2>/dev/null || log "WARNING" "Auto-push failed, will retry later"
    fi
    
    log "SUCCESS" "✅ Commit completed successfully"
}

# Run safety checks
run_safety_checks() {
    log "INFO" "🛡️ Running safety checks..."
    
    # Check for sensitive files
    if git diff --cached --name-only | grep -E '\.(env|key|pem)$' >/dev/null; then
        log "ERROR" "❌ Sensitive files detected in commit!"
        log "ERROR" "Please remove sensitive files before committing."
        exit 1
    fi
    
    # Check for large files
    large_files=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ] && [ $(stat -f%z "{}" 2>/dev/null || stat -c%s "{}" 2>/dev/null || echo 0) -gt 10485760 ]; then echo "{}"; fi')
    if [[ -n "$large_files" ]]; then
        log "WARNING" "⚠️ Large files detected (>10MB):"
        echo "$large_files"
        read -p "Continue anyway? (y/N): " confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            exit 1
        fi
    fi
    
    log "SUCCESS" "✅ Safety checks passed"
}

# Environment deployment
deploy_environment() {
    local target_env="$1"
    local source_branch="${2:-$(git branch --show-current)}"
    
    if [[ -z "$target_env" ]]; then
        log "ERROR" "Target environment required"
        echo "Available: ${ENVIRONMENTS[*]}"
        exit 1
    fi
    
    log "INFO" "🚀 Deploying to $target_env environment..."
    
    # Safety checks for production
    if [[ "$target_env" == "production" ]]; then
        log "WARNING" "⚠️ PRODUCTION DEPLOYMENT - Extra safety checks..."
        log "INFO" "Creating pre-production backup..."
        create_backup "pre-production-deploy-$(date +%Y%m%d-%H%M%S)"
        
        read -p "Are you sure you want to deploy to production? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
            log "INFO" "❌ Production deployment cancelled"
            exit 1
        fi
    fi
    
    # Create deployment backup
    create_backup "pre-deploy-$target_env-$(date +%Y%m%d-%H%M%S)"
    
    # Switch to environment branch
    git checkout "env/$target_env"
    
    # Merge source branch
    git merge "$source_branch" --no-ff -m "Deploy: Merge $source_branch to $target_env"
    
    # Create deployment tag
    local version_tag="deploy-$target_env-$(date +%Y%m%d-%H%M%S)"
    git tag -a "$version_tag" -m "Deployment to $target_env"
    
    # Push to GitHub
    git push "$GITHUB_REMOTE" "env/$target_env" 2>/dev/null || log "WARNING" "Could not push to remote"
    git push "$GITHUB_REMOTE" "$version_tag" 2>/dev/null || log "WARNING" "Could not push tag to remote"
    
    log "SUCCESS" "✅ Successfully deployed to $target_env"
    log "INFO" "📍 Deployment tag: $version_tag"
    
    # Update metrics
    update_deployment_metrics "$target_env" "$version_tag"
}

# Enhanced version tagging
create_version_tag() {
    local tag_suffix="$1"
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local version_tag="${VERSION_PREFIX}${timestamp}"
    
    if [[ -n "$tag_suffix" ]]; then
        version_tag="${VERSION_PREFIX}${timestamp}-${tag_suffix}"
    fi
    
    git tag -a "$version_tag" -m "Auto-version: $version_tag"
    
    if [[ "$GITHUB_AUTO_PUSH" == "true" ]]; then
        git push "$GITHUB_REMOTE" "$version_tag" 2>/dev/null || true
    fi
    
    log "SUCCESS" "📌 Created version tag: $version_tag"
}

# Enhanced backup with compression
create_backup() {
    local backup_name="$1"
    local timestamp=$(date +%Y%m%d-%H%M%S)
    
    if [[ -z "$backup_name" ]]; then
        backup_name="manual-backup-$timestamp"
    fi
    
    local backup_file="${BACKUP_DIR}/${backup_name}-${timestamp}.tar.gz"
    
    log "INFO" "💾 Creating compressed backup: $backup_name"
    
    # Create compressed backup excluding unnecessary files
    tar -czf "$backup_file" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=build \
        --exclude=__pycache__ \
        --exclude=venv \
        --exclude=.env \
        --exclude="*.log" \
        --exclude=backups \
        -C "$PROJECT_ROOT/.." \
        "$(basename "$PROJECT_ROOT")" 2>/dev/null
    
    local size=$(du -h "$backup_file" | cut -f1)
    log "SUCCESS" "✅ Backup created: $backup_file ($size)"
    
    # Update backup metrics
    update_backup_metrics
    
    # Cleanup old backups
    cleanup_old_backups
}

# Update backup metrics
update_backup_metrics() {
    if [[ -f "${SCRIPT_DIR}/.verssai-dev-safety.json" ]]; then
        # Simple increment - in real implementation, use jq
        local backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
        log "DEBUG" "📊 Total backups: $backup_count"
    fi
}

# Update deployment metrics
update_deployment_metrics() {
    local env="$1"
    local tag="$2"
    log "DEBUG" "📊 Deployment recorded: $env -> $tag"
}

# Cleanup old backups
cleanup_old_backups() {
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    
    if [[ "$backup_count" -gt "$MAX_AUTO_BACKUPS" ]]; then
        log "INFO" "🧹 Cleaning up old backups (keeping $MAX_AUTO_BACKUPS)..."
        ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n +$((MAX_AUTO_BACKUPS + 1)) | xargs rm -f
        log "SUCCESS" "✅ Cleanup completed"
    fi
}

# Environment status
show_environment_status() {
    log "INFO" "🌿 Environment Status:"
    echo "===================="
    
    for env in "${ENVIRONMENTS[@]}"; do
        if git show-ref --verify --quiet "refs/heads/env/$env"; then
            local last_commit=$(git log -1 --format="%h %s" "env/$env" 2>/dev/null || echo "No commits")
            local status="${GREEN}✅ Active${NC}"
        else
            local last_commit="Not created"
            local status="${RED}❌ Missing${NC}"
        fi
        
        echo -e "📍 $env: $status"
        echo "   Last: $last_commit"
        echo ""
    done
    
    echo "Current branch: $(git branch --show-current)"
    echo "Current environment: $(get_current_environment)"
    
    # Show recent backups
    echo ""
    log "INFO" "📁 Recent Backups:"
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5 || echo "No backups found"
}

# Get current environment
get_current_environment() {
    local current_branch=$(git branch --show-current)
    
    if [[ "$current_branch" =~ ^env/(.+)$ ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ "$current_branch" =~ ^feature/ ]]; then
        echo "development (feature branch)"
    else
        echo "unknown"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    local hooks_dir=".git/hooks"
    
    if [[ -d "$hooks_dir" ]]; then
        log "INFO" "⚙️ Setting up Git hooks..."
        
        # Pre-commit hook for safety checks
        cat > "$hooks_dir/pre-commit" << 'EOF'
#!/bin/bash
# VERSSAI Safety Pre-commit Hook

# Load safety config
if [[ -f "./.verssai-safety-config" ]]; then
    source "./.verssai-safety-config"
    
    if [[ "$SAFETY_CHECKS" == "true" ]]; then
        echo "🛡️ Running safety checks..."
        
        # Check for sensitive files
        if git diff --cached --name-only | grep -E '\.(env|key|pem)$'; then
            echo "❌ Sensitive files detected in commit!"
            echo "Please remove sensitive files before committing."
            exit 1
        fi
        
        # Check for debug statements
        if git diff --cached | grep -E 'console\.log|debugger|pdb\.set_trace'; then
            echo "⚠️ Debug statements detected in commit!"
            read -p "Continue anyway? (y/N): " confirm
            if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
                exit 1
            fi
        fi
        
        echo "✅ Safety checks passed"
    fi
fi
EOF
        chmod +x "$hooks_dir/pre-commit"
        
        log "SUCCESS" "✅ Git hooks installed"
    fi
}

# Auto-versioning setup
setup_auto_versioning() {
    if [[ "$AUTO_VERSIONING" == "true" ]]; then
        log "INFO" "⚙️ Setting up auto-versioning (every $AUTO_BACKUP_INTERVAL_MINUTES minutes)"
        
        # Create auto-versioning script
        cat > "${SCRIPT_DIR}/auto-version-daemon.sh" << EOF
#!/bin/bash
# Auto-versioning daemon for VERSSAI

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "\${SCRIPT_DIR}/.verssai-safety-config"

log_auto() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] \$1" >> "\${SCRIPT_DIR}/auto-version.log"
}

while true; do
    if git diff --quiet && git diff --cached --quiet; then
        log_auto "No changes detected, skipping version..."
    else
        log_auto "Changes detected, creating auto-version..."
        "\${SCRIPT_DIR}/enhanced-version-manager.sh" commit "Auto-version: \$(date)" false
        "\${SCRIPT_DIR}/enhanced-version-manager.sh" version-tag "auto"
    fi
    
    sleep \$((AUTO_BACKUP_INTERVAL_MINUTES * 60))
done
EOF
        chmod +x "${SCRIPT_DIR}/auto-version-daemon.sh"
        
        log "SUCCESS" "✅ Auto-versioning configured"
    fi
}

# Emergency rollback
emergency_rollback() {
    local backup_name="$1"
    
    if [[ -z "$backup_name" ]]; then
        log "ERROR" "Backup name required for rollback"
        list_backups
        exit 1
    fi
    
    log "WARNING" "🚨 EMERGENCY ROLLBACK INITIATED"
    log "INFO" "Creating safety backup before rollback..."
    
    # Create safety backup
    create_backup "emergency-safety-$(date +%Y%m%d-%H%M%S)"
    
    # Find backup file
    local backup_file=$(find "$BACKUP_DIR" -name "*$backup_name*.tar.gz" | head -1)
    
    if [[ -z "$backup_file" ]]; then
        log "ERROR" "Backup file not found: $backup_name"
        exit 1
    fi
    
    log "INFO" "Restoring from: $backup_file"
    
    # Extract backup
    cd "$PROJECT_ROOT/.."
    tar -xzf "$backup_file"
    
    log "SUCCESS" "✅ Emergency rollback completed"
    log "WARNING" "⚠️ Please verify system state and commit if satisfied"
}

# List backups
list_backups() {
    log "INFO" "📋 Available backups:"
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null | while read -r line; do
        echo "  $line"
    done
}

# Main command handler
main() {
    load_config
    
    case "${1:-help}" in
        "init")
            init_safety_system
            ;;
        "feature"|"f")
            start_feature "$2" "$3"
            ;;
        "commit"|"c")
            safe_commit "$2" "$3"
            ;;
        "deploy"|"d")
            deploy_environment "$2" "$3"
            ;;
        "backup"|"b")
            create_backup "$2"
            ;;
        "status"|"s")
            show_environment_status
            ;;
        "env-status"|"es")
            show_environment_status
            ;;
        "version-tag"|"vt")
            create_version_tag "$2"
            ;;
        "list"|"l")
            list_backups
            ;;
        "emergency-rollback"|"er")
            emergency_rollback "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "help"|"h"|*)
            cat << EOF
🛡️ VERSSAI Enhanced Development Safety System v2.1.0

Commands:
  init                     Initialize safety system
  feature <name> [env]     Start new feature (f)
  commit <message>         Safe commit with backup (c)
  deploy <env> [branch]    Deploy to environment (d)
  backup [name]            Create manual backup (b)
  status                   Show project status (s)
  env-status              Show environment status (es)
  version-tag [suffix]     Create version tag (vt)
  list                     List backups (l)
  emergency-rollback <backup>  Emergency rollback (er)
  cleanup                  Clean old backups

Environments: ${ENVIRONMENTS[*]}

Examples:
  $0 init
  $0 feature new-ui development
  $0 commit "Added new component"
  $0 deploy staging
  $0 deploy production feature/new-ui
  $0 backup milestone-1
  $0 emergency-rollback milestone-1

Configuration: $CONFIG_FILE
Backups: $BACKUP_DIR
EOF
            ;;
    esac
}

# Run main function
main "$@"