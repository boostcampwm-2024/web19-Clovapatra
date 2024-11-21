// 시그널링 서버 이벤트 타입
export interface SignalingData {
  fromId: string;
  toId: string;
  sdp?: RTCSessionDescription;
  candidate?: RTCIceCandidate;
}

export interface ConnectionPlan {
  from: string;
  to: string;
}

export interface SignalingEvents {
  start_connections: (connections: ConnectionPlan[]) => void;
  start_call: (data: { fromId: string }) => void;
  webrtc_offer: (data: {
    fromId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;
  webrtc_answer: (data: {
    fromId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;
  webrtc_ice_candidate: (data: {
    fromId: string;
    candidate: RTCIceCandidateInit;
  }) => void;
  user_disconnected: (userId: string) => void;
}
