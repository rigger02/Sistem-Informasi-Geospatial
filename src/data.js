export const initialSensors = [
  // sumatera
  { id: 'aceh', name: 'Banda Aceh', area: 'Aceh', x: 7.0, y: 18.5, online: false, base: { mmi: 2.1, water: 0.35, vei: 0.2 } },
  { id: 'sumut', name: 'Medan', area: 'Sumatera Utara', x: 14.8, y: 30, online: true, base: { mmi: 2.8, water: 0.24, vei: 0.4 } },
  { id: 'sumbar', name: 'Padang', area: 'Sumatera Barat', x: 15.6, y: 40.5, online: true, base: { mmi: 3.4, water: 0.42, vei: 0.7 } },
  { id: 'riau', name: 'Pekanbaru', area: 'Riau', x: 20.5, y: 33.5, online: true, base: { mmi: 2.3, water: 0.21, vei: 0.2 } },
  { id: 'kepri', name: 'Tanjung Pinang', area: 'Kepulauan Riau', x: 27.4, y: 37.2, online: true, base: { mmi: 1.7, water: 0.31, vei: 0.1 } },
  { id: 'jambi', name: 'Jambi', area: 'Jambi', x: 22.2, y: 40, online: true, base: { mmi: 2.0, water: 0.22, vei: 0.2 } },
  { id: 'sumsel', name: 'Palembang', area: 'Sumatera Selatan', x: 21.2, y: 54.5, online: true, base: { mmi: 2.2, water: 0.18, vei: 0.2 } },
  { id: 'babel', name: 'Pangkalpinang', area: 'Kepulauan Bangka Belitung', x: 28.4, y: 51.2, online: true, base: { mmi: 1.9, water: 0.26, vei: 0.1 } },
  { id: 'bengkulu', name: 'Bengkulu', area: 'Bengkulu', x: 17.8, y: 49.5, online: true, base: { mmi: 2.1, water: 0.28, vei: 0.2 } },
  { id: 'lampung', name: 'Bandar Lampung', area: 'Lampung', x: 23.7, y: 59, online: true, base: { mmi: 2.4, water: 0.23, vei: 0.1 } },
  
  // Jawa
  { id: 'banten', name: 'Serang', area: 'Banten', x: 24.6, y: 64.8, online: true, base: { mmi: 2.2, water: 0.31, vei: 0.1 } },
  { id: 'jakarta', name: 'Jakarta Pusat', area: 'DKI Jakarta', x: 28.4, y: 64.4, online: false, base: { mmi: 1.8, water: 0.28, vei: 0.1 } },
  { id: 'jabar', name: 'Bandung', area: 'Jawa Barat', x: 33.7, y: 63.4, online: true, base: { mmi: 2.4, water: 0.11, vei: 0.9 } },
  { id: 'jateng', name: 'Semarang', area: 'Jawa Tengah', x: 36.8, y: 63.4, online: true, base: { mmi: 2.0, water: 0.2, vei: 1.0 } },
  { id: 'diy', name: 'Yogyakarta', area: 'DI Yogyakarta', x: 36.8, y: 72.4, online: true, base: { mmi: 2.1, water: 0.17, vei: 0.8 } },
  { id: 'jatim', name: 'Surabaya', area: 'Jawa Timur', x: 40.6, y: 70.2, online: true, base: { mmi: 2.1, water: 0.17, vei: 1.1 } },
  
  // Bali dan Nusa Tenggara
  { id: 'bali', name: 'Denpasar', area: 'Bali', x: 45.3, y: 70.4, online: true, base: { mmi: 2.3, water: 0.22, vei: 1.0 } },
  { id: 'ntb', name: 'Mataram', area: 'Nusa Tenggara Barat', x: 49.5, y: 70.4, online: true, base: { mmi: 2.0, water: 0.2, vei: 0.8 } },
  { id: 'ntt', name: 'Kupang', area: 'Nusa Tenggara Timur', x: 54.1, y: 70.7, online: true, base: { mmi: 2.1, water: 0.21, vei: 0.7 } },
  
  // Kalimantan
  { id: 'kalbar', name: 'Pontianak', area: 'Kalimantan Barat', x: 35.5, y: 37.8, online: true, base: { mmi: 1.6, water: 0.15, vei: 0.1 } },
  { id: 'kalteng', name: 'Palangkaraya', area: 'Kalimantan Tengah', x: 38.8, y: 46.5, online: true, base: { mmi: 1.7, water: 0.16, vei: 0.1 } },
  { id: 'kalsel', name: 'Banjarmasin', area: 'Kalimantan Selatan', x: 45.8, y: 47.2, online: true, base: { mmi: 1.7, water: 0.21, vei: 0.2 } },
  { id: 'kaltim', name: 'Samarinda', area: 'Kalimantan Timur', x: 46.4, y: 38.3, online: true, base: { mmi: 1.9, water: 0.19, vei: 0.2 } },
  { id: 'kaltara', name: 'Tarakan', area: 'Kalimantan Utara', x: 45.9, y: 22.6, online: true, base: { mmi: 1.8, water: 0.18, vei: 0.2 } },
  
  // Sulawesi
  { id: 'sulut', name: 'Manado', area: 'Sulawesi Utara', x: 63.2, y: 35.8, online: true, base: { mmi: 2.8, water: 0.24, vei: 1.2 } },
  { id: 'gorontalo', name: 'Gorontalo', area: 'Gorontalo', x: 55.2, y: 35.8, online: true, base: { mmi: 2.4, water: 0.21, vei: 0.8 } },
  { id: 'sulteng', name: 'Palu', area: 'Sulawesi Tengah', x: 58.1, y: 44.8, online: true, base: { mmi: 3.2, water: 0.2, vei: 0.9 } },
  { id: 'sulbar', name: 'Mamuju', area: 'Sulawesi Barat', x: 50.8, y: 50.0, online: true, base: { mmi: 2.5, water: 0.19, vei: 0.6 } },
  { id: 'sulsel', name: 'Makassar', area: 'Sulawesi Selatan', x: 51.2, y: 60.2, online: true, base: { mmi: 2.2, water: 0.18, vei: 0.5 } },
  { id: 'sultra', name: 'Kendari', area: 'Sulawesi Tenggara', x: 58.1, y: 60.2, online: true, base: { mmi: 2.3, water: 0.19, vei: 0.5 } },
  
  // Maluku
  { id: 'malut', name: 'Ternate', area: 'Maluku Utara', x: 69.2, y: 35.8, online: true, base: { mmi: 2.5, water: 0.22, vei: 0.6 } },
  { id: 'maluku', name: 'Ambon', area: 'Maluku', x: 70.2, y: 51.8, online: true, base: { mmi: 2.7, water: 0.26, vei: 0.8 } },
  
  // Papua
  { id: 'papbar', name: 'Manokwari', area: 'Papua Barat', x: 81.0, y: 50.0, online: true, base: { mmi: 2.1, water: 0.24, vei: 0.3 } },
  { id: 'pabd', name: 'Sorong', area: 'Papua Barat Daya', x: 75.7, y: 42.0, online: true, base: { mmi: 2.2, water: 0.25, vei: 0.3 } },
  { id: 'pateng', name: 'Nabire', area: 'Papua Tengah', x: 86.4, y: 56.0, online: true, base: { mmi: 2.5, water: 0.29, vei: 0.4 } },
  { id: 'papeg', name: 'Wamena', area: 'Papua Pegunungan', x: 93.2, y: 57.0, online: true, base: { mmi: 2.4, water: 0.20, vei: 0.3 } },
  { id: 'pasel', name: 'Merauke', area: 'Papua Selatan', x: 93.3, y: 70.2, online: true, base: { mmi: 2.1, water: 0.35, vei: 0.2 } },
  { id: 'papua', name: 'Jayapura', area: 'Papua', x: 89.0, y: 48.0, online: true, base: { mmi: 2.4, water: 0.31, vei: 0.3 } },
];


