
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGame from '@/hooks/useGame';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Game = () => {
  const [playerId, setPlayerId] = useState<string>('');
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Set player ID from localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      // If no player ID, create one and redirect to home
      const newPlayerId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('playerId', newPlayerId);
      navigate('/');
    }
  }, [navigate]);
  
  const { 
    game, 
    loading, 
    error, 
    makeMove, 
    restartGame, 
    isPlayerInGame, 
    playerSymbol 
  } = useGame(playerId);
  
  const handleCellClick = (index: number) => {
    if (!gameId) return;
    makeMove(index);
  };
  
  const handleRestart = async () => {
    await restartGame();
  };
  
  const handleShareGame = () => {
    if (!gameId) return;
    
    // Create share data for share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Join my Tic Tac Toe game!',
        text: `I'm inviting you to play Tic Tac Toe. Join my game with code: ${gameId}`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing:', error);
        handleCopyGameLink();
      });
    } else {
      handleCopyGameLink();
    }
  };
  
  const handleCopyGameLink = () => {
    const gameLink = window.location.href;
    navigator.clipboard.writeText(gameLink);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your friend to join the game.',
    });
  };
  
  // Render loading state
  if (loading || !playerId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="animate-pulse text-center">
            <div className="text-xl font-medium">Loading game...</div>
          </div>
        </main>
      </div>
    );
  }
  
  // Handle error state
  if (error || !gameId || !game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Game not found</h2>
            <p className="text-muted-foreground">The game you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Check if player is part of this game
  const canViewGame = isPlayerInGame();
  if (!canViewGame && game.status !== 'waiting') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Game in progress</h2>
            <p className="text-muted-foreground">This game already has two players.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
        </div>
        
        <GameBoard 
          game={game} 
          playerId={playerId} 
          onCellClick={handleCellClick} 
        />
        
        <GameControls 
          game={game} 
          playerId={playerId} 
          onRestart={handleRestart} 
          onShareGame={handleShareGame}
        />
        
        {game.status === 'waiting' && (
          <div className="mt-8 text-center animate-pulse-subtle">
            <p className="text-sm text-muted-foreground">
              Waiting for another player to join...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
