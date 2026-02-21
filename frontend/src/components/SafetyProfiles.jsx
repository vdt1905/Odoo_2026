import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Shield, ShieldAlert, Award, AlertTriangle, AlertOctagon, UserCheck, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SafetyProfiles = () => {
    const { isAuthenticated, user } = useAuthStore();

    // Data State
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [formData, setFormData] = useState({
        safetyScore: '',
        complaintsCount: '',
        status: ''
    });
    const [addFormData, setAddFormData] = useState({
        name: '',
        licenseNumber: '',
        licenseExpiry: ''
    });

    const mainContentRef = useRef(null);
    const cardsRef = useRef(null);
    const tableRef = useRef(null);

    const fetchData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { data } = await axios.get('http://localhost:3000/api/drivers', {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setDrivers(data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
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
                .fromTo(cardsRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, "-=0.3")
                .fromTo(tableRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.4");
        }
    }, [isLoading]);

    const openEditModal = (driver) => {
        setSelectedDriver(driver);
        setFormData({
            safetyScore: driver.safetyScore,
            complaintsCount: driver.complaintsCount,
            status: driver.status
        });
        setIsEditModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.put(`http://localhost:3000/api/drivers/${selectedDriver._id}`, formData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating safety profile');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:3000/api/drivers', addFormData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setIsAddModalOpen(false);
            setAddFormData({ name: '', licenseNumber: '', licenseExpiry: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding driver');
        }
    };

    // Computations
    const avgScore = drivers.length > 0 ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length) : 0;

    // Check if license expires within 30 days
    const isExpiringSoon = (dateString) => {
        const expiry = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(expiry - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && expiry > today;
    };

    const isExpired = (dateString) => {
        return new Date(dateString) < new Date();
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 75) return 'text-amber-400';
        return 'text-red-400 font-bold animate-pulse';
    };

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-rose-500/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                {/* Background Details */}
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-rose-500/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#00ced1]/20 to-rose-500/10 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    {/* Header & Aggregates */}
                    <div className="mb-8" ref={cardsRef} style={{ opacity: 0 }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Safety Profiles</h1>
                                <p className="text-slate-400 text-sm md:text-base">Monitor fleet safety scores and license compliance metrics.</p>
                            </div>
                            {user?.role === 'SafetyOfficer' && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#00ced1] text-[#050b14] font-bold shadow-[0_0_15px_rgba(0,206,209,0.3)] hover:shadow-[0_0_20px_rgba(0,206,209,0.5)] transition-all flex items-center gap-2"
                                >
                                    <UserCheck size={18} />
                                    Add New Driver
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[40px] border border-white/[0.08] border-b-black/50 border-r-black/50 shrink-0 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-center justify-between min-h-[140px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/10 mb-4 inline-block">Fleet Avg Health</p>
                                    <div className="flex items-baseline gap-1">
                                        <h3 className={`text-[2.5rem] leading-none font-medium tracking-tight drop-shadow-[0_2px_15px_rgba(52,211,153,0.3)] ${getScoreColor(avgScore)}`}>{avgScore}</h3>
                                        <span className="text-sm font-semibold text-white/60 tracking-wider">/ 100</span>
                                    </div>
                                </div>
                                <div className="relative z-10 w-16 h-16 rounded-[1.2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-white/10 backdrop-blur-md shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                    <Award size={32} />
                                </div>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[40px] border border-white/[0.08] border-b-black/50 border-r-black/50 shrink-0 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-center justify-between min-h-[140px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/10 mb-4 inline-block">At Risk Drivers</p>
                                    <h3 className="text-[2.5rem] leading-none font-medium text-rose-400 tracking-tight drop-shadow-[0_2px_15px_rgba(244,63,94,0.3)]">
                                        {drivers.filter(d => d.safetyScore < 75 || isExpiringSoon(d.licenseExpiry) || isExpired(d.licenseExpiry)).length}
                                    </h3>
                                </div>
                                <div className="relative z-10 w-16 h-16 rounded-[1.2rem] bg-rose-500/10 flex items-center justify-center text-rose-400 border border-white/10 backdrop-blur-md shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                    <AlertOctagon size={32} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)]" ref={tableRef} style={{ opacity: 0 }}>
                        <div className="p-6 border-b border-white/[0.05] flex items-center gap-3">
                            <Shield className="text-rose-400" size={20} />
                            <h3 className="text-lg font-bold text-white drop-shadow-sm">Driver Roster</h3>
                        </div>

                        <div className="overflow-x-auto relative">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black/20 text-slate-400 border-b border-white/[0.05]">
                                    <tr>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Name</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">License#</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Expiry</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Completion Rate</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Safety Score</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Complaints</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80">Duty Status</th>
                                        <th className="px-6 py-5 font-bold tracking-wider text-xs uppercase opacity-80 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05] bg-transparent">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center"><div className="w-8 h-8 border-t-2 border-rose-400 rounded-full animate-spin"></div></div>
                                            </td>
                                        </tr>
                                    ) : drivers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No drivers added to the system yet.</td>
                                        </tr>
                                    ) : (
                                        drivers.map((driver) => {
                                            const expiringSoon = isExpiringSoon(driver.licenseExpiry);
                                            const expired = isExpired(driver.licenseExpiry);
                                            const highRisk = driver.safetyScore < 75 || expired || driver.status === 'SUSPENDED' || driver.status === 'LOCKED';

                                            return (
                                                <tr key={driver._id} className={`hover:bg-white/[0.02] transition-colors group ${highRisk ? 'bg-rose-500/[0.02]' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${highRisk ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                                                                <UserCheck size={14} />
                                                            </div>
                                                            <p className={`font-bold transition-colors ${highRisk ? 'text-rose-100 group-hover:text-white' : 'text-slate-200 group-hover:text-white'}`}>{driver.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-slate-300 font-medium">{driver.licenseNumber || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${expired ? 'text-rose-400' : expiringSoon ? 'text-amber-400' : 'text-slate-300'}`}>
                                                                    {new Date(driver.licenseExpiry).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                                                </span>
                                                                {(expired || expiringSoon) && <AlertTriangle size={14} className={expired ? 'text-rose-400' : 'text-amber-400'} />}
                                                            </div>
                                                            {expired && <div className="text-[10px] text-rose-400 uppercase font-bold mt-0.5 tracking-wider">Expired</div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-200">
                                                            {driver.totalTripsAssigned > 0 ? `${Math.round((driver.tripsCompleted / driver.totalTripsAssigned) * 100)}%` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-base font-bold font-mono ${getScoreColor(driver.safetyScore)}`}>
                                                                {driver.safetyScore}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`font-bold text-base ${driver.complaintsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                                            {driver.complaintsCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${driver.status === 'ON_DUTY' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
                                                            driver.status === 'BREAK' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' :
                                                                driver.status === 'SUSPENDED' ? 'text-rose-400 bg-rose-400/10 border border-rose-400/20' :
                                                                    driver.status === 'LOCKED' ? 'text-purple-400 bg-purple-400/10 border border-purple-400/20' :
                                                                        'text-slate-400 bg-slate-400/10 border border-slate-400/20'
                                                            }`}>
                                                            {driver.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openEditModal(driver)}
                                                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all shadow-sm"
                                                        >
                                                            Review Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>

            {/* Add Driver Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-gradient-to-br from-[#0b1120]/90 to-[#050b14]/90 backdrop-blur-[40px] border border-[#00ced1]/30 border-b-black/50 border-r-black/50 rounded-[2rem] shadow-[0_20px_60px_rgba(0,206,209,0.15)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-gradient-to-r from-[#00ced1]/10 to-transparent">
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm">Add Fleet Driver</h2>
                                <p className="text-[10px] text-[#00ced1]/70 uppercase tracking-widest font-bold mt-1">New Human Capital</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-[#00ced1]/20 hover:border-[#00ced1]/30">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Driver Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addFormData.name}
                                    onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm font-medium transition-all placeholder:text-slate-500"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">License Number</label>
                                <input
                                    type="text"
                                    required
                                    value={addFormData.licenseNumber}
                                    onChange={e => setAddFormData({ ...addFormData, licenseNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm font-medium transition-all placeholder:text-slate-500"
                                    placeholder="DL-XYZ-123"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">License Expiration Date</label>
                                <input
                                    type="date"
                                    required
                                    value={addFormData.licenseExpiry}
                                    onChange={e => setAddFormData({ ...addFormData, licenseExpiry: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm font-medium transition-all"
                                    style={{ colorScheme: "dark" }}
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-3 rounded-xl bg-[#00ced1] text-[#050b14] font-bold shadow-[0_0_15px_rgba(0,206,209,0.3)] hover:shadow-[0_0_20px_rgba(0,206,209,0.5)] transition-all text-sm tracking-wide">
                                    Register Driver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Safety Profile Modal */}
            {isEditModalOpen && selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative bg-gradient-to-br from-[#0b1120]/90 to-[#050b14]/90 backdrop-blur-[40px] border border-rose-500/30 border-b-black/50 border-r-black/50 rounded-[2rem] shadow-[0_20px_60px_rgba(244,63,94,0.15)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-gradient-to-r from-rose-500/10 to-transparent">
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm">Safety Review</h2>
                                <p className="text-[10px] text-rose-300/60 uppercase tracking-widest font-bold mt-1">{selectedDriver.name}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Modify Safety Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0" max="100"
                                    required
                                    value={formData.safetyScore}
                                    onChange={e => setFormData({ ...formData, safetyScore: Number(e.target.value) })}
                                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${formData.safetyScore < 75 ? 'border-rose-500/50 text-rose-400' : 'border-white/10 text-emerald-400'} focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-xl font-bold font-mono text-center transition-all`}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Complaints Count</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.complaintsCount}
                                    onChange={e => setFormData({ ...formData, complaintsCount: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-xl font-bold font-mono text-center transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Administrative Status</label>
                                <select
                                    required
                                    disabled={selectedDriver?.status === 'LOCKED'}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-sm transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="ON_DUTY">ON DUTY</option>
                                    <option value="BREAK">BREAK</option>
                                    <option value="OFF_DUTY">OFF DUTY</option>
                                    <option value="SUSPENDED">SUSPENDED</option>
                                    {selectedDriver?.status === 'LOCKED' && <option value="LOCKED">LOCKED (License Expired)</option>}
                                </select>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all text-sm tracking-wide">
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div >
    );
};

export default SafetyProfiles;
