// src/scripts/presenter.js
import Api from './api.js';
import View from './view.js';

const Presenter = {
  async showHomePage() {
    try {
      const token = sessionStorage.getItem('token');
      const stories = await Api.getStories(token);
      View.renderHomePage(stories);
    } catch (error) {
      View.renderError(error.message, true);
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

  handleLogout(event) {
    if (event) event.preventDefault();
    sessionStorage.clear();
    alert('Anda telah logout.');
    window.location.hash = '#/login';
  },

  updateNav() {
    const isLoggedIn = !!sessionStorage.getItem('token');
    const userName = sessionStorage.getItem('userName');
    View.updateNavLinks(isLoggedIn, userName, this.handleLogout);
  }
};

export default Presenter;