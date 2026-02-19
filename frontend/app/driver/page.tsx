'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DriverTaskPage() {
  // Simulasi Data Tugas
  const [tasks, setTasks] = useState([
    {
      id: "DO-8821",
      shopName: "Alfamidi Cikupa Raya",
      address: "Jl. Raya Serang KM 15, Cikupa",
      distance: "12.5 km",
      eta: "25 min",
      weather: "Mendung 🌥️",
      traffic: "Padat 🔴",
      status: "PENDING",
      lat: -6.241586, 
      lng: 106.522416 
    },
    {
      id: "DO-8822",
      shopName: "Indomaret Balaraja Barat",
      address: "Jl. Raya Serang KM 24, Balaraja",
      distance: "8.2 km",
      eta: "15 min",
      weather: "Hujan 🌧️",
      traffic: "Lancar 🟢",
      status: "PENDING",
      lat: -6.191632, 
      lng: 106.438090
    },
    {
      id: "DO-8823",
      shopName: "Superindo Citra Raya",
      address: "Komplek Citra Raya Blok K",
      distance: "5.1 km",
      eta: "10 min",
      weather: "Cerah ☀️",
      traffic: "Lancar 🟢",
      status: "PENDING",
      lat: -6.251632, 
      lng: 106.558090
    }
  ]);

  // Fungsi Deep Link ke Google Maps (FIXED)
  const openGoogleMaps = (lat: number, lng: number) => {
    // Ini format asli untuk maksa buka aplikasi Google Maps di HP / Tab baru di PC
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    // Background luar (Laptop Screen)
    <div className="min-h-screen bg-slate-950 flex justify-center font-sans text-slate-800">
      
      {/* FRAME HP (Ini kuncinya: max-w-md mengatur lebar maksimal kayak HP) */}
      <div className="w-full max-w-md bg-slate-900 min-h-screen shadow-2xl border-x border-slate-800 relative overflow-x-hidden pb-24 custom-scrollbar">
        
        {/* HEADER APLIKASI (Sticky nempel di atas) */}
        <div className="bg-slate-800 p-6 rounded-b-3xl shadow-lg border-b border-slate-700 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-xl font-bold text-white">Halo, Pak Budi <span className="text-xl">👋</span></h1>
                  <p className="text-xs text-slate-400 mt-1">Truk: B 9044 JXS • Cikupa</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-slate-700">
                  AD
              </div>
          </div>
          
          {/* RINGKASAN PROGRESS */}
          <div className="mt-6 flex gap-3">
              <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Sisa Paket</p>
                  <p className="text-3xl font-black text-white mt-1">3 <span className="text-sm font-normal text-slate-500">Titik</span></p>
              </div>
              <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Est. Selesai</p>
                  <p className="text-3xl font-black text-green-400 mt-1">14:30</p>
              </div>
          </div>
        </div>

        {/* LIST TUGAS (KARTU) */}
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rute Hari Ini</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-bold">3 Tersisa</span>
          </div>
          
          {tasks.map((task, index) => (
            <div key={index} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg relative overflow-hidden group">
              
              {/* Nomor Urut (Desain Pita) */}
              <div className="absolute top-0 right-0 bg-blue-600 w-12 h-12 flex items-center justify-center rounded-bl-2xl font-black text-white text-lg shadow-md">
                  {index + 1}
              </div>

              {/* Info Toko */}
              <div className="mb-5 pr-10">
                  <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded font-bold tracking-wider">{task.id}</span>
                  <h3 className="text-lg font-black text-white mt-3 leading-tight group-hover:text-blue-400 transition-colors">{task.shopName}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1">
                    <span className="text-blue-500">📍</span> {task.address}
                  </p>
              </div>

              {/* Info Pintar (Cuaca & Traffic) - Bikin scrollable kesamping kalo kepanjangan */}
              <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                  <div className="bg-slate-900 px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 whitespace-nowrap">
                      <span className="text-xs font-bold text-blue-300">🗺️ {task.distance}</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-300">{task.weather}</span>
                  </div>
                   <div className={`px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 whitespace-nowrap ${task.traffic.includes('Padat') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                       <span className="text-xs font-bold">🚦 {task.traffic}</span>
                  </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-4 gap-3">
                  {/* Tombol Navigasi (75% Lebar) */}
                  <button 
                      onClick={() => openGoogleMaps(task.lat, task.lng)}
                      className="col-span-3 bg-blue-600 active:bg-blue-700 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 border border-blue-500"
                  >
                      <span className="text-lg">🧭</span>
                      <span className="font-bold text-white text-sm tracking-wide">NAVIGASI GOOGLE</span>
                  </button>
                  
                  {/* Tombol Kamera (25% Lebar) */}
                  <button className="col-span-1 bg-slate-700 active:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-all">
                      📸
                  </button>
              </div>

            </div>
          ))}
        </div>

         {/* Floating Nav Bawah (Dikunci ke ukuran HP pakai max-w-md dan -translate-x-1/2) */}
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
             <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 py-3 px-6 rounded-full flex justify-between items-center shadow-2xl shadow-black/50">
                <Link href="/" className="text-2xl grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all hover:scale-110">🏠</Link>
                <div className="text-2xl relative">
                  📦
                  <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-800">3</span>
                </div>
                <div className="text-2xl grayscale opacity-50 hover:opacity-100 transition-all hover:scale-110">👤</div>
             </div>
         </div>

      </div>
    </div>
  );
}