export const demoUsers = [
  { id: 'usr-re', username: 'RE', name: 'RIGGER DAMAIARTA TEJAYANDA', role: 'risk', roleLabel: 'Risk Engineering', department: 'Unit Risk Engineering', email: 'risk.engineering@jasindo.id', active: true, mfa: true },
  { id: 'usr-uw', username: 'UW', name: 'ISMI IZZATI', role: 'underwriter', roleLabel: 'Underwriter', department: 'Underwriting Property', email: 'underwriter@jasindo.id', active: true, mfa: true },
  { id: 'usr-claim', username: 'CO', name: 'MUHAMMAD ARIEF SYAHNAKRI ABUBAKAR', role: 'claim', roleLabel: 'Claim Officer', department: 'Divisi Klaim', email: 'claim.officer@jasindo.id', active: true, mfa: true },
  { id: 'usr-surveyor', username: 'SV', name: 'UWAIS ALQARANI RACHMAWAN', role: 'surveyor', roleLabel: 'Surveyor Eksternal', department: 'Mitra Surveyor', email: 'surveyor@mitra.id', active: true, mfa: true },
  { id: 'usr-adjuster', username: 'ADJ', name: 'FAHRIZA NAUFAL ANANDA', role: 'adjuster', roleLabel: 'Adjuster Eksternal', department: 'Mitra Adjuster', email: 'adjuster@mitra.id', active: true, mfa: true },
  { id: 'usr-insured', username: 'TC', name: 'ANINDYA DIWASASRI', role: 'insured', roleLabel: 'Tertanggung / Client Jasindo', department: 'PT Energi Nusantara', email: 'tertanggung@energi.id', active: true, mfa: true, insuredId: 'ins-001' },
  { id: 'usr-admin', username: 'SA', name: 'RIGGER DAMAIARTA TEJAYANDA', role: 'admin', roleLabel: 'System Administrator', department: 'IT & Digital', email: 'admin@jasindo.id', active: true, mfa: true },
];

