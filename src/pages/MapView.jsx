import React, { useState } from 'react';
import {
    Shield,
    MapPin,
    Search,
    Layers,
    Crosshair,
    Navigation,
    Compass,
    Radio,
    Activity,
    AlertTriangle,
    Siren,
    Clock,
    Flame
} from 'lucide-react';
import TrafficMap from '../components/TrafficMap';

const MapView = () => {
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* Top Command Bar */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Navigation className="w-8 h-8 text-blue-500" />
                        Geospatial Tactical Traffic Map
                    </h2>
                    <p className="text-white/50 text-sm">
                        Full-scale interactive Leaflet GIS city grid: Signals, CCTV nodes, Patrol units, Incidents & Emergency GPS tracking.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            GIS Satellites Online (12/12)
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Interactive Map & Tactical Sidebar Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Center / Left: Interactive Leaflet Map View */}
                <div className="lg:col-span-3 flex flex-col h-full rounded-2xl overflow-hidden">
                    <TrafficMap
                        height="100%"
                        onMarkerSelect={(item) => setSelectedEntity(item)}
                    />
                </div>

                {/* Right: Tactical Intel & Incident Feed */}
                <div className="space-y-4 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1">
                    {/* Live Selected Inspection Widget */}
                    {selectedEntity ? (
                        <div className="glass-panel p-5 border-blue-500/30 bg-blue-500/[0.04] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Selected Node</span>
                                <span className="text-xs font-mono font-bold text-white bg-blue-600/30 px-2 py-0.5 rounded">
                                    {selectedEntity.type.toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-white">
                                {selectedEntity.name || selectedEntity.location}
                            </h3>
                            <div className="space-y-1.5 text-xs font-mono text-white/70">
                                <div className="flex justify-between">
                                    <span className="text-white/40">Coordinates:</span>
                                    <span>{selectedEntity.lat?.toFixed(4)}° N, {selectedEntity.lng?.toFixed(4)}° E</span>
                                </div>
                                {selectedEntity.state && (
                                    <div className="flex justify-between">
                                        <span className="text-white/40">Phase State:</span>
                                        <span className="font-bold text-emerald-400">{selectedEntity.state}</span>
                                    </div>
                                )}
                                {selectedEntity.speed && (
                                    <div className="flex justify-between">
                                        <span className="text-white/40">Velocity:</span>
                                        <span className="font-bold text-emerald-400">{selectedEntity.speed}</span>
                                    </div>
                                )}
                                {selectedEntity.badge && (
                                    <div className="flex justify-between">
                                        <span className="text-white/40">Officer Badge:</span>
                                        <span className="font-bold text-sky-300">{selectedEntity.badge}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-4 text-center text-white/40 text-xs">
                            <Compass className="w-8 h-8 text-white/20 mx-auto mb-2 animate-spin" style={{ animationDuration: '20s' }} />
                            Click any marker on the map to inspect live telemetry.
                        </div>
                    )}

                    {/* Quick City Stats */}
                    <div className="glass-panel p-5 border-white/10 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Grid Telemetry</h4>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Active Signal Heads</span>
                                <span className="font-mono text-emerald-400 font-bold">5 Online</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Live CCTV Feeds</span>
                                <span className="font-mono text-blue-400 font-bold">5 Streaming</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Patrol Officers Active</span>
                                <span className="font-mono text-sky-400 font-bold">3 Units</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Emergency Convoys</span>
                                <span className="font-mono text-red-400 font-bold">2 Moving</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Active Incidents / Accidents</span>
                                <span className="font-mono text-rose-400 font-bold">1 Collision</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Road Diversions / Closures</span>
                                <span className="font-mono text-amber-400 font-bold">2 Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Emergency Units GPS Track List */}
                    <div className="glass-panel p-5 border-red-500/20 bg-red-500/[0.02] space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                                <Siren size={12} />
                                Emergency GPS Convoys
                            </h4>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                <div className="flex justify-between font-bold text-white">
                                    <span>Ambulance #AMB-108</span>
                                    <span className="text-emerald-400 font-mono">64 km/h</span>
                                </div>
                                <p className="text-[10px] text-white/50">Apollo Hospital $\rightarrow$ AIIMS Trauma</p>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold inline-block">
                                    GREEN WAVE ACTIVE
                                </span>
                            </div>

                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                <div className="flex justify-between font-bold text-white">
                                    <span>Fire Tender #FT-04</span>
                                    <span className="text-yellow-400 font-mono">52 km/h</span>
                                </div>
                                <p className="text-[10px] text-white/50">Dispatched to CP Block B</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;
