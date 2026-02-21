import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';

// Fix for default leaflet marker icon issue in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPickerModal = ({ isOpen, onClose, onConfirm, title = "Select Location" }) => {
    const [position, setPosition] = useState(null); // [lat, lng]
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Default center (e.g., India center or Mumbai)
    const defaultCenter = [19.0760, 72.8777];

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                fetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    };

    const fetchAddress = async (lat, lng) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (response.data && response.data.display_name) {
                setAddress(response.data.display_name);
            } else {
                setAddress("Location not found");
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress("Error fetching address");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0b1120] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col h-[80vh] max-h-[700px]">

                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-[#00ced1]" size={24} />
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-900 w-full h-full z-0 group">
                    <MapContainer center={defaultCenter} zoom={11} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker />
                    </MapContainer>
                    <div className="absolute top-4 left-4 z-[9999] pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm px-4 py-2 rounded-xl shadow-lg font-medium opacity-100 group-hover:opacity-0 transition-opacity duration-500 delay-1000">
                        Click anywhere on the map to drop a pin
                    </div>
                </div>

                {/* Footer with Address */}
                <div className="p-5 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-3 min-h-[50px] flex items-center">
                        {isLoading ? (
                            <div className="flex items-center gap-3 text-[#00ced1]">
                                <Loader2 className="animate-spin" size={18} />
                                <span className="text-sm font-medium tracking-wide">Resolving Coordinates...</span>
                            </div>
                        ) : address ? (
                            <p className="text-sm text-white font-medium line-clamp-2" title={address}>{address}</p>
                        ) : (
                            <p className="text-sm text-slate-500 italic font-medium">No location selected</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm(address);
                                onClose();
                            }}
                            disabled={!address || isLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00ced1] to-[#018b8b] text-white text-sm font-bold shadow-[0_0_15px_rgba(0,206,209,0.3)] hover:shadow-[0_0_20px_rgba(0,206,209,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_15px_rgba(0,206,209,0.3)] disabled:saturate-0"
                        >
                            <Check size={16} />
                            Confirm Location
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LocationPickerModal;
