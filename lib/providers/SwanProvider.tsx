'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAgentData, DiaryEntry } from '@/lib/hooks/useAgentData';
import { useArtifacts, Artifact } from '@/lib/hooks/useArtifacts';
import { DEFAULT_AGENT_ADDRESS } from '@/lib/hooks/useAgentData';

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

// Define the shape of our context
type SwanContextType = {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  isArtifactsLoading: boolean;
  isDiaryLoading: boolean;
  error: string | null;
  selectAgent: (agentId: string) => void;
  refreshAgentData: () => Promise<void>;
  loadAgentByAddress: (address: string) => void;
  currentAgentAddress: string;
  setDiaryEntries: (entries: DiaryEntry[]) => void;
};

// Create the context
const SwanContext = createContext<SwanContextType | undefined>(undefined);

// Provider component
export const SwanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAgentAddress, setCurrentAgentAddress] = useState<string>(DEFAULT_AGENT_ADDRESS);

  // Use our custom hooks to fetch data from the blockchain
  const { data: agentData, isLoading: isAgentLoading, error: agentError, isFetching: isAgentFetching } = useAgentData(currentAgentAddress);
  const { data: artifacts, isLoading: isArtifactsLoadingState, error: artifactsError } = useArtifacts(currentAgentAddress);

  // Track specific loading states
  const isLoading = isAgentLoading;
  const isDiaryLoading = isAgentFetching && !isAgentLoading;
  const isArtifactsLoading = isArtifactsLoadingState;

  // Update agent basic info as soon as it's available
  useEffect(() => {
    console.log("Agent data update:", { agentData, isAgentLoading });
    
    // Proceed if we have agent data, regardless of artifacts
    if (agentData && !isAgentLoading) {
      try {
        console.log("Processing agent data:", agentData);
        
        // Format the treasury value - make sure it's a string to handle large numbers correctly
        const treasuryStr = agentData.treasury.toString();
        // Convert to ETH format (divide by 10^18) and round to 4 decimal places for display
        const treasuryEth = (Number(treasuryStr) / 1e18).toFixed(4);
        
        // Make sure we have diary entries
        const diaryEntries = agentData.diaryEntries || [];
        console.log("Diary entries:", diaryEntries.length, diaryEntries);
        
        // Convert blockchain data to our Agent type
        const agent: Agent = {
          id: agentData.address,
          address: agentData.address,
          name: agentData.name || "Unknown Agent",
          description: agentData.description || "No description available",
          createdAt: new Date(agentData.createdAt * 1000), // Convert from timestamp to Date
          treasury: treasuryEth,
          listingFee: 5, // Default for now
          currentRound: agentData.round,
          artifacts: [], // Initialize with empty array, will be updated later
          diaryEntries: diaryEntries, // Ensure we set diary entries from agentData
        };

        console.log("Created agent object:", agent);
        
        // Update the agents list, replacing any existing agent with the same address
        setAgents(prevAgents => {
          const existingIndex = prevAgents.findIndex(a => a.address === agent.address);
          if (existingIndex >= 0) {
            const newAgents = [...prevAgents];
            newAgents[existingIndex] = agent;
            return newAgents;
          } else {
            return [...prevAgents, agent];
          }
        });
        
        // Set as current agent if it matches the currentAgentAddress
        if (agent.address === currentAgentAddress) {
          setCurrentAgent(agent);
        }
        
        setError(null);
      } catch (err: unknown) {
        console.error('Error processing agent data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to process agent data: ${errorMessage}`);
      }
    }
  }, [agentData, isAgentLoading, currentAgentAddress]);

  // Update artifacts when they become available
  useEffect(() => {
    console.log("Artifacts update:", { artifacts, isArtifactsLoadingState });
    
    // Only update artifacts if we already have an agent and artifacts data
    if (artifacts && currentAgent && !isArtifactsLoadingState) {
      try {
        // Create a fresh artifacts array to avoid reference issues
        const newArtifacts = [...artifacts];
        
        // Update the current agent with the new artifacts, only if they've changed
        setCurrentAgent(prevAgent => {
          if (!prevAgent) return null;
          
          // Check if artifacts have actually changed before updating
          if (JSON.stringify(prevAgent.artifacts) === JSON.stringify(newArtifacts)) {
            return prevAgent; // No change, return the previous agent to avoid re-render
          }
          
          return {
            ...prevAgent,
            artifacts: newArtifacts
          };
        });
        
        // Also update in the agents list
        setAgents(prevAgents => {
          return prevAgents.map(agent => {
            if (agent.address === currentAgentAddress) {
              // Check if artifacts have actually changed before updating
              if (JSON.stringify(agent.artifacts) === JSON.stringify(newArtifacts)) {
                return agent; // No change, return the previous agent to avoid re-render
              }
              
              return {
                ...agent,
                artifacts: newArtifacts
              };
            }
            return agent;
          });
        });
      } catch (err: unknown) {
        console.error('Error updating artifacts:', err);
      }
    }
  }, [artifacts, isArtifactsLoadingState]);

  // Set error if any of our data fetching failed
  useEffect(() => {
    if (agentError || artifactsError) {
      setError(agentError?.message || artifactsError?.message || 'Unknown error occurred');
    }
  }, [agentError, artifactsError]);

  // Function to select an agent
  const selectAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setCurrentAgent(agent);
      setCurrentAgentAddress(agent.address);
    } else {
      setError(`Agent with ID ${agentId} not found`);
    }
  };

  // Function to load an agent by address
  const loadAgentByAddress = (address: string) => {
    console.log(`Loading agent with address: ${address}`);
    setCurrentAgentAddress(address);
    // The useEffect will handle updating the currentAgent when data is loaded
  };

  // Function to refresh agent data
  const refreshAgentData = async () => {
    // This will trigger a refetch since we're using React Query
    return Promise.resolve();
  };

  // Function to update diary entries (useful for loading more)
  const setDiaryEntries = (entries: DiaryEntry[]) => {
    if (!currentAgent) return;
    
    // Update the current agent with new diary entries
    const updatedAgent = {
      ...currentAgent,
      diaryEntries: entries
    };
    
    // Update current agent
    setCurrentAgent(updatedAgent);
    
    // Also update in the agents list
    setAgents(prevAgents => {
      return prevAgents.map(agent => 
        agent.id === currentAgent.id ? updatedAgent : agent
      );
    });
  };

  // Context value
  const value = {
    agents,
    currentAgent,
    isLoading,
    isArtifactsLoading,
    isDiaryLoading,
    error,
    selectAgent,
    refreshAgentData,
    loadAgentByAddress,
    currentAgentAddress,
    setDiaryEntries
  };

  return <SwanContext.Provider value={value}>{children}</SwanContext.Provider>;
};

// Custom hook to use the context
export const useSwanContext = () => {
  const context = useContext(SwanContext);
  if (context === undefined) {
    throw new Error('useSwanContext must be used within a SwanProvider');
  }
  return context;
}; 