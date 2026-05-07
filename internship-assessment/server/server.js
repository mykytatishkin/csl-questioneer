const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Data directory
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Store assessments in memory and persist to disk
const assessments = new Map();

// Load existing assessments from disk
function loadAssessments() {
    try {
        const files = fs.readdirSync(DATA_DIR);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(DATA_DIR, file);
                const data = fs.readFileSync(filePath, 'utf8');
                const assessment = JSON.parse(data);
                assessments.set(assessment.sessionId, assessment);
            }
        });
        console.log(`Loaded ${assessments.size} assessments from disk`);
    } catch (error) {
        console.error('Error loading assessments:', error);
    }
}

// Save assessment to disk
function saveAssessment(assessment) {
    const filePath = path.join(DATA_DIR, `${assessment.sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(assessment, null, 2));
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        totalAssessments: assessments.size 
    });
});

// Submit assessment
app.post('/api/submit', (req, res) => {
    try {
        const assessmentData = req.body;
        
        // Validate required fields
        if (!assessmentData.sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        
        // Add metadata
        assessmentData.submittedAt = new Date().toISOString();
        assessmentData.ipAddress = req.ip || req.connection.remoteAddress;
        assessmentData.userAgent = req.headers['user-agent'];
        
        // Calculate score metrics
        assessmentData.metrics = calculateMetrics(assessmentData);
        
        // Store assessment
        assessments.set(assessmentData.sessionId, assessmentData);
        
        // Persist to disk
        saveAssessment(assessmentData);
        
        console.log(`Assessment submitted: ${assessmentData.sessionId}`);
        
        res.json({ 
            success: true, 
            sessionId: assessmentData.sessionId,
            message: 'Assessment submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ error: 'Failed to submit assessment' });
    }
});

// Get all assessments (admin endpoint)
app.get('/api/assessments', (req, res) => {
    try {
        const allAssessments = Array.from(assessments.values());
        
        // Return summary without full event data
        const summaries = allAssessments.map(a => ({
            sessionId: a.sessionId,
            submittedAt: a.submittedAt,
            startTime: a.startTime,
            endTime: a.endTime,
            totalTimeSpent: a.totalTimeSpent,
            questionsCount: a.questions?.length || 0,
            eventsCount: a.events?.length || 0,
            metrics: a.metrics
        }));
        
        res.json({ 
            total: summaries.length,
            assessments: summaries 
        });
    } catch (error) {
        console.error('Error getting assessments:', error);
        res.status(500).json({ error: 'Failed to retrieve assessments' });
    }
});

// Get specific assessment details (admin endpoint)
app.get('/api/assessments/:sessionId', (req, res) => {
    try {
        const assessment = assessments.get(req.params.sessionId);
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json(assessment);
    } catch (error) {
        console.error('Error getting assessment:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment' });
    }
});

// Export assessments to CSV
app.get('/api/export/csv', (req, res) => {
    try {
        const allAssessments = Array.from(assessments.values());
        
        let csv = 'Session ID,Submitted At,Total Time (s),Focus Lost,Tab Switches,Events Count,Questions\n';
        
        allAssessments.forEach(a => {
            csv += `"${a.sessionId}",`;
            csv += `"${a.submittedAt}",`;
            csv += `"${a.totalTimeSpent}",`;
            csv += `"${a.metrics?.focusLostCount || 0}",`;
            csv += `"${a.metrics?.tabSwitches || 0}",`;
            csv += `"${a.events?.length || 0}",`;
            csv += `"${a.questions?.length || 0}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="assessments_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ error: 'Failed to export assessments' });
    }
});

// Delete assessment (admin endpoint)
app.delete('/api/assessments/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        if (!assessments.has(sessionId)) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        // Remove from memory
        assessments.delete(sessionId);
        
        // Remove from disk
        const filePath = path.join(DATA_DIR, `${sessionId}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});

// Calculate metrics from events
function calculateMetrics(assessment) {
    const events = assessment.events || [];
    
    const metrics = {
        focusLostCount: 0,
        tabSwitches: 0,
        copyAttempts: 0,
        pasteAttempts: 0,
        devtoolsAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalCommands: 0,
        suspiciousActivityScore: 0
    };
    
    events.forEach(event => {
        switch (event.eventType) {
            case 'focus_lost':
                metrics.focusLostCount++;
                break;
            case 'tab_switch':
                metrics.tabSwitches++;
                break;
            case 'copy_blocked':
                metrics.copyAttempts++;
                break;
            case 'paste_blocked':
                metrics.pasteAttempts++;
                break;
            case 'devtools_attempt_blocked':
                metrics.devtoolsAttempts++;
                break;
            case 'answer_correct':
                metrics.correctAnswers++;
                break;
            case 'answer_incorrect':
                metrics.incorrectAnswers++;
                break;
            case 'terminal_command':
            case 'windows_command':
                metrics.totalCommands++;
                break;
        }
    });
    
    // Calculate suspicious activity score (0-100)
    metrics.suspiciousActivityScore = Math.min(100, 
        (metrics.focusLostCount * 5) +
        (metrics.tabSwitches * 10) +
        (metrics.copyAttempts * 15) +
        (metrics.pasteAttempts * 15) +
        (metrics.devtoolsAttempts * 20)
    );
    
    return metrics;
}

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Note: Catch-all route removed for Express 5 compatibility
// Static files are served via express.static middleware

// Initialize
loadAssessments();

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Internship Assessment Platform Server                   ║
╠═══════════════════════════════════════════════════════════╣
║   Server running at: http://localhost:${PORT}               ║
║   Admin Dashboard: http://localhost:${PORT}/admin           ║
║   API Health: http://localhost:${PORT}/api/health           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
