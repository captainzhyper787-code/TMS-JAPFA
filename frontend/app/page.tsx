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
  const [activeTab, setActiveTab] = useState("Planning Route"); // Default tab diubah ke Planning dulu
  const [routingMode, setRoutingMode] = useState("AI_AUTO"); // State untuk 4 Mode Routing

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
      // 1. Minta urutan toko ke Backend Python (Ditambah parameter routing_mode)
      const payload = {
          locations: locations.map(l => l.coords),
          num_vehicles: 7, 
          depot: 0,
          routing_mode: routingMode // <--- Ini dikirim ke Python!
      };

      const res = await fetch("http://127.0.0.1:8000/api/vrp/solve", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.status === "OPTIMAL") {
          // 2. Minta bentuk jalan raya (Aspal) ke API OSRM
          const formattedResult = await Promise.all(data.solusi.map(async (truk: any) => {
             const stops = truk.rute.map((r: any) => {
                 const foundLoc = locations.find(l => 
                    Math.abs(l.coords[0] - r.koordinat[0]) < 0.0001 && 
                    Math.abs(l.coords[1] - r.koordinat[1]) < 0.0001
                 );
                 return { ...r, name: foundLoc ? foundLoc.name : "Unknown", status: "PENDING" };
             });

             const osrmCoords = truk.rute.map((r:any) => `${r.koordinat[1]},${r.koordinat[0]}`).join(';');
             let finalPath = truk.rute.map((r:any) => r.koordinat); 

             try {
                 const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`);
                 const osrmData = await osrmRes.json();
                 
                 if (osrmData.routes && osrmData.routes[0]) {
                     finalPath = osrmData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                 }
             } catch (e) {
                 console.log("Gagal nempel aspal, pakai garis lurus aja.");
             }

             return { truk_id: truk.truk_id, path: finalPath, stops: stops };
          }));

          setVrpResult(formattedResult);
          setActiveTab("e-POD Verification"); // Auto pindah ke tab monitoring
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
      
      {/* SIDEBAR DASHBOARD */}
      <div className={`bg-slate-950 flex flex-col shadow-2xl z-30 flex-shrink-0 text-white transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0'}`}>
        <div className="w-80 h-full flex flex-col">
            
            {/* LOGO & TITLE */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center relative overflow-hidden">
               <img 
                   src="/japfa-logo.png" 
                   alt="Logo" 
                   className="h-14 w-auto object-contain drop-shadow-2xl relative z-20" 
                   onError={(e) => e.currentTarget.style.display = 'none'} 
               />
               <div className="flex flex-col justify-center -ml-10 relative z-10 pt-1">
                  <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none pl-1" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                    TMS<span className="text-white">JAPFA</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest pl-2 font-bold">Enterprise Command</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* 1. PLAN SECTION */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>🎯</span> 1. ROUTE PLANNER
                    </h3>
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-full py-6 mb-4 bg-slate-800/30 hover:bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl text-center cursor-pointer transition-all group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform text-blue-400">📊</div>
                        <p className="text-xs font-bold text-slate-300">Upload Data Order (Excel)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Klik atau Drag file kesini</p>
                    </div>

                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-2 px-2 py-2 bg-slate-950 rounded-lg">
                        <span className="flex flex-col">Toko Target <b className="text-white text-lg">{locations.length - 1}</b></span>
                        <span className="flex flex-col text-right">Armada Aktif <b className="text-white text-lg">7</b></span>
                    </div>

                    {/* Indikator Strategi Aktif */}
                    <div className="text-center mb-4 bg-slate-950 border border-slate-800 rounded-md py-1.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Strategi AI Aktif: </span>
                        <span className="text-[10px] font-bold text-blue-400 ml-1">{routingMode.replace('_', ' ')}</span>
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
                                const total = truk.stops.length - 1; 
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
            
            {/* FOOTER */}
            <div className="mt-auto border-t border-slate-800 bg-slate-950 p-4">
                <div className="text-[9px] flex justify-between text-slate-600 px-2">
                    <span>STATUS: {engineStatus}</span>
                    <span>V.2.1 PRO</span>
                </div>
            </div>
        </div>
      </div>

      {/* AREA UTAMA */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
          
          {/* HEADER NAVIGASI (TAB MENU) */}
          <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 shadow-md z-10">
              <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="p-2 mr-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                  {isSidebarOpen ? '◀' : '☰'}
              </button>

              <div className="flex gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {/* TAB MENU DENGAN PLANNING ROUTE */}
                  {["Planning Route", "Live Monitoring", "e-POD Verification", "Performance"].map((tab) => (
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

          {/* AREA KONTEN (PETA & PANEL KANAN) */}
          <div className="flex-1 flex overflow-hidden p-4 gap-4">
              
              {/* PETA */}
              <div className="flex-1 relative bg-slate-800 rounded-2xl border-4 border-slate-800 overflow-hidden shadow-2xl">
                  <MapTracker 
                      routeLines={vrpResult} 
                      storeLocations={locations} 
                      onAddStore={() => {}} 
                  />
              </div>

              {/* PANEL 1: PLANNING ROUTE (Muncul kalau Tab Planning Aktif) */}
              {activeTab === "Planning Route" && (
                  <div className="w-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col animate-fade-in">
                      <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                          <h3 className="font-black text-white text-lg flex items-center gap-2"><span>🧠</span> Planning Strategy</h3>
                          <p className="text-xs text-slate-400 mt-1">Pilih kecerdasan algoritma untuk distribusi hari ini.</p>
                      </div>
                      
                      <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                         
                         {/* Card AI Auto */}
                         <div onClick={() => setRoutingMode('AI_AUTO')} className={`cursor-pointer p-4 rounded-xl border transition-all ${routingMode === 'AI_AUTO' ? 'bg-blue-900/40 border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                            <h4 className="font-bold text-blue-400 text-sm mb-1 flex justify-between">
                                <span>✨ AI-Auto Recommend</span>
                                {routingMode === 'AI_AUTO' && <span>✅</span>}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">Sistem memilihkan mode terbaik secara otomatis berdasarkan simulasi efisiensi biaya dan waktu.</p>
                         </div>

                         {/* Card Zoning */}
                         <div onClick={() => setRoutingMode('ZONING')} className={`cursor-pointer p-4 rounded-xl border transition-all ${routingMode === 'ZONING' ? 'bg-green-900/20 border-green-500 shadow-lg shadow-green-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                            <h4 className="font-bold text-green-400 text-sm mb-1 flex justify-between">
                                <span>🟢 Mode Zoning</span>
                                {routingMode === 'ZONING' && <span>✅</span>}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">Fokus pada estetika rute. Mencegah truk bersilangan dengan membagi tugas per wilayah (Barat, Timur).</p>
                         </div>

                         {/* Card Time Balancer */}
                         <div onClick={() => setRoutingMode('TIME_BALANCER')} className={`cursor-pointer p-4 rounded-xl border transition-all ${routingMode === 'TIME_BALANCER' ? 'bg-yellow-900/20 border-yellow-500 shadow-lg shadow-yellow-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                            <h4 className="font-bold text-yellow-400 text-sm mb-1 flex justify-between">
                                <span>🟡 Time Balancer</span>
                                {routingMode === 'TIME_BALANCER' && <span>✅</span>}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">Prioritas kepulangan armada. Membagi beban merata agar semua sopir pulang sebelum jam 18:00.</p>
                         </div>

                         {/* Card Cluster */}
                         <div onClick={() => setRoutingMode('TYPE_CLUSTER')} className={`cursor-pointer p-4 rounded-xl border transition-all ${routingMode === 'TYPE_CLUSTER' ? 'bg-red-900/20 border-red-500 shadow-lg shadow-red-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                            <h4 className="font-bold text-red-400 text-sm mb-1 flex justify-between">
                                <span>🔴 Type Cluster</span>
                                {routingMode === 'TYPE_CLUSTER' && <span>✅</span>}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">Memisahkan truk khusus melayani Mall (bongkar muat lama) dan truk khusus melayani Resto (cepat).</p>
                         </div>

                      </div>
                  </div>
              )}

              {/* PANEL 2: e-POD VERIFICATION (Muncul kalau Tab e-POD Aktif & Ada Hasil) */}
              {(vrpResult && activeTab === "e-POD Verification") && (
                  <div className="w-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col animate-fade-in">
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
                                              <div key={sIdx} className={`p-3 rounded-lg border flex justify-between items-center transition-all ${stop.status==="VERIFIED" ? "bg-green-900/20 border-green-500/30" : "bg-slate-950 border-slate-700"}`}>
                                                  <div>
                                                      <p className={`text-xs font-bold ${stop.status==="VERIFIED" ? "text-green-400" : "text-white"}`}>{stop.name}</p>
                                                      <p className="text-[10px] text-slate-500 mt-1">
                                                          {stop.status==="VERIFIED" ? `✅ Delivered ${stop.pod_time}` : "⏳ Menunggu Driver..."}
                                                      </p>
                                                  </div>
                                                  {stop.status !== "VERIFIED" ? (
                                                      <button onClick={() => handleVerifyDelivery(tIdx, sIdx)} className="px-4 py-2 bg-slate-800 hover:bg-green-600 text-white text-[10px] font-bold rounded-lg border border-slate-600 transition-all">VERIFY</button>
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