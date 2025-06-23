// src/scripts/utils/db.js

import { openDB } from 'idb';

const DATABASE_NAME = 'story-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

// Membuat atau membuka database
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    // Membuat object store (seperti tabel di SQL) bernama 'stories'
    // dengan 'id' sebagai primary key.
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

// Membuat modul untuk berinteraksi dengan database
const StoryDb = {
  /**
   * Mengambil semua cerita dari IndexedDB.
   */
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  /**
   * Menyimpan satu cerita ke dalam IndexedDB.
   * @param {object} story - Objek cerita yang akan disimpan.
   */
  async putStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  /**
   * Menyimpan banyak cerita sekaligus ke dalam IndexedDB.
   * @param {Array<object>} stories - Array berisi objek cerita.
   */
  async putAllStories(stories) {
    if (!stories || stories.length === 0) return;
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    for (const story of stories) {
      store.put(story);
    }
    return tx.done;
  },
  
  /**
   * Menghapus satu cerita dari IndexedDB berdasarkan id.
   * @param {string} id - ID dari cerita yang akan dihapus.
   */
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  /**
   * Menghapus semua cerita dari IndexedDB.
   */
  async clearAllStories() {
    return (await dbPromise).clear(OBJECT_STORE_NAME);
  }
};

export default StoryDb;