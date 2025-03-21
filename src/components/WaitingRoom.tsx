
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState, formatGameId } from '@/lib/gameUtils';
import { cn } from '@/lib/utils';

interface WaitingRoomProps {
  onCreateGame: () => Promise<void>;
  onJoinGame: (gameId: string) => Promise<void>;
  recentGames: GameState[];
}

const WaitingRoom = ({ onCreateGame, onJoinGame, recentGames }: WaitingRoomProps) => {
  const [gameId, setGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleCreateGame = async () => {
    try {
      setIsCreating(true);
      await onCreateGame();
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      toast({
        title: 'Game ID required',
        description: 'Please enter a valid game ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsJoining(true);
      await onJoinGame(gameId.trim().toLowerCase());
    } catch (error) {
      console.error('Error joining game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRecentGame = async (id: string) => {
    try {
      setIsJoining(true);
      await onJoinGame(id);
    } catch (error) {
      console.error('Error joining recent game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4 animate-fade-in">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
          <CardDescription>
            Start a new game and invite a friend to play
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            onClick={handleCreateGame}
            disabled={isCreating || isJoining}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Join Game</CardTitle>
          <CardDescription>
            Enter a game ID to join an existing game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="bg-background/80"
              autoComplete="off"
            />
            <Button 
              onClick={handleJoinGame}
              disabled={isJoining || isCreating || !gameId.trim()}
              className="shrink-0"
            >
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {recentGames.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Open Games</CardTitle>
            <CardDescription>
              Join a game that's waiting for players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md",
                    "border border-border/50 bg-background/50 hover:bg-background/80",
                    "transition-colors cursor-pointer"
                  )}
                  onClick={() => handleJoinRecentGame(game.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-medium">{formatGameId(game.id).slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{formatGameId(game.id)}</div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(game.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WaitingRoom;
