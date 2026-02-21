import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from '../components/Sidebar';
import MagicContainer, { MagicCard } from '../components/MagicBento';
import { Download, Droplet, TrendingUp, Activity, FileText } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell, Legend, ComposedChart } from 'recharts';
import ExpenseDonutChart from '../components/ExpenseDonutChart';
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
        // 1. Fleet KPI Summary
        csvContent += "=== FLEET KPI SUMMARY ===\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Revenue,${data.kpis.totalRevenue}\n`;
        csvContent += `Total Fuel Cost,${data.kpis.totalFuelCost}\n`;
        csvContent += `Maintenance Cost,${data.kpis.maintenanceCost}\n`;
        csvContent += `Net Profit,${data.kpis.netProfit}\n`;
        csvContent += `Fleet ROI (%),${data.kpis.fleetROI}\n\n`;

        // 2. Monthly Summary
        csvContent += "=== MONTHLY SUMMARY ===\n";
        csvContent += "Month,Revenue,Fuel Cost,Maintenance,Net Profit\n";
        data.monthlySummary.forEach(row => {
            csvContent += `${row.month},${row.revenue},${row.fuelCost},${row.maintenance},${row.netProfit}\n`;
        });
        csvContent += "\n";

        // 3. Vehicle ROI Analysis
        csvContent += "=== VEHICLE ROI ANALYSIS ===\n";
        csvContent += "Vehicle ID,Vehicle Name,Total Cost,Total Revenue\n";
        data.charts.vehicleROI.forEach(row => {
            csvContent += `${row.vehicleId},${row.vehicle},${row.totalCost},${row.revenue}\n`;
        });
        csvContent += "\n";

        // 4. Top Costliest Vehicles
        csvContent += "=== TOP COSTLIEST VEHICLES ===\n";
        csvContent += "Vehicle Name,Total Expense\n";
        data.charts.costliestVehicles.forEach(row => {
            csvContent += `${row.name},${row.cost}\n`;
        });
        csvContent += "\n";

        // 5. Maintenance Downtime
        csvContent += "=== MAINTENANCE DOWNTIME ===\n";
        csvContent += "Vehicle Name,Estimated Days Lost\n";
        data.charts.downtimeChart.forEach(row => {
            csvContent += `${row.name},${row.daysLost}\n`;
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

                {/* Abstract Background Elements */}
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-[#00ced1]/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 to-[#00ced1]/20 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen"></div>

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
                    <MagicContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" ref={widgetsRef} glowColor="0, 206, 209">

                        {/* Total Fuel Cost */}
                        <MagicCard className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[40px] border border-white/[0.08] border-b-black/50 border-r-black/50 shrink-0 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between min-h-[160px]" enableStars={true}>
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-[1.15] group-hover:opacity-20 transition-all duration-700 z-0 -translate-y-2 translate-x-2">
                                <Droplet size={100} className="text-rose-400" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-rose-500/10 rounded-[1.2rem] text-rose-400 border border-white/10 backdrop-blur-md shrink-0 flex items-center justify-center"><Droplet size={20} /></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/10">Expenditure</span>
                                </div>
                                <h3 className="text-[2.5rem] leading-none font-medium text-white tracking-tight drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)] mb-1">₹{data.kpis.totalFuelCost.toLocaleString()}</h3>
                                <p className="text-sm font-semibold text-white/60 tracking-wider">Total Fuel Cost</p>
                            </div>
                        </MagicCard>

                        {/* Fleet ROI */}
                        <MagicCard className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[40px] border border-white/[0.08] border-b-black/50 border-r-black/50 shrink-0 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between min-h-[160px]" enableStars={true}>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-[1.15] group-hover:opacity-20 transition-all duration-700 z-0 -translate-y-2 translate-x-2">
                                <TrendingUp size={100} className="text-emerald-400" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-[1.2rem] text-emerald-400 border border-white/10 backdrop-blur-md shrink-0 flex items-center justify-center"><TrendingUp size={20} /></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/10">Margin</span>
                                </div>
                                <h3 className="text-[2.5rem] leading-none font-medium text-emerald-400 tracking-tight drop-shadow-[0_2px_15px_rgba(52,211,153,0.3)] mb-1">+{data.kpis.fleetROI}%</h3>
                                <p className="text-sm font-semibold text-white/60 tracking-wider">Fleet ROI</p>
                            </div>
                        </MagicCard>

                        {/* Utilization Rate */}


                    </MagicContainer>

                    {/* Visual Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" ref={chartsRef}>

                        {/* A. Revenue vs Expense Trend */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold text-white mb-6 drop-shadow-sm">Revenue vs Expense Trend</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthlySummary} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#00ced1" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                        <Line type="monotone" dataKey="fuelCost" name="Fuel Cost" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                        <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="#fbbf24" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                        <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* B. Cost Breakdown Pie Chart */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold text-white mb-2 text-center drop-shadow-sm">Cost Breakdown</h3>
                            <div className="flex-1 w-full relative flex items-center justify-center -mt-4">
                                <ExpenseDonutChart breakdown={data.charts.expenseBreakdown} />
                            </div>
                        </div>

                        {/* C. Vehicle Utilization Heatmap */}


                        {/* D. Trip Completion Funnel */}

                        {/* E. Downtime Chart (Days Lost) */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[350px]">
                            <h3 className="text-lg font-bold text-white mb-6 drop-shadow-sm">Total Maintenance Downtime (Days Lost)</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.charts.downtimeChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="daysLost" name="Est. Days Lost" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* H. Vehicle Final ROI */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold text-white mb-6 drop-shadow-sm flex justify-between items-center">
                                <span>Vehicle Final ROI <span className="text-xs text-slate-400 font-normal ml-2">(Total Cost vs Revenue)</span></span>
                                <div className="flex gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#f43f5e] rounded-sm"></div>Total Cost</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#34d399] rounded-sm"></div>Revenue</div>
                                </div>
                            </h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data.charts.vehicleROI} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalCost' ? 'Total Cost' : 'Revenue']}
                                        />
                                        <Bar dataKey="totalCost" name="totalCost" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="revenue" name="revenue" fill="#34d399" radius={[4, 4, 0, 0]} barSize={30} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* F. Fuel Efficiency Trend */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[350px]">
                            <h3 className="text-lg font-bold text-white mb-6 drop-shadow-sm">Fuel Efficiency Trend (km/L)</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.charts.fuelEfficiencyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#00ced1', fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="efficiency" stroke="#00ced1" strokeWidth={3} dot={{ r: 4, fill: '#00ced1', strokeWidth: 0 }} activeDot={{ r: 6, stroke: 'rgba(0, 206, 209, 0.3)', strokeWidth: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* G. Top 5 Costliest Vehicles */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[350px]">
                            <h3 className="text-lg font-bold text-white mb-6 drop-shadow-sm">Top 5 Costliest Vehicles</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.charts.costliestVehicles} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)]" ref={tableRef}>
                        <div className="p-6 border-b border-white/[0.05] flex items-center gap-3">
                            <FileText className="text-[#00ced1]" size={20} />
                            <h2 className="text-lg font-bold text-white drop-shadow-sm">Financial Summary of Month</h2>
                        </div>
                        <div className="overflow-x-auto relative">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black/20 text-rose-400 border-b border-white/[0.05]">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase opacity-80">Month</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase opacity-80 text-right">Revenue</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase opacity-80 text-right">Fuel Cost</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase opacity-80 text-right">Maintenance</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase opacity-80 text-right">Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05] bg-transparent">
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
