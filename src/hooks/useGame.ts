
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameState, initialBoard, checkWinner, getPlayerSymbol, canMakeMove } from '@/lib/gameUtils';
import { useToast } from '@/components/ui/use-toast';

export const useGame = (playerId: string) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debounce function to limit excessive updates
  const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Enhanced fetch and subscribe to game updates
  useEffect(() => {
    if (!gameId || !db) return;

    let unsubscribe: () => void;
    let isSubscribed = true;
    
    const setupGameSubscription = async () => {
      try {
        setLoading(true);
        const gameRef = doc(db, 'games', gameId);
        
        // First, get initial data
        const docSnapshot = await getDoc(gameRef);
        
        if (!docSnapshot.exists()) {
          if (isSubscribed) {
            setError('Game not found');
            setLoading(false);
            toast({
              title: 'Game not found',
              description: 'The game you are looking for does not exist.',
              variant: 'destructive',
            });
            navigate('/');
          }
          return;
        }
        
        // Then set up real-time listener
        unsubscribe = onSnapshot(
          gameRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const gameData = docSnapshot.data() as GameState;
              if (isSubscribed) {
                setGame(gameData);
                setLoading(false);
              }
            } else if (isSubscribed) {
              setError('Game no longer exists');
              setLoading(false);
              toast({
                title: 'Game removed',
                description: 'This game has been deleted or does not exist.',
                variant: 'destructive',
              });
              navigate('/');
            }
          },
          (err) => {
            console.error('Error in game subscription:', err);
            if (isSubscribed) {
              setError('Failed to load game data');
              setLoading(false);
              toast({
                title: 'Connection Error',
                description: 'Failed to connect to the game. Please try again.',
                variant: 'destructive',
              });
            }
          }
        );
      } catch (err) {
        console.error('Error setting up game subscription:', err);
        if (isSubscribed) {
          setError('Failed to load game data');
          setLoading(false);
          toast({
            title: 'Error',
            description: 'Failed to load game data. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };

    setupGameSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [gameId, navigate, toast]);

  // Create a new game with optimized Firebase calls
  const createGame = useCallback(async (): Promise<string> => {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      setLoading(true);
      
      // Generate a random game ID
      const gameId = Math.random().toString(36).substring(2, 8);
      const gameRef = doc(db, 'games', gameId);
      
      // Create initial game state with server timestamp
      const newGame: GameState = {
        id: gameId,
        board: initialBoard,
        currentTurn: 'X',
        playerX: playerId,
        playerO: null,
        winner: null,
        status: 'waiting',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isSinglePlayer: false,
      };

      await setDoc(gameRef, newGame);
      setLoading(false);
      
      return gameId;
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to create game. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  }, [playerId, toast]);

  // Create a solo game with optimized code
  const createSoloGame = useCallback(async (): Promise<string> => {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      setLoading(true);
      
      // Generate a random game ID
      const gameId = Math.random().toString(36).substring(2, 8);
      const gameRef = doc(db, 'games', gameId);
      
      // Create initial game state for solo play
      const newGame: GameState = {
        id: gameId,
        board: initialBoard,
        currentTurn: 'X',
        playerX: playerId,
        playerO: playerId, // Same player for both X and O
        winner: null,
        status: 'in-progress', // Start immediately since it's solo
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isSinglePlayer: true,
      };

      await setDoc(gameRef, newGame);
      setLoading(false);
      
      return gameId;
    } catch (err) {
      console.error('Error creating solo game:', err);
      setError('Failed to create solo game');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to create solo game. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  }, [playerId, toast]);

  // Efficiently join an existing game
  const joinGame = useCallback(async (gameIdToJoin: string): Promise<void> => {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      setLoading(true);
      const gameRef = doc(db, 'games', gameIdToJoin);
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        setError('Game not found');
        setLoading(false);
        toast({
          title: 'Game not found',
          description: 'The game ID you entered does not exist.',
          variant: 'destructive',
        });
        return;
      }

      const gameData = gameDoc.data() as GameState;

      if (gameData.playerX === playerId || gameData.playerO === playerId) {
        // Player is already in the game, just navigate there
        setLoading(false);
        navigate(`/game/${gameIdToJoin}`);
        return;
      }

      if (gameData.status !== 'waiting') {
        setError('Game is already in progress or finished');
        setLoading(false);
        toast({
          title: 'Cannot join game',
          description: 'This game is already in progress or has ended.',
          variant: 'destructive',
        });
        return;
      }

      if (gameData.playerO) {
        setError('Game is full');
        setLoading(false);
        toast({
          title: 'Game is full',
          description: 'This game already has two players.',
          variant: 'destructive',
        });
        return;
      }

      // Join as player O with minimal field updates
      await updateDoc(gameRef, {
        playerO: playerId,
        status: 'in-progress',
        updatedAt: Date.now(),
      });

      setLoading(false);
      navigate(`/game/${gameIdToJoin}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to join game. Please try again.',
        variant: 'destructive',
      });
    }
  }, [playerId, navigate, toast]);

  // Optimized move function
  const makeMove = async (cellIndex: number): Promise<void> => {
    if (!gameId || !game || !db) return;

    const isSoloGame = game.isSinglePlayer;
    
    // For solo games, allow moves regardless of player symbol
    if (isSoloGame) {
      if (game.status !== 'in-progress') {
        toast({
          title: 'Game not in progress',
          description: game.status === 'waiting' 
            ? 'Waiting for another player to join.'
            : 'This game has ended.',
        });
        return;
      }
      
      if (game.board[cellIndex] !== null) {
        toast({
          title: 'Invalid move',
          description: 'This cell is already taken.',
        });
        return;
      }
    } else if (!canMakeMove(game, playerId, cellIndex)) {
      // Regular multiplayer validation
      if (game.status !== 'in-progress') {
        toast({
          title: 'Game not in progress',
          description: game.status === 'waiting' 
            ? 'Waiting for another player to join.'
            : 'This game has ended.',
        });
      } else if (game.board[cellIndex] !== null) {
        toast({
          title: 'Invalid move',
          description: 'This cell is already taken.',
        });
      } else if (getPlayerSymbol(playerId, game) !== game.currentTurn) {
        toast({
          title: 'Not your turn',
          description: `It's ${game.currentTurn}'s turn.`,
        });
      }
      return;
    }

    try {
      // Create updated board
      const updatedBoard = [...game.board];
      updatedBoard[cellIndex] = game.currentTurn;

      // Check for winner
      const winner = checkWinner(updatedBoard);
      const gameStatus = winner || !updatedBoard.includes(null) ? 'finished' : 'in-progress';

      // Update only changed fields to reduce network traffic
      const gameRef = doc(db, 'games', gameId);
      const updates = {
        board: updatedBoard,
        currentTurn: game.currentTurn === 'X' ? 'O' : 'X',
        updatedAt: Date.now(),
      };
      
      if (gameStatus === 'finished') {
        updates['winner'] = winner;
        updates['status'] = gameStatus;
      }
      
      await updateDoc(gameRef, updates);
    } catch (err) {
      console.error('Error making move:', err);
      toast({
        title: 'Connection Error',
        description: 'Failed to update the game. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  // Optimized restart function
  const restartGame = async (): Promise<void> => {
    if (!gameId || !game || !db) return;

    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        board: initialBoard,
        currentTurn: 'X',
        winner: null,
        status: 'in-progress',
        updatedAt: Date.now(),
      });
      
      toast({
        title: 'Game restarted',
        description: 'A new round has begun!',
      });
    } catch (err) {
      console.error('Error restarting game:', err);
      toast({
        title: 'Error',
        description: 'Failed to restart game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Check if user is involved in this game
  const isPlayerInGame = (): boolean => {
    if (!game || !playerId) return false;
    return game.playerX === playerId || game.playerO === playerId;
  };

  // Get player's symbol (X or O)
  const playerSymbol = game ? getPlayerSymbol(playerId, game) : null;

  // Find recent games with more efficient query
  const findRecentGames = useCallback(async (): Promise<GameState[]> => {
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }
    
    try {
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('status', '==', 'waiting'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as GameState);
    } catch (err) {
      console.error('Error finding recent games:', err);
      toast({
        title: 'Connection Error',
        description: 'Failed to load recent games. Please check your connection.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  return {
    game,
    loading,
    error,
    createGame,
    createSoloGame,
    joinGame,
    makeMove,
    restartGame,
    isPlayerInGame,
    playerSymbol,
    findRecentGames,
  };
};

export default useGame;
