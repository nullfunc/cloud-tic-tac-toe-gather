
export type Player = "X" | "O" | null;
export type GameBoard = Array<Player>;
export type GameStatus = "waiting" | "in-progress" | "finished";

export interface GameState {
  id: string;
  board: GameBoard;
  currentTurn: Player;
  playerX: string | null;
  playerO: string | null;
  winner: Player;
  status: GameStatus;
  createdAt: number;
  updatedAt: number;
  isSinglePlayer?: boolean;
}

export const initialBoard: GameBoard = Array(9).fill(null);

export const createInitialGameState = (gameId: string, creatorId: string): GameState => {
  return {
    id: gameId,
    board: initialBoard,
    currentTurn: "X",
    playerX: creatorId,
    playerO: null,
    winner: null,
    status: "waiting",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const checkWinner = (board: GameBoard): Player => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // Check for draw
  if (!board.includes(null)) {
    return null;
  }

  return null;
};

export const isGameDraw = (board: GameBoard): boolean => {
  return !board.includes(null) && !checkWinner(board);
};

export const getWinningLine = (board: GameBoard): number[] | null => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return lines[i];
    }
  }

  return null;
};

export const formatGameId = (gameId: string): string => {
  return gameId.slice(0, 6).toUpperCase();
};

export const getPlayerSymbol = (
  playerId: string | null,
  game: GameState | null
): Player => {
  if (!game || !playerId) return null;
  if (game.playerX === playerId) return "X";
  if (game.playerO === playerId) return "O";
  return null;
};

export const canMakeMove = (
  game: GameState,
  playerId: string | null,
  cellIndex: number
): boolean => {
  if (!playerId || !game) return false;
  if (game.status !== "in-progress") return false;
  if (game.board[cellIndex] !== null) return false;
  
  // For single-player games, allow moves regardless of current turn
  if (game.isSinglePlayer) return true;
  
  const playerSymbol = getPlayerSymbol(playerId, game);
  return playerSymbol === game.currentTurn;
};

export const generateRandomName = (): string => {
  const adjectives = ['Silent', 'Swift', 'Brave', 'Clever', 'Gentle', 'Sharp', 'Calm', 'Wild', 'Proud', 'Bold'];
  const nouns = ['Hawk', 'Wolf', 'Fox', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Deer', 'Owl', 'Raven'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 1000)}`;
};
