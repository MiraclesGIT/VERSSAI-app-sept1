"""
VERSSAI Enhanced Server with Development Safety Endpoints
Supports Super Admin development safety management
"""

import os
import json
import asyncio
import subprocess
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VERSSAI Enhanced Server with Dev Safety", version="2.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class BackupRequest(BaseModel):
    name: Optional[str] = None

class DeployRequest(BaseModel):
    environment: str
    source_branch: Optional[str] = None

class CommandRequest(BaseModel):
    command: str

class AutoBackupToggleRequest(BaseModel):
    status: str  # 'running' or 'stopped'

class SafetyMetrics(BaseModel):
    total_backups: int
    last_backup: Optional[str]
    auto_versions: int
    environments: List[str]
    active_branches: int
    system_health: int

# Global state for safety system
safety_state = {
    "auto_backup_status": "running",
    "last_backup": None,
    "total_backups": 0,
    "auto_versions": 0,
    "system_health": 98
}

# Helper functions
def run_command(command: str) -> Dict:
    """Execute a shell command and return result"""
    try:
        logger.info(f"Executing command: {command}")
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr,
            "return_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": "Command timed out after 5 minutes",
            "return_code": -1
        }
    except Exception as e:
        logger.error(f"Command execution failed: {str(e)}")
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "return_code": -1
        }

def get_git_status() -> Dict:
    """Get current Git status"""
    try:
        # Get current branch
        branch_result = run_command("git branch --show-current")
        current_branch = branch_result["output"].strip() if branch_result["success"] else "unknown"
        
        # Get status
        status_result = run_command("git status --porcelain")
        has_changes = bool(status_result["output"].strip()) if status_result["success"] else False
        
        # Get recent commits
        log_result = run_command("git log --oneline -5")
        recent_commits = log_result["output"].strip().split('\n') if log_result["success"] else []
        
        # Count branches
        branches_result = run_command("git branch -a")
        branch_count = len(branches_result["output"].strip().split('\n')) if branches_result["success"] else 0
        
        return {
            "current_branch": current_branch,
            "has_changes": has_changes,
            "recent_commits": recent_commits,
            "branch_count": branch_count
        }
    except Exception as e:
        logger.error(f"Failed to get git status: {str(e)}")
        return {
            "current_branch": "unknown",
            "has_changes": False,
            "recent_commits": [],
            "branch_count": 0
        }

def get_backup_info() -> Dict:
    """Get backup directory information"""
    try:
        backup_dir = Path("./backups")
        if not backup_dir.exists():
            return {"count": 0, "total_size": "0MB", "recent": []}
        
        backup_files = list(backup_dir.glob("*.tar.gz"))
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        total_size = sum(f.stat().st_size for f in backup_files)
        total_size_mb = round(total_size / (1024 * 1024), 1)
        
        recent_backups = []
        for backup in backup_files[:5]:
            stat = backup.stat()
            recent_backups.append({
                "name": backup.stem,
                "size": f"{round(stat.st_size / (1024 * 1024), 1)}MB",
                "created": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return {
            "count": len(backup_files),
            "total_size": f"{total_size_mb}MB",
            "recent": recent_backups
        }
    except Exception as e:
        logger.error(f"Failed to get backup info: {str(e)}")
        return {"count": 0, "total_size": "0MB", "recent": []}

def get_environment_status() -> List[Dict]:
    """Get status of all environment branches"""
    environments = ["development", "staging", "production"]
    env_status = []
    
    for env in environments:
        try:
            # Check if environment branch exists
            check_result = run_command(f"git show-ref --verify --quiet refs/heads/env/{env}")
            exists = check_result["success"]
            
            if exists:
                # Get last commit info
                log_result = run_command(f"git log -1 --format='%h %s %cr' env/{env}")
                last_commit = log_result["output"].strip() if log_result["success"] else "No commits"
                status = "active"
                health = "good"
            else:
                last_commit = "Branch not created"
                status = "missing"
                health = "needs_setup"
            
            env_status.append({
                "name": env,
                "status": status,
                "health": health,
                "last_commit": last_commit,
                "exists": exists
            })
        except Exception as e:
            logger.error(f"Failed to get status for environment {env}: {str(e)}")
            env_status.append({
                "name": env,
                "status": "error",
                "health": "unknown",
                "last_commit": f"Error: {str(e)}",
                "exists": False
            })
    
    return env_status

# API Endpoints

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/admin/dev-safety/status")
async def get_dev_safety_status():
    """Get comprehensive development safety status"""
    try:
        git_status = get_git_status()
        backup_info = get_backup_info()
        env_status = get_environment_status()
        
        # Update global state
        safety_state["total_backups"] = backup_info["count"]
        safety_state["active_branches"] = git_status["branch_count"]
        
        # Calculate system health based on various factors
        health_score = 100
        if git_status["has_changes"]:
            health_score -= 5  # Uncommitted changes
        if backup_info["count"] == 0:
            health_score -= 20  # No backups
        if any(env["status"] == "missing" for env in env_status):
            health_score -= 15  # Missing environments
        
        safety_state["system_health"] = max(health_score, 0)
        
        return SafetyMetrics(
            total_backups=backup_info["count"],
            last_backup=backup_info["recent"][0]["created"] if backup_info["recent"] else None,
            auto_versions=safety_state["auto_versions"],
            environments=["development", "staging", "production"],
            active_branches=git_status["branch_count"],
            system_health=safety_state["system_health"]
        )
    except Exception as e:
        logger.error(f"Failed to get dev safety status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/dev-safety/backup/create")
async def create_backup(request: BackupRequest, background_tasks: BackgroundTasks):
    """Create a new backup"""
    try:
        backup_name = request.name or f"api-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Run backup creation in background
        result = run_command(f"./enhanced-version-manager.sh backup {backup_name}")
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"Backup failed: {result['error']}")
        
        # Update metrics
        backup_info = get_backup_info()
        safety_state["total_backups"] = backup_info["count"]
        safety_state["last_backup"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "name": backup_name,
            "size": "Calculating...",
            "created": datetime.now().isoformat(),
            "output": result["output"]
        }
    except Exception as e:
        logger.error(f"Failed to create backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/dev-safety/deploy")
async def deploy_to_environment(request: DeployRequest):
    """Deploy to specified environment"""
    try:
        if request.environment not in ["development", "staging", "production"]:
            raise HTTPException(status_code=400, detail="Invalid environment")
        
        # Build command
        command = f"./enhanced-version-manager.sh deploy {request.environment}"
        if request.source_branch:
            command += f" {request.source_branch}"
        
        result = run_command(command)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"Deployment failed: {result['error']}")
        
        return {
            "success": True,
            "environment": request.environment,
            "timestamp": datetime.now().isoformat(),
            "output": result["output"]
        }
    except Exception as e:
        logger.error(f"Failed to deploy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/dev-safety/auto-backup/toggle")
