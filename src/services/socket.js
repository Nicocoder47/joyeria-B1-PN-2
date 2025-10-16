import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(URL);

// Exponer en window para pruebas rápidas desde consola
if (typeof window !== 'undefined') {
	window.socket = socket;
}

export default socket;
