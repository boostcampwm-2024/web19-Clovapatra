export const ENV = {
  GAME_SERVER_URL: import.meta.env.VITE_GAME_SERVER_URL,
  SIGNALING_SERVER_URL: import.meta.env.VITE_SIGNALING_SERVER_URL,
  VOICE_SERVER_URL: import.meta.env.VITE_VOICE_SERVER_URL,
  STUN_SERVERS: {
    iceServers: [
      {
        urls: import.meta.env.VITE_STUN_SERVER,
      },
      {
        urls: import.meta.env.VITE_TURN_SERVER,
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL,
      },
    ],
  },
  SSE_URL: import.meta.env.VITE_GAME_SSE_URL,
  REST_BASE_URL: import.meta.env.VITE_GAME_REST_BASE_URL,
};
