
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import GameLobby from '@/components/GameLobby';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Play Tic Tac Toe
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Challenge your friends to a game of Tic Tac Toe, no matter where they are. Create a game and share the code.
            </p>
          </div>
          
          <div className="w-full flex justify-center">
            <GameLobby />
          </div>
        </div>
      </main>
      
      <footer className="py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Built with minimalist design principles.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
