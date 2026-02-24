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
    Network
} from 'lucide-react';

const AIChatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Neural Link Established. I am the Equinox Core Intelligence, integrated with the National RTO Database. I am here to assist with traffic rules, road safety regulations, and government RTO procedures. How can I help you navigate the law today?",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const response = getAIResponse(input);
            const botMsg = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const getAIResponse = (query) => {
        const q = query.toLowerCase();

        // Traffic Rules & Safety
        if (q.includes('helmet') || q.includes('seatbelt'))
            return "According to the Motor Vehicles (Amendment) Act 2019, wearing a helmet (for two-wheelers) and a seatbelt (for four-wheelers) is mandatory. Failure to comply can result in a fine of ₹1,000 and possible disqualification of the license for 3 months.";

        if (q.includes('red light') || q.includes('signal'))
            return "Jumping a red light is a serious offense under Section 184 (Dangerous Driving). Fines range from ₹1,000 to ₹5,000 and/or 6-12 months imprisonment. Always wait for the green signal for collective road safety.";

        if (q.includes('speed') || q.includes('fast'))
            return "Over-speeding attracts penalties under Section 183. For Light Motor Vehicles (LMV), the fine is ₹1,000–₹2,000. For Medium Passenger/Goods vehicles, it's ₹2,000–₹4,000. Continued violations may lead to license impoundment.";

        if (q.includes('drink') || q.includes('alcohol') || q.includes('drunk'))
            return "Section 185 covers Driving under the influence. First offense: Fine up to ₹10,000 and/or 6 months in prison. Second offense: Fine up to ₹15,000 and/or 2 years in prison. ECI strongly advises using a cab service instead.";

        // RTO Problem Solving
        if (q.includes('renew') || q.includes('expired')) {
            if (q.includes('license') || q.includes('dl'))
                return "To renew your DL: 1. Apply through Parivahan portal. 2. Submit Form 9. 3. Provide medical certificate (Form 1-A) if age >40. 4. Pay the renewal fee. You have a grace period of 1 year, but driving with an expired DL is illegal.";
            if (q.includes('rc') || q.includes('registration'))
                return "Registration renewal (Form 25) must be done 60 days before expiry. The vehicle requires a fitness inspection at the RTO. Current fees for 15-year renewal for cars start at ₹5,000.";
        }

        if (q.includes('transfer') || q.includes('sell') || q.includes('buy'))
            return "For Ownership Transfer: You need Form 29 (Notice of Transfer) and Form 30 (Report of Transfer). Required docs: Original RC, Insurance, PUC, Address Proof, and NOC if transferring across RTO jurisdictions.";

        if (q.includes('documents') || q.includes('carry') || q.includes('papers'))
            return "Under the MV Act, you must carry: 1. Driving License, 2. Registration Certificate (RC), 3. Insurance Certificate, 4. PUC (Pollution Under Control) Certificate. Digital copies on mParivahan or DigiLocker are legally valid.";

        if (q.includes('lost') || q.includes('duplicate'))
            return "If you've lost your RC or DL: 1. File an FIR at the nearest police station. 2. Apply for a duplicate on the Parivahan portal using Form 26 (for RC) or LLD (for DL). 3. Submit the FIR copy and pay the processing fee.";

        if (q.includes('rto') || q.includes('registration'))
            return "The Regional Transport Office (RTO) governs vehicle registration, licensing, and road tax. You can access most services online via the Parivahan Sarathi (Licensing) or Vahan (Registration) portals.";

        if (q.includes('hi') || q.includes('hello') || q.includes('hey'))
            return "Greetings. I am the ECI Road Safety Module. I can provide details on the Motor Vehicles Act, RTO procedures, and real-time traffic laws. What is your inquiry?";

        return "I have analyzed your query. Please specify if you need information on Traffic Fines, Licensing (renewal/duplicate), Vehicle Registration (transfer/renewal), or mandatory Safety Rules.";
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                        Neural Chatbot
                    </h1>
                    <p className="text-white/40 text-sm">Direct interface with the Equinox Core Intelligence (ECI).</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-navy-800 border border-white/10 rounded-xl flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Cognitive Load</span>
                            <span className="text-sm font-mono text-blue-400">14.2%</span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Cpu className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
                {/* 1. Chat Interface */}
                <div className="lg:col-span-3 glass-panel border-blue-500/10 flex flex-col overflow-hidden">
                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-navy-950/20 to-transparent"
                    >
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === 'user'
                                        ? 'bg-blue-600 border-blue-400/50'
                                        : 'bg-navy-800 border-white/10'
                                        }`}>
                                        {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <div className={`text-[10px] text-white/20 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-right' : 'text-left'
                                            }`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center shrink-0">
                                        <Bot size={16} className="text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-navy-900/50 border-t border-white/10">
                        <div className="relative flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Communicate with ECI Core..."
                                    className="w-full bg-navy-950 border border-white/10 focus:border-blue-500/50 rounded-xl py-4 pl-6 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                    <Sparkles size={16} className="text-blue-500/50" />
                                </div>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Side Intel Panel */}
                <div className="hidden lg:flex flex-col gap-6">
                    <div className="glass-panel p-6 border-blue-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Core Integrity</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] block text-white/30 mb-1 uppercase font-bold">Uptime</span>
                                <span className="text-sm font-mono text-white">124:12:05:55</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] block text-white/30 mb-1 uppercase font-bold">Memory Sync</span>
                                <span className="text-sm font-mono text-green-400">OPTIMIZED</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 border-blue-500/10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Network className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Module Suggestions</h3>
                        </div>
                        <div className="space-y-2">
                            {[
                                "Fine for driving without helmet?",
                                "How to renew expired license?",
                                "Documents required for vehicle transfer",
                                "What to do if I lost my RC?"
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="w-full text-left p-3 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-all">
                                <RefreshCcw size={14} />
                                RESET CONTEXT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
