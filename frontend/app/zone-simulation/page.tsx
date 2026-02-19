'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

// Load Peta (Leaflet) secara dinamis biar gak error di Next.js
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function ZoneSimulationPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data simulasi dari Backend Python
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/simulate-zones')
      .then((res) => res.json())
      .then((data) => {
        setZones(data);
        setLoading(false);
      })
      .catch((err) => console.error("Gagal konek backend:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">JAPFA TERRITORY SIMULATION</h1>
          <p className="text-xs text-slate-400">Simulasi Pembagian 7 Wilayah & Rute Otomatis</p>
        </div>
        <div className="flex gap-4">
             <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold">
                🔄 GENERATE ULANG
             </button>
             <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold">
                KEMBALI
             </Link>
        </div>
      </div>

      <div className="flex flex-1">
        
        {/* SIDEBAR LIST WILAYAH */}
        <div className="w-80 bg-slate-800 p-4 overflow-y-auto border-r border-slate-700">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Distribusi Toko</h2>
          
          {loading ? <p className="text-center mt-10 animate-pulse">Sedang Menghitung Wilayah...</p> : (
            <div className="space-y-4">
              {zones.map((zone, idx) => (
                <div key={idx} className="bg-slate-700 p-3 rounded-lg border-l-4 shadow-sm" style={{ borderColor: zone.color }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm">{zone.zone_name}</h3>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-900 rounded-full" style={{ color: zone.color }}>
                      {zone.total_shops} Toko
                    </span>
                  </div>
                  {/* List Toko Kecil */}
                  <div className="text-[10px] text-slate-400 h-16 overflow-y-auto bg-slate-900 p-2 rounded">
                      {zone.shops.map((s:any, i:number) => (
                          <div key={i} className="mb-1">• {s.id}</div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PETA VISUALISASI */}
        <div className="flex-1 relative z-0">
            {typeof window !== 'undefined' && (
             <MapContainer center={[-6.2088, 106.8456]} zoom={10} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {!loading && zones.map((zone, zIdx) => (
                  <div key={zIdx}>
                    
                    {/* 1. GAMBAR GARIS RUTE (POLYLINE) */}
                    <Polyline 
                        positions={[
                            zone.center, // Dari Pusat Wilayah
                            ...zone.shops.map((s:any) => [s.lat, s.lng]), // Ke Toko-toko
                            zone.center // Balik ke Pusat (Opsional)
                        ]}
                        pathOptions={{ color: zone.color, weight: 2, opacity: 0.6, dashArray: '5, 10' }} 
                    />

                    {/* 2. GAMBAR PUSAT WILAYAH (MARKAS) */}
                    <CircleMarker center={zone.center} radius={10} pathOptions={{ color: zone.color, fillOpacity: 0.8 }}>
                         <Popup>
                            <b>PUSAT {zone.zone_name}</b>
                         </Popup>
                    </CircleMarker>

                    {/* 3. GAMBAR TOKO-TOKO */}
                    {zone.shops.map((shop:any, sIdx:number) => (
                        <CircleMarker key={sIdx} center={[shop.lat, shop.lng]} radius={5} pathOptions={{ color: zone.color, fillColor: 'white', fillOpacity: 1 }}>
                            <Popup>{shop.id}</Popup>
                        </CircleMarker>
                    ))}

                  </div>
                ))}

             </MapContainer>
            )}
        </div>
      </div>
    </div>
  );
}