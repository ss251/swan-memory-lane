'use client';

import React, { useState, useEffect } from 'react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { Artifact, useLoadMoreArtifacts } from '@/lib/hooks/useArtifacts';
import { formatDate } from '@/lib/utils';
import { ShoppingBag, Calendar, Coins, ExternalLink, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

// Number of artifacts to show per page in the UI
const ARTIFACTS_PER_PAGE = 6;

interface ArtifactCardProps {
  artifact: Artifact;
  index: number;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate a deterministic background color based on artifact name
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-400 to-cyan-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-pink-500 to-rose-500',
      'bg-gradient-to-br from-indigo-500 to-blue-600',
      'bg-gradient-to-br from-emerald-500 to-teal-600',
    ];
    
    // Hash the name to get a consistent color
    const hashCode = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hashCode) % colors.length];
  };
  
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "h-60 w-full flex items-center justify-center p-4",
        getBackgroundColor(artifact.name)
      )}>
        <h3 className="text-white text-lg font-bold text-center">{artifact.name}</h3>
      </div>
      
      <motion.div 
        className="absolute inset-0 bg-black/70 p-4 flex flex-col text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-2">{artifact.name}</h3>
        <p className="text-sm text-gray-300 flex-grow">{artifact.description}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-xs text-gray-300">
            <Coins className="h-3 w-3 mr-2" />
            <span>Price: {artifact.price} ETH</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-300">
            <Calendar className="h-3 w-3 mr-2" />
            <span>Acquired: {formatDate(artifact.createdAt)}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-300">
            <Calendar className="h-3 w-3 mr-2" />
            <span>Round: {artifact.round}</span>
          </div>
          
          <button 
            className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white rounded-md py-1 text-sm flex items-center justify-center"
            onClick={() => window.open(`https://etherscan.io/address/${artifact.address}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Etherscan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Loading placeholder for artifact cards
const ArtifactCardSkeleton = ({ index }: { index: number }) => (
  <motion.div 
    className="h-60 rounded-xl shadow-md bg-gray-100 dark:bg-gray-800 animate-pulse"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  />
);

export function ArtifactGallery() {
  const { currentAgent, isLoading } = useSwanContext();
  const { 
    data: infiniteArtifacts, 
    isLoading: isArtifactsLoading,
    fetchNextPage
  } = useLoadMoreArtifacts();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalArtifacts, setTotalArtifacts] = useState(0);
  
  // Keep track of all artifacts across pages for internal pagination
  const [allArtifacts, setAllArtifacts] = useState<Artifact[]>([]);
  
  // Compute combined artifacts from both sources (infinite query and current agent)
  useEffect(() => {
    const artifactsFromPages = infiniteArtifacts?.pages
      ? infiniteArtifacts.pages.flatMap(page => page.artifacts)
      : [];
      
    const agentArtifacts = currentAgent?.artifacts || [];
    
    // Combine artifacts from both sources, eliminate duplicates by address
    const uniqueArtifacts = [...artifactsFromPages];
    
    // Add artifacts from agent if they're not already in the list
    agentArtifacts.forEach(agentArtifact => {
      if (!uniqueArtifacts.some(a => a.address === agentArtifact.address)) {
        uniqueArtifacts.push(agentArtifact);
      }
    });
    
    // Sort artifacts by round, ascending (oldest first)
    const sortedArtifacts = [...uniqueArtifacts].sort((a, b) => a.round - b.round);
    
    setAllArtifacts(sortedArtifacts);
    setTotalArtifacts(sortedArtifacts.length);
    
    // Reset to first page when artifacts change
    setCurrentPage(0);
  }, [infiniteArtifacts?.pages, currentAgent?.artifacts]);
  
  // Get artifacts for the current page
  const displayedArtifacts = allArtifacts.slice(
    currentPage * ARTIFACTS_PER_PAGE, 
    (currentPage + 1) * ARTIFACTS_PER_PAGE
  );
  
  // Calculate total number of pages
  const totalPages = Math.ceil(allArtifacts.length / ARTIFACTS_PER_PAGE);
  
  // Pagination functions
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };
  
  // Function to load more artifacts
  const handleLoadMore = () => {
    if (infiniteArtifacts?.pages) {
      const lastPage = infiniteArtifacts.pages[infiniteArtifacts.pages.length - 1];
      if (lastPage) {
        console.log('Loading more artifacts...');
        fetchNextPage();
      }
    }
  };
  
  // Function to search earlier rounds
  const handleRetryEarlierRounds = () => {
    fetchNextPage();
  };
  
  // Show retry button when no artifacts are loaded and we're not currently loading
  const showRetryButton = !isArtifactsLoading && allArtifacts.length === 0;
  
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ArtifactCardSkeleton index={0} />
          <ArtifactCardSkeleton index={1} />
          <ArtifactCardSkeleton index={2} />
          <ArtifactCardSkeleton index={3} />
          <ArtifactCardSkeleton index={4} />
          <ArtifactCardSkeleton index={5} />
        </div>
      </div>
    );
  }
  
  if (!currentAgent) {
    return (
      <div className="p-6 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Agent Selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Select an agent to view their artifact collection.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Artifacts Collection
          {totalArtifacts > 0 && (
            <Badge variant="outline" className="ml-2">
              {totalArtifacts} total
            </Badge>
          )}
        </h2>
        
        <div className="flex space-x-2">
          {isArtifactsLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading...
            </div>
          )}
        </div>
      </div>
      
      {displayedArtifacts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedArtifacts.map((artifact, index) => (
              <ArtifactCard 
                key={artifact.address} 
                artifact={artifact} 
                index={index}
              />
            ))}
          </div>
          
          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {currentPage * ARTIFACTS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ARTIFACTS_PER_PAGE, totalArtifacts)} of {totalArtifacts}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevPage} 
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage} 
                disabled={currentPage >= totalPages - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Show a button to load more if needed */}
          {currentPage >= totalPages - 1 && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadMore}
                disabled={isArtifactsLoading}
              >
                {isArtifactsLoading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading more artifacts...</>
                ) : (
                  <>Load more artifacts</>
                )}
              </Button>
            </div>
          )}
        </>
      ) : showRetryButton ? (
        <div className="text-center py-12 border rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">No artifacts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try searching earlier rounds to find artifacts.
          </p>
          <Button onClick={handleRetryEarlierRounds} disabled={isArtifactsLoading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Search Earlier Rounds
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ArtifactCardSkeleton index={0} />
          <ArtifactCardSkeleton index={1} />
          <ArtifactCardSkeleton index={2} />
          <ArtifactCardSkeleton index={3} />
          <ArtifactCardSkeleton index={4} />
          <ArtifactCardSkeleton index={5} />
        </div>
      )}
      
      {/* Info tooltip about loading artifacts */}
      <div className="mt-8 flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" className="max-w-sm">
              <p className="text-sm">
                Artifacts are loaded in batches of 10 rounds at a time. 
                The UI shows {ARTIFACTS_PER_PAGE} artifacts per page from all loaded rounds.
                Use the pagination controls to view more artifacts.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 