async def toggle_auto_backup(request: AutoBackupToggleRequest):
    """Toggle auto-backup system"""
    try:
        if request.status == "running":
            result = run_command("./auto-backup.sh start")
        elif request.status == "stopped":
            result = run_command("./auto-backup.sh stop")
        else:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        if result["success"]:
            safety_state["auto_backup_status"] = request.status
        
        return {
            "success": result["success"],
            "status": request.status,
            "output": result["output"],
            "error": result["error"] if not result["success"] else None
        }
    except Exception as e:
        logger.error(f"Failed to toggle auto backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/dev-safety/command")
async def execute_command(request: CommandRequest):
    """Execute a safety-related command"""
    try:
        # Security: only allow specific commands
        allowed_commands = [
            "npm run safe:commit",
            "npm run backup:create",
            "npm run safety:status",
            "npm run github:push-all",
            "npm run emergency:rollback",
            "npm run emergency:backup",
            "npm run health:full",
            "./enhanced-version-manager.sh status",
            "./enhanced-version-manager.sh list",
            "./auto-backup.sh status"
        ]
        
        # Check if command is allowed (starts with any allowed command)
        if not any(request.command.startswith(cmd) for cmd in allowed_commands):
            raise HTTPException(status_code=403, detail="Command not allowed")
        
        result = run_command(request.command)
        
        return {
            "success": result["success"],
            "command": request.command,
            "output": result["output"],
            "error": result["error"] if not result["success"] else None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to execute command: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/dev-safety/backups")
async def list_backups():
    """List all available backups"""
    try:
        backup_info = get_backup_info()
        return {
            "backups": backup_info["recent"],
            "total_count": backup_info["count"],
            "total_size": backup_info["total_size"]
        }
    except Exception as e:
        logger.error(f"Failed to list backups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/dev-safety/environments")
async def get_environments():
    """Get status of all environments"""
    try:
        env_status = get_environment_status()
        return {"environments": env_status}
    except Exception as e:
        logger.error(f"Failed to get environments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/dev-safety/git-status")
async def get_git_info():
    """Get current Git repository status"""
    try:
        git_status = get_git_status()
        return git_status
    except Exception as e:
        logger.error(f"Failed to get git status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/dev-safety/emergency/rollback")
async def emergency_rollback():
    """Perform emergency rollback"""
    try:
        # First create emergency backup
        backup_result = run_command("./enhanced-version-manager.sh backup emergency-safety")
        if not backup_result["success"]:
            logger.warning(f"Emergency backup failed: {backup_result['error']}")
        
        # Get list of recent backups
        list_result = run_command("./enhanced-version-manager.sh list")
        if not list_result["success"]:
            raise HTTPException(status_code=500, detail="Cannot list backups for rollback")
        
        # For now, return available backups for user selection
        return {
            "success": True,
            "message": "Emergency backup created. Please select a backup to rollback to.",
            "available_backups": list_result["output"],
            "emergency_backup": "emergency-safety" if backup_result["success"] else None
        }
    except Exception as e:
        logger.error(f"Emergency rollback failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/dev-safety/logs")
async def get_safety_logs():
    """Get development safety logs"""
    try:
        logs = []
        
        # Read auto-version log if it exists
        auto_log_path = Path("./auto-version.log")
        if auto_log_path.exists():
            with open(auto_log_path, 'r') as f:
                auto_logs = f.readlines()[-20:]  # Last 20 lines
                logs.extend([{"type": "auto-version", "message": line.strip()} for line in auto_logs])
        
        # Read deployment log if it exists
        deploy_log_path = Path("./verssai_deployment.log")
        if deploy_log_path.exists():
            with open(deploy_log_path, 'r') as f:
                deploy_logs = f.readlines()[-10:]  # Last 10 lines
                logs.extend([{"type": "deployment", "message": line.strip()} for line in deploy_logs])
        
        return {"logs": logs}
    except Exception as e:
        logger.error(f"Failed to get logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task to update metrics periodically
@app.on_event("startup")
async def startup_event():
    """Initialize safety system on startup"""
    logger.info("🛡️ VERSSAI Development Safety Server starting up...")
    
    # Check if safety system is initialized
    config_path = Path("./.verssai-safety-config")
    if not config_path.exists():
        logger.info("Initializing safety system...")
        result = run_command("./enhanced-version-manager.sh init")
        if result["success"]:
            logger.info("✅ Safety system initialized")
        else:
            logger.error(f"❌ Failed to initialize safety system: {result['error']}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
