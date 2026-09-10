# Chrome Home Dashboard

Beranda kustom interaktif yang dirancang sebagai **Browser Extension (Ekstensi Chrome / Chromium)** dan juga dapat digunakan sebagai web dashboard mandiri. Dilengkapi dengan jendela widget bebas geser (*movable & resizable windows*), jam digital & kalender, jadwal sholat otomatis, cuaca real-time, to-do list, catatan cepat (*notes*), pintasan aplikasi (*shortcuts*), serta kustomisasi wallpaper latar belakang.

---

## ⚡ Cara Paling Mudah: Pasang Langsung sebagai Ekstensi Browser

Dengan adanya file `manifest.json` (Manifest V3), folder hasil build aplikasi ini dapat langsung dipasang sebagai ekstensi peramban untuk menggantikan halaman **Tab Baru (New Tab)** secara otomatis!

### Langkah 1: Dapatkan File Ekstensi
Pilih salah satu cara berikut:
- **Download dari GitHub Releases (Tanpa Install Apapun):**
  1. Buka tab **Releases** di repositori GitHub ini.
  2. Unduh file `dist-v*.zip` versi terbaru.
  3. Ekstrak file zip tersebut ke folder di komputer Anda (misal: `Documents/ChromeDashboard`).
- **Atau Build Manual Sendiri:**
  ```bash
  git clone https://github.com/<username>/<nama-repo>.git
  cd <nama-repo>
  npm install
  npm run build
  ```
  Folder `dist/` hasil build adalah folder ekstensi Anda.

---

### Langkah 2: Pasang ke Browser Anda

#### 🌐 1. Google Chrome & Brave Browser
1. Buka browser dan ketik alamat berikut di address bar:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
2. Aktifkan sakelar **Mode Pengembang** (*Developer mode*) di pojok kanan atas.
3. Klik tombol **Muat yang belum dibongkar** (*Load unpacked*) di pojok kiri atas.
4. Pilih folder hasil ekstrak (folder `dist` yang berisi file `manifest.json` dan `index.html`).
5. **Selesai!** Tekan `Ctrl + T` (atau `Cmd + T` di Mac) untuk membuka tab baru — Chrome Home Dashboard akan langsung tampil otomatis sebagai halaman tab baru Anda!

#### 🌐 2. Microsoft Edge
1. Buka `edge://extensions` di address bar.
2. Di panel sebelah kiri bawah, aktifkan toggle **Mode Pengembang** (*Developer mode*).
3. Klik tombol **Muat belum dibongkar** (*Load unpacked*).
4. Pilih folder `dist`.
5. Buka tab baru, dashboard siap digunakan.

#### 🌐 3. Opera / Vivaldi
1. Buka menu Extensions (`opera://extensions` atau `vivaldi://extensions`).
2. Aktifkan **Developer Mode**.
3. Klik **Load unpacked** dan pilih folder `dist`.

#### 🦊 4. Mozilla Firefox (Mode Add-on Sementara)
1. Buka `about:debugging#/runtime/this-firefox`.
2. Klik tombol **Load Temporary Add-on...**.
3. Masuk ke dalam folder `dist` dan pilih file `manifest.json`.

---

## 💻 Penggunaan Alternatif (Tanpa Memasang Ekstensi)

Jika Anda tidak ingin memasangnya sebagai ekstensi, dashboard tetap bisa digunakan melalui cara berikut:

### Opsi A: Atur sebagai Halaman Mulai (On Startup) / Tombol Home
- **Chrome:** Buka `chrome://settings/onStartup` > Pilih *Buka halaman tertentu* > Tambahkan path:
  `file:///C:/lokasi/folder/dist/index.html`
- **Firefox:** Buka `about:preferences#home` > Pada *Halaman beranda dan jendela baru*, pilih *URL Khusus* dan masukkan path `file:///.../index.html`.

### Opsi B: Jalankan dengan Web Server Lokal
```bash
# Menjalankan folder dist dengan npx serve
npx serve dist -p 5000
```
Buka browser di `http://localhost:5000`.

### Opsi C: Deploy Gratis ke Cloud (GitHub Pages / Vercel / Netlify)
- Unggah kode ke GitHub dan aktifkan **GitHub Pages** di tab *Settings > Pages*.
- Atau hubungkan ke Vercel/Netlify dengan build command `npm run build` dan output `dist`.

---

## 🛠️ Panduan Pengembangan (Development)

Bagi pengembang yang ingin mengubah kode, menambah widget, atau mengutak-atik tampilan:

```bash
# 1. Clone repositori
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>

# 2. Install dependensi
npm install

# 3. Jalankan development server dengan auto-reload
npm run dev
# Dashboard dapat diakses di http://localhost:3000

# 4. Build ekstensi produksi
npm run build
# Hasil build siap pasang akan dibuat di folder dist/ lengkap dengan manifest.json & icon
```

### Struktur File Ekstensi
- `public/manifest.json`: Konfigurasi Manifest V3 untuk Chrome Extension (`chrome_url_overrides.newtab`).
- `public/icons/`: Ikon ekstensi berukuran 16x16, 48x48, dan 128x128 px.
- `src/`: Komponen React dan antarmuka dashboard.
- `dist/`: Folder siap pasang ke browser setelah menjalankan `npm run build` atau mengekstrak rilis GitHub.

---

## ✨ Fitur Utama

- 🕒 **Jam Digital & Tanggal:** Jam presisi tinggi lengkap dengan kalender masehi dan status detik.
- 🕌 **Jadwal Sholat Otomatis:** Perhitungan waktu sholat berdasarkan koordinat lokasi dengan penanda waktu sholat berikutnya.
- 🌤️ **Widget Cuaca Real-time:** Menampilkan temperatur, status cuaca, kelembapan, dan angin.
- ✅ **To-Do List Terintegrasi:** Daftar tugas harian dengan checklist dan penyimpanan lokal otomatis.
- 📝 **Catatan Cepat (Sticky Notes):** Mencatat memo penting langsung di layar tanpa aplikasi tambahan.
- 🔗 **Pintasan Aplikasi & Web:** Akses cepat ke situs favorit yang dapat ditambah, diedit, dan dihapus.
- 🪟 **Jendela Widget Bebas Geser & Atur Ukuran:** Posisi dan ukuran jendela tersimpan otomatis di penyimpanan lokal browser.
- 🎨 **Kustomisasi Wallpaper:** Pilihan wallpaper estetik bawaan atau gunakan gambar latar belakang Anda sendiri.

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Bebas digunakan dan dimodifikasi untuk kebutuhan pribadi maupun komunitas.
