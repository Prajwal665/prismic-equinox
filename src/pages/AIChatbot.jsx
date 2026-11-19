import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Send,
    Bot,
    User,
    Sparkles,
    Shield,
    Zap,
    RefreshCcw,
    Cpu,
    Network,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Plus,
    Trash2,
    Copy,
    Check,
    ThumbsUp,
    ThumbsDown,
    Radio,
    Terminal,
    Sliders,
    Search,
    Share2,
    HelpCircle,
    Activity,
    ArrowUpRight,
    Square
} from 'lucide-react';

const initialThreadMessages = {
    'default': [
        {
            id: 1,
            text: "Hello! I am **ITMS Chatbot**, your intelligent urban mobility and traffic management assistant powered by the **ITMS-GPT Omniscient Engine**.\n\nI have complete, real-time knowledge of the **ITMS Project (itms.gov.in)**, our live CCTV hardware feeds, emergency green wave corridors, junction telemetry (Sector 12, Rajiv Chowk, Connaught Place), the Indian Motor Vehicles Act, RTO guidelines, and general traffic science.\n\nClick **\"🎙️ Let's Talk\"** above for hands-free voice mode, or ask me anything below!",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
                "Tell me all about the ITMS Project",
                "How does the Emergency Green Wave work?",
                "What is the live congestion at Sector 12?",
                "Let's talk about the future of smart cities"
            ]
        }
    ]
};

const predefinedThreads = [
    { id: 'default', title: "🚦 ITMS Command Overview", date: "Just now" },
    { id: 'emergency-guide', title: "🚨 Green Wave Protocol Guide", date: "Today" },
    { id: 'traffic-rules', title: "⚖️ Motor Vehicles Act 2019", date: "Yesterday" }
];

