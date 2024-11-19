class SocketService {
  constructor(io, audioProcessingService, redis) {
    this.io = io;
    this.audioProcessingService = audioProcessingService;
    this.redis = redis;
  }

  initialize() {
    this.io.on("connection", async (socket) => {
      console.log("Client connected:", socket.id, "Worker:", process.pid);

      const { roomId, playerNickname } = socket.handshake.query;
      let audioChunks = [];
      let currentSession = null;

      try {
        // 연결 시점에 세션 검증
        const turnData = await this.redis.hgetall(`turn:${roomId}:${playerNickname}`);

        if (!turnData || Object.keys(turnData).length === 0) {
          console.log("No turn data found:", roomId, playerNickname);
          socket.emit("error", { message: "Invalid session" });
          socket.disconnect(true);
          return;
        }

        currentSession = {
          roomId,
          playerNickname,
          gameMode: turnData.gameMode,
          lyrics: turnData.lyrics,
          timeLimit: parseInt(turnData.timeLimit),
        };

        console.log("Session validated:", currentSession);
      } catch (error) {
        console.error("Session validation error:", error);
        socket.emit("error", { message: "Session validation failed" });
        socket.disconnect(true);
        return;
      }

      socket.on("start_recording", () => {
        console.log("Recording started for session:", currentSession);
        audioChunks = [];
      });

      socket.on("audio_data", (data) => {
        if (!currentSession) return;

        const buffer = Buffer.from(data);
        audioChunks.push(buffer);
      });

      socket.on("disconnect", async () => {
        console.log("Client disconnected:", socket.id, "Worker:", process.pid);

        if (!currentSession || audioChunks.length === 0) {
          console.log("No valid session or audio data");
          return;
        }

        try {
          await this.audioProcessingService.processAudio(audioChunks, currentSession);
          await this.redis.del(`turn:${currentSession.roomId}:${currentSession.playerNickname}`);
          console.log("Audio processing completed for session:", currentSession);
        } catch (error) {
          console.error("Processing error:", error);
        } finally {
          audioChunks = [];
          currentSession = null;
        }
      });
    });
  }
}

module.exports = SocketService;
