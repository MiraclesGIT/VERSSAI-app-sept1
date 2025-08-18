#!/bin/bash

# VERSSAI Safe Development Workflow
echo "🛡️  VERSSAI Safe Development Workflow"

# Function to safely start development
safe_start() {
    local feature_name=$1
    local description=$2
    
    if [ -z "$feature_name" ]; then
        echo "Usage: ./safe-dev.sh start <feature_name> [description]"
        echo "Example: ./safe-dev.sh start \"menu-redesign\" \"Updating navigation structure\""
        exit 1
    fi
    
    echo "🚀 Starting safe development for: $feature_name"
    
    # 1. Create backup first
    echo "📦 Creating safety backup..."
    ./auto-backup.sh manual "Before starting $feature_name"
    
    # 2. Create checkpoint
    echo "📸 Creating checkpoint..."
    ./checkpoint.sh "$feature_name" "$description"
    
    # 3. Create feature branch
    timestamp=$(date +"%Y%m%d_%H%M%S")
    branch_name="feature/${timestamp}_${feature_name}"
    git checkout -b "$branch_name"
    
    echo "✅ Safe development environment ready!"
    echo "📋 Environment Details:"
    echo "   Feature: $feature_name"
    echo "   Branch: $branch_name"
    echo "   Backup: Created"
    echo "   Checkpoint: Created"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Make your changes safely"
    echo "2. Test frequently"
    echo "3. Run: ./safe-dev.sh save \"progress update\""
    echo "4. When done: ./safe-dev.sh finish"
}

# Function to save progress during development
save_progress() {
    local message=$1
    
    if [ -z "$message" ]; then
        message="Progress update - $(date)"
    fi
    
    echo "💾 Saving development progress..."
    
    # Stage all changes
    git add .
    
    # Check if there are changes
    if git diff --cached --quiet; then
        echo "📝 No changes to save"
        return 0
    fi
    
    # Commit progress
    git commit -m "WIP: $message"
    
    # Create progress backup
    ./auto-backup.sh manual "Progress: $message"
    
    echo "✅ Progress saved!"
    echo "💡 Continue development or run: ./safe-dev.sh finish"
}

# Function to finish development safely
finish_development() {
    local final_message=$1
    
    if [ -z "$final_message" ]; then
        final_message="Completed development work"
    fi
    
    echo "🏁 Finishing development safely..."
    
    # Save final changes
    git add .
    if ! git diff --cached --quiet; then
        git commit -m "COMPLETE: $final_message"
    fi
    
    # Create final checkpoint
    current_branch=$(git branch --show-current)
    feature_name=$(echo "$current_branch" | sed 's/feature\/[0-9]*_//')
    ./checkpoint.sh "${feature_name}_complete" "$final_message"
    
    # Merge back to main (if desired)
    echo ""
    echo "🔄 Development completed on branch: $current_branch"
    echo ""
    echo "Options:"
    echo "1. Merge to main: git checkout main && git merge $current_branch"
    echo "2. Stay on feature branch for more testing"
    echo "3. Create pull request for review"
    echo ""
    
    # Final backup
    ./auto-backup.sh manual "Completed: $final_message"
    
    echo "✅ Development finished safely!"
    echo "📁 All work is backed up and checkpointed"
}

# Function to emergency save (when things go wrong)
emergency_save() {
    echo "🚨 EMERGENCY SAVE ACTIVATED"
    
    # Create emergency backup immediately
    ./auto-backup.sh manual "EMERGENCY SAVE - $(date)"
    
    # Create emergency checkpoint
    ./checkpoint.sh "emergency_$(date +%H%M%S)" "Emergency save before fixing issues"
    
    echo "✅ Emergency save completed!"
    echo "💾 Your work is safely stored"
    echo ""
    echo "🔄 Recovery options:"
    echo "1. Continue working (everything is backed up)"
    echo "2. Rollback to last checkpoint: ./rollback.sh list"
    echo "3. Restore from backup: ./auto-backup.sh status"
}

# Function to show current development status
show_dev_status() {
    echo "📊 VERSSAI Development Status"
    echo "============================"
    echo ""
    
    # Current branch
    current_branch=$(git branch --show-current)
    echo "🌳 Current Branch: $current_branch"
    
    # Git status
    echo ""
    echo "📝 Git Status:"
    git status --short
    
    # Recent commits
    echo ""
    echo "📋 Recent Commits:"
    git log --oneline -5
    
    # Show recent checkpoints
    echo ""
    echo "📸 Recent Checkpoints:"
    if [ -f ".verssai_checkpoints.log" ]; then
        tail -5 .verssai_checkpoints.log
    else
        echo "No checkpoints yet"
    fi
    
    # Show backup status
    echo ""
    ./auto-backup.sh status
}

# Main script logic
case "$1" in
    "start"|"s")
        safe_start "$2" "$3"
        ;;
    "save"|"progress"|"p")
        save_progress "$2"
        ;;
    "finish"|"complete"|"f")
        finish_development "$2"
        ;;
    "emergency"|"panic"|"help")
        emergency_save
        ;;
    "status"|"st"|"")
        show_dev_status
        ;;
    *)
        echo "VERSSAI Safe Development Workflow"
        echo "================================"
        echo ""
        echo "Usage: $0 [command] [parameters]"
        echo ""
        echo "Commands:"
        echo "  start <name> [desc]    Start safe development for feature"
        echo "  save [message]         Save progress during development"
        echo "  finish [message]       Finish development safely"
        echo "  emergency              Emergency save (when things go wrong)"
        echo "  status                 Show current development status"
        echo ""
        echo "Examples:"
        echo "  $0 start \"menu-update\" \"Redesigning navigation\""
        echo "  $0 save \"Added new components\""
        echo "  $0 finish \"Menu redesign completed\""
        echo "  $0 emergency"
        echo ""
        echo "🛡️  This workflow ensures your work is always protected!"
        ;;
esac