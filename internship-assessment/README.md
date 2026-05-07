# 🎯 AI-Resistant Internship Assessment Platform

A dynamic, interactive technical assessment platform designed to evaluate internship candidates through realistic environment simulations while preventing AI-assisted cheating.

## 🔒 Anti-Cheating Features

### Proctoring & Monitoring
- **Camera Recording** - Continuous webcam capture during assessment
- **Focus Tracking** - Detects when user leaves the browser tab
- **Tab Switch Detection** - Logs all tab/window switches
- **Keyboard Input Monitoring** - Records all keystrokes
- **Mouse Movement Tracking** - Captures click patterns and movements
- **Copy/Paste Prevention** - Blocks clipboard operations
- **DevTools Prevention** - Blocks F12 and inspector shortcuts
- **Context Menu Blocking** - Prevents right-click actions

### Suspicious Activity Scoring
The system calculates a risk score (0-100) based on:
- Focus lost incidents (5 points each)
- Tab switches (10 points each)
- Copy attempts (15 points each)
- Paste attempts (15 points each)
- DevTools access attempts (20 points each)

## 🖥️ Environment Simulations

### 1. Terminal Environment (Linux/Unix)
Questions include:
- Maven build commands (`mvn compile`, `mvn test`)
- Directory navigation (`cd`, `ls`, `pwd`)
- File operations (`find`, `grep`, `cat`)
- Process management

### 2. IntelliJ IDEA Environment
Questions include:
- Changing project SDK
- Starting debug sessions
- Setting breakpoints
- Running specific tests
- Code navigation shortcuts

### 3. Windows Environment
Questions include:
- Launching Java applications
- Checking running processes (`tasklist`)
- Stopping processes (`taskkill`)
- Setting environment variables

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` to:
- View all submitted assessments
- See detailed metrics for each candidate
- Review suspicious activity scores
- Export results to CSV
- Delete assessments

### Dashboard Metrics
- Total assessments count
- Average time spent
- Number of suspicious activities
- Average candidate score
- Detailed event logs per session

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- Modern web browser with camera/microphone access

### Install Dependencies
```bash
cd internship-assessment
npm install
```

### Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### Access Points
- **Candidate Assessment**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

## 📁 Project Structure

```
internship-assessment/
├── public/
│   ├── index.html      # Main assessment page
│   ├── admin.html      # Admin dashboard
│   ├── styles.css      # All styles
│   └── app.js          # Frontend logic
├── server/
│   └── server.js       # Express backend
├── data/               # Stored assessments (auto-created)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### POST /api/submit
Submit completed assessment
```json
{
  "sessionId": "sess_abc123",
  "startTime": 1234567890,
  "endTime": 1234567890,
  "totalTimeSpent": 1800000,
  "questions": [...],
  "events": [...]
}
```

### GET /api/assessments
Get all assessment summaries

### GET /api/assessments/:sessionId
Get detailed assessment data

### DELETE /api/assessments/:sessionId
Delete an assessment

### GET /api/export/csv
Export all assessments to CSV

## ⚙️ Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### Assessment Settings (in app.js)
- `totalTime` - Total assessment duration (default: 30 minutes)
- `questions` - Array of question objects

## 📝 Adding Custom Questions

Edit the `loadQuestions()` method in `public/app.js`:

```javascript
{
    id: 13,
    type: 'terminal',
    title: 'Your Question Title',
    description: 'Question description...',
    hint: 'Helpful hint...',
    correctAnswer: 'expected answer',
    alternatives: ['alternative1', 'alternative2'],
    timeLimit: 60,
    environment: 'terminal', // or 'intellij' or 'windows'
    initialPath: '/home/user'
}
```

## 🔐 Security Considerations

### Browser-Based Limitations
Note that this is a browser-based solution with inherent limitations:
- Cannot truly prevent all cheating methods
- Camera recording captures frames, not continuous video
- Cannot monitor other applications
- Relies on user consent for permissions

### Recommendations
1. Use as initial screening tool, not final evaluation
2. Combine with live interviews for top candidates
3. Review suspicious activity scores before proceeding
4. Consider additional verification for high-stakes assessments

## 📊 Data Storage

- Assessments are stored in `/data` directory as JSON files
- Each session creates a unique file: `{sessionId}.json`
- Data persists across server restarts
- CSV export available for analysis

## 🎨 Customization

### Styling
All CSS is in `public/styles.css`. Modify colors, layouts, and themes there.

### Branding
Update the HTML files to add your company logo and branding.

### Question Types
Extend the `renderTerminalEnvironment`, `renderIntelliJEnvironment`, and `renderWindowsEnvironment` methods to add new interaction types.

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS or localhost
- Check browser permissions
- Verify camera is not used by another app

### Events Not Recording
- Check browser console for errors
- Ensure JavaScript is enabled
- Verify assessment has started (startTime is set)

### Data Not Persisting
- Check write permissions on `/data` directory
- Verify disk space
- Check server logs for errors

## 📄 License

ISC License - Free to use and modify

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built for modern technical hiring in the age of AI** 🚀
