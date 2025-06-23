// src/scripts/index.js
import 'leaflet/dist/leaflet.css';
import '../styles/main.css';
import router from './router.js';
import View from './view.js';

document.addEventListener('DOMContentLoaded', () => {
  View.setupSkipLink();
  router(); // Panggil router saat pertama kali load
});

window.addEventListener('hashchange', router);