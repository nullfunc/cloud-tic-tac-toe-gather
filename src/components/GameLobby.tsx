
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import useGame from '@/hooks/useGame';
import { GameState, generateRandomName } from '@/lib/gameUtils';

const GameLobby = () => {
  const [playerId, setPlayerId] = useState<string>('');
  const [recentGames, setRecentGames] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    
    setIsLoading(false);
  }, []);
  
  const { createGame, joinGame, findRecentGames, createSoloGame } = useGame(playerId);
  
  // Load recent games with better error handling and loading states
  useEffect(() => {
    const loadGames = async () => {
      if (!playerId) return;
      
      try {
        setIsLoading(true);
        const games = await findRecentGames();
        setRecentGames(games);
      } catch (error) {
        console.error('Failed to load recent games:', error);
        toast({
          title: 'Connection issue',
          description: 'Could not load recent games. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (playerId) {
      loadGames();
    }
  }, [playerId, findRecentGames, toast]);
  
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
      setIsLoading(true);
      const gameId = await createGame();
      navigate(`/game/${gameId}`);
      toast({
        title: 'Game created',
        description: 'Share the game ID with a friend to play.',
      });
    } catch (error) {
      console.error('Error in handleCreateGame:', error);
      toast({
        title: 'Connection issue',
        description: 'Failed to create game. Please check your connection and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
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
    
    try {
      setIsLoading(true);
      await joinGame(gameId);
    } catch (error) {
      console.error('Error in handleJoinGame:', error);
      setIsLoading(false);
    }
  };

  const handlePlaySolo = async () => {
    if (!playerId) {
      toast({
        title: 'Error',
        description: 'Could not create player profile. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const gameId = await createSoloGame();
      navigate(`/game/${gameId}`);
      toast({
        title: 'Solo game started',
        description: 'You can now play against yourself!',
      });
    } catch (error) {
      console.error('Error in handlePlaySolo:', error);
      toast({
        title: 'Connection issue',
        description: 'Failed to create solo game. Please check your connection and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <WaitingRoom
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        onPlaySolo={handlePlaySolo}
        recentGames={recentGames}
        isLoading={isLoading}
      />
    </>
  );
};

export default GameLobby;