export const roleNames = {
  risk: 'Risk Engineering', underwriter: 'Underwriter', claim: 'Claim Officer',
  surveyor: 'Surveyor Eksternal', adjuster: 'Adjuster Eksternal',
  insured: 'Tertanggung / Client Jasindo', admin: 'System Administrator',
};

export const packageGroups = [
  { id: 'geo', label: 'Data & Pemetaan Geospasial', cases: [
    { id: 'UC-01', label: 'Data Objek & Lokasi', name: 'Mengelola Data Objek & Lokasi Pertanggungan', short: 'Objek & Lokasi', description: 'Kelola data objek pertanggungan, polis multi-lokasi, koordinat, geocoding, dan dataset geospasial.' },
    { id: 'UC-02', label: 'Peta Risiko', name: 'Melakukan Visualisasi & Memetakan Risiko Geospasial', short: 'Peta Risiko', description: 'Jelajahi objek pada peta, atur layer bahaya, lihat exposure per wilayah, dan ekspor peta untuk survey report.' },
  ]},
  { id: 'risk', label: 'Analisis & Monitoring Risiko', cases: [
    { id: 'UC-03', label: 'Analisis & Risk Scoring', name: 'Melakukan Analisis Risiko & Risk Scoring', short: 'Risk Scoring', description: 'Analisis bahaya, hitung skor per jenis bencana dan skor gabungan, tinjau exposure, serta jalankan simulasi skenario.' },
    { id: 'UC-04', label: 'Monitoring & Early Warning', name: 'Melakukan Monitoring Risiko & Early Warning', short: 'Early Warning', description: 'Pantau kondisi aset dan sensor, evaluasi threshold, kelola alert, acknowledgement, tindak lanjut, dan eskalasi.' },
    { id: 'UC-05', label: 'Dashboard Geospasial & Portofolio', name: 'Menyediakan Dashboard Portofolio & Mendukung Pengambilan Keputusan', short: 'Dashboard Geospasial & Portofolio', description: 'Pantau peta geospasial, simulasi dan sinkronisasi data sensor, lalu tinjau exposure portofolio, perbandingan risiko, rekomendasi akseptasi, moratorium, serta prioritas penanganan.' },
    { id: 'UC-06', label: 'Perangkat Sensor IoT', name: 'Mengelola Perangkat Sensor IoT', short: 'Perangkat IoT', description: 'Registrasi dan konfigurasi sensor, kaitkan dengan objek, kelola threshold, uji koneksi, serta pantau data dan status perangkat.' },
  ]},
  { id: 'claim', label: 'Penilaian Dampak & Klaim', cases: [
    { id: 'UC-07', label: 'Dampak & Estimasi Klaim', name: 'Melakukan Identifikasi Aset Terdampak & Menghitung Estimasi Kerugian', short: 'Dampak & Klaim', description: 'Identifikasi aset terdampak, tampilkan potensi klaim, hitung rentang kerugian, dan dukung assessment serta adjustment.' },
  ]},
  { id: 'survey', label: 'Survei & Mitigasi Risiko', cases: [
    { id: 'UC-08', label: 'Survei & Penugasan', name: 'Mengelola Survei & Penugasan Surveyor', short: 'Survei', description: 'Buat permintaan survei, rekomendasikan surveyor, kelola penugasan terbatas, evidence, review, dan finalisasi.' },
    { id: 'UC-09', label: 'Rekomendasi & Rapor Aset', name: 'Mengelola Rekomendasi & Rapor Aset', short: 'Mitigasi & Rapor', description: 'Tetapkan rekomendasi dari library standar, terima tindak lanjut tertanggung, verifikasi bukti, dan perbarui rapor aset.' },
    { id: 'UC-10', label: 'Verifikasi Survei', name: 'Melakukan Verifikasi Hasil Survei & Kinerja Surveyor', short: 'Verifikasi Survei', description: 'Bandingkan temuan surveyor dengan data spasial, risk score, dan histori sensor; catat verifikasi serta kinerja.' },
    { id: 'UC-11', label: 'Self-Survey', name: 'Melakukan Self-Survey', short: 'Self-Survey', description: 'Tertanggung mengisi survei mandiri terpandu untuk objek berisiko rendah, melengkapi foto, lalu menunggu review.' },
  ]},
  { id: 'admin', label: 'Administrasi & Integrasi', cases: [
    { id: 'UC-12', label: 'Pengguna & Keamanan', name: 'Mengelola Daftar Pengguna, Konfigurasi & Keamanan Sistem', short: 'Administrasi', description: 'Kelola akun, role, cakupan akses, master data, parameter, notifikasi, dan audit trail.' },
    { id: 'UC-13', label: 'Integrasi Data Eksternal', name: 'Mengintegrasikan Data Eksternal', short: 'Integrasi', description: 'Sinkronkan polis, underwriting, dan klaim dengan sistem inti; pantau sumber BMKG, PVMBG, BNPB, dan IoT.' },
  ]},
];

