"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon bawaan Leaflet yang sering hilang di Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Icon khusus untuk Depo (Warna Merah)
const depoIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Warna-warni untuk 7 Truk berbeda
const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function MapTracker({ routeLines, storeLocations }: { routeLines: any, storeLocations: any }) {
    // Pusat kamera di Depo Cikupa
    const center = [-6.216347, 106.516086];

    return (
        <MapContainer center={center as any} zoom={11} className="w-full h-full z-0">
            {/* Tema Peta: Voyager (Biar elegan masuk ke tema gelap kita) */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* 1. RENDER TITIK TOKO & DEPO */}
            {storeLocations && storeLocations.map((loc: any, idx: number) => {
                // Cegah error kalau koordinat kosong
                if (!loc.coords || loc.coords.length < 2 || isNaN(loc.coords[0])) return null;

                return (
                    <Marker key={`loc-${idx}`} position={loc.coords} icon={loc.type === 'depot' ? depoIcon : customIcon}>
                        <Popup>
                            <b className="text-sm font-bold">{loc.name}</b><br/>
                            <span className="text-xs text-slate-500">
                                {loc.type === 'depot' ? 'Markas Pusat (Depo)' : 'Titik Pengiriman'}
                            </span>
                        </Popup>
                    </Marker>
                )
            })}

            {/* 2. RENDER GARIS RUTE (Muncul setelah diklik Generate) */}
            {routeLines && routeLines.map((truk: any, idx: number) => {
                if (!truk.path || truk.path.length === 0) return null;
                const routeColor = COLORS[idx % COLORS.length]; // Bagi warna sesuai truk

                return (
                    <Polyline
                        key={`route-${idx}`}
                        positions={truk.path}
                        pathOptions={{ 
                            color: routeColor, 
                            weight: 5, 
                            opacity: 0.8, 
                            dashArray: "10, 10" // Garis putus-putus biar estetik
                        }}
                    />
                )
            })}
        </MapContainer>
    );
}