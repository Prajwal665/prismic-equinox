import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Brain, Zap, Activity, Users, Clock, AlertCircle, Camera, Play, Shield, Maximize2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const CCTVFeeds = () => {
    const [selectedCamera, setSelectedCamera] = useState(0);
    const [density, setDensity] = useState(45);
    const [waitingTime, setWaitingTime] = useState(120);
    const [aiSolution, setAiSolution] = useState({
        action: "Optimizing Green Time",
        details: "Increase current phase by 12s to clear high-density queue in Lane 2.",
        confidence: 94.2
    });

    const cameras = [
        { id: 1, name: "Intersection A1 - North", location: "Sector 12, Delhi", status: "Active" },
        { id: 2, name: "Intersection B4 - East", location: "Rajiv Chowk", status: "Active" },
        { id: 3, name: "Bridge Exit 09", location: "Yamuna Expressway", status: "Active" },
        { id: 4, name: "Main Market Square", location: "Connaught Place", status: "Active" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly update density and waiting time
            const newDensity = Math.floor(Math.random() * 60) + 20;
            setDensity(newDensity);
            setWaitingTime(prev => Math.max(10, prev + (newDensity > 50 ? 5 : -3)));

            // Dynamic AI solution generation
            if (newDensity > 60) {
                setAiSolution({
                    action: "Phase Extension Triggered",
                    details: `Heavy buildup detected. Deciding to increase extension by 15s for Northbound traffic.`,
                    confidence: 98.4
                });
            } else if (newDensity < 30) {
                setAiSolution({
                    action: "Eco-Cycle Active",
                    details: "Minimal traffic detected. Switching to energy-efficient mode; reducing idle green time.",
                    confidence: 91.8
                });
            } else {
                setAiSolution({
                    action: "Balanced Flow Optimization",
                    details: "維持 current signal timing based on stable vehicle flow rates.",
                    confidence: 95.1
                });
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const [chartData, setChartData] = useState(Array.from({ length: 15 }, (_, i) => ({ time: i, density: 40 + Math.random() * 20 })));

    useEffect(() => {
        const t = setInterval(() => {
            setChartData(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, density: density }]);
        }, 1000);
        return () => clearInterval(t);
    }, [density]);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Video className="w-8 h-8 text-blue-500" />
                        Live CCTV Intelligence
                    </h1>
                    <p className="text-white/40 text-sm">Real-time visual monitoring paired with Neural Decision Support.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Feed Secure</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)]">
                {/* 1. Camera List Sidebar */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 py-1">Active Channels</h2>
                    {cameras.map((cam, idx) => (
                        <button
                            key={cam.id}
                            onClick={() => setSelectedCamera(idx)}
                            className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedCamera === idx
                                    ? 'bg-blue-600 border-blue-400/50 shadow-lg shadow-blue-900/40'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold">{cam.name}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'Active' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                            </div>
                            <p className="text-[10px] text-white/40">{cam.location}</p>
                        </button>
                    ))}

                    <div className="glass-panel p-4 mt-6 border-white/10 bg-white/2">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-3">System Health</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/40">Network Latency</span>
                                <span className="font-mono text-green-400">22ms</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/40">AI Vision Sync</span>
                                <span className="font-mono text-blue-400">99.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Live Feed Area */}
                <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
                    <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                        {/* Fake Video Stream Background */}
                        <div className="absolute inset-0 bg-navy-950 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
                            <div className="text-center">
                                <Activity className="w-12 h-12 text-white/5 mx-auto mb-4 animate-pulse" />
                                <p className="text-white/10 uppercase tracking-[0.3em] font-bold text-xs underline">Encrypted Stream Layer</p>
                            </div>
                        </div>

                        {/* Overlay: Camera Info */}
                        <div className="absolute top-6 left-6 flex items-center gap-3">
                            <div className="bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Camera className="w-4 h-4 text-white" />
                                <span className="text-xs font-mono font-bold tracking-tighter uppercase whitespace-nowrap">CAM-{1024 + cameras[selectedCamera].id}</span>
                            </div>
                            <div className="bg-red-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
                                <Play className="w-3 h-3 text-white fill-white" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live Feed</span>
                            </div>
                        </div>

                        {/* Overlay: AI Vision Highlights (Fake vehicles) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0.1, 0.4, 0.1],
                                        scale: [0.8, 1, 0.8],
                                        x: (i * 1234) % 100 + "%",
                                        y: (i * 5678) % 100 + "%"
                                    }}
                                    transition={{ duration: 2 + i, repeat: Infinity }}
                                    className="absolute w-20 h-12 border-2 border-yellow-500/30 rounded-lg flex items-start p-1"
                                >
                                    <span className="text-[8px] bg-yellow-500 text-black px-1 font-bold whitespace-nowrap">VEHICLE_CLASS: CAR</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Overlay: Bottom Controls */}
                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <Maximize2 size={18} />
                                </button>
                                <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <Shield size={18} />
                                </button>
                            </div>
                            <div className="text-[10px] font-mono text-white/60">
                                {new Date().toLocaleTimeString()} | 38.6214° N, 77.0354° W
                            </div>
                        </div>
                    </div>

                    {/* Analytics Strip */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-panel p-4 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Density</p>
                            <p className="text-xl font-mono text-blue-400 font-bold">{density}%</p>
                        </div>
                        <div className="glass-panel p-4 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Avg Waiting</p>
                            <p className="text-xl font-mono text-white font-bold">{waitingTime}s</p>
                        </div>
                        <div className="glass-panel p-4 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Confidence</p>
                            <p className="text-xl font-mono text-green-400 font-bold">{aiSolution.confidence}%</p>
                        </div>
                    </div>
                </div>

                {/* 3. AI Intelligence Solution Panel */}
                <div className="lg:col-span-1 space-y-6 flex flex-col overflow-hidden">
                    <div className="glass-panel p-6 border-blue-500/20 bg-blue-500/[0.03] flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Brain className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Neural Solution</h2>
                        </div>

                        <div className="space-y-6 flex-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={aiSolution.action}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl">
                                        <p className="text-blue-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Zap size={10} className="fill-blue-400" />
                                            Active Decision
                                        </p>
                                        <h3 className="text-white font-bold text-lg leading-tight">{aiSolution.action}</h3>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2">Strategy Reasoning</p>
                                        <p className="text-xs text-white/80 leading-relaxed italic">
                                            "{aiSolution.details}"
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-4">Density Trend (Live)</p>
                                <div className="h-[100px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="step"
                                                dataKey="density"
                                                stroke="#3b82f6"
                                                fill="url(#colorDensity)"
                                                animationDuration={400}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-blue-900/40">
                            Apply Override
                        </button>
                    </div>

                    <div className="glass-panel p-5 border-yellow-500/20 flex items-center gap-4 animate-pulse">
                        <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                        <p className="text-[10px] font-bold text-yellow-200/60 uppercase leading-snug">
                            Alert: High pedestrian volume detected at Gate 3. Switching to safety priority.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CCTVFeeds;
