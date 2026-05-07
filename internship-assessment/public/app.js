// Main Application Logic for Internship Assessment Platform

class AssessmentApp {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.userEvents = [];
        this.startTime = null;
        this.timerInterval = null;
        this.totalTime = 30 * 60; // 30 minutes in seconds
        this.timeRemaining = this.totalTime;
        this.focusLostCount = 0;
        this.tabSwitches = 0;
        this.cameraStream = null;
        this.isRecording = false;
        
        this.init();
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    async init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.updateSessionInfo();
    }

    loadQuestions() {
        // Terminal Questions
        this.questions = [
            {
                id: 1,
                type: 'terminal',
                title: 'Build the Project',
                description: 'You are in a Maven project directory. The project needs to be compiled. What command do you use to build the project?',
                hint: 'Maven uses specific commands for different tasks...',
                correctAnswer: 'mvn compile',
                alternatives: ['mvn clean compile', './mvnw compile'],
                timeLimit: 60,
                environment: 'terminal',
                initialPath: '/home/user/my-project'
            },
            {
                id: 2,
                type: 'terminal',
                title: 'Run Tests',
                description: 'Now you need to run all the tests in the project. What command do you execute?',
                hint: 'Think about Maven test lifecycle...',
                correctAnswer: 'mvn test',
                alternatives: ['mvn clean test', './mvnw test'],
                timeLimit: 60,
                environment: 'terminal',
                initialPath: '/home/user/my-project'
            },
            {
                id: 3,
                type: 'terminal',
                title: 'Navigate Directory Structure',
                description: 'You are currently in the root directory (/). Navigate to /var/log and list all files there.',
                hint: 'Use cd to change directory and ls to list...',
                correctAnswer: 'cd /var/log && ls',
                alternatives: ['cd /var/log; ls', 'cd /var/log\nls'],
                timeLimit: 90,
                environment: 'terminal',
                initialPath: '/'
            },
            {
                id: 4,
                type: 'terminal',
                title: 'Find and View Files',
                description: 'Find all Java files in the current directory and show the first 10 lines of each.',
                hint: 'Combine find with head command...',
                correctAnswer: 'find . -name "*.java" -exec head -10 {} \\;',
                alternatives: ['find . -name "*.java" | xargs head -10'],
                timeLimit: 120,
                environment: 'terminal',
                initialPath: '/home/user/project'
            },
            {
                id: 5,
                type: 'intellij',
                title: 'Change Project SDK',
                description: 'The project is using JDK 8, but you need to switch to JDK 17. Describe the steps or select the correct menu path.',
                hint: 'SDK settings are in project structure...',
                correctAnswer: 'File > Project Structure > Project > Project SDK > Add JDK > Select JDK 17',
                alternatives: ['File > Settings > Build > JDK', 'Project > Structure > SDK'],
                timeLimit: 90,
                environment: 'intellij',
                task: 'change_sdk'
            },
            {
                id: 6,
                type: 'intellij',
                title: 'Start Debugging',
                description: 'You need to debug the application starting from the main method. How do you start debugging?',
                hint: 'Debug mode allows breakpoints...',
                correctAnswer: 'Right-click main class > Debug \'Main\' or Shift+F9',
                alternatives: ['Run > Debug', 'Click bug icon in toolbar', 'Ctrl+Shift+F10'],
                timeLimit: 60,
                environment: 'intellij',
                task: 'start_debug'
            },
            {
                id: 7,
                type: 'intellij',
                title: 'Set Breakpoint',
                description: 'You want to pause execution at line 42. How do you set a breakpoint?',
                hint: 'Breakpoints are visual markers...',
                correctAnswer: 'Click in the left gutter next to line 42 or Ctrl+F8',
                alternatives: ['Right-click line > Toggle Breakpoint', 'F8'],
                timeLimit: 45,
                environment: 'intellij',
                task: 'set_breakpoint'
            },
            {
                id: 8,
                type: 'intellij',
                title: 'Run Specific Test',
                description: 'You only want to run the test class UserServiceTest. How do you execute just this test?',
                hint: 'IDEA allows running individual tests...',
                correctAnswer: 'Right-click on UserServiceTest > Run \'UserServiceTest\' or Ctrl+Shift+F10',
                alternatives: ['Click green play icon next to class', 'Ctrl+Shift+F10'],
                timeLimit: 60,
                environment: 'intellij',
                task: 'run_test'
            },
            {
                id: 9,
                type: 'windows',
                title: 'Launch Application',
                description: 'You have a JAR file "app.jar" on your desktop. How do you launch it from the command prompt?',
                hint: 'Java applications need java command...',
                correctAnswer: 'java -jar app.jar',
                alternatives: ['javaw -jar app.jar', 'start java -jar app.jar'],
                timeLimit: 60,
                environment: 'windows',
                task: 'launch_app'
            },
            {
                id: 10,
                type: 'windows',
                title: 'Check Running Processes',
                description: 'You need to verify if your Java application is running. What command do you use?',
                hint: 'Windows has a command to list processes...',
                correctAnswer: 'tasklist | findstr java',
                alternatives: ['tasklist', 'Get-Process java', 'netstat -ano | findstr java'],
                timeLimit: 60,
                environment: 'windows',
                task: 'check_process'
            },
            {
                id: 11,
                type: 'windows',
                title: 'Stop a Running Process',
                description: 'Your application is running on port 8080 and you need to stop it. The PID is 12345. What command do you use?',
                hint: 'Taskkill terminates processes...',
                correctAnswer: 'taskkill /PID 12345 /F',
                alternatives: ['taskkill /pid 12345', 'kill 12345'],
                timeLimit: 60,
                environment: 'windows',
                task: 'stop_process'
            },
            {
                id: 12,
                type: 'windows',
                title: 'Set Environment Variable',
                description: 'You need to set JAVA_HOME environment variable for this session to C:\\Program Files\\Java\\jdk-17. What command do you use?',
                hint: 'Windows uses set for environment variables...',
                correctAnswer: 'set JAVA_HOME=C:\\Program Files\\Java\\jdk-17',
                alternatives: ['SET JAVA_HOME=C:\\Program Files\\Java\\jdk-17', 'export JAVA_HOME=...'],
                timeLimit: 90,
                environment: 'windows',
                task: 'set_env'
            }
        ];
    }

    setupEventListeners() {
        // Consent checkbox
        document.getElementById('consent-check').addEventListener('change', (e) => {
            document.getElementById('start-btn').disabled = !e.target.checked;
        });

        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.requestPermissions();
        });

        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.navigate(-1);
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.navigate(1);
        });

        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitAssessment();
        });

        // Track focus changes
        window.addEventListener('blur', () => {
            this.recordEvent('focus_lost', { timestamp: Date.now() });
            this.focusLostCount++;
            this.showFocusWarning();
            this.updateFocusStatus(false);
        });

        window.addEventListener('focus', () => {
            this.recordEvent('focus_gained', { timestamp: Date.now() });
            this.updateFocusStatus(true);
        });

        // Track visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabSwitches++;
                this.recordEvent('tab_switch', { timestamp: Date.now(), action: 'left' });
            } else {
                this.recordEvent('tab_switch', { timestamp: Date.now(), action: 'returned' });
            }
        });

        // Track keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.startTime) {
                this.recordEvent('keydown', {
                    key: e.key,
                    code: e.code,
                    timestamp: Date.now(),
                    questionIndex: this.currentQuestionIndex
                });
            }
        });

        // Track mouse clicks
        document.addEventListener('click', (e) => {
            if (this.startTime) {
                this.recordEvent('click', {
                    x: e.clientX,
                    y: e.clientY,
                    target: e.target.tagName,
                    timestamp: Date.now(),
                    questionIndex: this.currentQuestionIndex
                });
            }
        });

        // Track mouse movement (sampled)
        let lastMouseRecord = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseRecord > 1000) { // Record every second
                this.recordEvent('mousemove', {
                    x: e.clientX,
                    y: e.clientY,
                    timestamp: now,
                    questionIndex: this.currentQuestionIndex
                });
                lastMouseRecord = now;
            }
        });

        // Prevent context menu (right-click)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.recordEvent('contextmenu_blocked', { timestamp: Date.now() });
        });

        // Prevent copy/paste during assessment
        document.addEventListener('copy', (e) => {
            if (this.startTime) {
                e.preventDefault();
                this.recordEvent('copy_blocked', { timestamp: Date.now() });
            }
        });

        document.addEventListener('paste', (e) => {
            if (this.startTime) {
                e.preventDefault();
                this.recordEvent('paste_blocked', { timestamp: Date.now() });
            }
        });

        document.addEventListener('cut', (e) => {
            if (this.startTime) {
                e.preventDefault();
                this.recordEvent('cut_blocked', { timestamp: Date.now() });
            }
        });

        // Prevent DevTools
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J')) {
                e.preventDefault();
                this.recordEvent('devtools_attempt_blocked', { timestamp: Date.now() });
            }
        });
    }

    async requestPermissions() {
        try {
            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 },
                audio: true 
            });
            
            const videoElement = document.getElementById('webcam');
            videoElement.srcObject = this.cameraStream;
            
            this.isRecording = true;
            this.startCameraRecording();
            
            // Show loading screen
            this.showScreen('loading-screen');
            
            // Simulate initialization
            const loadingTexts = [
                'Initializing environment...',
                'Setting up terminal...',
                'Configuring IntelliJ...',
                'Preparing Windows environment...',
                'Starting assessment...'
            ];
            
            for (const text of loadingTexts) {
                document.getElementById('loading-text').textContent = text;
                await this.sleep(800);
            }
            
            // Start assessment
            this.startAssessment();
            
        } catch (error) {
            alert('Camera/Microphone access is required for this assessment. Please grant permissions and try again.');
            console.error('Permission error:', error);
        }
    }

    startCameraRecording() {
        // Record camera frames periodically
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('screen-capture');
        const ctx = canvas.getContext('2d');
        
        setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                
                // Capture frame as base64 (for demo, we just record the event)
                this.recordEvent('camera_frame', {
                    timestamp: Date.now(),
                    width: canvas.width,
                    height: canvas.height
                });
            }
        }, 2000); // Every 2 seconds
    }

    startAssessment() {
        this.startTime = Date.now();
        this.showScreen('assessment-screen');
        this.updateSessionInfo();
        this.renderQuestion();
        this.startTimer();
        this.updateCameraStatus(true);
        
        // Record assessment start
        this.recordEvent('assessment_started', {
            timestamp: this.startTime,
            sessionId: this.sessionId,
            totalQuestions: this.questions.length
        });
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submitAssessment();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low
        const timerElement = document.getElementById('timer');
        if (this.timeRemaining < 300) { // Less than 5 minutes
            timerElement.style.background = '#dc3545';
        } else if (this.timeRemaining < 600) { // Less than 10 minutes
            timerElement.style.background = '#ffc107';
            timerElement.style.color = '#000';
        }
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const container = document.getElementById('environment-container');
        
        // Update question counter
        document.getElementById('question-counter').textContent = 
            `Question: ${this.currentQuestionIndex + 1}/${this.questions.length}`;
        
        // Render based on environment type
        switch (question.environment) {
            case 'terminal':
                this.renderTerminalEnvironment(container, question);
                break;
            case 'intellij':
                this.renderIntelliJEnvironment(container, question);
                break;
            case 'windows':
                this.renderWindowsEnvironment(container, question);
                break;
        }
        
        // Update navigation buttons
        document.getElementById('prev-btn').disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            document.getElementById('next-btn').style.display = 'none';
            document.getElementById('submit-btn').style.display = 'block';
        } else {
            document.getElementById('next-btn').style.display = 'block';
            document.getElementById('submit-btn').style.display = 'none';
        }
    }

    renderTerminalEnvironment(container, question) {
        container.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="terminal-button close"></div>
                    <div class="terminal-button minimize"></div>
                    <div class="terminal-button maximize"></div>
                    <span class="terminal-title">Terminal - ${question.initialPath}</span>
                </div>
                <div class="terminal-body">
                    <div class="terminal-output" id="terminal-output">Welcome to Ubuntu 22.04.3 LTS<br><br></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">user@machine:${question.initialPath}$</span>
                        <input type="text" class="terminal-input" id="terminal-input" 
                               placeholder="Type your command here..." autocomplete="off" autofocus>
                    </div>
                </div>
            </div>
            <div class="question-panel" style="width: 90%; max-width: 1000px; margin-top: 20px;">
                <div class="question-title">${question.title}</div>
                <div class="question-description">${question.description}</div>
                <div class="question-hint">💡 Hint: ${question.hint}</div>
            </div>
        `;
        
        // Setup terminal input handling
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const prompt = document.querySelector('.terminal-prompt');
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                this.recordEvent('terminal_command', {
                    command: command,
                    timestamp: Date.now(),
                    questionIndex: this.currentQuestionIndex
                });
                
                // Add command to output
                output.textContent += `${prompt.textContent} ${command}\n`;
                
                // Check answer
                this.checkTerminalAnswer(command, question, output);
                
                // Clear input
                input.value = '';
                
                // Scroll to bottom
                const terminalBody = document.querySelector('.terminal-body');
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        });
        
        // Keep focus on input
        container.addEventListener('click', () => {
            input.focus();
        });
    }

    checkTerminalAnswer(command, question, output) {
        const isCorrect = 
            command.toLowerCase() === question.correctAnswer.toLowerCase() ||
            question.alternatives.some(alt => alt.toLowerCase() === command.toLowerCase());
        
        if (isCorrect) {
            output.textContent += '\n✅ Correct! Well done.\n\n';
            this.recordEvent('answer_correct', {
                questionId: question.id,
                answer: command,
                timestamp: Date.now(),
                timeSpent: Date.now() - this.startTime
            });
        } else {
            output.textContent += `\n❌ Incorrect. Try again!\n\n`;
            this.recordEvent('answer_incorrect', {
                questionId: question.id,
                answer: command,
                timestamp: Date.now()
            });
        }
    }

    renderIntelliJEnvironment(container, question) {
        container.innerHTML = `
            <div class="intellij-window">
                <div class="intellij-menu-bar">
                    <span class="menu-item">File</span>
                    <span class="menu-item">Edit</span>
                    <span class="menu-item">View</span>
                    <span class="menu-item">Navigate</span>
                    <span class="menu-item">Code</span>
                    <span class="menu-item">Refactor</span>
                    <span class="menu-item">Build</span>
                    <span class="menu-item">Run</span>
                    <span class="menu-item">Tools</span>
                    <span class="menu-item">VCS</span>
                    <span class="menu-item">Window</span>
                    <span class="menu-item">Help</span>
                </div>
                <div class="intellij-toolbar">
                    <div class="toolbar-icon" title="Run">▶</div>
                    <div class="toolbar-icon" title="Debug">🐛</div>
                    <div class="toolbar-icon" title="Stop">⏹</div>
                    <div class="toolbar-icon" title="Rerun">🔄</div>
                    <div class="toolbar-icon" title="Settings">⚙</div>
                </div>
                <div class="intellij-main">
                    <div class="intellij-project-panel">
                        <div style="color: #bbb; font-size: 12px; padding: 5px;">Project</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px;">📁 my-project</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 20px;">📁 src</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 30px;">📁 main</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 40px;">📁 java</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 50px;">📄 Main.java</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 50px;">📄 UserService.java</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 40px;">📁 test</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px; padding-left: 50px;">📄 UserServiceTest.java</div>
                        <div style="color: #a9b7c6; font-size: 13px; padding: 5px;">📁 pom.xml</div>
                    </div>
                    <div class="intellij-editor">
                        <div class="code-line"><span class="line-number">1</span><span class="keyword">package</span> com.example;</div>
                        <div class="code-line"><span class="line-number">2</span></div>
                        <div class="code-line"><span class="line-number">3</span><span class="keyword">public class</span> <span class="class">Main</span> {</div>
                        <div class="code-line"><span class="line-number">4</span>    <span class="keyword">public static void</span> <span class="method">main</span>(String[] args) {</div>
                        <div class="code-line"><span class="line-number">5</span>        System.out.println(<span class="string">"Hello, World!"</span>);</div>
                        <div class="code-line"><span class="line-number">6</span>    }</div>
                        <div class="code-line"><span class="line-number">7</span>}</div>
                        <div class="code-line"><span class="line-number">8</span></div>
                        <div class="code-line"><span class="line-number">9</span><span class="comment">// TODO: Implement your solution here</span></div>
                    </div>
                </div>
                <div class="intellij-status-bar">
                    <span>✓ No errors</span>
                    <span>UTF-8</span>
                    <span>4 spaces</span>
                    <span>JDK 1.8</span>
                </div>
            </div>
            <div class="question-panel" style="width: 90%; max-width: 1200px; margin-top: 20px;">
                <div class="question-title">${question.title}</div>
                <div class="question-description">${question.description}</div>
                <div class="question-hint">💡 Hint: ${question.hint}</div>
                <div style="margin-top: 15px;">
                    <textarea id="intellij-answer" rows="3" 
                              placeholder="Describe your answer or select from options..." 
                              style="width: 100%; padding: 10px; border-radius: 4px; border: none; background: #3c3f41; color: #fff; font-family: monospace;"></textarea>
                    <button id="submit-intellij-answer" class="btn-primary" style="margin-top: 10px;">Submit Answer</button>
                </div>
            </div>
        `;
        
        // Setup answer submission
        document.getElementById('submit-intellij-answer').addEventListener('click', () => {
            const answer = document.getElementById('intellij-answer').value.trim();
            this.recordEvent('intellij_answer', {
                answer: answer,
                timestamp: Date.now(),
                questionIndex: this.currentQuestionIndex
            });
            
            // Simple validation - in production, implement proper checking
            if (answer.length > 10) {
                alert('✅ Answer recorded! You can proceed to the next question.');
                this.recordEvent('answer_submitted', {
                    questionId: question.id,
                    timestamp: Date.now()
                });
            } else {
                alert('❌ Please provide a more detailed answer.');
            }
        });
    }

    renderWindowsEnvironment(container, question) {
        container.innerHTML = `
            <div class="windows-window">
                <div class="windows-title-bar">
                    <span class="windows-title">Windows Desktop</span>
                    <div class="windows-controls">
                        <div class="windows-control">─</div>
                        <div class="windows-control">□</div>
                        <div class="windows-control">✕</div>
                    </div>
                </div>
                <div class="windows-desktop">
                    <div class="desktop-icon">
                        <div class="icon">☕</div>
                        <span>app.jar</span>
                    </div>
                    <div class="desktop-icon">
                        <div class="icon">📁</div>
                        <span>Documents</span>
                    </div>
                    <div class="desktop-icon">
                        <div class="icon">🗑️</div>
                        <span>Recycle Bin</span>
                    </div>
                </div>
                <div class="windows-taskbar">
                    <div class="start-button">Start</div>
                    <div class="taskbar-icons">
                        <div class="taskbar-icon">🌐</div>
                        <div class="taskbar-icon">📁</div>
                        <div class="taskbar-icon">⌨</div>
                    </div>
                    <div class="system-tray">
                        <span id="windows-clock">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
            <div class="question-panel" style="width: 90%; max-width: 1100px; margin-top: 20px;">
                <div class="question-title">${question.title}</div>
                <div class="question-description">${question.description}</div>
                <div class="question-hint">💡 Hint: ${question.hint}</div>
                <div style="margin-top: 15px;">
                    <input type="text" id="windows-answer" 
                           placeholder="Type your command here..." 
                           style="width: 100%; padding: 10px; border-radius: 4px; border: none; background: #333; color: #fff; font-family: monospace;"
                           autocomplete="off">
                    <button id="submit-windows-answer" class="btn-primary" style="margin-top: 10px;">Execute Command</button>
                </div>
            </div>
        `;
        
        // Update clock
        setInterval(() => {
            const clock = document.getElementById('windows-clock');
            if (clock) {
                clock.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
        
        // Setup answer submission
        const input = document.getElementById('windows-answer');
        const submitBtn = document.getElementById('submit-windows-answer');
        
        const handleSubmit = () => {
            const answer = input.value.trim();
            this.recordEvent('windows_command', {
                answer: answer,
                timestamp: Date.now(),
                questionIndex: this.currentQuestionIndex
            });
            
            // Check answer
            const isCorrect = 
                answer.toLowerCase() === question.correctAnswer.toLowerCase() ||
                question.alternatives.some(alt => alt.toLowerCase() === answer.toLowerCase());
            
            if (isCorrect) {
                alert('✅ Correct! Command executed successfully.');
                this.recordEvent('answer_correct', {
                    questionId: question.id,
                    answer: answer,
                    timestamp: Date.now()
                });
            } else {
                alert('❌ Incorrect. Try again!');
                this.recordEvent('answer_incorrect', {
                    questionId: question.id,
                    answer: answer,
                    timestamp: Date.now()
                });
            }
            
            input.value = '';
        };
        
        submitBtn.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
    }

    navigate(direction) {
        // Record current answer before navigating
        this.recordCurrentAnswer();
        
        this.currentQuestionIndex += direction;
        
        // Validate bounds
        if (this.currentQuestionIndex < 0) {
            this.currentQuestionIndex = 0;
        } else if (this.currentQuestionIndex >= this.questions.length) {
            this.currentQuestionIndex = this.questions.length - 1;
        }
        
        this.renderQuestion();
    }

    recordCurrentAnswer() {
        // Record any current answer state
        const terminalInput = document.getElementById('terminal-input');
        const intellijAnswer = document.getElementById('intellij-answer');
        const windowsAnswer = document.getElementById('windows-answer');
        
        if (terminalInput && terminalInput.value.trim()) {
            this.recordEvent('navigation_answer', {
                type: 'terminal',
                answer: terminalInput.value.trim(),
                timestamp: Date.now(),
                questionIndex: this.currentQuestionIndex
            });
        }
        
        if (intellijAnswer && intellijAnswer.value.trim()) {
            this.recordEvent('navigation_answer', {
                type: 'intellij',
                answer: intellijAnswer.value.trim(),
                timestamp: Date.now(),
                questionIndex: this.currentQuestionIndex
            });
        }
        
        if (windowsAnswer && windowsAnswer.value.trim()) {
            this.recordEvent('navigation_answer', {
                type: 'windows',
                answer: windowsAnswer.value.trim(),
                timestamp: Date.now(),
                questionIndex: this.currentQuestionIndex
            });
        }
    }

    showFocusWarning() {
        const warning = document.createElement('div');
        warning.className = 'focus-lost-warning';
        warning.innerHTML = `
            <h2>⚠️ Focus Lost!</h2>
            <p>Switching tabs or windows is recorded and may affect your assessment score.</p>
            <p>Total incidents: ${this.focusLostCount}</p>
        `;
        document.body.appendChild(warning);
        warning.style.display = 'block';
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }

    updateFocusStatus(isFocused) {
        const statusElement = document.getElementById('focus-status');
        if (isFocused) {
            statusElement.innerHTML = '👁️ Focus: <span class="status-on">ACTIVE</span>';
        } else {
            statusElement.innerHTML = '👁️ Focus: <span class="status-off">LOST</span>';
        }
    }

    updateCameraStatus(isActive) {
        const statusElement = document.getElementById('camera-status');
        if (isActive) {
            statusElement.innerHTML = '📷 Camera: <span class="status-on">ON</span>';
        } else {
            statusElement.innerHTML = '📷 Camera: <span class="status-off">OFF</span>';
        }
    }

    updateSessionInfo() {
        document.getElementById('session-id').textContent = `Session: ${this.sessionId}`;
    }

    recordEvent(eventType, data) {
        this.userEvents.push({
            eventType: eventType,
            ...data,
            sessionId: this.sessionId
        });
        
        // Log to console for debugging
        console.log(`[Event] ${eventType}:`, data);
    }

    async submitAssessment() {
        // Stop timer
        clearInterval(this.timerInterval);
        
        // Record final answer
        this.recordCurrentAnswer();
        
        // Record assessment completion
        this.recordEvent('assessment_completed', {
            timestamp: Date.now(),
            totalTimeSpent: Date.now() - this.startTime,
            focusLostCount: this.focusLostCount,
            tabSwitches: this.tabSwitches,
            totalEvents: this.userEvents.length
        });
        
        // Stop camera
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        // Send data to server
        await this.sendToServer();
        
        // Show completion screen
        this.showScreen('completion-screen');
        this.showSummaryStats();
    }

    async sendToServer() {
        const assessmentData = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            totalTimeSpent: Date.now() - this.startTime,
            questions: this.questions.map(q => ({
                id: q.id,
                type: q.type,
                title: q.title
            })),
            events: this.userEvents,
            metrics: {
                focusLostCount: this.focusLostCount,
                tabSwitches: this.tabSwitches,
                totalEvents: this.userEvents.length
            }
        };
        
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assessmentData)
            });
            
            if (response.ok) {
                console.log('Assessment data submitted successfully');
            } else {
                console.error('Failed to submit assessment');
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
            // Store locally if server is unavailable
            localStorage.setItem(`assessment_${this.sessionId}`, JSON.stringify(assessmentData));
        }
    }

    showSummaryStats() {
        const statsContainer = document.getElementById('summary-stats');
        const timeSpent = Math.floor((Date.now() - this.startTime) / 60);
        
        statsContainer.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #1e3c72; margin-bottom: 15px;">Assessment Summary</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; text-align: left;">
                    <div>
                        <strong>Session ID:</strong><br>
                        <span style="font-family: monospace; color: #666;">${this.sessionId}</span>
                    </div>
                    <div>
                        <strong>Time Spent:</strong><br>
                        <span>${timeSpent} minutes</span>
                    </div>
                    <div>
                        <strong>Questions Completed:</strong><br>
                        <span>${this.currentQuestionIndex + 1} / ${this.questions.length}</span>
                    </div>
                    <div>
                        <strong>Focus Incidents:</strong><br>
                        <span style="color: ${this.focusLostCount > 0 ? '#dc3545' : '#28a745'};">${this.focusLostCount}</span>
                    </div>
                    <div>
                        <strong>Tab Switches:</strong><br>
                        <span style="color: ${this.tabSwitches > 0 ? '#dc3545' : '#28a745'};">${this.tabSwitches}</span>
                    </div>
                    <div>
                        <strong>Total Events Recorded:</strong><br>
                        <span>${this.userEvents.length}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentApp = new AssessmentApp();
});
