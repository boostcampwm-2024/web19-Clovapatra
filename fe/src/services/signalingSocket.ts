import { io, Socket } from 'socket.io-client';
import {
  SignalingServerToClientEvents,
  SignalingClientToServerEvents,
} from '@/types/socketTypes';
import { SocketService } from './SocketService';

const SIGNALING_URL = 'https://signaling.clovapatra.com';

class SignalingSocket extends SocketService {
  #peerConnections = new Map<string, RTCPeerConnection>();
  #localStream: MediaStream | null = null;

  constructor() {
    super();
  }

  setLocalStream(stream: MediaStream) {
    this.#localStream = stream;
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      withCredentials: true,
    }) as Socket<SignalingServerToClientEvents, SignalingClientToServerEvents>;

    this.setSocket(socket);
    this.#setupEventListeners();
  }

  joinSignalingRoom(roomId: string, userId: string) {
    this.validateSocket();
    console.log('Joining signaling room:', roomId, userId);
    this.socket?.emit('join', { roomId, userId });
  }

  async #createPeerConnection(peerId: string) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
          credential: 'webrtc',
          username: 'webrtc',
        },
      ],
    };

    const pc = new RTCPeerConnection(config);

    // 로컬 스트림 추가
    if (this.#localStream) {
      this.#localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.#localStream!);
      });
    }

    // 원격 스트림 처리
    pc.ontrack = (event) => {
      console.log('Received remote track');
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      document.body.appendChild(audio);
    };

    // ICE 후보 전송
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    this.#peerConnections.set(peerId, pc);
    return pc;
  }

  #setupEventListeners() {
    if (!this.socket) return;

    // 새로운 피어 참여
    this.socket.on('peer-joined', async ({ peerId }) => {
      console.log('New peer joined:', peerId);
      const pc = await this.#createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket?.emit('offer', {
        targetId: peerId,
        sdp: pc.localDescription,
      });
    });

    // Offer 처리
    this.socket.on('offer', async ({ targetId, sdp }) => {
      console.log('Received offer from:', targetId);
      const pc = await this.#createPeerConnection(targetId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket?.emit('answer', {
        targetId,
        sdp: pc.localDescription,
      });
    });

    // Answer 처리
    this.socket.on('answer', async ({ targetId, sdp }) => {
      console.log('Received answer from:', targetId);
      const pc = this.#peerConnections.get(targetId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    // ICE 후보 처리
    this.socket.on('ice-candidate', async ({ targetId, candidate }) => {
      const pc = this.#peerConnections.get(targetId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // 피어 연결 해제
    this.socket.on('peer-left', ({ peerId }) => {
      const pc = this.#peerConnections.get(peerId);
      if (pc) {
        pc.close();
        this.#peerConnections.delete(peerId);
      }
    });
  }

  override disconnect() {
    this.#peerConnections.forEach((pc) => pc.close());
    this.#peerConnections.clear();
    super.disconnect();
  }
}

export const signalingSocket = new SignalingSocket();
