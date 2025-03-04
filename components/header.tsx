'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, Menu, X, AlertCircle, User } from 'lucide-react';
import { AgentSearch } from '@/components/AgentSearch';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { truncateString } from '@/lib/utils';

// Check if we're in development mode
const isDevelopmentMode = process.env.NODE_ENV === 'development';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentAgent } = useSwanContext();
  
  return (
    <>
      {isDevelopmentMode && (
        <div className="bg-amber-500 dark:bg-amber-700 text-black dark:text-white py-2 px-4 text-center text-sm">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>
              Development Mode: Using mock data as blockchain connection is unavailable
            </p>
          </div>
        </div>
      )}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold">Swan Memory Lane</h1>
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Beta</span>
            </div>
          </Link>
          {/* Agent Search - Desktop */}
          <div className="hidden md:block w-1/3 mx-4">
            <AgentSearch />
          </div>
          
          {/* Current Agent Indicator - Desktop */}
          
          
          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button 
              className="text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? 
                <X className="h-5 w-5 hover:text-foreground" /> : 
                <Menu className="h-5 w-5 hover:text-foreground" />
              }
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            {currentAgent && (
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium">{currentAgent.name}</span>
                <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded text-[10px]">
                  {truncateString(currentAgent.address, 6)}
                </span>
              </div>
            )}
            <Link
              href="https://github.com/firstbatchxyz/swan-contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center"
            >
              <GitHubLogoIcon className="mr-1 h-4 w-4" />
              <span>SWAN Protocol</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-border bg-background">
            {/* Agent Search - Mobile */}
            <div className="mb-4">
              <AgentSearch />
            </div>
            
            {/* Current Agent Indicator - Mobile */}
            {currentAgent && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 bg-muted/30 rounded">
                <User className="h-3 w-3" />
                <span className="font-medium">{currentAgent.name}</span>
                <span className="font-mono bg-background/50 px-1.5 py-0.5 rounded text-[10px]">
                  {truncateString(currentAgent.address, 6)}
                </span>
              </div>
            )}
            
            <nav className="flex flex-col space-y-4">
              <Link
                href="https://github.com/firstbatchxyz/swan-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <GitHubLogoIcon className="mr-2 h-4 w-4" />
                <span className='mr-4'>SWAN Protocol</span>
                
              </Link>
              
              
              
              
              
              <div className="pt-2">
                
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
