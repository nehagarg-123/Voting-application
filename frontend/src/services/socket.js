import { io } from "socket.io-client";

// Connect to backend
export const socket = io("https://voting-application-5wm0.onrender.com", {
  transports: ["websocket"] // Ensures stable connection
});
