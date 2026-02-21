import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';
import MagicContainer, { MagicCard } from '../components/MagicBento';
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
        <MagicCard className={`p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[40px] border border-white/[0.08] border-b-black/50 border-r-black/50 shrink-0 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)]`} enableStars={true}>
            <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 ${gradientClass}`} style={{ zIndex: 0 }}></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-[1.15] group-hover:opacity-20 transition-all duration-700 z-0 -translate-y-4 translate-x-4">
                <Icon size={120} className={colorClass} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-[1.2rem] border border-white/10 ${colorClass.replace('text-', 'bg-').replace('400', '500/10')} flex items-center justify-center backdrop-blur-md`}>
                        <Icon size={20} className={colorClass} />
                    </div>
                    <h3 className="text-white/70 font-semibold text-xs tracking-widest uppercase">{title}</h3>
                </div>
                <div>
                    <h2 className="text-[2.75rem] leading-none font-medium text-white tracking-tight drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)]">{value}</h2>
                </div>
            </div>
        </MagicCard>
    );

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">

            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">

                {/* Abstract Background Elements */}
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-[#00ced1]/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 to-[#00ced1]/20 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen"></div>

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
                            <MagicContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" ref={cardsRef} glowColor="0, 206, 209">
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
                            </MagicContainer>

                            {/* Table Controls */}
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                                <div className="relative w-full xl:w-96 flex-shrink-0 group">
                                    <div className="absolute inset-0 bg-[#00ced1]/10 rounded-[1.2rem] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                    <input type="text" placeholder="Search trips..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-[1.2rem] bg-black/30 backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white text-sm focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/40 transition-all shadow-inner relative z-10" />
                                    <Search className="absolute left-3.5 top-3.5 text-white/50 relative z-10" size={16} />
                                </div>

                                <div className="flex flex-wrap items-center gap-2 xl:gap-3">
                                    <div className="flex gap-2">
                                        <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Group by</button>
                                        <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Filter</button>
                                        <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Sort by...</button>
                                    </div>

                                    <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

                                    <div className="flex gap-2">
                                        <button onClick={() => navigate('/dispatch')} className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-xl border border-emerald-500/20 border-b-black/50 border-r-black/50 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)]"><Plus size={14} /> New Trip</button>
                                        <button onClick={() => navigate('/vehicles')} className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-gradient-to-br from-[#00ced1]/10 to-transparent backdrop-blur-xl border border-[#00ced1]/20 border-b-black/50 border-r-black/50 text-[#00ced1] hover:bg-[#00ced1]/20 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)]"><Plus size={14} /> New Vehicle</button>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Table */}
                            <div className="bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)]" ref={tableRef}>
                                <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm">
                                        <Send size={20} className="text-[#00ced1]" />
                                        Active Trips
                                    </h3>
                                    <button onClick={() => navigate('/dispatch')} className="text-[#00ced1] text-xs font-bold hover:underline">View Dispatcher</button>
                                </div>

                                <div className="overflow-x-auto relative">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-black/20 text-[#00ced1] border-b border-white/[0.05]">
                                            <tr>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Trip ID</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Vehicle & Driver</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Route (Origin &rarr; Dest)</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Logistics (Cargo / Fuel)</th>
                                                <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.05] bg-transparent">
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
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Truck size={12} className="text-[#00ced1]/70" />
                                                                <span className="font-bold text-slate-200">{trip.vehicle}</span>
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-medium ml-5">{trip.driver}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-emerald-400 font-medium text-xs flex items-center gap-1.5 w-32 sm:w-48 xl:w-64 truncate" title={trip.origin || 'HQ'}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                                                {trip.origin || 'HQ'}
                                                            </div>
                                                            <div className="text-rose-400 font-medium text-xs flex items-center gap-1.5 w-32 sm:w-48 xl:w-64 truncate" title={trip.destination}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                                                                {trip.destination}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-slate-300 font-bold text-sm">{trip.cargoWeight} kg</span>
                                                            <span className="text-slate-500 font-medium text-xs">Est. Fuel: ₹{trip.estimatedFuelCost}</span>
                                                        </div>
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
