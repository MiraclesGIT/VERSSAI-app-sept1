const express = require('express');
const cors = require('cors');
const { execSync, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

const app = express();
app.use(cors());
app.use(express.json());

// Project root
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BMAD_FILE = path.join(process.env.HOME, 'agents.md');

// Real-time data store
const projectData = {
    prd: {
        features: [],
        requirements: [],
        specifications: {},
        completionStatus: 0
    },
    dev: {
        files: {},
        commits: [],
        branches: [],
        currentPhase: '',
        components: { total: 84, migrated: 0 },
        duplicates: [],
        tests: { total: 0, passing: 0, failing: 0 }
    },
    qa: {
        testSuites: [],
        coverage: 0,
        bugs: [],
        performance: {}
    },
    integrations: {
        github: { connected: false, lastSync: null },
        n8n: { workflows: 0, active: false },
        mcp: { tools: 2, status: 'active' }
    }
};

// File watcher for real-time updates
const watcher = chokidar.watch(PROJECT_ROOT, {
    ignored: /(^|[\/\\])\..|(node_modules|venv|legacy)/,
    persistent: true
});

// Collect PRD data from documentation
async function collectPRDData() {
    try {
        // Read PRD from knowledge base
        const prdFiles = await execSync(
            `find ${PROJECT_ROOT} -name "*.md" -path "*/docs/*" -o -name "*PRD*" -o -name "*requirements*"`,
            { encoding: 'utf-8' }
        ).trim().split('\n').filter(Boolean);

        for (const file of prdFiles) {
            const content = await fs.readFile(file, 'utf-8');
            // Extract features and requirements
            const features = content.match(/## Feature.*\n([\s\S]*?)(?=##|$)/g) || [];
            projectData.prd.features = features.map(f => ({
                name: f.match(/## Feature[:\s]+(.*)/)[1],
                status: f.includes('✅') ? 'completed' : f.includes('🔄') ? 'in-progress' : 'pending'
            }));
        }

        // Calculate completion
        const completed = projectData.prd.features.filter(f => f.status === 'completed').length;
        projectData.prd.completionStatus = (completed / projectData.prd.features.length) * 100;

    } catch (error) {
        console.error('PRD collection error:', error);
    }
}

// Collect development data
async function collectDevData() {
    try {
        // Git information
        projectData.dev.branches = execSync('git branch -a', { cwd: PROJECT_ROOT, encoding: 'utf-8' })
            .split('\n').filter(Boolean).map(b => b.trim());
        
        projectData.dev.commits = execSync('git log --oneline -10', { cwd: PROJECT_ROOT, encoding: 'utf-8' })
            .split('\n').filter(Boolean);

        // File analysis
        const pythonFiles = execSync(`find ${PROJECT_ROOT}/backend -name "*.py" | grep -v legacy | grep -v venv`, { encoding: 'utf-8' })
            .split('\n').filter(Boolean);
        
        // Detect duplicates
        const fileNames = pythonFiles.map(f => path.basename(f));
        const patterns = ['server', 'backend', 'api', 'service'];
        
        projectData.dev.duplicates = [];
        patterns.forEach(pattern => {
            const matches = fileNames.filter(f => f.includes(pattern));
            if (matches.length > 1) {
                projectData.dev.duplicates.push({
                    pattern,
                    files: matches,
                    count: matches.length
                });
            }
        });

        // Component migration status
        const components = execSync(`find ${PROJECT_ROOT}/frontend/src/components -name "*.jsx" -o -name "*.tsx"`, { encoding: 'utf-8' })
            .split('\n').filter(Boolean);
        
        projectData.dev.components.migrated = components.filter(c => c.includes('VERSSAI')).length;

        // Test statistics
        try {
            const testResults = execSync('npm test -- --json', { cwd: `${PROJECT_ROOT}/frontend`, encoding: 'utf-8' });
            const results = JSON.parse(testResults);
            projectData.dev.tests = {
                total: results.numTotalTests || 0,
                passing: results.numPassedTests || 0,
                failing: results.numFailedTests || 0
            };
        } catch (e) {
            // Tests might not be set up yet
        }

    } catch (error) {
        console.error('Dev collection error:', error);
    }
}

// Collect QA data
async function collectQAData() {
    try {
        // Coverage data
        const coverageFile = `${PROJECT_ROOT}/frontend/coverage/coverage-summary.json`;
        if (await fs.access(coverageFile).then(() => true).catch(() => false)) {
            const coverage = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));
            projectData.qa.coverage = coverage.total.lines.pct || 0;
        }

        // Bug tracking (from TODO/FIXME comments)
        const bugs = execSync(`grep -r "TODO\\|FIXME\\|BUG" ${PROJECT_ROOT} --include="*.js" --include="*.py" --include="*.tsx" || true`, { encoding: 'utf-8' })
            .split('\n').filter(Boolean).slice(0, 20);
        
        projectData.qa.bugs = bugs.map(bug => {
            const [file, ...content] = bug.split(':');
            return {
                file: file.replace(PROJECT_ROOT, ''),
                content: content.join(':').trim(),
                type: content.join(':').includes('BUG') ? 'bug' : 'todo'
            };
        });

        // Performance metrics (if available)
        projectData.qa.performance = {
            buildTime: await getBuildTime(),
            bundleSize: await getBundleSize(),
            lighthouse: await getLighthouseScore()
        };

    } catch (error) {
        console.error('QA collection error:', error);
    }
}

// Helper functions
async function getBuildTime() {
    try {
        const start = Date.now();
        execSync('npm run build', { cwd: `${PROJECT_ROOT}/frontend` });
        return Date.now() - start;
    } catch {
        return null;
    }
}

async function getBundleSize() {
    try {
        const buildDir = `${PROJECT_ROOT}/frontend/build`;
        const stats = await fs.stat(buildDir);
        return stats.size;
    } catch {
        return null;
    }
}

async function getLighthouseScore() {
    // Placeholder - would integrate with Lighthouse CI
    return { performance: 85, accessibility: 92, seo: 88 };
}

// Integration status checks
async function checkIntegrations() {
    // GitHub
    try {
        execSync('git remote -v', { cwd: PROJECT_ROOT });
        projectData.integrations.github.connected = true;
        projectData.integrations.github.lastSync = new Date().toISOString();
    } catch {
        projectData.integrations.github.connected = false;
    }

    // N8N
    try {
        const n8nResponse = await fetch('http://localhost:5678/rest/workflows');
        if (n8nResponse.ok) {
            const workflows = await n8nResponse.json();
            projectData.integrations.n8n.workflows = workflows.data.length;
            projectData.integrations.n8n.active = true;
        }
    } catch {
        projectData.integrations.n8n.active = false;
    }

    // MCP
    try {
        execSync('mcp-cli status');
        projectData.integrations.mcp.status = 'active';
    } catch {
        projectData.integrations.mcp.status = 'inactive';
    }
}

// BMAD data reader
async function readBMADData() {
    try {
        const bmadContent = await fs.readFile(BMAD_FILE, 'utf-8');
        const lines = bmadContent.split('\n');
        
        // Extract current phase
        const phaseMatch = bmadContent.match(/Current Phase:\s*(.+)/);
        if (phaseMatch) {
            projectData.dev.currentPhase = phaseMatch[1];
        }

        // Extract recent decisions
        const decisions = bmadContent.match(/## Vibe Decision.*\n([\s\S]*?)(?=##|$)/g) || [];
        return decisions.slice(-5).map(d => ({
            timestamp: d.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0] || 'Unknown',
            decision: d.split('\n')[1]?.trim() || 'No description'
        }));
    } catch {
        return [];
    }
}

// Collect all data
async function collectAllData() {
    await Promise.all([
        collectPRDData(),
        collectDevData(),
        collectQAData(),
        checkIntegrations()
    ]);
    
    projectData.bmad = {
        recentDecisions: await readBMADData(),
        lastUpdate: new Date().toISOString()
    };
    
    return projectData;
}

// API Endpoints
app.get('/api/project-status', async (req, res) => {
    const data = await collectAllData();
    res.json(data);
});

app.get('/api/prd-status', async (req, res) => {
    await collectPRDData();
    res.json(projectData.prd);
});

app.get('/api/dev-status', async (req, res) => {
    await collectDevData();
    res.json(projectData.dev);
});

app.get('/api/qa-status', async (req, res) => {
    await collectQAData();
    res.json(projectData.qa);
});

app.post('/api/update-phase', (req, res) => {
    const { phase } = req.body;
    projectData.dev.currentPhase = phase;
    // Update BMAD
    exec(`echo "\\n## Phase Update - $(date)\\nCurrent Phase: ${phase}\\n" >> ${BMAD_FILE}`);
    res.json({ success: true });
});

// WebSocket for real-time updates
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8766 });

watcher.on('change', async (path) => {
    // Broadcast file changes
    const update = {
        type: 'file-change',
        path: path.replace(PROJECT_ROOT, ''),
        timestamp: new Date().toISOString()
    };
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
});

// Initial data collection
collectAllData();

// Periodic updates
setInterval(collectAllData, 30000); // Every 30 seconds

const PORT = 8765;
app.listen(PORT, () => {
    console.log(`🎯 Vibe Data Collector running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket updates on ws://localhost:8766`);
});
