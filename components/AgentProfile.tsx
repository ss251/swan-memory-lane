'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Copy, 
  Check, 
  Book, 
  Activity, 
  Target,
  Calendar, 
  Wallet, 
  Info, 
  Tag, 
  Clock, 
  ExternalLink
} from 'lucide-react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { formatDate, truncateString } from '@/lib/utils';

// Function to parse and format agent description
const formatAgentDescription = (description: string) => {
  // Check if description contains XML-like tags
  if (!description.includes('<') || !description.includes('>')) {
    return <p className="mt-1 text-sm text-muted-foreground">{description}</p>;
  }
  
  // Helper function to extract content between tags
  const extractContent = (tag: string) => {
    const startTag = `<${tag}>`;
    const endTag = `</${tag}>`;
    const startIndex = description.indexOf(startTag);
    const endIndex = description.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1) {
      return description.substring(startIndex + startTag.length, endIndex).trim();
    }
    return null;
  };
  
  // Extract different sections
  const backstory = extractContent('backstory');
  const behaviour = extractContent('behaviour');
  const objective = extractContent('objective');
  
  if (!backstory && !behaviour && !objective) {
    return <p className="mt-1 text-sm text-muted-foreground">{description}</p>;
  }
  
  return (
    <div className="space-y-4 mt-2">
      {backstory && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center text-sm font-medium mb-2 text-primary">
            <Book className="h-4 w-4 mr-2" />
            Backstory
          </div>
          <p className="text-sm text-muted-foreground">{backstory}</p>
        </div>
      )}
      
      {behaviour && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center text-sm font-medium mb-2 text-amber-500">
            <Activity className="h-4 w-4 mr-2" />
            Behaviour
          </div>
          <p className="text-sm text-muted-foreground">{behaviour}</p>
        </div>
      )}
      
      {objective && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center text-sm font-medium mb-2 text-emerald-500">
            <Target className="h-4 w-4 mr-2" />
            Objectives
          </div>
          <div className="text-sm text-muted-foreground">
            {/* Handle bullet points in objectives */}
            {objective.includes('-') ? (
              <ul className="list-disc pl-5 space-y-1">
                {objective.split('-').filter(Boolean).map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            ) : (
              <p>{objective}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function AgentProfile() {
  const { currentAgent, isLoading, isArtifactsLoading, isDiaryLoading } = useSwanContext();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isLoading) {
    return (
      <motion.div 
        className="p-4 sm:p-6 bg-card rounded-xl shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-14 w-14 mb-4 sm:mb-0 sm:mr-4 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse"></div>
            <div className="mt-2 h-6 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
        
        <div className="mt-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (!currentAgent) {
    return (
      <div className="p-6 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Agent Selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Select an agent to view their profile.
        </p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="p-4 sm:p-6 bg-card rounded-xl shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start">
        <div className="bg-primary/10 rounded-full p-3 mb-4 sm:mb-0 sm:mr-4 self-start">
          <User className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">{currentAgent.name}</h2>
          
          {/* Address with copy and etherscan buttons */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
              {truncateString(currentAgent.address, 20)}
            </div>
            
            <button 
              className="inline-flex items-center text-primary hover:text-primary/80 text-xs"
              onClick={() => copyToClipboard(currentAgent.address)}
              title="Copy address"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button 
              className="inline-flex items-center text-primary hover:text-primary/80 text-xs"
              onClick={() => window.open(`https://basescan.org/address/${currentAgent.address}`, '_blank')}
              title="View on BaseScan"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>BaseScan</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium flex items-center">
          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
          Description
        </h3>
        {formatAgentDescription(currentAgent.description)}
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-6">
        <InfoCard 
          icon={<Calendar className="h-4 w-4 text-blue-500" />}
          label="Created On"
          value={formatDate(currentAgent.createdAt)}
          colorClass="bg-blue-500/10"
        />
        
        <InfoCard 
          icon={<Wallet className="h-4 w-4 text-green-500" />}
          label="Treasury"
          value={`${currentAgent.treasury} ETH`}
          colorClass="bg-green-500/10"
        />
        
        <InfoCard 
          icon={<Tag className="h-4 w-4 text-amber-500" />}
          label="Listing Fee"
          value={`${currentAgent.listingFee}%`}
          colorClass="bg-amber-500/10"
        />
        
        <InfoCard 
          icon={<Clock className="h-4 w-4 text-purple-500" />}
          label="Current Round"
          value={`Round ${currentAgent.currentRound}`}
          colorClass="bg-purple-500/10"
        />
      </div>
      
      <div className="mt-6 bg-muted/50 rounded-lg p-3 sm:p-4">
        <h3 className="text-sm font-medium mb-2">Agent Stats</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground flex items-center">
              Artifacts Collected
              {isArtifactsLoading && (
                <div className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              )}
            </div>
            <div className="font-semibold">
              {isArtifactsLoading ? (
                <div className="inline-block w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                currentAgent.artifacts.length
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground flex items-center">
              Diary Entries
              {isDiaryLoading && (
                <div className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              )}
            </div>
            <div className="font-semibold">
              {isDiaryLoading ? (
                <div className="inline-block w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                currentAgent.diaryEntries.length
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, colorClass }) => {
  return (
    <div className="flex items-center p-2 sm:p-3 bg-card rounded-lg shadow-sm border border-border">
      <div className={`${colorClass} rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}; 