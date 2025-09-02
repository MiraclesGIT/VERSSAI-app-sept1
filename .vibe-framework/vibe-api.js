const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Simple status endpoint
app.get('/vibe-status', (req, res) => {
    res.json({
        duplicates: ["enhanced_server.py", "simple_server.py", "real_server.py"],
        recentDecisions: [
            { timestamp: new Date().toISOString(), decision: "Started vibe session" },
            { timestamp: new Date().toISOString(), decision: "Checked for duplicates" }
        ],
        health: "needs-attention"
    });
});

const PORT = 8765;
app.listen(PORT, () => {
    console.log(`Vibe API running on http://localhost:${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/visualizations/vibe-dashboard.html`);
});
