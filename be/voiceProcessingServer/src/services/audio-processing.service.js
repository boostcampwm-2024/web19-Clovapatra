class AudioProcessingService {
  constructor(audioService, speechRecognitionService, pitchDetectionService, redis) {
    this.audioService = audioService;
    this.speechRecognitionService = speechRecognitionService;
    this.pitchDetectionService = pitchDetectionService;
    this.redis = redis;
  }

  async processAudio(audioChunks, session) {
    console.log("Starting audio processing...");

    const audioBuffer = Buffer.concat(audioChunks);
    const wavBuffer = await this.audioService.convertToWav(audioBuffer);

    let result = {};

    try {
      if (session.gameMode === "CLEOPATRA") {
        const averageNote = await this.pitchDetectionService.detectPitch(wavBuffer);
        result = { averageNote };
      } else if (session.gameMode === "PRONUNCIATION") {
        const pronounceScore = await this.speechRecognitionService.recognizeSpeech(wavBuffer, session.lyrics);
        result = { pronounceScore };
      }

      // Add session information to result
      result.roomId = session.roomId;
      result.playerNickname = session.playerNickname;

      // Publish result to Redis for Primary Worker to handle
      await this.redis.publish("voiceResult", JSON.stringify(result));

      console.log("Voice processing completed:", result);
    } catch (error) {
      console.error("Audio processing error:", error);
      throw error;
    }
  }
}

module.exports = AudioProcessingService;
