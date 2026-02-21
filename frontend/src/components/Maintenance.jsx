import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { PenTool, Calendar, Wrench, CheckCircle, Clock, Search, Plus, X, Settings2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Maintenance = () => {
    const { isAuthenticated } = useAuthStore();

    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        vehicle: '',
        serviceType: 'Oil Change',
        description: '',
        cost: '',
        serviceDate: '',
        status: 'Scheduled'
    });
    const [formError, setFormError] = useState('');

    const mainContentRef = useRef(null);
    const formRef = useRef(null);
    const tableRef = useRef(null);

    const fetchData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const headers = { Authorization: `Bearer ${storedUser?.token}` };

            const [logsRes, vehiclesRes] = await Promise.all([
                axios.get('http://localhost:3000/api/maintenance', { headers }),
                axios.get('http://localhost:3000/api/vehicles', { headers })
            ]);

            setLogs(logsRes.data);
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
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
            gsap.fromTo(mainContentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            gsap.fromTo(tableRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 });
        }
    }, [isLoading]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:3000/api/maintenance', formData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setFormData({ vehicle: '', serviceType: 'Oil Change', description: '', cost: '', serviceDate: '', status: 'Scheduled' });
            setIsAddModalOpen(false);
            fetchData(); // Refresh list & update vehicle availability
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error creating maintenance log');
        }
    };

    const updateLogStatus = async (logId, newStatus) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.put(`http://localhost:3000/api/maintenance/${logId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            fetchData(); // Refresh to update vehicle states globally
        } catch (error) {
            console.error('Error updating log status:', error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Scheduled': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'In Progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                {/* Background Details */}
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/20 to-rose-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#00ced1]/20 to-amber-500/10 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Service Logs</h1>
                            <p className="text-slate-400 text-sm md:text-base">Track preventative maintenance and auto-manage fleet availability.</p>
                        </div>
                    </div>

                    {/* Table Controls */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <div className="relative w-full xl:w-96 flex-shrink-0 group">
                            <div className="absolute inset-0 bg-amber-400/10 rounded-[1.2rem] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                            <input type="text" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-[1.2rem] bg-black/30 backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white text-sm focus:outline-none focus:border-amber-400/50 focus:bg-black/40 transition-all shadow-inner relative z-10" />
                            <Search className="absolute left-3.5 top-3.5 text-white/40 relative z-10" size={16} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:gap-3">
                            <div className="flex gap-2">
                                <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Group by</button>
                                <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Filter</button>
                                <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Sort by...</button>
                            </div>

                            <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-gradient-to-r from-amber-400 to-amber-500 text-[#050b14] shadow-[0_4px_15px_rgba(251,191,36,0.3)] hover:shadow-[0_4px_25px_rgba(251,191,36,0.5)] transition-all transform hover:-translate-y-0.5 border border-white/10"
                                >
                                    <Plus size={14} />
                                    New Service
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)]" ref={tableRef} style={{ opacity: 0 }}>
                        <div className="overflow-x-auto relative">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#050b14]/80 backdrop-blur-md text-[#00ced1] border-b border-white/[0.08] sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Log ID</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Vehicle</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Issue / Service</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Date</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Cost</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80">Status</th>
                                        <th className="px-6 py-5 font-black tracking-wider text-xs uppercase opacity-80 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05] bg-transparent">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center"><div className="w-8 h-8 border-t-2 border-amber-400 rounded-full animate-spin"></div></div>
                                            </td>
                                        </tr>
                                    ) : logs.filter(log =>
                                        log._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (log.vehicle?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        log.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        log.status.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-white/50 font-medium">No service logs found.</td>
                                        </tr>
                                    ) : (
                                        logs.filter(log =>
                                            log._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (log.vehicle?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            log.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            log.status.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((log) => (
                                            <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5 font-mono text-white/50 font-bold relative pl-4">
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-400 transition-colors"></span>
                                                    #{log._id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-5 font-bold text-slate-200 drop-shadow-sm">
                                                    {log.vehicle?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-amber-100/90">{log.serviceType}</div>
                                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[150px] mt-0.5">{log.description}</div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-300 font-bold flex items-center gap-2 mt-2">
                                                    <Calendar size={14} className="text-white/40" /> {new Date(log.serviceDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-5 font-mono text-slate-300">
                                                    ${log.cost}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm ${getStatusStyle(log.status)}`}>
                                                        {log.status === 'Scheduled' && <Clock size={12} />}
                                                        {log.status === 'In Progress' && <Wrench size={12} />}
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    {log.status !== 'Completed' && (
                                                        <button
                                                            onClick={() => updateLogStatus(log._id, 'Completed')}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
                                                        >
                                                            <CheckCircle size={14} /> Complete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>

            {/* Add Service Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-gradient-to-br from-[#0b1120]/90 to-[#050b14]/90 backdrop-blur-[40px] border border-amber-500/30 border-b-black/50 border-r-black/50 rounded-[2rem] shadow-[0_20px_60px_rgba(251,191,36,0.15)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-gradient-to-r from-amber-500/10 to-transparent">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm">
                                    <PenTool size={20} className="text-amber-400" />
                                    Record Service
                                </h2>
                                <p className="text-[10px] text-amber-300/60 uppercase tracking-widest font-bold mt-1">Maintenance Log</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/30">
                                <X size={16} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mx-6 mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Select Asset</label>
                                <select required value={formData.vehicle} onChange={e => setFormData({ ...formData, vehicle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all appearance-none" style={{ backgroundColor: '#0b1120' }}>
                                    <option value="" disabled>-- Choose Vehicle --</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Service Type</label>
                                    <select required value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all appearance-none" style={{ backgroundColor: '#0b1120' }}>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Tire Rotation">Tire Rotation</option>
                                        <option value="Engine Repair">Engine Repair</option>
                                        <option value="Inspection">Inspection</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Log Status</label>
                                    <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all appearance-none" style={{ backgroundColor: '#0b1120' }}>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Date</label>
                                <input type="date" required value={formData.serviceDate} onChange={e => setFormData({ ...formData, serviceDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Est. Cost ($)</label>
                                <input type="number" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all pointer-events-auto" placeholder="150" />
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Description / Notes</label>
                                <textarea rows="3" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm transition-all resize-none" placeholder="Details of the service..." />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-400 text-[#050b14] font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all text-sm" disabled={isLoading}>Save Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
