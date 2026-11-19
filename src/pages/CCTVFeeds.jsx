import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    Brain,
    Zap,
    Activity,
    Users,
    Clock,
    AlertCircle,
    Camera,
    CameraOff,
    Play,
    Pause,
    Shield,
    Maximize2,
    Minimize2,
    RefreshCw,
    Download,
    Eye,
    EyeOff,
    Radio,
    CheckCircle2,
    Power,
    PowerOff,
    Wifi,
    WifiOff,
    Bluetooth,
    BluetoothConnected,
    BluetoothSearching,
    Sliders,
    Settings,
    Signal,
    Cpu,
    X
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const initialCameras = [
    {
        id: 'laptop-webcam',
        name: "Integrated Laptop Camera",
        location: "Local Machine (Live Device)",
        isLocal: true,
        badge: "WEBCAM",
        isPoweredOn: true,
        connectionType: 'wifi', // 'wifi' or 'bluetooth'
        wifiSsid: "ITMS-Private-5G",
        signalStrength: 98,
        btDeviceName: "Laptop-Integrated-UVC",
        ipAddress: "127.0.0.1",
        macAddress: "7C:D1:C3:94:1A:0B",
        frequency: "5.8 GHz",
        latency: "12ms"
    },
    {
        id: 1,
        name: "Intersection A1 - North",
        location: "Sector 12, Delhi",
        isLocal: false,
        isPoweredOn: true,
        connectionType: 'wifi',
        wifiSsid: "Delhi-ITMS-Mesh-01",
        signalStrength: 92,
        btDeviceName: "CCTV-NODE-A1-BT",
        ipAddress: "10.24.11.101",
        macAddress: "00:1A:79:45:B2:11",
        frequency: "5.2 GHz",
        latency: "18ms"
    },
    {
        id: 2,
        name: "Intersection B4 - East",
        location: "Rajiv Chowk",
        isLocal: false,
        isPoweredOn: true,
        connectionType: 'bluetooth',
        wifiSsid: "Delhi-ITMS-Mesh-02",
        signalStrength: 88,
        btDeviceName: "Rajiv-Chowk-BLE-4",
        ipAddress: "10.24.11.102",
        macAddress: "00:1A:79:45:C3:22",
        frequency: "BLE 5.3",
        latency: "24ms"
    },
    {
        id: 3,
        name: "Bridge Exit 09",
        location: "Yamuna Expressway",
        isLocal: false,
        isPoweredOn: true,
        connectionType: 'wifi',
        wifiSsid: "Expressway-Fiber-WiFi",
        signalStrength: 76,
        btDeviceName: "Yamuna-Cam-09-BLE",
        ipAddress: "10.24.11.103",
        macAddress: "00:1A:79:45:D4:33",
        frequency: "2.4 GHz",
        latency: "35ms"
    },
    {
        id: 4,
        name: "Main Market Square",
        location: "Connaught Place",
        isLocal: false,
        isPoweredOn: true,
        connectionType: 'bluetooth',
        wifiSsid: "CP-Municipal-WiFi",
        signalStrength: 91,
        btDeviceName: "CP-Market-Cam-BT",
        ipAddress: "10.24.11.104",
        macAddress: "00:1A:79:45:E5:44",
        frequency: "BLE 5.3",
        latency: "19ms"
    },
];

