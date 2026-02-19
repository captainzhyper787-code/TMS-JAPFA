"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';

const MapTracker = dynamic(() => import('@/components/MapTracker'), { 
  ssr: false, 
  loading: () => <div className="h-full flex items-center justify-center bg-slate-900 text-blue-400 font-bold animate-pulse">Initializing VRP Engine...</div>
});

export default function Home() {
  const [engineStatus, setEngineStatus] = useState("DISCONNECTED");
  const [vrpResult, setVrpResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State untuk UI Baru
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Live Monitoring");

  const [locations, setLocations] = useState<any[]>([
      { name: "Depo Cikupa (START)", coords: [-6.216347, 106.516086], type: "depot" }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNGSI UPLOAD EXCEL ---
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: any) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const newLocations = data.map((row: any, idx: number) => ({
         name: row.name || `Toko Import #${idx+1}`,
         coords: [parseFloat(row.lat), parseFloat(row.lng)],
         type: "store",
         status: "PENDING"
      }));

      setLocations([locations[0], ...newLocations]);
      alert(`Berhasil import ${newLocations.length} titik pengiriman!`);
    };
    reader.readAsBinaryString(file);
  };

  // --- FUNGSI OPTIMASI (NEMPEL JALAN) ---
  const handleOptimize = async () => {
    if (locations.length < 2) return alert("Upload data dulu Bos!");
    setIsProcessing(true);

    try {
      // 1. Minta urutan toko ke Backend Python kita
      const payload = {
          locations: locations.map(l => l.coords),
          num_vehicles: 7, 
          depot: 0
      };

      const res = await fetch("http://127.0.0.1:8000/api/vrp/solve", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.status === "OPTIMAL") {
          // 2. Minta bentuk jalan raya (Aspal) ke API OSRM untuk tiap truk
          const formattedResult = await Promise.all(data.solusi.map(async (truk: any) => {
             // Ambil info nama toko
             const stops = truk.rute.map((r: any) => {
                 const foundLoc = locations.find(l => 
                    Math.abs(l.coords[0] - r.koordinat[0]) < 0.0001 && 
                    Math.abs(l.coords[1] - r.koordinat[1]) < 0.0001
                 );
                 return { ...r, name: foundLoc ? foundLoc.name : "Unknown", status: "PENDING" };
             });

             // Format kordinat untuk OSRM: longitude,latitude;longitude,latitude
             const osrmCoords = truk.rute.map((r:any) => `${r.koordinat[1]},${r.koordinat[0]}`).join(';');
             let finalPath = truk.rute.map((r:any) => r.koordinat); // Backup garis lurus kalau internet lemot

             try {
                 // Tembak ke API OSRM Gratisan
                 const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`);
                 const osrmData = await osrmRes.json();
                 
                 if (osrmData.routes && osrmData.routes[0]) {
                     // OSRM balikin format [lng, lat], Leaflet butuh [lat, lng], jadi kita balik!
                     finalPath = osrmData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                 }
             } catch (e) {
                 console.log("Gagal nempel aspal, pakai garis lurus aja.");
             }

             return { truk_id: truk.truk_id, path: finalPath, stops: stops };
          }));

          setVrpResult(formattedResult);
          setActiveTab("e-POD Verification");
      }
    } catch (err) { 
        alert("Server VRP Error / Timeout (Cek koneksi backend)"); 
    }
    setIsProcessing(false);
  };

  // --- FUNGSI VERIFY ---
  const handleVerifyDelivery = (trukIdx: number, stopIdx: number) => {
      const newResult = [...vrpResult];
      newResult[trukIdx].stops[stopIdx].status = "VERIFIED";
      newResult[trukIdx].stops[stopIdx].pod_time = new Date().toLocaleTimeString();
      setVrpResult(newResult);
  };

  useEffect(() => {
     const checkBackend = async () => { try { await fetch("http://127.0.0.1:8000/api/status"); setEngineStatus("CONNECTED"); } catch(e){ setEngineStatus("DISCONNECTED"); }};
     checkBackend();
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans text-slate-800">
      
      {/* SIDEBAR DASHBOARD (Bisa Buka Tutup) */}
      <div className={`bg-slate-950 flex flex-col shadow-2xl z-30 flex-shrink-0 text-white transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0'}`}>
        {/* Supaya konten gak berantakan pas width mengecil */}
        <div className="w-80 h-full flex flex-col">
            
            {/* LOGO & TITLE (VERSI NEMPEL KETAT & SEJAJAR) */}
            {/* Saya pakai py-5 biar jarak atas bawahnya lebih pas */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center relative overflow-hidden">
               
               {/* 1. TINGGI DIPASSIN: Ubah jadi h-14 biar sejajar visual sama blok teks */}
               <img 
                   src="/japfa-logo.png" 
                   alt="Logo" 
                   // z-20 biar bener-bener paling atas
                   className="h-14 w-auto object-contain drop-shadow-2xl relative z-20" 
                   onError={(e) => e.currentTarget.style.display = 'none'} 
               />
               
               {/* 2. MAJUIN LAGI: Margin negatif digedein jadi -ml-10 biar makin nubruk */}
               <div className="flex flex-col justify-center -ml-10 relative z-10 pt-1">
                  {/* Padding dikurangin (pl-1) biar makin nempel */}
                  <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none pl-1" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                    TMS<span className="text-white">JAPFA</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest pl-2 font-bold">Enterprise Command</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* 1. PLAN SECTION (NEW UI DROPZONE) */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>🎯</span> 1. ROUTE PLANNER
                    </h3>
                    
                    {/* Input Excel Tersembunyi */}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                    
                    {/* DROPZONE AREA */}
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-full py-6 mb-4 bg-slate-800/30 hover:bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl text-center cursor-pointer transition-all group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform text-blue-400">📊</div>
                        <p className="text-xs font-bold text-slate-300">Upload Data Order (Excel)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Klik atau Drag file kesini</p>
                    </div>

                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-4 px-2 py-2 bg-slate-950 rounded-lg">
                        <span className="flex flex-col">Toko Target <b className="text-white text-lg">{locations.length - 1}</b></span>
                        <span className="flex flex-col text-right">Armada Aktif <b className="text-white text-lg">7</b></span>
                    </div>

                    <button onClick={handleOptimize} disabled={isProcessing} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-sm font-black shadow-lg shadow-blue-900/50 transition transform active:scale-95 border border-blue-400/20">
                        {isProcessing ? "Menghitung Rute..." : "⚡ GENERATE ROUTES"}
                    </button>
                </div>

                {/* 2. FLEET STATUS SECTION */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>🚚</span> 2. FLEET STATUS
                    </h3>
                    {vrpResult ? (
                        <div className="space-y-3">
                            {vrpResult.map((truk: any, idx: number) => {
                                const done = truk.stops.filter((s:any) => s.status === "VERIFIED").length;
                                const total = truk.stops.length - 1; // exclude depo
                                const progress = Math.round((done/total)*100) || 0;
                                
                                return (
                                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="font-bold text-slate-200">{truk.truk_id}</span>
                                            <span className={`font-bold ${progress===100?"text-green-500":"text-blue-400"}`}>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-950 rounded-lg border border-slate-800 border-dashed">
                            <p className="text-xs text-slate-600">Belum ada rute aktif.</p>
                        </div>
                    )}
                </div>

            </div>
            
            {/* FOOTER & ACCOUNT MENU */}
            <div className="mt-auto border-t border-slate-800 bg-slate-950 p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4 p-2 hover:bg-slate-900 rounded-lg cursor-pointer transition">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">AD</div>
                    <div>
                        <p className="text-xs font-bold text-white">Admin Logistic</p>
                        <p className="text-[10px] text-green-400">● Online</p>
                    </div>
                </div>
                
                {/* Mini Menu */}
                <div className="flex justify-between text-slate-500 px-2 mb-4">
                    <button className="hover:text-white transition" title="Settings">⚙️ Setting</button>
                    <button className="hover:text-red-400 transition" title="Logout">🚪 Keluar</button>
                </div>

                <div className="text-[9px] flex justify-between text-slate-600 px-2">
                    <span>STATUS: {engineStatus}</span>
                    <span>V.2.0 FINAL</span>
                </div>
            </div>
        </div>
      </div>

      {/* AREA UTAMA (NAVIGASI ATAS + PETA) */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
          
          {/* HEADER NAVIGASI (TEMA GELAP MENYATU) */}
          <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 shadow-md z-10">
              
              {/* Tombol Hamburger Toggeler */}
              <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="p-2 mr-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                  {isSidebarOpen ? '◀' : '☰'}
              </button>

              <div className="flex gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {["Live Monitoring", "e-POD Verification", "Performance"].map((tab) => (
                      <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-900 hover:text-slate-300'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
          </div>

          {/* AREA KONTEN (PETA & VERIFY) DENGAN BINGKAI */}
          <div className="flex-1 flex overflow-hidden p-4 gap-4">
              
              {/* PETA DENGAN BINGKAI ELEGAN */}
              <div className="flex-1 relative bg-slate-800 rounded-2xl border-4 border-slate-800 overflow-hidden shadow-2xl">
                  <MapTracker 
                      routeLines={vrpResult} 
                      storeLocations={locations} 
                      onAddStore={() => {}} 
                  />
                  {/* Overlay Status (Opsional) */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded text-[10px] text-white border border-slate-700 z-[400]">
                      Live GPS Data • {new Date().toLocaleDateString()}
                  </div>
              </div>

              {/* 3. VERIFY PANEL (e-POD) - Muncul kalau Tab e-POD aktif & ada hasil */}
              {(vrpResult && activeTab === "e-POD Verification") && (
                  <div className="w-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
                      <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                          <h3 className="font-black text-white text-lg flex items-center gap-2"><span>🛡️</span> e-POD Control</h3>
                          <p className="text-xs text-slate-400 mt-1">Verifikasi real-time dari driver lapangan</p>
                      </div>
                      
                      <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                          {vrpResult.map((truk: any, tIdx: number) => (
                              <div key={tIdx} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                                  <h4 className="text-xs font-bold text-blue-400 mb-3 uppercase px-1">{truk.truk_id}</h4>
                                  <div className="space-y-2">
                                      {truk.stops.map((stop: any, sIdx: number) => (
                                          stop.status !== "KEMBALI KE DEPO" && (
                                              <div key={sIdx} className={`p-3 rounded-lg border flex justify-between items-center transition-all
                                                  ${stop.status==="VERIFIED" ? "bg-green-900/20 border-green-500/30" : "bg-slate-950 border-slate-700"}`}>
                                                  
                                                  <div>
                                                      <p className={`text-xs font-bold ${stop.status==="VERIFIED" ? "text-green-400" : "text-white"}`}>{stop.name}</p>
                                                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                                          {stop.status==="VERIFIED" ? <span>✅ Delivered {stop.pod_time}</span> : <span>⏳ Menunggu Driver...</span>}
                                                      </p>
                                                  </div>

                                                  {stop.status !== "VERIFIED" ? (
                                                      <button 
                                                          onClick={() => handleVerifyDelivery(tIdx, sIdx)}
                                                          className="px-4 py-2 bg-slate-800 hover:bg-green-600 text-white text-[10px] font-bold rounded-lg border border-slate-600 hover:border-green-500 transition-all shadow-md"
                                                      >
                                                          VERIFY
                                                      </button>
                                                  ) : (
                                                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
                                                  )}
                                              </div>
                                          )
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}