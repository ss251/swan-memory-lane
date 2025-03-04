'use client';

import React, { useState, useEffect } from 'react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { DiaryEntry as DiaryEntryType, fetchMoreDiaryEntries } from '@/lib/hooks/useAgentData';
import { getSentimentColor } from '@/lib/utils';
import { Calendar, CalendarDays, ChevronDown, ChevronUp, Heart, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

const DiaryEntry = ({ entry, isFirst }: { entry: DiaryEntryType; isFirst: boolean }) => {
  const [expanded, setExpanded] = useState(isFirst);
  const sentimentColor = getSentimentColor(entry.sentiment);

  // Function to format diary content with paragraphs
  const formatDiaryContent = (content: string) => {
    // Split content by double newlines to identify paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return (
      <div className="space-y-3">
        {paragraphs.map((paragraph, i) => {
          // Check if this is a heading-like paragraph (numbered list item or all caps)
          const isHeading = /^\d+\.\s/.test(paragraph) || 
                           paragraph.toUpperCase() === paragraph && paragraph.length > 10;
          
          return (
            <div key={i} className={isHeading ? "font-medium" : ""}>
              {/* Split by single newlines to preserve list formatting */}
              {paragraph.split('\n').map((line, j) => (
                <div key={j} className={line.startsWith('-') ? "pl-2" : ""}>
                  {line}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      className={cn(
        "mb-6 sm:mb-8 relative",
        isFirst ? "border-l-4 border-primary" : "border-l-2 sm:border-l-4 border-gray-200 dark:border-gray-800"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: isFirst ? 0 : 0.1 }}
    >
      <div className="absolute -left-1.5 sm:-left-2 mt-1.5">
        <div className={cn(
          "h-3 w-3 sm:h-4 sm:w-4 rounded-full", 
          isFirst ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
        )}/>
      </div>
      
      <div className="pl-4 sm:pl-6">
        <div className="flex flex-wrap items-center mb-2 gap-2">
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
            {entry.arweaveId ? (
              <a 
                href={`https://arweave.net/${entry.arweaveId}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline flex items-center"
              >
                View on Arweave
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Not yet on Arweave
              </span>
            )}
          </div>
          
          <div className={cn(
            "flex items-center rounded-full px-2 py-0.5 sm:py-1 text-xs",
            sentimentColor === '#ef4444' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
            sentimentColor === '#22c55e' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
            'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
          )}>
            <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            <span>
              {typeof entry.sentiment === 'number' 
                ? `${(entry.sentiment * 100).toFixed(0)}%`
                : entry.sentiment === 'positive' 
                  ? 'Positive' 
                  : entry.sentiment === 'negative' 
                    ? 'Negative' 
                    : 'Neutral'
              }
            </span>
          </div>
        </div>
        
        <div 
          className="flex items-center font-medium cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h3 className="text-sm sm:text-base">Round {entry.round} Entry</h3>
          {expanded ? (
            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          ) : (
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          )}
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                {formatDiaryContent(entry.content)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Loading animation for timeline entries
const LoadingEntry = ({ index }: { index: number }) => (
  <div 
    className="mb-6 sm:mb-8 relative border-l-2 sm:border-l-4 border-gray-200 dark:border-gray-800"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="absolute -left-1.5 sm:-left-2 mt-1.5">
      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
    </div>
    
    <div className="pl-4 sm:pl-6">
      <div className="flex items-center mb-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-2" />
      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
    </div>
  </div>
);

export function DiaryTimeline({ agentAddress }: { agentAddress?: string }) {
  const { 
    currentAgent, 
    isLoading, 
    isDiaryLoading, 
    updateDiaryEntries, 
    selectAgent,
    refreshAgentData 
  } = useSwanContext();
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState<DiaryEntryType[]>([]);
  
  // Use the provided agentAddress if available
  useEffect(() => {
    if (agentAddress) {
      selectAgent(agentAddress);
    }
  }, [agentAddress, selectAgent]);

  // Track when diary entries change
  useEffect(() => {
    if (currentAgent?.diaryEntries) {
      console.log(`DiaryTimeline: Agent entries updated: ${currentAgent.diaryEntries.length} entries`);
      // Keep a local copy of entries to force re-render
      setLocalEntries(currentAgent.diaryEntries);
    }
  }, [currentAgent?.diaryEntries]);

  // Sort diary entries by round in descending order (newest first)
  const sortedDiaryEntries = localEntries.length > 0 
    ? [...localEntries].sort((a, b) => b.round - a.round) 
    : currentAgent?.diaryEntries 
      ? [...currentAgent.diaryEntries].sort((a, b) => b.round - a.round) 
      : [];
  
  // Function to load more diary entries
  const handleLoadMore = async () => {
    if (!currentAgent || loadingMore) return;
    
    setLoadingMore(true);
    setError(null); // Reset error state
    
    try {
      console.log(`Loading more entries for agent: ${currentAgent.address}`);
      console.log(`Current entries: ${currentAgent.diaryEntries.length} with rounds: ${[...currentAgent.diaryEntries].sort((a, b) => b.round - a.round).map(e => e.round).join(', ')}`);
      
      const newEntries = await fetchMoreDiaryEntries(
        currentAgent.address, 
        currentAgent.diaryEntries,
        5 // Load 5 more diary entries
      );
      
      if (newEntries.length > 0) {
        console.log(`Found ${newEntries.length} new entries with rounds: ${newEntries.map(e => e.round).join(', ')}`);
        
        // Just pass all entries to the provider - it will handle merging and deduplication
        const allEntries = [...currentAgent.diaryEntries, ...newEntries];
        console.log(`Passing ${allEntries.length} total entries to provider`);
        
        // Update the provider state directly - it will handle merging
        updateDiaryEntries(allEntries);
      } else {
        setError("No more diary entries found.");
      }
    } catch (err) {
      console.error('Error loading more diary entries:', err);
      setError("Failed to load more diary entries. Please try again later.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to refresh diary entries
  const handleRefresh = async () => {
    setError(null);
    try {
      await refreshAgentData();
    } catch (err) {
      console.error('Error refreshing diary entries:', err);
      setError("Failed to refresh diary entries.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-6"></div>
        <div className="mt-4 sm:mt-6">
          <LoadingEntry index={0} />
          <LoadingEntry index={1} />
          <LoadingEntry index={2} />
        </div>
      </div>
    );
  }
  
  if (!currentAgent) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
        <h3 className="text-base sm:text-lg font-medium">No Agent Selected</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Select an agent to view their diary timeline.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Memory Timeline
          {isDiaryLoading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
        </h2>

        {!isDiaryLoading && currentAgent && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isDiaryLoading}
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-amber-800 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mt-4 sm:mt-6">
        {isDiaryLoading ? (
          // Show loading indicators when diary entries are loading
          <>
            <LoadingEntry index={0} />
            <LoadingEntry index={1} />
            <LoadingEntry index={2} />
          </>
        ) : sortedDiaryEntries.length > 0 ? (
          // Show diary entries when loaded
          <>
            {sortedDiaryEntries.map((entry, index) => (
              <DiaryEntry 
                key={`entry-${entry.round}-${entry.timestamp}`}
                entry={entry} 
                isFirst={index === 0} 
              />
            ))}
            
            {/* Load more button */}
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading more entries...</>
                ) : (
                  <>Load earlier entries</>
                )}
              </Button>
            </div>
          </>
        ) : (
          // Show empty state if no entries
          <div className="text-center p-4 sm:p-6 border border-dashed rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-medium">No Diary Entries Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The oracle hasn&apos;t recorded any entries for this agent.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may be due to an ABI mismatch with the Oracle Coordinator contract.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 