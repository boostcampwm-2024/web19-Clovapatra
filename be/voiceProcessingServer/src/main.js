const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  require("dotenv").config();
  const express = require("express");
  const http = require("http");
  const Redis = require("ioredis");
  const { createAdapter } = require("@socket.io/redis-adapter");
  const { Server } = require("socket.io");

  // Environment variables
  const PORT = process.env.PORT || 8002;
  const CLOVA_API_KEY = process.env.CLOVA_API_KEY;
  const CLOVA_API_URL = process.env.CLOVA_API_URL;
  const GAME_SERVER_URL = process.env.GAME_SERVER_URL;
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = process.env.REDIS_PORT;
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

  const app = express();
  const server = http.createServer(app);

  // Redis pub/sub clients for Socket.IO adapter
  const pubClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });

  const subClient = pubClient.duplicate();

  // Redis client for data storage
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });

  // Create Socket.IO server with Redis adapter
  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket"],
    upgrade: false,
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Services initialization
  const AudioService = require("./services/audio.service");
  const SpeechRecognitionService = require("./services/speech-recognition.service");
  const PitchDetectionService = require("./services/pitch-detection.service");
  const AudioProcessingService = require("./services/audio-processing.service");
  const SocketService = require("./services/socket.service");

  const audioService = new AudioService();
  const speechRecognitionService = new SpeechRecognitionService(CLOVA_API_KEY, CLOVA_API_URL);
  const pitchDetectionService = new PitchDetectionService();
  const audioProcessingService = new AudioProcessingService(audioService, speechRecognitionService, pitchDetectionService, redis);

  // Initialize Socket Service with shared Redis pub/sub clients
  const socketService = new SocketService(io, audioProcessingService, redis);
  socketService.initialize();

  // Game Server Connection (Primary Worker Only)
  if (cluster.worker.id === 1) {
    const GameServerService = require("./services/game-server.service");
    const gameServerService = new GameServerService(GAME_SERVER_URL, redis);
    gameServerService.initialize();

    // Subscribe to voice results in Primary Worker
    const resultSubscriber = redis.duplicate();
    resultSubscriber.subscribe("voiceResult", (err, count) => {
      if (err) {
        console.error("Failed to subscribe to voiceResult:", err);
        return;
      }
      console.log(`Primary worker subscribed to voiceResult channel`);
    });

    resultSubscriber.on("message", (channel, message) => {
      if (channel === "voiceResult") {
        try {
          const result = JSON.parse(message);
          console.log("Primary worker received voice result:", result);
          gameServerService.sendVoiceResult(result);
        } catch (error) {
          console.error("Error processing voice result:", error);
        }
      }
    });

    console.log(`Primary worker ${process.pid} connected to game server`);
  }

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} started - Voice processing server running on port ${PORT}`);
  });

  process.on("uncaughtException", (error) => {
    console.error(`Worker ${process.pid} Uncaught Exception:`, error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(`Worker ${process.pid} Unhandled Rejection at:`, promise, "reason:", reason);
  });
}
