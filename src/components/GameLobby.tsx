
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import useGame from '@/hooks/useGame';
import { GameState, generateRandomName } from '@/lib/gameUtils';

const GameLobby = () => {
  const [playerId, setPlayerId] = useState<string>('');
  const [recentGames, setRecentGames] = useState<GameState[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Generate or retrieve player ID
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      const newPlayerId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('playerId', newPlayerId);
      setPlayerId(newPlayerId);
    }
    
    if (!storedPlayerName) {
      const newPlayerName = generateRandomName();
      localStorage.setItem('playerName', newPlayerName);
    }
  }, []);
  
  const { createGame, joinGame, findRecentGames } = useGame(playerId);
  
  // Load recent games
  useEffect(() => {
    if (playerId) {
      loadRecentGames();
    }
  }, [playerId]);
  
  const loadRecentGames = async () => {
    if (!playerId) return;
    const games = await findRecentGames();
    setRecentGames(games);
  };
  
  const handleCreateGame = async () => {
    if (!playerId) {
      toast({
        title: 'Error',
        description: 'Could not create player profile. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const gameId = await createGame();
      navigate(`/game/${gameId}`);
      toast({
        title: 'Game created',
        description: 'Share the game ID with a friend to play.',
      });
    } catch (error) {
      console.error('Error in handleCreateGame:', error);
    }
  };
  
  const handleJoinGame = async (gameId: string) => {
    if (!playerId) {
      toast({
        title: 'Error',
        description: 'Could not create player profile. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    await joinGame(gameId);
  };
  
  return (
    <>
      <WaitingRoom
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        recentGames={recentGames}
      />
    </>
  );
};

export default GameLobby;
