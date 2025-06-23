// src/scripts/presenter.js

import Api from './api.js';
import View from './view.js';
import StoryDb from './utils/db.js';
import { requestNotificationPermission, configurePushSubscription } from './utils/notification.js'; // <-- PERUBAHAN 1: Import baru

const Presenter = {
  // PERUBAHAN 2: showHomePage sekarang meneruskan handler untuk tombol hapus cache
  async showHomePage() {
    try {
      const token = sessionStorage.getItem('token');
      const storiesFromApi = await Api.getStories(token);
      await StoryDb.putAllStories(storiesFromApi);
      View.renderHomePage(storiesFromApi, this.handleClearCache.bind(this)); // <-- Meneruskan handler
      console.log('Data ditampilkan dari API');
    } catch (error) {
      console.log("Gagal mengambil data dari API. Mencoba dari database lokal.", error);
      try {
        const storiesFromDb = await StoryDb.getAllStories();
        if (!storiesFromDb || storiesFromDb.length === 0) {
          View.renderError("Tidak ada data yang tersimpan untuk ditampilkan saat offline.", true);
        } else {
          View.renderHomePage(storiesFromDb, this.handleClearCache.bind(this)); // <-- Meneruskan handler
          console.log('Data ditampilkan dari IndexedDB');
        }
      } catch (dbError) {
        View.renderError(`Gagal mengambil data dari mana pun: ${dbError.message}`, true);
      }
    }
  },

  showLoginPage() {
    const handleLogin = async (event) => {
      event.preventDefault();
      const form = event.target;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true; button.textContent = 'Logging in...';
      try {
        const result = await Api.loginUser(form.elements.email.value, form.elements.password.value);
        if (result && result.token) {
          sessionStorage.setItem('token', result.token);
          sessionStorage.setItem('userName', result.name);
          alert('Login berhasil!');
          window.location.hash = '#/';
        }
      } catch (error) {
        alert(`Gagal login: ${error.message}`);
      } finally {
        button.disabled = false; button.textContent = 'Login';
      }
    };
    View.renderLoginPage(handleLogin);
  },

  showRegisterPage() {
    const handleRegister = async (event) => {
      event.preventDefault();
      const form = event.target;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true; button.textContent = 'Mendaftar...';
      try {
        await Api.registerUser(form.elements.name.value, form.elements.email.value, form.elements.password.value);
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '#/login';
      } catch (error) {
        alert(`Gagal mendaftar: ${error.message}`);
      } finally {
        button.disabled = false; button.textContent = 'Register';
      }
    };
    View.renderRegisterPage(handleRegister);
  },
  
  showAddPage() {
    const handleAdd = (event) => {
      event.preventDefault();
      const form = event.target;
      const canvas = document.querySelector('#photo-canvas');
      const captureButton = document.querySelector('#capture-button');
      const submitButton = form.querySelector('button[type="submit"]');
      if (captureButton.getAttribute('data-taken') !== 'true' || !form.elements.lat.value) {
          alert('Harap ambil foto dan pilih lokasi pada peta.'); return;
      }
      submitButton.disabled = true; submitButton.textContent = 'Mengirim...';
      canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append('description', form.elements.description.value);
          formData.append('photo', blob, 'story.jpg');
          formData.append('lat', form.elements.lat.value);
          formData.append('lon', form.elements.lon.value);
          try {
            await Api.addStory(sessionStorage.getItem('token'), formData);
            window.location.hash = '#/';
          } catch (error) {
            alert(`Gagal menambah cerita: ${error.message}`);
          } finally {
            submitButton.disabled = false; submitButton.textContent = 'Kirim Cerita';
          }
      }, 'image/jpeg');
    };
    View.renderAddPage(handleAdd);
  },

  // <-- PERUBAHAN 3: Fungsi baru untuk menangani Halaman Not Found
  showNotFoundPage() {
    View.renderNotFoundPage();
  },

  // <-- PERUBAHAN 4: Fungsi baru untuk menangani logika klik tombol Hapus Cache
  async handleClearCache(event) {
    event.preventDefault();
    try {
      await StoryDb.clearAllStories();
      alert('Cache cerita offline telah berhasil dihapus!');
      location.reload(); // Reload halaman untuk melihat efeknya
    } catch (error) {
      alert('Gagal menghapus cache.');
      console.error(error);
    }
  },

  // <-- PERUBAHAN 5: Fungsi baru untuk menangani logika klik tombol Notifikasi
  async handleEnableNotification(event) {
    event.preventDefault();
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await configurePushSubscription();
        alert('Notifikasi berhasil diaktifkan!');
      } else {
        alert('Izin untuk notifikasi tidak diberikan.');
      }
    } catch (error) {
      console.error('Gagal mengaktifkan notifikasi', error);
      alert('Gagal mengaktifkan notifikasi.');
    }
  },

  handleLogout(event) {
    if (event) event.preventDefault();
    sessionStorage.clear();
    alert('Anda telah logout.');
    window.location.hash = '#/login';
  },

  // <-- PERUBAHAN 6: updateNav sekarang meneruskan handler untuk tombol notifikasi
  updateNav() {
    const isLoggedIn = !!sessionStorage.getItem('token');
    const userName = sessionStorage.getItem('userName');
    View.updateNavLinks(isLoggedIn, userName, this.handleLogout.bind(this), this.handleEnableNotification.bind(this));
  }
};

export default Presenter;