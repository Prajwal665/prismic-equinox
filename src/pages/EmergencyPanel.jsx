import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Siren,
    ShieldAlert,
    MapPin,
    ArrowRight,
    Power,
    Lock,
    Unlock,
    Radio,
    Clock
} from 'lucide-react';

const EmergencyAlert = ({ type, location, time, severity = "high" }) => (
    <div className={`emergency-alert p-4 rounded-lg flex items-start gap-4 mb-4 ${severity === 'high' ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'}`}>
        <div className={`p-2 rounded-lg ${severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
            {type === 'accident' ? <AlertTriangle className="w-5 h-5" /> : <Siren className="w-5 h-5" />}
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <h4 className="font-bold uppercase tracking-wide text-sm">
                    {type === 'accident' ? 'Accident Detected' : 'Emergency Vehicle Detected'}
                </h4>
                <span className="text-[10px] opacity-60 font-mono">{time}</span>
            </div>
            <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {location}
            </p>
            <div className="flex gap-2 mt-3">
                <button className="text-[10px] font-bold uppercase px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors">Route Map</button>
                <button className="text-[10px] font-bold uppercase px-2 py-1 bg-emergency text-white rounded hover:bg-red-600 transition-colors whitespace-nowrap">Priority Override</button>
            </div>
        </div>
    </div>
);

const SignalControl = ({ id, name, status, timeRemaining, congestion }) => {
    const [locked, setLocked] = useState(true);

    return (
        <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="font-bold text-sm tracking-tight">{name}</h4>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">JUNCTION ID: {id}</span>
                </div>
                <button
                    onClick={() => setLocked(!locked)}
                    className={`p-2 rounded-lg transition-colors ${locked ? 'bg-white/5 text-white/40' : 'bg-green-500/20 text-green-500'}`}
                >
                    {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-end gap-6 mb-6">
                <div className="flex flex-col gap-2">
                    <div className={`w-8 h-8 rounded-full border-2 ${status === 'red' ? 'bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-red-900/30 border-transparent'}`}></div>
                    <div className={`w-8 h-8 rounded-full border-2 ${status === 'yellow' ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-yellow-900/30 border-transparent'}`}></div>
                    <div className={`w-8 h-8 rounded-full border-2 ${status === 'green' ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-green-900/30 border-transparent'}`}></div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase mb-1">
                        <span>Timer</span>
                        <span>Congestion</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-mono font-bold">{timeRemaining.toString().padStart(2, '0')}s</span>
                        <div className="text-right">
                            <span className={`text-xs font-bold ${congestion > 70 ? 'text-red-500' : 'text-green-500'}`}>{congestion}%</span>
                            <div className="w-16 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emergency" style={{ width: `${congestion}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    disabled={locked}
                    className="flex items-center justify-center gap-2 py-2 rounded bg-red-500 text-white text-xs font-bold uppercase transition-all hover:bg-red-600 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    Force Red
                </button>
                <button
                    disabled={locked}
                    className="flex items-center justify-center gap-2 py-2 rounded bg-green-500 text-white text-xs font-bold uppercase transition-all hover:bg-green-600 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    Force Green
                </button>
            </div>
        </div>
    );
};

const EmergencyPanel = () => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Emergency Response</h2>
                <p className="text-white/50">Priority overrides and accident detection center</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Active Alerts */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Radio className="w-5 h-5 text-emergency" shrink={0} />
                            Live Alerts
                        </h3>
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">2 ACTIVE</span>
                    </div>

                    <EmergencyAlert
                        type="ambulance"
                        location="Sector 12 / Ring Road"
                        time="2 mins ago"
                    />
                    <EmergencyAlert
                        type="accident"
                        location="West Highway Ramp"
                        time="5 mins ago"
                    />

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 font-mono">Incident History</h4>
                        <div className="space-y-4 opacity-50">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
                                    <span className="flex items-center gap-2">
                                        <ShieldAlert className="w-3 h-3" /> Fire Brigade Departs
                                    </span>
                                    <span className="font-mono">14:2{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Signal Controls */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <Power className="w-5 h-5 text-green-500" />
                            Critical Junction Override
                        </h3>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-white/50">
                                <Clock className="w-3 h-3" /> Auto-sync: ON
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SignalControl
                            id="J-402"
                            name="North Gate Crossing"
                            status="red"
                            timeRemaining={42}
                            congestion={85}
                        />
                        <SignalControl
                            id="J-108"
                            name="Main Market Square"
                            status="green"
                            timeRemaining={15}
                            congestion={32}
                        />
                        <SignalControl
                            id="J-771"
                            name="Expressway Exit"
                            status="yellow"
                            timeRemaining={3}
                            congestion={92}
                        />
                        <SignalControl
                            id="J-224"
                            name="Station Road"
                            status="green"
                            timeRemaining={58}
                            congestion={14}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyPanel;
