#!/usr/bin/env python3
"""
VERSSAI Health Check Script
Validates system configuration, dependencies, and connectivity
"""

import os
import sys
import requests
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_status(message: str, status: str, color: str = Colors.GREEN):
    """Print a status message with color coding"""
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{color}{status_symbol} {message}{Colors.ENDC}")

def print_header(message: str):
    """Print a header message"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}")

def check_python_dependencies() -> Tuple[bool, List[str]]:
    """Check Python dependencies"""
    print_header("Python Dependencies Check")
    
    required_packages = [
        'fastapi', 'uvicorn', 'sqlalchemy', 'pymongo', 'motor',
        'pydantic', 'dotenv', 'requests', 'pandas', 'numpy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print_status(f"{package}", "PASS")
        except ImportError:
            print_status(f"{package}", "FAIL", Colors.RED)
            missing_packages.append(package)
    
    return len(missing_packages) == 0, missing_packages

def check_environment_files() -> Tuple[bool, List[str]]:
    """Check environment configuration files"""
    print_header("Environment Configuration Check")
    
    env_files = [
        ('backend/.env', 'Backend Environment'),
        ('frontend/.env', 'Frontend Environment'),
        ('.env', 'Docker Environment')
    ]
    
    missing_files = []
    for file_path, description in env_files:
        if Path(file_path).exists():
            print_status(f"{description}: {file_path}", "PASS")
        else:
            print_status(f"{description}: {file_path}", "FAIL", Colors.RED)
            missing_files.append(file_path)
    
    return len(missing_files) == 0, missing_files

def check_api_keys() -> Tuple[bool, List[str]]:
    """Check if required API keys are configured"""
    print_header("API Key Configuration Check")
    
    # Load backend environment if it exists
    backend_env = Path('backend/.env')
    if backend_env.exists():
        from dotenv import load_dotenv
        load_dotenv(backend_env)
    
    required_keys = [
        ('GEMINI_API_KEY', 'Google Gemini Pro'),
        ('OPENAI_API_KEY', 'OpenAI (fallback)'),
        ('GOOGLE_API_KEY', 'Google Search'),
        ('TWITTER_BEARER_TOKEN', 'Twitter API')
    ]
    
    missing_keys = []
    for key, description in required_keys:
        if os.environ.get(key):
            print_status(f"{description}: {key}", "PASS")
        else:
            print_status(f"{description}: {key}", "FAIL", Colors.RED)
            missing_keys.append(key)
    
    return len(missing_keys) == 0, missing_keys

def check_docker_services() -> Tuple[bool, List[str]]:
    """Check Docker services status"""
    print_header("Docker Services Check")
    
    try:
        result = subprocess.run(['docker-compose', 'ps'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print_status("Docker Compose available", "PASS")
            
            # Check if services are running
            if 'Up' in result.stdout:
                print_status("Docker services running", "PASS")
                return True, []
            else:
                print_status("Docker services not running", "FAIL", Colors.YELLOW)
                return False, ["Docker services not running"]
        else:
            print_status("Docker Compose not available", "FAIL", Colors.RED)
            return False, ["Docker Compose not available"]
            
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print_status("Docker not available", "FAIL", Colors.RED)
        return False, ["Docker not available"]

def check_directories() -> Tuple[bool, List[str]]:
    """Check if required directories exist"""
    print_header("Directory Structure Check")
    
    required_dirs = [
        'backend/uploads',
        'backend/logs',
        'data/chroma_db',
        'data/postgres_data',
        'data/n8n_data'
    ]
    
    missing_dirs = []
    for dir_path in required_dirs:
        if Path(dir_path).exists():
            print_status(f"Directory: {dir_path}", "PASS")
        else:
            print_status(f"Directory: {dir_path}", "FAIL", Colors.RED)
            missing_dirs.append(dir_path)
    
    return len(missing_dirs) == 0, missing_dirs

def check_backend_connectivity() -> Tuple[bool, List[str]]:
    """Check backend API connectivity"""
    print_header("Backend Connectivity Check")
    
    try:
        # Try to connect to backend
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print_status("Backend API responding", "PASS")
            return True, []
        else:
            print_status(f"Backend API error: {response.status_code}", "FAIL", Colors.RED)
            return False, [f"Backend API error: {response.status_code}"]
    except requests.exceptions.RequestException:
        print_status("Backend API not accessible", "FAIL", Colors.YELLOW)
        return False, ["Backend API not accessible"]

def check_frontend_connectivity() -> Tuple[bool, List[str]]:
    """Check frontend connectivity"""
    print_header("Frontend Connectivity Check")
    
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print_status("Frontend accessible", "PASS")
            return True, []
        else:
            print_status(f"Frontend error: {response.status_code}", "FAIL", Colors.RED)
            return False, [f"Frontend error: {response.status_code}"]
    except requests.exceptions.RequestException:
        print_status("Frontend not accessible", "FAIL", Colors.YELLOW)
        return False, ["Frontend not accessible"]

def check_database_connectivity() -> Tuple[bool, List[str]]:
    """Check database connectivity"""
    print_header("Database Connectivity Check")
    
    try:
        # Check PostgreSQL
        result = subprocess.run(['docker', 'exec', 'verssai_postgres', 'pg_isready'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print_status("PostgreSQL accessible", "PASS")
        else:
            print_status("PostgreSQL not accessible", "FAIL", Colors.RED)
            return False, ["PostgreSQL not accessible"]
        
        # Check ChromaDB
        try:
            response = requests.get('http://localhost:8000', timeout=5)
            print_status("ChromaDB accessible", "PASS")
        except:
            print_status("ChromaDB not accessible", "FAIL", Colors.YELLOW)
            return False, ["ChromaDB not accessible"]
        
        return True, []
        
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print_status("Database connectivity check failed", "FAIL", Colors.RED)
        return False, ["Database connectivity check failed"]

def generate_report(results: Dict[str, Tuple[bool, List[str]]]) -> None:
    """Generate a summary report"""
    print_header("Health Check Summary Report")
    
    total_checks = len(results)
    passed_checks = sum(1 for success, _ in results.values() if success)
    failed_checks = total_checks - passed_checks
    
    print(f"\n{Colors.BOLD}Overall Status:{Colors.ENDC}")
    if failed_checks == 0:
        print_status("All checks passed", "PASS")
    else:
        print_status(f"{failed_checks} out of {total_checks} checks failed", "FAIL", Colors.RED)
    
    print(f"\n{Colors.BOLD}Detailed Results:{Colors.ENDC}")
    for check_name, (success, issues) in results.items():
        status = "PASS" if success else "FAIL"
        color = Colors.GREEN if success else Colors.RED
        print_status(f"{check_name}: {status}", status, color)
        if issues:
            for issue in issues:
                print(f"  {Colors.YELLOW}⚠️  {issue}{Colors.ENDC}")
    
    # Recommendations
    if failed_checks > 0:
        print(f"\n{Colors.BOLD}{Colors.YELLOW}Recommendations:{Colors.ENDC}")
        print("1. Run './setup.sh' to configure the environment")
        print("2. Check environment variables in .env files")
        print("3. Ensure Docker services are running")
        print("4. Verify API keys are properly configured")
        print("5. Check network connectivity and ports")

def main():
    """Main health check function"""
    print(f"{Colors.BOLD}{Colors.BLUE}🚀 VERSSAI Health Check{Colors.ENDC}")
    print(f"{Colors.BLUE}Comprehensive system validation{Colors.ENDC}")
    
    # Run all checks
    results = {
        "Python Dependencies": check_python_dependencies(),
        "Environment Files": check_environment_files(),
        "API Keys": check_api_keys(),
        "Docker Services": check_docker_services(),
        "Directory Structure": check_directories(),
        "Backend Connectivity": check_backend_connectivity(),
        "Frontend Connectivity": check_frontend_connectivity(),
        "Database Connectivity": check_database_connectivity()
    }
    
    # Generate report
    generate_report(results)
    
    # Exit with appropriate code
    failed_checks = sum(1 for success, _ in results.values() if not success)
    sys.exit(1 if failed_checks > 0 else 0)

if __name__ == "__main__":
    main()
