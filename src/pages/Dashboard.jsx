import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Users,
    Activity,
    MapPin,
    TrafficCone,
    AlertCircle,
    Timer,
    Car,
    Wind,
    BarChart3,
    Video,
    Cpu,
    Eye,
    Layers,
    Gauge,
    Zap,
    Database,
    Download,
    RefreshCw,
    Sliders,
    Shield,
    Radio,
    Play,
    Pause,
    CheckCircle2,
    Compass,
    Navigation,
    BrainCircuit,
    Sparkles,
    TrendingUp,
    Siren,
    Clock,
    ArrowUpRight,
    Server,
    HardDrive,
    Wifi,
    WifiOff,
    Volume2,
    VolumeX,
    Maximize2,
    Camera,
    Receipt,
    IndianRupee,
    AlertTriangle,
    Filter,
    Globe,
    Terminal,
    Network,
    Smartphone,
    Check,
    Bell
} from 'lucide-react';
import TrafficMap from '../components/TrafficMap';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LineChart,
    Line,
    ComposedChart,
    Legend
} from 'recharts';
import {
    getStoredAnalytics,
    saveAnalyticsRecord,
    INITIAL_YOLO_CLASSES,
    INITIAL_LANE_METRICS
} from '../services/yoloAnalyticsService';
import {
    PREDICTIVE_HOURLY_DATA,
    PEAK_HOURS_DATA,
    ACCIDENT_PREDICTION_ZONES,
    EMERGENCY_DEMAND_FORECAST,
    TRAVEL_TIME_PREDICTIONS,
    SIGNAL_TIMING_PREDICTIONS,
    ML_MODEL_METRICS
} from '../services/aiPredictionService';

// Real-time Telemetry Initial Window (10 ticks)
const INITIAL_REALTIME_STREAM = [
    { time: '11:00:00', volume: 3820, density: 52, speed: 42.5, violations: 18, latency: 11.2 },
    { time: '11:01:00', volume: 3950, density: 54, speed: 41.8, violations: 22, latency: 11.5 },
    { time: '11:02:00', volume: 4100, density: 57, speed: 39.4, violations: 24, latency: 11.1 },
    { time: '11:03:00', volume: 4280, density: 61, speed: 38.0, violations: 28, latency: 12.0 },
    { time: '11:04:00', volume: 4420, density: 64, speed: 36.2, violations: 31, latency: 11.8 },
    { time: '11:05:00', volume: 4610, density: 68, speed: 34.5, violations: 36, latency: 12.4 },
    { time: '11:06:00', volume: 4790, density: 71, speed: 33.1, violations: 40, latency: 12.8 },
    { time: '11:07:00', volume: 4850, density: 69, speed: 34.0, violations: 38, latency: 11.9 },
    { time: '11:08:00', volume: 4920, density: 72, speed: 32.8, violations: 42, latency: 12.1 },
    { time: '11:09:00', volume: 4892, density: 70, speed: 33.5, violations: 39, latency: 11.4 }
];

// Violation Categories Breakdown
const VIOLATION_BREAKDOWN_DATA = [
    { category: 'Red Light Jump', count: 142, fine: 1000, revenue: 142000, color: '#ef4444' },
    { category: 'Overspeeding', count: 118, fine: 2000, revenue: 236000, color: '#f59e0b' },
    { category: 'No Helmet / Seatbelt', count: 56, fine: 1000, revenue: 56000, color: '#3b82f6' },
    { category: 'Triple Riding', count: 16, fine: 1000, revenue: 16000, color: '#a855f7' },
    { category: 'Wrong Way Driving', count: 10, fine: 5000, revenue: 50000, color: '#ec4899' },
];

// Initial Live System Activity Feed
const INITIAL_ACTIVITY_LOG = [
    { id: 'act-1', time: '11:09:12', type: 'violation', title: 'Challan #DL-2026-9841 Issued', desc: 'Red light jump at ITO Junction (DL 01 AB 1234)', severity: 'warning' },
    { id: 'act-2', time: '11:08:45', type: 'emergency', title: 'Green Wave Preemption Active', desc: 'Corridor cleared for Ambulance AMB-104 towards AIIMS Trauma', severity: 'critical' },
    { id: 'act-3', time: '11:07:55', type: 'camera', title: 'CAM-108 Signal Re-established', desc: 'Bitrate normalized to 14.2 Mbps over 5.8 GHz mesh', severity: 'normal' },
    { id: 'act-4', time: '11:06:30', type: 'officer', title: 'Patrol PCR #12 Dispatched', desc: 'Assigned to Barakhamba radial congestion hotspot', severity: 'info' },
    { id: 'act-5', time: '11:05:18', type: 'system', title: 'YOLOv8 Adaptive Cycle Optimized', desc: 'CP Circle signal phase extended +20s for Southbound surge', severity: 'normal' },
    { id: 'act-6', time: '11:03:50', type: 'violation', title: 'Challan #DL-2026-9840 Issued', desc: 'Speed violation (88 km/h in 50 zone) on Ring Road Slip', severity: 'warning' },
    { id: 'act-7', time: '11:02:11', type: 'system', title: 'Database Sync Completed', desc: 'Batch sync of 1,240 detection records to SQLite repository', severity: 'normal' },
];

