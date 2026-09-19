import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error('VITE_API_URL is not defined. Copy client/.env.example to client/.env and restart Vite.');
}

// The single Axios instance for the whole app.
// withCredentials makes the browser send and accept the httpOnly auth cookie on cross-origin requests.
// The token itself is never visible to JavaScript.
export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});