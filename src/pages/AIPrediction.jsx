import React, { useState, useMemo } from 'react';
import {
    BrainCircuit,
    TrendingUp,
    AlertTriangle,
    Clock,
    Activity,
    Compass,
    Navigation,
    Shield,
    Siren,
    Car,
    Sliders,
    Sparkles,
    Calendar,
    Download,
    RefreshCw,
    Layers,
    Flame,
    BarChart3,
    Cpu,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Radio,
    MapPin,
    FileText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart
} from 'recharts';
import {
    PREDICTIVE_HOURLY_DATA,
    PEAK_HOURS_DATA,
    ACCIDENT_PREDICTION_ZONES,
    EMERGENCY_DEMAND_FORECAST,
    TRAVEL_TIME_PREDICTIONS,
    SIGNAL_TIMING_PREDICTIONS,
    generateHeatmapMatrix,
    ML_MODEL_METRICS
} from '../services/aiPredictionService';

const AIPrediction = () => {
    // Horizon Selector: '1h', '6h', '24h', '7d'
    const [horizon, setHorizon] = useState('24h');
    // Corridor Filter: 'all', 'cp', 'ito', 'aiims', 'dhaula'
    const [selectedCorridor, setSelectedCorridor] = useState('all');

    // Tab Navigation: 'forecasts', 'peak_travel', 'accidents_emergency', 'heatmap', 'ml_reports'
    const [activeTab, setActiveTab] = useState('forecasts');

    // Heatmap Matrix
    const heatmap = useMemo(() => generateHeatmapMatrix(), []);

    // Toast feedback
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Export ML Report
    const handleExportMLReport = () => {
        const reportData = {
            system: "ITMS AI Neural Predictive Engine",
            timestamp: new Date().toISOString(),
            metrics: ML_MODEL_METRICS,
            predictions: {
                hourly_forecast: PREDICTIVE_HOURLY_DATA,
                peak_hours: PEAK_HOURS_DATA,
                accident_risk_zones: ACCIDENT_PREDICTION_ZONES,
                travel_times: TRAVEL_TIME_PREDICTIONS,
                signal_timing: SIGNAL_TIMING_PREDICTIONS
            }
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ITMS_ML_Prediction_Report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("📥 Machine Learning Forecast Report Exported Successfully!");
    };

    // Helper for Heatmap Cell Color
    const getHeatmapColor = (density) => {
        if (density >= 90) return 'bg-red-600/90 text-white';
        if (density >= 75) return 'bg-orange-500/80 text-white';
        if (density >= 60) return 'bg-amber-500/70 text-black font-semibold';
        if (density >= 40) return 'bg-yellow-500/50 text-black';
        if (density >= 25) return 'bg-emerald-600/50 text-white';
        return 'bg-emerald-800/30 text-white/70';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Feedback Toast */}
            {toastMessage && (
                <div className="fixed top-20 right-8 z-50 bg-slate-900 border border-blue-500/50 shadow-2xl text-white px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-top-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* Top Command Bar */}
            <div className="glass-panel p-6 border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl">
                            <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    AI Traffic Prediction & Forecasting Engine
                                </h1>
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                                    ST-GNN + Bi-LSTM (R²: 0.942)
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                Predictive neural modeling: Congestion saturation, peak hours, collision probabilities, travel times & Webster signal timings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Horizon & Export Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Horizon Selector */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1 text-xs">
                        <span className="text-[10px] font-mono text-white/40 px-2 uppercase">Horizon:</span>
                        {[
                            { id: '1h', label: '1 Hour' },
                            { id: '6h', label: '6 Hours' },
                            { id: '24h', label: '24 Hours' },
                            { id: '7d', label: '7 Days' }
                        ].map(h => (
                            <button
                                key={h.id}
                                onClick={() => setHorizon(h.id)}
                                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                                    horizon === h.id
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-white/60 hover:text-white"
                                }`}
                            >
                                {h.label}
                            </button>
                        ))}
                    </div>

                    {/* Corridor Selector */}
                    <select
                        value={selectedCorridor}
                        onChange={(e) => setSelectedCorridor(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    >
                        <option value="all">All Delhi Corridors</option>
                        <option value="cp">Connaught Place Outer</option>
                        <option value="ito">ITO Major Junction</option>
                        <option value="aiims">AIIMS Ring Road</option>
                        <option value="dhaula">Dhaula Kuan Interchange</option>
                    </select>

                    {/* Export ML Report */}
                    <button
                        onClick={handleExportMLReport}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4 text-purple-400" />
                        Export ML Report
                    </button>
                </div>
            </div>

            {/* Predictive Telemetry KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Peak Hour Surge</span>
                    <div className="text-xl font-black text-white">18:30 - 20:00</div>
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                        <ArrowUpRight className="w-3 h-3" /> 98% Surge Probability
                    </span>
                </div>

                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Max Volume Forecast</span>
                    <div className="text-xl font-black text-white">2,360 <span className="text-xs font-normal text-white/40">veh/hr</span></div>
                    <span className="text-[10px] text-purple-400 font-mono">ITO Corridor Focus</span>
                </div>

                <div className="glass-panel p-4 border-red-500/20 bg-red-500/[0.03] space-y-1">
                    <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider">Collision Risk Index</span>
                    <div className="text-xl font-black text-red-400">84 <span className="text-xs font-normal text-red-300">/ 100</span></div>
                    <span className="text-[10px] text-red-400/80 font-mono">Barakhamba Critical</span>
                </div>

                <div className="glass-panel p-4 border-emerald-500/20 bg-emerald-500/[0.03] space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">Emergency Demand</span>
                    <div className="text-xl font-black text-emerald-400">14 Calls <span className="text-xs font-normal text-emerald-300">/24h</span></div>
                    <span className="text-[10px] text-emerald-400/80 font-mono">AIIMS Green Wave Ready</span>
                </div>

                <div className="glass-panel p-4 border-blue-500/20 bg-blue-500/[0.03] space-y-1 col-span-2 md:col-span-1">
                    <span className="text-[10px] font-mono text-blue-400/70 uppercase tracking-wider">Travel Time Saved</span>
                    <div className="text-xl font-black text-blue-300">-13.5 <span className="text-xs font-normal text-blue-200">mins</span></div>
                    <span className="text-[10px] text-blue-400/80 font-mono">Via Predictive Split</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
                {[
                    { id: 'forecasts', label: 'Volume & Congestion Forecasts', icon: TrendingUp },
                    { id: 'peak_travel', label: 'Peak Hours & Travel Times', icon: Clock },
                    { id: 'accidents_emergency', label: 'Accidents & Emergency Demand', icon: AlertTriangle },
                    { id: 'heatmap', label: '24x7 Congestion Heatmap Matrix', icon: Flame },
                    { id: 'ml_reports', label: 'Machine Learning Diagnostics', icon: Cpu }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
                                isActive
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-500/50"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB 1: VOLUME & CONGESTION FORECASTS                          */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'forecasts' && (
                <div className="space-y-6">
                    {/* 24-Hour Projected Volume Area Chart with Confidence Bands */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                    24-Hour Vehicle Volume Forecast (ST-GNN Model vs Actual)
                                </h3>
                                <p className="text-xs text-white/50">
                                    Continuous neural prediction with 95% Upper and Lower Confidence Interval bounds.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono">
                                <span className="flex items-center gap-1.5 text-purple-300">
                                    <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Predicted Volume
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-300">
                                    <span className="w-2.5 h-2.5 rounded bg-blue-400" /> Recorded Baseline
                                </span>
                            </div>
                        </div>

                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PREDICTIVE_HOURLY_DATA}>
                                    <defs>
                                        <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} fontStyle="italic" />
                                    <YAxis stroke="#ffffff40" fontSize={11} domain={[0, 2600]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                                        labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="confidence_high" stroke="none" fill="#9333ea" fillOpacity={0.1} />
                                    <Area type="monotone" dataKey="predicted_volume" stroke="#a855f7" strokeWidth={2.5} fill="url(#predictedGrad)" />
                                    <Area type="monotone" dataKey="volume" stroke="#38bdf8" strokeWidth={2} fill="url(#actualGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Congestion Index & Predicted Queue Length Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 border-white/10 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-400" />
                                Predictive Congestion Saturation Index (%)
                            </h3>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={PREDICTIVE_HOURLY_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} />
                                        <YAxis stroke="#ffffff40" fontSize={10} domain={[0, 100]} unit="%" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                                        />
                                        <Line type="monotone" dataKey="predicted_congestion" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 3 }} name="Predicted Saturation %" />
                                        <Line type="monotone" dataKey="congestion" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 4" name="Baseline %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-panel p-6 border-white/10 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Car className="w-5 h-5 text-blue-400" />
                                Predicted Queue Length Spikes (Meters)
                            </h3>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={PREDICTIVE_HOURLY_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} />
                                        <YAxis stroke="#ffffff40" fontSize={10} unit="m" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="queue_m" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Queue Length (m)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: PEAK HOURS & TRAVEL TIME PROJECTIONS                   */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'peak_travel' && (
                <div className="space-y-6">
                    {/* Peak Hours Probability Chart */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    Peak Hour Probability Distribution (Machine Learning Forecast)
                                </h3>
                                <p className="text-xs text-white/50">Surge probability across daily transit windows.</p>
                            </div>
                            <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold rounded-full">
                                EVENING PEAK CRITICAL: 16:30 - 20:30
                            </span>
                        </div>

                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PEAK_HOURS_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="window" stroke="#ffffff40" fontSize={10} />
                                    <YAxis stroke="#ffffff40" fontSize={10} domain={[0, 100]} unit="%" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="probability" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Surge Likelihood %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Travel Time & Corridor Delay Projections Table */}
                    <div className="glass-panel border-white/10 overflow-hidden space-y-4 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Navigation className="w-5 h-5 text-emerald-400" />
                                    Corridor Travel Time Projections & AI Optimization Gain
                                </h3>
                                <p className="text-xs text-white/50">
                                    Comparative trip duration: Off-Peak vs Predicted Peak vs With AI Adaptive Green Wave.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Route Corridor</th>
                                        <th className="p-3">Distance</th>
                                        <th className="p-3">Normal Trip</th>
                                        <th className="p-3">Predicted Peak</th>
                                        <th className="p-3">With AI Timing</th>
                                        <th className="p-3">Time Saved</th>
                                        <th className="p-3">Primary Bottleneck</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-white/80">
                                    {TRAVEL_TIME_PREDICTIONS.map((r, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02]">
                                            <td className="p-3 font-bold text-white font-sans">{r.route}</td>
                                            <td className="p-3 text-white/60">{r.distance_km} km</td>
                                            <td className="p-3 text-emerald-400">{r.off_peak_mins} mins</td>
                                            <td className="p-3 text-red-400 font-bold">{r.predicted_peak_mins} mins</td>
                                            <td className="p-3 text-purple-300 font-bold">{r.with_ai_timing_mins} mins</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                                                    -{r.time_saved_mins} mins
                                                </span>
                                            </td>
                                            <td className="p-3 text-white/50 font-sans">{r.bottleneck}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Predictive Webster Signal Timing Table */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-blue-400" />
                            Predicted Optimal Webster Signal Timings for Upcoming Peak
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {SIGNAL_TIMING_PREDICTIONS.map((s, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white">{s.junction}</span>
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                                            {s.expectedDelayReduction} delay drop
                                        </span>
                                    </div>
                                    <div className="space-y-1 font-mono text-[11px] text-white/70">
                                        <p>Current Cycle: <strong className="text-white">{s.currentCycle}s</strong> ({s.currentSplit})</p>
                                        <p>AI Predicted Optimal: <strong className="text-purple-300">{s.predictedOptimalCycle}s</strong> ({s.predictedSplit})</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: ACCIDENTS & EMERGENCY DEMAND MODELING                  */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'accidents_emergency' && (
                <div className="space-y-6">
                    {/* Accident Collision Risk Zones */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Multi-Factor Collision Risk Modeling (LightGBM Classifier)
                                </h3>
                                <p className="text-xs text-white/50">
                                    Corridor risk scoring based on density, speed divergence, road curvature, and pedestrian interactions.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {ACCIDENT_PREDICTION_ZONES.map((zone, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-sm">{zone.corridor}</span>
                                        <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg ${
                                            zone.risk_score >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                            zone.risk_score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        }`}>
                                            Risk: {zone.risk_score}/100
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <p className="text-white/60">Key Factor: <strong className="text-white">{zone.primaryFactor}</strong></p>
                                        <p className="text-white/60">Predicted Incidents: <strong className="text-amber-300 font-mono">{zone.predictedAccidents24h} / 24h</strong></p>
                                    </div>

                                    {/* Factor Sliders */}
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/50">
                                        <div>Density: {zone.factors.density}%</div>
                                        <div>Speed Variance: {zone.factors.speedVariance}%</div>
                                        <div>Curvature: {zone.factors.curvature}%</div>
                                        <div>Pedestrians: {zone.factors.pedestrianVolume}%</div>
                                    </div>

                                    <div className="p-2.5 bg-black/40 rounded-xl text-[11px] text-white/80 border border-white/5">
                                        <span className="font-bold text-blue-400">AI Preventive Recommendation:</span> {zone.preventiveAction}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Demand Forecast */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Siren className="w-5 h-5 text-red-400" />
                            Emergency Demand & Green Corridor Readiness Forecast
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {EMERGENCY_DEMAND_FORECAST.map((em, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-sm">{em.zone}</span>
                                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                            em.greenWaveReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                        }`}>
                                            {em.greenWaveReady ? 'GREEN CORRIDOR READY' : 'PREEMPTION STANDBY'}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-white/70">
                                        <p>Projected Calls (24h): <strong className="text-white font-mono">{em.callsPredicted24h} Dispatches</strong></p>
                                        <p>Primary Unit: {em.primaryNeed}</p>
                                        <p>Transit Delay Mitigation: <strong className="text-emerald-400 font-mono">-{em.corridorDelayReduction}</strong></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: 24x7 CONGESTION HEATMAP MATRIX                         */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'heatmap' && (
                <div className="glass-panel p-6 border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-400" />
                                24x7 Spatio-Temporal Congestion Heatmap Matrix
                            </h3>
                            <p className="text-xs text-white/50">
                                Hourly density matrix (Hour of Day vs Day of Week) predicting citywide congestion patterns.
                            </p>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-800/40" /> &lt;25%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/50" /> 40-60%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/80" /> 75-90%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600" /> &gt;90%</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center text-xs font-mono border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left text-white/40 uppercase text-[10px]">Day \ Hour</th>
                                    {heatmap.hours.map(h => (
                                        <th key={h} className="p-2 text-white/50 text-[10px]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {heatmap.days.map(d => (
                                    <tr key={d}>
                                        <td className="p-2 text-left font-bold text-white text-xs">{d}</td>
                                        {heatmap.densityMap[d].map((val, idx) => (
                                            <td key={idx} className="p-1">
                                                <div
                                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer shadow-sm ${getHeatmapColor(val)}`}
                                                    title={`${d} at ${heatmap.hours[idx]}: ${val}% Congestion`}
                                                >
                                                    {val}%
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: MACHINE LEARNING REPORTS & HISTORICAL ANALYSIS         */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'ml_reports' && (
                <div className="space-y-6">
                    {/* Model Evaluation Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-panel p-4 border-white/10 space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Accuracy (R² Score)</span>
                            <div className="text-2xl font-black text-purple-400">{ML_MODEL_METRICS.r2_score}</div>
                            <span className="text-[10px] text-white/50 font-mono">R-Squared Metric</span>
                        </div>

                        <div className="glass-panel p-4 border-white/10 space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Mean Absolute Error</span>
                            <div className="text-2xl font-black text-white">{ML_MODEL_METRICS.mae}</div>
                            <span className="text-[10px] text-white/50 font-mono">Volume deviation</span>
                        </div>

                        <div className="glass-panel p-4 border-white/10 space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Root Mean Square Error</span>
                            <div className="text-2xl font-black text-white">{ML_MODEL_METRICS.rmse}</div>
                            <span className="text-[10px] text-white/50 font-mono">Vehicles / min</span>
                        </div>

                        <div className="glass-panel p-4 border-white/10 space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Training Volume</span>
                            <div className="text-2xl font-black text-emerald-400">1.84M</div>
                            <span className="text-[10px] text-white/50 font-mono">Telemetry Frames</span>
                        </div>
                    </div>

                    {/* Feature Importances Breakdown */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-400" />
                            Neural Feature Importances & Weight Allocation
                        </h3>
                        <div className="space-y-3">
                            {ML_MODEL_METRICS.feature_importances.map((f, i) => (
                                <div key={i} className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-white/80 font-sans">{f.feature}</span>
                                        <span className="font-mono text-purple-300 font-bold">{f.importance}% Weight</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full"
                                            style={{ width: `${f.importance * 2.5}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historical Analysis Benchmarks */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            Historical Intervention Effectiveness (30-Day Analysis)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                <span className="text-white/40 uppercase text-[10px]">Travel Time Reduction</span>
                                <div className="text-lg font-bold text-emerald-400">{ML_MODEL_METRICS.historical_benchmarks.baseline_travel_time_reduction}</div>
                                <span className="text-[9px] text-white/50">Compared to static timing</span>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                <span className="text-white/40 uppercase text-[10px]">Fuel Savings</span>
                                <div className="text-lg font-bold text-emerald-400">{ML_MODEL_METRICS.historical_benchmarks.fuel_consumption_savings}</div>
                                <span className="text-[9px] text-white/50">Reduced idling stop-and-go</span>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                <span className="text-white/40 uppercase text-[10px]">CO2 Emissions Mitigated</span>
                                <div className="text-lg font-bold text-emerald-400">{ML_MODEL_METRICS.historical_benchmarks.emission_reduction_tons_co2}</div>
                                <span className="text-[9px] text-white/50">Environmental gain</span>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                <span className="text-white/40 uppercase text-[10px]">Accident False Positives</span>
                                <div className="text-lg font-bold text-blue-400">{ML_MODEL_METRICS.historical_benchmarks.false_positive_accident_alerts}</div>
                                <span className="text-[9px] text-white/50">Precision threshold</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPrediction;
