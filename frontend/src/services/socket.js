// services/socket.js
import { io } from 'socket.io-client';
const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const socket = io(API_BASE, { transports: ['websocket'] });
