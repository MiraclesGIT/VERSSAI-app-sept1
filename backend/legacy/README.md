# Legacy Backend Files

This directory contains the original backend implementations that have been consolidated into the unified backend (`verssai_unified_backend.py`).

## Files in this directory:

### Backend Implementations
- **`enhanced_mcp_backend.py`** - Original MCP-focused backend with WebSocket support
- **`complete_verssai_backend.py`** - Complete backend with Excel dataset integration
- **`verssai_mcp_complete_backend.py`** - Production-ready MCP + N8N integration backend
- **`simple_verssai_backend.py`** - Simplified backend implementation
- **`enhanced_verssai_backend.py`** - Enhanced backend with academic intelligence
- **`verssai_enhanced_backend.py`** - Alternative enhanced backend implementation
- **`verssai_enhanced_backend_with_dataset.py`** - Enhanced backend with full dataset integration
- **`verssai_enhanced_analytics_backend.py`** - Analytics-focused backend implementation

### Server Implementations
- **`enhanced_server.py`** - Enhanced server with additional features
- **`enhanced_verssai_server.py`** - Enhanced VERSSAI server implementation
- **`verssai_real_server.py`** - Production server implementation
- **`enhanced_api_server.py`** - Enhanced API server with extended endpoints

### Root-Level Files
- **`verssai_mcp_backend.py`** - Root-level MCP backend (moved from project root)
- **`minimal_backend.py`** - Minimal backend implementation (moved from project root)

## Purpose

These files are kept for:
1. **Reference** - Understanding the evolution of the backend architecture
2. **Backup** - In case specific functionality needs to be recovered
3. **Migration** - Helping identify any missing functionality in the unified backend
4. **Documentation** - Showing the consolidation process

## Migration Status

All functionality from these legacy files has been integrated into:
- **`../verssai_unified_backend.py`** - The new consolidated backend
- **`../config.py`** - Enhanced configuration system
- **`../../start_unified_backend.py`** - Unified startup script

## Key Features Migrated

✅ **MCP Protocol Support** - Real-time workflow orchestration  
✅ **WebSocket Communication** - Real-time client communication  
✅ **RAG/Graph Engine Integration** - Multi-layer intelligence  
✅ **N8N Workflow Integration** - Automated workflow execution  
✅ **Academic Dataset Integration** - Research intelligence  
✅ **File Upload & Processing** - Document analysis  
✅ **Role-Based Access Control** - Security and permissions  
✅ **Analytics & Reporting** - Performance metrics  
✅ **Database Integration** - PostgreSQL, MongoDB, ChromaDB  
✅ **API Endpoints** - RESTful API interface  

## Usage Notes

⚠️ **Do not use these files directly** - They are for reference only  
⚠️ **Use the unified backend instead** - `verssai_unified_backend.py`  
⚠️ **Dependencies may be outdated** - The unified backend has current dependencies  

## Removal Timeline

These files will be removed in future versions once the unified backend has been thoroughly tested and validated in production.

Last Updated: $(date)
Consolidated by: VERSSAI Backend Consolidation Process