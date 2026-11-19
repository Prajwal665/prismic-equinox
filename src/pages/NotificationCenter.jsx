import React, { useState, useEffect } from 'react';
import {
    Bell,
    Mail,
    MessageSquare,
    Globe,
    Smartphone,
    AlertTriangle,
    Camera,
    Shield,
    Activity,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Settings,
    Send,
    Trash2,
    CheckCheck,
    Volume2,
    VolumeX,
    RefreshCw,
    ExternalLink,
    Zap,
    Radio,
    Sliders,
    Sparkles,
    X,
    ChevronRight,
    Info,
    Laptop
} from 'lucide-react';
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    dispatchNotification,
    getNotificationSettings,
    saveNotificationSettings,
    requestBrowserNotificationPermission,
    subscribeToNotifications,
    initWebSocket,
    playNotificationChime
} from '../services/notificationService';

const NotificationCenter = () => {
    // Tab Navigation: 'history', 'settings', 'broadcast'
    const [activeTab, setActiveTab] = useState('history');

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [channelFilter, setChannelFilter] = useState('ALL');
    const [unreadOnly, setUnreadOnly] = useState(false);

    // Settings State
    const [settings, setSettings] = useState(getNotificationSettings());
    const [permissionStatus, setPermissionStatus] = useState('default');

    // Broadcast Modal State
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState({
        type: 'emergency',
        title: '🚨 VIP Convoy Route Divert',
        message: 'VIP movement scheduled along Barakhamba corridor. Please reroute general traffic via Janpath.',
        priority: 'CRITICAL',
        channels: ['email', 'sms', 'browser', 'push']
    });

    // Detail Inspection Modal
    const [selectedNotif, setSelectedNotif] = useState(null);

    // Feedback Toast
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Load Data & Subscribe to Realtime Updates
    const refreshData = () => {
        const list = getNotifications({
            type: typeFilter,
            channel: channelFilter,
            unreadOnly: unreadOnly,
            search: searchQuery
        });
        setNotifications(list);
        setUnreadCount(getUnreadCount());
        setSettings(getNotificationSettings());
    };

    useEffect(() => {
        refreshData();
        initWebSocket();

        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }

        const unsubscribe = subscribeToNotifications(() => {
            refreshData();
        });

        return () => unsubscribe();
    }, [searchQuery, typeFilter, channelFilter, unreadOnly]);

    // Handle Mark Single Read
    const handleMarkRead = (id) => {
        markNotificationAsRead(id);
        refreshData();
    };

    // Handle Mark All Read
    const handleMarkAllRead = () => {
        markAllNotificationsAsRead();
        refreshData();
        showToast('✅ All notifications marked as read.');
    };

    // Handle Clear History
    const handleClearAll = () => {
        clearAllNotifications();
        refreshData();
        showToast('🗑️ Notification history cleared.');
    };

    // Handle Browser Permission Request
    const handleRequestPermission = async () => {
        const res = await requestBrowserNotificationPermission();
        setPermissionStatus(res);
        if (res === 'granted') {
            showToast('🌐 Native browser desktop notifications enabled!');
        } else {
            showToast('⚠️ Browser notification permission denied.');
        }
    };

    // Handle Settings Update
    const handleSaveSettings = (e) => {
        e.preventDefault();
        saveNotificationSettings(settings);
        showToast('⚙️ Notification channel preferences updated!');
    };

    // Handle Manual Broadcast
    const handleBroadcastSubmit = (e) => {
        e.preventDefault();
        const dispatched = dispatchNotification(broadcastForm);
        setBroadcastModalOpen(false);
        refreshData();
        showToast(`🚀 Dispatched "${broadcastForm.title}" across ${broadcastForm.channels.length} channels!`);
    };

    // Helper: Type icon & styling
    const getTypeMeta = (type) => {
        switch (type) {
            case 'emergency':
                return {
                    icon: AlertTriangle,
                    label: 'Emergency Alert',
                    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
                    dotColor: 'bg-red-500'
                };
            case 'camera_offline':
                return {
                    icon: Camera,
                    label: 'Camera Offline',
                    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    dotColor: 'bg-amber-500'
                };
            case 'traffic':
                return {
                    icon: Activity,
                    label: 'Traffic Congestion',
                    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                    dotColor: 'bg-yellow-500'
                };
            case 'violation':
                return {
                    icon: Shield,
                    label: 'AI ANPR Violation',
                    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    dotColor: 'bg-purple-500'
                };
            case 'system':
            default:
                return {
                    icon: Zap,
                    label: 'System Telemetry',
                    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    dotColor: 'bg-blue-500'
                };
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-600 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]';
            case 'HIGH':
                return 'bg-amber-500 text-black font-bold';
            case 'MEDIUM':
                return 'bg-blue-500 text-white';
            case 'LOW':
            default:
                return 'bg-slate-700 text-white/70';
        }
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

            {/* Top Control Header */}
            <div className="glass-panel p-6 border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-2xl relative">
                            <Bell className="w-8 h-8" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emergency text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center border-2 border-slate-950 animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    Central Notification & Dispatch Center
                                </h1>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                    WEBSOCKET REALTIME (WS:8001)
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                Multi-channel broadcast hub: Email, SMS, Browser & Push alerts with real-time incident routing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Trigger Broadcast */}
                    <button
                        onClick={() => setBroadcastModalOpen(true)}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                    >
                        <Send className="w-4 h-4" />
                        Trigger Broadcast
                    </button>

                    {/* Mark All As Read */}
                    <button
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        Mark All Read
                    </button>

                    {/* Browser Notifications Permission */}
                    <button
                        onClick={handleRequestPermission}
                        className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                        title="Enable Desktop Browser Notifications"
                    >
                        <Laptop className="w-4 h-4 text-blue-400" />
                        <span>Desktop: {permissionStatus.toUpperCase()}</span>
                    </button>

                    {/* Clear All */}
                    <button
                        onClick={handleClearAll}
                        className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-400 rounded-xl transition-colors"
                        title="Clear All Notifications"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Supported Channels Delivery Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Email */}
                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40 uppercase">Email Gateway</span>
                        <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>SMTP Dispatch</span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="text-[10px] text-white/50 block truncate">
                        {settings.recipients.email.split(',')[0]}
                    </span>
                </div>

                {/* 2. SMS */}
                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40 uppercase">SMS Gateway</span>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>GSM Telemetry</span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="text-[10px] text-white/50 block truncate">
                        {settings.recipients.phone.split(',')[0]}
                    </span>
                </div>

                {/* 3. Browser Desktop */}
                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40 uppercase">Browser Desktop</span>
                        <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>Native API</span>
                        <span className={`w-2 h-2 rounded-full ${permissionStatus === 'granted' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </div>
                    <span className="text-[10px] text-white/50 block font-mono">
                        Status: {permissionStatus.toUpperCase()}
                    </span>
                </div>

                {/* 4. Push Mobile */}
                <div className="glass-panel p-4 border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40 uppercase">Capacitor Push</span>
                        <Smartphone className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>Field Handsets</span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="text-[10px] text-white/50 block font-mono">
                        Active Subscribers (12)
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                {[
                    { id: 'history', label: 'Notification History', icon: Clock, count: notifications.length },
                    { id: 'settings', label: 'Channel & Alert Settings', icon: Settings },
                    { id: 'broadcast', label: 'Realtime WebSocket Dispatcher', icon: Send }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500/50"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/60"}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB 1: NOTIFICATION HISTORY & SEARCH                          */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Search & Filter Toolbar */}
                    <div className="glass-panel p-4 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search notifications by keyword, junction, ambulance, or plate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category & Channel Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-white/40">CATEGORY:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="emergency">Emergency Alerts</option>
                                <option value="camera_offline">Camera Offline</option>
                                <option value="traffic">Traffic Alerts</option>
                                <option value="violation">Violation Alerts</option>
                                <option value="system">System Alerts</option>
                            </select>

                            <span className="text-[11px] font-mono text-white/40 ml-2">CHANNEL:</span>
                            <select
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="ALL">All Channels</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                                <option value="browser">Browser</option>
                                <option value="push">Push</option>
                            </select>

                            {/* Unread Only Toggle */}
                            <button
                                onClick={() => setUnreadOnly(!unreadOnly)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ml-2 ${
                                    unreadOnly
                                        ? "bg-emergency/20 border-emergency text-emergency"
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                }`}
                            >
                                Unread Only ({unreadCount})
                            </button>
                        </div>
                    </div>

                    {/* Notification Cards List */}
                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <div className="glass-panel p-12 text-center text-white/40 space-y-2">
                                <Bell className="w-8 h-8 mx-auto text-white/20" />
                                <p className="text-sm font-semibold">No notifications found matching filter criteria.</p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const meta = getTypeMeta(item.type);
                                const Icon = meta.icon;
                                return (
                                    <div
                                        key={item.notif_id}
                                        onClick={() => setSelectedNotif(item)}
                                        className={`glass-panel p-4 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                                            !item.is_read
                                                ? "border-blue-500/40 bg-blue-500/[0.04] shadow-lg shadow-blue-500/5"
                                                : "border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 flex-1">
                                            {/* Category Icon */}
                                            <div className={`p-2.5 rounded-xl border ${meta.badgeBg} flex-shrink-0 mt-0.5`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {!item.is_read && (
                                                        <span className="w-2 h-2 rounded-full bg-emergency animate-ping" />
                                                    )}
                                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getPriorityBadge(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${meta.badgeBg}`}>
                                                        {meta.label}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-white/40">
                                                        {item.timestamp}
                                                    </span>
                                                </div>

                                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-white/70 leading-relaxed">
                                                    {item.message}
                                                </p>

                                                {/* Channels Badges */}
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    {item.channels && item.channels.map(ch => (
                                                        <span
                                                            key={ch}
                                                            className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50"
                                                        >
                                                            {ch}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                                            {!item.is_read ? (
                                                <button
                                                    onClick={() => handleMarkRead(item.notif_id)}
                                                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Mark Read
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Read
                                                </span>
                                            )}

                                            <button
                                                onClick={() => setSelectedNotif(item)}
                                                className="p-1.5 bg-white/5 hover:bg-white/15 text-white/60 hover:text-white rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: NOTIFICATION SETTINGS & PREFERENCES                    */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="glass-panel p-6 border-white/10 space-y-6 max-w-3xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-blue-400" />
                                Channel Routing & Alert Preferences
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                                Configure which communication channels receive automated dispatch notices.
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                        >
                            Save Settings
                        </button>
                    </div>

                    {/* Channel Toggles */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            1. Active Communication Channels
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {[
                                { key: 'email', label: 'Email Notices (SMTP)', icon: Mail },
                                { key: 'sms', label: 'SMS Gateway (Mobile)', icon: MessageSquare },
                                { key: 'browser', label: 'Desktop Browser Notifications', icon: Globe },
                                { key: 'push', label: 'Push Notifications (Capacitor / Handset)', icon: Smartphone }
                            ].map(ch => {
                                const Icon = ch.icon;
                                const isChecked = settings.channels[ch.key];
                                return (
                                    <label
                                        key={ch.key}
                                        className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between cursor-pointer hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-4 h-4 text-blue-400" />
                                            <span className="font-semibold text-white">{ch.label}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                channels: { ...settings.channels, [ch.key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alert Categories Toggles */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            2. Enabled Alert Categories
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {[
                                { key: 'emergency', label: 'Emergency & Green Corridor', icon: AlertTriangle },
                                { key: 'camera_offline', label: 'Camera Offline & Dropouts', icon: Camera },
                                { key: 'traffic', label: 'Traffic Density & Road Congestion', icon: Activity },
                                { key: 'violation', label: 'AI ANPR Violations & E-Challan', icon: Shield },
                                { key: 'system', label: 'System Heartbeats & Telemetry', icon: Zap }
                            ].map(cat => {
                                const Icon = cat.icon;
                                const isChecked = settings.categories[cat.key];
                                return (
                                    <label
                                        key={cat.key}
                                        className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between cursor-pointer hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-4 h-4 text-amber-400" />
                                            <span className="font-semibold text-white">{cat.label}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                categories: { ...settings.categories, [cat.key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recipient Coordinates */}
                    <div className="space-y-3 text-xs">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            3. Emergency Contacts & Gateway Recipients
                        </span>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Email Recipients (Comma separated)</label>
                                <input
                                    type="text"
                                    value={settings.recipients.email}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        recipients: { ...settings.recipients, email: e.target.value }
                                    })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">SMS Phone Numbers (Comma separated)</label>
                                <input
                                    type="text"
                                    value={settings.recipients.phone}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        recipients: { ...settings.recipients, phone: e.target.value }
                                    })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Audio Synthesizer Toggle */}
                    <div className="pt-2">
                        <label className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2.5 text-xs">
                                {settings.sound_enabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
                                <div>
                                    <span className="font-semibold text-white block">Synthesizer Alert Chimes</span>
                                    <span className="text-[10px] text-white/50">Play priority frequency tone when urgent alerts arrive.</span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.sound_enabled}
                                onChange={(e) => setSettings({ ...settings, sound_enabled: e.target.checked })}
                                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            />
                        </label>
                    </div>
                </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: REALTIME WEBSOCKET DISPATCHER                          */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'broadcast' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 glass-panel p-6 border-white/10 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                            Live Incident Broadcast Console
                        </h3>
                        <p className="text-xs text-white/50">
                            Broadcast priority incidents across all connected WebSocket client nodes, field mobile officers, email gateways, and SMS dispatchers.
                        </p>

                        <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Alert Category</label>
                                    <select
                                        value={broadcastForm.type}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                                    >
                                        <option value="emergency">🚨 Emergency Corridor</option>
                                        <option value="camera_offline">📷 Camera Offline / Dropout</option>
                                        <option value="traffic">⚠️ Traffic Congestion Spike</option>
                                        <option value="violation">🛑 AI ANPR Violation</option>
                                        <option value="system">⚡ System Diagnostic</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Priority Level</label>
                                    <select
                                        value={broadcastForm.priority}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                                    >
                                        <option value="CRITICAL">CRITICAL (Red Audio Alert)</option>
                                        <option value="HIGH">HIGH Priority</option>
                                        <option value="MEDIUM">MEDIUM Priority</option>
                                        <option value="LOW">LOW Priority</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Headline / Title</label>
                                <input
                                    type="text"
                                    required
                                    value={broadcastForm.title}
                                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Message Body</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={broadcastForm.message}
                                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all text-xs"
                            >
                                <Send className="w-4 h-4" />
                                Transmit Live Realtime Broadcast
                            </button>
                        </form>
                    </div>

                    {/* WebSocket Stream Monitor */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 border-white/10 space-y-3 text-xs">
                            <span className="font-bold text-white flex items-center gap-2">
                                <Radio className="w-4 h-4 text-emerald-400" />
                                WebSocket Architecture
                            </span>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-[11px] font-mono">
                                <p className="text-emerald-400">ENDPOINT: ws://localhost:8001/ws/notifications</p>
                                <p className="text-white/70">PROTOCOL: Duplex JSON Frame</p>
                                <p className="text-white/70">RECONNECT: Exponential backoff</p>
                                <p className="text-white/70">BROADCAST: Pub/Sub Listener</p>
                            </div>
                            <p className="text-white/50 text-[11px] leading-relaxed">
                                When alerts are dispatched, all open operator consoles, field mobile companion apps, and dashboard indicators receive synchronous zero-latency push updates.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL: DETAIL INSPECTION OF NOTIFICATION                      */}
            {/* ============================================================= */}
            {selectedNotif && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h3 className="text-base font-bold text-white">Incident Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedNotif(null)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getPriorityBadge(selectedNotif.priority)}`}>
                                    {selectedNotif.priority}
                                </span>
                                <span className="font-mono text-white/50">{selectedNotif.timestamp}</span>
                            </div>

                            <h4 className="text-base font-bold text-white">{selectedNotif.title}</h4>
                            <p className="text-white/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                                {selectedNotif.message}
                            </p>

                            {/* Metadata Key Values */}
                            {selectedNotif.metadata && Object.keys(selectedNotif.metadata).length > 0 && (
                                <div className="space-y-1.5 p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-[11px]">
                                    <span className="text-[10px] text-white/40 uppercase block font-bold">Telemetry Payload</span>
                                    {Object.entries(selectedNotif.metadata).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-white/50">{k}:</span>
                                            <span className="text-amber-300 font-bold">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Channels Dispatched */}
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] text-white/40 font-mono uppercase">Dispatched Via:</span>
                                {selectedNotif.channels && selectedNotif.channels.map(ch => (
                                    <span key={ch} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px] font-bold uppercase">
                                        {ch}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                            {!selectedNotif.is_read && (
                                <button
                                    onClick={() => {
                                        handleMarkRead(selectedNotif.notif_id);
                                        setSelectedNotif({ ...selectedNotif, is_read: true });
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                                >
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedNotif(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
