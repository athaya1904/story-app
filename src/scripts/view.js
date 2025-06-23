// src/scripts/view.js

import L from 'leaflet';
import { transitionHelper } from './utils/transition.js';

const View = {
  mainContent: document.querySelector("#main-content"),
  nav: document.querySelector('#main-nav'),
  activeStream: null,

  // --- Render Tampilan Umum ---
  renderPage(html, afterRenderCallback) {
    transitionHelper({
      updateDOM: () => {
        this.mainContent.innerHTML = html;
        if (afterRenderCallback) {
          afterRenderCallback();
        }
      },
    });
  },

  // <-- PERUBAHAN 1: Menambah parameter 'notifHandler' untuk tombol notifikasi
  updateNavLinks(isLoggedIn, userName, logoutCallback, notifHandler) {
    if (isLoggedIn) {
      this.nav.innerHTML = `
        <a href="#/">Beranda</a>
        <a href="#/add">Tambah Cerita</a>
        <button id="notif-button" class="form-button" style="margin-right: 15px;">Aktifkan Notifikasi</button>
        <a href="#" id="logout-button">Logout (${userName})</a>
      `;
      document.querySelector('#logout-button').addEventListener('click', logoutCallback);
      document.querySelector('#notif-button').addEventListener('click', notifHandler); // <-- Menghubungkan tombol notifikasi
    } else {
      this.nav.innerHTML = `<a href="#/login">Login</a><a href="#/register">Register</a>`;
    }
  },
  
  // --- Render Halaman Spesifik ---
  renderLoginPage(loginHandler) {
    const html = `
      <div class="page-header"><h2>Login</h2></div>
      <form id="login-form" class="auth-form" novalidate>
        <div class="form-group"><label for="login-email">Email:</label><input type="email" id="login-email" name="email" required></div>
        <div class="form-group"><label for="login-password">Password:</label><input type="password" id="login-password" name="password" required></div>
        <button type="submit" class="form-button">Login</button>
      </form>
    `;
    this.renderPage(html, () => {
      document.querySelector('#login-form').addEventListener('submit', loginHandler);
    });
  },

  renderRegisterPage(registerHandler) {
    const html = `
      <div class="page-header"><h2>Register Akun Baru</h2></div>
      <form id="register-form" class="auth-form" novalidate>
        <div class="form-group"><label for="register-name">Nama:</label><input type="text" id="register-name" name="name" required></div>
        <div class="form-group"><label for="register-email">Email:</label><input type="email" id="register-email" name="email" required></div>
        <div class="form-group"><label for="register-password">Password:</label><input type="password" id="register-password" name="password" required minlength="8"></div>
        <button type="submit" class="form-button">Register</button>
      </form>
    `;
    this.renderPage(html, () => {
      document.querySelector('#register-form').addEventListener('submit', registerHandler);
    });
  },

  // <-- PERUBAHAN 2: Menambah parameter 'clearCacheHandler' untuk tombol hapus data
  renderHomePage(stories, clearCacheHandler) {
    let storyItems = '<p>Belum ada cerita atau gagal memuat data.</p>';
    if (stories && stories.length > 0) {
      storyItems = stories.map(story => `
        <article class="story-item">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-image">
          <div class="story-info">
            <h3 class="story-name">${story.name}</h3>
            <p class="story-date">${new Date(story.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p class="story-description">${story.description}</p>
          </div>
        </article>
      `).join('');
    }
    
    // <-- PERUBAHAN 3: Menambahkan tombol 'Hapus Cache' ke dalam HTML
    const html = `
      <div class="page-header">
        <h2>Daftar Cerita</h2>
        <button id="clear-cache-button" class="form-button" style="margin-top: 1rem;">Hapus Cache Cerita Offline</button>
      </div>
      <div id="story-list" class="story-list">${storyItems}</div>
      <h2>Peta Lokasi Cerita</h2>
      <div id="map" style="height: 400px; width: 100%;"></div>
    `;

    this.renderPage(html, () => {
      // <-- PERUBAHAN 4: Menghubungkan tombol hapus cache
      document.querySelector('#clear-cache-button').addEventListener('click', clearCacheHandler);

      if (stories && stories.length > 0) {
        const map = L.map('map').setView([-2.5489, 118.0149], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        stories.forEach(story => {
          if (story.lat && story.lon) {
            L.marker([story.lat, story.lon]).addTo(map).bindPopup(`<b>${story.name}</b>`);
          }
        });
      }
    });
  },

  renderAddPage(addHandler) {
      const html = `
          <div class="page-header"><h2>Tambah Cerita Baru</h2></div>
          <form id="add-story-form" class="add-story-form" novalidate>
              <div class="camera-container"><video id="camera-preview" autoplay playsinline></video><canvas id="photo-canvas" style="display: none;"></canvas><button type="button" id="capture-button" class="form-button">Ambil Foto</button></div>
              <div class="form-group"><label for="description">Deskripsi:</label><textarea id="description" name="description" rows="4" required></textarea></div>
              <div class="form-group"><label>Lokasi (klik pada peta):</label><div id="add-story-map" style="height: 300px; width: 100%;"></div><input type="hidden" id="latitude" name="lat" required><input type="hidden" id="longitude" name="lon" required></div>
              <button type="submit" class="form-button submit-button">Kirim Cerita</button>
          </form>
      `;
      this.renderPage(html, () => {
        this._initCamera(); this._initAddStoryMap();
        document.querySelector('#add-story-form').addEventListener('submit', addHandler);
      });
  },
  
  // Fungsi renderNotFoundPage untuk kriteria opsional
  renderNotFoundPage() {
    const html = `<div class="page-header"><h2>404 - Halaman Tidak Ditemukan</h2><p>Maaf, halaman yang Anda cari tidak ada.</p></div>`;
    this.renderPage(html);
  },

  renderError(message, isLoggedIn) {
    if (isLoggedIn) {
      this.mainContent.innerHTML = `<p>Error: ${message}</p>`;
    } else {
      this.mainContent.innerHTML = `<div class="auth-form"><p>Anda harus login untuk mengakses halaman ini.</p></div>`;
    }
  },
  
  // Helper-helper internal View (tidak ada perubahan)
  _initCamera() {
      const video = document.querySelector('#camera-preview');
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => { this.activeStream = stream; video.srcObject = stream; })
          .catch(err => { alert("Tidak bisa mengakses kamera."); console.error(err); });
      
      const captureButton = document.querySelector('#capture-button');
      captureButton.addEventListener('click', () => {
          const canvas = document.querySelector('#photo-canvas');
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          captureButton.textContent = "Foto Diambil!";
          captureButton.style.backgroundColor = '#28a745';
          captureButton.setAttribute('data-taken', 'true');
      });
  },

  _initAddStoryMap() {
      const map = L.map('add-story-map').setView([-6.895473, 107.610423], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      let marker;
      map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          document.querySelector('#latitude').value = lat;
          document.querySelector('#longitude').value = lng;
          if (marker) { marker.setLatLng(e.latlng); }
          else { marker = L.marker(e.latlng).addTo(map); }
          marker.bindPopup(`Lokasi dipilih`).openPopup();
      });
  },

  stopCameraStream() {
      if (this.activeStream) {
          this.activeStream.getTracks().forEach(track => track.stop());
          this.activeStream = null;
      }
  },

  setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    const mainContentElement = document.querySelector('#main-content');
    if (skipLink && mainContentElement) {
        skipLink.addEventListener('click', (event) => {
            event.preventDefault();
            mainContentElement.focus();
            mainContentElement.scrollIntoView({ behavior: 'smooth' });
        });
    }
  }
};

export default View;