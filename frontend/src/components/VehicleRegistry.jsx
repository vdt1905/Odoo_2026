import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Truck, Plus, MoreVertical, X, Settings2, ShieldAlert, Search } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const VehicleRegistry = () => {
    const { isAuthenticated } = useAuthStore();
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        licensePlate: '',
        maxLoadCapacity: '',
        odometer: '',
        vehicleType: 'Van'
    });

    const mainContentRef = useRef(null);
    const tableRef = useRef(null);

    const fetchVehicles = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { data } = await axios.get('http://localhost:3000/api/vehicles', {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setVehicles(data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchVehicles();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isLoading && mainContentRef.current) {
            gsap.fromTo(mainContentRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
            gsap.fromTo(tableRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 }
            );
        }
    }, [isLoading]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:3000/api/vehicles', formData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setIsAddModalOpen(false);
            setFormData({ name: '', licensePlate: '', maxLoadCapacity: '', odometer: '', vehicleType: 'Van' });
            fetchVehicles(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding vehicle');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Out of Service' ? 'Available' : 'Out of Service';
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.put(`http://localhost:3000/api/vehicles/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            fetchVehicles();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'On Trip': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'In Shop': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Out of Service': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                {/* Background Details */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ced1]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Vehicle Registry</h1>
                            <p className="text-slate-400 text-sm md:text-base">Manage fleet assets, monitor lifespan, and adjust availability status.</p>
                        </div>
                    </div>

                    {/* Table Controls */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <div className="relative w-full xl:w-96 flex-shrink-0">
                            <input type="text" placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 transition-all shadow-inner" />
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
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/[0.05] border border-white/20 text-white hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <Plus size={14} />
                                    New Vehicle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl" ref={tableRef} style={{ opacity: 0 }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/[0.02] text-slate-400 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">NO</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Plate</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Model</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Type</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Capacity</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Odometer</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80">Status</th>
                                        <th className="px-6 py-5 font-semibold tracking-wider text-xs uppercase opacity-80 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center"><div className="w-8 h-8 border-t-2 border-[#00ced1] rounded-full animate-spin"></div></div>
                                            </td>
                                        </tr>
                                    ) : vehicles.filter(v =>
                                        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        v.status.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No vehicles found matching "{searchQuery}".</td>
                                        </tr>
                                    ) : (
                                        vehicles.filter(v =>
                                            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            v.status.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((v, index) => (
                                            <tr key={v._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 font-mono text-white/50 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-300">
                                                    {v.licensePlate}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-200">
                                                    {v.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                                                        <Truck size={12} className="text-[#00ced1]" />
                                                        {v.vehicleType}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-medium">{v.maxLoadCapacity} kg</td>
                                                <td className="px-6 py-4 text-slate-400 font-medium">{v.odometer.toLocaleString()} km</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getStatusStyle(v.status)}`}>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => toggleStatus(v._id, v.status)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                                        title="Toggle Out of Service"
                                                    >
                                                        <ShieldAlert size={16} className={v.status === 'Out of Service' ? 'text-emerald-400' : 'text-red-400'} />
                                                    </button>
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

            {/* Add Asset Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings2 size={20} className="text-[#00ced1]" />
                                Register New Asset
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Asset Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="e.g. Heavy Hauler 5000" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">License Plate</label>
                                    <input type="text" required value={formData.licensePlate} onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="XYZ-9876" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Vehicle Type</label>
                                    <select value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all appearance-none">
                                        <option value="Truck">Truck</option>
                                        <option value="Van">Van</option>
                                        <option value="Bike">Bike</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Max Load (kg)</label>
                                    <input type="number" required value={formData.maxLoadCapacity} onChange={e => setFormData({ ...formData, maxLoadCapacity: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="5000" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Current Odometer</label>
                                    <input type="number" required value={formData.odometer} onChange={e => setFormData({ ...formData, odometer: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="12500" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#00ced1] text-[#050b14] font-bold shadow-[0_0_15px_rgba(0,206,209,0.3)] hover:shadow-[0_0_20px_rgba(0,206,209,0.5)] transition-all text-sm">Save Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VehicleRegistry;