const CCTVFeeds = () => {
    const [cameras, setCameras] = useState(initialCameras);
    const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
    const [density, setDensity] = useState(38);
    const [waitingTime, setWaitingTime] = useState(45);
    const [aiSolution, setAiSolution] = useState({
        action: "Local Hardware Node Synced",
        details: "Live laptop camera feed integrated. Real-time vision analytics running on local stream.",
        confidence: 99.4
    });

    // Webcam State
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [isConnectingWebcam, setIsConnectingWebcam] = useState(false);
    const [webcamError, setWebcamError] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [showAiOverlay, setShowAiOverlay] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [snapshotNotification, setSnapshotNotification] = useState(null);

    // Wireless Config Modal State
    const [activeModalCamera, setActiveModalCamera] = useState(null);
    const [isScanningWireless, setIsScanningWireless] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const feedContainerRef = useRef(null);

    const currentCam = cameras[selectedCameraIndex] || cameras[0];

    // Start Webcam Function
    const startWebcam = async (deviceId = null) => {
        setIsConnectingWebcam(true);
        setWebcamError(null);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        try {
            const constraints = {
                video: deviceId
                    ? { deviceId: { exact: deviceId } }
                    : {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                } catch (playErr) {
                    console.warn('Autoplay error handled:', playErr);
                }
            }

            setIsWebcamActive(true);

            // Fetch list of available video devices
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter(d => d.kind === 'videoinput');
                setAvailableDevices(videoInputs);
                if (!deviceId && videoInputs.length > 0) {
                    setSelectedDeviceId(videoInputs[0].deviceId);
                }
            } catch (enumErr) {
                console.warn('Could not enumerate devices:', enumErr);
            }

            // Ensure laptop camera is marked powered on
            setCameras(prev => prev.map(c => c.isLocal ? { ...c, isPoweredOn: true } : c));

            setAiSolution({
                action: "Camera Link Established",
                details: "High-resolution laptop camera connected successfully. Facial and object detection layers active.",
                confidence: 99.8
            });
        } catch (err) {
            console.error('Camera access error:', err);
            let message = 'Unable to access laptop camera.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = 'Camera permission denied. Please click the camera icon in Chrome\'s address bar and set to "Allow".';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = 'No laptop camera found. Please verify your webcam is connected and enabled.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                message = 'Camera is currently in use by another application. Please close other camera apps and retry.';
            } else {
                message = err.message || message;
            }
            setWebcamError(message);
            setIsWebcamActive(false);
        } finally {
            setIsConnectingWebcam(false);
        }
    };

    // Stop Webcam Function
    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsWebcamActive(false);
    };

    // Toggle Individual Camera Power (ON / OFF)
    const toggleCameraPower = (camId, e) => {
        if (e) e.stopPropagation();

        setCameras(prev => prev.map(cam => {
            if (cam.id === camId) {
                const nextPower = !cam.isPoweredOn;

                // If toggling the local laptop camera
                if (cam.isLocal) {
                    if (!nextPower) {
                        stopWebcam();
                    } else if (currentCam.isLocal) {
                        startWebcam(selectedDeviceId || null);
                    }
                }

                showNotification(`${cam.name} powered ${nextPower ? 'ON' : 'OFF'}`);
                return { ...cam, isPoweredOn: nextPower };
            }
            return cam;
        }));
    };

    // Toggle Camera Wireless Connection Type (Wi-Fi <-> Bluetooth)
    const toggleConnectionType = (camId, e) => {
        if (e) e.stopPropagation();

        setCameras(prev => prev.map(cam => {
            if (cam.id === camId) {
                const nextType = cam.connectionType === 'wifi' ? 'bluetooth' : 'wifi';
                const nextFreq = nextType === 'wifi' ? '5.8 GHz' : 'BLE 5.3';
                showNotification(`${cam.name} link switched to ${nextType === 'wifi' ? 'Wi-Fi (5.8 GHz)' : 'Bluetooth (BLE 5.3)'}`);
                return {
                    ...cam,
                    connectionType: nextType,
                    frequency: nextFreq,
                    signalStrength: Math.floor(Math.random() * 15) + 84
                };
            }
            return cam;
        }));
    };

    // Open Wireless Settings Modal
    const handleOpenWirelessModal = (cam, e) => {
        if (e) e.stopPropagation();
        setActiveModalCamera(cam);
    };

    // Show banner notification helper
    const showNotification = (msg) => {
        setSnapshotNotification(msg);
        setTimeout(() => setSnapshotNotification(null), 3000);
    };

    // Auto-connect when selecting the laptop camera if powered on
    useEffect(() => {
        if (currentCam.isLocal && currentCam.isPoweredOn) {
            if (!isWebcamActive && !webcamError && !isConnectingWebcam) {
                startWebcam(selectedDeviceId || null);
            }
        }
    }, [selectedCameraIndex, currentCam.isPoweredOn]);

    // Cleanup tracks on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Switch device
    const handleDeviceChange = (deviceId) => {
        setSelectedDeviceId(deviceId);
        startWebcam(deviceId);
    };

    // Capture Snapshot
    const handleCaptureSnapshot = () => {
        if (!videoRef.current || !isWebcamActive) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 1280;
            canvas.height = videoRef.current.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `ITMS_CCTV_Snapshot_${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification("Snapshot captured and saved successfully!");
        } catch (err) {
            console.error('Error capturing snapshot:', err);
        }
    };

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!feedContainerRef.current) return;

        if (!document.fullscreenElement) {
            feedContainerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => console.error(err));
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => console.error(err));
        }
    };

    // Wireless Scan / Pair Simulation
    const handleScanWireless = async () => {
        setIsScanningWireless(true);
        try {
            // Check native Web Bluetooth API if available in Chrome
            if (activeModalCamera?.connectionType === 'bluetooth' && navigator.bluetooth?.requestDevice) {
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true
                }).catch(() => null);

                if (device) {
                    setCameras(prev => prev.map(c => c.id === activeModalCamera.id ? {
                        ...c,
                        connectionType: 'bluetooth',
                        btDeviceName: device.name || 'Paired Bluetooth Camera'
                    } : c));
                    showNotification(`Bluetooth Camera '${device.name || 'Wireless Node'}' paired!`);
                    setIsScanningWireless(false);
                    return;
                }
            }

            // Fallback realistic wireless link re-synchronization
            setTimeout(() => {
                setCameras(prev => prev.map(c => c.id === activeModalCamera.id ? {
                    ...c,
                    signalStrength: 99,
                    latency: '10ms'
                } : c));
                showNotification(`Wireless link optimized: ${activeModalCamera.name} synced at 99% signal!`);
                setIsScanningWireless(false);
            }, 1200);
        } catch (err) {
            setIsScanningWireless(false);
        }
    };

    // Live AI Solution and Density cycle
    useEffect(() => {
        const interval = setInterval(() => {
            const newDensity = Math.floor(Math.random() * 40) + (isWebcamActive ? 25 : 35);
            setDensity(newDensity);
            setWaitingTime(prev => Math.max(10, prev + (newDensity > 45 ? 3 : -2)));

            if (currentCam.isLocal) {
                if (isWebcamActive && currentCam.isPoweredOn) {
                    setAiSolution({
                        action: "Live Neural Recognition Active",
                        details: `High fidelity camera feed detected. Real-time operator and proximity classification running over ${currentCam.connectionType.toUpperCase()} link.`,
                        confidence: 99.4
                    });
                } else {
                    setAiSolution({
                        action: "Hardware Standby Mode",
                        details: "Local camera is offline or standby. Activate feed to resume live visual stream analytics.",
                        confidence: 90.0
                    });
                }
            } else {
                if (!currentCam.isPoweredOn) {
                    setAiSolution({
                        action: "Relay Node Offline",
                        details: `${currentCam.name} power state is OFF. Route redirected to adjacent telemetry grid.`,
                        confidence: 88.0
                    });
                } else if (newDensity > 55) {
                    setAiSolution({
                        action: "Phase Extension Triggered",
                        details: `High volume detected at ${currentCam.location}. Extended green phase by 14s.`,
                        confidence: 98.4
                    });
                } else {
                    setAiSolution({
                        action: "Dynamic Flow Balancing",
                        details: `Traffic normalized at ${currentCam.location}. Synchronizing with junction network.`,
                        confidence: 94.7
                    });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [selectedCameraIndex, isWebcamActive, currentCam]);

    const [chartData, setChartData] = useState(Array.from({ length: 15 }, (_, i) => ({ time: i, density: 40 + Math.random() * 15 })));

    useEffect(() => {
        const t = setInterval(() => {
            setChartData(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, density: density }]);
        }, 1000);
        return () => clearInterval(t);
    }, [density]);

    const isShowingLaptopFeed = currentCam.isLocal || (isWebcamActive && currentCam.id === 'laptop-webcam');

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <Video className="w-8 h-8 text-blue-500" />
                        Live CCTV & Vision Intelligence
                    </h1>
                    <p className="text-white/50 text-sm">Real-time camera management, Wi-Fi / Bluetooth pairing, and neural monitoring.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Quick Laptop Camera Toggle Button */}
                    <button
                        onClick={() => {
                            setSelectedCameraIndex(0);
                            if (isWebcamActive) {
                                stopWebcam();
                            } else {
                                startWebcam(selectedDeviceId || null);
                            }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                            isWebcamActive && currentCam.isPoweredOn
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                        }`}
                    >
                        {isWebcamActive && currentCam.isPoweredOn ? (
                            <>
                                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                                Laptop Camera: Active
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4" />
                                Connect Laptop Camera
                            </>
                        )}
                    </button>

                    <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
                            {cameras.filter(c => c.isPoweredOn).length}/{cameras.length} Feeds Online
                        </span>
                    </div>
                </div>
            </header>

            {/* Notification Banner */}
            <AnimatePresence>
                {snapshotNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-lg backdrop-blur-md"
                    >
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{snapshotNotification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)]">
                {/* 1. Camera List Sidebar with ON/OFF & Wi-Fi/Bluetooth on Every Camera */}
                <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between px-2 py-1">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Camera Control Grid</h2>
                        <span className="text-[10px] font-mono text-blue-400">{cameras.length} Units</span>
                    </div>

                    {cameras.map((cam, idx) => {
                        const isSelected = selectedCameraIndex === idx;
                        const isPowered = cam.isPoweredOn;
                        const isWifi = cam.connectionType === 'wifi';

                        return (
                            <div
                                key={cam.id}
                                onClick={() => {
                                    setSelectedCameraIndex(idx);
                                    if (cam.isLocal && cam.isPoweredOn && !isWebcamActive) {
                                        startWebcam(selectedDeviceId || null);
                                    }
                                }}
                                className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer relative group ${
                                    isSelected
                                        ? 'bg-blue-600/90 border-blue-400/80 shadow-xl shadow-blue-900/50 ring-1 ring-blue-400/50'
                                        : isPowered
                                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                            : 'bg-red-950/20 border-red-500/20 opacity-70 hover:opacity-90'
                                }`}
                            >
                                {/* Top Line: Name and Power Badge */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        {cam.isLocal ? (
                                            <Camera className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                                        ) : (
                                            <Video className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : isPowered ? 'text-blue-400' : 'text-red-400'}`} />
                                        )}
                                        <span className="text-xs font-bold leading-tight truncate">{cam.name}</span>
                                    </div>

                                    {/* ON / OFF Power Indicator Light */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`w-2 h-2 rounded-full ${
                                            isPowered
                                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                                                : 'bg-red-500 shadow-sm shadow-red-500'
                                        }`} />
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${
                                            isPowered ? 'text-emerald-300' : 'text-red-400'
                                        }`}>
                                            {isPowered ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-white/50 mb-3 truncate">{cam.location}</p>

                                {/* Hardware Action Row: ON/OFF Toggle + Wi-Fi/Bluetooth Connection Button */}
                                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/10" onClick={e => e.stopPropagation()}>
                                    {/* 1. Dedicated ON / OFF Button for this camera */}
                                    <button
                                        type="button"
                                        onClick={(e) => toggleCameraPower(cam.id, e)}
                                        title={isPowered ? `Power OFF ${cam.name}` : `Power ON ${cam.name}`}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                                            isPowered
                                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                                        }`}
                                    >
                                        <Power className={`w-3 h-3 ${isPowered ? 'text-emerald-400' : 'text-red-400'}`} />
                                        <span>{isPowered ? 'ON' : 'OFF'}</span>
                                    </button>

                                    {/* 2. Bluetooth or Wi-Fi Connection Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => toggleConnectionType(cam.id, e)}
                                        title={`Connection Mode: ${isWifi ? 'Wi-Fi' : 'Bluetooth'} (Click to switch)`}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                            isWifi
                                                ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-400/40'
                                                : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-400/40'
                                        }`}
                                    >
                                        {isWifi ? (
                                            <>
                                                <Wifi className="w-3 h-3 text-sky-400" />
                                                <span>Wi-Fi</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bluetooth className="w-3 h-3 text-indigo-400" />
                                                <span>BT</span>
                                            </>
                                        )}
                                    </button>

                                    {/* 3. Wireless Link Options / Pairing Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleOpenWirelessModal(cam, e)}
                                        title="Configure Wireless Link & Pairing"
                                        className="p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                                    >
                                        <Settings className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Camera Device Selector if multiple physical inputs found */}
                    {availableDevices.length > 1 && (
                        <div className="glass-panel p-3.5 border-white/10 bg-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-2">
                                Physical Camera Sensor
                            </label>
                            <select
                                value={selectedDeviceId}
                                onChange={(e) => handleDeviceChange(e.target.value)}
                                className="w-full bg-navy-950 border border-white/20 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-400"
                            >
                                {availableDevices.map((dev, i) => (
                                    <option key={dev.deviceId || i} value={dev.deviceId}>
                                        {dev.label || `Camera ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Wireless Network Health Widget */}
                    <div className="glass-panel p-4 border-white/10 bg-white/2">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-3 flex items-center justify-between">
                            <span>Wireless Telemetry</span>
                            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50">Current Link</span>
                                <span className="font-semibold text-sky-400 flex items-center gap-1">
                                    {currentCam.connectionType === 'wifi' ? (
                                        <><Wifi className="w-3 h-3" /> Wi-Fi ({currentCam.frequency})</>
                                    ) : (
                                        <><Bluetooth className="w-3 h-3" /> Bluetooth ({currentCam.frequency})</>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50">Signal RSSI</span>
                                <span className="font-mono text-emerald-400">{currentCam.signalStrength}% Quality</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/50">Latency</span>
                                <span className="font-mono text-emerald-400">{currentCam.latency}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Live Feed Area */}
                <div className="lg:col-span-2 space-y-4 flex flex-col min-h-0">
                    <div
                        ref={feedContainerRef}
                        className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group flex items-center justify-center min-h-[380px]"
                    >
                        {/* 1. When Camera is Powered OFF */}
                        {!currentCam.isPoweredOn ? (
                            <div className="absolute inset-0 bg-navy-950 flex flex-col items-center justify-center p-6 text-center z-10">
                                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 animate-pulse">
                                    <PowerOff className="w-10 h-10 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Camera Feed Powered Down</h3>
                                <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
                                    {currentCam.name} is currently turned OFF. Telemetry and video capture are suspended to preserve hardware power.
                                </p>
                                <button
                                    onClick={(e) => toggleCameraPower(currentCam.id, e)}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40 flex items-center gap-2"
                                >
                                    <Power className="w-4 h-4" />
                                    Power On Camera
                                </button>
                            </div>
                        ) : (
                            /* 2. When Camera is Powered ON */
                            <>
                                {/* Live Webcam Video Stream (Only if Laptop Camera & Streaming) */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        isShowingLaptopFeed && isWebcamActive ? 'opacity-100 block' : 'opacity-0 hidden'
                                    }`}
                                />

                                {/* Fallback / Simulated Feed Background when Laptop Camera is Not Streaming or Intersection is Active */}
                                {(!isShowingLaptopFeed || !isWebcamActive) && (
                                    <div className="absolute inset-0 bg-navy-950 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay pointer-events-none" />

                                        {currentCam.isLocal ? (
                                            /* Laptop Camera Connection Prompt */
                                            <div className="relative z-10 max-w-sm flex flex-col items-center">
                                                <div className="relative mb-6">
                                                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                                        <Camera className="w-10 h-10 text-blue-400" />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-navy-950 animate-ping" />
                                                </div>

                                                <h3 className="text-lg font-bold text-white mb-2">Connect Your Laptop Camera</h3>
                                                <p className="text-xs text-white/60 mb-6 leading-relaxed">
                                                    Click below to allow Chrome camera access and stream your live laptop webcam directly into the ITMS command center.
                                                </p>

                                                {webcamError && (
                                                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-left text-xs text-red-200 flex gap-3">
                                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-bold mb-1">Camera Permission Notice</p>
                                                            <p className="leading-relaxed">{webcamError}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => startWebcam(selectedDeviceId || null)}
                                                    disabled={isConnectingWebcam}
                                                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/50 flex items-center gap-2 group-hover:scale-105"
                                                >
                                                    {isConnectingWebcam ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            Connecting Hardware...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4 fill-white" />
                                                            Activate Live Feed
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            /* Intersection Simulated Feed */
                                            <div className="relative z-10 text-center max-w-md">
                                                <Activity className="w-12 h-12 text-blue-400/40 mx-auto mb-4 animate-pulse" />
                                                <h3 className="text-base font-bold text-white mb-1">{currentCam.name}</h3>
                                                <p className="text-xs text-white/50 mb-6">
                                                    {currentCam.location} • Connected via {currentCam.connectionType === 'wifi' ? 'Wi-Fi 5GHz' : 'Bluetooth 5.3'}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCameraIndex(0);
                                                        startWebcam(selectedDeviceId || null);
                                                    }}
                                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition-colors"
                                                >
                                                    <Camera className="w-4 h-4 text-emerald-400" />
                                                    Switch to Live Laptop Camera
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Top Overlay: Camera Badge, Power Status, Wi-Fi / Bluetooth status */}
                                <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
                                    <div className="flex items-center gap-2.5 flex-wrap pointer-events-auto">
                                        <div className="bg-black/70 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs font-mono font-bold tracking-tight text-white uppercase">
                                                {currentCam.isLocal ? 'NODE-LOCAL: LAPTOP WEBCAM' : `CAM-${1024 + currentCam.id}`}
                                            </span>
                                        </div>

                                        {/* Quick On/Off toggle inside live stream header */}
                                        <button
                                            onClick={(e) => toggleCameraPower(currentCam.id, e)}
                                            title="Toggle Camera Power"
                                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400/40 flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors"
                                        >
                                            <Power className="w-3 h-3 text-white" />
                                            <span>POWER: ON</span>
                                        </button>

                                        {/* Quick Wi-Fi / Bluetooth switch inside live stream header */}
                                        <button
                                            onClick={(e) => toggleConnectionType(currentCam.id, e)}
                                            title="Click to toggle between Wi-Fi and Bluetooth"
                                            className={`px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                currentCam.connectionType === 'wifi'
                                                    ? 'bg-sky-500/80 hover:bg-sky-500 text-white border-sky-300/40 shadow-sm'
                                                    : 'bg-indigo-600/80 hover:bg-indigo-600 text-white border-indigo-300/40 shadow-sm'
                                            }`}
                                        >
                                            {currentCam.connectionType === 'wifi' ? (
                                                <>
                                                    <Wifi className="w-3 h-3 text-white" />
                                                    <span>LINK: WI-FI</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Bluetooth className="w-3 h-3 text-white" />
                                                    <span>LINK: BLUETOOTH</span>
                                                </>
                                            )}
                                        </button>

                                        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 ${
                                            isShowingLaptopFeed && isWebcamActive
                                                ? 'bg-emerald-600/90 text-white border border-emerald-400/30'
                                                : 'bg-blue-600/90 text-white border border-blue-400/30'
                                        }`}>
                                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">
                                                {isShowingLaptopFeed && isWebcamActive ? 'LIVE STREAM' : 'ACTIVE RELAY'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-[10px] font-mono text-white/70">
                                        <span>30 FPS</span>
                                        <span className="text-white/30">•</span>
                                        <span>{currentCam.frequency}</span>
                                        <span className="text-white/30">•</span>
                                        <span className="text-emerald-400 font-bold">{currentCam.latency}</span>
                                    </div>
                                </div>

                                {/* Cybernetic HUD Reticle Overlays */}
                                {showAiOverlay && (
                                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400/80 rounded-tl-sm" />
                                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400/80 rounded-tr-sm" />
                                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400/80 rounded-bl-sm" />
                                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400/80 rounded-br-sm" />

                                        {/* Center Target Reticle */}
                                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 border border-blue-400/30 rounded-2xl flex items-center justify-center">
                                            <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                                            <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                                            <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                                            <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                                            {/* Scanning Bar */}
                                            <motion.div
                                                animate={{ y: [-100, 100, -100] }}
                                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70"
                                            />

                                            {/* Tag Info */}
                                            <div className="absolute -top-7 left-0 bg-black/80 backdrop-blur-md border border-emerald-400/40 text-[9px] font-mono text-emerald-300 px-2 py-0.5 rounded font-bold">
                                                LINK: {currentCam.connectionType.toUpperCase()} | TARGET: {isShowingLaptopFeed && isWebcamActive ? 'OPERATOR NODE' : 'SURVEILLANCE ZONE'} [99.2%]
                                            </div>
                                            <div className="absolute -bottom-6 right-0 text-[8px] font-mono text-white/50">
                                                FREQ: {currentCam.frequency} • {currentCam.signalStrength}% RSSI
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Floating Control Bar */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        {/* Toggle Camera Stream Button */}
                                        {currentCam.isLocal && (
                                            <button
                                                onClick={isWebcamActive ? stopWebcam : () => startWebcam(selectedDeviceId || null)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                                    isWebcamActive
                                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                                }`}
                                            >
                                                {isWebcamActive ? (
                                                    <>
                                                        <CameraOff className="w-3.5 h-3.5" />
                                                        <span>Disconnect</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Camera className="w-3.5 h-3.5" />
                                                        <span>Connect Camera</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Wireless Settings shortcut */}
                                        <button
                                            onClick={(e) => handleOpenWirelessModal(currentCam, e)}
                                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                                        >
                                            <Sliders className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="hidden sm:inline">Wireless Link</span>
                                        </button>

                                        {/* Capture Snapshot Button */}
                                        {isWebcamActive && (
                                            <button
                                                onClick={handleCaptureSnapshot}
                                                title="Save Evidence Snapshot"
                                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Snapshot</span>
                                            </button>
                                        )}

                                        {/* AI Overlay Toggle */}
                                        <button
                                            onClick={() => setShowAiOverlay(!showAiOverlay)}
                                            title={showAiOverlay ? "Hide AI Vision Overlay" : "Show AI Vision Overlay"}
                                            className={`p-2 rounded-xl border transition-colors ${
                                                showAiOverlay
                                                    ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                            }`}
                                        >
                                            {showAiOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono text-white/60 hidden md:inline">
                                            {new Date().toLocaleTimeString()}
                                        </span>
                                        <button
                                            onClick={toggleFullscreen}
                                            title="Toggle Fullscreen"
                                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-colors"
                                        >
                                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Analytics Strip */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-panel p-3.5 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
                                {isShowingLaptopFeed && isWebcamActive ? 'Visual Activity' : 'Traffic Density'}
                            </p>
                            <p className="text-xl font-mono text-blue-400 font-bold">{currentCam.isPoweredOn ? `${density}%` : 'OFFLINE'}</p>
                        </div>
                        <div className="glass-panel p-3.5 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
                                Link Mode
                            </p>
                            <p className="text-xl font-mono text-white font-bold flex items-center justify-center gap-1.5">
                                {currentCam.connectionType === 'wifi' ? (
                                    <><Wifi className="w-4 h-4 text-sky-400" /> Wi-Fi</>
                                ) : (
                                    <><Bluetooth className="w-4 h-4 text-indigo-400" /> BT 5.3</>
                                )}
                            </p>
                        </div>
                        <div className="glass-panel p-3.5 border-blue-500/10 text-center">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Signal Quality</p>
                            <p className="text-xl font-mono text-emerald-400 font-bold">
                                {currentCam.isPoweredOn ? `${currentCam.signalStrength}%` : '0%'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. AI Intelligence Solution Panel */}
                <div className="lg:col-span-1 space-y-4 flex flex-col overflow-hidden">
                    <div className="glass-panel p-5 border-blue-500/20 bg-blue-500/[0.03] flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                    <Brain className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">Neural Solution</h2>
                                    <p className="text-[10px] text-white/40">Adaptive Machine Vision</p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={aiSolution.action}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-blue-600/20 border border-blue-500/40 p-4 rounded-2xl">
                                        <p className="text-blue-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                                            <Zap size={12} className="fill-blue-400" />
                                            Active Decision
                                        </p>
                                        <h3 className="text-white font-bold text-base leading-snug">{aiSolution.action}</h3>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Neural Rationale</p>
                                        <p className="text-xs text-white/80 leading-relaxed italic">
                                            "{aiSolution.details}"
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="pt-4 border-t border-white/10 mt-4">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-3">Live Feed Trend</p>
                            <div className="h-[90px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="density"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#colorDensity)"
                                            animationDuration={300}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 border-yellow-500/20 bg-yellow-500/[0.04] flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                        <p className="text-[11px] font-semibold text-yellow-200/70 leading-snug">
                            {currentCam.isPoweredOn
                                ? `Active Node: ${currentCam.name} over ${currentCam.connectionType.toUpperCase()} link (${currentCam.signalStrength}%).`
                                : `Alert: ${currentCam.name} is powered OFF. Switch ON to resume monitoring.`}
                        </p>
                    </div>
                </div>

            </div>

            {/* Wireless & Bluetooth Pairing Modal / Options Drawer */}
            <AnimatePresence>
                {activeModalCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setActiveModalCamera(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-navy-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
                                        {activeModalCamera.connectionType === 'wifi' ? (
                                            <Wifi className="w-5 h-5" />
                                        ) : (
                                            <Bluetooth className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white leading-tight">
                                            {activeModalCamera.name}
                                        </h3>
                                        <p className="text-xs text-white/50">Wireless Link & Protocol Configuration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModalCamera(null)}
                                    className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Power Status & Toggle in Modal */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div>
                                    <span className="text-xs font-bold text-white block">Camera Power State</span>
                                    <span className="text-[11px] text-white/50">
                                        Hardware unit currently {activeModalCamera.isPoweredOn ? 'Operational' : 'Powered Down'}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        toggleCameraPower(activeModalCamera.id, e);
                                        setActiveModalCamera(prev => ({ ...prev, isPoweredOn: !prev.isPoweredOn }));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase flex items-center gap-2 transition-all ${
                                        activeModalCamera.isPoweredOn
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                                >
                                    <Power className="w-4 h-4" />
                                    <span>{activeModalCamera.isPoweredOn ? 'POWER: ON' : 'POWER: OFF'}</span>
                                </button>
                            </div>

                            {/* Connection Protocol Selector: Wi-Fi vs Bluetooth */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-2.5">
                                    Active Wireless Protocol
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCameras(prev => prev.map(c => c.id === activeModalCamera.id ? {
                                                ...c,
                                                connectionType: 'wifi',
                                                frequency: '5.8 GHz'
                                            } : c));
                                            setActiveModalCamera(prev => ({ ...prev, connectionType: 'wifi', frequency: '5.8 GHz' }));
                                        }}
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                                            activeModalCamera.connectionType === 'wifi'
                                                ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-900/30 ring-1 ring-sky-400'
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Wifi className={`w-6 h-6 ${activeModalCamera.connectionType === 'wifi' ? 'text-sky-400' : 'text-white/40'}`} />
                                        <div className="text-center">
                                            <span className="text-xs font-bold block">Wi-Fi Connection</span>
                                            <span className="text-[10px] text-white/40">High Throughput (5.8 GHz)</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCameras(prev => prev.map(c => c.id === activeModalCamera.id ? {
                                                ...c,
                                                connectionType: 'bluetooth',
                                                frequency: 'BLE 5.3'
                                            } : c));
                                            setActiveModalCamera(prev => ({ ...prev, connectionType: 'bluetooth', frequency: 'BLE 5.3' }));
                                        }}
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                                            activeModalCamera.connectionType === 'bluetooth'
                                                ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-400'
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Bluetooth className={`w-6 h-6 ${activeModalCamera.connectionType === 'bluetooth' ? 'text-indigo-400' : 'text-white/40'}`} />
                                        <div className="text-center">
                                            <span className="text-xs font-bold block">Bluetooth Link</span>
                                            <span className="text-[10px] text-white/40">BLE 5.3 Mesh Network</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Telemetry and Connection Details */}
                            <div className="p-4 bg-navy-950/80 rounded-2xl border border-white/10 space-y-2 text-xs font-mono">
                                <div className="flex justify-between items-center text-white/70">
                                    <span>Network Identifier</span>
                                    <span className="text-blue-300 font-bold">
                                        {activeModalCamera.connectionType === 'wifi' ? activeModalCamera.wifiSsid : activeModalCamera.btDeviceName}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-white/70">
                                    <span>IP Address</span>
                                    <span className="text-emerald-400">{activeModalCamera.ipAddress}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/70">
                                    <span>Hardware MAC</span>
                                    <span className="text-white/60">{activeModalCamera.macAddress}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/70">
                                    <span>Signal Quality</span>
                                    <span className="text-emerald-400 font-bold">{activeModalCamera.signalStrength}% Quality</span>
                                </div>
                            </div>

                            {/* Scan / Reconnect Action */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleScanWireless}
                                    disabled={isScanningWireless}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                                >
                                    {isScanningWireless ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Scanning & Linking...
                                        </>
                                    ) : (
                                        <>
                                            {activeModalCamera.connectionType === 'bluetooth' ? (
                                                <BluetoothSearching className="w-4 h-4" />
                                            ) : (
                                                <Wifi className="w-4 h-4" />
                                            )}
                                            {activeModalCamera.connectionType === 'bluetooth' ? 'Scan & Pair Bluetooth' : 'Scan & Link Wi-Fi'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveModalCamera(null)}
                                    className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CCTVFeeds;
