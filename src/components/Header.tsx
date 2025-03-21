
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("px-4 py-4 w-full mx-auto", className)}>
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="absolute font-medium">X</span>
              <span className="absolute font-medium opacity-0 animate-pulse-subtle">O</span>
            </div>
            <span>TicTacToe</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
