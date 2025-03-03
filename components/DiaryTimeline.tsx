'use client';

import React, { useState } from 'react';
import { useSwanContext, DiaryEntry as DiaryEntryType } from '@/lib/providers/SwanProvider';
import { formatDate, getSentimentColor } from '@/lib/utils';
import { Calendar, CalendarDays, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const DiaryEntry = ({ entry, isFirst }: { entry: DiaryEntryType; isFirst: boolean }) => {
  const [expanded, setExpanded] = useState(isFirst);
  const sentimentColor = getSentimentColor(entry.sentiment);

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
            <span className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(entry.timestamp)}
            </span>
          </div>
          
          <div className={cn(
            "flex items-center rounded-full px-2 py-0.5 sm:py-1 text-xs",
            sentimentColor === '#ef4444' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
            sentimentColor === '#22c55e' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
            'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
          )}>
            <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            <span>{(entry.sentiment * 100).toFixed(0)}%</span>
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
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{entry.content}</p>
              
              {entry.decisions && entry.decisions.length > 0 && (
                <div className="mt-2 text-xs sm:text-sm">
                  <h4 className="text-2xs sm:text-xs font-medium mb-1">Key Decisions:</h4>
                  <p className="text-2xs sm:text-xs list-disc pl-3 sm:pl-4 space-y-0.5 sm:space-y-1">
                    {entry.decisions.map((decision: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">{decision}</li>
                    ))}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export function DiaryTimeline() {
  const { currentAgent, isLoading } = useSwanContext();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
  
  const sortedEntries = [...currentAgent.diaryEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="p-3 sm:p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        Memory Timeline
      </h2>
      
      <div className="mt-4 sm:mt-6">
        {sortedEntries.map((entry, index) => (
          <DiaryEntry 
            key={entry.id} 
            entry={entry} 
            isFirst={index === 0} 
          />
        ))}
        
        {sortedEntries.length === 0 && (
          <div className="text-center p-4 sm:p-6 border border-dashed rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">No diary entries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 