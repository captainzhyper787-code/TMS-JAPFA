from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import math

app = FastAPI()

# Izin akses dari Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. DEFINISI 7 WILAYAH (MARKAS KOMANDO) ---
ZONES = [
    {"id": 1, "name": "Bekasi / Cikarang", "lat": -6.241586, "lng": 106.992416, "color": "red"},
    {"id": 2, "name": "Kelapa Gading",     "lat": -6.158102, "lng": 106.908076, "color": "blue"},
    {"id": 3, "name": "Serpong / BSD",     "lat": -6.307399, "lng": 106.673898, "color": "green"},
    {"id": 4, "name": "Kembangan / Jakbar","lat": -6.191632, "lng": 106.738090, "color": "yellow"},
    {"id": 5, "name": "Kota / Grand Mal",  "lat": -6.137498, "lng": 106.829562, "color": "purple"},
    {"id": 6, "name": "Kemang (Truk A)",   "lat": -6.273760, "lng": 106.813083, "color": "orange"},
    {"id": 7, "name": "Bogor / Depok",     "lat": -6.402484, "lng": 106.794240, "color": "brown"},
]

def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

@app.get("/")
def read_root():
    return {"message": "TMS Japfa API is Running!"}

@app.get("/api/simulate-zones")
def simulate_zones():
    shops = []
    for i in range(50):
        lat = -6.15 + (random.random() * -0.30)
        lng = 106.65 + (random.random() * 0.40)
        shops.append({"id": f"Toko-{i+1}", "lat": lat, "lng": lng})

    zone_results = {zone["id"]: {"info": zone, "routes": []} for zone in ZONES}

    for shop in shops:
        closest_zone = None
        min_dist = float('inf')
        for zone in ZONES:
            dist = calculate_distance(shop["lat"], shop["lng"], zone["lat"], zone["lng"])
            if dist < min_dist:
                min_dist = dist
                closest_zone = zone["id"]
        zone_results[closest_zone]["routes"].append(shop)

    final_output = []
    for z_id, data in zone_results.items():
        sorted_routes = sorted(data["routes"], key=lambda x: x["lat"]) 
        final_output.append({
            "zone_name": data["info"]["name"],
            "color": data["info"]["color"],
            "center": [data["info"]["lat"], data["info"]["lng"]],
            "shops": sorted_routes,
            "total_shops": len(sorted_routes)
        })
    return final_output


# =====================================================================
# TAMBAHAN BARU: UNTUK UI COMMAND CENTER (PROTOTYPE VRP)
# =====================================================================

# Endpoint untuk ngecek status (Biar indikator jadi hijau CONNECTED)
@app.get("/api/status")
def get_status():
    return {"status": "OK", "message": "Backend Siap Bos!"}

# Endpoint MOCKUP untuk Simulasi Generate Route (Belum pake OR-Tools beneran)
@app.post("/api/vrp/solve")
def solve_vrp(data: dict):
    locations = data.get("locations", [])
    num_vehicles = data.get("num_vehicles", 7) # Kita pakai 7 Truk

    if not locations:
        return {"status": "ERROR", "message": "Data lokasi kosong"}

    depo_coord = locations[0]
    toko_tujuan = locations[1:] # Pisahkan depo dari toko

    # Bikin kerangka solusi untuk 7 Truk
    solusi = []
    for i in range(num_vehicles):
        solusi.append({
            "truk_id": f"TRUK-CDD-{i+1}",
            "rute": [{"koordinat": depo_coord}] # Semua truk start dari Depo
        })

    # Bagi-bagi toko ke 7 truk (Simulasi pengelompokan sederhana)
    for idx, toko in enumerate(toko_tujuan):
        truk_yang_dapat = idx % num_vehicles # Dibagi rata
        solusi[truk_yang_dapat]["rute"].append({"koordinat": toko})

    # Tambahkan titik depo lagi di akhir (Truk pulang)
    for truk in solusi:
        # Hanya pulangkan truk kalau dia beneran bawa barang
        if len(truk["rute"]) > 1:
            truk["rute"].append({"koordinat": depo_coord})

    return {"status": "OPTIMAL", "solusi": solusi}