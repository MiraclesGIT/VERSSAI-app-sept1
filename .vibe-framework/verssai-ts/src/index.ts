#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const BMAD_FILE = join(homedir(), 'agents.md');
const VERSSAI_ROOT = join(homedir(), 'Projects', 'VERSSAI-FINAL');

const server = new Server(
  {
    name: 'verssai-ts',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'bmad_sync',
        description: 'Create or sync BMAD file for VERSSAI development',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'component_status',
        description: 'Check VERSSAI component migration status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === 'bmad_sync') {
    const content = `# VERSSAI Development Context - BMAD/SSOT

## Current Session
- **Date**: ${new Date().toISOString()}
- **MCP**: Connected via Claude Desktop
- **Project**: ${VERSSAI_ROOT}

## Status
- MCP Server: ✅ Active (TypeScript)
- Claude Desktop: ✅ Connected
- Components: 0/84 migrated
- N8N Integration: Ready to connect

*Last updated: ${new Date().toISOString()} by VERSSAI MCP*
`;
    
    await fs.writeFile(BMAD_FILE, content, 'utf-8');
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ BMAD file created/updated at ${BMAD_FILE}`,
        },
      ],
    };
  }

  if (name === 'component_status') {
    // Check for components
    const frontendDir = join(VERSSAI_ROOT, 'frontend', 'src', 'components');
    let componentCount = 0;
    
    try {
      const files = await fs.readdir(frontendDir, { recursive: true });
      componentCount = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx')).length;
    } catch (e) {
      // Directory doesn't exist yet
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Component Migration Status:
- Found: ${componentCount} components
- Target: 84 components  
- Progress: ${((componentCount/84)*100).toFixed(1)}%
- Remaining: ${84 - componentCount}`,
        },
      ],
    };
  }

  throw new McpError(
    ErrorCode.MethodNotFound,
    `Unknown tool: ${name}`
  );
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
