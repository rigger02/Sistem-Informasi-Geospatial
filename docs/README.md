# JASINDO — Sistem Informasi Geospasial

Prototype aplikasi web untuk mendemonstrasikan proses pengelolaan objek pertanggungan, pemetaan risiko geospasial, analisis dan monitoring risiko, early warning, identifikasi dampak bencana, klaim, survei, mitigasi, administrasi, dan integrasi data.


## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Persyaratan Sistem](#4-persyaratan-sistem)
5. [Cara Menjalankan Aplikasi](#5-cara-menjalankan-aplikasi)
6. [Aktor dan Akun Demo](#6-aktor-dan-akun-demo)
7. [Matriks Hak Akses](#7-matriks-hak-akses)
8. [Package dan Ringkasan Use Case](#8-package-dan-ringkasan-use-case)
9. [Perbandingan 13 Use Case: Laporan Word dan Web Prototype](#9-perbandingan-13-use-case-laporan-word-dan-web-prototype)
10. [Alur Proses Antar-Use Case](#10-alur-proses-antar-use-case)
11. [Data Demo pada ZIP Terbaru](#11-data-demo-pada-zip-terbaru)
12. [Penyimpanan Data, Migrasi, dan Reset](#12-penyimpanan-data-migrasi-dan-reset)
13. [Perbedaan Laporan Word dan Web Prototype](#13-perbedaan-laporan-word-dan-web-prototype)
14. [Batasan Implementasi Prototype](#14-batasan-implementasi-prototype)
15. [Catatan Implementasi dan Aturan Bisnis Penting](#15-catatan-implementasi-dan-aturan-bisnis-penting)
16. [Saran Pengembangan Lanjutan](#16-saran-pengembangan-lanjutan)
17. [Informasi Versi](#17-informasi-versi)

---

## 1. Gambaran Umum

JASINDO Sistem Informasi Geospasial merupakan prototype yang menggambarkan dukungan sistem informasi terhadap proses bisnis pengelolaan risiko dan objek pertanggungan. Aplikasi menghubungkan beberapa proses yang saling berkaitan, mulai dari pendataan objek dan lokasi, visualisasi geospasial, risk scoring, monitoring sensor, pembentukan alert, identifikasi aset terdampak, penilaian klaim, penugasan survei, mitigasi, sampai pengelolaan pengguna dan integrasi sumber data.

Aplikasi dibagi menjadi **5 package dan 13 use case (UC-01 sampai UC-13)**.

| Package | Fokus | Use Case |
|---|---|---|
| Package 1 — Data & Pemetaan Geospasial | Pendataan objek pertanggungan, lokasi, dan visualisasi geospasial | UC-01, UC-02 |
| Package 2 — Analisis & Monitoring Risiko | Risk scoring, early warning, dashboard portofolio, dan perangkat sensor IoT | UC-03, UC-04, UC-05, UC-06 |
| Package 3 — Penilaian Dampak & Klaim | Identifikasi aset terdampak, estimasi kerugian, assessment, dan adjustment | UC-07 |
| Package 4 — Survei & Mitigasi Risiko | Penugasan surveyor, rekomendasi mitigasi, verifikasi hasil, dan self-survey | UC-08, UC-09, UC-10, UC-11 |
| Package 5 — Administrasi & Integrasi | Pengelolaan pengguna, konfigurasi, audit, dan sumber data eksternal | UC-12, UC-13 |

### Diagram proses

Diagram proses yang disertakan di dalam ZIP:

![Jasindo Geospatial Risk Process Flow](./Jasindo%20Geospatial%20Risk%20Process%20Flow.png)

Diagram merupakan artefak pendukung untuk membantu memahami keterkaitan proses. Detail implementasi setiap use case tetap mengacu pada source code dan penjelasan perbandingan pada README ini.

---

## 2. Teknologi yang Digunakan

| Komponen | Teknologi / Keterangan |
|---|---|
| Framework antarmuka | React `18.3.1` |
| DOM renderer | React DOM `18.3.1` |
| Build tool dan development server | Vite `5.4.15` |
| Bahasa pemrograman | JavaScript dengan JSX |
| Ikon | Lucide React `0.468.0` |
| Styling | CSS |
| Penyimpanan data prototype | Browser `localStorage` |
| Visualisasi peta | Gambar peta Indonesia dan komponen dashboard berbasis React |
| Backend | Belum tersedia pada versi ini |
| Database server | Belum tersedia; data aplikasi disimpan di browser |
| API eksternal | Belum dihubungkan ke endpoint produksi |

Prototype merupakan **single-page application (SPA)**. Navigasi antarmodul dilakukan melalui komponen React tanpa berpindah ke halaman server yang berbeda.

---

## 3. Struktur Proyek

Struktur utama folder setelah ZIP diekstrak:

```text
jasindo-iot-geospatial-prototype-v5/
├── index.html
├── package.json
├── package-lock.json
├── Jasindo Geospatial Risk Process Flow.png
├── node_modules/                 # Dependency yang ikut di dalam ZIP
└── src/
    ├── App.jsx
    ├── LegacyDashboard.jsx
    ├── main.jsx
    ├── data.js
    ├── styles.css
    ├── jasindo-theme.css
    ├── legacy-dashboard.css
    └── assets/
        └── indonesia-map.jpg
```

### Fungsi file utama

| File | Fungsi |
|---|---|
| `index.html` | Dokumen HTML utama yang menyediakan elemen root untuk aplikasi React. |
| `src/main.jsx` | Entry point React; memasang komponen `App` ke elemen `root`. |
| `src/App.jsx` | Komponen inti aplikasi, halaman UC-01–UC-13, login demo, navigasi, pengaturan role, state, validasi, dan fungsi proses bisnis. |
| `src/data.js` | Data awal (seed data), aktor demo, role, hak akses, daftar package/use case, objek, sensor, penugasan, rekomendasi, dan sumber integrasi. |
| `src/LegacyDashboard.jsx` | Komponen dashboard dan visualisasi geospasial yang digunakan oleh halaman peta/dashboard. |
| `src/styles.css` | Styling dasar dan layout aplikasi. |
| `src/jasindo-theme.css` | Tema visual aplikasi JASINDO. |
| `src/legacy-dashboard.css` | Styling untuk komponen dashboard/peta. |
| `src/assets/indonesia-map.jpg` | Gambar peta Indonesia yang digunakan sebagai peta dasar ilustratif. |
| `package.json` | Identitas package, versi aplikasi, dependency, dan script npm. |
| `package-lock.json` | Penguncian versi dependency agar instalasi dapat direproduksi. |

`node_modules` disertakan di ZIP, tetapi instalasi dependency ulang tetap disarankan pada komputer yang akan menjalankan aplikasi. Folder tersebut bukan tempat untuk mengedit source code.

---

## 4. Persyaratan Sistem

Sebelum menjalankan aplikasi, siapkan:

- Node.js versi 18 atau lebih baru.
- npm (sudah termasuk dalam instalasi Node.js).
- Browser modern, misalnya Google Chrome atau Microsoft Edge.
- Visual Studio Code atau editor kode lain (opsional, tetapi disarankan).

Prototype tidak memerlukan konfigurasi database, file `.env`, API key, atau server backend untuk dijalankan dalam mode demonstrasi.

---

## 5. Cara Menjalankan Aplikasi

### 5.1 Ekstrak ZIP

1. Ekstrak `jasindo-iot-geospatial-prototype-v5(5).zip`.
2. Buka folder `jasindo-iot-geospatial-prototype-v5` menggunakan Visual Studio Code atau terminal.
3. Pastikan terminal berada di folder yang berisi `package.json`.

### 5.2 Instal dependency

Jalankan:

```bash
npm ci
```

`npm ci` memasang dependency berdasarkan `package-lock.json`. Cara ini disarankan agar instalasi mengikuti versi dependency yang dikunci pada proyek.

Apabila instalasi dengan `npm ci` mengalami masalah pada lock file atau cache dependency, jalankan:

```bash
npm install
```

### 5.3 Jalankan development server

```bash
npm run dev
```

Vite akan menampilkan alamat server pada terminal. Secara default, aplikasi dapat dibuka melalui:

```text
http://localhost:5173
```

Biarkan terminal tetap berjalan selama aplikasi digunakan. Jika port `5173` sedang digunakan, Vite dapat memilih port lain; gunakan alamat yang ditampilkan pada terminal.

### 5.4 Build aplikasi

Untuk membuat hasil build:

```bash
npm run build
```

Hasil build akan dibuat pada folder `dist/`.

Untuk memeriksa hasil build secara lokal:

```bash
npm run preview
```

Perintah `preview` hanya menampilkan hasil build lokal. Perintah ini tidak menyediakan backend atau menjadikan prototype sebagai sistem produksi.

### 5.5 Ringkasan perintah

| Perintah | Fungsi |
|---|---|
| `npm ci` | Instal dependency mengikuti `package-lock.json`. |
| `npm install` | Instal dependency dan memperbarui lock file bila diperlukan. |
| `npm run dev` | Menjalankan development server Vite. |
| `npm run build` | Membuat hasil build ke folder `dist/`. |
| `npm run preview` | Menjalankan preview hasil build secara lokal. |

### 5.6 Alur akses singkat

1. Jalankan aplikasi melalui `npm run dev`.
2. Buka alamat lokal yang ditampilkan Vite.
3. Masukkan kode aktor pada kolom Username.
4. Isi kolom Password dengan karakter apa pun yang tidak kosong untuk kebutuhan login demo.
5. Setelah login, menu yang terlihat disesuaikan dengan role aktor.
6. Gunakan menu pergantian akun demo untuk berpindah role saat demonstrasi proses lintas aktor.

---

## 6. Aktor dan Akun Demo

Aplikasi menyediakan tujuh akun demo yang didefinisikan pada `src/data.js`. Gunakan kode login berikut pada kolom **Username**.

| Kode Login | Nama pada Data Demo | Aktor | Role Sistem |
|---|---|---|---|
| `RE` | RIGGER DAMAIARTA TEJAYANDA | Risk Engineering | `risk` |
| `UW` | ISMI IZZATI | Underwriter | `underwriter` |
| `CO` | MUHAMMAD ARIEF SYAHNAKRI ABUBAKAR | Claim Officer | `claim` |
| `SV` | UWAIS ALQARANI RACHMAWAN | Surveyor Eksternal | `surveyor` |
| `ADJ` | FAHRIZA NAUFAL ANANDA | Adjuster Eksternal | `adjuster` |
| `TC` | ANINDYA DIWASASRI | Tertanggung / Client Jasindo | `insured` |
| `SA` | RIGGER DAMAIARTA TEJAYANDA | System Administrator | `admin` |

### Ketentuan login demo

- Username dicocokkan dengan kode aktor yang tersimpan dan status akun harus aktif.
- Kolom password wajib diisi, tetapi pada source code saat ini password **hanya diperiksa agar tidak kosong**. Password tidak diverifikasi terhadap password tersimpan maupun layanan autentikasi.
- Login ini merupakan simulasi perpindahan aktor, bukan autentikasi yang aman untuk produksi.
- Akun dapat dinonaktifkan atau diubah role-nya melalui UC-12.
- Pengguna yang sudah login dapat berpindah ke akun demo lain melalui menu akun di bagian bawah sidebar.

### Aktor manusia dan perannya

**1. Risk Engineering (RE)** bertanggung jawab atas data objek/lokasi, pemantauan dan analisis risiko, prioritas assessment, penugasan surveyor, rekomendasi mitigasi, verifikasi hasil survei, dan review self-survey.

**2. Underwriter (UW)** menggunakan informasi risiko dan exposure untuk membandingkan objek serta mencatat keputusan underwriting.

**3. Claim Officer (CO)** mengidentifikasi objek terdampak, mengelola potensi klaim, menyimpan assessment, dan menugaskan adjuster.

**4. Surveyor Eksternal (SV)** menerima tugas survei yang diberikan kepadanya, memulai pekerjaan, mencatat kondisi/temuan, serta mengirim hasil dan metadata evidence.

**5. Adjuster Eksternal (ADJ)** menerima penugasan adjustment yang terkait dengan klaim dan menyampaikan nilai serta catatan hasil adjustment.

**6. Tertanggung / Client Jasindo (TC)** melihat informasi terkait objek miliknya, menindaklanjuti rekomendasi mitigasi, dan mengisi self-survey apabila terdapat undangan yang memenuhi syarat.

**7. System Administrator (SA)** mengelola perangkat sensor, akun, konfigurasi, parameter, dan simulasi integrasi.

### Aktor sistem eksternal

Selain aktor manusia, antarmuka UC-13 menampilkan sumber data/sistem berikut sebagai konteks integrasi:

- **Sistem Inti Asuransi Jasindo:** konteks data polis, objek, underwriting, klaim, dan pengiriman risk score.
- **BMKG:** konteks data gempa, cuaca, dan peringatan dini.
- **PVMBG:** konteks aktivitas gunung api dan status vulkanik.
- **BNPB:** konteks kejadian bencana dan wilayah terdampak.
- **IoT / Sensor System:** konteks telemetry, status sensor, dan gateway.

Sumber-sumber tersebut belum dihubungkan ke API atau endpoint eksternal sungguhan pada versi prototype ini.

---

## 7. Matriks Hak Akses

Menu use case ditampilkan berdasarkan role yang sedang login. Konfigurasi berikut mengikuti `accessByRole` pada `src/data.js`.

| Aktor | Hak Akses | Tanggung Jawab Utama |
|---|---|---|
| Risk Engineering (`RE`) | UC-01, UC-02, UC-03, UC-04, UC-05, UC-07, UC-08, UC-09, UC-10, UC-11 | Mengelola objek/lokasi, memantau dan menganalisis risiko, mengelola survei/mitigasi, serta meninjau self-survey. |
| Underwriter (`UW`) | UC-02, UC-03, UC-05 | Melihat informasi risiko portofolio, membandingkan objek, dan mencatat keputusan underwriting. |
| Claim Officer (`CO`) | UC-02, UC-07, UC-08 | Mengidentifikasi aset terdampak, melakukan assessment klaim, dan menugaskan adjuster. |
| Surveyor Eksternal (`SV`) | UC-08 | Melihat penugasan milik akun, mengisi hasil pemeriksaan, dan mengirim temuan/evidence. |
| Adjuster Eksternal (`ADJ`) | UC-07, UC-08 | Mengakses informasi klaim/penugasan adjustment dan mengirim hasil adjustment. |
| Tertanggung (`TC`) | UC-04, UC-09, UC-11 | Melihat monitoring objek milik sendiri, melakukan tindak lanjut mitigasi, dan mengisi self-survey yang diundang. |
| System Administrator (`SA`) | UC-06, UC-12, UC-13 | Mengelola sensor, pengguna, konfigurasi, dan simulasi integrasi data. |

> **Catatan keamanan:** pembatasan menu dan tampilan di atas dilakukan pada front-end. Pembatasan tersebut belum menggantikan pemeriksaan autentikasi dan otorisasi di backend seperti yang diperlukan pada sistem produksi.

---

## 8. Package dan Ringkasan Use Case

### Package 1 — Data & Pemetaan Geospasial

- **UC-01 — Mengelola Data Objek & Lokasi Pertanggungan.** Mengelola identitas polis dan objek, akun tertanggung, lini produk, provinsi/kota, alamat, koordinat opsional, verifikasi lokasi, relasi sensor, serta metadata unggahan dataset.
- **UC-02 — Melakukan Visualisasi & Memetakan Risiko Geospasial.** Menampilkan objek dan sensor pada peta ilustratif, layer exposure, ringkasan exposure per provinsi, detail objek, serta fungsi ekspor CSV dan cetak.

### Package 2 — Analisis & Monitoring Risiko

- **UC-03 — Melakukan Analisis Risiko & Risk Scoring.** Menghitung ulang skor risiko dari komponen bahaya, histori klaim, dan kondisi sensor; menampilkan rincian komponen; serta menjalankan simulasi skenario gempa, banjir, dan erupsi.
- **UC-04 — Melakukan Monitoring Risiko & Early Warning.** Memantau objek dan sensor, menguji telemetry, membentuk alert, menerima event simulasi, melakukan acknowledgement, mencatat tindak lanjut, menyelesaikan, atau mengeskalasi alert.
- **UC-05 — Menyediakan Dashboard Portofolio & Mendukung Pengambilan Keputusan.** Menyajikan peta/dashboard, KPI dan exposure, prioritas objek, perbandingan profil risiko, dokumen pendukung, simulasi/sinkronisasi data, dan pencatatan keputusan Underwriter.
- **UC-06 — Mengelola Perangkat Sensor IoT.** Mengelola daftar sensor, registrasi perangkat, pengaitan ke objek sesuai provinsi, status online/offline, gateway simulasi, threshold, dan uji payload tidak valid.

### Package 3 — Penilaian Dampak & Klaim

- **UC-07 — Melakukan Identifikasi Aset Terdampak & Menghitung Estimasi Kerugian.** Mengidentifikasi objek berdasarkan event atau provinsi manual, membuat potensi klaim, menampilkan rentang estimasi, menyimpan assessment, dan menugaskan adjuster.

### Package 4 — Survei & Mitigasi Risiko

- **UC-08 — Mengelola Survei & Penugasan Surveyor.** Membuat penugasan survei untuk objek yang memiliki keputusan `Perlu Assessment`, memilih surveyor, menetapkan tenggat, membatasi daftar pekerjaan berdasarkan akun, menerima temuan/evidence metadata, dan melakukan review/revisi/finalisasi.
- **UC-09 — Mengelola Rekomendasi & Rapor Aset.** Membuat rekomendasi dari library standar, menetapkan prioritas dan tenggat, menerima tindakan tertanggung, memverifikasi tindak lanjut, dan memperbarui risk score serta rapor aset.
- **UC-10 — Melakukan Verifikasi Hasil Survei & Kinerja Surveyor.** Membandingkan laporan surveyor dengan risk score, data lokasi, status dan histori sensor; menetapkan hasil sesuai atau revisi; serta menampilkan ringkasan kinerja surveyor.
- **UC-11 — Melakukan Self-Survey.** Menyediakan formulir self-survey untuk objek berisiko rendah (risk score di bawah 40), mengumpulkan checklist dan catatan, serta mendukung review Risk Engineering.

### Package 5 — Administrasi & Integrasi

- **UC-12 — Mengelola Daftar Pengguna, Konfigurasi & Keamanan Sistem.** Mengelola akun demo, role, status akun, flag MFA, parameter, pengaturan notifikasi, dan audit trail.
- **UC-13 — Mengintegrasikan Data Eksternal.** Memperagakan sumber data internal/eksternal, status koneksi, pengaturan jadwal, sinkronisasi simulasi, uji kegagalan, validasi payload, dan log integrasi.

---

## 9. Perbandingan 13 Use Case: Laporan Word dan Web Prototype

Bagian ini membandingkan rancangan yang dijelaskan dalam laporan Word dengan fitur yang benar-benar tersedia pada source code ZIP terbaru. Kolom **Alur demo: apa yang diisi dan hasilnya** tidak disertakan, sesuai ruang lingkup README ini.

### Package 1 — Data & Pemetaan Geospasial

| No. | Kegiatan di Word (Laporan) | Kegiatan di Web Prototype | Perbedaan | Toleransi Prototype: Fitur Wajib dan Status |
|---|---|---|---|---|
| 1 | **UC-01 Mengelola Data Objek & Lokasi Pertanggungan (Tahap 1).** Mengelola data polis, objek, alamat, koordinat, geocoding, verifikasi lokasi, serta dataset geospasial. | Menampilkan daftar objek; tambah/edit objek; mengisi nomor polis, tertanggung, lini produk, provinsi, kota, alamat, nilai pertanggungan; mengonfirmasi lokasi; mengaitkan sensor sesuai provinsi; dan mengekspor CSV. | Word menghendaki sinkronisasi sistem inti dan geocoding sebenarnya. Prototype menyimpan perubahan secara lokal; geocoding dan penarikan data inti masih berupa simulasi. Unggahan dataset hanya mencatat metadata/nama file, belum membaca isi menjadi layer. | **Sudah ada secara simulasi.** Data objek, validasi input alamat/koordinat, hubungan objek-sensor, dan status verifikasi tersedia. Geocoding sungguhan, sinkronisasi sistem inti aktual, serta pembacaan dan pemrosesan isi dataset belum ada. |
| 2 | **UC-02 Melakukan Visualisasi & Memetakan Risiko Geospasial (Tahap 1).** Menampilkan objek, layer bahaya, exposure, citra satelit, detail objek, dan ekspor peta. | Menampilkan peta Indonesia, marker objek dan sensor, layer visual, filter peta, rincian objek, exposure per provinsi, ekspor CSV, dan cetak halaman/peta. | Peta prototype menggunakan gambar dasar ilustratif. Posisi marker ditata secara visual berdasarkan titik sensor/provinsi dan bukan berasal dari GIS engine atau koordinat GPS yang tervalidasi. | **Sudah ada untuk demonstrasi.** Peta, marker, layer, filter, detail, dan ringkasan exposure tersedia. GIS engine, geometri/polygon spasial, citra satelit aktual, dan ekspor peta GIS formal belum ada. |

### Package 2 — Analisis & Monitoring Risiko

| No. | Kegiatan di Word (Laporan) | Kegiatan di Web Prototype | Perbedaan | Toleransi Prototype: Fitur Wajib dan Status |
|---|---|---|---|---|
| 3 | **UC-03 Melakukan Analisis Risiko & Risk Scoring (Tahap 1).** Menganalisis bahaya lokasi, menghitung skor per bencana dan skor gabungan, menilai exposure, serta melakukan simulasi skenario. | Memilih objek, menghitung ulang risk score, melihat komponen bahaya, histori klaim dan sensor, serta menjalankan simulasi gempa, banjir, atau erupsi. | Word mengarah pada model analisis risiko yang lebih komprehensif. Prototype memakai formula demonstrasi yang menggabungkan bahaya (55%), histori klaim (25%), dan risiko sensor (20%). | **Sudah ada secara simulasi.** Perhitungan skor, penilaian ulang, rincian komponen, dan simulasi tersedia. Model risiko produksi yang divalidasi dengan data historis/aktual belum ada. |
| 4 | **UC-04 Melakukan Monitoring Risiko & Early Warning (Tahap 2).** Memantau data sensor, mengevaluasi threshold, mendeteksi kejadian, membuat peringatan dini, mengirim notifikasi, dan melakukan tindak lanjut. | Melihat status sensor/telemetry, mengirim payload normal atau payload uji, menghasilkan alert dari nilai yang melewati threshold, menerima event eksternal simulasi, melakukan acknowledgement, mencatat tindak lanjut, menyelesaikan, atau mengeskalasi alert. | Word menggunakan sensor dan sumber data kebencanaan yang benar-benar terintegrasi. Prototype menggunakan kontrol antarmuka dan data sensor demo untuk menghasilkan event serta alert simulasi. Notifikasi yang tampil bersifat in-app. | **Sudah ada secara simulasi.** Alur threshold → alert → acknowledgement → tindak lanjut → selesai/eskalasi tersedia. Sensor fisik, ingestion telemetry real-time, serta notifikasi email/SMS sungguhan belum ada. |
| 5 | **UC-05 Menyediakan Dashboard Portofolio & Mendukung Pengambilan Keputusan (Tahap 1; moratorium pada Tahap 2).** Menampilkan profil risiko, exposure, perbandingan risiko, rekomendasi akseptasi, dan prioritas penanganan. | Menampilkan dashboard geospasial dan portofolio, KPI, exposure, prioritas objek, dokumen pendukung, perbandingan dua objek, status event/moratorium, serta pencatatan keputusan Underwriter dan prioritas. | Word menghendaki dukungan keputusan yang terhubung ke proses underwriting. Prototype mencatat keputusan pada state/localStorage dan belum mengirim transaksi keputusan ke sistem inti asuransi. | **Sudah ada untuk demo.** Dashboard, perbandingan, pencatatan keputusan, prioritas, dan tampilan moratorium tersedia. Transaksi underwriting aktual serta sinkronisasi keputusan ke sistem inti belum ada. |
| 6 | **UC-06 Mengelola Perangkat Sensor IoT (Tahap 2).** Registrasi sensor, konfigurasi, pengaitan dengan objek, koneksi gateway, pengaturan threshold, validasi telemetry, dan status perangkat. | Mengelola daftar sensor, menambah sensor, mengaitkan sensor dengan objek dalam provinsi yang sama, menguji gateway, mengubah status online/offline, mengatur threshold, dan menguji payload tidak valid. | Word menghendaki koneksi ke perangkat dan gateway IoT yang nyata. Prototype melakukan pengelolaan dan pengujian melalui state lokal serta data simulasi. | **Sudah ada secara simulasi.** Registrasi, pengaitan, threshold, status perangkat, dan uji payload tersedia. Koneksi perangkat fisik, MQTT/gateway aktual, serta penerimaan telemetry sungguhan belum ada. |

### Package 3 — Penilaian Dampak & Klaim

| No. | Kegiatan di Word (Laporan) | Kegiatan di Web Prototype | Perbedaan | Toleransi Prototype: Fitur Wajib dan Status |
|---|---|---|---|---|
| 7 | **UC-07 Melakukan Identifikasi Aset Terdampak & Menghitung Estimasi Kerugian (Tahap 2).** Mengidentifikasi aset dan polis terdampak, menghitung estimasi kerugian, mendukung assessment serta adjustment klaim. | Memilih event atau memasukkan wilayah secara manual, mengidentifikasi objek terdampak, membuat potensi klaim, melihat rentang estimasi kerugian, mengisi assessment, dan menugaskan adjuster. | Word menghendaki perhitungan berdasarkan jejak bencana dan lokasi spasial. Prototype memakai aturan simulasi berdasarkan provinsi kejadian dan provinsi yang berdekatan, bukan overlay polygon/geometri bencana aktual. | **Sudah ada secara simulasi.** Identifikasi objek, rentang estimasi, assessment, penugasan adjuster, dan review adjustment tersedia. Data klaim aktual, valuasi kerugian produksi, serta integrasi ke sistem klaim belum ada. |

### Package 4 — Survei & Mitigasi Risiko

| No. | Kegiatan di Word (Laporan) | Kegiatan di Web Prototype | Perbedaan | Toleransi Prototype: Fitur Wajib dan Status |
|---|---|---|---|---|
| 8 | **UC-08 Mengelola Survei & Penugasan Surveyor (Tahap 1 untuk surveyor; Tahap 2 untuk adjuster).** Membuat survei, menetapkan surveyor, memberikan akses terbatas, menerima temuan dan evidence, melakukan review, dan finalisasi. | Membuat penugasan survei untuk objek yang dipilih dari daftar keputusan `Perlu Assessment`, memilih surveyor aktif, menetapkan tenggat, menerima kondisi/temuan dan metadata nama file evidence, serta mendukung pengiriman, review, revisi, dan finalisasi. Penugasan adjuster dibuat melalui alur klaim UC-07 dan ditampilkan pada daftar penugasan sesuai akun. | Word menggunakan proses survei lapangan aktual. Prototype menggunakan akun demo dan menyimpan informasi evidence sebagai metadata/nama file, bukan mengunggah berkas ke server. Daftar objek untuk penugasan survei baru dibatasi pada keputusan UC-05 yang tersimpan sebagai `Perlu Assessment` (label antarmuka: **Minta assessment**). | **Sudah ada secara simulasi.** Penugasan, pemilihan surveyor, tenggat, akses berdasarkan akun, temuan, status, review, dan revisi tersedia. Penyimpanan foto/PDF sungguhan, notifikasi eksternal, dan manajemen pekerjaan lapangan aktual belum ada. |
| 9 | **UC-09 Mengelola Rekomendasi & Rapor Aset (Tahap 1).** Menyusun rekomendasi mitigasi, menyampaikan ke tertanggung, mencatat tindak lanjut, memverifikasi bukti, dan memperbarui rapor aset. | Memilih rekomendasi dari library standar, menentukan prioritas dan tenggat, mengisi tindakan perbaikan/catatan dan metadata bukti, melakukan verifikasi, serta memperbarui risk score dan rapor aset. | Word menghendaki tindak lanjut perbaikan pada objek sebenarnya. Prototype memperagakan proses menggunakan catatan dan metadata bukti lokal. Pembaruan risk score memakai aturan demonstrasi. | **Sudah ada secara simulasi.** Library rekomendasi, tindak lanjut, verifikasi, dan pembaruan rapor tersedia. Penyimpanan bukti sungguhan, notifikasi di luar aplikasi, dan validasi efektivitas mitigasi aktual belum ada. |
| 10 | **UC-10 Melakukan Verifikasi Hasil Survei & Kinerja Surveyor (Tahap 2).** Membandingkan laporan surveyor dengan data spasial, risk score, dan histori sensor, menilai kesesuaian, serta merekam kinerja surveyor. | Melihat laporan yang dikirim, membandingkan kondisi/temuan dengan risk score, status verifikasi lokasi, histori klaim, dan kondisi/histori sensor; menetapkan hasil sesuai atau revisi; serta melihat ringkasan kinerja dan ketepatan waktu surveyor. | Word menghendaki verifikasi independen berbasis data aktual. Prototype menggunakan aturan pembandingan sederhana dan data demonstrasi yang tersedia di browser. | **Sudah ada sebagian secara simulasi.** Perbandingan, penandaan perbedaan, keputusan sesuai/revisi, dan ringkasan kinerja tersedia. Penilaian kinerja berdasarkan rekam kerja lapangan aktual dan verifikasi independen produksi belum ada. |
| 11 | **UC-11 Melakukan Self-Survey (Tahap 2).** Tertanggung melakukan survei mandiri untuk objek berisiko rendah melalui formulir dan foto kondisi objek, kemudian ditinjau Risk Engineering. | Risk Engineering dapat mengirim undangan untuk objek low-risk yang memenuhi aturan; tertanggung mengisi checklist kondisi struktur, proteksi kebakaran, drainase/genangan, pemeliharaan, serta catatan; hasil masuk ke antrian review dan dapat disetujui atau diarahkan ke survei lapangan. | Word menghendaki pelaksanaan self-survey oleh tertanggung dengan bukti kondisi objek. Prototype memperagakan formulir dan review; file foto tidak disimpan sebagai berkas server, melainkan nama file dicatat dalam metadata/catatan demo. | **Sudah ada secara simulasi.** Formulir, validasi kelengkapan, undangan internal aplikasi, dan review tersedia. Ambang low-risk prototype adalah risk score di bawah 40. Pengiriman undangan/pengingat eksternal dan penyimpanan foto sungguhan belum ada. |

### Package 5 — Administrasi & Integrasi

| No. | Kegiatan di Word (Laporan) | Kegiatan di Web Prototype | Perbedaan | Toleransi Prototype: Fitur Wajib dan Status |
|---|---|---|---|---|
| 12 | **UC-12 Mengelola Daftar Pengguna, Konfigurasi & Keamanan Sistem (Tahap 1).** Mengelola akun, role, hak akses, master data, parameter, konfigurasi notifikasi, dan audit trail. | Menampilkan akun demo, menambah/mengubah/menonaktifkan pengguna, mengatur role, menampilkan matriks role dan akses, mengubah threshold, menampilkan flag MFA, konfigurasi notifikasi, dan audit trail. | Word mensyaratkan keamanan akses sebenarnya. Prototype memperagakan pengelolaan akun dan pembatasan menu di front-end; login hanya memeriksa kode pengguna aktif dan password tidak kosong. MFA hanya berupa flag/status antarmuka. | **Sudah ada sebagian.** Pengelolaan akun, role, konfigurasi, flag MFA, dan audit demo tersedia. Verifikasi password yang aman, MFA/OTP aktual, otorisasi backend, dan pengamanan server belum ada. |
| 13 | **UC-13 Mengintegrasikan Data Eksternal (Tahap 1 untuk sistem inti; Tahap 2 untuk data kebencanaan).** Sinkronisasi polis, underwriting, klaim, data BMKG/PVMBG/BNPB, validasi, dan pencatatan kegagalan integrasi. | Menampilkan kartu sumber data, status integrasi, arah data, jadwal sinkronisasi, tombol sinkronisasi, simulasi kegagalan, uji data invalid, dan log integrasi. | Word menghendaki pertukaran data melalui integrasi sistem. Prototype belum memanggil API Jasindo, BMKG, PVMBG, BNPB, atau gateway IoT, dan tidak menjalankan scheduler sungguhan. | **Sudah ada secara simulasi.** Konfigurasi sumber, status, pengaturan jadwal, pengujian, dan log tersedia. API, message broker, proses ETL/ingestion, dan penjadwalan otomatis produksi belum ada. |

---

## 10. Alur Proses Antar-Use Case

Bagian ini merangkum hubungan proses antar-modul berdasarkan kemampuan yang tersedia pada prototype. Tidak semua proses harus dijalankan secara berurutan; beberapa use case dapat dimulai secara mandiri untuk keperluan pengujian.

### 10.1 Pendataan dan analisis objek

```text
UC-01 Data Objek & Lokasi
          ↓
UC-02 Peta Risiko Geospasial
          ↓
UC-03 Analisis & Risk Scoring
          ↓
UC-05 Dashboard Portofolio & Keputusan
```

UC-01 menyediakan data objek dan lokasi. UC-02 menyajikan objek pada konteks peta dan exposure. UC-03 melakukan perhitungan risk score serta simulasi. UC-05 merangkum profil portofolio dan menyediakan pencatatan keputusan Underwriter.

### 10.2 Perangkat sensor, monitoring, dan early warning

```text
UC-06 Pengelolaan Sensor dan Threshold
          ↓
UC-04 Monitoring & Early Warning
          ↓
UC-05 Dashboard Geospasial & Portofolio
          ↓
UC-07 Identifikasi Aset Terdampak & Estimasi Klaim
```

UC-06 menyediakan sensor, status perangkat, dan parameter threshold demo. UC-04 memperagakan telemetry, event, dan alert. Ringkasan atau event dapat ditampilkan pada dashboard/peta dan menjadi masukan identifikasi aset terdampak di UC-07.

### 10.3 Keputusan assessment, survei, dan verifikasi

```text
UC-05 Keputusan Underwriter: Minta Assessment
          ↓
UC-08 Penugasan Survei
          ↓
Surveyor mengisi kondisi dan temuan
          ↓
UC-10 Verifikasi Hasil Survei
          ↓
Hasil sesuai / perlu revisi
```

Keputusan `Minta assessment` yang disimpan di UC-05 menjadi dasar daftar objek untuk penugasan survei baru di UC-08. Setelah surveyor mengirim hasil, Risk Engineering dapat meninjau di UC-10, kemudian menetapkan hasil sesuai atau meminta revisi.

### 10.4 Survei dan mitigasi

```text
UC-08 Hasil Survei
          ↓
UC-09 Rekomendasi Mitigasi & Rapor Aset
          ↓
Tertanggung mencatat tindakan perbaikan
          ↓
Risk Engineering memverifikasi
          ↓
Status mitigasi dan rapor aset diperbarui
```

UC-09 mengelola rekomendasi dan tindak lanjut tertanggung. Pada prototype, rekomendasi yang ditandai selesai akan memperbarui risk score menggunakan aturan demonstrasi dan menambahkan catatan rapor aset.

### 10.5 Self-survey

```text
Objek memenuhi ketentuan low-risk (risk score < 40)
          ↓
Risk Engineering mengirim undangan melalui UC-08
          ↓
Tertanggung mengisi formulir UC-11
          ↓
Risk Engineering melakukan review
          ↓
Disetujui atau perlu pemeriksaan surveyor
```

Self-survey dibatasi pada objek yang memiliki risk score di bawah 40. Tertanggung hanya melihat formulir untuk objek miliknya yang telah menerima undangan. Hasil yang masuk tetap memerlukan review Risk Engineering.

### 10.6 Klaim dan adjustment

```text
Event / wilayah kejadian
          ↓
UC-07 Identifikasi objek terdampak
          ↓
Potensi klaim dan rentang estimasi
          ↓
Claim Officer menyimpan assessment
          ↓
Claim Officer menugaskan Adjuster
          ↓
Adjuster mengirim hasil adjustment
          ↓
Claim Officer menerima atau meminta revisi
```

Event dapat berasal dari proses simulasi UC-04 atau Claim Officer memasukkan wilayah secara manual di UC-07. Identifikasi memakai daftar provinsi kejadian dan wilayah yang berdekatan dalam data prototype, bukan overlay geometri bencana aktual.

### 10.7 Administrasi dan integrasi

UC-12 mendukung pengelolaan pengguna, role, konfigurasi, dan audit trail demo. UC-13 memperagakan konfigurasi sumber data, jadwal, sinkronisasi, kegagalan, validasi payload, dan log. Keduanya mendukung kebutuhan lintas package, tetapi belum menjadi layanan backend atau integrasi sistem yang sesungguhnya.

---

## 11. Data Demo pada ZIP Terbaru

Bagian ini mengikuti data seed pada `src/data.js` di ZIP terbaru. **Data objek pertanggungan awal terdiri dari lima objek berikut.**

### 11.1 Objek pertanggungan

| ID Objek | Nama Objek | Kota | Provinsi | Nomor Polis | Lini Produk | Risk Score Awal |
|---|---|---|---|---|---|---:|
| `AST-009` | Hotel Banda Aceh | Banda Aceh | Aceh | `POL-2026-081` | Property | 62 |
| `AST-002` | Gudang Logistik Medan | Medan | Sumatera Utara | `POL-2026-014` | Property | 38 |
| `AST-003` | Pabrik Semen Padang | Padang | Sumatera Barat | `POL-2026-021` | Engineering | 73 |
| `AST-001` | Fasilitas Energi Jayapura | Jayapura | Papua | `POL-2026-001` | Engineering | 68 |
| `AST-006` | Pusat Distribusi Bekasi | Bekasi | Jawa Barat | `POL-2026-052` | Property | 56 |

Semua objek pada seed di atas memiliki status lokasi terverifikasi. Risk score dapat berubah setelah proses analisis/mitigasi dijalankan.

**Penting untuk demonstrasi:** data sensor Palangkaraya tersedia pada daftar sensor provinsi Kalimantan Tengah, tetapi ZIP terbaru tidak memiliki objek pertanggungan bernama Gudang Logistik Palangkaraya. Demikian pula, seed objek ZIP tidak mencantumkan PLTGU Cilegon. Untuk demonstrasi yang menggunakan data awal tanpa penambahan objek, gunakan lima objek pada tabel di atas. Objek baru dapat ditambahkan melalui UC-01.

### 11.2 Akun tertanggung dan kepemilikan objek

`src/data.js` menyediakan satu akun demo tertanggung dengan `insuredId` `ins-001`. Data objek yang menggunakan ID tertanggung tersebut adalah Hotel Banda Aceh dan Fasilitas Energi Jayapura. Objek lainnya menggunakan ID tertanggung berbeda. Karena itu, tampilan UC-04, UC-09, dan UC-11 untuk akun TC dibatasi pada data yang terhubung ke `insuredId` miliknya.

### 11.3 Data sensor

Aplikasi menyediakan data sensor untuk banyak provinsi di Indonesia. Setiap sensor mempunyai identitas, nama lokasi, provinsi/area, posisi ilustratif pada peta, status online/offline, dan nilai dasar telemetry. Sensor provinsi dapat digunakan sebagai sumber status/telemetry demo untuk objek yang berada di provinsi yang sama.

Pada seed awal, sensor Aceh dan DKI Jakarta berstatus offline; sejumlah sensor provinsi lainnya berstatus online. Status tersebut dapat berubah melalui UC-05/UC-06.

### 11.4 Penugasan survei awal

Terdapat tiga penugasan survei seed yang ditujukan kepada akun Surveyor Eksternal (`usr-surveyor`):

| ID Penugasan | Objek | ID Objek | Status Awal | Tenggat |
|---|---|---|---|---|
| `SUR-2026-012` | Pusat Distribusi Bekasi | `AST-006` | Ditugaskan | 31 Desember 2026 |
| `SUR-2026-013` | Fasilitas Energi Jayapura | `AST-001` | Ditugaskan | 31 Desember 2026 |
| `SUR-2026-014` | Gudang Logistik Medan | `AST-002` | Ditugaskan | 31 Desember 2026 |

Penugasan tersebut adalah data contoh yang sudah dimuat dari `initialAssignments`. Penugasan seed ini **berbeda dari proses pembuatan penugasan baru di UC-08**. Daftar objek pada form penugasan baru UC-08 difilter berdasarkan keputusan `Perlu Assessment` di UC-05.

### 11.5 Data awal yang belum memiliki record transaksi

Pada `src/data.js`, data awal berikut dimulai dalam kondisi kosong:

- Event kebencanaan (`initialEvents`).
- Klaim (`initialClaims`).
- Keputusan underwriting/prioritas (`decisions`, default `[]`).
- Rekomendasi mitigasi (`initialRecommendations`).
- Self-survey (`initialSelfSurveys`).

Data tersebut dapat terbentuk ketika fitur simulasi dan proses terkait dijalankan. Contohnya, keputusan underwriting harus dicatat terlebih dahulu di UC-05 sebelum objek yang bersangkutan muncul dalam daftar pilihan penugasan survei baru di UC-08.

### 11.6 Library dan sumber integrasi

- **Library rekomendasi mitigasi:** empat rekomendasi standar untuk banjir, gempa, kebakaran, dan kesiapsiagaan.
- **Sistem Inti Asuransi Jasindo:** konteks polis, objek, underwriting, klaim, dan pengiriman risk score.
- **BMKG:** konteks gempa, cuaca, dan peringatan dini.
- **PVMBG:** konteks aktivitas gunung api dan status vulkanik.
- **BNPB:** konteks kejadian bencana dan wilayah terdampak.
- **IoT / Sensor System:** konteks telemetry, status sensor, dan gateway IoT.

Status/schedule awal sumber integrasi ditetapkan dalam `initialIntegrations`; perubahan yang dibuat melalui UC-13 hanya mengubah data simulasi lokal.

---

## 12. Penyimpanan Data, Migrasi, dan Reset

### 12.1 Penyimpanan lokal

Aplikasi menggunakan React state dan menyimpan perubahan melalui browser `localStorage`. Prefix utama yang digunakan adalah:

```text
jasindo-geospatial-demo-
```

Aplikasi juga membaca prefix legacy berikut apabila data dengan prefix utama belum ditemukan:

```text
prime-prototype-
```

Kelompok data yang disimpan mencakup:

| Key | Isi |
|---|---|
| `assets` | Objek pertanggungan. |
| `sensors` | Sensor, status, dan histori telemetry demo. |
| `thresholds` | Parameter threshold dan batas exposure. |
| `events` | Event kebencanaan simulasi. |
| `alerts` | Peringatan dini dan tindak lanjutnya. |
| `claims` | Potensi klaim dan assessment. |
| `assignments` | Penugasan survei dan adjuster. |
| `decisions` | Keputusan underwriting/prioritas. |
| `recommendations` | Rekomendasi mitigasi dan tindak lanjut. |
| `rapor` | Riwayat pembaruan rapor aset. |
| `self-surveys` | Undangan dan hasil self-survey. |
| `integrations` | Status dan konfigurasi sumber integrasi demo. |
| `integration-logs` | Log proses integrasi simulasi. |
| `users` | Akun demo dan pengguna tambahan. |
| `audit` | Riwayat aktivitas. |
| `datasets` | Metadata unggahan dataset. |

### 12.2 Dampak penyimpanan lokal

- Data disimpan pada browser dan profil pengguna yang sama.
- Data tidak otomatis dibagikan ke browser atau komputer lain.
- Perubahan yang dibuat di satu perangkat tidak otomatis muncul di perangkat lain.
- Menghapus data situs/browser dapat menghapus perubahan prototype.
- `localStorage` bukan pengganti database terpusat atau penyimpanan server.

### 12.3 Migrasi baseline data demo

Source code memiliki mekanisme `migrateDemoBaseline()` dengan versi baseline. Ketika versi baseline berubah, aplikasi melakukan penyesuaian terhadap data lokal lama agar seed objek dan beberapa relasi data mengikuti baseline terbaru. Tujuannya menjaga demo agar konsisten dengan data objek yang disepakati sekaligus mempertahankan sebagian perubahan yang masih relevan.

### 12.4 Reset data demo

Reset tersedia melalui halaman administrasi UC-12 pada bagian audit trail. Aplikasi meminta konfirmasi sebelum menghapus data yang tersimpan pada prefix utama dan prefix legacy, kemudian memuat ulang halaman.

Reset mengembalikan aplikasi ke data awal dari `src/data.js`. Gunakan dengan hati-hati karena perubahan lokal yang belum dicadangkan dapat hilang.

---

## 13. Perbedaan Laporan Word dan Web Prototype

Laporan Word dan web prototype saling melengkapi, tetapi memiliki tujuan dan bentuk keluaran yang berbeda.

| Aspek | Laporan Word | Web Prototype |
|---|---|---|
| Tujuan | Menjelaskan kebutuhan, ruang lingkup, aktor, proses bisnis, use case, dan rancangan solusi. | Memperagakan penerjemahan rancangan proses menjadi antarmuka dan interaksi aplikasi. |
| Sifat artefak | Dokumentasi analisis dan rancangan sistem. | Implementasi demonstrasi front-end yang dapat dijalankan dan dicoba. |
| Sumber kebenaran | Menggambarkan proses bisnis dan kebutuhan yang direncanakan/disepakati dalam laporan. | Menunjukkan fitur dan perilaku yang benar-benar terdapat pada source code ZIP terbaru. |
| Cakupan | Menjelaskan proses yang diharapkan, termasuk integrasi dan kapabilitas sistem yang lebih lengkap. | Menampilkan fungsi yang sudah dibuat; sebagian proses masih berupa simulasi atau data lokal. |
| Detail proses | Menguraikan kebutuhan, aktor, alur bisnis, dan kondisi yang diharapkan. | Menyediakan halaman, input, tombol, tabel, status, validasi, dan respons antarmuka yang diimplementasikan. |
| Data | Menjelaskan data yang diperlukan dan sumber data yang direncanakan. | Menggunakan seed data dan perubahan lokal pada browser. |
| Integrasi | Dapat mensyaratkan koneksi ke sistem inti asuransi, BMKG, PVMBG, BNPB, dan IoT. | Memperagakan status dan proses sinkronisasi; belum terhubung ke API atau perangkat eksternal sungguhan. |
| Peta dan analisis | Menjelaskan kebutuhan analisis spasial serta model risiko yang ditargetkan. | Menggunakan peta ilustratif, marker demo, dan formula/peraturan demonstrasi. |
| Keamanan | Menjelaskan kebutuhan autentikasi, otorisasi, dan keamanan sistem. | Menggunakan akun demo, password non-kosong, flag MFA, dan pembatasan menu di front-end; belum menerapkan keamanan backend. |
| Bukti implementasi | Menjadi acuan dokumentasi dan penjelasan rancangan. | Menjadi bukti visual/interaktif atas fitur yang telah diwujudkan dalam prototype. |

### Cara membaca keduanya secara bersamaan

1. **Laporan Word menjelaskan kebutuhan dan proses yang dirancang.** Dokumen tersebut menjadi acuan analisis dan rancangan sistem.
2. **ZIP prototype menunjukkan implementasi yang benar-benar tersedia.** Fitur yang tidak ditemukan pada source code ZIP tidak boleh dianggap sudah berjalan hanya karena tertulis pada laporan.
3. **Kolom toleransi prototype menjelaskan batas demonstrasi yang dapat diterima.** Contohnya, alur integrasi dapat diperagakan melalui tombol dan log meskipun API eksternalnya belum dibangun.
4. **Perbedaan harus dinyatakan secara transparan.** Geocoding, sinkronisasi sistem inti, koneksi sensor, notifikasi eksternal, autentikasi, dan penyimpanan evidence tidak boleh disebut sebagai layanan produksi apabila yang berjalan baru simulasi.
5. **Data contoh harus mengikuti seed pada ZIP terbaru ketika melakukan demo.** Contoh objek yang tidak terdapat dalam seed perlu ditambahkan terlebih dahulu melalui UC-01 atau diganti dengan objek yang tersedia.

Dengan demikian, prototype bukan pengganti laporan Word. Laporan menjelaskan konteks, kebutuhan, dan rancangan; prototype menunjukkan bentuk implementasi demonstrasi dari sebagian kebutuhan tersebut.

---

## 14. Batasan Implementasi Prototype

| Area | Kondisi pada ZIP Terbaru | Yang Diperlukan untuk Produksi |
|---|---|---|
| Backend dan database | Belum ada backend; data disimpan pada `localStorage`. | API server, database terpusat, transaksi, backup, dan validasi server-side. |
| Login | Menggunakan kode aktor dan password yang tidak kosong. Password belum diverifikasi. | Autentikasi aman, hashing password, sesi/token, kebijakan password, dan pemulihan akun. |
| Otorisasi | Menu dan data tertentu difilter pada front-end berdasarkan role/akun. | Otorisasi di backend untuk setiap endpoint, data, dan objek. |
| MFA | Status MFA berupa flag/indikator di antarmuka. | Integrasi OTP atau mekanisme MFA aktual. |
| Peta/GIS | Peta dasar berupa gambar ilustratif; marker dan layer dihasilkan oleh komponen front-end. | GIS engine, tile service, koordinat valid, geometri/polygon, dan analisis spasial. |
| Geocoding | Validasi alamat dan konfirmasi lokasi merupakan simulasi. | Layanan geocoding/reverse geocoding dan validasi lokasi aktual. |
| Dataset geospasial | Nama file/ekstensi dicatat sebagai metadata; isi file belum diolah menjadi layer. | Parser GeoJSON/CSV/ZIP, validasi struktur dan koordinat, penyimpanan dataset. |
| IoT | Status sensor, telemetry, threshold, dan gateway diperagakan menggunakan data demo. | Perangkat/gateway fisik, protokol komunikasi, message broker, ingestion pipeline, dan monitoring koneksi. |
| Early warning | Alert terbentuk dari event/telemetry simulasi dan threshold lokal. | Integrasi sumber kejadian, aturan deteksi teruji, notifikasi real-time, dan mekanisme eskalasi operasional. |
| Risk scoring | Formula demonstrasi menggunakan komponen bahaya, histori klaim, dan kondisi sensor. | Model risiko yang divalidasi, data historis berkualitas, kalibrasi, dan tata kelola model. |
| Klaim | Identifikasi berdasarkan wilayah/provinsi dan daftar provinsi berdekatan; estimasi memakai aturan sederhana. | Integrasi sistem klaim, overlay spasial yang akurat, dan metode valuasi kerugian yang disetujui. |
| Evidence | Nama file dicatat sebagai metadata/catatan; berkas tidak diunggah ke server. | Object storage, validasi file, kontrol akses, retensi, dan audit dokumen. |
| Integrasi eksternal | Tombol sinkronisasi mengubah status dan menambahkan log simulasi. | API resmi, autentikasi antar-sistem, mapping data, retry, observability, dan error handling. |
| Scheduler | Pilihan jadwal disimpan sebagai konfigurasi demo. | Job scheduler/worker yang menjalankan sinkronisasi sesuai jadwal. |
| Notifikasi | Notifikasi ditampilkan di dalam antarmuka. Email/SMS hanya ditampilkan sebagai simulasi. | Email, SMS, push notification, atau kanal resmi lainnya. |
| Kinerja surveyor | Ringkasan dihitung dari record penugasan demo. | Integrasi rekam kerja aktual, SLA, dan pengukuran kinerja operasional. |

---

## 15. Catatan Implementasi dan Aturan Bisnis Penting

### 15.1 Keputusan Underwriter dan daftar objek UC-08

Pada UC-05, Underwriter dapat memilih salah satu keputusan untuk objek:

- `Diterima` (label UI: Terima).
- `Ditolak` (label UI: Tolak).
- `Moratorium`.
- `Perlu Assessment` (label UI: **Minta assessment**).

Keputusan disimpan pada kumpulan data `decisions`, dengan `assetId` yang merujuk ke objek terkait. UC-08 membentuk daftar pilihan objek penugasan baru dari objek yang memiliki keputusan:

```js
const assetsForAssessment = assets.filter((asset) =>
  decisions.some(
    (d) => d.assetId === asset.id && d.kind === 'Perlu Assessment'
  )
);
```

Dengan demikian:

- Objek dengan keputusan **Minta assessment** akan tersedia pada dropdown penugasan baru UC-08.
- Objek dengan keputusan **Diterima**, **Ditolak**, atau **Moratorium** tidak masuk ke daftar tersebut.
- Jika belum ada keputusan `Perlu Assessment`, dropdown menampilkan informasi bahwa belum ada objek yang memenuhi syarat.
- Keputusan `Perlu Assessment` adalah nilai yang disimpan; tulisan **Minta assessment** merupakan label yang ditampilkan di antarmuka.
- Tiga penugasan survei awal dari seed data merupakan record terpisah dan tidak otomatis membuktikan bahwa objeknya memiliki keputusan `Perlu Assessment`.

### 15.2 Self-survey

Self-survey pada prototype menggunakan ketentuan:

```js
riskScore < 40
```

Objek harus berada di bawah ambang tersebut untuk memenuhi syarat self-survey. Tertanggung hanya dapat mengisi formulir untuk objek miliknya yang sudah menerima undangan. Hasil self-survey tetap perlu ditinjau Risk Engineering. Aturan ambang ini merupakan ketentuan demonstrasi pada prototype, bukan pengganti kebijakan underwriting resmi.

### 15.3 Risk scoring

Fungsi perhitungan risk score pada prototype menggabungkan tiga komponen utama:

| Komponen | Bobot |
|---|---:|
| Bahaya lokasi (`hazard`) | 55% |
| Histori klaim (`history`) | 25% |
| Kondisi sensor (`sensorRisk`) | 20% |

Nilai akhir dibatasi dalam rentang 0–100. Formula ini merupakan formula demonstrasi di source code dan bukan klaim bahwa model sudah divalidasi untuk keputusan underwriting aktual.

### 15.4 Penentuan risk band

Prototype menampilkan klasifikasi risiko berdasarkan skor:

- **Rendah:** skor di bawah 40.
- **Menengah:** skor 40 sampai 69.
- **Tinggi:** skor 70 atau lebih.

Klasifikasi ini digunakan pada visualisasi dan ringkasan antarmuka.

### 15.5 UC-07: identifikasi aset dan estimasi klaim

Jika event memiliki daftar objek terdampak (`impactedAssetIds`), prototype menggunakan daftar tersebut. Jika tidak, proses identifikasi menggunakan provinsi event atau input manual beserta daftar provinsi tetangga yang didefinisikan pada source code. Oleh sebab itu, hasil identifikasi merupakan aturan demonstrasi geografis berbasis provinsi, bukan hasil overlay peta bencana aktual.

### 15.6 UC-09: perubahan risk score setelah mitigasi

Ketika rekomendasi ditandai selesai, prototype memperbarui risk score objek dengan pengurangan sebesar 8 poin (dengan batas bawah 5) dan menambahkan entri rapor aset. Ini merupakan aturan simulasi untuk memperagakan dampak penyelesaian mitigasi.

### 15.7 Evidence survei dan self-survey

Pada UC-08, nama file yang dipilih surveyor dicatat sebagai daftar metadata evidence. Pada UC-11, nama file foto ditambahkan ke catatan. Prototype tidak mengunggah dan menyimpan file foto/PDF secara persisten ke server.

### 15.8 Integrasi dan penjadwalan

UC-13 memperagakan perubahan status integrasi, sinkronisasi sukses/gagal, validasi payload, pengaturan jadwal, dan pencatatan log. Fungsi tersebut bekerja pada data simulasi lokal. Tidak ada pemanggilan API eksternal atau scheduler produksi pada versi ini.

---

## 16. Saran Pengembangan Lanjutan

Apabila prototype akan dilanjutkan menjadi aplikasi yang dapat digunakan secara operasional, langkah pengembangan berikut dapat dipertimbangkan:

1. Menentukan arsitektur backend dan database untuk menyimpan objek, keputusan, sensor, alert, klaim, assignment, rekomendasi, self-survey, dan audit trail secara terpusat.
2. Menerapkan autentikasi, manajemen sesi, MFA, serta otorisasi berbasis role dan kepemilikan objek di server.
3. Mengintegrasikan GIS, geocoding, koordinat tervalidasi, dan analisis wilayah terdampak berbasis geometri.
4. Menghubungkan perangkat dan gateway IoT melalui protokol komunikasi serta message broker yang ditetapkan.
5. Mengintegrasikan sistem inti asuransi dan sumber data eksternal melalui API yang disepakati.
6. Menerapkan penyimpanan evidence, notifikasi, scheduler, logging, monitoring, dan backup.
7. Memvalidasi formula risk scoring, threshold, dan estimasi kerugian bersama pemilik proses bisnis.
8. Menyusun pengujian fungsional, integrasi, keamanan, performa, serta user acceptance test (UAT).

---

## 17. Informasi Versi

| Informasi | Nilai |
|---|---|
| Nama proyek | JASINDO — Sistem Informasi Geospasial |
| Nama package | `jasindo-iot-geospatial-prototype` |
| Versi pada `package.json` | `2.0.0` |
| Referensi ZIP yang didokumentasikan | `jasindo-iot-geospatial-prototype-v5(5).zip` |
| React | `18.3.1` |
| React DOM | `18.3.1` |
| Vite | `5.4.15` |
| Lucide React | `0.468.0` |
| Bahasa antarmuka | Indonesia |
| Tipe aplikasi | Front-end prototype / demonstrasi use case |
| Penyimpanan | Browser `localStorage` |
| Jumlah package | 5 |
| Jumlah use case | 13 |

---

*Dokumentasi ini menjelaskan implementasi prototype pada ZIP yang menjadi acuan. Perubahan pada source code di masa mendatang dapat menyebabkan sebagian keterangan perlu diperbarui.*
