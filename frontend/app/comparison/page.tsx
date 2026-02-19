import Link from 'next/link';

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-800 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-10 flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">PEMILIHAN SOFTWARE</h1>
          <p className="text-slate-500">Analisis Perbandingan Fitur & Efisiensi Biaya</p>
        </div>
        <Link href="/" className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-sm transition shadow-sm">
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* TABLE CONTAINER */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          <table className="w-full text-left border-collapse">
            {/* TABLE HEADER */}
            <thead>
                <tr className="bg-slate-900 text-white">
                    <th className="p-6 text-sm font-bold uppercase tracking-wider w-1/3">KRITERIA FITUR</th>
                    <th className="p-6 text-center w-1/5 bg-blue-600 border-b-4 border-blue-400">
                        <div className="text-xs opacity-70 mb-1">OUR SOLUTION</div>
                        TMS JAPFA (Custom)
                    </th>
                    <th className="p-6 text-center w-1/5 border-r border-slate-700">
                        <div className="text-xs opacity-50 mb-1">STANDARD ERP</div>
                        Odoo Fleet
                    </th>
                    <th className="p-6 text-center w-1/5">
                        <div className="text-xs opacity-50 mb-1">VENDOR APPS</div>
                        SaaS Logistik
                    </th>
                </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="text-sm">
                
                {/* Baris 1: Customization */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        Full Customization
                        <p className="text-[10px] text-slate-400 font-normal">Kesesuaian dengan alur unik operasional Japfa</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-blue-700 text-lg">✅ Excellent</td>
                    <td className="p-5 text-center text-slate-500 border-r border-slate-100">⚠️ Limited</td>
                    <td className="p-5 text-center text-red-500">❌ Locked</td>
                </tr>

                {/* Baris 2: 4 Pilar Core */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        4-Pilar Integration (Plan, Monitor, Track, Verify)
                        <p className="text-[10px] text-slate-400 font-normal">Satu dashboard terintegrasi tanpa pindah aplikasi</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-blue-700 text-lg">✅ Native</td>
                    <td className="p-5 text-center text-slate-500 border-r border-slate-100">⚠️ Module Terpisah</td>
                    <td className="p-5 text-center text-slate-500">✅ Available</td>
                </tr>

                {/* Baris 3: Advance Features */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        AI Intelligence (VRP & 3D Load)
                        <p className="text-[10px] text-slate-400 font-normal">Optimasi rute otomatis & simulasi muatan 3D</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-blue-700 text-lg">✅ Advanced</td>
                    <td className="p-5 text-center text-red-500 border-r border-slate-100">❌ Manual Input</td>
                    <td className="p-5 text-center text-slate-500">⚠️ Basic Feature</td>
                </tr>

                {/* Baris 4: User Experience */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        Driver Mobile Experience
                        <p className="text-[10px] text-slate-400 font-normal">Kemudahan penggunaan via HP (Tanpa Install)</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-blue-700 text-lg">✅ Web App (PWA)</td>
                    <td className="p-5 text-center text-slate-500 border-r border-slate-100">⚠️ Complex UI</td>
                    <td className="p-5 text-center text-slate-500">✅ Native App</td>
                </tr>

                {/* Baris 5: Biaya */}
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        Cost Efficiency (Biaya Jangka Panjang)
                        <p className="text-[10px] text-slate-400 font-normal">Biaya lisensi per user atau langganan bulanan</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-green-600 text-lg">💰 Low (CAPEX)</td>
                    <td className="p-5 text-center text-red-500 border-r border-slate-100">💸 High (License/User)</td>
                    <td className="p-5 text-center text-red-500">💸 High (Subscription)</td>
                </tr>

                {/* Baris 6: Data Ownership */}
                <tr className="hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-700">
                        Data Ownership & Security
                        <p className="text-[10px] text-slate-400 font-normal">Kepemilikan penuh database & server</p>
                    </td>
                    <td className="p-5 text-center bg-blue-50 font-bold text-blue-700 text-lg">✅ 100% Owned</td>
                    <td className="p-5 text-center text-slate-500 border-r border-slate-100">✅ Owned (On-Premise)</td>
                    <td className="p-5 text-center text-red-500">❌ Vendor Owned</td>
                </tr>

            </tbody>
          </table>
      </div>

      {/* KESIMPULAN */}
      <div className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">🏆 Why TMS JAPFA?</h3>
              <p className="text-sm text-slate-600">
                  Solusi paling seimbang antara **Fitur Canggih (AI)** dan **Biaya Operasional**. Dibangun spesifik untuk kebutuhan 4-Pilar Japfa tanpa fitur sampah yang tidak perlu.
              </p>
          </div>
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-500 mb-2">Odoo Fleet?</h3>
              <p className="text-sm text-slate-500">
                  Bagus untuk data aset kendaraan, tapi **lemah di optimasi rute (VRP)** dan visualisasi lapangan. Terlalu kaku untuk operasional dinamis.
              </p>
          </div>
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-500 mb-2">SaaS Logistik?</h3>
              <p className="text-sm text-slate-500">
                  Cepat dipakai, tapi **biaya langganan mahal** selamanya. Data strategis distribusi kita dipegang oleh pihak ketiga (Vendor).
              </p>
          </div>
      </div>

    </div>
  );
}