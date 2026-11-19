import React, { useState, useEffect, useMemo } from 'react';
import {
    Receipt,
    Search,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    Car,
    User,
    MapPin,
    Calendar,
    QrCode,
    CreditCard,
    Download,
    Mail,
    Filter,
    FileText,
    ExternalLink,
    Camera,
    Sparkles,
    Eye,
    TrendingUp,
    RefreshCw,
    X,
    Phone,
    Check,
    Send,
    Printer,
    Sliders,
    Zap,
    History,
    Database,
    BarChart3
} from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import {
    getChallansList,
    lookupVahanVehicle,
    autoIssueAIViolation,
    createManualChallan,
    processChallanPayment,
    emailChallanNotice,
    getPaymentsList,
    getEnforcementReports,
    DEFAULT_VAHAN_DATABASE
} from '../services/echallanService';

const EChallan = () => {
    // Tab State: 'registry', 'ai-detector', 'vahan-lookup', 'payments', 'reports'
    const [activeTab, setActiveTab] = useState('registry');

    // Data State
    const [challans, setChallans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [reports, setReports] = useState(null);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [violationFilter, setViolationFilter] = useState('ALL');

    // Modal States
    const [selectedChallan, setSelectedChallan] = useState(null);
    const [paymentModalChallan, setPaymentModalChallan] = useState(null);
    const [emailModalChallan, setEmailModalChallan] = useState(null);
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [aiSimulationModalOpen, setAiSimulationModalOpen] = useState(false);

    // Action Feedback
    const [toastMessage, setToastMessage] = useState(null);
    const [isAutonomousAIEnabled, setIsAutonomousAIEnabled] = useState(true);

    // Vahan Search State
    const [vahanSearchPlate, setVahanSearchPlate] = useState('DL 01 AB 1234');
    const [vahanRecord, setVahanRecord] = useState(null);

    // Payment Form State
    const [paymentMethod, setPaymentMethod] = useState('UPI / Google Pay');
    const [payerName, setPayerName] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Email Form State
    const [emailRecipient, setEmailRecipient] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Manual Challan Form State
    const [manualForm, setManualForm] = useState({
        plate_no: 'DL 08 BK 9021',
        violation_type: 'Driving Without Helmet (Sec 194D MVA)',
        fine_amount: 1000,
        officer_name: 'Insp. R. Sharma',
        officer_badge: 'DL-TP-409',
        location_name: 'Connaught Place Outer Circle',
        gps_lat: 28.6315,
        gps_lng: 77.2167,
        notes: 'Observed during interceptor patrol.'
    });

    // AI Simulation Form State
    const [aiSimForm, setAiSimForm] = useState({
        plate_no: 'HR 26 EQ 9988',
        violation_type: 'Overspeeding',
        speed: 84.5,
        speed_limit: 50.0,
        location_name: 'Barakhamba Road Corridor',
        gps_lat: 28.6240,
        gps_lng: 77.2380,
        confidence: 0.98
    });

    // Load Data
    const refreshData = () => {
        const loadedChallans = getChallansList(searchQuery, statusFilter, violationFilter);
        setChallans(loadedChallans);
        setPayments(getPaymentsList());
        setReports(getEnforcementReports());
    };

    useEffect(() => {
        refreshData();
    }, [searchQuery, statusFilter, violationFilter]);

    useEffect(() => {
        if (vahanSearchPlate) {
            setVahanRecord(lookupVahanVehicle(vahanSearchPlate));
        }
    }, [vahanSearchPlate]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Auto AI Simulation interval
    useEffect(() => {
        if (!isAutonomousAIEnabled) return;

        const interval = setInterval(() => {
            // 15% random chance every 18 seconds to simulate real-time AI ANPR violation detection
            if (Math.random() > 0.85) {
                const samplePlates = ['DL 01 AB 1234', 'MH 12 CD 5678', 'DL 08 BK 9021', 'HR 26 EQ 9988', 'DL 1T 5543'];
                const violations = ['Red Light Jump', 'Overspeeding', 'Stop Line Crossing', 'Driving Without Helmet'];
                const randomPlate = samplePlates[Math.floor(Math.random() * samplePlates.length)];
                const randomViol = violations[Math.floor(Math.random() * violations.length)];

                const newChl = autoIssueAIViolation({
                    plate_no: randomPlate,
                    violation_type: randomViol,
                    speed: randomViol === 'Overspeeding' ? Math.floor(72 + Math.random() * 20) : null,
                    location_name: 'Rajiv Chowk AI-ANPR Portal',
                    gps_lat: 28.6328,
                    gps_lng: 77.2195,
                    confidence: 0.96
                });

                showToast(`🚨 AI Auto-Issued E-Challan #${newChl.challan_no} to ${randomPlate} for ${randomViol}!`);
                refreshData();
            }
        }, 18000);

        return () => clearInterval(interval);
    }, [isAutonomousAIEnabled]);

    // Handle Payment Submission
    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (!paymentModalChallan) return;

        setIsProcessingPayment(true);
        setTimeout(() => {
            const res = processChallanPayment(
                paymentModalChallan.challan_no,
                paymentMethod,
                payerName || paymentModalChallan.owner_name
            );

            setIsProcessingPayment(false);
            setPaymentModalChallan(null);

            if (res.success) {
                showToast(`✅ Payment of ₹${res.receipt.amount} settled! Receipt #${res.receipt.receipt_no}`);
                refreshData();
                if (selectedChallan && selectedChallan.challan_no === paymentModalChallan.challan_no) {
                    setSelectedChallan(res.challan);
                }
            }
        }, 1200);
    };

    // Handle Email Dispatch
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!emailModalChallan) return;

        setIsSendingEmail(true);
        setTimeout(() => {
            const res = emailChallanNotice(emailModalChallan.challan_no, emailRecipient);
            setIsSendingEmail(false);
            setEmailModalChallan(null);

            if (res.success) {
                showToast(`📧 Official E-Challan summons transmitted to ${emailRecipient}!`);
                refreshData();
            }
        }, 1000);
    };

    // Handle Manual Creation
    const handleManualSubmit = (e) => {
        e.preventDefault();
        const created = createManualChallan(manualForm);
        setManualModalOpen(false);
        showToast(`📋 E-Challan #${created.challan_no} issued successfully!`);
        refreshData();
    };

    // Handle AI Trigger
    const handleAiSimSubmit = (e) => {
        e.preventDefault();
        const created = autoIssueAIViolation({
            plate_no: aiSimForm.plate_no,
            violation_type: aiSimForm.violation_type,
            speed: aiSimForm.violation_type === 'Overspeeding' ? aiSimForm.speed : null,
            speed_limit: aiSimForm.speed_limit,
            location_name: aiSimForm.location_name,
            gps_lat: aiSimForm.gps_lat,
            gps_lng: aiSimForm.gps_lng,
            confidence: aiSimForm.confidence
        });

        setAiSimulationModalOpen(false);
        showToast(`⚡ AI Auto-Generated Challan #${created.challan_no} for ${aiSimForm.plate_no}!`);
        refreshData();
    };

    // Export CSV
    const handleExportCSV = () => {
        const headers = ["Challan_No", "Plate_No", "Owner_Name", "Vehicle_Class", "Violation_Type", "Fine_Amount", "Status", "Date", "Location", "Officer", "Payment_ID"];
        const rows = challans.map(c => [
            c.challan_no,
            c.plate_no,
            `"${c.owner_name}"`,
            `"${c.vehicle_class}"`,
            `"${c.violation_type}"`,
            c.fine_amount,
            c.payment_status,
            `"${c.violation_timestamp}"`,
            `"${c.location_name}"`,
            `"${c.officer_name}"`,
            c.payment_id || "N/A"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ITMS_EChallan_Registry_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 E-Challan CSV Registry exported successfully!");
    };

    // Print or Save PDF
    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="fixed top-20 right-8 z-50 bg-slate-900 border border-blue-500/50 shadow-2xl shadow-blue-500/20 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-top-4">
                    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* Header & Autonomous AI Control Bar */}
            <div className="glass-panel p-6 border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-2xl">
                            <Receipt className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    National E-Challan Enforcement System
                                </h1>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                    VAHAN 4.0 INTEGRATED
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                Automated violation capture, ANPR plate recognition, instant fine computation, UPI QR payments & legal notices.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* AI Autonomous Toggle */}
                    <button
                        onClick={() => {
                            setIsAutonomousAIEnabled(!isAutonomousAIEnabled);
                            showToast(isAutonomousAIEnabled ? "⚠️ AI Autonomous Issuance Paused" : "⚡ AI Autonomous Issuance Activated");
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                            isAutonomousAIEnabled
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
                                : "bg-white/5 border-white/15 text-white/60"
                        }`}
                    >
                        <Zap className={`w-4 h-4 ${isAutonomousAIEnabled ? "text-emerald-400 animate-pulse" : "text-white/40"}`} />
                        <span>AI Auto-Issuance: {isAutonomousAIEnabled ? "ACTIVE" : "STANDBY"}</span>
                    </button>

                    {/* Simulate AI Detection */}
                    <button
                        onClick={() => setAiSimulationModalOpen(true)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
                    >
                        <Camera className="w-4 h-4" />
                        Simulate AI Violation
                    </button>

                    {/* Manual Issue */}
                    <button
                        onClick={() => setManualModalOpen(true)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        Manual Challan
                    </button>

                    {/* Export */}
                    <button
                        onClick={handleExportCSV}
                        className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                        title="Export CSV"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                </div>
            </div>

            {/* KPI Telemetry Banner */}
            {reports && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="glass-panel p-4 border-white/10 space-y-1">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Total Challans</span>
                        <div className="text-2xl font-black text-white">{reports.totalChallans}</div>
                        <span className="text-[10px] text-blue-400 flex items-center gap-1 font-mono">
                            <TrendingUp className="w-3 h-3" /> {reports.aiDetectedPercent}% Issued by AI
                        </span>
                    </div>

                    <div className="glass-panel p-4 border-white/10 space-y-1">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Total Fine Levied</span>
                        <div className="text-2xl font-black text-white">₹{reports.totalLevied.toLocaleString()}</div>
                        <span className="text-[10px] text-white/40 font-mono">Motor Vehicles Act</span>
                    </div>

                    <div className="glass-panel p-4 border-emerald-500/20 bg-emerald-500/[0.03] space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">Revenue Collected</span>
                        <div className="text-2xl font-black text-emerald-400">₹{reports.totalCollected.toLocaleString()}</div>
                        <span className="text-[10px] text-emerald-400/60 font-mono">{reports.paidCount} Paid Challans</span>
                    </div>

                    <div className="glass-panel p-4 border-red-500/20 bg-red-500/[0.03] space-y-1">
                        <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider">Pending Penalties</span>
                        <div className="text-2xl font-black text-red-400">₹{reports.pendingAmount.toLocaleString()}</div>
                        <span className="text-[10px] text-red-400/60 font-mono">{reports.unpaidCount} Awaiting Payment</span>
                    </div>

                    <div className="glass-panel p-4 border-purple-500/20 bg-purple-500/[0.03] space-y-1 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-mono text-purple-400/70 uppercase tracking-wider">Vahan Sync</span>
                        <div className="text-2xl font-black text-purple-300">100% LIVE</div>
                        <span className="text-[10px] text-purple-400/60 font-mono">Real-time RC Lookup</span>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
                {[
                    { id: 'registry', label: 'Challan Registry', icon: Receipt, count: challans.length },
                    { id: 'ai-detector', label: 'AI Detection & ANPR Live', icon: Camera },
                    { id: 'vahan-lookup', label: 'Vahan Vehicle Lookup', icon: Car },
                    { id: 'payments', label: 'Payment Ledger', icon: CreditCard, count: payments.length },
                    { id: 'reports', label: 'Enforcement Analytics', icon: BarChart3 }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
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
            {/* TAB 1: CHALLAN REGISTRY TABLE                                  */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'registry' && (
                <div className="space-y-4">
                    {/* Search & Filter Toolbar */}
                    <div className="glass-panel p-4 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search by Plate (e.g. DL 01 AB 1234), Challan #, Owner, or Location..."
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

                        {/* Status Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-white/40">STATUS:</span>
                            {['ALL', 'UNPAID', 'PAID'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        statusFilter === st
                                            ? "bg-white/20 text-white border border-white/30"
                                            : "bg-white/5 text-white/50 hover:bg-white/10"
                                    }`}
                                >
                                    {st === 'ALL' ? 'All' : st}
                                </button>
                            ))}

                            <span className="text-[11px] font-mono text-white/40 ml-2">VIOLATION:</span>
                            <select
                                value={violationFilter}
                                onChange={(e) => setViolationFilter(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="ALL">All Violations</option>
                                <option value="Red Light">Red Light Jump</option>
                                <option value="Overspeeding">Overspeeding</option>
                                <option value="Helmet">No Helmet</option>
                                <option value="Stop Line">Stop Line Crossing</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass-panel border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                                    <tr>
                                        <th className="p-3.5">Challan No</th>
                                        <th className="p-3.5">Vehicle Details</th>
                                        <th className="p-3.5">Violation Type</th>
                                        <th className="p-3.5">Fine Amount</th>
                                        <th className="p-3.5">Location & Officer</th>
                                        <th className="p-3.5">Date & GPS</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-white/80">
                                    {challans.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-white/40 font-sans">
                                                No e-challans found matching criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        challans.map((c) => (
                                            <tr key={c.challan_no} className="hover:bg-white/[0.02] transition-colors">
                                                {/* Challan No */}
                                                <td className="p-3.5">
                                                    <span className="font-bold text-white block">{c.challan_no}</span>
                                                    {c.ai_detected && (
                                                        <span className="text-[9px] text-blue-400 flex items-center gap-1 font-sans">
                                                            <Sparkles className="w-2.5 h-2.5" /> AI Captured
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Vehicle Details */}
                                                <td className="p-3.5">
                                                    <div className="font-bold text-amber-300 font-mono tracking-wider bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded w-fit">
                                                        {c.plate_no}
                                                    </div>
                                                    <span className="text-[10px] text-white/60 block mt-0.5 font-sans">
                                                        {c.owner_name} • {c.maker_model || c.vehicle_class}
                                                    </span>
                                                </td>

                                                {/* Violation */}
                                                <td className="p-3.5">
                                                    <span className="font-semibold text-white block font-sans">
                                                        {c.violation_type}
                                                    </span>
                                                    {c.violation_speed && (
                                                        <span className="text-[10px] text-red-400 font-mono">
                                                            Speed: {c.violation_speed} km/h (Limit: {c.speed_limit} km/h)
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Fine */}
                                                <td className="p-3.5">
                                                    <span className="font-bold text-base text-white">
                                                        ₹{c.fine_amount.toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Location & Officer */}
                                                <td className="p-3.5 font-sans">
                                                    <div className="text-white/90 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                                                        <span className="truncate max-w-[160px]">{c.location_name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/40 block font-mono">
                                                        {c.officer_name}
                                                    </span>
                                                </td>

                                                {/* Date & GPS */}
                                                <td className="p-3.5">
                                                    <span className="text-white/80 block">{c.violation_timestamp}</span>
                                                    <span className="text-[9px] text-white/40 block font-mono">
                                                        GPS: {c.gps_lat.toFixed(4)}, {c.gps_lng.toFixed(4)}
                                                    </span>
                                                </td>

                                                {/* Payment Status */}
                                                <td className="p-3.5">
                                                    {c.payment_status === 'PAID' ? (
                                                        <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> PAID
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> UNPAID
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-3.5 text-right font-sans">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* View Details Notice */}
                                                        <button
                                                            onClick={() => setSelectedChallan(c)}
                                                            className="p-1.5 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition-colors"
                                                            title="Inspect Legal Challan Notice"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Pay if Unpaid */}
                                                        {c.payment_status === 'UNPAID' && (
                                                            <button
                                                                onClick={() => {
                                                                    setPaymentModalChallan(c);
                                                                    setPayerName(c.owner_name);
                                                                }}
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md transition-colors"
                                                            >
                                                                <CreditCard className="w-3 h-3" /> Pay
                                                            </button>
                                                        )}

                                                        {/* Email Notice */}
                                                        <button
                                                            onClick={() => {
                                                                setEmailModalChallan(c);
                                                                setEmailRecipient(c.owner_email || 'citizen@transport.gov.in');
                                                                setEmailSubject(`Official E-Challan Notice: ${c.challan_no} (${c.plate_no})`);
                                                            }}
                                                            className="p-1.5 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition-colors"
                                                            title="Dispatch Email Notice"
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: AI DETECTION & ANPR LIVE FEED                           */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'ai-detector' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="glass-panel p-6 border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-blue-400" />
                                    AI Computer Vision Violation Interceptor
                                </h3>
                                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE YOLOv8 INFERENCE
                                </span>
                            </div>

                            {/* Simulated Camera View with Live Bounding Boxes */}
                            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black min-h-[380px] flex items-center justify-center shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=1200&h=700&fit=crop')] bg-cover bg-center opacity-40" />

                                {/* Red Light Stop Line & Violation Zone */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute bottom-20 left-0 right-0 border-b-4 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.9)]" />
                                    <span className="absolute bottom-22 left-4 text-[10px] font-mono text-red-300 font-bold bg-black/80 px-2 py-0.5 rounded border border-red-500/40">
                                        VIOLATION THRESHOLD (RED LIGHT STOP LINE)
                                    </span>
                                </div>

                                {/* Active AI Detected Bounding Boxes */}
                                <div className="absolute inset-0 pointer-events-none p-6">
                                    {/* Violating Car (Red Box) */}
                                    <div className="absolute top-[40%] left-[22%] w-36 h-28 border-2 border-red-500 rounded bg-red-500/20 p-1 flex flex-col justify-between shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
                                        <div className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center justify-between">
                                            <span>ANPR: DL 01 AB 1234</span>
                                            <span>0.98</span>
                                        </div>
                                        <div className="bg-black/90 p-1 rounded text-[8px] font-mono text-red-300">
                                            VIOLATION: RED LIGHT JUMP (+8.4m)
                                        </div>
                                    </div>

                                    {/* Speeding Bike */}
                                    <div className="absolute bottom-[24%] right-[28%] w-24 h-24 border-2 border-amber-400 rounded bg-amber-500/10 p-1 flex flex-col justify-between">
                                        <div className="bg-amber-500 text-black font-mono text-[8px] font-bold px-1 rounded">
                                            MH 12 CD 5678 • 76 km/h
                                        </div>
                                        <div className="bg-black/80 p-0.5 rounded text-[7px] text-amber-200 font-mono">
                                            SPEED LIMIT: 50 km/h (EXCESS: +26)
                                        </div>
                                    </div>
                                </div>

                                {/* HUD Overlay */}
                                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono pointer-events-none">
                                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                        ANPR RECOGNITION: ACTIVE • 30 FPS
                                    </div>
                                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-emerald-300 font-bold">
                                        NODE: CAM-1026 (CONN PLACE)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Engine Workflow & Quick Trigger */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 border-white/10 space-y-4">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                Autonomous AI Issuance Pipeline
                            </h4>

                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                    <span className="font-bold text-blue-400 font-mono text-[10px]">STEP 1 • NEURAL VISION</span>
                                    <p className="text-white/70">YOLOv8 scans bounding boxes, classifies vehicles, and tracks stop line & speed vectors.</p>
                                </div>

                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                    <span className="font-bold text-amber-400 font-mono text-[10px]">STEP 2 • ANPR OCR & VAHAN</span>
                                    <p className="text-white/70">Plate number recognized and queried against the Vahan 4.0 database for owner verification.</p>
                                </div>

                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                    <span className="font-bold text-emerald-400 font-mono text-[10px]">STEP 3 • FINE & QR ISSUANCE</span>
                                    <p className="text-white/70">Fine calculated under Motor Vehicles Act, dynamic UPI QR generated, and digital notice dispatched.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setAiSimulationModalOpen(true)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                Trigger Manual AI Violation Test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: VAHAN VEHICLE REGISTRY LOOKUP                          */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'vahan-lookup' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Search & Selection */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 border-white/10 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-purple-400" />
                                Vahan 4.0 Vehicle Registry
                            </h3>
                            <p className="text-xs text-white/50">
                                Look up official registration certificates, owner demographics, engine specs, and past violation records.
                            </p>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Enter Vehicle Plate</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={vahanSearchPlate}
                                        onChange={(e) => setVahanSearchPlate(e.target.value.toUpperCase())}
                                        placeholder="e.g. DL 01 AB 1234"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Preset Plate Quick Buttons */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono text-white/30 uppercase">Test Vehicles:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {DEFAULT_VAHAN_DATABASE.map(v => (
                                        <button
                                            key={v.plate_no}
                                            onClick={() => setVahanSearchPlate(v.plate_no)}
                                            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                                                vahanSearchPlate === v.plate_no
                                                    ? "bg-purple-600 text-white font-bold"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            }`}
                                        >
                                            {v.plate_no}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vahan Certificate Card */}
                    <div className="lg:col-span-2">
                        {vahanRecord ? (
                            <div className="glass-panel p-6 border-purple-500/20 bg-purple-500/[0.02] space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                                            Ministry of Road Transport & Highways • Parivahan Sewa
                                        </span>
                                        <h3 className="text-2xl font-black text-amber-300 font-mono tracking-wider mt-1">
                                            {vahanRecord.plate_no}
                                        </h3>
                                        <p className="text-xs text-white/70">{vahanRecord.maker_model} ({vahanRecord.vehicle_class})</p>
                                    </div>

                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full font-mono">
                                            RC: {vahanRecord.rc_status.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-white/40 block mt-1 font-mono">
                                            Reg: {vahanRecord.registration_date}
                                        </span>
                                    </div>
                                </div>

                                {/* Demographics Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                        <span className="text-[10px] text-white/40 font-mono uppercase">Registered Owner</span>
                                        <p className="font-bold text-white text-sm">{vahanRecord.owner_name}</p>
                                        <p className="text-white/60 font-mono">{vahanRecord.owner_phone}</p>
                                        <p className="text-white/60 font-mono">{vahanRecord.owner_email}</p>
                                    </div>

                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                        <span className="text-[10px] text-white/40 font-mono uppercase">Registered Address</span>
                                        <p className="text-white/90 leading-relaxed">{vahanRecord.owner_address}</p>
                                    </div>

                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                        <span className="text-[10px] text-white/40 font-mono uppercase">Technical Specifications</span>
                                        <p className="font-mono text-white/80">Chassis No: <span className="font-bold text-white">{vahanRecord.chassis_no}</span></p>
                                        <p className="font-mono text-white/80">Engine No: <span className="font-bold text-white">{vahanRecord.engine_no}</span></p>
                                        <p className="font-mono text-white/80">Fuel: <span className="text-emerald-300">{vahanRecord.fuel_type || 'Petrol'}</span></p>
                                    </div>

                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                        <span className="text-[10px] text-white/40 font-mono uppercase">Compliance & Validity</span>
                                        <p className="text-white/80 font-mono">Insurance Upto: <span className="font-bold text-emerald-400">{vahanRecord.insurance_valid_upto}</span></p>
                                        <p className="text-white/80 font-mono">PUCC Upto: <span className="font-bold text-emerald-400">{vahanRecord.pucc_valid_upto}</span></p>
                                    </div>
                                </div>

                                {/* Associated Challans for this vehicle */}
                                <div className="space-y-2 pt-2">
                                    <span className="text-xs font-bold text-white flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-blue-400" />
                                        Offence History for {vahanRecord.plate_no}
                                    </span>
                                    <div className="space-y-2">
                                        {challans.filter(c => c.plate_no.replace(/\s/g, '').toUpperCase() === vahanRecord.plate_no.replace(/\s/g, '').toUpperCase()).map(c => (
                                            <div key={c.challan_no} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-bold text-white font-mono">{c.challan_no}</span>
                                                    <span className="text-white/60 ml-2 font-sans">{c.violation_type}</span>
                                                    <span className="text-[10px] text-white/40 block font-mono mt-0.5">{c.violation_timestamp} • {c.location_name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-white">₹{c.fine_amount}</span>
                                                    <span className={`block text-[9px] font-bold font-mono ${c.payment_status === 'PAID' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {c.payment_status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-12 text-center text-white/40">
                                Enter a license plate to query Vahan records.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: PAYMENT LEDGER                                         */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'payments' && (
                <div className="glass-panel border-white/10 overflow-hidden space-y-4 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-emerald-400" />
                                Settled E-Challan Payment History & Treasury Ledger
                            </h3>
                            <p className="text-xs text-white/50">Audit log of all online UPI, Net Banking, and Debit card transactions credited to the State Treasury.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                                <tr>
                                    <th className="p-3">Receipt No</th>
                                    <th className="p-3">Transaction ID</th>
                                    <th className="p-3">Challan No</th>
                                    <th className="p-3">Payer Name</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Gateway Ref</th>
                                    <th className="p-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-white/80">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02]">
                                        <td className="p-3 font-bold text-emerald-300">{p.receipt_no}</td>
                                        <td className="p-3 text-white/90">{p.transaction_id}</td>
                                        <td className="p-3 text-blue-400 font-bold">{p.challan_no}</td>
                                        <td className="p-3 font-sans text-white">{p.payer_name}</td>
                                        <td className="p-3 font-bold text-white">₹{p.amount.toLocaleString()}</td>
                                        <td className="p-3 text-white/70">{p.payment_method}</td>
                                        <td className="p-3 text-white/60">{p.timestamp}</td>
                                        <td className="p-3 text-white/40 text-[10px]">{p.gateway_ref}</td>
                                        <td className="p-3 text-right">
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: ENFORCEMENT REPORTS & ANALYTICS                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'reports' && reports && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Violation Breakdown */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Top Traffic Violations Breakdown
                        </h4>
                        <div className="space-y-3">
                            {reports.violationBreakdown.map((vb) => (
                                <div key={vb.type} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/80 font-sans">{vb.type}</span>
                                        <span className="font-mono text-white/60">{vb.count} challans ({vb.percent}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                                            style={{ width: `${vb.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* High-Offence Corridors */}
                    <div className="glass-panel p-6 border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            High-Offence Hotspot Junctions
                        </h4>
                        <div className="space-y-3">
                            {reports.hotspots.map((hs, i) => (
                                <div key={hs.location} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono text-[10px]">
                                            #{i + 1}
                                        </span>
                                        <span className="font-sans text-white/90">{hs.location}</span>
                                    </div>
                                    <span className="font-mono font-bold text-red-300">{hs.count} Violations</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL 1: OFFICIAL PRINTABLE CHALLAN NOTICE WITH QR CODE       */}
            {/* ============================================================= */}
            {selectedChallan && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {/* Header with National Emblem / Police Badge */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                                        Traffic Police Department • Govt of NCT Delhi
                                    </span>
                                    <h2 className="text-xl font-black text-white">OFFICIAL E-CHALLAN SUMMONS NOTICE</h2>
                                    <p className="text-xs font-mono text-white/50">Notice under Section 133 of the Motor Vehicles Act, 1988</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedChallan(null)}
                                className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Challan & Plate Identity Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-mono">
                            <div>
                                <span className="text-[10px] text-white/40 block">CHALLAN NUMBER</span>
                                <span className="font-bold text-white text-sm">{selectedChallan.challan_no}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/40 block">REGISTRATION PLATE</span>
                                <span className="font-bold text-amber-300 text-sm">{selectedChallan.plate_no}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-white/40 block">PAYMENT STATUS</span>
                                <span className={`font-bold ${selectedChallan.payment_status === 'PAID' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {selectedChallan.payment_status}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Offence Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2 p-4 bg-black/40 border border-white/10 rounded-2xl">
                                <span className="text-[10px] font-mono text-white/40 uppercase block font-bold">Offender & Vehicle Info</span>
                                <p><span className="text-white/40">Owner:</span> <strong className="text-white">{selectedChallan.owner_name}</strong></p>
                                <p><span className="text-white/40">Vehicle:</span> <span className="text-white">{selectedChallan.maker_model || selectedChallan.vehicle_class}</span></p>
                                <p><span className="text-white/40">Contact:</span> <span className="text-white/80 font-mono">{selectedChallan.owner_phone}</span></p>
                                <p><span className="text-white/40">Email:</span> <span className="text-white/80 font-mono">{selectedChallan.owner_email}</span></p>
                            </div>

                            <div className="space-y-2 p-4 bg-black/40 border border-white/10 rounded-2xl">
                                <span className="text-[10px] font-mono text-white/40 uppercase block font-bold">Incident Telemetry</span>
                                <p><span className="text-white/40">Violation:</span> <strong className="text-red-400">{selectedChallan.violation_type}</strong></p>
                                <p><span className="text-white/40">Location:</span> <span className="text-white">{selectedChallan.location_name}</span></p>
                                <p><span className="text-white/40">GPS:</span> <span className="text-white/80 font-mono">{selectedChallan.gps_lat}, {selectedChallan.gps_lng}</span></p>
                                <p><span className="text-white/40">Timestamp:</span> <span className="text-white/80 font-mono">{selectedChallan.violation_timestamp}</span></p>
                                <p><span className="text-white/40">Issuing Officer:</span> <span className="text-white">{selectedChallan.officer_name}</span></p>
                            </div>
                        </div>

                        {/* Evidence & QR Code Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            {/* Evidence Photo */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-white/40 uppercase block">ANPR Photographic Evidence</span>
                                <div className="relative rounded-xl overflow-hidden border border-white/20 aspect-video bg-black flex items-center justify-center">
                                    <img
                                        src={selectedChallan.evidence_image_url}
                                        alt="Violation Photographic Evidence"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300">
                                        ANPR: {selectedChallan.plate_no}
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic QR Code & Payment Amount */}
                            <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-center">
                                <span className="text-[10px] font-mono text-white/40 uppercase mb-2">Instant UPI Payment QR</span>
                                <QRCodeDisplay value={selectedChallan.qr_payload} size={150} />
                                <div className="mt-3">
                                    <span className="text-xs text-white/60">Total Penalty Due:</span>
                                    <div className="text-2xl font-black text-emerald-400">₹{selectedChallan.fine_amount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between border-t border-white/10 pt-4 flex-wrap gap-3">
                            <span className="text-[10px] text-white/40 font-mono">Pay within 60 days to prevent virtual court summons.</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handlePrintPDF}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Printer className="w-4 h-4" /> Print / Save PDF
                                </button>
                                {selectedChallan.payment_status === 'UNPAID' && (
                                    <button
                                        onClick={() => {
                                            setPaymentModalChallan(selectedChallan);
                                            setPayerName(selectedChallan.owner_name);
                                        }}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                                    >
                                        <CreditCard className="w-4 h-4" /> Pay ₹{selectedChallan.fine_amount} Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL 2: INSTANT PAYMENT GATEWAY MODAL                        */}
            {/* ============================================================= */}
            {paymentModalChallan && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-base font-bold text-white">Online E-Challan Settlement</h3>
                            </div>
                            <button
                                onClick={() => setPaymentModalChallan(null)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-white/40 font-mono">Challan:</span>
                                <span className="font-bold text-white font-mono">{paymentModalChallan.challan_no}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40 font-mono">Vehicle:</span>
                                <span className="font-bold text-amber-300 font-mono">{paymentModalChallan.plate_no}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40 font-mono">Penalty Amount:</span>
                                <span className="font-bold text-emerald-400 text-sm">₹{paymentModalChallan.fine_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Payer / Citizen Name</label>
                                <input
                                    type="text"
                                    required
                                    value={payerName}
                                    onChange={(e) => setPayerName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="UPI / Google Pay">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                                    <option value="Net Banking / SBI">State Bank of India Net Banking</option>
                                    <option value="Net Banking / HDFC">HDFC Net Banking</option>
                                    <option value="Debit Card / RuPay">RuPay / Visa Debit Card</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessingPayment}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                            >
                                {isProcessingPayment ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Authorizing with Bank Gateway...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Authorize Payment (₹{paymentModalChallan.fine_amount})
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL 3: DISPATCH EMAIL NOTICE MODAL                          */}
            {/* ============================================================= */}
            {emailModalChallan && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <h3 className="text-base font-bold text-white">Email Legal E-Challan Notice</h3>
                            </div>
                            <button
                                onClick={() => setEmailModalChallan(null)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Recipient Registered Email</label>
                                <input
                                    type="email"
                                    required
                                    value={emailRecipient}
                                    onChange={(e) => setEmailRecipient(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 space-y-1">
                                <p className="font-bold text-white">Notice Body Preview:</p>
                                <p>Dear {emailModalChallan.owner_name}, your vehicle {emailModalChallan.plate_no} was detected violating traffic laws ({emailModalChallan.violation_type}) at {emailModalChallan.location_name}. Fine: ₹{emailModalChallan.fine_amount}. Please pay via official UPI portal within 60 days.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingEmail}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                            >
                                {isSendingEmail ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Transmitting Legal Summons...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Transmit Official Notice
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL 4: SIMULATE AI VIOLATION TRIGGER MODAL                  */}
            {/* ============================================================= */}
            {aiSimulationModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-400" />
                                <h3 className="text-base font-bold text-white">Simulate AI Neural Violation</h3>
                            </div>
                            <button
                                onClick={() => setAiSimulationModalOpen(false)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAiSimSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">License Plate ANPR</label>
                                <input
                                    type="text"
                                    required
                                    value={aiSimForm.plate_no}
                                    onChange={(e) => setAiSimForm({ ...aiSimForm, plate_no: e.target.value.toUpperCase() })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-amber-300 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Violation Type</label>
                                <select
                                    value={aiSimForm.violation_type}
                                    onChange={(e) => setAiSimForm({ ...aiSimForm, violation_type: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Red Light Jump">Red Light Jump (Sec 184 MVA) - ₹1,000</option>
                                    <option value="Overspeeding">Overspeeding (Sec 183 MVA) - ₹2,000</option>
                                    <option value="Driving Without Helmet">Driving Without Helmet (Sec 194D MVA) - ₹1,000</option>
                                    <option value="Stop Line Crossing">Stop Line Crossing (Sec 177 MVA) - ₹500</option>
                                    <option value="Wrong Way Driving">Wrong Way Driving (Sec 184(f) MVA) - ₹5,000</option>
                                    <option value="Mobile Phone While Driving">Mobile Phone Usage (Sec 184(c) MVA) - ₹5,000</option>
                                </select>
                            </div>

                            {aiSimForm.violation_type === 'Overspeeding' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-white/40 uppercase">Recorded Speed (km/h)</label>
                                        <input
                                            type="number"
                                            value={aiSimForm.speed}
                                            onChange={(e) => setAiSimForm({ ...aiSimForm, speed: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-white/40 uppercase">Speed Limit (km/h)</label>
                                        <input
                                            type="number"
                                            value={aiSimForm.speed_limit}
                                            onChange={(e) => setAiSimForm({ ...aiSimForm, speed_limit: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Camera Detection Location</label>
                                <input
                                    type="text"
                                    value={aiSimForm.location_name}
                                    onChange={(e) => setAiSimForm({ ...aiSimForm, location_name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                Ingest AI Violation & Auto-Issue Challan
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* MODAL 5: MANUAL ON-GROUND CHALLAN ISSUANCE                     */}
            {/* ============================================================= */}
            {manualModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-400" />
                                <h3 className="text-base font-bold text-white">Manual Interceptor E-Challan</h3>
                            </div>
                            <button
                                onClick={() => setManualModalOpen(false)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Vehicle Plate</label>
                                <input
                                    type="text"
                                    required
                                    value={manualForm.plate_no}
                                    onChange={(e) => setManualForm({ ...manualForm, plate_no: e.target.value.toUpperCase() })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Violation Clause</label>
                                <select
                                    value={manualForm.violation_type}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        let fine = 1000;
                                        if (type.includes('Stop Line')) fine = 500;
                                        if (type.includes('Wrong Way') || type.includes('Mobile Phone')) fine = 5000;
                                        if (type.includes('Overspeeding')) fine = 2000;
                                        setManualForm({ ...manualForm, violation_type: type, fine_amount: fine });
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="Driving Without Helmet (Sec 194D MVA)">Driving Without Helmet - ₹1,000</option>
                                    <option value="Red Light Jump (Sec 184 MVA)">Red Light Jump - ₹1,000</option>
                                    <option value="Overspeeding (Sec 183 MVA)">Overspeeding - ₹2,000</option>
                                    <option value="Stop Line Crossing (Sec 177 MVA)">Stop Line Crossing - ₹500</option>
                                    <option value="Triple Riding (Sec 194C MVA)">Triple Riding - ₹1,000</option>
                                    <option value="Driving Without Seatbelt (Sec 194B MVA)">No Seatbelt - ₹1,000</option>
                                    <option value="Wrong Way Driving (Sec 184(f) MVA)">Wrong Way Driving - ₹5,000</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Fine Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={manualForm.fine_amount}
                                    onChange={(e) => setManualForm({ ...manualForm, fine_amount: Number(e.target.value) })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Officer Name</label>
                                    <input
                                        type="text"
                                        value={manualForm.officer_name}
                                        onChange={(e) => setManualForm({ ...manualForm, officer_name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-white/40 uppercase">Badge Number</label>
                                    <input
                                        type="text"
                                        value={manualForm.officer_badge}
                                        onChange={(e) => setManualForm({ ...manualForm, officer_badge: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase">Location</label>
                                <input
                                    type="text"
                                    value={manualForm.location_name}
                                    onChange={(e) => setManualForm({ ...manualForm, location_name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
                            >
                                <Check className="w-4 h-4" />
                                Issue Manual Challan
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EChallan;
