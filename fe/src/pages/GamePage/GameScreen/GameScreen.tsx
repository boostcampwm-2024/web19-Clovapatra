import useGameStore from '@/stores/zustand/useGameStore';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import ReadyScreen from './ReadyScreen';
import PlayScreen from './PlayScreen';

const GameScreen = () => {
  const { currentPlayer, setCurrentPlayer } = useRoomStore();
  const { turnData } = useGameStore();

  useEffect(() => {
    if (!currentPlayer) {
      const nickname = sessionStorage.getItem('user_nickname');
      if (nickname) {
        setCurrentPlayer(nickname);
      }
    }
  }, [currentPlayer]);

  return turnData ? <PlayScreen /> : <ReadyScreen />;
};

export default GameScreen;
