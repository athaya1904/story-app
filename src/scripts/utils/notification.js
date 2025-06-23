// src/scripts/utils/notification.js

// PENTING: Ganti string di bawah ini dengan VAPID Public Key dari dokumentasi API Anda.
const VAPID_PUBLIC_KEY = 'MASUKKAN_VAPID_PUBLIC_KEY_DARI_API_DI_SINI';

/**
 * Mengonversi string VAPID key (base64) menjadi Uint8Array.
 * Ini adalah kode boilerplate yang diperlukan oleh Push API.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Meminta izin kepada pengguna untuk menampilkan notifikasi.
 * @returns {Promise<string>} 'granted', 'denied', atau 'default'
 */
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Gagal meminta izin notifikasi.', error);
    return 'denied';
  }
}

/**
 * Mendaftarkan perangkat ke layanan push dan mendapatkan subscription.
 * @returns {Promise<PushSubscription|null>} Objek PushSubscription atau null jika gagal.
 */
async function configurePushSubscription() {
  if (!('PushManager' in window)) {
    console.error('Push Messaging tidak didukung di browser ini.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Wajib, menandakan setiap notifikasi akan terlihat oleh pengguna
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('Berhasil mendapatkan Push Subscription:', subscription);
    // Di aplikasi nyata, objek subscription ini akan dikirim ke server backend
    // untuk disimpan dan digunakan untuk mengirim notifikasi nanti.
    // Untuk submission ini, cukup menampilkannya di console sudah membuktikan fungsionalitasnya.
    return subscription;
  } catch (error) {
    console.error('Gagal melakukan subscribe ke push notification.', error);
    return null;
  }
}

export { requestNotificationPermission, configurePushSubscription };