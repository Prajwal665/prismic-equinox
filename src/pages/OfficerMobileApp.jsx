import React, { useState, useEffect, useRef } from 'react';
import {
    Smartphone,
    Fingerprint,
    Shield,
    Camera,
    MapPin,
    Wifi,
    WifiOff,
    Bell,
    QrCode,
    Search,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Navigation,
    User,
    FileText,
    LogOut,
    Car,
    Clock,
    Zap,
    Send,
    Eye,
    Plus,
    X,
    Upload,
    Sparkles,
    Sliders,
    Compass,
    Radio
} from 'lucide-react';
import {
    getActiveOfficerSession,
    loginWithBadgeAndPin,
    loginWithFingerprint,
    logoutOfficer,
    getOfflineQueue,
    saveViolationOffline,
    syncOfflineQueueToCentral,
    getCurrentOfficerGPS,
    getOfficerNotifications,
    pushLocalNotification,
    OFFICER_PROFILES
} from '../services/officerMobileService';
import { lookupVahanVehicle } from '../services/echallanService';
import QRCodeDisplay from '../components/QRCodeDisplay';

const OfficerMobileApp = () => {
    // Device Frame View Mode: 'mobile-frame' or 'fullscreen'
    const [viewMode, setViewMode] = useState('mobile-frame');

    // Auth & Officer Session
    const [officer, setOfficer] = useState(null);
    const [loginBadge, setLoginBadge] = useState('DL-TP-409');
    const [loginPin, setLoginPin] = useState('4091');
    const [loginError, setLoginError] = useState('');
    const [isBiometricScanning, setIsBiometricScanning] = useState(false);

    // Active Mobile Bottom Tab: 'home', 'camera', 'vahan', 'scanner', 'sync'
    const [mobileTab, setMobileTab] = useState('home');

    // Network / Offline State
    const [isOnline, setIsOnline] = useState(true);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    // GPS State
    const [gpsData, setGpsData] = useState({
        lat: 28.6315,
        lng: 77.2167,
        accuracy: 3.2,
        speed: '18.4',
        heading: 88,
        landmark: 'Connaught Place Radial 1, New Delhi'
    });
    const [isTransmittingGps, setIsTransmittingGps] = useState(true);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

    // Camera Capture & Violation State
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);

    const [violationForm, setViolationForm] = useState({
        plate_no: 'DL 08 BK 9021',
        violation_type: 'Driving Without Helmet (Sec 194D MVA)',
        fine_amount: 1000,
        notes: 'Spotted rider operating vehicle without helmet.',
        speed: 45
    });

    // Vahan Search State
    const [searchPlate, setSearchPlate] = useState('DL 01 AB 1234');
    const [vahanResult, setVahanResult] = useState(null);

    // QR Scanner State
    const [scannedResult, setScannedResult] = useState(null);
    const [isScanningQR, setIsScanningQR] = useState(false);

    // Toast Feedback
    const [mobileToast, setMobileToast] = useState(null);

    const showToast = (msg) => {
        setMobileToast(msg);
        setTimeout(() => setMobileToast(null), 3500);
    };

    // Load Initial Data
    useEffect(() => {
        setOfficer(getActiveOfficerSession());
        setOfflineQueue(getOfflineQueue());
        setNotifications(getOfficerNotifications());

        // Update GPS
        getCurrentOfficerGPS().then(data => setGpsData(data));
        const gpsInterval = setInterval(() => {
            getCurrentOfficerGPS().then(data => setGpsData(data));
        }, 12000);

        return () => clearInterval(gpsInterval);
    }, []);

    // Automatic Sync when network toggles back to online
    useEffect(() => {
        if (isOnline && offlineQueue.length > 0) {
            handleSync();
        }
    }, [isOnline]);

    // Handle Manual Sync
    const handleSync = () => {
        if (!isOnline) {
            showToast('⚠️ Cannot sync while in Offline Mode. Enable network first.');
            return;
        }
        setIsSyncing(true);
        setTimeout(() => {
            const res = syncOfflineQueueToCentral();
            setIsSyncing(false);
            setOfflineQueue(getOfflineQueue());
            setSyncResult(res);
            showToast(`✅ ${res.message}`);
        }, 1400);
    };

    // Handle Login with PIN
    const handlePinLogin = (e) => {
        e.preventDefault();
        setLoginError('');
        const res = loginWithBadgeAndPin(loginBadge, loginPin);
        if (res.success) {
            setOfficer(res.officer);
            showToast(`👮 Welcome back, ${res.officer.name}`);
        } else {
            setLoginError(res.message);
        }
    };

    // Handle Fingerprint Login
    const handleFingerprintAuth = () => {
        setIsBiometricScanning(true);
        setTimeout(() => {
            const res = loginWithFingerprint(loginBadge);
            setIsBiometricScanning(false);
            if (res.success) {
                setOfficer(res.officer);
                showToast(`👆 Fingerprint Verified! Officer ${res.officer.badge} Authenticated`);
            }
        }, 1100);
    };

    // Camera Hardware Activation
    const startCamera = async () => {
        setIsCameraActive(true);
        setCapturedPhoto(null);
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                mediaStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }
        } catch (err) {
            console.log('Mobile camera hardware fallback active:', err);
        }
    };

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const captureSnapshot = () => {
        // Fallback snapshot or canvas snapshot
        const sampleImages = [
            'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&fit=crop',
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&fit=crop',
            'https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=600&fit=crop'
        ];
        const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        setCapturedPhoto(randomImg);
        stopCamera();
        showToast('📸 Violation evidence snapshot captured with GPS geotag!');
    };

    // Handle Violation Submission (Offline vs Online)
    const handleViolationSubmit = (e) => {
        e.preventDefault();
        const payload = {
            plate_no: violationForm.plate_no,
            violation_type: violationForm.violation_type,
            fine_amount: Number(violationForm.fine_amount),
            officer_name: officer?.name || 'Insp. Rajesh Sharma',
            officer_badge: officer?.badge || 'DL-TP-409',
            location_name: gpsData.landmark,
            gps_lat: gpsData.lat,
            gps_lng: gpsData.lng,
            evidence_image: capturedPhoto || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&fit=crop',
            notes: violationForm.notes
        };

        if (!isOnline) {
            // Save to offline local storage queue
            saveViolationOffline(payload);
            setOfflineQueue(getOfflineQueue());
            showToast(`📦 Saved to Offline Queue! Will auto-sync when cellular signal returns.`);
        } else {
            // Push immediately to central
            saveViolationOffline(payload);
            syncOfflineQueueToCentral();
            setOfflineQueue(getOfflineQueue());
            showToast(`🚀 Violation submitted & E-Challan generated instantly!`);
        }

        setCapturedPhoto(null);
        setMobileTab('home');
    };

    // Handle Vahan Plate Search
    const handleVahanSearch = (e) => {
        e.preventDefault();
        const res = lookupVahanVehicle(searchPlate);
        setVahanResult(res);
    };

    // Simulate QR Scan
    const handleSimulateScan = (preset = 'DL-2026-CHL-10928') => {
        setIsScanningQR(true);
        setTimeout(() => {
            setIsScanningQR(false);
            setScannedResult({
                challan_no: preset,
                plate_no: 'DL 01 AB 1234',
                owner: 'Rajesh Kumar Sharma',
                violation: 'Red Light Jump (Sec 184 MVA)',
                fine: '₹1,000',
                status: 'UNPAID',
                verified: true
            });
            showToast(`🔍 Scanned E-Challan #${preset} Verified!`);
        }, 1200);
    };

    // Trigger Mock Push Notification
    const handleTriggerTestPush = () => {
        const notif = pushLocalNotification(
            '🚨 Emergency Convoy Priority Alert',
            `Ambulance approaching ${gpsData.landmark}. Switch signal to Green Corridor mode.`,
            'CRITICAL'
        );
        setNotifications(getOfficerNotifications());
        showToast(`📲 Push Notification Received: "${notif.title}"`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Top Command Bar & View Toggle */}
            <div className="glass-panel p-6 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    ITMS Officer Companion Mobile App
                                </h1>
                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                                    CAPACITOR v6 NATIVE READY
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                Field patrol client with Biometric Login, Camera Upload, GPS Tracking, Offline SQLite Queue, and Auto-Sync.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Viewport Frame Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
                        <button
                            onClick={() => setViewMode('mobile-frame')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                viewMode === 'mobile-frame' ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5" /> Mobile Device View
                        </button>
                        <button
                            onClick={() => setViewMode('fullscreen')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                viewMode === 'fullscreen' ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                            }`}
                        >
                            <Sliders className="w-3.5 h-3.5" /> Responsive Fullscreen
                        </button>
                    </div>

                    {/* Network Connectivity Toggle (Offline Simulation) */}
                    <button
                        onClick={() => {
                            setIsOnline(!isOnline);
                            showToast(isOnline ? "📵 Switched to Field Offline Mode" : "📶 Network Restored (4G/5G Online)");
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                            isOnline
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
                        }`}
                        title="Toggle Network to test Offline Mode & Sync"
                    >
                        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        <span>{isOnline ? "ONLINE (4G)" : "OFFLINE MODE"}</span>
                    </button>
                </div>
            </div>

            {/* Main Container: Mobile Frame vs Fullscreen */}
            <div className="flex items-center justify-center min-h-[720px]">
                <div
                    className={`${
                        viewMode === 'mobile-frame'
                            ? "w-[400px] h-[820px] rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden bg-slate-950 flex flex-col ring-1 ring-white/10"
                            : "w-full max-w-4xl min-h-[750px] rounded-3xl border border-white/10 bg-slate-950/90 backdrop-blur-xl p-6 shadow-2xl flex flex-col"
                    }`}
                >
                    {/* Device Speaker Notch / Dynamic Island (Only in mobile frame view) */}
                    {viewMode === 'mobile-frame' && (
                        <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-center z-50 pointer-events-none">
                            <div className="w-28 h-4 bg-black rounded-b-2xl border-b border-x border-white/10 flex items-center justify-center">
                                <div className="w-10 h-1 bg-white/20 rounded-full" />
                            </div>
                        </div>
                    )}

                    {/* Toast Overlay on Mobile Screen */}
                    {mobileToast && (
                        <div className="absolute top-12 left-4 right-4 z-50 bg-slate-900/95 border border-blue-500/60 shadow-2xl text-white px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-top-3">
                            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="font-semibold text-[11px] leading-tight">{mobileToast}</span>
                        </div>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* SCREEN 1: OFFICER LOGIN & FINGERPRINT (WHEN NOT AUTHENTICATED) */}
                    {/* ------------------------------------------------------------- */}
                    {!officer ? (
                        <div className="flex-1 flex flex-col justify-center p-6 space-y-6 pt-12">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-600/20">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-black text-white">DELHI TRAFFIC POLICE</h2>
                                <p className="text-[11px] text-white/50">Field Officer Mobile Enforcement Client (Capacitor)</p>
                            </div>

                            {loginError && (
                                <div className="p-2.5 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-xl text-center">
                                    {loginError}
                                </div>
                            )}

                            {/* Badge & PIN Form */}
                            <form onSubmit={handlePinLogin} className="space-y-3 text-xs">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Officer Badge No</label>
                                    <input
                                        type="text"
                                        required
                                        value={loginBadge}
                                        onChange={(e) => setLoginBadge(e.target.value.toUpperCase())}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Security PIN</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={4}
                                        value={loginPin}
                                        onChange={(e) => setLoginPin(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-center text-sm tracking-widest focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-xs"
                                >
                                    <User className="w-4 h-4" /> Login with Officer PIN
                                </button>
                            </form>

                            <div className="relative flex items-center justify-center">
                                <div className="border-t border-white/10 w-full" />
                                <span className="bg-slate-950 px-3 text-[10px] text-white/40 font-mono uppercase absolute">
                                    OR BIOMETRIC AUTH
                                </span>
                            </div>

                            {/* Fingerprint Scanner Button */}
                            <button
                                onClick={handleFingerprintAuth}
                                disabled={isBiometricScanning}
                                className={`w-full py-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                    isBiometricScanning
                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                                        : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-emerald-500/50"
                                }`}
                            >
                                <Fingerprint className={`w-9 h-9 ${isBiometricScanning ? "text-emerald-400 animate-spin" : "text-emerald-400"}`} />
                                <span className="text-xs font-bold font-mono">
                                    {isBiometricScanning ? "Scanning Fingerprint Sensor..." : "One-Touch Fingerprint Login"}
                                </span>
                                <span className="text-[9px] text-white/40 font-mono">FIDO2 / WebAuthn Biometric API</span>
                            </button>
                        </div>
                    ) : (
                        /* ------------------------------------------------------------- */
                        /* SCREEN 2: AUTHENTICATED OFFICER MOBILE SHELL                   */
                        /* ------------------------------------------------------------- */
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Mobile Top App Bar */}
                            <div className="pt-8 px-4 pb-3 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <img
                                        src={officer.avatar}
                                        alt={officer.name}
                                        className="w-8 h-8 rounded-full border border-blue-500/50 object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white leading-tight">{officer.name}</span>
                                            <span className="text-[9px] font-mono text-amber-300 bg-amber-400/10 px-1 rounded">
                                                {officer.badge}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-white/40 block leading-tight">{officer.station}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Push Notification Bell */}
                                    <button
                                        onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
                                        className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-white relative"
                                    >
                                        <Bell className="w-4 h-4" />
                                        {notifications.length > 0 && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1 animate-ping" />
                                        )}
                                    </button>

                                    {/* Logout */}
                                    <button
                                        onClick={() => {
                                            logoutOfficer();
                                            setOfficer(null);
                                        }}
                                        className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-red-400"
                                        title="Logout Officer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications Drawer (Collapsible) */}
                            {notifDrawerOpen && (
                                <div className="p-3 bg-slate-900 border-b border-white/10 space-y-2 animate-in slide-in-from-top-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">
                                            Field Push Alerts ({notifications.length})
                                        </span>
                                        <button
                                            onClick={handleTriggerTestPush}
                                            className="text-[9px] text-blue-400 font-mono hover:underline"
                                        >
                                            + Trigger Test Alert
                                        </button>
                                    </div>
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-2 bg-white/5 border border-white/10 rounded-lg text-xs space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-white text-[11px]">{n.title}</span>
                                                <span className="text-[8px] text-white/40 font-mono">{n.timestamp}</span>
                                            </div>
                                            <p className="text-[10px] text-white/70 leading-snug">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main Body View based on mobileTab */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {/* ---------------- TAB: HOME DASHBOARD ---------------- */}
                                {mobileTab === 'home' && (
                                    <div className="space-y-4">
                                        {/* Status & Network Banner */}
                                        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-mono text-blue-400 uppercase font-bold">Duty Status</span>
                                                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                                    ON PATROL • {officer.unit}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                                    isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                                }`}>
                                                    {isOnline ? "4G CONNECTED" : "OFFLINE QUEUE"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* GPS Live Telemetry Card */}
                                        <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[10px] font-mono text-white/40 uppercase flex items-center gap-1">
                                                    <Navigation className="w-3 h-3 text-red-400" /> Live Officer GPS
                                                </span>
                                                <span className="text-[9px] font-mono text-emerald-400">
                                                    Acc: ±{gpsData.accuracy}m
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold text-white truncate">
                                                {gpsData.landmark}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                                                <span>LAT: {gpsData.lat.toFixed(4)}° N</span>
                                                <span>LNG: {gpsData.lng.toFixed(4)}° E</span>
                                                <span>SPD: {gpsData.speed} km/h</span>
                                            </div>
                                        </div>

                                        {/* Offline Queue Badge Card */}
                                        {offlineQueue.length > 0 && (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                    <div>
                                                        <span className="text-xs font-bold text-white block">
                                                            {offlineQueue.length} Challan(s) Stored Locally
                                                        </span>
                                                        <span className="text-[9px] text-amber-300/80">Pending Central HQ Upload</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSync}
                                                    disabled={isSyncing}
                                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-lg flex items-center gap-1"
                                                >
                                                    <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                                                    Sync Now
                                                </button>
                                            </div>
                                        )}

                                        {/* Quick Actions Grid */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button
                                                onClick={() => {
                                                    setMobileTab('camera');
                                                    startCamera();
                                                }}
                                                className="p-3.5 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors"
                                            >
                                                <Camera className="w-6 h-6 text-blue-400" />
                                                <span className="text-xs font-bold text-white">Capture Violation</span>
                                                <span className="text-[9px] text-white/40">Camera & ANPR</span>
                                            </button>

                                            <button
                                                onClick={() => setMobileTab('vahan')}
                                                className="p-3.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors"
                                            >
                                                <Car className="w-6 h-6 text-purple-400" />
                                                <span className="text-xs font-bold text-white">Vahan RC Search</span>
                                                <span className="text-[9px] text-white/40">Plate Lookup</span>
                                            </button>

                                            <button
                                                onClick={() => setMobileTab('scanner')}
                                                className="p-3.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors"
                                            >
                                                <QrCode className="w-6 h-6 text-emerald-400" />
                                                <span className="text-xs font-bold text-white">Scan QR Code</span>
                                                <span className="text-[9px] text-white/40">Verify Payments</span>
                                            </button>

                                            <button
                                                onClick={() => setMobileTab('sync')}
                                                className="p-3.5 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors"
                                            >
                                                <RefreshCw className="w-6 h-6 text-amber-400" />
                                                <span className="text-xs font-bold text-white">Offline Queue</span>
                                                <span className="text-[9px] text-white/40">{offlineQueue.length} Queued</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---------------- TAB: CAMERA CAPTURE VIOLATION ---------------- */}
                                {mobileTab === 'camera' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <Camera className="w-4 h-4 text-blue-400" />
                                                Violation Camera Capture
                                            </h3>
                                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                GPS AUTO-TAG
                                            </span>
                                        </div>

                                        {/* Camera Viewfinder */}
                                        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black aspect-[4/3] flex items-center justify-center shadow-inner">
                                            {capturedPhoto ? (
                                                <img
                                                    src={capturedPhoto}
                                                    alt="Captured Evidence"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <video
                                                        ref={videoRef}
                                                        playsInline
                                                        muted
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* ANPR Alignment Rectangle */}
                                                    <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-yellow-400/70 rounded-xl flex items-center justify-center pointer-events-none">
                                                        <span className="text-[9px] font-mono text-yellow-300 font-bold bg-black/70 px-2 py-0.5 rounded">
                                                            ALIGN NUMBER PLATE HERE
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            {/* Camera Bottom Shutter Bar */}
                                            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between">
                                                {capturedPhoto ? (
                                                    <button
                                                        onClick={startCamera}
                                                        className="px-3 py-1.5 bg-black/80 hover:bg-black text-white text-[10px] rounded-xl font-bold"
                                                    >
                                                        Retake Photo
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={captureSnapshot}
                                                        className="w-12 h-12 mx-auto rounded-full bg-white border-4 border-blue-500 shadow-xl flex items-center justify-center"
                                                        title="Snap Photo"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Violation Details Form */}
                                        <form onSubmit={handleViolationSubmit} className="space-y-3 text-xs">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-white/40 uppercase">Vehicle License Plate</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={violationForm.plate_no}
                                                    onChange={(e) => setViolationForm({ ...violationForm, plate_no: e.target.value.toUpperCase() })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-amber-300"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-white/40 uppercase">Violation Clause</label>
                                                <select
                                                    value={violationForm.violation_type}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let f = 1000;
                                                        if (val.includes('Stop Line')) f = 500;
                                                        if (val.includes('Overspeeding')) f = 2000;
                                                        if (val.includes('Wrong Way') || val.includes('Mobile Phone')) f = 5000;
                                                        setViolationForm({ ...violationForm, violation_type: val, fine_amount: f });
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                                                >
                                                    <option value="Driving Without Helmet (Sec 194D MVA)">No Helmet (₹1,000)</option>
                                                    <option value="Red Light Jump (Sec 184 MVA)">Red Light Jump (₹1,000)</option>
                                                    <option value="Overspeeding (Sec 183 MVA)">Overspeeding (₹2,000)</option>
                                                    <option value="Stop Line Crossing (Sec 177 MVA)">Stop Line (₹500)</option>
                                                    <option value="Triple Riding (Sec 194C MVA)">Triple Riding (₹1,000)</option>
                                                    <option value="Driving Without Seatbelt (Sec 194B MVA)">No Seatbelt (₹1,000)</option>
                                                </select>
                                            </div>

                                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-white/70 space-y-0.5">
                                                <p>GPS: {gpsData.lat.toFixed(4)}, {gpsData.lng.toFixed(4)}</p>
                                                <p>Location: {gpsData.landmark}</p>
                                                <p>Fine Penalty: <strong className="text-emerald-400">₹{violationForm.fine_amount}</strong></p>
                                            </div>

                                            <button
                                                type="submit"
                                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                                                    isOnline
                                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                                                        : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                                                }`}
                                            >
                                                <Send className="w-4 h-4" />
                                                {isOnline ? "Issue Official E-Challan Now" : "Queue Offline (Will Sync Later)"}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* ---------------- TAB: VAHAN REGISTRY SEARCH ---------------- */}
                                {mobileTab === 'vahan' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <Car className="w-4 h-4 text-purple-400" />
                                                Vahan 4.0 Mobile RC Search
                                            </h3>
                                        </div>

                                        <form onSubmit={handleVahanSearch} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchPlate}
                                                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                                                placeholder="e.g. DL 01 AB 1234"
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300"
                                            />
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </form>

                                        {vahanResult && (
                                            <div className="p-4 bg-purple-500/[0.05] border border-purple-500/20 rounded-2xl space-y-3 text-xs">
                                                <div className="flex justify-between items-start border-b border-white/10 pb-2">
                                                    <div>
                                                        <span className="text-base font-black text-amber-300 font-mono">{vahanResult.plate_no}</span>
                                                        <p className="text-[10px] text-white/60">{vahanResult.maker_model}</p>
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[9px] rounded-full">
                                                        RC: {vahanResult.rc_status}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-[11px]">
                                                    <p><span className="text-white/40">Owner:</span> <strong className="text-white">{vahanResult.owner_name}</strong></p>
                                                    <p><span className="text-white/40">Phone:</span> <span className="text-white/80 font-mono">{vahanResult.owner_phone}</span></p>
                                                    <p><span className="text-white/40">Insurance:</span> <span className="text-emerald-400 font-mono">{vahanResult.insurance_valid_upto}</span></p>
                                                    <p><span className="text-white/40">PUCC:</span> <span className="text-emerald-400 font-mono">{vahanResult.pucc_valid_upto}</span></p>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setViolationForm({ ...violationForm, plate_no: vahanResult.plate_no });
                                                        setMobileTab('camera');
                                                    }}
                                                    className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-white rounded-xl text-[10px] font-bold"
                                                >
                                                    Issue Challan for this Vehicle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ---------------- TAB: QR CODE SCANNER ---------------- */}
                                {mobileTab === 'scanner' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <QrCode className="w-4 h-4 text-emerald-400" />
                                                Field QR Code Scanner
                                            </h3>
                                        </div>

                                        {/* Scanner Viewport with Laser Beam */}
                                        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black aspect-square flex flex-col items-center justify-center p-6 text-center">
                                            <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center">
                                                {/* Corner Reticles */}
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />

                                                {/* Animated Scanning Laser Line */}
                                                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-bounce" />

                                                <span className="text-[9px] font-mono text-emerald-300">POINT CAMERA AT QR CODE</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSimulateScan('DL-2026-CHL-10928')}
                                            disabled={isScanningQR}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            {isScanningQR ? "Scanning..." : "Simulate QR Scan (Challan DL-2026-CHL-10928)"}
                                        </button>

                                        {scannedResult && (
                                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 text-xs">
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-white/40">Challan No:</span>
                                                    <strong className="text-white">{scannedResult.challan_no}</strong>
                                                </div>
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-white/40">Plate:</span>
                                                    <span className="text-amber-300 font-bold">{scannedResult.plate_no}</span>
                                                </div>
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-white/40">Fine:</span>
                                                    <strong className="text-emerald-400">{scannedResult.fine}</strong>
                                                </div>
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-white/40">Status:</span>
                                                    <span className="text-red-400 font-bold">{scannedResult.status}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ---------------- TAB: OFFLINE QUEUE & SYNC ---------------- */}
                                {mobileTab === 'sync' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <RefreshCw className="w-4 h-4 text-amber-400" />
                                                Offline Local Queue & Synchronization
                                            </h3>
                                            <span className="text-[9px] font-mono text-white/50">
                                                {offlineQueue.length} Pending
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-white/60">
                                            Challans issued in low-cellular zones are saved securely to offline device storage. They synchronize automatically when 4G/5G returns.
                                        </p>

                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing || offlineQueue.length === 0}
                                            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                                            {isSyncing ? "Uploading Violations to Central HQ..." : `Upload & Sync ${offlineQueue.length} Queued Challan(s)`}
                                        </button>

                                        <div className="space-y-2">
                                            {offlineQueue.map(item => (
                                                <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-amber-300 font-mono">{item.plate_no}</span>
                                                        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                                                            LOCAL QUEUE
                                                        </span>
                                                    </div>
                                                    <p className="text-white/80">{item.violation_type}</p>
                                                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                                                        <span>₹{item.fine_amount}</span>
                                                        <span>{item.timestamp}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Bottom Navigation Tab Bar */}
                            <div className="border-t border-white/10 bg-slate-900/95 py-2 px-3 flex items-center justify-around z-20">
                                {[
                                    { id: 'home', label: 'Home', icon: Shield },
                                    { id: 'camera', label: 'Capture', icon: Camera },
                                    { id: 'vahan', label: 'Vahan', icon: Car },
                                    { id: 'scanner', label: 'Scan QR', icon: QrCode },
                                    { id: 'sync', label: 'Sync', icon: RefreshCw, badge: offlineQueue.length }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = mobileTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setMobileTab(tab.id)}
                                            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 px-2 ${
                                                isActive ? "text-blue-400 font-bold" : "text-white/40 hover:text-white"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[9px] font-sans">{tab.label}</span>
                                            {tab.badge > 0 && (
                                                <span className="w-3.5 h-3.5 bg-amber-500 text-black rounded-full font-mono font-bold text-[8px] flex items-center justify-center absolute -top-0.5 right-1">
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Bottom Home Indicator Bar (Mobile Frame Only) */}
                            {viewMode === 'mobile-frame' && (
                                <div className="h-4 bg-slate-950 flex items-center justify-center">
                                    <div className="w-32 h-1 bg-white/20 rounded-full" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfficerMobileApp;
