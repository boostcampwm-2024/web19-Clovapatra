import { GameResultProps, TurnData } from '@/types/socketTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GameStore {
  turnData: TurnData | null;
  resultData: GameResultProps;
  rank: string[];
  isGameStarted: boolean;
}

interface GameActions {
  setTurnData: (turnData: TurnData) => void;
  setGameResult: (resultData: GameResultProps) => void;
  setRank: (rank: string[]) => void;
  setIsGameStarted: (isGameStarted: boolean) => void;
  resetGame: () => void;
}

const initialState: GameStore = {
  turnData: null,
  resultData: null,
  isGameStarted: false,
  rank: [],
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

    setIsGameStarted: (isGameStarted) =>
      set(() => ({
        isGameStarted,
      })),

    setRank: (rank) => set(() => ({ rank })),

    resetGame: () =>
      set({
        // 초기화 로직
        turnData: null,
        resultData: null,
        rank: [],
      }),
  }))
);

export default useGameStore;
