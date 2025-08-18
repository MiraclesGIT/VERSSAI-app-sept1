#!/bin/bash

# VERSSAI Auto-Backup System - Automated Work Protection
echo "💾 VERSSAI Auto-Backup System"

# Configuration
BACKUP_DIR="./backups"
MAX_BACKUPS=10
BACKUP_INTERVAL_MINUTES=30

# Function to create timestamped backup
create_backup() {
    local backup_type=$1
    local description=$2
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_name="${backup_type}_${timestamp}"
    
    echo "📦 Creating backup: $backup_name"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Stage all changes
    git add .
    
    # Check if there are changes
    if git diff --cached --quiet && git diff --quiet; then
        echo "📝 No changes to backup"
        return 0
    fi
    
    # Commit changes if any
    if ! git diff --cached --quiet; then
        commit_message="AUTO-BACKUP ($backup_type): $description"
        git commit -m "$commit_message"
    fi
    
    # Create backup branch
    git branch "backup/$backup_name"
    
    # Create backup archive
    backup_file="$BACKUP_DIR/${backup_name}.tar.gz"
    tar -czf "$backup_file" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='__pycache__' \
        --exclude='*.log' \
        --exclude='backups' \
        .
    
    echo "✅ Backup created successfully!"
    echo "📁 Archive: $backup_file"
    echo "🌳 Branch: backup/$backup_name"
    
    # Log the backup
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $backup_type | $backup_name | $(git rev-parse --short HEAD) | $description" >> .verssai_backups.log
    
    # Clean up old backups
    cleanup_old_backups
}

# Function to clean up old backups
cleanup_old_backups() {
    echo "🧹 Cleaning up old backups..."
    
    # Remove old backup files
    if [ -d "$BACKUP_DIR" ]; then
        backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
        if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
            ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
            echo "🗑️  Removed old backup files"
        fi
    fi
    
    # Clean up old backup branches (keep last 20)
    backup_branches=$(git branch | grep "backup/" | wc -l)
    if [ "$backup_branches" -gt 20 ]; then
        git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/backup/ | \
        sort -k2 | head -n -20 | awk '{print $1}' | xargs -r git branch -D
        echo "🗑️  Removed old backup branches"
    fi
}

# Function to restore from backup
restore_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        echo "📋 Available Backups:"
        echo "===================="
        if [ -f ".verssai_backups.log" ]; then
            cat .verssai_backups.log | tail -20 | sort -r
        else
            echo "No backups found"
        fi
        echo ""
        echo "Usage: ./auto-backup.sh restore <backup_name>"
        return 1
    fi
    
    # Find backup file
    backup_file="$BACKUP_DIR/${backup_name}.tar.gz"
    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file not found: $backup_file"
        return 1
    fi
    
    # Create current state backup before restore
    create_backup "pre_restore" "Before restoring $backup_name"
    
    echo "🔄 Restoring from backup: $backup_name"
    
    # Extract backup
    tar -xzf "$backup_file"
    
    echo "✅ Backup restored successfully!"
    echo "📁 Restored from: $backup_file"
}

# Function to setup auto-backup cron job
setup_auto_backup() {
    local script_path=$(realpath "$0")
    local project_path=$(pwd)
    
    echo "⏰ Setting up automatic backups..."
    
    # Create auto-backup script
    cat > auto-backup-cron.sh << EOF
#!/bin/bash
cd "$project_path"
"$script_path" auto "Automatic backup"
EOF
    
    chmod +x auto-backup-cron.sh
    
    echo "✅ Auto-backup script created: auto-backup-cron.sh"
    echo ""
    echo "🔧 To enable automatic backups every $BACKUP_INTERVAL_MINUTES minutes, run:"
    echo "   crontab -e"
    echo ""
    echo "And add this line:"
    echo "   */$BACKUP_INTERVAL_MINUTES * * * * $(pwd)/auto-backup-cron.sh"
    echo ""
    echo "💡 Or run manually before major changes:"
    echo "   ./auto-backup.sh manual \"Before menu structure changes\""
}

# Function to show backup status
show_status() {
    echo "📊 VERSSAI Backup Status"
    echo "======================="
    echo ""
    
    # Show recent backups
    echo "📋 Recent Backups (last 10):"
    if [ -f ".verssai_backups.log" ]; then
        tail -10 .verssai_backups.log
    else
        echo "No backups found"
    fi
    echo ""
    
    # Show backup storage usage
    if [ -d "$BACKUP_DIR" ]; then
        backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
        backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
        echo "💾 Storage: $backup_size ($backup_count files)"
    else
        echo "💾 Storage: No backups directory"
    fi
    echo ""
    
    # Show git status
    echo "📝 Current Git Status:"
    git status --porcelain | head -10
    if [ $(git status --porcelain | wc -l) -gt 10 ]; then
        echo "... and $(git status --porcelain | wc -l) more changes"
    fi
}

# Main script logic
case "$1" in
    "manual"|"m")
        create_backup "manual" "$2"
        ;;
    "auto"|"a")
        create_backup "auto" "$2"
        ;;
    "restore"|"r")
        restore_backup "$2"
        ;;
    "setup"|"s")
        setup_auto_backup
        ;;
    "status"|"st"|"")
        show_status
        ;;
    "cleanup"|"clean")
        cleanup_old_backups
        ;;
    *)
        echo "VERSSAI Auto-Backup System"
        echo "========================="
        echo ""
        echo "Usage: $0 [command] [description]"
        echo ""
        echo "Commands:"
        echo "  manual <desc>     Create manual backup with description"
        echo "  auto <desc>       Create automatic backup"
        echo "  restore <name>    Restore from backup"
        echo "  status            Show backup status (default)"
        echo "  setup             Setup automatic backups"
        echo "  cleanup           Clean up old backups"
        echo ""
        echo "Examples:"
        echo "  $0 manual \"Before frontend changes\""
        echo "  $0 restore \"manual_20241208_143022\""
        echo "  $0 status"
        ;;
esac