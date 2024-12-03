import { GameResultProps, MuteStatus, TurnData } from '@/types/socketTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GameStore {
  turnData: TurnData | null;
  resultData: GameResultProps;
  muteStatus: MuteStatus;
  rank: string[];
  gameInProgressError: boolean;
}

interface GameActions {
  setTurnData: (turnData: TurnData) => void;
  setGameResult: (resultData: GameResultProps) => void;
  setMuteStatus: (muteStatus: MuteStatus) => void;
  setRank: (rank: string[]) => void;
  setGameInProgressError: (value: boolean) => void;
  resetGame: () => void;
}

const initialState: GameStore = {
  turnData: null,
  resultData: null,
  muteStatus: {},
  rank: [],
  gameInProgressError: false,
};

const useGameStore = create<GameStore & GameActions>()(
  devtools((set) => ({
    ...initialState,

    setTurnData: (turnData) =>
      set(() => ({
        turnData,
      })),

    setGameResult: (resultData) =>
      set(() => ({
        resultData,
      })),

    setRank: (rank) => set(() => ({ rank })),

    setGameInProgressError: (gameInProgressError) =>
      set({ gameInProgressError }),

    resetGame: () =>
      set({
        // 초기화 로직
        turnData: null,
        resultData: null,
        rank: [],
      }),

    setMuteStatus: (muteStatus) => set(() => ({ muteStatus })),
  }))
);

export default useGameStore;
