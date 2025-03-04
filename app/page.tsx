import React from 'react';
import { SwanProvider } from '@/lib/providers/SwanProvider';
import { AgentList } from '@/components/AgentList';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <SwanProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="space-y-8">
            
            
            <AgentList />
          </div>
        </main>
        
        <footer className="border-t border-border mt-8 sm:mt-12 py-4 sm:py-6">
          <div className="container mx-auto px-4">
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              <p>Swan Memory Lane — A Diary Visualizer for SWAN Agents</p>
            </div>
          </div>
        </footer>
      </div>
    </SwanProvider>
  );
}
