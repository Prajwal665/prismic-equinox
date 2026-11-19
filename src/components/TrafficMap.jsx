import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Layers,
    MapPin,
    AlertTriangle,
    Siren,
    Camera,
    Shield,
    Flame,
    Navigation,
    Compass,
    Activity,
    Radio,
    Clock,
    X,
    Maximize2,
    Eye,
    TrendingUp,
    Car
} from 'lucide-react';

import { INITIAL_MAP_DATA } from '../data/trafficMapData';

const TrafficMap = ({ height = "500px", onMarkerSelect, compact = false }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const heatLayerRef = useRef(null);

    // Active Layers Toggles
    const [layers, setLayers] = useState({
        signals: true,
        cameras: true,
        officers: true,
        emergencies: true,
        accidents: true,
        closures: true,
        heatmap: true
    });

    const [mapData, setMapData] = useState(INITIAL_MAP_DATA);
    const [selectedItem, setSelectedItem] = useState(null);

    // Toggle Layer Handler
    const toggleLayer = (layerName) => {
        setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
    };

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Cleanup previous instance if any
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Create Leaflet Map centered on Delhi
        const map = L.map(mapContainerRef.current, {
            center: [28.6139, 77.2090],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });
        mapInstanceRef.current = map;

        // Add OpenStreetMap Tiles with Custom Cyberpunk Dark Filter (Zero Watermark)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'map-tiles-dark'
        }).addTo(map);

        // Add Zoom Controls to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Layer groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        heatLayerRef.current = L.layerGroup().addTo(map);

        // Render markers
        renderMapLayers();

        // Invalidate size after render to fix any container resize
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Simulated Real-Time GPS Tracking of Emergency Vehicles & Patrols
    useEffect(() => {
        const interval = setInterval(() => {
            setMapData(prev => {
                const nextEmergencies = prev.emergencies.map(amb => ({
                    ...amb,
                    lat: amb.lat + (Math.random() * 0.0008 - 0.0004),
                    lng: amb.lng + (Math.random() * 0.0008 - 0.0004)
                }));

                const nextOfficers = prev.officers.map(off => ({
                    ...off,
                    lat: off.lat + (Math.random() * 0.0004 - 0.0002),
                    lng: off.lng + (Math.random() * 0.0004 - 0.0002)
                }));

                return {
                    ...prev,
                    emergencies: nextEmergencies,
                    officers: nextOfficers
                };
            });
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    // Re-render markers whenever mapData or layer toggles change
    useEffect(() => {
        renderMapLayers();
    }, [mapData, layers]);

    const renderMapLayers = () => {
        if (!mapInstanceRef.current || !markersLayerRef.current || !heatLayerRef.current) return;

        markersLayerRef.current.clearLayers();
        heatLayerRef.current.clearLayers();

        // 1. Heat Map Layer
        if (layers.heatmap) {
            mapData.heatspots.forEach(spot => {
                const circle = L.circle([spot.lat, spot.lng], {
                    radius: spot.radius,
                    fillColor: spot.color,
                    fillOpacity: 0.28,
                    stroke: true,
                    color: spot.color,
                    weight: 1.5,
                    dashArray: '4, 4'
                });
                circle.bindTooltip(`Density Hotspot: ${spot.intensity}`, { className: 'leaflet-tooltip-dark' });
                heatLayerRef.current.addLayer(circle);
            });
        }

        // 2. Traffic Signals
        if (layers.signals) {
            mapData.signals.forEach(sig => {
                const iconColor = sig.state === 'GREEN' ? '#10b981' : sig.state === 'YELLOW' ? '#f59e0b' : '#ef4444';
                const html = `
                    <div style="background-color: #0a1128; border: 2px solid ${iconColor}; border-radius: 50%; width: 34px; height: 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 14px ${iconColor}; cursor: pointer;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${iconColor}; animation: pulse 1.5s infinite;"></span>
                        <span style="font-size: 8px; font-weight: 800; color: #fff; font-family: monospace;">${sig.timeLeft}s</span>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
                const marker = L.marker([sig.lat, sig.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'signal', ...sig });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }

        // 3. Traffic Cameras
        if (layers.cameras) {
            mapData.cameras.forEach(cam => {
                const html = `
                    <div style="background-color: #001f54; border: 2px solid #3b82f6; border-radius: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(59,130,246,0.6); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
                const marker = L.marker([cam.lat, cam.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'camera', ...cam });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }

        // 4. Police Officers
        if (layers.officers) {
            mapData.officers.forEach(off => {
                const html = `
                    <div style="background-color: #032b69; border: 2px solid #38bdf8; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(56,189,248,0.5); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
                const marker = L.marker([off.lat, off.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'officer', ...off });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }

        // 5. Emergency Vehicles (GPS Animated)
        if (layers.emergencies) {
            mapData.emergencies.forEach(amb => {
                const html = `
                    <div style="position: relative; width: 36px; height: 36px; cursor: pointer;">
                        <span style="position: absolute; inset: 0; border-radius: 50%; background-color: #ef4444; opacity: 0.6; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                        <div style="position: relative; background-color: #dc2626; border: 2px solid #fff; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(239,68,68,0.9);">
                            <span style="font-size: 14px;">🚑</span>
                        </div>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
                const marker = L.marker([amb.lat, amb.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'emergency', ...amb });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }

        // 6. Accidents
        if (layers.accidents) {
            mapData.accidents.forEach(acc => {
                const html = `
                    <div style="background-color: #7f1d1d; border: 2px solid #ef4444; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(239,68,68,0.8); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
                const marker = L.marker([acc.lat, acc.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'accident', ...acc });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }

        // 7. Road Closures
        if (layers.closures) {
            mapData.closures.forEach(clo => {
                const html = `
                    <div style="background-color: #78350f; border: 2px solid #f59e0b; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(245,158,11,0.7); cursor: pointer;">
                        <span style="font-size: 14px;">🚧</span>
                    </div>
                `;
                const customIcon = L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
                const marker = L.marker([clo.lat, clo.lng], { icon: customIcon });

                marker.on('click', () => {
                    handleSelectItem({ type: 'closure', ...clo });
                });
                markersLayerRef.current.addLayer(marker);
            });
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        if (onMarkerSelect) onMarkerSelect(item);
    };

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-navy-950" style={{ height }}>
            {/* The Actual Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Scanning Radar Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,17,40,0.6)_100%)] z-10" />

            {/* Top Tactical Layer Toggles */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none flex-wrap">
                <div className="flex items-center gap-1.5 p-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl pointer-events-auto flex-wrap">
                    <button
                        onClick={() => toggleLayer('signals')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.signals ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        🚦 Signals
                    </button>
                    <button
                        onClick={() => toggleLayer('cameras')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.cameras ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        📷 Cameras
                    </button>
                    <button
                        onClick={() => toggleLayer('officers')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.officers ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        👮 Officers
                    </button>
                    <button
                        onClick={() => toggleLayer('emergencies')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.emergencies ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        🚑 Emergency
                    </button>
                    <button
                        onClick={() => toggleLayer('accidents')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.accidents ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        ⚠️ Accidents
                    </button>
                    <button
                        onClick={() => toggleLayer('closures')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.closures ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        🚧 Closures
                    </button>
                    <button
                        onClick={() => toggleLayer('heatmap')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            layers.heatmap ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        🌡️ Heatmap
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-[10px] font-mono text-white/70 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>GPS TELEMETRY SYNCED</span>
                </div>
            </div>

            {/* Clicked Marker Details Drawer / Modal */}
            {selectedItem && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-navy-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-30 pointer-events-auto animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                                {selectedItem.type === 'signal' ? '🚦' :
                                 selectedItem.type === 'camera' ? '📷' :
                                 selectedItem.type === 'officer' ? '👮' :
                                 selectedItem.type === 'emergency' ? '🚑' :
                                 selectedItem.type === 'accident' ? '⚠️' : '🚧'}
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-white leading-tight">
                                    {selectedItem.name || selectedItem.location}
                                </h4>
                                <span className="text-[10px] font-mono text-blue-400 uppercase">
                                    {selectedItem.id} • {selectedItem.type.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-2 text-xs font-mono text-white/80">
                        {/* Signal Details */}
                        {selectedItem.type === 'signal' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Active Phase:</span>
                                    <span className={`font-bold ${selectedItem.state === 'GREEN' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {selectedItem.state} ({selectedItem.timeLeft}s left)
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Cycle Time:</span>
                                    <span>{selectedItem.cycle}s Total</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Junction Density:</span>
                                    <span className="text-yellow-400">{selectedItem.density}</span>
                                </div>
                            </>
                        )}

                        {/* Camera Details */}
                        {selectedItem.type === 'camera' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Stream Status:</span>
                                    <span className="text-emerald-400 font-bold">{selectedItem.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Network Link:</span>
                                    <span className="text-blue-300">{selectedItem.link}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Tracked Flow:</span>
                                    <span>{selectedItem.vehicles} vehicles in frame</span>
                                </div>
                            </>
                        )}

                        {/* Officer Details */}
                        {selectedItem.type === 'officer' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Officer Badge:</span>
                                    <span className="text-white font-bold">{selectedItem.badge}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Patrol Unit:</span>
                                    <span className="text-sky-300">{selectedItem.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Radio Contact:</span>
                                    <span className="text-emerald-400">{selectedItem.phone}</span>
                                </div>
                            </>
                        )}

                        {/* Emergency Vehicle Details */}
                        {selectedItem.type === 'emergency' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Speed Telemetry:</span>
                                    <span className="text-emerald-400 font-bold">{selectedItem.speed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Green Wave:</span>
                                    <span className="text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                        ACTIVE PREEMPTION
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Routing To:</span>
                                    <span className="text-white">{selectedItem.destination}</span>
                                </div>
                            </>
                        )}

                        {/* Accident Details */}
                        {selectedItem.type === 'accident' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Severity:</span>
                                    <span className="text-red-400 font-bold">{selectedItem.severity}</span>
                                </div>
                                <p className="text-[11px] text-white/70 italic">{selectedItem.description}</p>
                                <div className="flex justify-between pt-1">
                                    <span className="text-white/40">Response:</span>
                                    <span className="text-emerald-400">{selectedItem.responseStatus}</span>
                                </div>
                            </>
                        )}

                        {/* Road Closure Details */}
                        {selectedItem.type === 'closure' && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Detour:</span>
                                    <span className="text-amber-300 font-bold">{selectedItem.detour}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Reason:</span>
                                    <span className="text-white">{selectedItem.reason}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between pt-2 border-t border-white/10 text-[10px] text-white/40">
                            <span>COORDINATES:</span>
                            <span>{selectedItem.lat.toFixed(4)}° N, {selectedItem.lng.toFixed(4)}° E</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrafficMap;
