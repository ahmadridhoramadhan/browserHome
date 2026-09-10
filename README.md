# Chrome Home Dashboard

Beranda kustom interaktif untuk Google Chrome dan berbagai peramban modern lainnya. Dilengkapi dengan jendela widget bebas geser (*movable window*), jam digital & kalender, jadwal sholat otomatis, cuaca real-time, to-do list, catatan cepat, pintasan aplikasi (*shortcuts*), serta kustomisasi wallpaper latar belakang.

---

## 🚀 Cara Pemasangan & Penggunaan

Anda dapat menggunakan dashboard ini melalui dua metode: **Download dari GitHub Releases** (langsung pakai tanpa perlu install Node.js) atau **Git Clone & Build Manual** (untuk pengembang).

---

### Metode 1: Download Langsung dari GitHub Releases (Direkomendasikan)

Metode ini cocok jika Anda hanya ingin langsung memakai aplikasi tanpa memasang Node.js:

1. Buka halaman **Releases** di repositori GitHub ini (di sebelah kanan halaman utama GitHub).
2. Pada rilis versi terbaru (misalnya `v1.0.x`), unduh file arsip **`dist-v1.0.x.zip`**.
3. Ekstrak file zip tersebut ke folder yang aman di komputer Anda, contoh:
   - **Windows:** `C:\Users\<NamaAnda>\Documents\ChromeDashboard`
   - **macOS / Linux:** `~/Documents/ChromeDashboard`
