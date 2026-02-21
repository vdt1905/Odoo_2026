import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Download, Droplet, TrendingUp, Activity, FileText } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Analytics = () => {
    const { isAuthenticated } = useAuthStore();

    // Data State
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const mainContentRef = useRef(null);
    const widgetsRef = useRef(null);
    const chartsRef = useRef(null);
    const tableRef = useRef(null);

    const fetchData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const res = await axios.get('http://localhost:3000/api/analytics', {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isLoading && mainContentRef.current && data) {
            const tl = gsap.timeline();
            tl.fromTo(mainContentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
                .fromTo(widgetsRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.2)" }, "-=0.2")
                .fromTo(chartsRef.current.children, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.2, ease: "power2.out" }, "-=0.3")
                .fromTo(tableRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");
        }
    }, [isLoading, data]);

    const handleExportCSV = () => {
        if (!data) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Month,Revenue,Fuel Cost,Maintenance,Net Profit\n";

        data.monthlySummary.forEach(row => {
            csvContent += `${row.month},${row.revenue},${row.fuelCost},${row.maintenance},${row.netProfit}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Fleet_Financial_Summary_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-[#050b14] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-4 border-[#00ced1] rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">Aggregating Financials...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ced1]/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Financial Reports</h1>
                            <p className="text-slate-400 text-sm md:text-base">Macro-level financial overview and operational ROI.</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ced1]/10 hover:bg-[#00ced1]/20 text-[#00ced1] border border-[#00ced1]/20 font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>

                    {/* KPI Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" ref={widgetsRef}>

                        {/* Total Fuel Cost */}
                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Droplet size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expenditure</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">₹{data.kpis.totalFuelCost.toLocaleString()}</h3>
                            <p className="text-sm font-medium text-slate-400">Total Fuel Cost</p>
                        </div>

                        {/* Fleet ROI */}
                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Margin</span>
                            </div>
                            <h3 className="text-3xl font-bold text-emerald-400 mb-1 tracking-tight">+{data.kpis.fleetROI}%</h3>
                            <p className="text-sm font-medium text-slate-400">Fleet ROI</p>
                        </div>

                        {/* Utilization Rate */}
                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ced1]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-[#00ced1]/10 rounded-lg text-[#00ced1]"><Activity size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Capacity</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{data.kpis.utilizationRate}%</h3>
                            <p className="text-sm font-medium text-slate-400">Utilization Rate</p>
                        </div>

                    </div>

                    {/* Visual Charts Area */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8" ref={chartsRef}>

                        {/* Fuel Efficiency Trend */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col h-[350px]">
                            <h3 className="text-lg font-bold text-white mb-6">Fuel Efficiency Trend (km/L)</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.charts.fuelEfficiencyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#00ced1', fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="efficiency" stroke="#00ced1" strokeWidth={3} dot={{ r: 4, fill: '#00ced1', strokeWidth: 0 }} activeDot={{ r: 6, stroke: 'rgba(0, 206, 209, 0.3)', strokeWidth: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top 5 Costliest Vehicles */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col h-[350px]">
                            <h3 className="text-lg font-bold text-white mb-6">Top 5 Costliest Vehicles</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.charts.costliestVehicles} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        />
                                        <Bar dataKey="cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Financial Summary Table */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden" ref={tableRef}>
                        <div className="p-6 border-b border-white/10 flex items-center gap-3">
                            <FileText className="text-[#00ced1]" size={20} />
                            <h2 className="text-lg font-bold text-white">Financial Summary of Month</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0b1120] text-rose-400 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase">Month</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase text-right">Revenue</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase text-right">Fuel Cost</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase text-right">Maintenance</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase text-right">Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.monthlySummary.map((row, idx) => {
                                        const hasData = row.revenue > 0 || row.fuelCost > 0 || row.maintenance > 0;
                                        if (!hasData) return null; // Only render active months

                                        return (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors relative group">
                                                <td className="px-6 py-4 font-bold text-white relative pl-8">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-[#00ced1] transition-colors"></span>
                                                    {row.month}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-emerald-400">
                                                    ₹{row.revenue.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-rose-400">
                                                    ₹{row.fuelCost.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-amber-400">
                                                    ₹{row.maintenance.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-white">
                                                    ₹{row.netProfit.toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {data.monthlySummary.every(row => row.revenue === 0 && row.fuelCost === 0 && row.maintenance === 0) && (
                                <div className="p-8 text-center text-slate-500 italic">No financial data recorded yet.</div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Analytics;
