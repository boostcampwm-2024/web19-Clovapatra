import { io, Socket } from 'socket.io-client';
import { SocketService } from './SocketService';
import { Room } from '@/types/roomTypes';
import {
  ConnectionPlan,
  SignalingData,
  SignalingEvents,
} from '@/types/webrtcTypes';
import { MEDIA_CONSTRAINTS, STUN_SERVERS } from '@/constants/webRTC';
const SIGNALING_URL = 'wss://signaling.clovapatra.com';

class SignalingSocket extends SocketService {
  // WebRTC 연결을 관리하는 객체 - key: peerId, value: RTCPeerConnection
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  // 사용자의 로컬 오디오 스트림을 저장
  private localStream: MediaStream | null = null;
  // WebRTC 연결 초기화 관련 상태
  private roomId: string | null = null;
  private deviceId: string | null = null;

  constructor() {
    super();
  }

  // 시그널링 서버 연결 설정
  connect() {
    if (this.socket?.connected) return;

    const socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      withCredentials: false,
    }) as Socket<SignalingEvents>;

    this.setSocket(socket);
    this.setupEventListeners();
  }

  // 시그널링 서버 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Signaling socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Signaling socket connection error:', error);
    });

    // 서버로부터 방 정보 업데이트 수신
    this.socket.on('room_info', (roomInfo) => {
      console.log('[WebRTCClient] 방 정보 수신:', roomInfo);
      this.handleRoomInfo();
    });

    // 서버로부터 P2P 연결 계획 수신
    this.socket.on('start_connections', (connections) => {
      console.log('[WebRTCClient] 연결 계획 수신:', connections);
      this.handleConnections(connections);
    });

    // WebRTC Offer 수신
    // 다른 피어가 연결을 시도할 때 발생
    this.socket.on('webrtc_offer', async (data) => {
      console.log('[WebRTCClient] Offer 수신:', data);
      await this.handleOffer(data);
    });

    // WebRTC Answer 수신
    // Offer를 보낸 후 상대방의 응답을 받을 때 발생
    this.socket.on('webrtc_answer', async (data) => {
      console.log('[WebRTCClient] Answer 수신:', data);
      await this.handleAnswer(data);
    });

    // ICE Candidate 수신
    // 다른 피어의 네트워크 연결 정보 수신
    this.socket.on('webrtc_ice_candidate', async (data) => {
      console.log('[WebRTCClient] ICE Candidate 수신:', data);
      await this.handleIceCandidate(data);
    });

    // 사용자 연결 해제 이벤트 수신
    this.socket.on('user_disconnected', (socketId) => {
      console.log('[WebRTCClient] 사용자 연결 해제:', socketId);
      this.handleUserDisconnect(socketId);
    });
  }

  /**
   * 방 참가 처리
   * @param room - 참가할 방
   * @throws Error 마이크 접근 실패 시 에러 발생
   */
  async joinRoom(room: Room) {
    this.roomId = room.roomId;
    console.log('[WebRTCClient] 방 참가 시도:', this.roomId);

    try {
      // 로컬 오디오 스트림 설정
      await this.setupLocalStream();

      // 서버에 방 참가 요청 전송
      this.socket.emit('join_room', {
        roomId: this.roomId,
        deviceId: this.deviceId,
        sdp: null, // 초기 연결 시에는 SDP 정보 없음
        candidates: [], // 초기 연결 시에는 ICE candidate 없음
      });

      console.log('[WebRTCClient] 방 참가 요청 전송됨');
    } catch (error) {
      console.error('[WebRTCClient] 방 참가 실패:', error);
      throw error; // 상위로 에러 전파
    }
  }

  /**
   * 로컬 오디오 스트림 설정
   * @throws Error 마이크 접근 권한이 없는 경우
   */
  private async setupLocalStream() {
    console.log('[WebRTCClient] 로컬 스트림 설정 시도');

    try {
      // 마이크 권한 요청 및 스트림 획득
      this.localStream =
        await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);

      // 사용 중인 오디오 트랙의 설정 정보 획득
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.deviceId = audioTrack.getSettings().deviceId;

      console.log(
        '[WebRTCClient] 로컬 스트림 설정 완료, 장치 ID:',
        this.deviceId
      );
    } catch (error) {
      console.error('[WebRTCClient] 마이크 접근 실패:', error);
      throw new Error('마이크 접근 권한이 필요합니다.');
    }
  }

  // 방 정보 업데이트 처리
  private async handleRoomInfo() {
    // 서버에 정보 수신 확인 메시지 전송
    this.socket.emit('room_info_received', this.roomId);
    console.log('[WebRTCClient] 방 정보 수신 확인 전송');
  }

  /**
   * P2P 연결 계획 처리
   * @param connections - 연결 계획 배열
   */
  private async handleConnections(connections: ConnectionPlan[]) {
    console.log('[WebRTCClient] 연결 계획 처리 시작');

    for (const connection of connections) {
      // 자신이 발신자인 연결만 처리
      if (connection.from === this.socket.id) {
        console.log('[WebRTCClient] Offer 생성 시작:', connection.to);
        await this.createOffer(connection.to);
      }
    }
  }

  /**
   * WebRTC Offer 생성 및 전송
   * @param targetId - 연결할 대상의 소켓 ID
   */
  private async createOffer(targetId: string) {
    console.log('[WebRTCClient] Offer 생성 중:', targetId);

    try {
      // 피어 연결 객체 생성
      const pc = await this.createPeerConnection(targetId);

      // Offer SDP 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 시그널링 서버를 통해 Offer 전송
      this.socket.emit('webrtc_offer', {
        toId: targetId,
        sdp: offer,
      });

      console.log('[WebRTCClient] Offer 전송 완료:', targetId);
    } catch (error) {
      console.error('[WebRTCClient] Offer 생성 실패:', error);
      // 연결 실패 시 해당 피어 연결 정리
      this.handleUserDisconnect(targetId);
    }
  }

  /**
   * WebRTC Offer 수신 및 처리
   * @param data - 수신된 Offer 데이터
   */
  private async handleOffer(data: SignalingData) {
    console.log('[WebRTCClient] Offer 처리 중:', data.fromId);

    try {
      // 피어 연결 객체 생성
      const pc = await this.createPeerConnection(data.fromId);

      // 받은 Offer를 Remote Description으로 설정
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

      // Answer SDP 생성
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 시그널링 서버를 통해 Answer 전송
      this.socket.emit('webrtc_answer', {
        toId: data.fromId,
        sdp: answer,
      });

      console.log('[WebRTCClient] Answer 전송 완료:', data.fromId);
    } catch (error) {
      console.error('[WebRTCClient] Offer 처리 실패:', error);
      this.handleUserDisconnect(data.fromId);
    }
  }

  /**
   * WebRTC Answer 수신 및 처리
   * @param data - 수신된 Answer 데이터
   */
  private async handleAnswer(data: SignalingData) {
    console.log('[WebRTCClient] Answer 처리 중:', data.fromId);

    try {
      const pc = this.peerConnections.get(data.fromId);
      if (pc && pc.signalingState !== 'stable') {
        // Remote Description으로 Answer 설정
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('[WebRTCClient] Answer 처리 완료:', data.fromId);
      }
    } catch (error) {
      console.error('[WebRTCClient] Answer 처리 실패:', error);
      this.handleUserDisconnect(data.fromId);
    }
  }

  /**
   * ICE Candidate 수신 및 처리
   * @param data - 수신된 ICE candidate 데이터
   */
  private async handleIceCandidate(data: SignalingData) {
    console.log('[WebRTCClient] ICE Candidate 처리 중:', data.fromId);

    try {
      const pc = this.peerConnections.get(data.fromId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('[WebRTCClient] ICE Candidate 추가 완료:', data.fromId);
      }
    } catch (error) {
      console.error('[WebRTCClient] ICE Candidate 처리 실패:', error);
    }
  }

  /**
   * WebRTC Peer Connection 생성
   * @param peerId - 연결할 피어의 소켓 ID
   * @returns 생성된 peer connection 객체
   */
  private async createPeerConnection(peerId: string) {
    console.log('[WebRTCClient] Peer Connection 생성 중:', peerId);

    // 이미 존재하는 연결이 있다면 재사용
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId);
    }

    // 새로운 RTCPeerConnection 생성
    const pc = new RTCPeerConnection(STUN_SERVERS);
    this.peerConnections.set(peerId, pc);

    // 로컬 미디어 스트림 추가
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
        console.log('[WebRTCClient] 로컬 트랙 추가됨:', track.kind);
      });
    }

    // 원격 스트림 수신 이벤트 처리
    pc.ontrack = ({ streams: [stream] }) => {
      console.log('[WebRTCClient] 원격 트랙 수신됨:', peerId);
      this.handleRemoteStream(stream, peerId);
    };

    // ICE Candidate 생성 이벤트 처리
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTCClient] ICE Candidate 생성됨:', peerId);
        this.socket.emit('webrtc_ice_candidate', {
          toId: peerId,
          candidate: event.candidate,
        });
      }
    };

    // 연결 상태 모니터링
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[WebRTCClient] 연결 상태 변경 (${peerId}):`, state);

      // 연결이 실패하거나 종료된 경우
      if (state === 'failed' || state === 'closed') {
        this.handleUserDisconnect(peerId);
      }
    };

    // ICE 연결 상태 모니터링
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log(`[WebRTCClient] ICE 연결 상태 변경 (${peerId}):`, state);

      // ICE 연결이 실패하거나 연결이 끊긴 경우
      if (state === 'failed' || state === 'disconnected') {
        this.handleUserDisconnect(peerId);
      }
    };

    return pc;
  }

  /**
   * 원격 미디어 스트림 처리
   * @param stream - 수신된 미디어 스트림
   * @param peerId - 스트림을 보낸 피어의 소켓 ID
   */
  private handleRemoteStream(stream: MediaStream, peerId: string) {
    console.log('[WebRTCClient] 원격 스트림 처리:', peerId);

    const audioId = `audio-${peerId}`;
    const existingAudio = document.getElementById(
      audioId
    ) as HTMLAudioElement | null;

    if (existingAudio) {
      existingAudio.remove();
    }

    const audioElement = new Audio();
    audioElement.id = audioId;
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    document.body.appendChild(audioElement);

    console.log('[WebRTCClient] 오디오 엘리먼트 생성 완료:', audioId);
  }

  /**
   * 사용자 연결 해제 처리
   * @param socketId - 연결 해제된 사용자의 소켓 ID
   */
  private handleUserDisconnect(socketId: string) {
    console.log('[WebRTCClient] 사용자 연결 해제 처리:', socketId);

    // Peer Connection 정리
    if (this.peerConnections.has(socketId)) {
      const pc = this.peerConnections.get(socketId);
      pc.close();
      this.peerConnections.delete(socketId);
    }

    // 오디오 엘리먼트 제거
    const audioElement = document.getElementById(`audio-${socketId}`);
    if (audioElement) {
      audioElement.remove();
    }

    console.log('[WebRTCClient] 연결 해제 처리 완료:', socketId);
  }

  // 방 나가기 및 모든 연결 종료
  leaveRoom() {
    console.log('[WebRTCClient] 방 나가기 시작');

    // 모든 피어 연결 종료
    for (const [peerId, pc] of this.peerConnections) {
      pc.close();
      const audioElement = document.getElementById(`audio-${peerId}`);
      if (audioElement) {
        audioElement.remove();
      }
    }

    this.peerConnections.clear();

    // 로컬 스트림 정리
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // 소켓 연결 해제
    if (this.socket) {
      this.socket.disconnect();
    }

    this.roomId = null;
    this.deviceId = null;

    console.log('[WebRTCClient] 방 나가기 완료');
  }
}

export const signalingSocket = new SignalingSocket();
