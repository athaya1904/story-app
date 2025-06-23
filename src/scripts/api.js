// src/scripts/api.js

const Api = {
  ENDPOINT: "https://story-api.dicoding.dev/v1",

  async registerUser(name, email, password) {
    const response = await fetch(`${this.ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson;
  },

  async loginUser(email, password) {
    const response = await fetch(`${this.ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson.loginResult;
  },

  async getStories(token) {
    const response = await fetch(`${this.ENDPOINT}/stories?size=20`, { // Menampilkan lebih banyak cerita
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson.listStory;
  },

  async addStory(token, formData) {
    const response = await fetch(`${this.ENDPOINT}/stories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson;
  }
};

export default Api;