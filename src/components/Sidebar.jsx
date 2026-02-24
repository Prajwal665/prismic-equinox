import React from 'react';
import {
    LayoutDashboard,
    Map as MapIcon,
    Video,
    AlertTriangle,
    BarChart3,
    Settings,
    Info,
    LogOut,
    Brain,
    MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-emergency text-white shadow-lg shadow-emergency/20"
                : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-white/40 group-hover:text-white")} />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const Sidebar = ({ activePage, setActivePage }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Map View', icon: MapIcon },
        { id: 'cameras', label: 'CCTV Feeds', icon: Video },
        { id: 'emergency', label: 'Emergency Control', icon: AlertTriangle },
        { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
        { id: 'ai-agent', label: 'AI Intelligence', icon: Brain },
        { id: 'ai-chatbot', label: 'Neural Chatbot', icon: MessageSquare },
    ];

    const bottomItems = [
        { id: 'about', label: 'System Info', icon: Info },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-navy-800 border-r border-white/10 flex flex-col p-4 z-40">
            <div className="space-y-2 flex-1">
                <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Command Center</p>
                {menuItems.map((item) => (
                    <NavItem
                        key={item.id}
                        {...item}
                        active={activePage === item.id}
                        onClick={() => setActivePage(item.id)}
                    />
                ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
                {bottomItems.map((item) => (
                    <NavItem
                        key={item.id}
                        {...item}
                        active={activePage === item.id}
                        onClick={() => setActivePage(item.id)}
                    />
                ))}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
