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
      default:
        Presenter.showHomePage();
        break;
    }
  } else {
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