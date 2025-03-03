import React from 'react';
import { SwanProvider } from '@/lib/providers/SwanProvider';
import { AgentProfile } from '@/components/AgentProfile';
import { DiaryTimeline } from '@/components/DiaryTimeline';
import { ArtifactGallery } from '@/components/ArtifactGallery';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <SwanProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 order-1 lg:order-1">
              <AgentProfile />
            </div>
            
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-2">
              <DiaryTimeline />
              <ArtifactGallery />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-border mt-8 sm:mt-12 py-4 sm:py-6">
          <div className="container mx-auto px-4">
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              <p>Swan Memory Lane — A Diary Visualizer for SWAN Agents</p>
              <p className="mt-1">
                Built with Next.js, Tailwind CSS, and Farcaster Frames.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </SwanProvider>
  );
}
