// src/scripts/index.js

import 'leaflet/dist/leaflet.css';
import '../styles/main.css';
import router from './router.js';
import View from './view.js';

// =================================================================
// TITIK AWAL APLIKASI (Entry Point)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Setup untuk skip-link (Aksesibilitas)
  View.setupSkipLink();
  
  // Panggil router untuk menampilkan halaman awal
  router();

  // === PENDAFTARAN SERVICE WORKER (PWA) ===
  // Kode ini mendaftarkan service worker yang dibuat oleh Workbox
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker: Berhasil didaftarkan!');
        })
        .catch(error => {
          console.log('Service Worker: Pendaftaran gagal:', error);
        });
    });
  }
  // ==========================================
});

// Event listener untuk menangani perubahan hash (navigasi SPA)
window.addEventListener('hashchange', router);