export const accessByRole = {
  risk: ['UC-01','UC-02','UC-03','UC-04','UC-05','UC-07','UC-08','UC-09','UC-10','UC-11'],
  underwriter: ['UC-02','UC-03','UC-05'],
  claim: ['UC-02','UC-07','UC-08'],
  surveyor: ['UC-08'],
  adjuster: ['UC-07','UC-08'],
  insured: ['UC-04','UC-09','UC-11'],
  admin: ['UC-06','UC-12','UC-13'],
};

export const initialAssets = [
  { id:'AST-009', name:'Hotel Banda Aceh', policyNo:'POL-2026-081', insured:'PT Wisata Aceh', insuredId:'ins-001', productLine:'Property', province:'Aceh', city:'Banda Aceh', address:'Kuta Alam, Banda Aceh', sumInsured:135000000000, riskScore:62, hazardBase:75, claimHistory:20, locationVerified:true, status:'Aktif', sensorId:'aceh', lastAssessment:'2026-10-01', notes:'Objek pesisir.' },
  { id:'AST-002', name:'Gudang Logistik Medan', policyNo:'POL-2026-014', insured:'PT Energi Nusantara', insuredId:'ins-002', productLine:'Property', province:'Sumatera Utara', city:'Medan', address:'Kawasan Industri Medan, Deli Serdang', sumInsured:185000000000, riskScore:38, hazardBase:48, claimHistory:18, locationVerified:true, status:'Aktif', sensorId:'sumut', lastAssessment:'2026-09-30', notes:'Gudang logistik dengan pemantauan ketinggian air.' },
  { id:'AST-003', name:'Pabrik Semen Padang', policyNo:'POL-2026-021', insured:'PT Semen Andalas', insuredId:'ins-003', productLine:'Engineering', province:'Sumatera Barat', city:'Padang', address:'Indarung, Lubuk Kilangan, Padang', sumInsured:315000000000, riskScore:73, hazardBase:81, claimHistory:36, locationVerified:true, status:'Aktif', sensorId:'sumbar', lastAssessment:'2026-10-10', notes:'Fasilitas industri di wilayah dengan aktivitas seismik.' },
  { id:'AST-001', name:'Fasilitas Energi Jayapura',policyNo: 'POL-2026-001',insured: 'PT Energi Nusantara',insuredId: 'ins-001',productLine: 'Engineering',province: 'Papua',city: 'Jayapura',address: 'Kawasan fasilitas energi, Kota Jayapura, Papua',sumInsured: 420000000000,riskScore: 68,hazardBase: 76,claimHistory: 42,locationVerified: true,status: 'Aktif',sensorId: 'papua',lastAssessment: '2026-10-18',notes: 'Objek sensor IoT Papua.'},
  { id:'AST-006', name:'Pusat Distribusi Bekasi', policyNo:'POL-2026-052', insured:'PT Niaga Sentosa', insuredId:'ins-004', productLine:'Property', province:'Jawa Barat', city:'Bekasi', address:'Cikarang, Kabupaten Bekasi, Jawa Barat', sumInsured:210000000000, riskScore:56, hazardBase:61, claimHistory:24, locationVerified:true, status:'Aktif', sensorId:'jabar', lastAssessment:'2026-10-04', notes:'Pusat distribusi.' },
];

