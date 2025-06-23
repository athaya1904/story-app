// src/scripts/router.js
import Presenter from './presenter.js';
import View from './view.js';

function router() {
  View.stopCameraStream();
  Presenter.updateNav();

  const path = window.location.hash;
  const token = sessionStorage.getItem('token');

  if (token) {
    switch (path) {
      case '#/add':
        Presenter.showAddPage();
        break;
      case '#/login':
      case '#/register':
        window.location.hash = '#/';
        break;
      case '#/':
      case '':
        Presenter.showHomePage();
        break;
      default:
        // <-- PERUBAHAN DI SINI
        // Jika URL tidak dikenali, tampilkan halaman Not Found
        Presenter.showNotFoundPage();
        break;
    }
  } else {
    // Logika untuk user yang belum login tidak perlu diubah,
    // default-nya ke halaman login sudah benar.
    switch (path) {
      case '#/register':
        Presenter.showRegisterPage();
        break;
      case '#/login':
      default:
        Presenter.showLoginPage();
        break;
    }
  }
}

export default router;