const AIChatbot = () => {
    const [threads, setThreads] = useState(predefinedThreads);
    const [activeThreadId, setActiveThreadId] = useState('default');
    const [threadConversations, setThreadConversations] = useState(initialThreadMessages);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [feedbackState, setFeedbackState] = useState({});

    // Voice & "Let's Talk" Mode State
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeakReplies, setAutoSpeakReplies] = useState(false);

    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    const currentMessages = threadConversations[activeThreadId] || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentMessages, isTyping]);

    // Initialize Web Speech API for "Let's Talk" Voice Mode
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript && transcript.trim()) {
                    handleSendMessage(transcript);
                }
            };

            recognition.onerror = (e) => {
                console.warn('Speech recognition event:', e.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Text to Speech
    const speakText = (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        // Remove markdown formatting symbols for natural voice playback
        const cleanText = text
            .replace(/[*#_`\[\]]/g, '')
            .replace(/https?:\/\/\S+/g, '')
            .slice(0, 350);

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Toggle Listening
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (isSpeaking) stopSpeaking();
            try {
                recognitionRef.current?.start();
            } catch (err) {
                console.warn('Recognition start error:', err);
            }
        }
    };

    // Toggle "Let's Talk" interactive voice session
    const toggleVoiceMode = () => {
        const nextMode = !isVoiceMode;
        setIsVoiceMode(nextMode);
        setAutoSpeakReplies(nextMode);

        if (nextMode) {
            speakText("Let's talk mode activated. Speak into your microphone and I will respond to your queries.");
            setTimeout(() => {
                try {
                    recognitionRef.current?.start();
                } catch (e) {}
            }, 2500);
        } else {
            stopSpeaking();
            recognitionRef.current?.stop();
        }
    };

    // Create New Conversation Thread
    const handleNewChat = () => {
        const newId = `chat-${Date.now()}`;
        const newTitle = `New Chat ${threads.length + 1}`;
        setThreads(prev => [{ id: newId, title: newTitle, date: "Just now" }, ...prev]);
        setThreadConversations(prev => ({
            ...prev,
            [newId]: [
                {
                    id: Date.now(),
                    text: "New conversation initiated. I am ready to assist with traffic analysis, project documentation, or casual chat. What would you like to explore?",
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    suggestions: [
                        "Tell me about the ITMS Project",
                        "How do I clear traffic for an ambulance?",
                        "What are the helmet & seatbelt penalties?",
                        "Let's talk about AI in traffic management"
                    ]
                }
            ]
        }));
        setActiveThreadId(newId);
    };

    // Send Message Handler
    const handleSendMessage = (textToSend = null) => {
        const queryText = (textToSend || input).trim();
        if (!queryText) return;

        const userMsg = {
            id: Date.now(),
            text: queryText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setThreadConversations(prev => ({
            ...prev,
            [activeThreadId]: [...(prev[activeThreadId] || []), userMsg]
        }));

        setInput('');
        setIsTyping(true);

        // Generate response based on deep omniscient knowledge base
        setTimeout(() => {
            const { answer, suggestions } = generateITMSIntelligence(queryText);
            const botMsg = {
                id: Date.now() + 1,
                text: answer,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestions: suggestions || []
            };

            setThreadConversations(prev => ({
                ...prev,
                [activeThreadId]: [...(prev[activeThreadId] || []), botMsg]
            }));

            setIsTyping(false);

            if (autoSpeakReplies || isVoiceMode) {
                speakText(answer);
            }
        }, 1100);
    };

    // Copy message to clipboard
    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    // Thumbs Up / Down feedback
    const handleFeedback = (id, type) => {
        setFeedbackState(prev => ({ ...prev, [id]: type }));
    };

    // Comprehensive ITMS & Traffic Omniscient Knowledge Base
    const generateITMSIntelligence = (query) => {
        const q = query.toLowerCase();

        // 1. "Let's Talk" or Casual Conversation
        if (q.includes("let's talk") || q.includes("lets talk") || q.includes("talk to me") || q.includes("chat with me")) {
            return {
                answer: "I'd love to talk! As your **ITMS Chatbot**, I am fully equipped to converse with you naturally like ChatGPT.\n\nWe can talk about anything:\n- 🚀 **The ITMS Project architecture** and how our smart traffic platform operates.\n- 🤖 **Artificial Intelligence** in autonomous signal coordination.\n- 🚦 **Real-time Delhi traffic challenges** and congestion prevention strategies.\n- 🚑 **Emergency vehicle priority algorithms**.\n- 💡 Or any general ideas, technical questions, or urban planning concepts!\n\nWhat topic would you like to start with?",
                suggestions: ["How does ITMS reduce travel time?", "Tell me about the live cameras", "Explain Webster's formula", "Let's discuss electric vehicle mobility"]
            };
        }

        // 2. Greetings
        if (q.startsWith("hi") || q.startsWith("hello") || q.startsWith("hey") || q.includes("good morning") || q.includes("good evening")) {
            return {
                answer: "Greetings! I am the **ITMS Chatbot**, your unified AI assistant connected to the ITMS National Digital Connectivity Portal (`itms.gov.in`).\n\nI monitor all active intersection nodes, live camera telemetry, emergency corridors, and regulatory compliance. How can I assist you today?",
                suggestions: ["Give me an ITMS Project overview", "Check live camera feeds", "What are the rules for emergency vehicles?", "What's the fine for jumping a red light?"]
            };
        }

        // 3. Complete Project Overview
        if (q.includes("about the project") || q.includes("itms project") || q.includes("what is itms") || q.includes("explain the project") || q.includes("project overview")) {
            return {
                answer: "### 🌐 The ITMS Project (itms.gov.in)\n\nThe **Intelligent Traffic Management System (ITMS)** is India's next-generation urban mobility command and control platform designed to eradicate traffic gridlock, enhance pedestrian safety, and guarantee zero-delay corridors for emergency responders.\n\n#### 🏛️ Core System Architecture:\n1. **Live CCTV Feeds & Hardware Integration** (`/cameras`):\n   - High-definition visual sensor grid streaming live video from city intersections and local laptop/hardware cameras.\n   - Dual-protocol connectivity: High-throughput **Wi-Fi (5.8 GHz)** and ultra-low-latency **Bluetooth (BLE 5.3 Mesh)**.\n   - Live hardware power toggles (ON/OFF) per node to optimize power and bandwidth.\n   - Cybernetic AI Computer Vision HUD with dynamic operator/vehicle bounding reticles.\n\n2. **Emergency Control & Green Wave Corridors** (`/emergency`):\n   - Auto-preemption routing that dynamically turns traffic signals green ahead of approaching ambulances and fire engines.\n   - Real-time GPS vehicle tracking and queue-flushing algorithms.\n\n3. **Traffic Analytics Engine** (`/analytics`):\n   - Multimodal vehicle volume classification (Two-wheelers 41%, Cars 32%, Buses 12%, Heavy Freight 15%).\n   - Peak traffic hour forecasting (16:00 – 18:00) and automated carbon emission footprint tracking (-18% reduction).\n\n4. **Adaptive AI Intelligence Core** (`/ai-agent`):\n   - Real-time split-cycle optimization utilizing Webster's saturation flow equations.\n   - Self-healing traffic signal grids that automatically balance congestion between adjacent corridors.\n\n5. **Interactive GIS Map** (`/map`):\n   - Geospatial visual command dashboard with active junction coordinates and live telemetry overlays.",
                suggestions: ["How do the camera feeds connect via Bluetooth?", "Explain the Green Wave corridor", "What is Webster's Formula?", "Show live junction status"]
            };
        }

        // 4. Cameras, Laptop Webcam, Wi-Fi & Bluetooth
        if (q.includes("camera") || q.includes("cctv") || q.includes("webcam") || q.includes("bluetooth") || q.includes("wifi") || q.includes("on off")) {
            return {
                answer: "### 📷 ITMS Camera & Sensor Network\n\nOur CCTV module features complete hardware and wireless mesh integration:\n\n- **Integrated Laptop Camera**: Direct browser-to-hardware pipeline using `navigator.mediaDevices.getUserMedia`. Provides live 1080p 30 FPS video streaming with real-time AI bounding box detection.\n- **Individual ON/OFF Power Controls**: Every camera node (Sector 12, Rajiv Chowk, Yamuna Expressway, Connaught Place) can be powered down into standby mode or powered up with 1 click.\n- **Wi-Fi & Bluetooth Dual-Link Protocol**:\n  - **Wi-Fi Mode**: 5.8 GHz / 2.4 GHz high-bandwidth link for heavy 4K streaming.\n  - **Bluetooth Mode**: BLE 5.3 Mesh for low-power, robust ad-hoc wireless node communication.\n  - Users can toggle between Wi-Fi and Bluetooth instantly on each camera card or use the **Settings (⚙)** modal to scan and pair devices.\n- **Snapshot Capture**: Operator tool to capture timestamped evidence stills for enforcement.",
                suggestions: ["How do I connect my laptop camera?", "How does Bluetooth camera pairing work?", "What AI overlays are available on the camera?"]
            };
        }

        // 5. Emergency Corridor & Green Wave
        if (q.includes("emergency") || q.includes("green wave") || q.includes("ambulance") || q.includes("hospital") || q.includes("corridor")) {
            return {
                answer: "### 🚨 Emergency Green Wave Corridor System\n\nThe ITMS Green Wave guarantees a **clear, unbroken corridor of green lights** for emergency vehicles (ambulances, fire engines, emergency police escorts).\n\n#### ⚡ How it Operates:\n1. **Preemption Request**: When an emergency vehicle is dispatched, its GPS transponder broadcasts telemetry to the ITMS central server.\n2. **Queue Flushing**: 30 to 45 seconds before the vehicle arrives at an intersection, downstream signals turn green to clear the backlog of waiting vehicles.\n3. **Signal Hold**: The green phase is held until the emergency vehicle successfully clears the intersection box.\n4. **Recovery Cycle**: The intersection smoothly transitions back to balanced cycles without causing secondary gridlock.\n\n⚖️ **Legal Enforcement**: Under **Section 194E** of the Motor Vehicles Act, failing to yield to an emergency vehicle carries a mandatory fine of **₹10,000** and up to 6 months imprisonment.",
                suggestions: ["Simulate an Emergency Corridor", "What is Section 194E fine?", "How are ambulances tracked in ITMS?"]
            };
        }

        // 6. Live Congestion & Junction Status
        if (q.includes("sector 12") || q.includes("rajiv chowk") || q.includes("connaught place") || q.includes("yamuna") || q.includes("junction") || q.includes("congestion") || q.includes("status")) {
            return {
                answer: "### 📊 Live Junction Telemetry\n\n| Junction Node | Location | Density | Avg Waiting | Signal Cycle | Status |\n| :--- | :--- | :---: | :---: | :---: | :--- |\n| **CAM-1025** | Sector 12, Delhi | **42%** | 35s | 120s (Balanced) | 🟢 Normal Flow |\n| **CAM-1026** | Rajiv Chowk East | **68%** | 65s | 145s (Extended) | 🟡 Moderate Queue |\n| **CAM-1027** | Yamuna Expressway Exit 09 | **28%** | 15s | 90s (Eco-Cycle) | 🟢 Fast Transit |\n| **CAM-1028** | Connaught Place Market | **55%** | 45s | 110s (Pedestrian Priority) | 🟢 Managed |\n\n*Adaptive Recommendation*: Rajiv Chowk East is currently running an extended phase of +15s to clear heavy eastbound traffic.",
                suggestions: ["How does the AI optimize green time?", "Trigger signal override", "Tell me about Sector 12"]
            };
        }

        // 7. Webster's Formula & Traffic Engineering
        if (q.includes("webster") || q.includes("algorithm") || q.includes("formula") || q.includes("cycle time") || q.includes("science")) {
            return {
                answer: "### 📐 Webster's Optimal Cycle Time Model\n\nITMS utilizes **Webster's Method** to determine the optimum signal cycle length ($C_o$) that minimizes overall vehicle delay:\n\n$$C_o = \\frac{1.5L + 5}{1 - Y}$$\n\nWhere:\n- **$L$** = Total lost time per cycle (amber transition + startup delay, typically 12s).\n- **$Y$** = Sum of critical flow ratios across all phases ($\\sum \\frac{q_i}{s_i}$), where $q_i$ is arrival volume and $s_i$ is saturation flow.\n\nWhen $Y \\ge 0.85$, ITMS triggers dynamic phase splits to avoid queue spillback into upstream junctions.",
                suggestions: ["What happens if traffic exceeds capacity?", "Explain Green Wave calculations", "How does Eco-Cycle save fuel?"]
            };
        }

        // 8. Motor Vehicles Act, Rules & Fines
        if (q.includes("fine") || q.includes("challan") || q.includes("penalty") || q.includes("act") || q.includes("rule") || q.includes("license") || q.includes("rc")) {
            return {
                answer: "### ⚖️ Indian Motor Vehicles (Amendment) Act 2019 Key Penalties\n\n| Violation | Section | Penalty |\n| :--- | :---: | :--- |\n| **Over-Speeding (LMV)** | Sec 183 | ₹1,000 – ₹2,000 |\n| **Dangerous / Reckless Driving** | Sec 184 | ₹1,000 – ₹5,000 / 6–12 months imprisonment |\n| **Jumping Red Light** | Sec 184 | ₹1,000 – ₹5,000 |\n| **Drunk Driving (DUI)** | Sec 185 | ₹10,000 (1st offense) / ₹15,000 & jail (2nd offense) |\n| **Riding Without Helmet** | Sec 194D | ₹1,000 + 3-month DL suspension |\n| **Driving Without Seatbelt** | Sec 194B | ₹1,000 |\n| **Not Yielding to Emergency Vehicle** | Sec 194E | ₹10,000 / 6 months imprisonment |\n| **Driving Without Valid License** | Sec 181 | ₹5,000 |\n\nAll e-Challans are automatically issued via ITMS ANPR (Automated Number Plate Recognition) cameras.",
                suggestions: ["How do I renew an expired DL?", "What documents are legally valid on DigiLocker?", "How does ANPR work?"]
            };
        }

        // 9. RTO Procedures & Documents
        if (q.includes("renew") || q.includes("rto") || q.includes("transfer") || q.includes("parivahan") || q.includes("documents")) {
            return {
                answer: "### 📋 Official RTO & Parivahan Guidelines\n\n1. **Documents to Carry**: Valid Driving License, Registration Certificate (RC), Insurance Policy, and Pollution Under Control (PUC). Digital versions stored in **DigiLocker** or **mParivahan** are legally valid under Rule 139 of CMVR.\n2. **License Renewal**: Apply online on `sarathi.parivahan.gov.in` with Form 9. Applicants over 40 require Medical Certificate Form 1-A.\n3. **Vehicle Ownership Transfer**: Requires Form 29 (Notice of Transfer) and Form 30 (Application for Intimation), original RC, valid insurance, and NOC if transferring across state borders.",
                suggestions: ["What are the fines for missing documents?", "How do I check pending e-Challans?"]
            };
        }

        // 10. General AI Query
        return {
            answer: `I have analyzed your query regarding **"${query}"**.\n\nAs the ITMS Omniscient Intelligence Engine, I can provide detailed guidance on:\n- **ITMS Platform Architecture**: Real-time CCTV streams, Bluetooth/Wi-Fi hardware, and command panels.\n- **Emergency Operations**: Automated Green Wave corridors and intersection preemption.\n- **Traffic Engineering**: Webster's formulas, dynamic signal timing, and congestion mitigation.\n- **Traffic Laws & Regulations**: Motor Vehicles Act 2019, RTO procedures, and e-Challan automation.\n\nWould you like me to elaborate on any specific module or provide step-by-step procedures?`,
            suggestions: [
                "Tell me about the ITMS Project",
                "Explain the Bluetooth camera connection",
                "How does the Green Wave corridor work?",
                "What is the live status of Rajiv Chowk?"
            ]
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] relative">
            {/* Top Bar / Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                        ITMS Chatbot
                    </h1>
                    <p className="text-white/50 text-sm">
                        Omniscient LLM for Urban Mobility, ITMS Project Intelligence, and Conversational Traffic Operations.
                    </p>
                </div>

                {/* Top Controls: "Let's Talk" Mode + Status Indicators */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Primary "Let's Talk" Voice Mode Button */}
                    <button
                        onClick={toggleVoiceMode}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                            isVoiceMode
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                        }`}
                    >
                        {isVoiceMode ? (
                            <>
                                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                                🎙️ Let's Talk: Active
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4" />
                                🎙️ Let's Talk (Voice Mode)
                            </>
                        )}
                    </button>

                    {/* Voice Reply Audio Toggle */}
                    <button
                        onClick={() => {
                            if (isSpeaking) stopSpeaking();
                            setAutoSpeakReplies(!autoSpeakReplies);
                        }}
                        title={autoSpeakReplies ? "Disable Voice Responses" : "Enable Voice Responses"}
                        className={`p-2.5 rounded-xl border transition-all ${
                            autoSpeakReplies || isSpeaking
                                ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {autoSpeakReplies || isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Model Status Badge */}
                    <div className="px-3 py-2 bg-navy-800 border border-white/10 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-white/80 font-mono text-[11px] font-bold">ITMS-GPT v4.5</span>
                    </div>
                </div>
            </header>

            {/* Main Chat Grid (Sidebar Threads + Chat Area) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
                {/* 1. ChatGPT-Style Threads & Topics Sidebar */}
                <div className="hidden lg:flex flex-col gap-4 overflow-hidden pr-2">
                    {/* New Chat Button */}
                    <button
                        onClick={handleNewChat}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        New Conversation
                    </button>

                    {/* Recent Sessions */}
                    <div className="glass-panel p-4 flex-1 flex flex-col overflow-hidden border-white/10 bg-white/2">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-1">
                            Conversations
                        </h2>

                        <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {threads.map(thread => (
                                <button
                                    key={thread.id}
                                    onClick={() => setActiveThreadId(thread.id)}
                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                                        activeThreadId === thread.id
                                            ? 'bg-blue-600/30 border border-blue-400/50 text-white font-semibold'
                                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <span className="truncate pr-2">{thread.title}</span>
                                    <span className="text-[10px] text-white/30 shrink-0">{thread.date}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Knowledge Topics */}
                        <div className="pt-4 mt-2 border-t border-white/10">
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-2 px-1">
                                Core Knowledge Topics
                            </h3>
                            <div className="space-y-1 text-xs">
                                {[
                                    { label: "🌐 About ITMS Project", query: "Tell me all about the ITMS Project" },
                                    { label: "🚑 Green Wave Corridor", query: "How does the Emergency Green Wave work?" },
                                    { label: "📷 CCTV Wi-Fi/BT Feeds", query: "Explain the camera Wi-Fi and Bluetooth connection" },
                                    { label: "⚖️ Motor Vehicles Act 2019", query: "What are the key fines under the Motor Vehicles Act 2019?" },
                                    { label: "🗣️ Let's Talk AI Mode", query: "Let's talk about the future of smart city traffic" }
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(item.query)}
                                        className="w-full text-left p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors truncate text-[11px]"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Chat Conversation Panel */}
                <div className="lg:col-span-3 glass-panel border-white/10 flex flex-col overflow-hidden bg-navy-950/40 relative">
                    {/* Active Voice Mode Banner */}
                    <AnimatePresence>
                        {isVoiceMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-950/60 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="font-semibold">
                                        "Let's Talk" Mode Active: Speak anytime or listen to spoken replies.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSpeaking && (
                                        <button
                                            onClick={stopSpeaking}
                                            className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg font-bold flex items-center gap-1 hover:bg-red-500/30"
                                        >
                                            <Square size={12} /> Stop Voice
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleVoiceMode}
                                        className="text-[11px] underline text-emerald-400 hover:text-emerald-300"
                                    >
                                        Exit Voice Mode
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Messages Scrollable Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-navy-950/30 to-transparent"
                    >
                        {currentMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 border-blue-400/50 text-white'
                                            : 'bg-navy-800 border-white/20 text-blue-400'
                                    }`}>
                                        {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>

                                    {/* Message Body */}
                                    <div className="space-y-2 flex-1">
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none whitespace-pre-wrap'
                                        }`}>
                                            {msg.text}
                                        </div>

                                        {/* Suggestions Pills (If present) */}
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {msg.suggestions.map((sug, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSendMessage(sug)}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/40 rounded-xl text-xs text-blue-300 transition-all flex items-center gap-1.5 group"
                                                    >
                                                        <span>{sug}</span>
                                                        <ArrowUpRight size={12} className="opacity-50 group-hover:opacity-100" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions Toolbar (Timestamp, Copy, Read Aloud, Thumbs Up/Down) */}
                                        <div className={`flex items-center gap-2 text-[10px] text-white/40 font-mono ${
                                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                        }`}>
                                            <span>{msg.timestamp}</span>

                                            {msg.sender === 'bot' && (
                                                <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                                                    {/* Copy button */}
                                                    <button
                                                        onClick={() => handleCopy(msg.id, msg.text)}
                                                        title="Copy response"
                                                        className="p-1 hover:text-white transition-colors rounded"
                                                    >
                                                        {copiedMessageId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>

                                                    {/* Speak / Read Aloud */}
                                                    <button
                                                        onClick={() => speakText(msg.text)}
                                                        title="Read response aloud"
                                                        className="p-1 hover:text-white transition-colors rounded"
                                                    >
                                                        <Volume2 size={12} />
                                                    </button>

                                                    {/* Thumbs up */}
                                                    <button
                                                        onClick={() => handleFeedback(msg.id, 'up')}
                                                        title="Helpful response"
                                                        className={`p-1 transition-colors rounded ${feedbackState[msg.id] === 'up' ? 'text-emerald-400' : 'hover:text-white'}`}
                                                    >
                                                        <ThumbsUp size={12} />
                                                    </button>

                                                    {/* Thumbs down */}
                                                    <button
                                                        onClick={() => handleFeedback(msg.id, 'down')}
                                                        title="Needs improvement"
                                                        className={`p-1 transition-colors rounded ${feedbackState[msg.id] === 'down' ? 'text-red-400' : 'hover:text-white'}`}
                                                    >
                                                        <ThumbsDown size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Animation */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3.5 max-w-[80%]">
                                    <div className="w-9 h-9 rounded-xl bg-navy-800 border border-white/20 flex items-center justify-center shrink-0 text-blue-400">
                                        <Bot size={18} />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="text-xs text-white/40 ml-2 font-mono">Analyzing traffic neural models...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Bottom Input Area */}
                    <div className="p-4 bg-navy-950/90 border-t border-white/10">
                        {/* Audio Waveform visualization if listening */}
                        {isListening && (
                            <div className="mb-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="font-semibold">Listening to your voice... Speak now</span>
                                </div>
                                <div className="flex items-center gap-1 h-3">
                                    {[40, 80, 50, 100, 60, 90, 40].map((h, i) => (
                                        <span
                                            key={i}
                                            className="w-1 bg-emerald-400 rounded-full animate-pulse"
                                            style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="relative flex items-center gap-3">
                            {/* Microphone Button */}
                            <button
                                type="button"
                                onClick={toggleListening}
                                title={isListening ? "Stop Listening" : "Speak to ITMS Chatbot"}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                    isListening
                                        ? 'bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-500/30'
                                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                                }`}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {/* Main Input Textarea/Input */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask ITMS Chatbot anything about traffic, the project, or say 'Let's talk'..."
                                    className="w-full bg-navy-900 border border-white/15 focus:border-blue-500 rounded-xl py-3.5 pl-5 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                                />
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-white/30">
                                    <Sparkles size={16} className="text-blue-400/60" />
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
