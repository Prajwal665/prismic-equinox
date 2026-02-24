import React, { useState, useEffect } from 'react';
import { Shield, Bell, Search, Clock, Calendar, LogOut } from 'lucide-react';

const Navbar = ({ onLogout }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-navy-800 border-b border-white/10 flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-emergency p-1.5 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white leading-none text-blue-400">itms.gov.in</h1>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Traffic Control Division</p>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-12">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search junctions, alerts, or vehicle IDs..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emergency/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-black/20 rounded-lg border border-white/5 font-mono">
                    <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                        <Calendar className="w-3.5 h-3.5 text-emergency" />
                        <span className="text-[11px] font-bold tracking-wider text-white/70 uppercase">{formatDate(time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emergency" />
                        <span className="text-sm font-bold tracking-widest text-white/90">{formatTime(time)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-white/70 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emergency rounded-full border-2 border-navy-800"></span>
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white/90">Captain Sharma</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">Duty Officer</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 uppercase font-bold text-xs text-white/70">
                                JS
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-white/40 hover:text-white transition-colors flex items-center gap-2 group border border-transparent hover:border-white/10 rounded-lg"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5 group-hover:text-emergency" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};


export default Navbar;
