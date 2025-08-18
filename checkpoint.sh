#!/bin/bash

# VERSSAI Checkpoint System - Create Snapshots Before Major Changes
echo "📸 VERSSAI Checkpoint System"

# Function to create a checkpoint
create_checkpoint() {
    local checkpoint_name=$1
    local description=$2
    
    if [ -z "$checkpoint_name" ]; then
        echo "Usage: ./checkpoint.sh <checkpoint_name> [description]"
        echo "Example: ./checkpoint.sh \"menu-structure-update\" \"Updated main navigation menu\""
        exit 1
    fi
    
    echo "🔄 Creating checkpoint: $checkpoint_name"
    
    # Get current timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    branch_name="checkpoint/${timestamp}_${checkpoint_name}"
    
    # Stage all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        echo "⚠️  No changes to checkpoint"
        exit 0
    fi
    
    # Commit current state
    if [ -n "$description" ]; then
        commit_message="CHECKPOINT: $checkpoint_name - $description"
    else
        commit_message="CHECKPOINT: $checkpoint_name"
    fi
    
    git commit -m "$commit_message"
    
    # Create a checkpoint branch
    git branch "$branch_name"
    
    echo "✅ Checkpoint created successfully!"
    echo "📋 Checkpoint Details:"
    echo "   Name: $checkpoint_name"
    echo "   Branch: $branch_name"
    echo "   Commit: $(git rev-parse --short HEAD)"
    echo "   Description: $description"
    
    # Log the checkpoint
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $checkpoint_name | $branch_name | $(git rev-parse --short HEAD) | $description" >> .verssai_checkpoints.log
    
    echo ""
    echo "🔄 To rollback to this checkpoint later, run:"
    echo "   ./rollback.sh $checkpoint_name"
    echo ""
}

# Create checkpoint
create_checkpoint "$1" "$2"