import { TurnData } from '@/types/socketTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GameStore {
  turnData: TurnData | null;
}

interface GameActions {
  setTurnData: (turnData: TurnData) => void;
}

const initialState: GameStore = {
  turnData: null,
};

const useGameStore = create<GameStore & GameActions>()(
  devtools((set) => ({
    ...initialState,

    setTurnData: (turnData) =>
      set(() => ({
        turnData,
      })),
  }))
);

export default useGameStore;
