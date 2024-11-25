import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
import { Button } from '../ui/button';

interface MikeButtonProps {
  isMuted: boolean;
  onToggle: () => void;
}

const MikeButton = ({ isMuted, onToggle }: MikeButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={`rounded-full border ${
        isMuted
          ? 'border-destructive text-destructive'
          : 'border-cyan-500 text-cyan-500'
      } hover:bg-transparent`}
    >
      {isMuted ? (
        <FaMicrophoneSlash className="h-5 w-5 text-destructive" />
      ) : (
        <FaMicrophone className="h-5 w-5 text-cyan-500" />
      )}
    </Button>
  );
};

export default MikeButton;
