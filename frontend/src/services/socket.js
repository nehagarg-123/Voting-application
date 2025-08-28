import { io } from "socket.io-client";

// Connect to backend
export const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket"] // Ensures stable connection
});
