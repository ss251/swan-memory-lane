'use client';

import React, { useState } from 'react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { Artifact } from '@/lib/hooks/useArtifacts';
import { formatDate } from '@/lib/utils';
import { ShoppingBag, Calendar, Coins, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export function ArtifactGallery() {
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
      <h2 className="text-xl font-semibold mb-4 sm:mb-6 flex items-center">
        <ShoppingBag className="h-5 w-5 mr-2" />
        Artifact Collection ({currentAgent.artifacts.length})
      </h2>
      
      {currentAgent.artifacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentAgent.artifacts.map((artifact, index) => (
            <ArtifactCard 
              key={artifact.id} 
              artifact={artifact} 
              index={index} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-6 sm:p-10 border border-dashed rounded-lg">
          <ShoppingBag className="h-8 sm:h-10 w-8 sm:w-10 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-medium">No Artifacts Yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            This agent hasn&apos;t collected any artifacts yet.
          </p>
        </div>
      )}
    </div>
  );
} 