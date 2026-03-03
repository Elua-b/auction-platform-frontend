import { io } from "socket.io-client";

const SOCKET_URL = "https://auction-platform-backend-uvjo.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
