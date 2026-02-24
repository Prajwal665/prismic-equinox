import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Zap, Activity, TrendingUp, Car, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AIAgent = () => {
    const [density, setDensity] = useState([12, 45, 23, 30]); // North, East, South, West
    const [greenTime, setGreenTime] = useState([30, 30, 30, 30]);
    const [activeSignal, setActiveSignal] = useState(0); // 0: North-South, 1: East-West
    const [rewards, setRewards] = useState([
        { time: '0s', reward: 40 },
        { time: '10s', reward: 45 },
        { time: '20s', reward: 55 },
        { time: '30s', reward: 52 },
        { time: '40s', reward: 68 },
        { time: '50s', reward: 75 },
        { time: '60s', reward: 82 },
    ]);
    const [logs, setLogs] = useState([
        { id: 1, action: "Increased Green Time - North", time: "12:04:12", reward: "+5.2" },
        { id: 2, action: "Switched Signal - Horizontal", time: "12:04:30", reward: "+12.8" },
        { id: 3, action: "Decreased Green Time - West", time: "12:05:01", reward: "-2.1" },
    ]);

    // Simulate AI thinking and behavior
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly update density to simulate real traffic
            setDensity(prev => prev.map(d => Math.max(5, Math.min(100, d + Math.floor(Math.random() * 21) - 10))));

            // AI Action Simulation
            const randomActionIndex = Math.floor(Math.random() * 3);
            const actions = ["Increase Green Time", "Decrease Green Time", "Keep Current"];
            const currentLaneIdx = Math.floor(Math.random() * 4);
            const action = actions[randomActionIndex];

            const newLog = {
                id: Date.now(),
                action: `${action} - ${['North', 'East', 'South', 'West'][currentLaneIdx]}`,
                time: new Date().toLocaleTimeString(),
                reward: (Math.random() * 15).toFixed(1)
            };

            setLogs(prev => [newLog, ...prev.slice(0, 4)]);

            // Update rewards graph
            setRewards(prev => {
                const last = prev[prev.length - 1];
                const newReward = Math.min(100, Math.max(20, parseFloat(last.reward) + (Math.random() * 10 - 4)));
                return [...prev.slice(1), { time: `${parseInt(last.time) + 10}s`, reward: newReward }];
            });

        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Equinox AI Engine</h1>
                    <p className="text-white/40 max-w-2xl text-sm">Main Intelligence Module (M.I.M) - Reinforcement Learning based Adaptive Signal Control System.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest leading-none">Learning Active</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Observation Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 border-blue-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Car className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold">Real-time Intersection Observation</h2>
                        </div>

                        <div className="relative h-[400px] flex items-center justify-center bg-navy-950/50 rounded-2xl overflow-hidden border border-white/5">
                            {/* Visual Grid / Intersection */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-1/2 left-0 w-full h-24 bg-blue-500/20 -translate-y-1/2" />
                                <div className="absolute top-0 left-1/2 w-24 h-full bg-blue-500/20 -translate-x-1/2" />
                            </div>

                            {/* Intersection Labels & Densities */}
                            <div className="grid grid-cols-3 grid-rows-3 gap-8 text-center w-full max-w-md">
                                <div />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">North Lane</span>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${density[0]}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <span className="text-lg font-mono font-bold text-blue-400">{density[0]}<span className="text-xs text-white/20 ml-1">v/h</span></span>
                                </div>
                                <div />

                                <div className="flex flex-col items-center justify-center gap-2 pr-4">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">West Lane</span>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${density[3]}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <span className="text-lg font-mono font-bold text-blue-400">{density[3]}<span className="text-xs text-white/20 ml-1">v/h</span></span>
                                </div>

                                <div className="flex items-center justify-center relative">
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-2xl border border-blue-500/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                        <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
                                        {/* Dynamic Signal Indicator */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${activeSignal === 0 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${activeSignal === 0 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="absolute top-1/2 -left-12 -translate-y-1/2 flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${activeSignal === 1 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${activeSignal === 1 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2 pl-4 text-left">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">East Lane</span>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${density[1]}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <span className="text-lg font-mono font-bold text-blue-400">{density[1]}<span className="text-xs text-white/20 ml-1">v/h</span></span>
                                </div>

                                <div />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-lg font-mono font-bold text-blue-400">{density[2]}<span className="text-xs text-white/20 ml-1">v/h</span></span>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${density[2]}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">South Lane</span>
                                </div>
                                <div />
                            </div>
                        </div>
                    </div>

                    {/* 2. Rewards Loop Graph */}
                    <div className="glass-panel p-6 border-blue-500/20">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none">Reinforcement Learning Reward</h2>
                                    <p className="text-xs text-white/40 mt-1">Goal: Minimize average waiting time across all lanes.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-mono font-bold text-blue-400">88.4%</span>
                                <p className="text-[10px] text-white/20 uppercase font-extrabold">Model Accuracy</p>
                            </div>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={rewards}>
                                    <defs>
                                        <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#ffffff20"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff20"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#001f54', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="reward"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorReward)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Brain Decision Logs & Controls */}
                <div className="space-y-6">
                    {/* Action Logs */}
                    <div className="glass-panel p-6 border-blue-500/20 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold">Inference Engine Logs</h2>
                        </div>

                        <div className="space-y-4 flex-1">
                            <AnimatePresence mode='popLayout'>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white/80">{log.action}</span>
                                            <span className="text-[10px] text-white/20">{log.time}</span>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/20 px-2 py-1 rounded text-[10px] font-mono font-bold text-green-400">
                                            {log.reward}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/40">Decision Latency</span>
                                <span className="text-sm font-mono text-blue-400">12ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/40">Exploration Rate</span>
                                <span className="text-sm font-mono text-blue-400">0.02</span>
                            </div>
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40">
                                <Activity className="w-4 h-4" />
                                OPTIMIZE NOW
                            </button>
                        </div>
                    </div>

                    {/* System Parameters */}
                    <div className="glass-panel p-6 border-blue-500/20">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Neural Parameters</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/60">Learning Rate</span>
                                    <span className="text-blue-400">0.001</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[40%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/60">Gamma (Discount)</span>
                                    <span className="text-blue-400">0.99</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[99%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIAgent;