4. Di dalam folder hasil ekstrak, Anda akan menemukan file `index.html` beserta folder `assets`.
5. Siap digunakan! Lanjutkan ke bagian [Cara Memasang ke Browser](#-cara-memasang-ke-browser).

---

### Metode 2: Git Clone & Build Manual (Untuk Pengembang)

Gunakan metode ini jika Anda ingin memodifikasi kode sumber atau melakukan build sendiri:

#### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 atau 20 ke atas)
- Git

#### Langkah-langkah:
1. **Clone repositori:**
   ```bash
   git clone https://github.com/<username>/<nama-repo>.git
   cd <nama-repo>
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Menjalankan server development (opsional untuk pratinjau langsung):**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```
   Hasil kompilasi siap pakai akan berada di folder **`dist/`**.

---

## 🌐 Cara Memasang ke Browser

Ada beberapa cara untuk menjadikan dashboard ini sebagai halaman awal atau tab baru di peramban Anda.

### Opsi A: Menggunakan Ekstensi "Custom New Tab" (Paling Praktis untuk Tab Baru)
Secara bawaan, Google Chrome dan peramban berbasis Chromium membatasi pembukaan file lokal langsung saat Anda menekan tombol *New Tab* (`Ctrl + T`). Cara terbaik dan termudah:

1. Pasang ekstensi pengarah New Tab dari Chrome Web Store, misalnya:
   - **New Tab Redirect** atau **Custom New Tab URL**.
2. Buka opsi/pengaturan ekstensi tersebut.
3. Masukkan alamat file `index.html` Anda:
   - Contoh format Windows: `file:///C:/Users/<NamaAnda>/Documents/ChromeDashboard/index.html`
   - Contoh format Mac/Linux: `file:///Users/<NamaAnda>/Documents/ChromeDashboard/index.html`
4. Simpan, lalu setiap kali Anda membuka tab baru, dashboard akan otomatis muncul!

---

### Opsi B: Mengatur sebagai Halaman Saat Memulai (On Startup) & Tombol Beranda (Home)

Jika Anda ingin dashboard otomatis terbuka setiap kali peramban baru dibuka:

#### 1. Google Chrome
- **Halaman Mulai (On Startup):**
  1. Buka menu titik tiga di kanan atas > **Setelan** (*Settings*).
  2. Pilih menu **Saat memulai** (*On startup*) di panel kiri (atau ketik `chrome://settings/onStartup`).
  3. Pilih **Buka halaman tertentu atau sekumpulan halaman** (*Open a specific page or set of pages*).
  4. Klik **Tambahkan halaman baru** (*Add a new page*).
  5. Masukkan path file lokal:
     `file:///C:/path/ke/folder/dist/index.html` (sesuaikan dengan lokasi file Anda).
- **Tombol Beranda (Home Button):**
  1. Di Setelan Chrome, buka tab **Tampilan** (*Appearance*) (`chrome://settings/appearance`).
  2. Aktifkan sakelar **Tampilkan tombol Beranda** (*Show Home button*).
  3. Masukkan path file lokal Anda pada kolom URL kustom.

#### 2. Microsoft Edge
- Buka `edge://settings/startHomeOpenTabs`.
- Di bagian **Saat Edge dimulai**, pilih **Buka halaman ini** > **Tambahkan halaman baru** > masukkan path `file:///.../index.html`.
- Buka `edge://settings/appearance`, aktifkan **Tombol beranda** dan masukkan path file yang sama.

#### 3. Mozilla Firefox
- Buka **Pengaturan** (`about:preferences#home`).
- Pada bagian **Halaman beranda dan jendela baru** (*Homepage and new windows*):
  - Pilih menu tarik-turun: **URL Khusus...** (*Custom URLs...*).
  - Masukkan path `file:///.../index.html`.

#### 4. Brave Browser
- Buka **Setelan** > **Memulai** (`brave://settings/getStarted`).
- Pilih **Buka halaman tertentu** lalu tambahkan file `index.html`.
- Pada menu **Tampilan** (`brave://settings/appearance`), aktifkan tombol Beranda dan masukkan path `file:///.../index.html`.

---

### Opsi C: Menjalankan Server Lokal (Rekomendasi untuk Fleksibilitas Penuh)

Agar tidak dibatasi oleh protokol `file://`, Anda dapat menjalankan web server mini:

```bash
# Menjalankan langsung folder dist dengan npx serve
npx serve dist -p 5000
```
Setelah itu, Anda cukup menyetel URL ke `http://localhost:5000` di peramban Anda.

---

### Opsi D: Deploy Gratis ke GitHub Pages / Vercel / Netlify

Anda juga dapat mengunggah folder hasil build ke layanan hosting gratis:
- **GitHub Pages:** Di pengaturan repositori GitHub Anda (**Settings** > **Pages**), aktifkan GitHub Pages dari branch rilis atau workflow deploy.
- **Vercel / Netlify:** Hubungkan repositori GitHub Anda dan set build command ke `npm run build` serta output directory ke `dist`.
- Anda akan mendapatkan link permanen (contoh: `https://username.github.io/repo-name/`) yang bisa dijadikan *Home* di semua perangkat Anda, termasuk ponsel dan laptop lain.

---

## ✨ Fitur Utama

- 🕒 **Jam Digital & Tanggal:** Tampilan waktu presisi tinggi dengan format tanggal lengkap.
- 🕌 **Jadwal Sholat Otomatis:** Menghitung waktu sholat (Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya) secara lokal dengan penanda waktu sholat berikutnya.
- 🌤️ **Widget Cuaca Real-time:** Informasi suhu, kondisi cuaca, dan kecepatan angin.
- ✅ **To-Do List Terintegrasi:** Manajemen tugas harian dengan checklist dan status selesai.
- 📝 **Catatan Cepat (Sticky Notes):** Mencatat memo penting langsung di layar beranda.
- 🔗 **Pintasan Aplikasi & Web:** Akses cepat ke situs favorit yang dapat ditambah, diedit, dan dihapus.
- 🪟 **Jendela Widget Bebas Geser (Draggable & Resizable):** Atur posisi dan ukuran jendela sesuai tata letak favorit Anda.
- 🎨 **Kustomisasi Wallpaper:** Pilihan wallpaper bawaan atau unggah gambar latar belakang sendiri.

---

## 🛠️ Perintah Pengembangan (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server development lokal dengan live preview |
| `npm run build` | Melakukan kompilasi aplikasi untuk siap rilis ke folder `dist/` |
| `npm run lint` | Memeriksa tipe dan sintaksis TypeScript (`tsc --noEmit`) |
| `npm run preview` | Meninjau hasil kompilasi `dist/` secara lokal |

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Bebas digunakan dan dimodifikasi untuk kebutuhan pribadi maupun komunitas.
