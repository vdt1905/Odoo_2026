import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Activity, Download, DollarSign, PieChart, TrendingUp, ShieldCheck, Map } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Analytics = () => {
    const { isAuthenticated } = useAuthStore();

    // Data State
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const mainContentRef = useRef(null);
    const widgetsRef = useRef(null);
    const chartsRef = useRef(null);

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
        if (!isLoading && mainContentRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(mainContentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
                .fromTo(widgetsRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.2)" }, "-=0.2")
                .fromTo(chartsRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
        }
    }, [isLoading]);

    const handleExportCSV = () => {
        if (!data) return;

        // CSV Headers
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric Category,Key,Value\n";

        // Financials
        csvContent += `Financials,Total Expenses,${data.financials.totalExpenses}\n`;
        Object.entries(data.financials.breakdown).forEach(([key, val]) => {
            csvContent += `Financials,${key} Costs,${val}\n`;
        });

        // Operations
        csvContent += `Operations,Total Trips Logged,${data.operations.totalTripsLogged}\n`;
        csvContent += `Operations,Active Trips,${data.operations.activeTrips}\n`;
        csvContent += `Operations,Completed Trips,${data.operations.completedTrips}\n`;

        // Safety
        csvContent += `Safety,Average Safety Score,${data.safety.averageSafetyScore}\n`;
        csvContent += `Safety,Total Drivers,${data.safety.totalDrivers}\n`;

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `FleetFlow_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-[#050b14] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-4 border-[#00ced1] rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">Aggregating Data...</p>
                </div>
            </div>
        );
    }

    // Chart calculations mapping percentages for visual bars
    const breakdown = data.financials.breakdown;
    const maxCost = Math.max(...Object.values(breakdown), 1); // Avoid division by zero

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ced1]/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Operational Analytics</h1>
                            <p className="text-slate-400 text-sm md:text-base">Macro-level health & financial overviews of the fleet.</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all shadow-lg hover:shadow-xl group"
                        >
                            <Download size={18} className="text-[#00ced1] group-hover:-translate-y-0.5 transition-transform" />
                            Export CSV Report
                        </button>
                    </div>

                    {/* KPI Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" ref={widgetsRef}>

                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><DollarSign size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Spend</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">${data.financials.totalExpenses.toLocaleString()}</h3>
                            <p className="text-sm font-medium text-slate-400">Total Lifecycle Spend</p>
                        </div>

                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldCheck size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Safety Index</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{data.safety.averageSafetyScore} <span className="text-lg text-emerald-400 font-normal">avg</span></h3>
                            <p className="text-sm font-medium text-slate-400">Across {data.safety.totalDrivers} Drivers</p>
                        </div>

                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ced1]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-[#00ced1]/10 rounded-lg text-[#00ced1]"><Map size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Logistics</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{data.operations.activeTrips}</h3>
                            <p className="text-sm font-medium text-slate-400">Active / Dispatched Trips</p>
                        </div>

                        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><TrendingUp size={20} /></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completions</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{data.operations.completedTrips}</h3>
                            <p className="text-sm font-medium text-slate-400">Total Concluded Trips</p>
                        </div>

                    </div>

                    {/* Visual Charts Area */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" ref={chartsRef}>

                        {/* Expense Breakdown */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-8">
                                <PieChart className="text-[#00ced1]" size={24} />
                                <h3 className="text-xl font-bold text-white">Expense Distribution</h3>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(breakdown).map(([type, amount]) => {
                                    const percentage = (amount / maxCost) * 100;
                                    const isZero = amount === 0;

                                    let colorClass = "from-slate-500 to-slate-400";
                                    let textColor = "text-slate-400";
                                    if (type === 'Fuel') { colorClass = "from-sky-500 to-sky-400"; textColor = "text-sky-400"; }
                                    if (type === 'Maintenance') { colorClass = "from-amber-500 to-amber-400"; textColor = "text-amber-400"; }
                                    if (type === 'Tolls') { colorClass = "from-purple-500 to-purple-400"; textColor = "text-purple-400"; }
                                    if (type === 'Insurance') { colorClass = "from-emerald-500 to-emerald-400"; textColor = "text-emerald-400"; }

                                    return (
                                        <div key={type} className="relative">
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className="text-slate-300">{type}</span>
                                                <span className={textColor}>${amount.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-[#050b14] rounded-full h-3 overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{ width: isZero ? '0%' : `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* System Health / Summary text */}
                        <div className="bg-[#0b1120]/50 rounded-2xl border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-5">
                                <Activity size={300} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Operations Summary</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                FleetFlow Analytics aggregates your operational overhead into actionable metrics.
                                By continuously monitoring real-time dispatch events alongside human capital inputs (like Driver Safety indexing),
                                management can accurately target cost-reduction strategies regarding Fuel scaling and Preventative Maintenance models.
                            </p>

                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-4 items-start">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-400 mb-1">System Tracking Active</h4>
                                    <p className="text-xs text-slate-300">Data pipelines are stable. {data.operations.totalTripsLogged} total lifetime payload transfers processed through the Command Center.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
