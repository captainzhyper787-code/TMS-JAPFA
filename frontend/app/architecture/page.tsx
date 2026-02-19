import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-800 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="w-full max-w-7xl mb-12 flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">ARSITEKTUR FINAL TMS JAPFA</h1>
          <p className="text-slate-500">Full Connected Diagram (Frontend - Backend - Services)</p>
        </div>
        <Link href="/" className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-full font-bold text-sm transition">
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* --- CANVAS DIAGRAM --- */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row items-start justify-center gap-10 relative pt-10">
        
        {/* 1. LAYER USER (KIRI) */}
        <div className="flex flex-col gap-6 w-56 mt-8">
            <div className="bg-white border-2 border-slate-300 p-4 rounded-xl shadow-sm text-center relative z-10">
                <div className="text-3xl mb-1">💻</div>
                <h3 className="font-bold text-slate-700 text-sm">ADMIN</h3>
                <p className="text-[10px] text-slate-500">Web Browser</p>
                {/* Dot Konektor Kanan */}
                <div className="absolute -right-3 top-1/2 w-3 h-3 bg-slate-400 rounded-full translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
            </div>
            <div className="bg-white border-2 border-slate-300 p-4 rounded-xl shadow-sm text-center relative z-10">
                <div className="text-3xl mb-1">📱</div>
                <h3 className="font-bold text-slate-700 text-sm">DRIVER</h3>
                <p className="text-[10px] text-slate-500">Mobile Browser</p>
                {/* Dot Konektor Kanan */}
                <div className="absolute -right-3 top-1/2 w-3 h-3 bg-slate-400 rounded-full translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
            </div>
        </div>

        {/* Panah User -> Next.js */}
        <div className="hidden xl:flex flex-col justify-center items-center px-2 mt-20 relative">
             <div className="absolute top-10 w-8 h-[120px] border-l-2 border-t-2 border-b-2 border-slate-300 rounded-l-xl -left-4"></div>
             <div className="text-slate-300 text-xl z-10">▶</div>
        </div>

        {/* 2. FRONTEND (NEXT.JS) */}
        <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-xl w-64 min-h-[320px] flex flex-col items-center justify-center relative border-4 border-blue-200 z-20">
            <div className="absolute top-0 bg-blue-500 text-white px-4 py-1 rounded-b-lg font-bold text-[10px] shadow-md uppercase">
                Frontend Server
            </div>
            <div className="text-6xl mb-4">⚛️</div>
            <h2 className="font-bold text-xl">NEXT.JS</h2>
            <p className="text-xs text-blue-200 text-center mt-2">UI/UX, Peta Interaktif & Input Data</p>
            
            {/* Konektor Keluar Kanan */}
            <div className="absolute -right-3 top-1/2 w-3 h-3 bg-blue-500 rounded-full -translate-y-1/2 border-2 border-white"></div>
        </div>

        {/* Panah Next.js -> Python */}
        <div className="hidden xl:flex flex-col justify-center items-center px-4 mt-32">
             <div className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">API JSON</div>
             <div className="w-16 h-0.5 bg-slate-300"></div>
             <div className="text-slate-300 text-xl -mt-3">▶</div>
        </div>

        {/* 3. BACKEND (PYTHON) - HUB PUSAT */}
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl w-72 min-h-[320px] flex flex-col items-center justify-center relative border-4 border-green-200 z-20">
            <div className="absolute top-0 bg-green-500 text-white px-4 py-1 rounded-b-lg font-bold text-[10px] shadow-md uppercase">
                Backend Server
            </div>
            <div className="text-6xl mb-4">🐍</div>
            <h2 className="font-bold text-xl">PYTHON</h2>
            <p className="text-[10px] font-mono text-green-400 mt-1">(FastAPI + OR-Tools)</p>
            <p className="text-xs text-slate-400 text-center mt-2">Logic Center: Menghitung Rute, Validasi & Integrasi</p>

            {/* KONEKTOR-KONEKTOR KELUAR */}
            {/* 1. Ke Kanan (Modul) */}
            <div className="absolute -right-3 top-1/3 w-3 h-3 bg-green-500 rounded-full -translate-y-1/2 border-2 border-white"></div>
            {/* 2. Ke Kanan Bawah (Google Maps) */}
            <div className="absolute -right-3 top-2/3 w-3 h-3 bg-purple-500 rounded-full -translate-y-1/2 border-2 border-white"></div>
            {/* 3. Ke Bawah (Database) */}
            <div className="absolute -bottom-3 left-1/2 w-3 h-3 bg-yellow-500 rounded-full -translate-x-1/2 border-2 border-white"></div>
        </div>

        {/* 4. AREA KANAN (OUTPUT & SERVICES) */}
        <div className="flex flex-col justify-between h-[320px] relative w-64">
            
            {/* GRUP MODUL (ATAS) */}
            <div className="relative">
                {/* Garis Konektor dari Python */}
                <div className="absolute -left-14 top-1/2 w-14 h-0.5 bg-green-500 border-t-2 border-dashed border-green-300"></div>
                <div className="absolute -left-16 top-1/2 text-[9px] bg-white px-1 text-green-600 font-bold -translate-y-1/2">Features</div>

                <div className="flex flex-col gap-2">
                    <div className="bg-white border-l-4 border-purple-500 p-2 rounded shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span>🗺️</span> 1. PLAN (Auto-Route)
                    </div>
                    <div className="bg-white border-l-4 border-blue-500 p-2 rounded shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span>📡</span> 2. MONITOR (Live)
                    </div>
                    <div className="bg-white border-l-4 border-orange-500 p-2 rounded shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span>🚚</span> 3. TRACK (GPS)
                    </div>
                    <div className="bg-white border-l-4 border-green-500 p-2 rounded shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span>✅</span> 4. VERIFY (e-POD)
                    </div>
                </div>
            </div>

            {/* GOOGLE MAPS (BAWAH) */}
            <div className="relative mt-8">
                 {/* Garis Konektor dari Python */}
                 <div className="absolute -left-14 top-1/2 w-14 h-0.5 bg-purple-400 border-t-2 border-dashed border-purple-300"></div>
                 <div className="absolute -left-16 top-1/2 text-[9px] bg-white px-1 text-purple-600 font-bold -translate-y-1/2">Ext. API</div>

                <div className="bg-purple-50 border-2 border-purple-200 border-dashed p-4 rounded-xl text-center">
                    <span className="text-3xl">🌍</span>
                    <p className="text-xs font-bold text-purple-900 mt-1">GOOGLE MAPS API</p>
                    <p className="text-[9px] text-purple-600">Routing Data Provider</p>
                </div>
            </div>

        </div>

      </div>

      {/* DATABASE (TERPISAH DI BAWAH TENGAH) */}
      <div className="mt-12 relative">
           {/* Garis Konektor dari Python ke Bawah */}
           <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-yellow-400"></div>
           
           <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-xl shadow-md w-64 text-center z-10 relative">
                <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🗄️</span>
                <div className="text-left">
                    <h3 className="font-bold text-yellow-900 text-sm">DATABASE SERVER</h3>
                    <p className="text-[10px] text-yellow-700">PostgreSQL + PostGIS</p>
                </div>
                </div>
           </div>
      </div>

    </div>
  );
}