'use client';

import React, { useState, useEffect } from 'react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { Artifact, useLoadMoreArtifacts } from '@/lib/hooks/useArtifacts';
import { formatDate } from '@/lib/utils';
import { ShoppingBag, Calendar, Coins, ExternalLink, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
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
          
          <a 
            href={`https://base.blockscout.com/address/${artifact.address}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Blockscout
          </a>
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

export function ArtifactGallery({ agentAddress }: { agentAddress?: string }) {
  const { currentAgent, selectAgent, refreshAgentData } = useSwanContext();
  const { 
    data: infiniteArtifacts, 
    isLoading: isArtifactsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useLoadMoreArtifacts(agentAddress);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalArtifacts, setTotalArtifacts] = useState(0);
  
  // Use the provided agentAddress if available
  useEffect(() => {
    if (agentAddress) {
      selectAgent(agentAddress);
    }
  }, [agentAddress, selectAgent]);
  
  // Flatten artifacts from all pages 
  const flattenedArtifacts = React.useMemo(() => {
    if (!infiniteArtifacts) return [];
    
    // Combine all artifacts from all pages
    return infiniteArtifacts.pages.flatMap(page => page.artifacts);
  }, [infiniteArtifacts]);
  
  // Compute combined artifacts from both sources (infinite query and current agent)
  useEffect(() => {
    console.log("Processing artifacts data:", { 
      infiniteArtifactsLength: flattenedArtifacts.length,
      currentAgent: !!currentAgent
    });

    const agentArtifacts = currentAgent?.artifacts || [];
    console.log(`Found ${agentArtifacts.length} artifacts from current agent`);
    
    // Combine artifacts from both sources, eliminate duplicates by address
    const uniqueArtifacts = [...flattenedArtifacts];
    
    // Add artifacts from agent if they're not already in the list
    agentArtifacts.forEach(agentArtifact => {
      if (!uniqueArtifacts.some(a => a.address === agentArtifact.address)) {
        uniqueArtifacts.push(agentArtifact);
      }
    });
    
    // Sort artifacts by round, ascending (oldest first)
    const sortedArtifacts = [...uniqueArtifacts].sort((a, b) => a.round - b.round);
    
    console.log(`Total unique artifacts after combining: ${uniqueArtifacts.length}`);
    console.log(`Setting ${sortedArtifacts.length} sorted artifacts`);
    
    setTotalArtifacts(sortedArtifacts.length);
  }, [flattenedArtifacts, currentAgent?.artifacts]);
  
  // Get artifacts for the current page
  const displayedArtifacts = flattenedArtifacts.slice(
    currentPage * ARTIFACTS_PER_PAGE, 
    (currentPage + 1) * ARTIFACTS_PER_PAGE
  ) || [];
  
  // Calculate total number of pages
  const totalPages = Math.ceil(totalArtifacts / ARTIFACTS_PER_PAGE);
  
  // Pagination functions
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };
  
  // Function to load more artifacts
  const handleLoadMore = () => {
    console.log('handleLoadMore called', { hasNextPage, isFetchingNextPage });
    if (hasNextPage && !isFetchingNextPage) {
      console.log('Fetching next page of artifacts');
      fetchNextPage();
    } else {
      console.log('Cannot fetch next page:', { 
        hasNextPage, 
        isFetchingNextPage, 
        infiniteArtifactsCount: flattenedArtifacts.length
      });
    }
  };
  
  // Add a refresh function
  const handleRefresh = async () => {
    try {
      await refreshAgentData();
    } catch (error) {
      console.error('Failed to refresh artifacts:', error);
    }
  };
  
  if (isArtifactsLoading && displayedArtifacts.length === 0) {
    return (
      <div className="p-3 sm:p-4">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(ARTIFACTS_PER_PAGE)].map((_, index) => (
            <ArtifactCardSkeleton key={index} index={index} />
          ))}
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
          {isArtifactsLoading ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading...
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isArtifactsLoading || isFetchingNextPage}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          )}
        </div>
      </div>
      
      {displayedArtifacts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedArtifacts.map((artifact: Artifact, index: number) => (
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
                disabled={isArtifactsLoading || isFetchingNextPage || !hasNextPage}
              >
                {isFetchingNextPage ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading more artifacts...</>
                ) : isArtifactsLoading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
                ) : !hasNextPage ? (
                  <>No more artifacts to load</>
                ) : (
                  <>Load more artifacts</>
                )}
              </Button>
            </div>
          )}
        </>
      ) : isArtifactsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ArtifactCardSkeleton index={0} />
          <ArtifactCardSkeleton index={1} />
          <ArtifactCardSkeleton index={2} />
          <ArtifactCardSkeleton index={3} />
          <ArtifactCardSkeleton index={4} />
          <ArtifactCardSkeleton index={5} />
        </div>
      ) : (
        !isArtifactsLoading && !isFetchingNextPage && displayedArtifacts.length === 0 && (
          <div className="text-center py-12 border rounded-lg">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No artifacts found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try searching earlier rounds to find artifacts.
            </p>
            <Button onClick={handleLoadMore} disabled={isArtifactsLoading || isFetchingNextPage}>
              <RefreshCw className="h-4 w-4 mr-2" /> Load More Artifacts
            </Button>
          </div>
        )
      )}
    </div>
  );
} 