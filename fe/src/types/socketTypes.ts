import { Room } from './roomTypes';

// 게임 서버 이벤트 타입
export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  updateUsers: (players: string[]) => void;
  error: (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { roomName: string; hostNickname: string }) => void;
  joinRoom: (data: { roomId: string; playerNickname: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
}

// 시그널링 서버 이벤트 타입
export interface SignalingServerToClientEvents {
  joinSuccess: () => void;
  'peer-joined': (data: { peerId: string; userId: string }) => void;
  'peer-left': (data: { peerId: string }) => void;
  offer: (data: { targetId: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (data: { targetId: string; sdp: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: {
    targetId: string;
    candidate: RTCIceCandidateInit;
  }) => void;
}

export interface SignalingClientToServerEvents {
  join: (data: { roomId: string; userId: string }) => void;
  leave: (data: { roomId: string }) => void;
  offer: (data: { targetId: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (data: { targetId: string; sdp: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: {
    targetId: string;
    candidate: RTCIceCandidateInit;
  }) => void;
}
