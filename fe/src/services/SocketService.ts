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

  validateSocket() {
    if (!this.#socket) {
      throw new Error('Socket connection not established');
    }
  }

  disconnect() {
    if (!this.#socket?.connected) return;
    this.#socket.disconnect();
    this.#socket = undefined;
  }
}
