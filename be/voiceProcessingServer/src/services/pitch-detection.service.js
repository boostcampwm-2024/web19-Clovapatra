const { spawn } = require("child_process");

class PitchDetectionService {
  async detectPitch(wavBuffer) {
    return new Promise((resolve, reject) => {
      // FFmpeg를 사용하여 음계 분석을 위한 raw PCM 데이터 추출
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        "pipe:0",
        "-af",
        "aresample=16000,highpass=f=80,lowpass=f=3000", // 필터링
        "-f",
        "f32le", // 32-bit float PCM
        "-acodec",
        "pcm_f32le",
        "-ac",
        "1", // mono
        "-ar",
        "16000", // 16kHz
        "pipe:1",
      ]);

      const chunks = [];

      ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));

      ffmpeg.on("error", (error) => {
        console.error("FFmpeg pitch error:", error);
        reject(error);
      });

      ffmpeg.on("close", async (code) => {
        if (code === 0) {
          try {
            const pcmData = Buffer.concat(chunks);
            const averageNote = this.analyzePitch(pcmData);
            resolve(averageNote);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`FFmpeg pitch process exited with code ${code}`));
        }
      });

      // 입력 데이터 전송
      ffmpeg.stdin.write(wavBuffer);
      ffmpeg.stdin.end();
    });
  }

  analyzePitch(pcmBuffer) {
    const float32Array = new Float32Array(pcmBuffer.buffer);
    const sampleRate = 16000;
    const notesMap = this.createNotesMap();
    const pitches = [];
    const windowSize = 2048;
    const hopSize = 512;

    for (let i = 0; i < float32Array.length - windowSize; i += hopSize) {
      const chunk = float32Array.slice(i, i + windowSize);
      const frequency = this.detectFrequency(chunk, sampleRate);

      if (frequency > 0) {
        const note = this.frequencyToNote(frequency, notesMap);
        if (note) {
          pitches.push({
            time: i / sampleRate,
            note: note,
            frequency: frequency,
          });
        }
      }
    }

    return this.consolidatePitches(pitches);
  }

  createNotesMap() {
    const baseFreq = 440; // A4
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const notesMap = new Map();

    for (let octave = 0; octave < 9; octave++) {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i] + octave;
        const frequency = baseFreq * Math.pow(2, (octave * 12 + i - 57) / 12);
        notesMap.set(frequency, note);
      }
    }

    return notesMap;
  }

  detectFrequency(buffer, sampleRate) {
    // 자기상관(autocorrelation) 방식으로 주파수 검출
    let maxCorrelation = 0;
    let foundPeriod = 0;

    for (let period = 32; period < buffer.length / 2; period++) {
      let correlation = 0;

      for (let i = 0; i < buffer.length - period; i++) {
        correlation += buffer[i] * buffer[i + period];
      }

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        foundPeriod = period;
      }
    }

    return foundPeriod ? sampleRate / foundPeriod : 0;
  }

  frequencyToNote(frequency, notesMap) {
    let minDiff = Infinity;
    let closestNote = null;

    for (const [noteFreq, noteName] of notesMap) {
      const diff = Math.abs(frequency - noteFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = noteName;
      }
    }

    return closestNote;
  }

  consolidatePitches(pitches) {
    // 연속된 같은 음을 하나로 합치고, 너무 짧은 음은 제거
    const minDuration = 0.1; // 최소 100ms
    const consolidated = [];
    let currentNote = null;
    let startTime = 0;

    for (const pitch of pitches) {
      if (!currentNote) {
        currentNote = pitch.note;
        startTime = pitch.time;
      } else if (pitch.note !== currentNote) {
        const duration = pitch.time - startTime;
        if (duration >= minDuration) {
          consolidated.push({
            note: currentNote,
            startTime: startTime,
            duration: duration,
          });
        }
        currentNote = pitch.note;
        startTime = pitch.time;
      }
    }

    // 마지막 음표 처리
    if (currentNote && pitches.length > 0) {
      const duration = pitches[pitches.length - 1].time - startTime;
      if (duration >= minDuration) {
        consolidated.push({
          note: currentNote,
          startTime: startTime,
          duration: duration,
        });
      }
    }

    // 평균 음계 계산
    const averageNote = this.calculateAverageNote(consolidated);
    return averageNote;
  }

  calculateAverageNote(consolidatedPitches) {
    if (consolidatedPitches.length === 0) {
      return null;
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (const pitch of consolidatedPitches) {
      const noteValue = this.noteToNumber(pitch.note);
      if (noteValue !== null) {
        weightedSum += noteValue * pitch.duration;
        totalWeight += pitch.duration;
      }
    }

    if (totalWeight === 0) {
      return null;
    }

    const averageNoteValue = weightedSum / totalWeight;
    return this.numberToNote(averageNoteValue);
  }

  noteToNumber(note) {
    // 예: "A#4" -> 음높이를 숫자로 변환
    const matches = note.match(/([A-G]#?)(\d+)/);
    if (!matches) return null;

    const [, noteName, octave] = matches;
    const noteBase = {
      C: 0,
      "C#": 1,
      D: 2,
      "D#": 3,
      E: 4,
      F: 5,
      "F#": 6,
      G: 7,
      "G#": 8,
      A: 9,
      "A#": 10,
      B: 11,
    }[noteName];

    return noteBase + (parseInt(octave) + 1) * 12;
  }

  numberToNote(number) {
    // 숫자를 다시 음계 표기로 변환
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(number / 12) - 1;
    const noteIndex = Math.round(number) % 12;
    return `${notes[noteIndex]}${octave}`;
  }
}

module.exports = PitchDetectionService;
