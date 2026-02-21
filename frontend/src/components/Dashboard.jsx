import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import Sidebar from './Sidebar';
import { Activity, AlertTriangle, Package, Truck, Filter, TrendingUp, Search, Plus, Send } from 'lucide-react';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [recentTrips, setRecentTrips] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const mainContentRef = useRef(null);
    const cardsRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser?.token;

                if (!token) throw new Error('No token found');

                const { data } = await axios.get('http://localhost:3000/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats(data.stats);
                setRecentTrips(data.recentTrips);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isLoading && stats && mainContentRef.current) {
            const tl = gsap.timeline();

            tl.fromTo(mainContentRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            ).fromTo(cardsRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" },
                "-=0.3"
            ).fromTo(tableRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
                "-=0.2"
            );
        }
    }, [isLoading, stats]);

    if (!user) return null;

    const KpiCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
        <div className={`p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl shrink-0 ${gradientClass} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl`}>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500">
                <Icon size={80} className={colorClass} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl border border-white/10 ${colorClass.replace('text-', 'bg-').replace('400', '500/10')} flex items-center justify-center`}>
                        <Icon size={20} className={colorClass} />
                    </div>
                    <h3 className="text-white/70 font-medium text-sm tracking-wide">{title}</h3>
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{value}</h2>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">

            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">

                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ced1]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Command Center</h1>
                            <p className="text-slate-400 text-sm md:text-base">Real-time overview of fleet operations state and activity.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-12 h-12 border-t-2 border-b-2 border-[#00ced1] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" ref={cardsRef}>
                                <KpiCard
                                    title="Active Fleet"
                                    value={stats?.activeFleet || 0}
                                    icon={Truck}
                                    colorClass="text-emerald-400"
                                    gradientClass="bg-gradient-to-br from-emerald-500/10 to-transparent"
                                />
                                <KpiCard
                                    title="Alerts in Shop"
                                    value={stats?.maintenanceAlerts || 0}
                                    icon={AlertTriangle}
                                    colorClass="text-red-400"
                                    gradientClass="bg-gradient-to-br from-red-500/10 to-transparent"
                                />
                                <KpiCard
                                    title="Utilization %"
                                    value={`${stats?.utilizationRate || 0}%`}
                                    icon={TrendingUp}
                                    colorClass="text-[#00ced1]"
                                    gradientClass="bg-gradient-to-br from-[#00ced1]/10 to-transparent"
                                />
                                <KpiCard
                                    title="Pending Cargo"
                                    value={stats?.pendingCargo || 0}
                                    icon={Package}
                                    colorClass="text-amber-400"
                                    gradientClass="bg-gradient-to-br from-amber-500/10 to-transparent"
                                />
                            </div>

                            {/* Table Controls */}
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                                <div className="relative w-full xl:w-96 flex-shrink-0">
                                    <input type="text" placeholder="Search trips..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 transition-all shadow-inner" />
                                    <Search className="absolute left-3.5 top-3 text-white/40" size={16} />
                                </div>

                                <div className="flex flex-wrap items-center gap-2 xl:gap-3">
                                    <div className="flex gap-2">
                                        <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Group by</button>
                                        <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Filter</button>
                                        <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Sort by...</button>
                                    </div>

                                    <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

                                    <div className="flex gap-2">
                                        <button onClick={() => navigate('/dispatch')} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"><Plus size={14} /> New Trip</button>
                                        <button onClick={() => navigate('/vehicles')} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-[#00ced1]/10 border border-[#00ced1]/20 text-[#00ced1] hover:bg-[#00ced1]/20 transition-colors"><Plus size={14} /> New Vehicle</button>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Table */}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl" ref={tableRef}>
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Send size={20} className="text-[#00ced1]" />
                                        Active Trips
                                    </h3>
                                    <button onClick={() => navigate('/dispatch')} className="text-[#00ced1] text-xs font-bold hover:underline">View Dispatcher</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#0b1120] text-[#00ced1] border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Trip ID</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Vehicle</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Driver</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 bg-black/20">
                                            {recentTrips?.filter(trip =>
                                                trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                trip.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                trip.status.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).map((trip) => (
                                                <tr key={trip.id} className="hover:bg-white/[0.04] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-white/50 font-medium">#{trip.id}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-white/5 rounded border border-white/10">
                                                                <Truck size={14} className="text-white/60" />
                                                            </div>
                                                            <span className="font-bold text-slate-200">{trip.vehicle}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 font-medium">
                                                        {trip.driver}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border ${trip.status === 'Completed' ? 'bg-[#00ced1]/10 text-[#00ced1] border-[#00ced1]/20' :
                                                                trip.status === 'Dispatched' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            }`}>
                                                            {trip.status === 'Dispatched' ? 'On Trip' : trip.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {(!recentTrips || recentTrips.length === 0) ? (
                                        <div className="p-10 text-center text-slate-500 font-medium italic">
                                            No active trips recorded.
                                        </div>
                                    ) : recentTrips.filter(trip =>
                                        trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        trip.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        trip.status.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="p-10 text-center text-slate-500 font-medium italic">
                                            No trips found matching "{searchQuery}".
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
