'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold">Swan Memory Lane</h1>
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Beta</span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://github.com/swan-io/swan-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            <GitHubLogoIcon className="mr-1 h-4 w-4" />
            <span>SWAN Protocol</span>
          </Link>
          
          <Link
            href="https://warpcast.com/~/developers/frames"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-500 hover:text-purple-400 flex items-center font-medium"
          >
            <span className="mr-1 text-lg">⌘</span>
            <span>Frame Validator</span>
          </Link>
          
          <Link
            href="https://docs.farcaster.xyz/learn/what-is-farcaster"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Farcaster Docs
          </Link>
          
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t border-border bg-background">
          <nav className="flex flex-col space-y-4">
            <Link
              href="https://github.com/swan-io/swan-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GitHubLogoIcon className="mr-2 h-4 w-4" />
              <span>SWAN Protocol</span>
            </Link>
            
            <Link
              href="https://warpcast.com/~/developers/frames"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-500 hover:text-purple-400 flex items-center font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-2 text-lg">⌘</span>
              <span>Frame Validator</span>
            </Link>
            
            <Link
              href="https://docs.farcaster.xyz/learn/what-is-farcaster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Farcaster Docs
            </Link>
            
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
