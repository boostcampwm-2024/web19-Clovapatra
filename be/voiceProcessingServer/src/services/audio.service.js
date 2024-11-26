const { Readable } = require("stream");
const { spawn } = require("child_process");

class AudioService {
  async convertToWav(audioBuffer) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", ["-f", "webm", "-i", "pipe:0", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", "-f", "wav", "pipe:1"]);

      const chunks = [];

      ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));

      ffmpeg.on("error", (error) => {
        console.error("FFmpeg process error:", error);
        reject(error);
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          const outputBuffer = Buffer.concat(chunks);
          console.log("Audio conversion successful. Output size:", outputBuffer.length);
          resolve(outputBuffer);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      const readable = new Readable();
      readable._read = () => {};
      readable.push(audioBuffer);
      readable.push(null);
      readable.pipe(ffmpeg.stdin);
    });
  }
}

module.exports = AudioService;
