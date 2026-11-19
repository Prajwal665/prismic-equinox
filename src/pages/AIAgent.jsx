import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Cpu,
    Zap,
    Activity,
    TrendingUp,
    Car,
    Clock,
    ShieldCheck,
    AlertCircle,
    Siren,
    Sliders,
    Timer,
    Layers,
    Lock,
    Unlock,
    RefreshCw,
    Play,
    Pause,
    ArrowRight,
    History,
    Sparkles,
    Radio,
    CheckCircle2,
    RotateCcw,
    Gauge,
    Flame
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const AIAgent = () => {
    // Active Tab in Module: 'optimizer' | 'prediction' | 'history' | 'neural'
    const [activeTab, setActiveTab] = useState('optimizer');

    // -----------------------------------------------------------------------
    // INPUTS: Vehicle Count, Traffic Density, Emergency Vehicle, Queue, Peak
    // -----------------------------------------------------------------------
    const [approachData, setApproachData] = useState({
        north: { name: 'North Approach (Sector 12)', vehicleCount: 48, density: 64, queueLengthM: 38.5, saturated: true },
        south: { name: 'South Approach (Ring Road)', vehicleCount: 56, density: 78, queueLengthM: 52.0, saturated: true },
        east: { name: 'East Approach (Rajiv Chowk)', vehicleCount: 26, density: 42, queueLengthM: 18.0, saturated: false },
        west: { name: 'West Approach (Connaught Pl)', vehicleCount: 32, density: 48, queueLengthM: 24.5, saturated: false }
    });

    const [emergencyActive, setEmergencyActive] = useState(false);
    const [emergencyLane, setEmergencyLane] = useState('south');
    const [emergencyVehicleType, setEmergencyVehicleType] = useState('Ambulance #AMB-108');
    const [peakHourMode, setPeakHourMode] = useState('evening'); // 'morning' | 'evening' | 'offpeak'

    // -----------------------------------------------------------------------
    // OUTPUTS: Signal Timing, Adaptive Timer, Green Corridor, Override
    // -----------------------------------------------------------------------
    // Phase: 0 = North-South Green, 1 = North-South Yellow, 2 = East-West Green, 3 = East-West Yellow
    const [currentPhase, setCurrentPhase] = useState(0);
    const [adaptiveSecondsLeft, setAdaptiveSecondsLeft] = useState(38);
    const [isManualOverride, setIsManualOverride] = useState(false);
    const [forcedDirection, setForcedDirection] = useState(null); // 'north' | 'south' | 'east' | 'west' | null

    // Signal Split Durations (Calculated by Webster's Method)
    const [signalTimings, setSignalTimings] = useState({
        northSouthGreen: 45,
        northSouthYellow: 4,
        eastWestGreen: 28,
        eastWestYellow: 4,
        totalCycleLength: 81
    });

    // -----------------------------------------------------------------------
    // PREDICTIONS & HISTORICAL DATA
    // -----------------------------------------------------------------------
    const [predictionData, setPredictionData] = useState([
        { time: 'Now', actual: 162, predicted: 162, cycleTime: 81 },
        { time: '+15m', actual: null, predicted: 194, cycleTime: 95 },
        { time: '+30m', actual: null, predicted: 220, cycleTime: 110 },
        { time: '+45m', actual: null, predicted: 185, cycleTime: 90 },
        { time: '+60m', actual: null, predicted: 140, cycleTime: 75 }
    ]);

    const [historicalOptimizations, setHistoricalOptimizations] = useState([
        { id: 'opt-1', time: '19:40:12', approach: 'South Corridor', trigger: 'Queue Exceeded 45m', action: 'Green Extension +14s', delayReduction: '-42%', reward: '+18.4' },
        { id: 'opt-2', time: '19:35:45', approach: 'All Junctions', trigger: 'Peak Hour Transition', action: 'Webster Cycle Recalibration (81s)', delayReduction: '-28%', reward: '+14.2' },
        { id: 'opt-3', time: '19:28:10', approach: 'North Approach', trigger: 'Platoon Wave Arrival', action: 'Split Offset Advance +8s', delayReduction: '-35%', reward: '+16.8' },
        { id: 'opt-4', time: '19:15:30', approach: 'South Corridor', trigger: 'Emergency Vehicle Cleared', action: 'Green Corridor Fast-Flush', delayReduction: '-88%', reward: '+32.0' }
    ]);

    // Preserved Reinforcement Learning Rewards & Action Logs
    const [rewards, setRewards] = useState([
        { time: '0s', reward: 40 },
        { time: '10s', reward: 45 },
        { time: '20s', reward: 55 },
        { time: '30s', reward: 52 },
        { time: '40s', reward: 68 },
        { time: '50s', reward: 75 },
        { time: '60s', reward: 88 }
    ]);

    // -----------------------------------------------------------------------
    // ADAPTIVE SIGNAL TIMING ALGORITHM (Webster's Formulation)
    // -----------------------------------------------------------------------
    const recalculateAdaptiveTimings = (peakMode = peakHourMode, isEmergency = emergencyActive) => {
        if (isEmergency) {
            // Emergency Corridor Preemption
            setSignalTimings({
                northSouthGreen: emergencyLane === 'north' || emergencyLane === 'south' ? 90 : 10,
                northSouthYellow: 3,
                eastWestGreen: emergencyLane === 'east' || emergencyLane === 'west' ? 90 : 10,
                eastWestYellow: 3,
                totalCycleLength: 106
            });
            return;
        }

        // Standard Webster Calculation:
        // Critical lane flow ratios: q / s (saturation flow s = 1800 vphg)
        const nsVolume = approachData.north.vehicleCount + approachData.south.vehicleCount;
        const ewVolume = approachData.east.vehicleCount + approachData.west.vehicleCount;

        const peakFactor = peakMode === 'evening' ? 1.25 : peakMode === 'morning' ? 1.2 : 0.9;
        const q_ns = nsVolume * 15 * peakFactor;
        const q_ew = ewVolume * 15 * peakFactor;

        const y1 = Math.min(0.48, q_ns / 3600);
        const y2 = Math.min(0.42, q_ew / 3600);
        const Y = Math.min(0.85, y1 + y2);

        const L = 12; // Total lost time (amber + startup)
        const optimalCycle = Math.min(140, Math.max(60, Math.round((1.5 * L + 5) / (1 - Y))));

        const effectiveGreen = optimalCycle - L;
        const nsGreen = Math.round((y1 / Y) * effectiveGreen);
        const ewGreen = effectiveGreen - nsGreen;

        setSignalTimings({
            northSouthGreen: Math.max(25, nsGreen),
            northSouthYellow: 4,
            eastWestGreen: Math.max(20, ewGreen),
            eastWestYellow: 4,
            totalCycleLength: optimalCycle
        });
    };

    // Live Adaptive Countdown Clock Loop
    useEffect(() => {
        const timer = setInterval(() => {
            if (isManualOverride) return;

            setAdaptiveSecondsLeft(prev => {
                if (prev <= 1) {
                    // Phase switch logic
                    if (emergencyActive) {
                        // Hold green for emergency corridor
                        return 45;
                    }

                    setCurrentPhase(current => {
                        const nextPhase = (current + 1) % 4;
                        // Determine duration of next phase
                        if (nextPhase === 0) return signalTimings.northSouthGreen;
                        if (nextPhase === 1) return signalTimings.northSouthYellow;
                        if (nextPhase === 2) return signalTimings.eastWestGreen;
                        return signalTimings.eastWestYellow;
                    });

                    // Set next phase timer
                    if (currentPhase === 0) return signalTimings.northSouthYellow;
                    if (currentPhase === 1) return signalTimings.eastWestGreen;
                    if (currentPhase === 2) return signalTimings.eastWestYellow;
                    return signalTimings.northSouthGreen;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentPhase, signalTimings, emergencyActive, isManualOverride]);

    // Background Telemetry & Demand Fluctuation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (isManualOverride) return;

            setApproachData(prev => {
                const deltaN = Math.floor(Math.random() * 7) - 3;
                const deltaS = Math.floor(Math.random() * 7) - 3;
                const deltaE = Math.floor(Math.random() * 5) - 2;
                const deltaW = Math.floor(Math.random() * 5) - 2;

                const nextN = Math.max(15, Math.min(85, prev.north.vehicleCount + deltaN));
                const nextS = Math.max(20, Math.min(95, prev.south.vehicleCount + deltaS));
                const nextE = Math.max(10, Math.min(60, prev.east.vehicleCount + deltaE));
                const nextW = Math.max(12, Math.min(65, prev.west.vehicleCount + deltaW));

                return {
                    north: { ...prev.north, vehicleCount: nextN, density: Math.min(100, Math.floor(nextN * 1.3)), queueLengthM: Number((nextN * 0.8).toFixed(1)) },
                    south: { ...prev.south, vehicleCount: nextS, density: Math.min(100, Math.floor(nextS * 1.35)), queueLengthM: Number((nextS * 0.9).toFixed(1)) },
                    east: { ...prev.east, vehicleCount: nextE, density: Math.min(100, Math.floor(nextE * 1.5)), queueLengthM: Number((nextE * 0.65).toFixed(1)) },
                    west: { ...prev.west, vehicleCount: nextW, density: Math.min(100, Math.floor(nextW * 1.45)), queueLengthM: Number((nextW * 0.75).toFixed(1)) },
                };
            });

            // Update rewards graph
            setRewards(prev => {
                const last = prev[prev.length - 1];
                const newReward = Math.min(98, Math.max(45, parseFloat(last.reward) + (Math.random() * 8 - 3)));
                return [...prev.slice(1), { time: `${parseInt(last.time) + 10}s`, reward: Number(newReward.toFixed(1)) }];
            });

        }, 4000);

        return () => clearInterval(interval);
    }, [isManualOverride]);

    // Trigger Emergency Green Corridor
    const handleTriggerEmergencyCorridor = (lane = 'south', vType = 'Ambulance #AMB-108') => {
        setEmergencyActive(true);
        setEmergencyLane(lane);
        setEmergencyVehicleType(vType);

        // Preempt signal phase immediately to Green on approaching lane
        if (lane === 'north' || lane === 'south') {
            setCurrentPhase(0);
        } else {
            setCurrentPhase(2);
        }
        setAdaptiveSecondsLeft(60);
        recalculateAdaptiveTimings(peakHourMode, true);

        // Log to historical optimization table
        const newLog = {
            id: `opt-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            approach: `${lane.toUpperCase()} Corridor`,
            trigger: `Emergency Vehicle: ${vType}`,
            action: 'Emergency Green Corridor Priority Triggered',
            delayReduction: '-92%',
            reward: '+35.0'
        };
        setHistoricalOptimizations(prev => [newLog, ...prev.slice(0, 9)]);
    };

    const handleClearEmergencyCorridor = () => {
        setEmergencyActive(false);
        setAdaptiveSecondsLeft(30);
        recalculateAdaptiveTimings(peakHourMode, false);
    };

    // Manual Override Controls
    const handleManualForceGreen = (direction) => {
        setIsManualOverride(true);
        setForcedDirection(direction);

        if (direction === 'north' || direction === 'south') {
            setCurrentPhase(0);
        } else {
            setCurrentPhase(2);
        }
        setAdaptiveSecondsLeft(99);
    };

    const handleRevertToAI = () => {
        setIsManualOverride(false);
        setForcedDirection(null);
        recalculateAdaptiveTimings(peakHourMode, emergencyActive);
        setAdaptiveSecondsLeft(signalTimings.northSouthGreen);
    };

    const totalVehicles = approachData.north.vehicleCount + approachData.south.vehicleCount + approachData.east.vehicleCount + approachData.west.vehicleCount;
    const avgDensity = Math.round((approachData.north.density + approachData.south.density + approachData.east.density + approachData.west.density) / 4);
    const maxQueue = Math.max(approachData.north.queueLengthM, approachData.south.queueLengthM, approachData.east.queueLengthM, approachData.west.queueLengthM);

    // Active Signal Visuals
    const isNorthSouthGreen = currentPhase === 0;
    const isNorthSouthYellow = currentPhase === 1;
    const isEastWestGreen = currentPhase === 2;
    const isEastWestYellow = currentPhase === 3;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-blue-500" />
                        AI Traffic Signal Optimization Module
                    </h1>
                    <p className="text-white/50 text-sm mt-0.5">
                        Autonomous Adaptive Signal Control System (ASCT) using Webster's flow models, multi-lane queues, and emergency preemption.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Mode Toggle Button: AI Autonomous vs Manual Override */}
                    <button
                        onClick={isManualOverride ? handleRevertToAI : () => handleManualForceGreen('south')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                            isManualOverride
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                    >
                        {isManualOverride ? <Unlock size={14} /> : <Lock size={14} />}
                        <span>{isManualOverride ? 'Manual Override: ACTIVE' : 'Autonomous AI: ACTIVE'}</span>
                    </button>

                    {/* Emergency Preemption Status Pill */}
                    <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 ${
                        emergencyActive
                            ? 'bg-red-500/20 border-red-500/50 text-red-200 animate-pulse'
                            : 'bg-navy-800 border-white/10 text-white/80'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${emergencyActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                        <span className="font-mono text-xs font-bold uppercase">
                            {emergencyActive ? 'Corridor Preempted' : 'Normal Grid'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Emergency Corridor Active Warning Banner */}
            <AnimatePresence>
                {emergencyActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-red-500 text-white animate-bounce">
                                <Siren size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                    🚨 Emergency Green Wave Corridor Active
                                    <span className="text-[10px] bg-red-500 text-white font-mono px-2 py-0.5 rounded font-black">
                                        PRIORITY OVERRIDE
                                    </span>
                                </h3>
                                <p className="text-xs text-red-200/80 mt-0.5">
                                    Preemption locked on <strong>{emergencyLane.toUpperCase()} Approach</strong> for {emergencyVehicleType}. All conflicting signal heads held at RED.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClearEmergencyCorridor}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase transition-colors shrink-0"
                        >
                            Release Preemption
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Tabs within Signal Module */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                {[
                    { id: 'optimizer', label: 'Adaptive Signal Optimizer', icon: Timer },
                    { id: 'prediction', label: 'Demand Prediction Engine', icon: TrendingUp },
                    { id: 'history', label: 'Historical Optimization & Savings', icon: History },
                    { id: 'neural', label: 'Neural RL Learning Loop', icon: Brain }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* =============================================================== */}
            {/* TAB 1: ADAPTIVE SIGNAL OPTIMIZER (Live Inputs & Outputs)        */}
            {/* =============================================================== */}
            {activeTab === 'optimizer' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT (2 Cols): Live Intersection Visualization & Signal Output */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Live Signal Heads & Adaptive Countdown */}
                        <div className="glass-panel p-6 border-blue-500/20 bg-blue-500/[0.02]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Timer className="w-5 h-5 text-blue-400" />
                                        Adaptive Intersection Signal Output
                                    </h2>
                                    <p className="text-xs text-white/50">
                                        Cycle Length: <strong className="text-white font-mono">{signalTimings.totalCycleLength}s</strong> | Split: NS {signalTimings.northSouthGreen}s / EW {signalTimings.eastWestGreen}s
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-navy-950 border border-white/20 text-center min-w-[110px]">
                                        <span className="text-[10px] text-white/40 uppercase font-bold block">Adaptive Clock</span>
                                        <span className="text-2xl font-mono font-black text-emerald-400">
                                            {adaptiveSecondsLeft}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* High-Tech 4-Way Intersection Diagram with Active Signal Heads */}
                            <div className="relative h-[380px] bg-navy-950/80 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                                {/* Asphalt Cross Roads */}
                                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-40 bg-zinc-900 border-x border-zinc-700/50" />
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-40 bg-zinc-900 border-y border-zinc-700/50" />

                                {/* Road Dividers & Markings */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-r border-dashed border-yellow-400/60" />
                                <div className="absolute left-0 right-0 top-1/2 h-0.5 border-b border-dashed border-yellow-400/60" />

                                {/* Center Hub / AI Controller Unit */}
                                <div className="relative z-10 w-24 h-24 rounded-2xl bg-navy-900 border-2 border-blue-500/60 flex flex-col items-center justify-center p-2 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                                    <Brain className="w-7 h-7 text-blue-400 animate-pulse" />
                                    <span className="text-[8px] font-mono text-white/50 uppercase font-bold mt-1">ITMS-ASCT</span>
                                </div>

                                {/* NORTH SIGNAL & METRICS */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
                                    <div className="p-2 bg-black/90 border border-white/20 rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <div className={`w-3.5 h-3.5 rounded-full ${!isNorthSouthGreen && !isNorthSouthYellow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isNorthSouthYellow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-yellow-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isNorthSouthGreen ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-emerald-950/40'}`} />
                                    </div>
                                    <span className="text-[10px] font-bold font-mono text-blue-300 bg-black/80 px-2 py-0.5 rounded">
                                        NORTH: {approachData.north.vehicleCount}v | {approachData.north.queueLengthM}m
                                    </span>
                                </div>

                                {/* SOUTH SIGNAL & METRICS */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
                                    <span className="text-[10px] font-bold font-mono text-blue-300 bg-black/80 px-2 py-0.5 rounded">
                                        SOUTH: {approachData.south.vehicleCount}v | {approachData.south.queueLengthM}m
                                    </span>
                                    <div className="p-2 bg-black/90 border border-white/20 rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <div className={`w-3.5 h-3.5 rounded-full ${!isNorthSouthGreen && !isNorthSouthYellow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isNorthSouthYellow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-yellow-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isNorthSouthGreen ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-emerald-950/40'}`} />
                                    </div>
                                </div>

                                {/* WEST SIGNAL & METRICS */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20">
                                    <span className="text-[10px] font-bold font-mono text-blue-300 bg-black/80 px-2 py-0.5 rounded">
                                        WEST: {approachData.west.vehicleCount}v
                                    </span>
                                    <div className="p-2 bg-black/90 border border-white/20 rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <div className={`w-3.5 h-3.5 rounded-full ${!isEastWestGreen && !isEastWestYellow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isEastWestYellow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-yellow-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isEastWestGreen ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-emerald-950/40'}`} />
                                    </div>
                                </div>

                                {/* EAST SIGNAL & METRICS */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20">
                                    <span className="text-[10px] font-bold font-mono text-blue-300 bg-black/80 px-2 py-0.5 rounded">
                                        EAST: {approachData.east.vehicleCount}v
                                    </span>
                                    <div className="p-2 bg-black/90 border border-white/20 rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <div className={`w-3.5 h-3.5 rounded-full ${!isEastWestGreen && !isEastWestYellow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isEastWestYellow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-yellow-950/40'}`} />
                                        <div className={`w-3.5 h-3.5 rounded-full ${isEastWestGreen ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-emerald-950/40'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approach Inputs Matrix: Counts, Densities, Queues */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(approachData).map(([key, app]) => (
                                <div key={key} className="glass-panel p-4 border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                                            <Car size={14} className="text-blue-400" />
                                            {app.name}
                                        </span>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                            app.density > 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {app.density}% Density
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs font-mono">
                                        <div className="flex justify-between text-white/60 text-[11px]">
                                            <span>Vehicles: <strong className="text-white font-bold">{app.vehicleCount}</strong></span>
                                            <span>Queue: <strong className="text-white font-bold">{app.queueLengthM}m</strong></span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${app.density > 70 ? 'bg-red-500' : app.density > 45 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                                                style={{ width: `${app.density}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action buttons per approach */}
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => handleManualForceGreen(key)}
                                            className="flex-1 py-1 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase text-emerald-300 transition-colors"
                                        >
                                            Force Green
                                        </button>
                                        <button
                                            onClick={() => handleTriggerEmergencyCorridor(key, 'Ambulance #AMB-108')}
                                            className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase text-red-300 transition-colors flex items-center gap-1"
                                        >
                                            <Siren size={10} /> Preempt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT (1 Col): Module Controls, Peak Hours, Manual Overrides */}
                    <div className="space-y-6">
                        {/* 1. Peak Hours Selector (Input Factor) */}
                        <div className="glass-panel p-5 border-blue-500/20 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <Clock size={14} className="text-blue-400" />
                                Demand Profile (Peak Hours Input)
                            </h3>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {[
                                    { id: 'morning', label: 'Morning Peak', desc: '08:00 - 11:00' },
                                    { id: 'evening', label: 'Evening Rush', desc: '17:00 - 20:00' },
                                    { id: 'offpeak', label: 'Off-Peak / Eco', desc: 'Normalized' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setPeakHourMode(p.id);
                                            recalculateAdaptiveTimings(p.id, emergencyActive);
                                        }}
                                        className={`p-2.5 rounded-xl border text-center transition-all ${
                                            peakHourMode === p.id
                                                ? 'bg-blue-600/30 border-blue-400 text-white font-bold ring-1 ring-blue-400'
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="block text-[11px] font-bold">{p.label}</span>
                                        <span className="block text-[9px] text-white/40 mt-0.5">{p.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Manual Override Command Panel */}
                        <div className="glass-panel p-5 border-amber-500/20 bg-amber-500/[0.02] space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-2">
                                    <Sliders size={14} className="text-amber-400" />
                                    Operator Manual Override
                                </h3>
                                {isManualOverride && (
                                    <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded font-black uppercase">
                                        OVERRIDE ENGAGED
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    onClick={() => handleManualForceGreen('north')}
                                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
                                >
                                    Force North Green
                                </button>
                                <button
                                    onClick={() => handleManualForceGreen('south')}
                                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
                                >
                                    Force South Green
                                </button>
                                <button
                                    onClick={() => handleManualForceGreen('east')}
                                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
                                >
                                    Force East Green
                                </button>
                                <button
                                    onClick={() => handleManualForceGreen('west')}
                                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
                                >
                                    Force West Green
                                </button>
                            </div>

                            <button
                                onClick={handleRevertToAI}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
                            >
                                <RotateCcw size={14} />
                                Revert to AI Adaptive Control
                            </button>
                        </div>

                        {/* 3. Emergency Vehicle Preemption Trigger */}
                        <div className="glass-panel p-5 border-red-500/20 bg-red-500/[0.02] space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-red-300 flex items-center gap-2">
                                <Siren size={14} className="text-red-400" />
                                Emergency Green Wave Corridor
                            </h3>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                Instantly flush intersection queues for incoming emergency responders using Section 194E preemption protocols.
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleTriggerEmergencyCorridor('south', 'Ambulance #AMB-108')}
                                    className="py-2.5 px-3 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-950/50"
                                >
                                    🚑 South Ambulance
                                </button>
                                <button
                                    onClick={() => handleTriggerEmergencyCorridor('north', 'Fire Tender #FT-04')}
                                    className="py-2.5 px-3 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-950/50"
                                >
                                    🚒 North Fire Engine
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================================================== */}
            {/* TAB 2: DEMAND PREDICTION ENGINE                                 */}
            {/* =============================================================== */}
            {activeTab === 'prediction' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel p-6 border-blue-500/20 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                    Traffic Demand & Cycle Length Forecast (+60 mins)
                                </h2>
                                <p className="text-xs text-white/50">
                                    Neural sequence prediction anticipating platoon arrivals to preemptively adjust cycle lengths.
                                </p>
                            </div>
                            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                Model Confidence: 94.2%
                            </span>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictionData}>
                                    <defs>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#ffffff30" fontSize={11} />
                                    <YAxis stroke="#ffffff30" fontSize={11} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#001f54', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPredicted)" name="Predicted Volume (vph)" />
                                    <Line type="monotone" dataKey="cycleTime" stroke="#10b981" strokeWidth={2} name="Recommended Cycle (s)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center text-xs">
                            <div className="p-3 bg-white/5 rounded-xl">
                                <span className="text-white/40 block text-[10px] uppercase font-bold">Predicted Peak In</span>
                                <span className="text-lg font-mono font-bold text-yellow-400">+30 mins</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <span className="text-white/40 block text-[10px] uppercase font-bold">Projected Max Volume</span>
                                <span className="text-lg font-mono font-bold text-white">220 v/15min</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <span className="text-white/40 block text-[10px] uppercase font-bold">Preemptive Cycle Length</span>
                                <span className="text-lg font-mono font-bold text-emerald-400">110 seconds</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 border-blue-500/20 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                                Predictive Interventions
                            </h3>
                            <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                                <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                                    <p className="font-bold text-blue-300 mb-1">Pre-clearing Wave Formation</p>
                                    <p className="text-[11px] text-white/60">
                                        At T+25m, incoming Ring Road surge will be mitigated by extending South green split by +18s before queue reaches threshold.
                                    </p>
                                </div>
                                <div className="p-3.5 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                                    <p className="font-bold text-emerald-300 mb-1">Downstream Offset Coordination</p>
                                    <p className="text-[11px] text-white/60">
                                        Intersection B4 (Rajiv Chowk) will align its green phase 12s downstream to accept the cleared platoon without spillback.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-950 rounded-xl border border-white/10 mt-6 text-center">
                            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Self-Healing Prediction</span>
                            <span className="text-sm font-bold text-emerald-400">Auto-Offset Synchronization: ACTIVE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================================================== */}
            {/* TAB 3: HISTORICAL OPTIMIZATION & EFFICIENCY SAVINGS              */}
            {/* =============================================================== */}
            {activeTab === 'history' && (
                <div className="space-y-6">
                    {/* Efficiency KPI Benchmark: Fixed vs Adaptive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-panel p-5 border-emerald-500/20 text-center">
                            <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Average Delay Reduction</span>
                            <span className="text-3xl font-mono font-bold text-emerald-400">-38.4%</span>
                            <span className="text-[10px] text-white/40 block mt-1">48s $\rightarrow$ 29.5s per vehicle</span>
                        </div>
                        <div className="glass-panel p-5 border-blue-500/20 text-center">
                            <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Daily Fuel Waste Saved</span>
                            <span className="text-3xl font-mono font-bold text-blue-400">185 L</span>
                            <span className="text-[10px] text-white/40 block mt-1">Idle reduction at junctions</span>
                        </div>
                        <div className="glass-panel p-5 border-emerald-500/20 text-center">
                            <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Queue Clearance Speed</span>
                            <span className="text-3xl font-mono font-bold text-emerald-400">+42%</span>
                            <span className="text-[10px] text-white/40 block mt-1">Faster platoon discharge</span>
                        </div>
                        <div className="glass-panel p-5 border-purple-500/20 text-center">
                            <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Carbon Emissions Reduced</span>
                            <span className="text-3xl font-mono font-bold text-purple-400">-22.1%</span>
                            <span className="text-[10px] text-white/40 block mt-1">320 kg CO2 / day avoided</span>
                        </div>
                    </div>

                    {/* Historical Optimizations Decision Log Table */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <History size={18} className="text-blue-400" />
                                Historical Signal Optimization Events
                            </h3>
                            <span className="text-xs font-mono text-white/40">Real-time Decision Stream</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-white/5 text-[10px] font-bold uppercase text-white/40 border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Approach</th>
                                        <th className="p-3">Trigger Event</th>
                                        <th className="p-3">Optimization Action</th>
                                        <th className="p-3">Delay Reduction</th>
                                        <th className="p-3">RL Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {historicalOptimizations.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors text-white/80">
                                            <td className="p-3 text-white/40">{log.time}</td>
                                            <td className="p-3 text-blue-300 font-bold">{log.approach}</td>
                                            <td className="p-3 text-white/70">{log.trigger}</td>
                                            <td className="p-3 text-white font-semibold">{log.action}</td>
                                            <td className="p-3 text-emerald-400 font-bold">{log.delayReduction}</td>
                                            <td className="p-3 text-yellow-400 font-bold">{log.reward}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================================================== */}
            {/* TAB 4: REINFORCEMENT LEARNING NEURAL PARAMETERS (Preserved Core)*/}
            {/* =============================================================== */}
            {activeTab === 'neural' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel p-6 border-blue-500/20 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none">Reinforcement Learning Reward Curve</h2>
                                    <p className="text-xs text-white/40 mt-1">Q-Learning Policy Reward Optimization across all approaches.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-mono font-bold text-blue-400">91.2%</span>
                                <p className="text-[10px] text-white/20 uppercase font-extrabold">Model Convergence</p>
                            </div>
                        </div>

                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={rewards}>
                                    <defs>
                                        <linearGradient id="colorReward2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} />
                                    <YAxis stroke="#ffffff20" fontSize={10} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#001f54', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="reward" stroke="#3b82f6" strokeWidth={3} fill="url(#colorReward2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-panel p-6 border-blue-500/20 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Neural Parameters</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-white/60">Learning Rate (Alpha)</span>
                                        <span className="text-blue-400">0.001</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[40%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-white/60">Gamma (Discount Factor)</span>
                                        <span className="text-blue-400">0.99</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[99%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-white/60">Exploration (Epsilon)</span>
                                        <span className="text-blue-400">0.02</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[12%]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 border-blue-500/20">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Model Convergence</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-white/60">
                                    <span>Decision Latency:</span>
                                    <span className="font-mono text-emerald-400 font-bold">&lt; 12ms</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Reward Function:</span>
                                    <span className="font-mono text-blue-300">Min(Delay + StopRate)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAgent;
