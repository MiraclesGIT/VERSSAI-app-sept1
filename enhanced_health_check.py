#!/usr/bin/env python3
"""
VERSSAI Enhanced Health Check and Assessment Script
Comprehensive system validation and health assessment for the VERSSAI VC Intelligence Platform
"""

import os
import sys
import json
import subprocess
import platform
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class HealthCheckResult:
    def __init__(self, name: str, success: bool, message: str = "", details: List[str] = None, recommendations: List[str] = None):
        self.name = name
        self.success = success
        self.message = message
        self.details = details or []
        self.recommendations = recommendations or []
        self.timestamp = datetime.now()

class VerssaiHealthChecker:
    def __init__(self):
        self.results = {}
        self.system_info = {}
        self.project_root = Path.cwd()
        
    def print_status(self, message: str, status: str, color: str = Colors.GREEN, details: str = ""):
        """Print a status message with color coding"""
        status_symbols = {
            "PASS": "✅", "FAIL": "❌", "WARN": "⚠️", 
            "INFO": "ℹ️", "SKIP": "⏭️"
        }
        symbol = status_symbols.get(status, "•")
        print(f"{color}{symbol} {message}{Colors.ENDC}")
        if details:
            print(f"   {Colors.CYAN}{details}{Colors.ENDC}")

    def print_header(self, message: str, level: int = 1):
        """Print a header message"""
        if level == 1:
            print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
        else:
            print(f"\n{Colors.BOLD}{Colors.CYAN}{'-'*40}{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.CYAN}{message}{Colors.ENDC}")
            print(f"{Colors.BOLD}{Colors.CYAN}{'-'*40}{Colors.ENDC}")

    def run_command(self, command: List[str], timeout: int = 10) -> Tuple[bool, str, str]:
        """Run a command and return success, stdout, stderr"""
        try:
            result = subprocess.run(
                command, capture_output=True, text=True, timeout=timeout
            )
            return result.returncode == 0, result.stdout, result.stderr
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            return False, "", str(e)

    def check_system_info(self) -> HealthCheckResult:
        """Collect system information"""
        self.print_header("System Information")
        
        try:
            info = {
                "os": platform.system(),
                "platform": platform.platform(),
                "python_version": platform.python_version(),
                "architecture": platform.machine(),
                "hostname": platform.node(),
                "working_directory": str(self.project_root)
            }
            
            self.system_info = info
            
            for key, value in info.items():
                self.print_status(f"{key.replace('_', ' ').title()}: {value}", "INFO", Colors.CYAN)
            
            return HealthCheckResult("System Information", True, "System info collected")
            
        except Exception as e:
            return HealthCheckResult("System Information", False, f"Failed to collect system info: {e}")

    def check_project_structure(self) -> HealthCheckResult:
        """Check project structure and critical files"""
        self.print_header("Project Structure Check")
        
        critical_files = [
            "README.md", "docker-compose.yml", "health_check.py", 
            "backend/requirements.txt", "package.json"
        ]
        
        critical_dirs = [
            "backend", "frontend", "scripts"
        ]
        
        optional_dirs = [
            "backend/uploads", "backend/logs", "chroma_db", 
            "n8n-data", "database", "data"
        ]
        
        missing_files = []
        missing_dirs = []
        missing_optional = []
        
        # Check critical files
        for file_path in critical_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                self.print_status(f"Critical file: {file_path}", "PASS")
            else:
                self.print_status(f"Critical file: {file_path}", "FAIL", Colors.RED)
                missing_files.append(file_path)
        
        # Check critical directories
        for dir_path in critical_dirs:
            full_path = self.project_root / dir_path
            if full_path.exists():
                self.print_status(f"Critical directory: {dir_path}", "PASS")
            else:
                self.print_status(f"Critical directory: {dir_path}", "FAIL", Colors.RED)
                missing_dirs.append(dir_path)
        
        # Check optional directories
        for dir_path in optional_dirs:
            full_path = self.project_root / dir_path
            if full_path.exists():
                self.print_status(f"Optional directory: {dir_path}", "PASS")
            else:
                self.print_status(f"Optional directory: {dir_path}", "WARN", Colors.YELLOW)
                missing_optional.append(dir_path)
        
        success = len(missing_files) == 0 and len(missing_dirs) == 0
        recommendations = []
        
        if missing_files or missing_dirs:
            recommendations.extend([
                "Run './setup.sh' to create missing structure",
                "Verify you're in the correct project directory"
            ])
        
        if missing_optional:
            recommendations.append("Run 'mkdir -p " + " ".join(missing_optional) + "' to create optional directories")
        
        return HealthCheckResult(
            "Project Structure", 
            success,
            f"Structure check: {len(critical_files + critical_dirs)} critical items checked",
            missing_files + missing_dirs + [f"Optional: {d}" for d in missing_optional],
            recommendations
        )

    def check_environment_configuration(self) -> HealthCheckResult:
        """Check environment files and configuration"""
        self.print_header("Environment Configuration")
        
        env_files = [
            (".env", "Docker Environment", "docker.env"),
            ("backend/.env", "Backend Environment", "backend/env.template"),
            ("frontend/.env", "Frontend Environment", "frontend/env.template")
        ]
        
        missing_envs = []
        template_available = []
        
        for env_file, description, template in env_files:
            env_path = self.project_root / env_file
            template_path = self.project_root / template
            
            if env_path.exists():
                self.print_status(f"{description}: {env_file}", "PASS")
                # Check if it's not empty
                if env_path.stat().st_size > 0:
                    self.print_status(f"  File has content", "INFO", Colors.CYAN)
                else:
                    self.print_status(f"  File is empty", "WARN", Colors.YELLOW)
            else:
                self.print_status(f"{description}: {env_file}", "FAIL", Colors.RED)
                missing_envs.append(env_file)
                
                if template_path.exists():
                    self.print_status(f"  Template available: {template}", "INFO", Colors.CYAN)
                    template_available.append(f"cp {template} {env_file}")
        
        recommendations = []
        if missing_envs and template_available:
            recommendations.extend([
                "Create missing environment files from templates:",
                *template_available,
                "Edit the created files with your actual configuration"
            ])
        
        return HealthCheckResult(
            "Environment Configuration",
            len(missing_envs) == 0,
            f"Environment files: {len(env_files) - len(missing_envs)}/{len(env_files)} found",
            missing_envs,
            recommendations
        )

    def check_dependencies(self) -> HealthCheckResult:
        """Check system dependencies and tools"""
        self.print_header("System Dependencies")
        
        system_deps = [
            ("python3", "Python 3"),
            ("node", "Node.js"),
            ("docker", "Docker"),
            ("docker-compose", "Docker Compose"),
            ("git", "Git"),
        ]
        
        python_deps = [
            "requests", "json", "subprocess", "pathlib", "datetime"
        ]
        
        missing_system = []
        missing_python = []
        
        # Check system dependencies
        for cmd, name in system_deps:
            success, stdout, stderr = self.run_command(["which", cmd])
            if success:
                # Get version if possible
                version_success, version_out, _ = self.run_command([cmd, "--version"])
                version_info = version_out.split('\n')[0] if version_success else "unknown"
                self.print_status(f"{name}: {cmd}", "PASS", details=f"Version: {version_info}")
            else:
                self.print_status(f"{name}: {cmd}", "FAIL", Colors.RED)
                missing_system.append(name)
        
        # Check Python standard library
        for dep in python_deps:
            try:
                __import__(dep.replace('-', '_'))
                self.print_status(f"Python module: {dep}", "PASS")
            except ImportError:
                self.print_status(f"Python module: {dep}", "FAIL", Colors.RED)
                missing_python.append(dep)
        
        recommendations = []
        if missing_system:
            recommendations.extend([
                "Install missing system dependencies:",
                "- Docker: https://docs.docker.com/get-docker/",
                "- Node.js: https://nodejs.org/",
                "- Git: https://git-scm.com/"
            ])
        
        return HealthCheckResult(
            "Dependencies",
            len(missing_system) == 0,
            f"System tools: {len(system_deps) - len(missing_system)}/{len(system_deps)} available",
            missing_system + missing_python,
            recommendations
        )

    def check_docker_services(self) -> HealthCheckResult:
        """Check Docker services status"""
        self.print_header("Docker Services")
        
        # Check if Docker is running
        docker_running, _, _ = self.run_command(["docker", "version"])
        if not docker_running:
            self.print_status("Docker daemon", "FAIL", Colors.RED)
            return HealthCheckResult(
                "Docker Services",
                False,
                "Docker daemon not running",
                recommendations=["Start Docker daemon", "Check Docker installation"]
            )
        
        self.print_status("Docker daemon", "PASS")
        
        # Check Docker Compose file
        compose_file = self.project_root / "docker-compose.yml"
        if not compose_file.exists():
            self.print_status("docker-compose.yml", "FAIL", Colors.RED)
            return HealthCheckResult(
                "Docker Services",
                False,
                "docker-compose.yml not found"
            )
        
        self.print_status("docker-compose.yml", "PASS")
        
        # Check running services - try both docker-compose and docker compose
        success, output, _ = self.run_command(["docker", "compose", "ps"])
        if not success:
            success, output, _ = self.run_command(["docker-compose", "ps"])
            
        services_running = 0
        expected_services = ["postgres", "chromadb", "redis", "neo4j", "n8n"]
        
        if success and output:
            lines = output.split('\n')
            running_services = []
            for line in lines:
                if "verssai_" in line and ("Up" in line or "running" in line or "healthy" in line):
                    # Extract service name - handle different output formats
                    parts = line.split()
                    if len(parts) > 0:
                        service_name = parts[0].replace("verssai_", "")
                        running_services.append(service_name)
                        services_running += 1
            
            for service in expected_services:
                if service in running_services:
                    self.print_status(f"Service: {service}", "PASS")
                else:
                    self.print_status(f"Service: {service}", "WARN", Colors.YELLOW)
        
        recommendations = []
        if services_running == 0:
            recommendations.extend([
                "Start Docker services: docker-compose up -d",
                "Check service logs: docker-compose logs [service]"
            ])
        
        return HealthCheckResult(
            "Docker Services",
            services_running > 0,
            f"Running services: {services_running}/{len(expected_services)}",
            recommendations=recommendations
        )

    def check_network_connectivity(self) -> HealthCheckResult:
        """Check network connectivity to key services"""
        self.print_header("Network Connectivity")
        
        endpoints = [
            ("http://localhost:8080", "Backend API", "VERSSAI Backend"),
            ("http://localhost:3000", "Frontend", "React Frontend"),
            ("http://localhost:5678", "N8N", "Workflow Engine"),
            ("http://localhost:8000", "ChromaDB", "Vector Database"),
            ("http://localhost:7474", "Neo4j", "Graph Database"),
        ]
        
        connectivity_results = []
        
        for url, name, description in endpoints:
            try:
                # Using requests if available, otherwise using curl
                try:
                    import requests
                    response = requests.get(url, timeout=5)
                    if response.status_code < 500:
                        self.print_status(f"{name}: {url}", "PASS", details=f"Status: {response.status_code}")
                        connectivity_results.append(True)
                    else:
                        self.print_status(f"{name}: {url}", "WARN", Colors.YELLOW, f"Status: {response.status_code}")
                        connectivity_results.append(False)
                except ImportError:
                    success, _, _ = self.run_command(["curl", "-f", "-s", url])
                    if success:
                        self.print_status(f"{name}: {url}", "PASS")
                        connectivity_results.append(True)
                    else:
                        self.print_status(f"{name}: {url}", "WARN", Colors.YELLOW, "Not accessible")
                        connectivity_results.append(False)
                        
            except Exception as e:
                self.print_status(f"{name}: {url}", "WARN", Colors.YELLOW, f"Error: {str(e)[:50]}")
                connectivity_results.append(False)
        
        accessible_count = sum(connectivity_results)
        
        return HealthCheckResult(
            "Network Connectivity",
            accessible_count >= 1,  # At least one service should be accessible
            f"Services accessible: {accessible_count}/{len(endpoints)}",
            recommendations=[
                "Services may not be started yet",
                "Run docker-compose up -d to start services",
                "Check firewall and port conflicts"
            ] if accessible_count == 0 else []
        )

    def check_file_permissions(self) -> HealthCheckResult:
        """Check file permissions for critical scripts"""
        self.print_header("File Permissions")
        
        executable_files = [
            "setup.sh", "health_check.py", "start.sh", 
            "start_all_services.sh", "launch_verssai_mcp_complete.sh"
        ]
        
        permission_issues = []
        
        for file_name in executable_files:
            file_path = self.project_root / file_name
            if file_path.exists():
                is_executable = os.access(file_path, os.X_OK)
                if is_executable:
                    self.print_status(f"Executable: {file_name}", "PASS")
                else:
                    self.print_status(f"Executable: {file_name}", "WARN", Colors.YELLOW)
                    permission_issues.append(file_name)
            else:
                self.print_status(f"Script: {file_name}", "SKIP", Colors.CYAN, "File not found")
        
        return HealthCheckResult(
            "File Permissions",
            len(permission_issues) == 0,
            f"Executable scripts: {len(executable_files) - len(permission_issues)}/{len(executable_files)}",
            permission_issues,
            [f"Make scripts executable: chmod +x {' '.join(permission_issues)}"] if permission_issues else []
        )

    def check_disk_space(self) -> HealthCheckResult:
        """Check available disk space"""
        self.print_header("Disk Space")
        
        try:
            import shutil
            total, used, free = shutil.disk_usage(self.project_root)
            
            total_gb = total / (1024**3)
            used_gb = used / (1024**3)
            free_gb = free / (1024**3)
            usage_percent = (used / total) * 100
            
            self.print_status(f"Total space: {total_gb:.1f} GB", "INFO", Colors.CYAN)
            self.print_status(f"Used space: {used_gb:.1f} GB ({usage_percent:.1f}%)", "INFO", Colors.CYAN)
            self.print_status(f"Free space: {free_gb:.1f} GB", "INFO", Colors.CYAN)
            
            # Warn if less than 2GB free or more than 90% used
            if free_gb < 2.0 or usage_percent > 90:
                return HealthCheckResult(
                    "Disk Space",
                    False,
                    f"Low disk space: {free_gb:.1f} GB free",
                    recommendations=["Free up disk space", "Consider cleaning Docker volumes"]
                )
            
            return HealthCheckResult(
                "Disk Space",
                True,
                f"Sufficient space: {free_gb:.1f} GB available"
            )
            
        except Exception as e:
            return HealthCheckResult(
                "Disk Space",
                False,
                f"Could not check disk space: {e}"
            )

    def generate_setup_script(self) -> str:
        """Generate a customized setup script based on findings"""
        script_lines = [
            "#!/bin/bash",
            "# Generated VERSSAI Setup Script",
            "# Based on health check results",
            "",
            "set -e",
            "",
            "echo '🚀 Setting up VERSSAI based on health check results...'",
            ""
        ]
        
        # Add missing directory creation
        project_check = self.results.get('Project Structure')
        if project_check and not project_check.success:
            script_lines.extend([
                "# Create missing directories",
                "mkdir -p backend/uploads backend/logs chroma_db n8n-data database data/chroma_db data/postgres_data data/n8n_data",
                "echo '✅ Created missing directories'",
                ""
            ])
        
        # Add environment file creation
        env_check = self.results.get('Environment Configuration')
        if env_check and not env_check.success:
            script_lines.extend([
                "# Create environment files from templates",
                "[ ! -f .env ] && cp docker.env .env && echo '✅ Created .env'",
                "[ ! -f backend/.env ] && cp backend/env.template backend/.env && echo '✅ Created backend/.env'",
                "[ ! -f frontend/.env ] && cp frontend/env.template frontend/.env && echo '✅ Created frontend/.env'",
                ""
            ])
        
        # Add permission fixes
        perm_check = self.results.get('File Permissions')
        if perm_check and perm_check.details:
            script_lines.extend([
                "# Fix script permissions",
                f"chmod +x {' '.join(perm_check.details)}",
                "echo '✅ Fixed script permissions'",
                ""
            ])
        
        # Add Docker service startup
        docker_check = self.results.get('Docker Services')
        if docker_check and not docker_check.success:
            script_lines.extend([
                "# Start Docker services",
                "docker-compose up -d",
                "echo '✅ Started Docker services'",
                "echo 'Waiting for services to be ready...'",
                "sleep 30",
                ""
            ])
        
        script_lines.extend([
            "echo '🎉 VERSSAI setup completed!'",
            "echo 'Run the health check again to verify: python3 enhanced_health_check.py'",
            ""
        ])
        
        return "\n".join(script_lines)

    def generate_comprehensive_report(self) -> Dict:
        """Generate a comprehensive assessment report"""
        total_checks = len(self.results)
        passed_checks = sum(1 for result in self.results.values() if result.success)
        
        overall_health = "EXCELLENT" if passed_checks == total_checks else \
                        "GOOD" if passed_checks >= total_checks * 0.8 else \
                        "FAIR" if passed_checks >= total_checks * 0.6 else \
                        "POOR"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "system_info": self.system_info,
            "overall_health": overall_health,
            "health_score": round((passed_checks / total_checks) * 100, 1),
            "total_checks": total_checks,
            "passed_checks": passed_checks,
            "failed_checks": total_checks - passed_checks,
            "results": {}
        }
        
        # Add detailed results
        for name, result in self.results.items():
            report["results"][name] = {
                "success": result.success,
                "message": result.message,
                "details": result.details,
                "recommendations": result.recommendations,
                "timestamp": result.timestamp.isoformat()
            }
        
        return report

    def print_summary_report(self):
        """Print a comprehensive summary report"""
        self.print_header("VERSSAI Health Assessment Summary", 1)
        
        total_checks = len(self.results)
        passed_checks = sum(1 for result in self.results.values() if result.success)
        failed_checks = total_checks - passed_checks
        
        health_score = (passed_checks / total_checks) * 100 if total_checks > 0 else 0
        
        # Overall status
        print(f"\n{Colors.BOLD}Overall System Health: ", end="")
        if health_score >= 90:
            print(f"{Colors.GREEN}EXCELLENT ({health_score:.1f}%){Colors.ENDC}")
        elif health_score >= 80:
            print(f"{Colors.CYAN}GOOD ({health_score:.1f}%){Colors.ENDC}")
        elif health_score >= 60:
            print(f"{Colors.YELLOW}FAIR ({health_score:.1f}%){Colors.ENDC}")
        else:
            print(f"{Colors.RED}NEEDS ATTENTION ({health_score:.1f}%){Colors.ENDC}")
        
        print(f"\n{Colors.BOLD}Summary:{Colors.ENDC}")
        print(f"✅ Passed: {Colors.GREEN}{passed_checks}{Colors.ENDC}")
        print(f"❌ Failed: {Colors.RED}{failed_checks}{Colors.ENDC}")
        print(f"📊 Total: {total_checks}")
        
        # Detailed results
        self.print_header("Detailed Results", 2)
        for name, result in self.results.items():
            status_color = Colors.GREEN if result.success else Colors.RED
            status_text = "PASS" if result.success else "FAIL"
            self.print_status(f"{name}: {result.message}", status_text, status_color)
            
            if result.details:
                for detail in result.details[:3]:  # Show first 3 details
                    print(f"    {Colors.YELLOW}• {detail}{Colors.ENDC}")
        
        # Consolidated recommendations
        all_recommendations = []
        for result in self.results.values():
            if not result.success and result.recommendations:
                all_recommendations.extend(result.recommendations)
        
        if all_recommendations:
            self.print_header("Recommendations", 2)
            unique_recommendations = list(dict.fromkeys(all_recommendations))
            for i, rec in enumerate(unique_recommendations[:10], 1):
                print(f"{Colors.CYAN}{i}. {rec}{Colors.ENDC}")
        
        # Quick start guide
        if failed_checks > 0:
            self.print_header("Quick Fix", 2)
            print(f"{Colors.YELLOW}Run the generated setup script:{Colors.ENDC}")
            print(f"{Colors.CYAN}chmod +x auto_setup.sh && ./auto_setup.sh{Colors.ENDC}")

    def run_all_checks(self):
        """Run all health checks"""
        print(f"{Colors.BOLD}{Colors.BLUE}🔍 VERSSAI Enhanced Health Check{Colors.ENDC}")
        print(f"{Colors.BLUE}Comprehensive system assessment for VC Intelligence Platform{Colors.ENDC}")
        
        # Define all checks
        checks = [
            ("System Information", self.check_system_info),
            ("Project Structure", self.check_project_structure),
            ("Environment Configuration", self.check_environment_configuration),
            ("Dependencies", self.check_dependencies),
            ("Docker Services", self.check_docker_services),
            ("Network Connectivity", self.check_network_connectivity),
            ("File Permissions", self.check_file_permissions),
            ("Disk Space", self.check_disk_space),
        ]
        
        # Run each check
        for name, check_func in checks:
            try:
                result = check_func()
                self.results[name] = result
            except Exception as e:
                self.results[name] = HealthCheckResult(
                    name, False, f"Check failed with error: {str(e)}"
                )
        
        # Generate and save report
        report = self.generate_comprehensive_report()
        
        # Save detailed JSON report
        report_file = self.project_root / "verssai_health_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Generate setup script
        setup_script = self.generate_setup_script()
        setup_file = self.project_root / "auto_setup.sh"
        with open(setup_file, 'w') as f:
            f.write(setup_script)
        
        # Make setup script executable
        setup_file.chmod(0o755)
        
        # Print summary
        self.print_summary_report()
        
        print(f"\n{Colors.BOLD}Files Generated:{Colors.ENDC}")
        print(f"📄 Detailed report: {Colors.CYAN}verssai_health_report.json{Colors.ENDC}")
        print(f"🔧 Auto setup script: {Colors.CYAN}auto_setup.sh{Colors.ENDC}")
        
        return len(self.results) - sum(1 for r in self.results.values() if r.success) == 0

def main():
    """Main function"""
    checker = VerssaiHealthChecker()
    success = checker.run_all_checks()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()