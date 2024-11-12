import { Socket } from 'socket.io-client';

export class SocketService {
  #socket: Socket | undefined;

  constructor() {
    this.#socket = undefined;
  }

  get socket(): Socket | undefined {
    return this.#socket;
  }

  setSocket(socket: Socket) {
    this.#socket = socket;
  }

  isConnected() {
    return !this.#socket?.connected;
  }

  disconnect() {
    if (!this.#socket?.connected) return;
    this.#socket.disconnect();
    this.#socket = undefined;
  }
}
