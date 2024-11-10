import { io, Socket } from 'socket.io-client';
import { requestAudioStream, cleanupAudioStream } from './audioRequest';
import { Room } from '@/types/roomTypes';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SignalingServerToClientEvents,
  SignalingClientToServerEvents,
} from '@/types/socketTypes';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useRoomActions } from '@/hooks/useRoomActions';
import { getRooms } from './api';

const SOCKET_BASE_URL = 'wss://game.clovapatra.com';
const SIGNALING_URL = 'https://signaling.clovapatra.com';

interface JoinGameRoomResult {
  room: Room;
  stream: MediaStream;
}

// 게임 서버 소켓
const gameSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${SOCKET_BASE_URL}/rooms`,
  {
    transports: ['websocket'],
    withCredentials: true,
  }
);

// 시그널링 서버 소켓
const signalingSocket: Socket<
  SignalingServerToClientEvents,
  SignalingClientToServerEvents
> = io(SIGNALING_URL, {
  transports: ['websocket'],
  withCredentials: true,
});

// WebRTC 설정
const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
    {
      urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
      credential: 'webrtc',
      username: 'webrtc',
    },
  ],
  // iceCandidatePoolSize가 필요한 경우에만 추가
  iceCandidatePoolSize: 0,
  // RTCConfiguration에 있는 옵션들만 사용
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // iceTransportPolicy는 'all' | 'relay' 중 하나만 가능
  iceTransportPolicy: 'all',
};

let peerConnections: Record<string, RTCPeerConnection> = {};
let localStream: MediaStream | null = null;
let currentRoomId: string | null = null;
let currentUserId: string | null = null;

export const createRoom = async (
  roomName: string,
  hostNickname: string
): Promise<Room> => {
  try {
    // 1. 오디오 스트림 요청
    const stream = await requestAudioStream();
    localStream = stream;

    return new Promise((resolve, reject) => {
      // 2. 방 생성 요청
      gameSocket.emit('createRoom', { roomName, hostNickname });

      const handleRoomCreated = (room: Room) => {
        currentRoomId = room.roomId;
        currentUserId = hostNickname;

        // 3. 시그널링 서버 조인
        signalingSocket.emit('join', {
          roomId: room.roomId,
          userId: hostNickname,
        });

        cleanup();
        resolve(room);
      };

      const handleError = (error: { code: string; message: string }) => {
        cleanup();
        cleanupAudioStream(stream);
        reject(error);
      };

      const cleanup = () => {
        gameSocket.off('roomCreated', handleRoomCreated);
        gameSocket.off('error', handleError);
      };

      gameSocket.on('roomCreated', handleRoomCreated);
      gameSocket.on('error', handleError);
    });
  } catch (error) {
    console.error('방 생성 실패:', error);
    throw error;
  }
};

export const joinRoom = async (
  roomId: string,
  playerNickname: string
): Promise<JoinGameRoomResult> => {
  try {
    // 1. 오디오 스트림 요청
    const stream = await requestAudioStream();
    localStream = stream;

    return new Promise((resolve, reject) => {
      let isResolved = false;

      const handleUpdateUsers = (players: string[]) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();

          const room: Room = {
            roomId,
            roomName: `Room ${roomId}`,
            hostNickname: players[0],
            players: players,
            status: 'waiting',
          };

          currentRoomId = roomId;
          currentUserId = playerNickname;

          // 시그널링 서버 조인
          signalingSocket.emit('join', {
            roomId: roomId,
            userId: playerNickname,
          });

          resolve({
            room,
            stream,
          });
        }
      };

      const handleError = (error: { code: string; message: string }) => {
        cleanup();
        cleanupAudioStream(stream);
        reject(error);
      };

      const cleanup = () => {
        gameSocket.off('updateUsers', handleUpdateUsers);
        gameSocket.off('error', handleError);
      };

      gameSocket.on('updateUsers', handleUpdateUsers);
      gameSocket.on('error', handleError);

      gameSocket.emit('joinRoom', { roomId, playerNickname });
    });
  } catch (error) {
    console.error('방 참가 실패:', error);
    throw error;
  }
};

// WebRTC 관련 함수들
async function createPeerConnection(
  peerId: string
): Promise<RTCPeerConnection> {
  try {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingSocket.emit('ice-candidate', {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const audioElement = new Audio();
      audioElement.autoplay = true;
      audioElement.srcObject = event.streams[0];
      document.body.appendChild(audioElement);
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream!);
      });
    }

    peerConnections[peerId] = pc;
    return pc;
  } catch (error) {
    console.error('Error creating peer connection:', error);
    throw error;
  }
}

// 시그널링 이벤트 핸들러 설정
signalingSocket.on('joinSuccess', () => {
  console.log('Successfully joined signaling room');
});

signalingSocket.on('peer-joined', async ({ peerId, userId }) => {
  console.log('New peer joined:', { peerId, userId });
  if (currentUserId && currentUserId < userId) {
    const pc = await createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalingSocket.emit('offer', {
      targetId: peerId,
      sdp: pc.localDescription!,
    });
  }
});

signalingSocket.on('offer', async ({ targetId, sdp }) => {
  const pc = await createPeerConnection(targetId);
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  signalingSocket.emit('answer', {
    targetId: targetId,
    sdp: pc.localDescription!,
  });
});

signalingSocket.on('answer', async ({ targetId, sdp }) => {
  const pc = peerConnections[targetId];
  if (pc) {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }
});

signalingSocket.on('ice-candidate', async ({ targetId, candidate }) => {
  const pc = peerConnections[targetId];
  if (pc) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

signalingSocket.on('peer-left', ({ peerId }) => {
  const pc = peerConnections[peerId];
  if (pc) {
    pc.close();
    delete peerConnections[peerId];
  }
});

// 소켓 연결 상태 모니터링
gameSocket.on('connect', () => {
  console.log('Game socket connected');
});

signalingSocket.on('connect', () => {
  console.log('Signaling socket connected');
});

gameSocket.on('connect_error', (error) => {
  console.error('Game socket connection error:', error);
});

signalingSocket.on('connect_error', (error) => {
  console.error('Signaling socket connection error:', error);
});

gameSocket.on('roomCreated', async (room: Room) => {
  console.log('Room created event received:', room);

  try {
    if (currentRoomId === room.roomId) {
      const store = useRoomStore.getState();
      store.setCurrentRoom(room);
    }
    // 전체 방 목록 갱신
    const rooms = await getRooms();
    useRoomStore.getState().setRooms(rooms);
  } catch (error) {
    console.error('방 목록 갱신 실패:', error);
  }
});

gameSocket.on('updateUsers', async (players: string[]) => {
  console.log('Update users event received:', players);

  const store = useRoomStore.getState();
  const currentRoom = store.currentRoom;

  if (currentRoom) {
    const updatedRoom = {
      ...currentRoom,
      players,
      hostNickname: players[0],
    };
    store.setCurrentRoom(updatedRoom);
  }

  // 전체 방 목록도 갱신
  try {
    const rooms = await getRooms();
    store.setRooms(rooms);
  } catch (error) {
    console.error('방 목록 갱신 실패:', error);
  }
});
