import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:3000";

export const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ['polling', 'websocket'], // Force polling first fallback
});
