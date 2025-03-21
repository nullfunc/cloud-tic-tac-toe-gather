
import { useMemo } from 'react';
import { Player, GameState, getWinningLine, getPlayerSymbol } from '@/lib/gameUtils';
import GameCell from './GameCell';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  game: GameState;
  playerId: string;
  onCellClick: (index: number) => void;
}

const GameBoard = ({ game, playerId, onCellClick }: GameBoardProps) => {
  const { board, status, currentTurn, winner } = game;

  const winningLine = useMemo(() => {
    return getWinningLine(board);
  }, [board]);

  const playerSymbol = getPlayerSymbol(playerId, game);
  const isCurrentPlayerTurn = playerSymbol === currentTurn;
  const gameEnded = status === 'finished';

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={cn(
          "grid grid-cols-3 gap-2 bg-background/50 p-2 rounded-xl border border-border/50",
          "shadow-sm backdrop-blur-sm transition-all duration-300",
          "md:gap-3 md:p-3",
          "animate-in-delayed"
        )}
      >
        {board.map((cell, index) => (
          <GameCell
            key={index}
            value={cell}
            index={index}
            onClick={() => onCellClick(index)}
            isWinningCell={winningLine ? winningLine.includes(index) : false}
            isCurrentPlayerTurn={isCurrentPlayerTurn}
            disabled={gameEnded}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
