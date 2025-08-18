#!/bin/bash

# VERSSAI Rollback System - Safely Revert to Previous Checkpoints
echo "⏪ VERSSAI Rollback System"

# Function to list available checkpoints
list_checkpoints() {
    echo "📋 Available Checkpoints:"
    echo "========================"
    
    if [ -f ".verssai_checkpoints.log" ]; then
        echo "Date & Time        | Checkpoint Name           | Branch Name                      | Commit | Description"
        echo "-------------------|---------------------------|----------------------------------|--------|-------------"
        cat .verssai_checkpoints.log | tail -20 | sort -r
    else
        echo "No checkpoints found. Create one with: ./checkpoint.sh <name>"
    fi
    
    echo ""
    echo "🔍 Recent Git Commits:"
    echo "====================="
    git log --oneline -10 | grep -E "(CHECKPOINT|FEATURE|FIX|UPDATE)" || git log --oneline -10
}

# Function to rollback to a specific checkpoint
rollback_to_checkpoint() {
    local checkpoint_name=$1
    local force=$2
    
    if [ -z "$checkpoint_name" ]; then
        echo "❌ Please specify a checkpoint name"
        list_checkpoints
        echo ""
        echo "Usage: ./rollback.sh <checkpoint_name> [--force]"
        echo "Example: ./rollback.sh \"menu-structure-update\""
        exit 1
    fi
    
    # Find the checkpoint branch
    branch_name=$(git branch -a | grep "checkpoint.*${checkpoint_name}" | head -1 | sed 's/^[ *]*//' | sed 's/remotes\/origin\///')
    
    if [ -z "$branch_name" ]; then
        echo "❌ Checkpoint '$checkpoint_name' not found"
        list_checkpoints
        exit 1
    fi
    
    echo "🔍 Found checkpoint: $branch_name"
    
    # Check for uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        if [ "$force" != "--force" ]; then
            echo "⚠️  You have uncommitted changes!"
            echo ""
            git status --porcelain
            echo ""
            echo "Options:"
            echo "1. Commit your changes first: git add . && git commit -m 'Work in progress'"
            echo "2. Stash your changes: git stash"
            echo "3. Force rollback (will lose current changes): ./rollback.sh $checkpoint_name --force"
            exit 1
        else
            echo "⚠️  Force rollback - discarding current changes..."
            git reset --hard HEAD
        fi
    fi
    
    # Get the commit hash from the branch
    commit_hash=$(git rev-parse "$branch_name")
    
    echo "🔄 Rolling back to checkpoint: $checkpoint_name"
    echo "📍 Target commit: $(git rev-parse --short $commit_hash)"
    
    # Create a backup of current state before rollback
    backup_branch="backup/pre_rollback_$(date +%Y%m%d_%H%M%S)"
    git branch "$backup_branch"
    echo "💾 Current state backed up to: $backup_branch"
    
    # Perform the rollback
    git reset --hard "$commit_hash"
    
    echo "✅ Rollback completed successfully!"
    echo "📋 Current state:"
    echo "   Checkpoint: $checkpoint_name"
    echo "   Commit: $(git rev-parse --short HEAD)"
    echo "   Backup: $backup_branch"
    
    echo ""
    echo "🔄 Next steps:"
    echo "1. Test your application to ensure everything works"
    echo "2. If you need to go back to your previous work: git checkout $backup_branch"
    echo "3. If rollback is good, continue development from here"
}

# Function to create emergency backup
emergency_backup() {
    echo "🚨 Creating emergency backup..."
    backup_branch="emergency_backup_$(date +%Y%m%d_%H%M%S)"
    
    # Stage all changes
    git add .
    
    # Commit if there are changes
    if ! git diff --cached --quiet; then
        git commit -m "EMERGENCY BACKUP: $(date)"
    fi
    
    # Create backup branch
    git branch "$backup_branch"
    
    echo "✅ Emergency backup created: $backup_branch"
    echo "💾 All your work is safely stored"
}

# Main script logic
case "$1" in
    "list"|"ls"|"")
        list_checkpoints
        ;;
    "emergency"|"backup")
        emergency_backup
        ;;
    *)
        rollback_to_checkpoint "$1" "$2"
        ;;
esac