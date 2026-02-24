import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';

const data = [
    { name: 'Mon', vehicles: 4000, congestion: 24 },
    { name: 'Tue', vehicles: 3000, congestion: 13 },
    { name: 'Wed', vehicles: 2000, congestion: 98 },
    { name: 'Thu', vehicles: 2780, congestion: 39 },
    { name: 'Fri', vehicles: 1890, congestion: 48 },
    { name: 'Sat', vehicles: 2390, congestion: 38 },
    { name: 'Sun', vehicles: 3490, congestion: 43 },
];

const Analytics = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
                    <p className="text-white/50">Historical traffic patterns and efficiency reports</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Export PDF Report
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Weekly Vehicle Volume</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} />
                                <YAxis stroke="#ffffff20" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="vehicles" fill="#d80032" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Congestion Index %</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} />
                                <YAxis stroke="#ffffff20" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="congestion" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50">
                        <tr>
                            <th className="px-6 py-4">Junction Name</th>
                            <th className="px-6 py-4">Avg Speed</th>
                            <th className="px-6 py-4">Total Count</th>
                            <th className="px-6 py-4">Efficiency Score</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {[
                            { name: 'North Crossing', speed: '32 km/h', count: '12,402', score: '82%', status: 'Optimal' },
                            { name: 'Sector 4 Junction', speed: '14 km/h', count: '42,100', score: '34%', status: 'Congested' },
                            { name: 'Main St Bridge', speed: '56 km/h', count: '8,200', score: '97%', status: 'Free' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors text-sm">
                                <td className="px-6 py-4 font-medium">{row.name}</td>
                                <td className="px-6 py-4 text-white/60">{row.speed}</td>
                                <td className="px-6 py-4 text-white/60">{row.count}</td>
                                <td className="px-6 py-4 text-white/60">{row.score}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.status === 'Optimal' ? 'bg-blue-500/20 text-blue-500' : row.status === 'Free' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
