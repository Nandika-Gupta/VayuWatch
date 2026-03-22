import React, { useState, useEffect } from 'react';
import { Wind, Search } from 'lucide-react';

interface HeaderProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  isSocketConnected: boolean;
}

export function Header({ currentCity, onCityChange, isSocketConnected }: HeaderProps) {
  const [searchInput, setSearchInput] = useState(currentCity);

  useEffect(() => {
    setSearchInput(currentCity);
  }, [currentCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      onCityChange(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = searchInput.trim();
      if (trimmed) {
        onCityChange(trimmed);
      }
    }
  };

  return (
    <header className="w-full py-4 px-4 sm:px-8 border-b border-white/5 bg-background/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 shadow-lg shadow-primary/30">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              Vayu<span className="text-primary">Watch</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isSocketConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSocketConnected ? 'bg-primary' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {isSocketConnected ? 'Live Data Feed' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:flex-none group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search city (e.g. Mumbai)"
              className="block w-full sm:w-72 pl-10 pr-4 py-2.5 bg-card border border-white/10 text-foreground rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-card/90 transition-all duration-200 text-sm"
            />
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-lg shadow-primary/30 whitespace-nowrap"
          >
            Track
          </button>
        </form>

      </div>
    </header>
  );
}