export const initialThresholds = { water: 1.5, vibration: 5.5, temperature: 65, mmi: 6.0, telemetryTimeoutMinutes: 15, exposureLimit: 600000000000 };

export const recommendationLibrary = [
  { id:'REC-ST-01', title:'Peninggian dan proteksi area kritis', category:'Banjir', description:'Tinggikan peralatan kritis dan pastikan jalur drainase berfungsi.' },
  { id:'REC-ST-02', title:'Pemeriksaan struktur dan penguatan', category:'Gempa', description:'Lakukan pemeriksaan struktur dan tindak lanjut penguatan sesuai hasil assessment.' },
  { id:'REC-ST-03', title:'Peningkatan sistem deteksi dan pemadaman', category:'Kebakaran', description:'Periksa detektor, alarm, hydrant, dan kesiapan sistem pemadaman.' },
  { id:'REC-ST-04', title:'Prosedur tanggap darurat multi-hazard', category:'Kesiapsiagaan', description:'Perbarui prosedur evakuasi, titik kumpul, dan jalur komunikasi darurat.' },
];

export const initialIntegrations = [
  { id:'core', name:'Sistem Inti Asuransi Jasindo', type:'Internal', scope:'Polis, objek, underwriting, klaim, pengiriman risk score', status:'Terhubung', schedule:'Setiap 15 menit', lastSync:'2026-10-31 17:40', retryCount:0, mode:'Dua arah' },
  { id:'bmkg', name:'BMKG', type:'Eksternal', scope:'Gempa, cuaca, peringatan dini', status:'Terhubung', schedule:'Setiap 5 menit', lastSync:'2026-10-31 17:35', retryCount:0, mode:'Masuk' },
  { id:'pvmbg', name:'PVMBG', type:'Eksternal', scope:'Aktivitas gunung api dan status vulkanik', status:'Terhubung', schedule:'Setiap 1 jam', lastSync:'2026-10-31 17:32', retryCount:0, mode:'Masuk' },
  { id:'bnpb', name:'BNPB', type:'Eksternal', scope:'Kejadian bencana dan jejak wilayah terdampak', status:'Perlu Pemeriksaan', schedule:'Setiap 15 menit', lastSync:'2026-10-31 16:50', retryCount:1, mode:'Masuk' },
  { id:'iot-gateway', name:'IoT / Sensor System', type:'Eksternal', scope:'Telemetry, status sensor, dan gateway IoT', status:'Terhubung', schedule:'Real-time (simulasi)', lastSync:'2026-10-31 17:42', retryCount:0, mode:'Masuk' },
];

export const initialEvents = [];

export const initialClaims = [];

export const initialAssignments = [
  { id:'SUR-2026-012', kind:'survey', assetId:'AST-006', assignedTo:'usr-surveyor', createdBy:'usr-re', dueDate:'2026-12-31', status:'Ditugaskan', findings:'', condition:'', evidence:[], submittedAt:null, reviewNote:'', verification:'Menunggu', createdAt:'2026-10-30' },
  { id:'SUR-2026-013', kind:'survey', assetId:'AST-001', assignedTo:'usr-surveyor', createdBy:'usr-re', dueDate:'2026-12-31', status:'Ditugaskan', findings:'', condition:'', evidence:[], submittedAt:null, reviewNote:'', verification:'Menunggu', createdAt:'2026-10-30' },
  { id:'SUR-2026-014', kind:'survey', assetId:'AST-002', assignedTo:'usr-surveyor', createdBy:'usr-re', dueDate:'2026-12-31', status:'Ditugaskan', findings:'', condition:'', evidence:[], submittedAt:null, reviewNote:'', verification:'Menunggu', createdAt:'2026-10-30' },
];

export const initialRecommendations = [
  
];

export const initialSelfSurveys = [];

export const initialAudit = [
  { id:'AUD-001', actor:'System', action:'Inisialisasi prototype', detail:'Data demo awal dimuat ke sesi browser.', at:'2026-10-31 17:00' },
];
