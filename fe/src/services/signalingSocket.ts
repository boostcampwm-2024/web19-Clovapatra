import { io, Socket } from 'socket.io-client';
import {
  SignalingServerToClientEvents,
  SignalingClientToServerEvents,
} from '@/types/socketTypes';
import { SocketService } from './SocketService';

const SIGNALING_URL = 'https://signaling.clovapatra.com';

class SignalingSocket extends SocketService {
  #peerConnections: Record<string, RTCPeerConnection> = {};
  #iceCandidateQueue = new Map<string, RTCIceCandidate[]>();

  constructor() {
    super();
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      withCredentials: true,
    }) as Socket<SignalingServerToClientEvents, SignalingClientToServerEvents>;

    this.setSocket(socket);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Signaling socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Signaling socket connection error:', error);
    });

    this.socket.on('joinSuccess', () => {
      console.log('Successfully joined signaling room');
    });

    this.socket.on('peer-joined', async ({ peerId, userId }) => {
      try {
        const pc = await this.createPeerConnection(peerId);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);

        this.socket?.emit('offer', {
          targetId: peerId,
          sdp: pc.localDescription!,
        });
      } catch (error) {
        console.error('Error handling peer joined:', error);
      }
    });

    this.socket.on('offer', async ({ targetId, sdp }) => {
      try {
        let pc = this.#peerConnections[targetId];

        if (!pc) {
          pc = await this.createPeerConnection(targetId);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.socket?.emit('answer', {
          targetId: targetId,
          sdp: pc.localDescription!,
        });

        // Process queued ICE candidates
        if (this.#iceCandidateQueue.has(targetId)) {
          const candidates = this.#iceCandidateQueue.get(targetId)!;
          for (const candidate of candidates) {
            await pc.addIceCandidate(candidate);
          }
          this.#iceCandidateQueue.delete(targetId);
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    this.socket.on('answer', async ({ targetId, sdp }) => {
      try {
        const pc = this.#peerConnections[targetId];
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        // Process queued ICE candidates
        if (this.#iceCandidateQueue.has(targetId)) {
          const candidates = this.#iceCandidateQueue.get(targetId)!;
          for (const candidate of candidates) {
            await pc.addIceCandidate(candidate);
          }
          this.#iceCandidateQueue.delete(targetId);
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    this.socket.on('ice-candidate', async ({ targetId, candidate }) => {
      try {
        const pc = this.#peerConnections[targetId];
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          if (!this.#iceCandidateQueue.has(targetId)) {
            this.#iceCandidateQueue.set(targetId, []);
          }
          this.#iceCandidateQueue
            .get(targetId)
            ?.push(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    this.socket.on('peer-left', ({ peerId }) => {
      this.cleanupPeerConnection(peerId);
    });
  }

  private async createPeerConnection(
    peerId: string
  ): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
          credential: 'webrtc',
          username: 'webrtc',
        },
      ],
      iceCandidatePoolSize: 0,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all',
    };

    const pc = new RTCPeerConnection(configuration);

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state: ${pc.connectionState}`);
    };

    pc.onsignalingstatechange = () => {
      console.log(`Signaling state: ${pc.signalingState}`);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      try {
        const audioElement = new Audio();
        audioElement.autoplay = true;
        audioElement.srcObject = event.streams[0];
        document.body.appendChild(audioElement);

        console.log('Audio element created and playing');
      } catch (error) {
        console.error('Error setting up audio element:', error);
      }
    };

    this.#peerConnections[peerId] = pc;
    return pc;
  }

  joinSignalingRoom(roomId: string, userId: string) {
    this.validateSocket();
    this.socket?.emit('join', { roomId, userId });
  }

  private cleanupPeerConnection(peerId: string) {
    const pc = this.#peerConnections[peerId];
    if (pc) {
      pc.close();
      delete this.#peerConnections[peerId];
    }
  }

  override disconnect() {
    Object.keys(this.#peerConnections).forEach(
      this.cleanupPeerConnection.bind(this)
    );
    super.disconnect();
  }
}

export const signalingSocket = new SignalingSocket();
