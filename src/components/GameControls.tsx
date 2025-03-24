
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GameState, formatGameId } from '@/lib/gameUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  game: GameState | null;
  playerId: string;
  onRestart: () => void;
  onShareGame: () => void;
}

const GameControls = ({ game, playerId, onRestart, onShareGame }: GameControlsProps) => {
  const [copied, setCopied] = useState(false);

  if (!game) return null;

  const { id, status, playerX, playerO, winner, currentTurn, isSinglePlayer } = game;
  const isActivePlayer = playerId === playerX || playerId === playerO;
  const isPlayerX = playerId === playerX;
  const isPlayerO = playerId === playerO;
  const isGameFull = playerX && playerO;

  const handleCopyGameId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md animate-in-delayed mt-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg font-medium">Game Status</CardTitle>
          <CardDescription>
            {status === 'waiting' && 'Waiting for opponent to join...'}
            {status === 'in-progress' && !winner && `Current turn: ${currentTurn}`}
            {status === 'finished' && winner && `Winner: ${winner}`}
            {status === 'finished' && !winner && 'Game ended in a draw'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!isGameFull && status === 'waiting' && (
            <div className="flex items-center gap-2">
              <Input
                value={formatGameId(id)}
                readOnly
                className="bg-secondary/50 text-center font-mono"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopyGameId}
                className="shrink-0"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          )}

          {/* Player info */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className={cn(
              "p-2 rounded-md text-center",
              isPlayerX && "bg-primary/10 border border-primary/20",
              currentTurn === 'X' && "ring-1 ring-primary/30"
            )}>
              <div className="text-sm font-medium">Player X</div>
              <div className="text-xs text-muted-foreground">
                {isSinglePlayer ? "You" : isPlayerX ? "You" : playerX ? "Opponent" : "Waiting..."}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded-md text-center",
              isPlayerO && "bg-primary/10 border border-primary/20",
              currentTurn === 'O' && "ring-1 ring-primary/30"
            )}>
              <div className="text-sm font-medium">Player O</div>
              <div className="text-xs text-muted-foreground">
                {isSinglePlayer ? "You" : isPlayerO ? "You" : playerO ? "Opponent" : "Waiting..."}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-1">
          {status === 'finished' && (
            <Button 
              onClick={onRestart} 
              variant="outline"
              className="w-full"
            >
              <RefreshCw size={16} className="mr-2" />
              Play Again
            </Button>
          )}
          
          {status === 'waiting' && !isSinglePlayer && (
            <Button 
              onClick={onShareGame} 
              variant="outline"
              className="w-full"
            >
              Invite Friend
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameControls;
