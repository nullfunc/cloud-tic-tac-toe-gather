
import { useId } from 'react';
import { Player } from '@/lib/gameUtils';
import { cn } from '@/lib/utils';

interface GameCellProps {
  value: Player;
  onClick: () => void;
  index: number;
  isWinningCell: boolean;
  isCurrentPlayerTurn: boolean;
  disabled?: boolean;
}

const GameCell = ({ 
  value, 
  onClick, 
  index, 
  isWinningCell,
  isCurrentPlayerTurn,
  disabled = false 
}: GameCellProps) => {
  const id = useId();
  
  return (
    <div
      className={cn(
        "game-cell",
        isWinningCell && "bg-primary/10 border border-primary/20",
        (disabled || !isCurrentPlayerTurn) && "cursor-default hover:bg-secondary/60"
      )}
      onClick={!disabled && isCurrentPlayerTurn ? onClick : undefined}
      style={{ '--index': index } as React.CSSProperties}
    >
      {value === 'X' && (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "stroke-current",
            isWinningCell ? "text-primary" : "text-foreground"
          )}
        >
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              isWinningCell ? "animate-draw-x" : "stroke-dasharray-0"
            )}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: isWinningCell ? 0 : 100,
            }}
          />
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              isWinningCell ? "animate-draw-x" : "stroke-dasharray-0"
            )}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: isWinningCell ? 0 : 100,
              animationDelay: '0.2s'
            }}
          />
        </svg>
      )}

      {value === 'O' && (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "stroke-current",
            isWinningCell ? "text-primary" : "text-foreground"
          )}
        >
          <circle
            cx="12"
            cy="12"
            r="8"
            strokeWidth="2"
            className={cn(
              isWinningCell ? "animate-draw-circle" : "stroke-dasharray-0"
            )}
            style={{
              strokeDasharray: 283,
              strokeDashoffset: isWinningCell ? 0 : 283,
            }}
          />
        </svg>
      )}

      {!value && isCurrentPlayerTurn && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-20">
          {isCurrentPlayerTurn === true && !disabled && (
            <div className="h-8 w-8 rounded-full bg-foreground opacity-20"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCell;
