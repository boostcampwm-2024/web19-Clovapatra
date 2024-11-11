import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { Room } from '@/types/roomTypes';
import { SocketService } from './SocketService';
import { cleanupAudioStream, requestAudioStream } from './audioRequest';
import useRoomStore from '@/stores/zustand/useRoomStore';

const GAME_SOCKET_URL = 'wss://game.clovapatra.com/rooms';

interface AudioSetup {
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  gainNode: GainNode;
}

class GameSocket extends SocketService {
  #audioStream: MediaStream | null = null;
  #audioSetup: AudioSetup | null = null;

  constructor() {
    super();
  }

  async setupAudioStream(): Promise<MediaStream> {
    try {
      if (this.#audioStream) {
        return this.#audioStream;
      }

      const stream = await requestAudioStream();
      this.#audioStream = stream;

      // 오디오 설정
      this.#audioSetup = await this.#setupAudio(stream);

      return stream;
    } catch (error) {
      console.error('Failed to setup audio stream:', error);
      throw error;
    }
  }

  async #setupAudio(stream: MediaStream): Promise<AudioSetup> {
    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 기본 볼륨 설정
      gainNode.gain.value = 0.5;

      return {
        audioContext,
        source,
        gainNode,
      };
    } catch (error) {
      console.error('Error setting up audio:', error);
      throw error;
    }
  }

  setAudioVolume(volume: number) {
    if (this.#audioSetup) {
      this.#audioSetup.gainNode.gain.value = volume;
    }
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(GAME_SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    this.setSocket(socket);
    this.#setupEventListeners();
  }

  async createRoom(roomName: string, hostNickname: string) {
    this.validateSocket();
    const stream = await this.setupAudioStream();
    this.socket?.emit('createRoom', { roomName, hostNickname });
    return stream;
  }

  async joinRoom(roomId: string, playerNickname: string) {
    this.validateSocket();
    const stream = await this.setupAudioStream();
    this.socket?.emit('joinRoom', { roomId, playerNickname });
    return stream;
  }

  #setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Game socket connected');
    });

    this.socket.on('roomCreated', async (room: Room) => {
      try {
        const store = useRoomStore.getState();
        store.setRooms([...store.rooms, room]);
        store.setCurrentRoom(room);
      } catch (error) {
        console.error('Failed to update rooms:', error);
      }
    });

    this.socket.on('updateUsers', (players: string[]) => {
      try {
        const store = useRoomStore.getState();
        const { currentRoom } = store;

        if (currentRoom) {
          store.setCurrentRoom({
            ...currentRoom,
            players,
            hostNickname: players[0],
          });
        }
      } catch (error) {
        console.error('Failed to update users:', error);
      }
    });
  }

  cleanupAudio() {
    if (this.#audioStream) {
      cleanupAudioStream(this.#audioStream);
      this.#audioStream = null;
    }
    if (this.#audioSetup) {
      this.#audioSetup.audioContext.close();
      this.#audioSetup = null;
    }
  }

  override disconnect() {
    this.cleanupAudio();
    super.disconnect();
  }
}

export const gameSocket = new GameSocket();
