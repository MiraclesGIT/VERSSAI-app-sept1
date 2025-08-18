#!/bin/bash

# VERSSAI Version Management Quick Setup
echo "🚀 Setting up VERSSAI Version Management & Rollback System"
echo "=========================================================="

# Make all scripts executable
chmod +x setup-version-control.sh
chmod +x checkpoint.sh
chmod +x rollback.sh
chmod +x auto-backup.sh
chmod +x safe-dev.sh

echo "✅ Made all scripts executable"

# Run initial setup
./setup-version-control.sh

echo ""
echo "📸 Creating initial checkpoint..."
./checkpoint.sh "initial_setup" "Version management system initialized"

echo ""
echo "💾 Creating initial backup..."
./auto-backup.sh manual "Initial backup after version control setup"

echo ""
echo "🎉 VERSSAI Version Management Setup Complete!"
echo "============================================"
echo ""
echo "📋 Available Commands:"
echo ""
echo "🔄 SAFE DEVELOPMENT WORKFLOW:"
echo "  ./safe-dev.sh start \"feature-name\"     - Start safe development"
echo "  ./safe-dev.sh save \"progress update\"   - Save progress"
echo "  ./safe-dev.sh finish \"completed work\"  - Finish safely"
echo "  ./safe-dev.sh emergency                  - Emergency save"
echo "  ./safe-dev.sh status                     - Show status"
echo ""
echo "📸 CHECKPOINT SYSTEM:"
echo "  ./checkpoint.sh \"name\" \"description\"   - Create checkpoint"
echo "  ./rollback.sh list                       - List checkpoints"
echo "  ./rollback.sh \"checkpoint-name\"          - Rollback to checkpoint"
echo ""
echo "💾 BACKUP SYSTEM:"
echo "  ./auto-backup.sh manual \"description\"   - Manual backup"
echo "  ./auto-backup.sh status                  - Show backup status"
echo "  ./auto-backup.sh restore \"backup-name\"  - Restore backup"
echo ""
echo "🛡️  PROTECTION FEATURES:"
echo "  ✅ Automatic backups before major changes"
echo "  ✅ Checkpoint system for easy rollback"
echo "  ✅ Emergency save when things go wrong"
echo "  ✅ Branch-based development workflow"
echo "  ✅ Git version control with safety nets"
echo ""
echo "🚨 QUICK HELP:"
echo "  Emergency save:  ./safe-dev.sh emergency"
echo "  List rollbacks:  ./rollback.sh list"
echo "  Show status:     ./safe-dev.sh status"
echo ""
echo "💡 RECOMMENDED WORKFLOW:"
echo "1. Before major changes: ./safe-dev.sh start \"your-feature\""
echo "2. Save progress often:  ./safe-dev.sh save \"what you did\""
echo "3. Finish safely:        ./safe-dev.sh finish \"completed\""
echo "4. If problems occur:    ./safe-dev.sh emergency"
echo ""
echo "🔗 Quick Start Example:"
echo "  ./safe-dev.sh start \"frontend-menu-fix\" \"Fixing navigation issues\""
echo ""
echo "Your work is now protected! 🛡️"