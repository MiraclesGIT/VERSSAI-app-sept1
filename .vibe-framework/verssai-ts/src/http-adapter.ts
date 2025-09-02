import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
app.use(express.json());

const PORT = 8765;

app.get('/', (req, res) => {
  res.json({
    service: 'VERSSAI MCP HTTP Adapter',
    status: 'active',
    tools: ['bmad_sync', 'component_status']
  });
});

app.post('/execute', async (req, res) => {
  const { tool } = req.body;
  
  try {
    // Execute MCP tool via command line
    const { stdout } = await execAsync(
      `echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"${tool}","arguments":{}},"id":1}' | node build/index.js`
    );
    
    res.json({ status: 'success', result: stdout });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({ status: 'error', error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`HTTP Adapter running on http://localhost:${PORT}`);
});
