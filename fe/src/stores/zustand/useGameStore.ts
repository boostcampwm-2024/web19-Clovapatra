import { GameResultProps, TurnData } from '@/types/socketTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GameStore {
  turnData: TurnData | null;
  resultData: GameResultProps;
  isGameStarted: boolean;
}

interface GameActions {
  setTurnData: (turnData: TurnData) => void;
  setGameResult: (resultData: GameResultProps) => void;
  setIsGameStarted: (isGameStarted: boolean) => void;
}

const initialState: GameStore = {
  turnData: null,
  resultData: null,
  isGameStarted: false,
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
  }))
);

export default useGameStore;
