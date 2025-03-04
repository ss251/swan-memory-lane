'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAgentData, DiaryEntry } from '@/lib/hooks/useAgentData';
import { useArtifacts, Artifact } from '@/lib/hooks/useArtifacts';

// Types for the Swan data structures
export type Agent = {
  id: string;
  address: string;
  name: string;
  description: string;
  createdAt: Date;
  treasury: string;
  listingFee: number;
  currentRound: number;
  artifacts: Artifact[];
  diaryEntries: DiaryEntry[];
};

// First update the SwanContextType interface to include refreshAgentData
export interface SwanContextType {
  // Current state
  agents: Agent[];
  currentAgent: Agent | null;
  currentAgentAddress: string | null;
  isLoading: boolean;
  isDiaryLoading: boolean;
  isArtifactsLoading: boolean;
  error: string | null;
  
  // Actions
  selectAgent: (address: string) => void;
  refreshAgentData: () => Promise<void>;
  updateDiaryEntries: (diaryEntries: DiaryEntry[]) => void;
}

// Create the context
const SwanContext = createContext<SwanContextType | undefined>(undefined);

// Provider component
export const SwanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAgentAddress, setCurrentAgentAddress] = useState<string | null>(null);

  // Use our custom hooks to fetch data from the blockchain only when an address is specified
  const { 
    data: agentData, 
    isLoading: isAgentLoading, 
    isFetching: isAgentFetching,
    refetch: refetchAgentData
  } = useAgentData(currentAgentAddress || undefined);
  
  const { 
    data: artifacts, 
    isLoading: isArtifactsLoadingState, 
    refetch: refetchArtifacts
  } = useArtifacts(currentAgentAddress || undefined);

  // Track specific loading states
  const isLoading = isAgentLoading || isAgentFetching;
  const isArtifactsLoading = isArtifactsLoadingState;
  const isDiaryLoading = isAgentLoading; // Diaries are loaded with agent data

  // Update agent data when it changes
  useEffect(() => {
    if (agentData && !isLoading) {
      // Convert to proper Agent type
      const agent: Agent = {
        id: agentData.address,
        address: agentData.address,
        name: agentData.name,
        description: agentData.description,
        createdAt: new Date(agentData.createdAt * 1000),
        treasury: agentData.treasury,
        listingFee: 5, // Default listing fee
        currentRound: agentData.round,
        artifacts: currentAgent?.artifacts || [],
        // Preserve existing diary entries if we have more than what's in agentData
        // This prevents losing entries loaded via "load more"
        diaryEntries: currentAgent && currentAgent.diaryEntries.length > agentData.diaryEntries.length
          ? currentAgent.diaryEntries
          : agentData.diaryEntries,
      };
      
      // Only update if the data actually changed
      // Check if we already have this agent with the same data to prevent infinite updates
      if (!currentAgent || 
          currentAgent.address !== agent.address || 
          currentAgent.currentRound !== agent.currentRound ||
          (currentAgent.diaryEntries.length < agent.diaryEntries.length)) {
        console.log(`Agent data changed, updating state (diary entries: ${agent.diaryEntries.length})`);
        // Update the current agent state
        setCurrentAgent(agent);
      }
    }
  }, [agentData, isLoading, currentAgent]);

  // Update artifacts when they change
  useEffect(() => {
    if (artifacts && currentAgent) {
      // Deep comparison to check if artifacts actually changed
      const hasArtifactsChanged = 
        currentAgent.artifacts.length !== artifacts.length ||
        JSON.stringify(currentAgent.artifacts) !== JSON.stringify(artifacts);
      
      if (hasArtifactsChanged) {
        console.log('Artifacts changed, updating agent state');
        setCurrentAgent(prev => prev ? {
          ...prev,
          artifacts: artifacts
        } : null);
      }
    }
  }, [artifacts, currentAgent]);

  // Function to refresh agent data
  const refreshAgentData = async () => {
    if (currentAgentAddress) {
      try {
        await Promise.all([
          refetchAgentData(),
          refetchArtifacts()
        ]);
      } catch (error) {
        console.error('Error refreshing agent data:', error);
        setError('Failed to refresh agent data');
      }
    }
  };

  // Function to select an agent
  const selectAgent = (address: string) => {
    // Only update if the address is different, prevents infinite loops
    if (currentAgentAddress !== address) {
      setCurrentAgentAddress(address);
    }
    // The useEffect will handle updating the currentAgent when data is loaded
  };

  // Function to update diary entries (useful for loading more)
  const setDiaryEntries = (entries: DiaryEntry[]) => {
    if (!currentAgent) return;
    
    console.log(`SwanProvider: Updating diary entries from ${currentAgent.diaryEntries.length} to ${entries.length}`);
    
    // Create a Map to ensure uniqueness by round
    const entriesMap = new Map<number, DiaryEntry>();
    
    // Add existing entries to the map first
    for (const entry of currentAgent.diaryEntries) {
      entriesMap.set(entry.round, entry);
    }
    
    // Add new entries to the map (will overwrite if same round)
    for (const entry of entries) {
      entriesMap.set(entry.round, entry);
    }
    
    // Convert map back to array and sort by round
    const mergedEntries = Array.from(entriesMap.values());
    
    console.log(`SwanProvider: Final merged entries: ${mergedEntries.length} with rounds: ${mergedEntries.map(e => e.round).sort((a, b) => b - a).join(', ')}`);
    
    // Create a new agent object with the updated entries
    const updatedAgent = {
      ...currentAgent,
      diaryEntries: mergedEntries // Use merged entries with duplicates removed
    };
    
    // Update current agent with the new agent object
    setCurrentAgent(updatedAgent);
    
    // Also update in the agents list
    setAgents(prevAgents => {
      const updatedAgents = prevAgents.map(agent => 
        agent.id === currentAgent.id ? updatedAgent : agent
      );
      
      console.log(`SwanProvider: Updated agents list with ${mergedEntries.length} diary entries`);
      return updatedAgents;
    });
  };

  // Then update the provider value in the return statement
  return (
    <SwanContext.Provider value={{
      // Current state
      agents,
      currentAgent,
      currentAgentAddress,
      isLoading,
      isDiaryLoading,
      isArtifactsLoading,
      error,
      
      // Actions
      selectAgent,
      refreshAgentData,
      updateDiaryEntries: setDiaryEntries,
    }}>
      {children}
    </SwanContext.Provider>
  );
};

// Custom hook to use the context
export const useSwanContext = () => {
  const context = useContext(SwanContext);
  if (context === undefined) {
    throw new Error('useSwanContext must be used within a SwanProvider');
  }
  return context;
}; 