import React, { useState, useEffect, useRef } from 'react';
import {
    Shield,
    Bell,
    Search,
    Clock,
    Calendar,
    LogOut,
    CheckCircle2,
    CheckCheck,
    AlertTriangle,
    Camera,
    Activity,
    Zap,
    ChevronRight,
    ExternalLink,
    ShieldCheck,
    KeyRound
} from 'lucide-react';
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    subscribeToNotifications
} from '../services/notificationService';
import {
    getCurrentUser,
    ROLES,
    switchRoleForDemo
} from '../services/securityService';

const Navbar = ({ onLogout, onOpenNotifications, onOpenSecurity }) => {
    const [currentUser, setCurrentUser] = useState(getCurrentUser);
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const updateNotifs = () => {
        setNotifications(getNotifications().slice(0, 5));
        setUnreadCount(getUnreadCount());
    };

    useEffect(() => {
        updateNotifs();
        const unsubscribe = subscribeToNotifications(() => {
            updateNotifs();
        });
        return () => unsubscribe();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'emergency': return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
            case 'camera_offline': return <Camera className="w-3.5 h-3.5 text-amber-400" />;
            case 'traffic': return <Activity className="w-3.5 h-3.5 text-yellow-400" />;
            case 'violation': return <Shield className="w-3.5 h-3.5 text-purple-400" />;
            default: return <Zap className="w-3.5 h-3.5 text-blue-400" />;
        }
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
                    {/* Live Notification Bell with Dropdown Drawer */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Notification Center"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-emergency text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center px-1 border border-navy-800 animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isNotifOpen && (
                            <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
                                <div className="p-3.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-bold text-white">Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="text-[9px] bg-emergency/20 text-emergency font-mono font-bold px-1.5 py-0.5 rounded-full">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            markAllNotificationsAsRead();
                                            updateNotifs();
                                        }}
                                        className="text-[10px] text-white/50 hover:text-white font-mono flex items-center gap-1"
                                    >
                                        <CheckCheck className="w-3 h-3 text-emerald-400" /> Mark all read
                                    </button>
                                </div>

                                <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-white/40 text-xs font-mono">
                                            No recent notifications.
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.notif_id}
                                                onClick={() => {
                                                    markNotificationAsRead(n.notif_id);
                                                    updateNotifs();
                                                    if (onOpenNotifications) {
                                                        onOpenNotifications();
                                                        setIsNotifOpen(false);
                                                    }
                                                }}
                                                className={`p-3 text-xs transition-colors cursor-pointer hover:bg-white/[0.03] flex items-start gap-2.5 ${
                                                    !n.is_read ? 'bg-blue-500/[0.04]' : ''
                                                }`}
                                            >
                                                <div className="p-1.5 rounded-lg bg-white/5 mt-0.5 flex-shrink-0">
                                                    {getTypeIcon(n.type)}
                                                </div>
                                                <div className="flex-1 space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-white text-[11px] truncate max-w-[180px]">
                                                            {n.title}
                                                        </span>
                                                        <span className="text-[9px] text-white/40 font-mono">
                                                            {n.timestamp.slice(11, 16)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-white/70 line-clamp-2 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                </div>
                                                {!n.is_read && (
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-2.5 bg-white/[0.02] border-t border-white/10 text-center">
                                    <button
                                        onClick={() => {
                                            setIsNotifOpen(false);
                                            if (onOpenNotifications) onOpenNotifications();
                                        }}
                                        className="w-full py-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <span>Open Full Notification Center</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-3">
                        {/* Quick Security Center Button */}
                        <button
                            onClick={onOpenSecurity}
                            className="p-2 text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors rounded-lg border border-cyan-500/20"
                            title="Enterprise Security Center"
                        >
                            <ShieldCheck className="w-5 h-5" />
                        </button>

                        {/* User Profile & Role Switcher Dropdown */}
                        <div className="relative">
                            <div
                                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                                className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-semibold text-white/90 truncate max-w-[140px]">{currentUser?.name}</p>
                                    <p className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
                                        {ROLES[currentUser?.role]?.name || currentUser?.role}
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-white/20 uppercase font-bold text-xs text-white shadow-md shadow-cyan-900/40">
                                    {currentUser?.badgeNumber ? currentUser.badgeNumber.slice(0, 2) : 'HQ'}
                                </div>
                            </div>

                            {/* Role Switcher Menu */}
                            {isRoleMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
                                    <div className="p-2 border-b border-white/10 mb-1">
                                        <p className="text-[10px] uppercase font-bold text-white/40">Switch Persona (RBAC)</p>
                                        <p className="text-[11px] text-cyan-300 font-bold truncate">{currentUser?.badgeNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                        {Object.values(ROLES).map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    const updated = switchRoleForDemo(r.id);
                                                    setCurrentUser(updated);
                                                    setIsRoleMenuOpen(false);
                                                }}
                                                className={`w-full text-left p-2 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                                                    currentUser?.role === r.id
                                                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                                                        : 'hover:bg-white/5 text-white/70'
                                                }`}
                                            >
                                                <span>{r.name}</span>
                                                {currentUser?.role === r.id && <Check size={12} className="text-cyan-400" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-2 mt-1 border-t border-white/10">
                                        <button
                                            onClick={() => {
                                                setIsRoleMenuOpen(false);
                                                if (onOpenSecurity) onOpenSecurity();
                                            }}
                                            className="w-full text-center py-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                                        >
                                            Open Security Center →
                                        </button>
                                    </div>
                                </div>
                            )}
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
