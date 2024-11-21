const io = require("socket.io-client");

class GameServerService {
  constructor(gameServerUrl, redis, expireTime) {
    this.gameServerUrl = gameServerUrl;
    this.redis = redis;
    this.socket = null;
    this.expireTime = expireTime;
  }

  initialize() {
    this.socket = require("socket.io-client")(this.gameServerUrl, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("Connected to game server");
      // 음성 처리 서버로 등록
      this.socket.emit("registerVoiceServer");
    });

    this.socket.on("turnChanged", async (data) => {
      console.log("Received turnChanged event:", data);

      try {
        const redisKey = `turn:${data.roomId}:${data.playerNickname}`;

        await this.redis.hset(redisKey, {
          gameMode: data.gameMode,
          lyrics: data.lyrics || "",
          timeLimit: data.timeLimit,
          timestamp: Date.now(),
        });

        await this.redis.expire(redisKey, this.expireTime);

        await this.redis.publish(
          "turnUpdate",
          JSON.stringify({
            type: "turnChanged",
            data: { roomId: data.roomId, playerNickname: data.playerNickname },
          })
        );

        console.log("Turn data saved:", redisKey);
      } catch (error) {
        console.error("Error in turn changed handler:", error);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Game server connection error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from game server:", reason);
    });
  }

  sendVoiceResult(result) {
    if (!this.socket) {
      console.error("Game server socket not initialized");
      return;
    }

    if (!this.socket.connected) {
      console.error("Game server socket not connected");
      return;
    }

    try {
      this.socket.emit("voiceResult", result);
      console.log("Voice result sent to game server:", result);
    } catch (error) {
      console.error("Error sending voice result:", error);
    }
  }
}
module.exports = GameServerService;
