import { Socket, io } from 'socket.io-client';
import { VoiceSocketEvents } from '@/types/socketTypes';
import { SocketService } from './SocketService';

class VoiceSocket extends SocketService {
  private mediaRecorder: MediaRecorder | null;
  private onErrorCallback: ((error: string) => void) | null;
  private onRecordingStateChange: ((isRecording: boolean) => void) | null;
  private readonly VOICE_SERVER_URL = 'wss://voice-processing.clovapatra.com';

  constructor() {
    super();
    this.mediaRecorder = null;
    this.onErrorCallback = null;
    this.onRecordingStateChange = null;
  }

  initialize(
    onError: (error: string) => void,
    onStateChange: (isRecording: boolean) => void
  ) {
    this.onErrorCallback = onError;
    this.onRecordingStateChange = onStateChange;
  }

  private async connect(roomId: string, playerNickname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.socket.disconnect();
        this.setSocket(null);
      }

      const socket = io(this.VOICE_SERVER_URL, {
        transports: ['websocket'],
        query: { roomId, playerNickname },
      }) as Socket<VoiceSocketEvents>;

      this.setSocket(socket);

      this.socket.on('connect', () => {
        console.log('Voice server connected');
        this.socket.emit('start_recording');
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('Voice server error:', error);
        this.handleError(error);
        reject(error);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Voice server connection error:', error);
        reject(error);
      });
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
        bitsPerSecond: 128000,
        audioBitsPerSecond: 96000,
        videoBitsPerSecond: 0,
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

      this.mediaRecorder.start(100);
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

    if (this.socket) {
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      this.setSocket(null);
    }

    if (this.onRecordingStateChange) {
      this.onRecordingStateChange(false);
    }
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  override disconnect() {
    this.cleanupRecording();
    super.disconnect();
  }
}

export const voiceSocket = new VoiceSocket();
