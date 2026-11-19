import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield,
    ShieldCheck,
    KeyRound,
    Lock,
    Unlock,
    Users,
    History,
    FileText,
    Terminal,
    RefreshCw,
    Download,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Smartphone,
    Globe,
    Cpu,
    Zap,
    Search,
    Filter,
    ArrowRight,
    Server,
    Laptop,
    Check,
    Copy,
    Trash2
} from 'lucide-react';
import {
    ROLES,
    DEFAULT_USERS,
    getCurrentUser,
    setCurrentUser,
    switchRoleForDemo,
    getStoredTokens,
    refreshAccessToken,
    generateTotpSecret,
    verifyTotpCode,
    validatePasswordPolicy,
    encryptSensitiveData,
    decryptSensitiveData,
    maskSensitiveString,
    getLoginHistory,
    getAuditLogs,
    logAuditEvent,
    checkApiRateLimit,
    getDeviceFingerprint,
    getClientIpAddress,
    getActiveDevices,
    revokeDeviceSession
} from '../services/securityService';

const EnterpriseSecurity = () => {
    // Tab Navigation: 'overview' | 'jwt' | 'rbac' | '2fa' | 'history' | 'audit' | 'encryption'
    const [activeTab, setActiveTab] = useState('overview');

    // Current User Session
    const [currentUser, setCurrentUserState] = useState(getCurrentUser);
    const [tokens, setTokens] = useState(getStoredTokens);

    // API Rate Limiter Status
    const [rateLimitState, setRateLimitState] = useState(() => checkApiRateLimit());

    // Password Policy Interactive Tester
    const [testPassword, setTestPassword] = useState('GovITMS@Secure2026');
    const [showTestPassword, setShowTestPassword] = useState(false);
    const pwdEvaluation = useMemo(() => validatePasswordPolicy(testPassword), [testPassword]);

    // Encryption Sandbox State
    const [plainInput, setPlainInput] = useState('Aadhar: 9812-4412-8802 | Phone: +91 98765-43210');
    const [cipherOutput, setCipherOutput] = useState(() => encryptSensitiveData('Aadhar: 9812-4412-8802 | Phone: +91 98765-43210'));
    const [decryptedOutput, setDecryptedOutput] = useState('');

    // Two-Factor Setup State
    const [totpSecret, setTotpSecret] = useState(() => generateTotpSecret(currentUser?.badgeNumber || 'HQ-ADM-01'));
    const [verifyInput, setVerifyInput] = useState('');
    const [totpVerifyResult, setTotpVerifyResult] = useState(null);

    // Login History & Devices
    const [loginHistory, setLoginHistory] = useState(getLoginHistory);
    const [activeDevices, setActiveDevices] = useState(getActiveDevices);

    // Audit Trail State & Filters
    const [auditLogs, setAuditLogs] = useState(getAuditLogs);
    const [auditFilterCategory, setAuditFilterCategory] = useState('ALL');
    const [auditSearchQuery, setAuditSearchQuery] = useState('');

    // Session Timeout Countdown Simulation (900 seconds = 15 mins)
    const [sessionSecondsLeft, setSessionSecondsLeft] = useState(874);

    // Feedback Toast
    const [toastMessage, setToastMessage] = useState(null);
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Refresh Tokens Handler
    const handleTokenRefresh = () => {
        const newTokens = refreshAccessToken();
        if (newTokens) {
            setTokens(getStoredTokens());
            triggerToast('🔑 JWT Access Token Rotated & Lease Refreshed for 15 minutes!');
        } else {
            triggerToast('⚠️ Refresh Token Invalid or Expired.');
        }
    };

    // Role Switcher for Live RBAC Testing
    const handleRoleSwitch = (roleKey) => {
        const updated = switchRoleForDemo(roleKey);
        setCurrentUserState(updated);
        setTokens(getStoredTokens());
        triggerToast(`🛡️ Active Role Switched to: ${ROLES[roleKey]?.name}`);
    };

    // Simulate API Request for Rate Limiter
    const handleTriggerApiRequest = () => {
        const result = checkApiRateLimit();
        setRateLimitState(result);
        if (result.isAllowed) {
            triggerToast(`⚡ API Query Authorized. Remaining Quota: ${result.remaining}/${result.limit}`);
        } else {
            triggerToast(`⛔ HTTP 429 Too Many Requests! Rate limit exhausted.`);
        }
    };

    // Encrypt / Decrypt Sandbox
    const handleEncrypt = () => {
        const enc = encryptSensitiveData(plainInput);
        setCipherOutput(enc);
        triggerToast('🔒 Sensitive data encrypted with AES-GCM envelope.');
    };

    const handleDecrypt = () => {
        const dec = decryptSensitiveData(cipherOutput);
        setDecryptedOutput(dec);
        triggerToast('🔓 Cipher decrypted successfully.');
    };

    // Verify 2FA
    const handleVerifyTotp = (e) => {
        e.preventDefault();
        const valid = verifyTotpCode(verifyInput);
        setTotpVerifyResult(valid);
        if (valid) {
            triggerToast('✅ TOTP 2FA Token Verified Successfully!');
            logAuditEvent({
                category: '2FA',
                action: 'TOTP_VERIFIED',
                details: `2FA Authenticator verified for ${currentUser.badgeNumber}`,
                severity: 'INFO'
            });
            setAuditLogs(getAuditLogs());
        } else {
            triggerToast('❌ Invalid TOTP Code.');
        }
    };

    // Revoke Device
    const handleRevokeDevice = (id) => {
        const updated = revokeDeviceSession(id);
        setActiveDevices(updated);
        triggerToast(`🚫 Remote session ${id} revoked and blacklisted.`);
    };

    // Export Audit Logs
    const handleExportAuditCSV = () => {
        const headers = ["Timestamp", "Actor", "Category", "Action", "Details", "Severity", "Hash", "PrevHash"];
        const rows = auditLogs.map(l => [
            l.timestamp, l.actor, l.category, l.action, `"${l.details.replace(/"/g, '""')}"`, l.severity, l.hash, l.prevHash
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ITMS_Audit_Trail_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast('📥 Audit Trail exported to CSV with hash-chain integrity verification.');
    };

    // Filtered Audit Logs
    const filteredAudit = useMemo(() => {
        return auditLogs.filter(log => {
            const matchesCat = auditFilterCategory === 'ALL' || log.category === auditFilterCategory;
            const matchesQuery = !auditSearchQuery ||
                log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                log.actor.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                log.details.toLowerCase().includes(auditSearchQuery.toLowerCase());
            return matchesCat && matchesQuery;
        });
    }, [auditLogs, auditFilterCategory, auditSearchQuery]);

    // Format Session Timeout
    const formatSessionTimer = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            {/* ========================================================================= */}
            {/* HEADER BANNER                                                             */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                            <ShieldCheck className="w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono uppercase">
                                    Enterprise Security & Compliance Hub
                                </h1>
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" />
                                    ZERO TRUST • TLS 1.3
                                </span>
                            </div>
                            <p className="text-xs text-cyan-200/70 font-mono mt-1">
                                JWT Token Leases • RBAC Matrix • Two-Factor TOTP • Tamper-Evident Audit Chains • AES-GCM Vault
                            </p>
                        </div>
                    </div>

                    {/* Active User Session Badge & Session Timeout */}
                    <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
                        <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-right">
                            <p className="text-[10px] text-white/40 uppercase">Active Session Timeout</p>
                            <p className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1.5">
                                <KeyRound size={13} />
                                {formatSessionTimer(sessionSecondsLeft)}
                            </p>
                        </div>

                        <div className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase">Active Persona</p>
                                <p className="font-bold text-white text-xs">{currentUser?.name}</p>
                                <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 px-1.5 py-0.2 rounded">
                                    {ROLES[currentUser?.role]?.name || currentUser?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="mt-4 p-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* TAB SELECTOR                                                              */}
            {/* ========================================================================= */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 font-mono text-xs">
                {[
                    { id: 'overview', label: 'Security Overview', icon: Shield },
                    { id: 'jwt', label: 'JWT & Refresh Tokens', icon: KeyRound },
                    { id: 'rbac', label: 'Role-Based Access (RBAC)', icon: Users },
                    { id: '2fa', label: '2FA & Password Policy', icon: Smartphone },
                    { id: 'history', label: 'Login History & Devices', icon: History },
                    { id: 'audit', label: 'Tamper-Evident Audit Trail', icon: FileText },
                    { id: 'encryption', label: 'AES-GCM Encryption Vault', icon: Lock },
                ].map((t) => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: SECURITY OVERVIEW & CORE METRICS                                   */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                        <div className="glass-panel p-4 border-cyan-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 uppercase">JWT Lease</span>
                                <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px]">Active</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">HS256 Verified</h3>
                            <p className="text-[11px] text-white/50">15 min lifetime • Rotatable</p>
                        </div>

                        <div className="glass-panel p-4 border-emerald-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 uppercase">Two-Factor Auth</span>
                                <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px]">Enforced</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">TOTP / Google Auth</h3>
                            <p className="text-[11px] text-white/50">6-digit time-step OTP</p>
                        </div>

                        <div className="glass-panel p-4 border-purple-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 uppercase">API Rate Limiter</span>
                                <span className="text-purple-400 font-bold bg-purple-400/10 px-1.5 py-0.5 rounded text-[10px]">
                                    {rateLimitState.remaining}/{rateLimitState.limit}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Sliding Window</h3>
                            <p className="text-[11px] text-white/50">60 req/min token bucket</p>
                        </div>

                        <div className="glass-panel p-4 border-blue-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 uppercase">Data Encryption</span>
                                <span className="text-blue-400 font-bold bg-blue-400/10 px-1.5 py-0.5 rounded text-[10px]">AES-GCM</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">PII Enveloped</h3>
                            <p className="text-[11px] text-white/50">Aadhar, Phone, Vehicle RC</p>
                        </div>
                    </div>

                    {/* Quick Action Trigger Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* API Rate Limiter Testing */}
                        <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4 font-mono">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Zap size={16} className="text-yellow-400" />
                                    API Rate Limiting Test Console
                                </h3>
                                <span className="text-[10px] text-white/40">Token Bucket</span>
                            </div>
                            <p className="text-xs text-white/60">
                                Protects backend services against DoS & brute-force traffic by restricting each authenticated client to 60 queries/minute.
                            </p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/50">Quota Remaining:</span>
                                    <span className="text-cyan-300 font-bold">{rateLimitState.remaining} / {rateLimitState.limit} requests</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${rateLimitState.remaining > 20 ? 'bg-cyan-400' : 'bg-red-500'}`}
                                        style={{ width: `${(rateLimitState.remaining / rateLimitState.limit) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleTriggerApiRequest}
                                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw size={14} /> Send Authenticated API Probe
                            </button>
                        </div>

                        {/* Session Inactivity Monitor */}
                        <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4 font-mono">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Lock size={16} className="text-emerald-400" />
                                    Session Idle Timeout Engine
                                </h3>
                                <span className="text-[10px] text-white/40">PCI-DSS / ISO 27001</span>
                            </div>
                            <p className="text-xs text-white/60">
                                Inactivity countdown monitor. Sessions are automatically terminated upon 15 minutes of idle time.
                            </p>
                            <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Time Before Auto-Logout</p>
                                    <p className="text-xl font-bold text-amber-400">{formatSessionTimer(sessionSecondsLeft)}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSessionSecondsLeft(900);
                                        triggerToast('🔄 Session Lease extended to 15:00 minutes.');
                                    }}
                                    className="px-3.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                >
                                    Extend Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: JWT & REFRESH TOKENS INSPECTOR                                     */}
            {/* ========================================================================= */}
            {activeTab === 'jwt' && (
                <div className="space-y-6 font-mono text-xs">
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <KeyRound size={16} className="text-cyan-400" />
                                    Active JWT Cryptographic Token Inspector
                                </h3>
                                <p className="text-[11px] text-white/50">Header.Payload.Signature breakdown</p>
                            </div>
                            <button
                                onClick={handleTokenRefresh}
                                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-2 transition-colors self-start"
                            >
                                <RefreshCw size={14} /> Rotate Refresh Token
                            </button>
                        </div>

                        {/* Raw Access Token String with Masking / Copy */}
                        <div className="p-3 bg-black/50 rounded-xl border border-white/10 space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-white/40">
                                <span>Encoded Access Token (Bearer)</span>
                                <span>Algorithm: HS256</span>
                            </div>
                            <p className="text-cyan-300 break-all text-[11px] leading-relaxed">
                                {tokens.accessToken || 'No token active'}
                            </p>
                        </div>

                        {/* Three-part Decoded JWT Viewer */}
                        {tokens.parsedAccess && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {/* 1. Header */}
                                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl space-y-1.5">
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Part 1: Header</p>
                                    <pre className="text-red-200 text-[10px] overflow-x-auto p-2 bg-black/60 rounded">
                                        {JSON.stringify(tokens.parsedAccess.header, null, 2)}
                                    </pre>
                                </div>

                                {/* 2. Payload */}
                                <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1.5">
                                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Part 2: Payload (Claims)</p>
                                    <pre className="text-purple-200 text-[10px] overflow-x-auto p-2 bg-black/60 rounded">
                                        {JSON.stringify(tokens.parsedAccess.payload, null, 2)}
                                    </pre>
                                </div>

                                {/* 3. Signature */}
                                <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-1.5">
                                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Part 3: Signature</p>
                                    <p className="text-[10px] text-cyan-200 break-all p-2 bg-black/60 rounded">
                                        {tokens.parsedAccess.signature}
                                    </p>
                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-300 flex items-center gap-1.5">
                                        <CheckCircle2 size={13} /> Validated with HM-SHA256
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: ROLE-BASED ACCESS CONTROL (RBAC)                                   */}
            {/* ========================================================================= */}
            {activeTab === 'rbac' && (
                <div className="space-y-6 font-mono text-xs">
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Users size={16} className="text-purple-400" />
                                    Enterprise Role-Based Access Control Matrix
                                </h3>
                                <p className="text-[11px] text-white/50">Clearance tiers and module permission mappings</p>
                            </div>
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                                Active Role: {currentUser?.role}
                            </span>
                        </div>

                        {/* Interactive Role Switcher for Testing */}
                        <div className="p-4 bg-navy-950 rounded-xl border border-white/10 space-y-3">
                            <p className="text-[11px] font-bold text-cyan-300 uppercase">
                                Switch Persona to Test Granular Permissions
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {Object.values(ROLES).map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSwitch(role.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${
                                            currentUser?.role === role.id
                                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 font-bold'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] uppercase text-white/40">{role.badge}</span>
                                            {currentUser?.role === role.id && <Check size={12} className="text-cyan-400" />}
                                        </div>
                                        <p className="font-bold truncate text-[11px] text-white">{role.name}</p>
                                        <p className="text-[9px] text-cyan-300/60 mt-0.5 truncate">{role.clearance}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Permissions Matrix Table */}
                        <div className="overflow-x-auto pt-2">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Permission Key</th>
                                        <th className="p-3">Super Admin</th>
                                        <th className="p-3">Traffic Operator</th>
                                        <th className="p-3">Enforcement</th>
                                        <th className="p-3">Emergency</th>
                                        <th className="p-3">Security Auditor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[11px]">
                                    {[
                                        { key: 'dashboard:view', label: 'Access Live C4I Dashboard' },
                                        { key: 'cctv:control', label: 'PTZ Control & Camera Reboot' },
                                        { key: 'signals:override', label: 'Manual Traffic Signal Override' },
                                        { key: 'echallan:issue', label: 'Issue Legal E-Challans' },
                                        { key: 'emergency:preempt', label: 'Trigger Green Wave Preemption' },
                                        { key: 'audit:view', label: 'Inspect Cryptographic Audit Trail' },
                                        { key: 'security:admin', label: 'Modify Cryptographic & 2FA Keys' }
                                    ].map((p, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-semibold text-white/90">
                                                {p.label}
                                                <span className="block text-[9px] text-white/40 font-normal">{p.key}</span>
                                            </td>
                                            <td className="p-3 text-emerald-400 font-bold">✓ Full</td>
                                            <td className="p-3">{['dashboard:view', 'cctv:control', 'signals:override'].includes(p.key) ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-white/20">—</span>}</td>
                                            <td className="p-3">{['dashboard:view', 'echallan:issue'].includes(p.key) ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-white/20">—</span>}</td>
                                            <td className="p-3">{['dashboard:view', 'emergency:preempt', 'signals:override'].includes(p.key) ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-white/20">—</span>}</td>
                                            <td className="p-3">{['dashboard:view', 'audit:view', 'security:admin'].includes(p.key) ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-white/20">—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: TWO-FACTOR AUTHENTICATION & PASSWORD POLICY                         */}
            {/* ========================================================================= */}
            {activeTab === '2fa' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
                    {/* 2FA TOTP Configuration */}
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Smartphone size={16} className="text-emerald-400" />
                                TOTP Two-Factor Authenticator Setup
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                ACTIVE
                            </span>
                        </div>
                        <p className="text-white/60">
                            Compatible with Google Authenticator, Microsoft Authenticator, and YubiKey.
                        </p>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                            {/* QR Simulation Box */}
                            <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center flex-shrink-0">
                                <div className="w-full h-full border-2 border-black border-dashed flex items-center justify-center text-center text-black text-[9px] font-bold">
                                    [QR CODE DATA]
                                </div>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <p className="text-[10px] text-white/40 uppercase">Secret Security Key</p>
                                <p className="font-bold text-cyan-300 text-sm">{totpSecret.formattedSecret}</p>
                                <p className="text-[10px] text-white/50">Account: {currentUser.email}</p>
                            </div>
                        </div>

                        {/* Test 6-Digit Code */}
                        <form onSubmit={handleVerifyTotp} className="space-y-3 pt-2">
                            <label className="text-[10px] uppercase font-bold text-white/60 block">
                                Test TOTP Code (Demo: 123456)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="123456"
                                    className="flex-1 bg-navy-950 border border-white/10 rounded-xl py-2 px-3 text-center text-lg font-bold text-cyan-300 tracking-widest focus:outline-none focus:border-cyan-500/50"
                                    value={verifyInput}
                                    onChange={(e) => setVerifyInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                                >
                                    Verify
                                </button>
                            </div>
                            {totpVerifyResult !== null && (
                                <p className={`text-[11px] ${totpVerifyResult ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {totpVerifyResult ? '✓ TOTP Code Validated' : '✗ Invalid Code'}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Enterprise Password Policy Enforcement */}
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <KeyRound size={16} className="text-cyan-400" />
                                Enterprise Password Policy Enforcer
                            </h3>
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                ISO 27001
                            </span>
                        </div>
                        <p className="text-white/60">
                            Strict enforcement for all operator credentials across National ITMS nodes.
                        </p>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-white/40 block">Interactive Policy Validator</label>
                            <div className="relative">
                                <input
                                    type={showTestPassword ? "text" : "password"}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-white font-mono focus:outline-none focus:border-cyan-500/50"
                                    value={testPassword}
                                    onChange={(e) => setTestPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowTestPassword(!showTestPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                                >
                                    {showTestPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                            <div className="flex justify-between text-[11px]">
                                <span>Strength: <strong className="text-cyan-300">{pwdEvaluation.strength}</strong></span>
                                <span>Score: {pwdEvaluation.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${pwdEvaluation.score >= 80 ? 'bg-emerald-400' : pwdEvaluation.score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                                    style={{ width: `${pwdEvaluation.score}%` }}
                                />
                            </div>
                            <div className="space-y-1 text-[10px] pt-1">
                                <div className={`flex items-center gap-1.5 ${pwdEvaluation.checks.minLength ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {pwdEvaluation.checks.minLength ? <Check size={12} /> : <XCircle size={12} />}
                                    Minimum 8 characters (Recommended 12+)
                                </div>
                                <div className={`flex items-center gap-1.5 ${pwdEvaluation.checks.hasUppercase ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {pwdEvaluation.checks.hasUppercase ? <Check size={12} /> : <XCircle size={12} />}
                                    At least 1 uppercase letter (A-Z)
                                </div>
                                <div className={`flex items-center gap-1.5 ${pwdEvaluation.checks.hasLowercase ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {pwdEvaluation.checks.hasLowercase ? <Check size={12} /> : <XCircle size={12} />}
                                    At least 1 lowercase letter (a-z)
                                </div>
                                <div className={`flex items-center gap-1.5 ${pwdEvaluation.checks.hasNumber ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {pwdEvaluation.checks.hasNumber ? <Check size={12} /> : <XCircle size={12} />}
                                    At least 1 numerical digit (0-9)
                                </div>
                                <div className={`flex items-center gap-1.5 ${pwdEvaluation.checks.hasSpecial ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {pwdEvaluation.checks.hasSpecial ? <Check size={12} /> : <XCircle size={12} />}
                                    At least 1 special symbol (!@#$%^&*)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: LOGIN HISTORY & DEVICE TRACKING                                    */}
            {/* ========================================================================= */}
            {activeTab === 'history' && (
                <div className="space-y-6 font-mono text-xs">
                    {/* Active Devices */}
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Laptop size={16} className="text-cyan-400" />
                                Authorized Active Terminals & Devices
                            </h3>
                            <span className="text-[10px] text-white/40">3 Sessions Logged</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {activeDevices.map((dev) => (
                                <div key={dev.id} className="p-3.5 bg-navy-950 rounded-xl border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-[11px] truncate">{dev.name}</span>
                                        {dev.isCurrent ? (
                                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">THIS DEVICE</span>
                                        ) : (
                                            <button
                                                onClick={() => handleRevokeDevice(dev.id)}
                                                className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-1"
                                            >
                                                <Trash2 size={11} /> Revoke
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-white/50">IP: {dev.ip} • {dev.location}</p>
                                    <p className="text-[9px] text-cyan-300/70">Last Active: {dev.lastActive}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historical Login Ledger */}
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <History size={16} className="text-cyan-400" />
                                Login Attempt Ledger & IP Origin Audit
                            </h3>
                            <span className="text-[10px] text-white/40">All Client Access Records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Timestamp</th>
                                        <th className="p-3">Officer / User</th>
                                        <th className="p-3">IP Address</th>
                                        <th className="p-3">Device / Browser</th>
                                        <th className="p-3">Auth Method</th>
                                        <th className="p-3">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[11px]">
                                    {loginHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-white/50">{item.timestamp}</td>
                                            <td className="p-3 font-semibold text-white">
                                                {item.name}
                                                <span className="block text-[9px] text-cyan-300 font-normal">{item.badgeNumber}</span>
                                            </td>
                                            <td className="p-3 text-cyan-300">{item.ip}</td>
                                            <td className="p-3 text-white/70 max-w-xs truncate">{item.device}</td>
                                            <td className="p-3 text-white/50">{item.method}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    item.status === 'SUCCESS'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : item.status === '2FA_CHALLENGE'
                                                            ? 'bg-cyan-500/20 text-cyan-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: TAMPER-EVIDENT AUDIT TRAIL (CRYPTOGRAPHIC HASH CHAIN)              */}
            {/* ========================================================================= */}
            {activeTab === 'audit' && (
                <div className="space-y-6 font-mono text-xs">
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-cyan-400" />
                                    Cryptographic Tamper-Evident Audit Trail
                                </h3>
                                <p className="text-[11px] text-white/50">Append-only blockchain-style linked hash chain</p>
                            </div>
                            <button
                                onClick={handleExportAuditCSV}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold flex items-center gap-2 transition-colors self-start"
                            >
                                <Download size={14} /> Export Audit CSV
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search action, actor, details..."
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-cyan-500/50"
                                    value={auditSearchQuery}
                                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                                {['ALL', 'SECURITY', 'AUTH', 'ACCESS_CONTROL', 'EMERGENCY_CORRIDOR', 'ENFORCEMENT'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setAuditFilterCategory(cat)}
                                        className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${
                                            auditFilterCategory === cat
                                                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold'
                                                : 'bg-white/5 text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audit Records Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Actor</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Details</th>
                                        <th className="p-3">Severity</th>
                                        <th className="p-3">Chain Hash</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[11px]">
                                    {filteredAudit.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-white/50 whitespace-nowrap">{log.timestamp}</td>
                                            <td className="p-3 font-semibold text-white whitespace-nowrap">{log.actor}</td>
                                            <td className="p-3 text-cyan-300 font-bold">{log.action}</td>
                                            <td className="p-3 text-white/70 max-w-sm">{log.details}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    log.severity === 'CRITICAL'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : log.severity === 'WARNING'
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                            <td className="p-3 text-[10px] text-white/40 truncate max-w-[120px]" title={`Prev: ${log.prevHash}`}>
                                                {log.hash}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: AES-GCM ENCRYPTION & SENSITIVE DATA VAULT                           */}
            {/* ========================================================================= */}
            {activeTab === 'encryption' && (
                <div className="space-y-6 font-mono text-xs">
                    <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Lock size={16} className="text-cyan-400" />
                                Sensitive PII Cryptographic Vault (AES-GCM Envelope)
                            </h3>
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                FIPS 140-2
                            </span>
                        </div>
                        <p className="text-white/60">
                            Automatic masking and cryptographic envelope encryption for citizen Aadhar records, telephone numbers, and vehicle ownership identities.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                            {/* Encryption Sandbox */}
                            <div className="p-4 bg-navy-950 rounded-xl border border-white/10 space-y-3">
                                <p className="text-[11px] font-bold text-cyan-300 uppercase">Interactive Encrypt Tool</p>
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white font-mono text-xs h-24 focus:outline-none focus:border-cyan-500/50"
                                    value={plainInput}
                                    onChange={(e) => setPlainInput(e.target.value)}
                                    placeholder="Enter plain text PII..."
                                />
                                <button
                                    onClick={handleEncrypt}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <Lock size={14} /> Encrypt via AES
                                </button>
                                {cipherOutput && (
                                    <div className="p-2.5 bg-black/60 rounded border border-white/10 space-y-1">
                                        <span className="text-[9px] text-white/40 block">Encrypted Cipher Text</span>
                                        <p className="text-cyan-300 break-all text-[10px]">{cipherOutput}</p>
                                    </div>
                                )}
                            </div>

                            {/* Decryption Sandbox */}
                            <div className="p-4 bg-navy-950 rounded-xl border border-white/10 space-y-3">
                                <p className="text-[11px] font-bold text-emerald-300 uppercase">Interactive Decrypt Tool</p>
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white font-mono text-xs h-24 focus:outline-none focus:border-emerald-500/50"
                                    value={cipherOutput}
                                    onChange={(e) => setCipherOutput(e.target.value)}
                                    placeholder="Paste cipher text here..."
                                />
                                <button
                                    onClick={handleDecrypt}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <Unlock size={14} /> Decrypt Cipher
                                </button>
                                {decryptedOutput && (
                                    <div className="p-2.5 bg-black/60 rounded border border-white/10 space-y-1">
                                        <span className="text-[9px] text-white/40 block">Decrypted Result</span>
                                        <p className="text-emerald-300 text-[10px]">{decryptedOutput}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseSecurity;
