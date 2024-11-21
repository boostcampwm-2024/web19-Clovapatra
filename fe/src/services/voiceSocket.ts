import { Socket, io } from 'socket.io-client';
import { VoiceSocketEvents } from '@/types/socketTypes';
import { SocketService } from './SocketService';

class VoiceSocket extends SocketService {
  private mediaRecorder: MediaRecorder | null;
  private recordingStartTime: number | null;
  private onSpeechRecognitionResultCallback: ((result: string) => void) | null;
  private onPitchResultCallback: ((pitch: number) => void) | null;
  private onErrorCallback: ((error: string) => void) | null;
  private onRecordingStateChange: ((isRecording: boolean) => void) | null;
  private audioChunks: BlobPart[];
  private readonly VOICE_SERVER_URL = 'wss://voice-processing.clovapatra.com';

  constructor() {
    super();
    this.mediaRecorder = null;
    this.recordingStartTime = null;
    this.onSpeechRecognitionResultCallback = null;
    this.onPitchResultCallback = null;
    this.onErrorCallback = null;
    this.onRecordingStateChange = null;
    this.audioChunks = [];
  }

  initialize(
    onSpeechRecognitionResult: (result: string) => void,
    onPitchResult: (pitch: number) => void,
    onError: (error: string) => void,
    onStateChange: (isRecording: boolean) => void
  ) {
    this.onSpeechRecognitionResultCallback = onSpeechRecognitionResult;
    this.onPitchResultCallback = onPitchResult;
    this.onErrorCallback = onError;
    this.onRecordingStateChange = onStateChange;
  }

  private async connect(roomId: string, playerNickname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.socket.disconnect();
        this.setSocket(null);
      }

      console.log('Connecting to voice server:', { roomId, playerNickname });

      const socket = io(this.VOICE_SERVER_URL, {
        transports: ['websocket'],
        query: { roomId, playerNickname },
      }) as Socket<VoiceSocketEvents>;

      this.setSocket(socket);
      this.setupEventListeners(resolve, reject);
    });
  }

  private setupEventListeners(
    resolve: () => void,
    reject: (error: Error) => void
  ) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Voice server connected');
      this.socket?.emit('start_recording');
      resolve();
    });

    this.socket.on('error', (error: Error) => {
      console.error('Voice server error:', error);
      this.handleError(error);
      reject(error);
    });

    this.socket.on('disconnect', () => {
      console.log('Voice server disconnected');
      this.cleanupRecording();
    });
  }

  async startRecording(
    localStream: MediaStream,
    roomId: string,
    playerNickname: string
  ) {
    try {
      if (!localStream) {
        throw new Error('마이크가 연결되어 있지 않습니다.');
      }

      await this.connect(roomId, playerNickname);

      const audioTrack = localStream.getAudioTracks()[0];
      const mediaStream = new MediaStream([audioTrack]);

      this.mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
        bitsPerSecond: 16000,
      });

      this.mediaRecorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size > 0) {
          try {
            const buffer = await event.data.arrayBuffer();
            if (this.socket?.connected) {
              console.log('Sending audio chunk:', buffer.byteLength, 'bytes');
              this.socket.emit('audio_data', buffer);
            }
          } catch (error) {
            console.error('Error processing audio chunk:', error);
            this.handleError(error as Error);
          }
        }
      };

      this.mediaRecorder.start(200);
      this.recordingStartTime = Date.now();
      console.log('Recording started');

      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(true);
      }
    } catch (error) {
      console.error('Error in startRecording:', error);
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    console.error('Voice processor error:', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(
        error.message || '음성 처리 중 오류가 발생했습니다.'
      );
    }
    this.cleanupRecording();
  }

  private cleanupRecording() {
    console.log('Cleaning up recording');

    if (this.mediaRecorder?.state !== 'inactive') {
      this.mediaRecorder?.stop();
    }
    this.mediaRecorder = null;

    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.setSocket(null);

    this.recordingStartTime = null;
    this.audioChunks = [];

    if (this.onRecordingStateChange) {
      this.onRecordingStateChange(false);
    }
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  isConnected() {
    return this.socket ? this.socket.connected : false;
  }

  override disconnect() {
    this.cleanupRecording();
  }
}

export const voiceSocket = new VoiceSocket();
