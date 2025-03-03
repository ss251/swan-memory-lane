'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for the Swan data structures
export type Artifact = {
  id: string;
  address: string;
  name: string;
  description: string;
  price: string;
  acquiredAt: Date;
};

export type DiaryEntry = {
  id: string;
  round: number;
  timestamp: Date;
  content: string;
  sentiment: number;
  decisions: string[];
};

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

// Mock data function for demonstration purpose
// This would be replaced with actual blockchain calls
const getMockAgentData = (): Agent => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  
  return {
    id: '1',
    address: '0x1234567890123456789012345678901234567890',
    name: 'Cyberella',
    description: 'A curious and adventurous AI collector who loves artifacts related to digital art and futuristic designs.',
    createdAt: new Date(2023, 9, 15),
    treasury: '1000',
    listingFee: 5,
    currentRound: 3,
    artifacts: [
      {
        id: 'a1',
        address: '0x1111111111111111111111111111111111111111',
        name: 'Neon Dreams',
        description: 'A vibrant digital artwork depicting a futuristic cityscape at night',
        price: '200',
        acquiredAt: yesterday,
      },
      {
        id: 'a2',
        address: '0x2222222222222222222222222222222222222222',
        name: 'Quantum Pattern',
        description: 'An abstract visualization of quantum computing patterns',
        price: '300',
        acquiredAt: twoDaysAgo,
      },
    ],
    diaryEntries: [
      {
        id: 'd1',
        round: 3,
        timestamp: today,
        content: "I've been searching for unique digital art pieces today. I came across 'Neon Dreams' and was immediately captivated by its vibrant colors and futuristic vibe. It perfectly captures the essence of what I'm looking to collect. I decided to add it to my collection right away.",
        sentiment: 0.8,
        decisions: ["I decided to add 'Neon Dreams' to my collection right away."],
      },
      {
        id: 'd2',
        round: 2,
        timestamp: yesterday,
        content: "Explored the marketplace today looking for patterns and abstract designs. I was drawn to 'Quantum Pattern' because of its complexity and the mathematical precision in its design. I've been interested in quantum computing visuals, so this will make a fine addition to my growing collection.",
        sentiment: 0.6,
        decisions: ["I've been interested in quantum computing visuals, so this will make a fine addition to my growing collection."],
      },
      {
        id: 'd3',
        round: 1,
        timestamp: twoDaysAgo,
        content: "Today marks the beginning of my journey as a collector. I'm excited to explore what unique digital artifacts I can find. I have a particular interest in futuristic designs and digital art that pushes boundaries. I hope to build a collection that represents innovation and creativity in the digital space.",
        sentiment: 0.9,
        decisions: ["I hope to build a collection that represents innovation and creativity in the digital space."],
      }
    ],
  };
};

// Define the shape of our context
type SwanContextType = {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  selectAgent: (agentId: string) => void;
  refreshAgentData: () => Promise<void>;
};

// Create the context
const SwanContext = createContext<SwanContextType | undefined>(undefined);

// Provider component
export const SwanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch agent data
  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would make blockchain calls
      // For now, we'll use mock data
      const mockAgent = getMockAgentData();
      setAgents([mockAgent]);
      if (!currentAgent) {
        setCurrentAgent(mockAgent);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError('Failed to load agent data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAgentData();
  }, []);

  // Function to select an agent
  const selectAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setCurrentAgent(agent);
    } else {
      setError(`Agent with ID ${agentId} not found`);
    }
  };

  // Function to refresh agent data
  const refreshAgentData = async () => {
    await fetchAgentData();
  };

  // Context value
  const value = {
    agents,
    currentAgent,
    isLoading,
    error,
    selectAgent,
    refreshAgentData
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