import React from 'react';
import { Shield, MapPin, Search, Layers, Crosshair, Navigation } from 'lucide-react';

const MapView = () => {
    return (
        <div className="h-[calc(100vh-8rem)] space-y-6 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Geospatial Tactical View</h2>
                    <p className="text-white/50">Full-scale city surveillance & traffic density mapping</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
                        <Layers className="w-4 h-4 text-emergency" shrink={0} />
                        Traffic Layer: ON
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emergency text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold shadow-lg shadow-emergency/20">
                        <Crosshair className="w-4 h-4" />
                        Target Command
                    </button>
                </div>
            </header>

            <div className="flex-1 h-full glass-panel overflow-hidden relative border border-white/20">
                <div className="absolute inset-0 bg-navy-800">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112061.05040333334!2d77.11652395!3d28.6327315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b71da69da67!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1708700000000!5m2!1sen!2sin&maptype=satellite"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="opacity-70"
                    ></iframe>

                    {/* Overlay Scanning Lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%]"></div>
                </div>

                {/* Tactical Overlays */}
                <div className="absolute top-6 left-6 flex flex-col gap-4">
                    <div className="glass-panel p-4 backdrop-blur-xl border-white/20 w-64">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Coordinate</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between font-mono text-xs">
                                <span className="text-white/30">LAT:</span>
                                <span>28.613928</span>
                            </div>
                            <div className="flex justify-between font-mono text-xs">
                                <span className="text-white/30">LON:</span>
                                <span>77.209021</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-emergency mb-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase">Current Focus</span>
                                </div>
                                <p className="text-sm font-bold">Connaught Place Central</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 w-64">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Target Units</h4>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emergency"></div>
                                        <span className="text-[10px] font-bold">AMB-0{i}</span>
                                    </div>
                                    <span className="text-[9px] text-white/40">MOVING</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                    <div className="glass-panel p-4 flex gap-8 backdrop-blur-xl pointer-events-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Data Stream</span>
                            <span className="text-lg font-bold font-mono text-emerald-400">124.8 GB/S</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">System Load</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="w-[14%] h-full bg-emerald-400"></div>
                                </div>
                                <span className="text-[10px] font-bold">14%</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 flex gap-4 pointer-events-auto">
                        <button className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                            <Navigation className="w-5 h-5 text-white/70" />
                        </button>
                        <button className="px-6 py-3 bg-white/10 rounded-lg font-bold text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">
                            Refresh Feed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;