const Dashboard = ({ onNavigate }) => {
    // Current UTC / IST Clock State
    const [currentTime, setCurrentTime] = useState(new Date());

    // Control Room Active View Tab: 'overview' | 'vision' | 'map' | 'servers' | 'enforcement'
    const [controlRoomTab, setControlRoomTab] = useState('overview');

    // Simulation & Command Modes: 'normal' | 'peak' | 'emergency'
    const [commandMode, setCommandMode] = useState('normal');
    const [audioMuted, setAudioMuted] = useState(true);

    // YOLOv8 Real-Time State
    const [yoloClasses, setYoloClasses] = useState(INITIAL_YOLO_CLASSES);
    const [laneMetrics, setLaneMetrics] = useState(INITIAL_LANE_METRICS);
    const [totalVehicles, setTotalVehicles] = useState(4892);
    const [trafficDensity, setTrafficDensity] = useState(58);
    const [avgSpeed, setAvgSpeed] = useState(38.5);
    const [queueLength, setQueueLength] = useState(21.4);
    const [congestionLevel, setCongestionLevel] = useState('Moderate');
    const [avgConfidence, setAvgConfidence] = useState(94.8);
    const [isLiveInference, setIsLiveInference] = useState(true);
    const [selectedJunction, setSelectedJunction] = useState('Sector 12 - North Crossing');
    const [dbHistory, setDbHistory] = useState(getStoredAnalytics);
    const [exportNotice, setExportNotice] = useState(null);

    // Enterprise Widgets State
    const [activeCameras, setActiveCameras] = useState({ online: 142, total: 148, streamingGbps: 1.42, offline: 2, maintenance: 4 });
    const [onlineOfficers, setOnlineOfficers] = useState({ count: 48, pcrs: 18, interceptors: 24, checkpoints: 6, avgEtaMins: 3.8 });
    const [violationsToday, setViolationsToday] = useState(342);
    const [fineCollectedToday, setFineCollectedToday] = useState(486500);
    const [cameraHealthIndex, setCameraHealthIndex] = useState(98.4);
    const [systemHealth, setSystemHealth] = useState({ gpuLoad: 64, gpuTemp: 58, cpuLoad: 34, ramGb: 22.4, ramTotal: 64, fps: 89.2 });
    const [serverStatus, setServerStatus] = useState({ primary: 'ONLINE', pingMs: 14, edgeNodes: '28/28', uptime: '99.99%', syncPercent: 100 });
    const [activeUsers, setActiveUsers] = useState({ total: 26, controllers: 8, supervisors: 14, engineers: 4 });

    // Realtime Charts Data Stream
    const [realtimeStream, setRealtimeStream] = useState(INITIAL_REALTIME_STREAM);

    // Activity Feed & Filter
    const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOG);
    const [activityFilter, setActivityFilter] = useState('all');

    // Live Clock Ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Command Mode Impact
    useEffect(() => {
        if (commandMode === 'peak') {
            setTrafficDensity(84);
            setTotalVehicles(prev => Math.max(prev, 6200));
            setAvgSpeed(22.4);
            setQueueLength(48.2);
            setCongestionLevel('Heavy');
        } else if (commandMode === 'emergency') {
            setTrafficDensity(62);
            setAvgSpeed(44.0);
            setQueueLength(12.5);
            setCongestionLevel('Priority Clearance');
        } else {
            setTrafficDensity(58);
            setAvgSpeed(38.5);
            setQueueLength(21.4);
            setCongestionLevel('Moderate');
        }
    }, [commandMode]);

    // Dynamic YOLOv8 Telemetry Simulation Loop & Database sync
    useEffect(() => {
        if (!isLiveInference) return;

        const interval = setInterval(() => {
            const deltaCars = Math.floor(Math.random() * 5) - 2;
            const deltaBikes = Math.floor(Math.random() * 5) - 2;
            const deltaAutos = Math.floor(Math.random() * 3) - 1;

            setYoloClasses(prev => {
                const nextCars = Math.max(12, Math.min(38, prev.cars + deltaCars));
                const nextBikes = Math.max(8, Math.min(28, prev.bikes + deltaBikes));
                const nextAutos = Math.max(4, Math.min(18, prev.auto + deltaAutos));
                const nextTotal = nextCars + nextBikes + prev.bus + prev.truck + nextAutos;

                const baseDensity = commandMode === 'peak' ? 84 : commandMode === 'emergency' ? 62 : 58;
                const nextDensity = Math.min(96, Math.max(25, baseDensity + Math.floor(Math.random() * 6 - 3)));
                const nextSpeed = Math.max(15, Math.min(65, 55 - (nextDensity * 0.4) + (Math.random() * 3 - 1.5)));
                const nextQueue = Math.max(5, Math.min(80, (nextDensity * 0.42) + (Math.random() * 3 - 1.5)));
                const nextCongestion = nextDensity > 75 ? 'Heavy' : nextDensity > 45 ? 'Moderate' : 'Low';

                setTotalVehicles(prevVeh => prevVeh + (Math.floor(Math.random() * 7) - 3));
                setTrafficDensity(nextDensity);
                setAvgSpeed(Number(nextSpeed.toFixed(1)));
                setQueueLength(Number(nextQueue.toFixed(1)));
                setCongestionLevel(nextCongestion);
                setAvgConfidence(Number((94 + Math.random() * 3.5).toFixed(1)));

                // Update lane distributions
                setLaneMetrics({
                    lane1: { name: 'Lane 1 (Left / Turn)', count: Math.floor(nextTotal * 0.3), density: Math.floor(nextDensity * 0.85), speed: Number((nextSpeed * 0.95).toFixed(1)), queue_m: Number((nextQueue * 0.7).toFixed(1)) },
                    lane2: { name: 'Lane 2 (Center / Through)', count: Math.floor(nextTotal * 0.45), density: nextDensity, speed: Number((nextSpeed * 0.85).toFixed(1)), queue_m: Number(nextQueue.toFixed(1)) },
                    lane3: { name: 'Lane 3 (Right / Express)', count: Math.floor(nextTotal * 0.25), density: Math.floor(nextDensity * 0.65), speed: Number((nextSpeed * 1.15).toFixed(1)), queue_m: Number((nextQueue * 0.4).toFixed(1)) }
                });

                // Periodic telemetry record
                if (Math.random() > 0.65) {
                    const newRecord = {
                        id: `rec-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(),
                        junction_id: selectedJunction,
                        total_vehicles: nextTotal,
                        cars: nextCars,
                        bikes: nextBikes,
                        bus: prev.bus,
                        truck: prev.truck,
                        auto: nextAutos,
                        pedestrians: prev.pedestrians,
                        emergency_vehicles: prev.emergency_vehicles,
                        traffic_lights: commandMode === 'emergency' ? 'GREEN-CORRIDOR' : 'GREEN',
                        lane1_count: Math.floor(nextTotal * 0.3),
                        lane2_count: Math.floor(nextTotal * 0.45),
                        lane3_count: Math.floor(nextTotal * 0.25),
                        avg_speed_kmh: Number(nextSpeed.toFixed(1)),
                        density_percent: nextDensity,
                        congestion_level: nextCongestion,
                        queue_length_m: Number(nextQueue.toFixed(1))
                    };
                    const updated = saveAnalyticsRecord(newRecord);
                    setDbHistory(updated);
                }

                // Append to real-time charts stream (sliding window of 10 points)
                setRealtimeStream(prevStream => {
                    const nowStr = new Date().toLocaleTimeString();
                    const newPoint = {
                        time: nowStr,
                        volume: 4800 + Math.floor(Math.random() * 200 - 100),
                        density: nextDensity,
                        speed: Number(nextSpeed.toFixed(1)),
                        violations: Math.floor(35 + Math.random() * 10),
                        latency: Number((11.2 + Math.random() * 1.2).toFixed(1))
                    };
                    const next = [...prevStream.slice(1), newPoint];
                    return next;
                });

                return {
                    ...prev,
                    cars: nextCars,
                    bikes: nextBikes,
                    auto: nextAutos
                };
            });
        }, 2600);

        return () => clearInterval(interval);
    }, [isLiveInference, selectedJunction, commandMode]);

    // Live Activity Stream Generation (Every 7 seconds adds new event)
    useEffect(() => {
        const activityInterval = setInterval(() => {
            const possibleEvents = [
                { type: 'violation', title: 'Challan Auto-Generated', desc: `ANPR speed breach detected at Sector 12 (${Math.floor(75 + Math.random() * 20)} km/h)`, severity: 'warning' },
                { type: 'system', title: 'YOLOv8 Latency Nominal', desc: `Frame processed in ${(10.8 + Math.random()).toFixed(1)}ms across 142 streams`, severity: 'normal' },
                { type: 'officer', title: 'Officer GPS Heartbeat', desc: `Insp. Rajesh Sharma (DL-TP-409) checked in at Connaught Place`, severity: 'info' },
                { type: 'camera', title: 'PTZ Telemetry Ping', desc: `Auto-patrol sweep completed by Camera #CAM-102`, severity: 'normal' },
                { type: 'emergency', title: 'Corridor Status Clear', desc: `AIIMS Trauma inbound lane cleared for civilian medical transfer`, severity: 'critical' }
            ];
            const randEv = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            const newAct = {
                id: `act-${Date.now()}`,
                time: new Date().toLocaleTimeString(),
                ...randEv
            };
            setActivityLogs(prev => [newAct, ...prev.slice(0, 14)]);
            
            // Randomly tick violations or fine collection
            if (randEv.type === 'violation') {
                setViolationsToday(v => v + 1);
                setFineCollectedToday(f => f + (Math.random() > 0.5 ? 1000 : 2000));
            }
        }, 7000);

        return () => clearInterval(activityInterval);
    }, []);

    // Export Database Logs
    const handleExportCSV = () => {
        const headers = ["Timestamp", "Junction", "Total", "Cars", "Bikes", "Bus", "Truck", "Auto", "Pedestrians", "Emergency", "Density %", "Avg Speed (km/h)", "Queue (m)", "Congestion"];
        const rows = dbHistory.map(r => [
            r.timestamp, r.junction_id, r.total_vehicles, r.cars, r.bikes, r.bus, r.truck, r.auto, r.pedestrians, r.emergency_vehicles, `${r.density_percent}%`, r.avg_speed_kmh, `${r.queue_length_m}m`, r.congestion_level
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ITMS_Enterprise_Analytics_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportNotice("Enterprise telemetry logs exported successfully to CSV!");
        setTimeout(() => setExportNotice(null), 3000);
    };

    // Filtered Activity Logs
    const filteredActivities = useMemo(() => {
        if (activityFilter === 'all') return activityLogs;
        return activityLogs.filter(a => a.type === activityFilter);
    }, [activityLogs, activityFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ========================================================================= */}
            {/* 1. PROFESSIONAL ENTERPRISE CONTROL ROOM TACTICAL HEADER (C4I HUD)       */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                {/* Cyber HUD Corner Elements */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                                <Terminal className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider flex items-center gap-3 uppercase font-mono">
                                        ITMS Enterprise Control Center
                                    </h1>
                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" />
                                        DEFCON 4 • OPTIMAL
                                    </span>
                                </div>
                                <p className="text-xs text-cyan-200/70 font-mono mt-1">
                                    CENTRAL C4I COMMAND • NCR TRAFFIC GRID • NODE: <span className="text-white font-bold">in-del-itms-master-01</span> • 99.99% UPTIME
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Clock & Military HUD telemetry */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Live Clock */}
                        <div className="px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl font-mono text-right shadow-inner">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Live System Time (IST)</p>
                            <p className="text-lg font-bold text-cyan-400 tracking-wider">
                                {currentTime.toLocaleTimeString()} <span className="text-xs text-white/60">IST</span>
                            </p>
                            <p className="text-[10px] text-white/50">
                                {currentTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Simulation / Command Mode Selector */}
                        <div className="flex items-center bg-black/40 border border-white/15 p-1 rounded-xl">
                            <button
                                onClick={() => setCommandMode('normal')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                    commandMode === 'normal'
                                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-md'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                Normal
                            </button>
                            <button
                                onClick={() => setCommandMode('peak')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                    commandMode === 'peak'
                                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-md'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                Peak Surge
                            </button>
                            <button
                                onClick={() => setCommandMode('emergency')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                                    commandMode === 'emergency'
                                        ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-md animate-pulse'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                <Siren size={13} className="text-red-400" />
                                Corridor
                            </button>
                        </div>

                        {/* Audio Mute & Live Inference Toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAudioMuted(!audioMuted)}
                                title={audioMuted ? "Unmute Control Room Alerts" : "Mute Alerts"}
                                className={`p-2.5 rounded-xl border transition-colors ${
                                    audioMuted
                                        ? 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                }`}
                            >
                                {audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>

                            <button
                                onClick={() => setIsLiveInference(!isLiveInference)}
                                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 border transition-all ${
                                    isLiveInference
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                }`}
                            >
                                {isLiveInference ? <Pause size={14} /> : <Play size={14} />}
                                <span>{isLiveInference ? 'YOLOv8 Active' : 'Paused'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation Action Strip */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
                    <div className="flex items-center gap-2 text-white/60">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">Tactical Shortcuts:</span>
                        <button onClick={() => onNavigate && onNavigate('cameras')} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-300 transition-colors border border-white/10 flex items-center gap-1.5">
                            <Video size={13} /> CCTV (148 Nodes)
                        </button>
                        <button onClick={() => onNavigate && onNavigate('echallan')} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-300 transition-colors border border-white/10 flex items-center gap-1.5">
                            <Receipt size={13} /> E-Challan System
                        </button>
                        <button onClick={() => onNavigate && onNavigate('officer-mobile')} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-300 transition-colors border border-white/10 flex items-center gap-1.5">
                            <Smartphone size={13} /> Officer Mobile App
                        </button>
                        <button onClick={() => onNavigate && onNavigate('map')} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-300 transition-colors border border-white/10 flex items-center gap-1.5">
                            <Navigation size={13} /> Geospatial GIS
                        </button>
                        <button onClick={() => onNavigate && onNavigate('ai-prediction')} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-300 transition-colors border border-white/10 flex items-center gap-1.5">
                            <BrainCircuit size={13} /> AI Forecasting
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-white/50">
                        <span>Cluster Nodes: <strong className="text-emerald-400">28/28 Edge Online</strong></span>
                        <span>•</span>
                        <span>WebSocket Ping: <strong className="text-cyan-400">14 ms</strong></span>
                    </div>
                </div>
            </div>

            {/* Notification alert banner */}
            {exportNotice && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>{exportNotice}</span>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 2. THE 12 ENTERPRISE CONTROL ROOM WIDGETS (ANIMATED HIGH-TECH CARDS)    */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                
                {/* WIDGET 1: Total Vehicles */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Car className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            +12.4% Surge
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Total Vehicles</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {totalVehicles.toLocaleString()}
                            <span className="text-xs font-normal text-cyan-300">veh/hr</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 truncate font-mono">
                            Cars: {yoloClasses.cars * 80} • Bikes: {yoloClasses.bikes * 60}
                        </p>
                    </div>
                </div>

                {/* WIDGET 2: Active Cameras */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Video className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            96% Online
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Active Cameras</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {activeCameras.online} <span className="text-xs font-normal text-white/40">/ {activeCameras.total}</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            {activeCameras.streamingGbps} Gbps throughput • 2 Offline
                        </p>
                    </div>
                </div>

                {/* WIDGET 3: Traffic Density */}
                <div className={`p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden ${
                    trafficDensity > 75 ? 'glass-panel-glow-red' : trafficDensity > 50 ? 'glass-panel-glow-amber' : 'glass-panel-glow-emerald'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${
                            trafficDensity > 75 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            trafficDensity > 75 ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                            {congestionLevel}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Traffic Density</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {trafficDensity}%
                            <span className="text-xs font-normal text-white/40">LOS-{trafficDensity > 70 ? 'D' : 'C'}</span>
                        </h3>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${trafficDensity > 75 ? 'bg-red-500' : trafficDensity > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${trafficDensity}%` }} />
                        </div>
                    </div>
                </div>

                {/* WIDGET 4: Online Officers */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            GPS Active
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Online Officers</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {onlineOfficers.count} <span className="text-xs font-normal text-white/40">Units</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            {onlineOfficers.pcrs} PCR Vans • {onlineOfficers.interceptors} Interceptors
                        </p>
                    </div>
                </div>

                {/* WIDGET 5: Today's Violations */}
                <div className="glass-panel-glow-red p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                            +18/hr
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Today's Violations</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {violationsToday} <span className="text-xs font-normal text-red-400">Challans</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            94.8% AI Detected • 142 Red Light
                        </p>
                    </div>
                </div>

                {/* WIDGET 6: Fine Collection */}
                <div className="glass-panel-glow-emerald p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            59.0% Paid
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Fine Collection</p>
                        <h3 className="text-2xl font-bold font-mono text-emerald-300 mt-0.5 flex items-baseline gap-1.5">
                            ₹{fineCollectedToday.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            Levied: ₹8.24L • 68% via UPI Gateway
                        </p>
                    </div>
                </div>

                {/* WIDGET 7: Camera Health */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            12ms Ping
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Camera Health</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {cameraHealthIndex}% <span className="text-xs font-normal text-emerald-400">Healthy</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            0.02% Packet Drop • 4 Maintenance
                        </p>
                    </div>
                </div>

                {/* WIDGET 8: Emergency Alerts */}
                <div className="glass-panel-glow-red p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            <Siren className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                            1 Active
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Emergency Alerts</p>
                        <h3 className="text-2xl font-bold font-mono text-red-300 mt-0.5 flex items-baseline gap-1.5">
                            Corridor #01
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            AMB-104 en-route AIIMS Trauma Center
                        </p>
                    </div>
                </div>

                {/* WIDGET 9: System Health (AI GPU & Hardware) */}
                <div className="glass-panel-glow-purple p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {systemHealth.fps} FPS
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">System Health</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {systemHealth.gpuLoad}% <span className="text-xs font-normal text-purple-300">GPU</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            CPU: {systemHealth.cpuLoad}% • RAM: {systemHealth.ramGb}GB
                        </p>
                    </div>
                </div>

                {/* WIDGET 10: Server Status */}
                <div className="glass-panel-glow-emerald p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Server className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {serverStatus.primary}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Server Status</p>
                        <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-1.5">
                            {serverStatus.uptime} <span className="text-xs font-normal text-white/40">SLA</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            Edge: {serverStatus.edgeNodes} • Hot Standby 100%
                        </p>
                    </div>
                </div>

                {/* WIDGET 11: Active Users */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            MFA TLS 1.3
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Active Users</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            {activeUsers.total} <span className="text-xs font-normal text-white/40">Operators</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            {activeUsers.controllers} HQ • {activeUsers.supervisors} Field Officers
                        </p>
                    </div>
                </div>

                {/* WIDGET 12: Incident Response Readiness */}
                <div className="glass-panel-glow-cyan p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Timer className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            &lt; 3.8m ETA
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 font-mono tracking-wider">Response Readiness</p>
                        <h3 className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                            96.2% <span className="text-xs font-normal text-emerald-300">Optimal</span>
                        </h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                            Preemption trigger: &lt; 1.2s
                        </p>
                    </div>
                </div>

            </div>

            {/* ========================================================================= */}
            {/* 3. CONTROL ROOM TELEMETRY CHARTS & RECENT ACTIVITY DUAL GRID             */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT 2 COLS: REALTIME CHARTS (Telemetry & Violation Streams) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Realtime Telemetry Multi-Stream Chart */}
                    <div className="glass-panel p-5 border-cyan-500/20 bg-navy-950/40 rounded-2xl shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                        Realtime Dynamic Traffic Telemetry Stream
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </h3>
                                    <p className="text-xs text-white/50">Live 1-sec rolling telemetry: Volume, Density % & Velocity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono">
                                <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Volume</span>
                                <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Density %</span>
                                <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Speed km/h</span>
                            </div>
                        </div>

                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={realtimeStream}>
                                    <defs>
                                        <linearGradient id="streamVolGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} fontStyle="italic" />
                                    <YAxis yAxisId="left" stroke="#ffffff30" fontSize={10} domain={[3000, 5500]} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#ffffff30" fontSize={10} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a1128', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={2} fill="url(#streamVolGrad)" name="Volume (Veh/hr)" />
                                    <Line yAxisId="right" type="monotone" dataKey="density" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Density (%)" />
                                    <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" name="Speed (km/h)" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Violations & Revenue Chart */}
                    <div className="glass-panel p-5 border-white/10 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                                    <BarChart3 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white font-mono">
                                        Today's Violation Category Distribution & Fine Levied
                                    </h3>
                                    <p className="text-xs text-white/50">Auto-detected infractions captured across 142 optical streams</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                Total Levied: ₹8,24,000
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={VIOLATION_BREAKDOWN_DATA} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                                        <XAxis type="number" stroke="#ffffff30" fontSize={10} />
                                        <YAxis dataKey="category" type="category" stroke="#ffffff60" fontSize={10} width={100} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                            {VIOLATION_BREAKDOWN_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Violation summary stats */}
                            <div className="space-y-2 text-xs font-mono flex flex-col justify-center">
                                {VIOLATION_BREAKDOWN_DATA.map((v, idx) => (
                                    <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                                            <span className="text-white/80 font-semibold">{v.category}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-bold">{v.count} cases</span>
                                            <span className="text-emerald-400 font-bold">₹{v.revenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COL: RECENT ACTIVITY LIVE LOG FEED (WIDGET 12) */}
                <div className="glass-panel p-5 border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                        Recent Activity
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] text-white/50">Live enterprise event dispatcher</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                Live Feed
                            </span>
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[10px] font-mono">
                            {['all', 'violation', 'emergency', 'officer', 'camera', 'system'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActivityFilter(cat)}
                                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                                        activityFilter === cat
                                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold'
                                            : 'bg-white/5 text-white/50 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Scrolling feed items */}
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 mt-2">
                            {filteredActivities.map((act) => (
                                <div
                                    key={act.id}
                                    className={`p-3 rounded-xl border text-xs font-mono transition-all hover:translate-x-1 ${
                                        act.severity === 'critical'
                                            ? 'bg-red-500/10 border-red-500/30 text-red-200'
                                            : act.severity === 'warning'
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                                : act.severity === 'info'
                                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                                                    : 'bg-white/5 border-white/10 text-white/80'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-white flex items-center gap-1.5">
                                            {act.severity === 'critical' && <Siren size={12} className="text-red-400 animate-pulse" />}
                                            {act.severity === 'warning' && <AlertTriangle size={12} className="text-amber-400" />}
                                            {act.title}
                                        </span>
                                        <span className="text-[10px] text-white/40">{act.time}</span>
                                    </div>
                                    <p className="text-[11px] text-white/70 leading-relaxed">{act.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] font-mono text-white/50 flex items-center justify-between">
                        <span>Event Dispatcher Engine:</span>
                        <span className="text-emerald-400 font-bold">100% Heartbeat Synced</span>
                    </div>
                </div>

            </div>

            {/* ========================================================================= */}
            {/* 4. AI PREDICTIVE INTELLIGENCE PANEL (PRESERVED INTEGRATION)              */}
            {/* ========================================================================= */}
            <div className="glass-panel p-6 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-navy-900/90 to-blue-950/30 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                            <BrainCircuit className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white tracking-wide">
                                    AI Predictive Intelligence & Machine Learning Forecasts
                                </h3>
                                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                    <Sparkles size={12} /> ST-GNN + Bi-LSTM
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-0.5">
                                Real-time predictive telemetry: Volume spikes, peak hour probabilities, collision hazards & Webster signal offsets.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-white/40">Model Diagnostics</p>
                            <p className="text-xs font-mono text-cyan-300 font-bold">R²: 0.942 • Accuracy: 96.4%</p>
                        </div>
                        <button
                            onClick={() => onNavigate && onNavigate('ai-prediction')}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                        >
                            <span>Open Full AI Prediction Hub</span>
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>

                {/* 4 Multi-Dimension Forecast Indicator Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    <div className="p-4 rounded-xl bg-navy-800/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white/40 font-bold uppercase text-[10px] flex items-center gap-1.5 font-mono">
                                <Clock size={12} className="text-amber-400" />
                                Peak Hour Surge
                            </span>
                            <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px]">
                                98% Prob
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">16:30 - 20:30</h4>
                        <p className="text-xs text-white/60 mt-1">Evening rush surge: <span className="text-amber-400 font-mono font-bold">+220%</span> volume load anticipated</p>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-800/80 border border-white/10 hover:border-red-500/40 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white/40 font-bold uppercase text-[10px] flex items-center gap-1.5 font-mono">
                                <AlertTriangle size={12} className="text-red-400" />
                                Accident Risk Index
                            </span>
                            <span className="text-red-400 font-mono font-bold bg-red-400/10 px-1.5 py-0.5 rounded text-[10px]">
                                High Hazard
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">84 / 100 <span className="text-xs text-white/40 font-normal">Score</span></h4>
                        <p className="text-xs text-white/60 mt-1">Barakhamba Rd • Interceptor unit #04 active</p>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-800/80 border border-white/10 hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white/40 font-bold uppercase text-[10px] flex items-center gap-1.5 font-mono">
                                <Siren size={12} className="text-emerald-400" />
                                Emergency Corridor
                            </span>
                            <span className="text-emerald-400 font-mono font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px]">
                                100% Ready
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">14 Calls <span className="text-xs text-white/40 font-normal">in 24h</span></h4>
                        <p className="text-xs text-white/60 mt-1">AIIMS Trauma green wave corridor pre-configured</p>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-800/80 border border-white/10 hover:border-blue-500/40 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white/40 font-bold uppercase text-[10px] flex items-center gap-1.5 font-mono">
                                <TrendingUp size={12} className="text-cyan-400" />
                                AI Time Savings
                            </span>
                            <span className="text-cyan-400 font-mono font-bold bg-cyan-400/10 px-1.5 py-0.5 rounded text-[10px]">
                                -28.4% Delay
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">10 - 16 Mins</h4>
                        <p className="text-xs text-white/60 mt-1">Projected commuter transit savings with adaptive splits</p>
                    </div>
                </div>

                {/* Forecast Chart & Quick Transit Projections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 relative z-10">
                    <div className="lg:col-span-2 p-4 rounded-xl bg-navy-950/60 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2 font-mono">
                                <TrendingUp size={14} className="text-cyan-400" />
                                24-Hour Projected Volume (Actual vs ST-GNN AI Forecast)
                            </h4>
                            <div className="flex items-center gap-4 text-[10px] font-mono">
                                <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Actual Flow</span>
                                <span className="flex items-center gap-1 text-cyan-300"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> AI Predicted</span>
                            </div>
                        </div>

                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PREDICTIVE_HOURLY_DATA}>
                                    <defs>
                                        <linearGradient id="actualVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="predVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} />
                                    <YAxis stroke="#ffffff30" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a1128', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                                    />
                                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#actualVolumeGrad)" name="Actual Volume" />
                                    <Area type="monotone" dataKey="predicted_volume" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" fill="url(#predVolumeGrad)" name="AI Predicted Volume" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-950/60 border border-white/10 flex flex-col justify-between">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center justify-between font-mono">
                                <span>Key Arterial Projections</span>
                                <span className="text-[10px] font-mono text-cyan-400 font-bold">Webster Splits</span>
                            </h4>
                            <div className="space-y-2.5 text-xs">
                                {TRAVEL_TIME_PREDICTIONS.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors font-mono">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-white/90 text-[11px] truncate">{item.route}</p>
                                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded">
                                                -{item.time_saved_mins}m
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-white/50">
                                            <span>Normal: <span className="line-through text-red-400">{item.predicted_peak_mins}m</span></span>
                                            <span className="text-cyan-300 font-bold">With AI: {item.with_ai_timing_mins}m</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/50">Adaptive Timing:</span>
                            <span className="text-emerald-400 font-mono font-bold">+25s Green on CP Hub</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 5. YOLOv8 NEURAL DETECTIONS GRID & LIVE VISUALIZER CANVAS                */}
            {/* ========================================================================= */}
            <div className="glass-panel p-6 border-blue-500/20 bg-blue-500/[0.02] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                                YOLOv8 Neural Vision Detection Grid
                                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                                    Conf: {avgConfidence}%
                                </span>
                            </h3>
                            <p className="text-xs text-white/50">Multi-class classification, speed tracking & lane estimation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border font-mono ${
                            congestionLevel === 'Heavy'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                                : congestionLevel === 'Moderate'
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                            Congestion: {congestionLevel}
                        </span>
                    </div>
                </div>

                {/* All 8 Required Detected Classes Grid */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 font-mono">
                        Detected Target Classes (8 Categories)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-blue-400/40 transition-colors">
                            <span className="text-lg">🚗</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Cars</p>
                            <p className="text-xl font-bold font-mono text-blue-400">{yoloClasses.cars}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.96</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-yellow-400/40 transition-colors">
                            <span className="text-lg">🏍️</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Bikes</p>
                            <p className="text-xl font-bold font-mono text-yellow-400">{yoloClasses.bikes}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.94</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-purple-400/40 transition-colors">
                            <span className="text-lg">🚌</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Bus</p>
                            <p className="text-xl font-bold font-mono text-purple-400">{yoloClasses.bus}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.97</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-orange-400/40 transition-colors">
                            <span className="text-lg">🚛</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Truck</p>
                            <p className="text-xl font-bold font-mono text-orange-400">{yoloClasses.truck}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.93</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-amber-400/40 transition-colors">
                            <span className="text-lg">🛺</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Auto</p>
                            <p className="text-xl font-bold font-mono text-amber-400">{yoloClasses.auto}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.91</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-emerald-400/40 transition-colors">
                            <span className="text-lg">🚶</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Pedestrian</p>
                            <p className="text-xl font-bold font-mono text-emerald-400">{yoloClasses.pedestrians}</p>
                            <span className="text-[9px] text-white/30 font-mono">Conf 0.89</span>
                        </div>
                        <div className="p-3 bg-red-950/40 rounded-2xl border border-red-500/40 text-center shadow-lg shadow-red-950/50 animate-pulse">
                            <span className="text-lg">🚨</span>
                            <p className="text-[10px] uppercase font-bold text-red-300 mt-1 font-mono">Emergency</p>
                            <p className="text-xl font-bold font-mono text-red-400">{yoloClasses.emergency_vehicles}</p>
                            <span className="text-[9px] bg-red-500 text-white px-1 font-bold rounded">PRIORITY</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-emerald-400/40 transition-colors">
                            <span className="text-lg">🚦</span>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 font-mono">Signal</p>
                            <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">GREEN</p>
                            <span className="text-[9px] text-white/30 font-mono">Active Phase</span>
                        </div>
                    </div>
                </div>

                {/* Multi-Lane Count & Speed Flow Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                    {Object.entries(laneMetrics).map(([key, lane]) => (
                        <div key={key} className="p-4 bg-navy-950/70 border border-white/10 rounded-2xl space-y-3 font-mono">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Layers size={14} className="text-blue-400" />
                                    {lane.name}
                                </span>
                                <span className="text-xs font-mono font-bold text-blue-300">{lane.count} Vehicles</span>
                            </div>

                            <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between text-white/60 text-[11px]">
                                    <span>Lane Density:</span>
                                    <span className="text-white font-bold">{lane.density}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${lane.density > 60 ? 'bg-red-500' : lane.density > 40 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                                        style={{ width: `${lane.density}%` }}
                                    />
                                </div>

                                <div className="flex justify-between pt-1 text-[11px]">
                                    <span className="text-white/50">Speed: <strong className="text-white font-mono">{lane.speed} km/h</strong></span>
                                    <span className="text-white/50">Queue: <strong className="text-white font-mono">{lane.queue_m} m</strong></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live YOLOv8 Annotated Bounding Box Visualizer Canvas */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black min-h-[360px] flex items-center justify-center group shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=1200&h=700&fit=crop')] bg-cover bg-center opacity-40"></div>

                    {/* Lane Segmentation Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-[33%] top-0 bottom-0 border-r-2 border-dashed border-yellow-400/50" />
                        <div className="absolute left-[66%] top-0 bottom-0 border-r-2 border-dashed border-yellow-400/50" />
                        <div className="absolute bottom-16 left-0 right-0 border-b-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        <span className="absolute bottom-18 left-4 text-[9px] font-mono text-red-400 font-bold bg-black/80 px-2 py-0.5 rounded">
                            STOP LINE (QUEUE BASELINE: {queueLength}m)
                        </span>
                    </div>

                    {/* Real-time Bounding Boxes Overlaid */}
                    <div className="absolute inset-0 pointer-events-none p-6">
                        <div className="absolute top-[35%] left-[18%] w-28 h-20 border-2 border-sky-400 rounded bg-sky-500/10 p-1 flex flex-col justify-between">
                            <span className="text-[9px] font-mono font-bold bg-sky-500 text-black px-1 rounded w-fit">
                                CAR #102 [0.96] | 38 km/h
                            </span>
                            <span className="text-[8px] text-sky-300 font-mono self-end">LANE 1</span>
                        </div>

                        <div className="absolute top-[50%] left-[42%] w-24 h-22 border-2 border-amber-400 rounded bg-amber-500/10 p-1 flex flex-col justify-between">
                            <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-1 rounded w-fit">
                                AUTO #108 [0.91] | 26 km/h
                            </span>
                            <span className="text-[8px] text-amber-200 font-mono self-end">LANE 2</span>
                        </div>

                        <div className="absolute top-[28%] left-[72%] w-32 h-26 border-2 border-red-500 rounded bg-red-500/20 p-1 flex flex-col justify-between animate-pulse">
                            <span className="text-[9px] font-mono font-bold bg-red-600 text-white px-1.5 rounded w-fit">
                                🚨 AMBULANCE [0.99] PRIORITY
                            </span>
                            <span className="text-[8px] text-red-200 font-mono self-end font-bold">54 km/h • FAST TRACK</span>
                        </div>

                        <div className="absolute bottom-[28%] left-[22%] w-16 h-18 border-2 border-yellow-400 rounded bg-yellow-500/10 p-1 flex flex-col justify-between">
                            <span className="text-[8px] font-mono font-bold bg-yellow-400 text-black px-1 rounded w-fit">
                                BIKE [0.94]
                            </span>
                            <span className="text-[8px] text-yellow-200 font-mono self-end">42 km/h</span>
                        </div>

                        <div className="absolute top-[60%] right-[8%] w-14 h-24 border-2 border-emerald-400 rounded bg-emerald-500/10 p-1 flex flex-col justify-between">
                            <span className="text-[8px] font-mono font-bold bg-emerald-400 text-black px-1 rounded w-fit">
                                PEDESTRIAN [0.89]
                            </span>
                            <span className="text-[8px] text-emerald-200 font-mono self-end">CROSSING</span>
                        </div>
                    </div>

                    {/* HUD Header on Canvas */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono pointer-events-none z-10">
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2">
                            <Radio size={14} className="text-emerald-400 animate-pulse" />
                            <span>YOLOv8 LIVE INFERENCE • {selectedJunction}</span>
                        </div>
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-emerald-300 font-bold">
                            AVG SPEED: {avgSpeed} km/h • QUEUE: {queueLength}m
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 6. INTERACTIVE CITY TRAFFIC MAP (Leaflet GIS Grid)                       */}
            {/* ========================================================================= */}
            <div className="glass-panel p-6 border-blue-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Navigation className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                                Interactive Geospatial City Traffic Map (Leaflet GIS)
                                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                                    LIVE GPS SYNC
                                </span>
                            </h3>
                            <p className="text-xs text-white/50">
                                Real-time signals, cameras, patrol officers, congestion heatmaps & moving emergency units. (Click any marker for details)
                            </p>
                        </div>
                    </div>
                </div>

                <TrafficMap height="450px" />
            </div>

            {/* ========================================================================= */}
            {/* 7. DATABASE ANALYTICS HISTORICAL TABLE (SQLite Storage Sync)             */}
            {/* ========================================================================= */}
            <div className="glass-panel p-6 border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                                Database Telemetry History
                                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                                    SQLite Sync: Active
                                </span>
                            </h3>
                            <p className="text-xs text-white/50">Stored detection snapshots in itms_traffic_analytics.db</p>
                        </div>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto font-mono"
                    >
                        <Download size={14} />
                        Export Database CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                            <tr>
                                <th className="p-3">Time</th>
                                <th className="p-3">Junction</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Cars</th>
                                <th className="p-3">Bikes</th>
                                <th className="p-3">Bus/Truck</th>
                                <th className="p-3">Auto</th>
                                <th className="p-3">Ped</th>
                                <th className="p-3">Emerg</th>
                                <th className="p-3">Density</th>
                                <th className="p-3">Speed</th>
                                <th className="p-3">Queue</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {dbHistory.slice(0, 6).map((rec, i) => (
                                <tr key={rec.id || i} className="hover:bg-white/5 transition-colors text-white/80">
                                    <td className="p-3 text-white/50">{rec.timestamp}</td>
                                    <td className="p-3 font-semibold text-blue-300">{rec.junction_id}</td>
                                    <td className="p-3 font-bold text-white">{rec.total_vehicles}</td>
                                    <td className="p-3 text-sky-400">{rec.cars}</td>
                                    <td className="p-3 text-yellow-400">{rec.bikes}</td>
                                    <td className="p-3 text-purple-400">{rec.bus + rec.truck}</td>
                                    <td className="p-3 text-amber-400">{rec.auto}</td>
                                    <td className="p-3 text-emerald-400">{rec.pedestrians}</td>
                                    <td className="p-3">
                                        {rec.emergency_vehicles > 0 ? (
                                            <span className="text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded">
                                                {rec.emergency_vehicles}
                                            </span>
                                        ) : (
                                            <span className="text-white/30">0</span>
                                        )}
                                    </td>
                                    <td className="p-3 font-bold">{rec.density_percent}%</td>
                                    <td className="p-3 text-emerald-300">{rec.avg_speed_kmh} km/h</td>
                                    <td className="p-3 text-white/60">{rec.queue_length_m}m</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            rec.congestion_level === 'Heavy'
                                                ? 'bg-red-500/20 text-red-400'
                                                : rec.congestion_level === 'Moderate'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {rec.congestion_level}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 8. SYSTEM VITALS & HARDWARE EFFICIENCY FOOTER                            */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase">Cluster Uptime</p>
                        <p className="text-sm font-bold text-white mt-0.5">99.99% Guaranteed</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase">ANPR Recognition</p>
                        <p className="text-sm font-bold text-white mt-0.5">98.8% Accuracy</p>
                    </div>
                    <Eye className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase">Failover Standby</p>
                        <p className="text-sm font-bold text-white mt-0.5">Hot-Standby Ready</p>
                    </div>
                    <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase">Preemption Response</p>
                        <p className="text-sm font-bold text-white mt-0.5">&lt; 1.2s Optical Switch</p>
                    </div>
                    <Zap className="w-5 h-5 text-yellow-400" />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
