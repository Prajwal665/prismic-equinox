import React from 'react';
import {
    Users,
    Activity,
    MapPin,
    TrafficCone,
    AlertCircle,
    Timer,
    Car,
    Wind,
    BarChart3,
    Video
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const trafficData = [
    { time: '00:00', count: 400 },
    { time: '04:00', count: 200 },
    { time: '08:00', count: 1200 },
    { time: '12:00', count: 900 },
    { time: '16:00', count: 1500 },
    { time: '20:00', count: 700 },
    { time: '23:59', count: 450 },
];

const StatCard = ({ title, value, unit, icon: Icon, trend, color = "blue" }) => (
    <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div>
            <p className="text-white/50 text-xs uppercase font-bold tracking-widest">{title}</p>
            <h3 className="text-3xl font-bold mt-1">
                {value} <span className="text-sm font-normal text-white/30">{unit}</span>
            </h3>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Main Command Center</h2>
                    <p className="text-white/50">Real-time surveillance & signal automation system</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">System Status</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-green-500">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Vehicle Density"
                    value="4,829"
                    unit="Active"
                    icon={Car}
                    trend={12}
                    color="blue"
                />
                <StatCard
                    title="Avg. Congestion"
                    value="42"
                    unit="%"
                    icon={Activity}
                    trend={-5}
                    color="yellow"
                />
                <StatCard
                    title="Signal Efficiency"
                    value="98.2"
                    unit="%"
                    icon={Timer}
                    color="green"
                />
                <StatCard
                    title="Emergency Alerts"
                    value="2"
                    unit="Pending"
                    icon={AlertCircle}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map View */}
                <div className="lg:col-span-2 glass-panel overflow-hidden relative min-h-[500px]">
                    <div className="absolute inset-0 bg-navy-800">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112061.05040333334!2d77.11652395!3d28.6327315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b71da69da67!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1708700000000!5m2!1sen!2sin&maptype=satellite"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="opacity-60"
                        ></iframe>

                        {/* Overlay Glitch/Scanning Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,17,40,0.4)_100%)]"></div>
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                    </div>

                    {/* Map UI Elements */}
                    <div className="absolute top-4 right-4 bg-navy-900/90 border border-white/20 rounded-lg px-3 py-2 flex items-center gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emergency animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Live Satellite Feed</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-mono text-white/50 tracking-tighter">28.6139° N, 77.2090° E</span>
                    </div>

                    <div className="absolute bottom-4 left-4 glass-panel p-4 max-w-sm pointer-events-none">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 font-mono underline decoration-emergency underline-offset-4">Sector Analysis</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-white/60">Delhi Central - Block A</span>
                                <span className="text-red-500 font-bold uppercase tracking-widest text-[9px]">Critical</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-[92%] h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-white/60">Ring Road Interchange</span>
                                <span className="text-yellow-500 font-bold uppercase tracking-widest text-[9px]">Heavy</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-[65%] h-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Traffic Stats */}
                <div className="glass-panel p-6 flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emergency" />
                        Traffic Flow Hourly
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d80032" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d80032" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a1128',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#d80032"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm">Peak Traffic Hours</span>
                            </div>
                            <span className="text-sm font-bold">16:00 - 18:00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">Avg. Vehicle Speed</span>
                            </div>
                            <span className="text-sm font-bold">42 km/h</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mock Camera Panels would go here */}
                {[1, 2, 3, 4].map(id => (
                    <div key={id} className="glass-panel overflow-hidden group">
                        <div className="aspect-video bg-navy-800 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=400&h=300&fit=crop')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-40"></div>
                            <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                REC CAM-{id.toString().padStart(3, '0')}
                            </div>
                            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-all pointer-events-none"></div>
                            <Video className="w-8 h-8 text-white/10" />
                        </div>
                        <div className="p-3 flex items-center justify-between text-[11px] font-medium text-white/50 bg-black/20">
                            <span>Main Street / 5th Ave</span>
                            <span className="text-red-500">0.2s LAG</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
