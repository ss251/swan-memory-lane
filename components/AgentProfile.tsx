'use client';

import React, { useState } from 'react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { formatDate, truncateString } from '@/lib/utils';
import { 
  User, 
  Calendar, 
  Wallet, 
  Info, 
  Tag, 
  Clock, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AgentProfile() {
  const { currentAgent, isLoading } = useSwanContext();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
        <p className="mt-1 text-sm text-muted-foreground">
          {currentAgent.description}
        </p>
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
            <div className="text-xs text-muted-foreground">Artifacts Collected</div>
            <div className="font-semibold">{currentAgent.artifacts.length}</div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">Diary Entries</div>
            <div className="font-semibold">{currentAgent.diaryEntries.length}</div>
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