'use client';

import { useQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import {
  SWAN_AGENT_ABI,
  SWAN_AGENT_FACTORY_ADDRESS
} from '@/lib/contracts';
import { fetchAgentsFromFactory } from './useAgentFactory';

// Type definitions
export interface Agent {
  address: string;
  owner: string;
  name: string;
  description: string;
  round: number;
  treasury: string;
  createdAt: number;
}

// Mock data for development or when network fails
const MOCK_AGENTS: Agent[] = [
  {
    address: '0xd4022dB6165caeA1F72a187D4d49B347E02E1484',
    owner: '0x1234567890123456789012345678901234567890',
    name: 'Cyberella',
    description: 'A curious and adventurous AI collector who loves artifacts related to digital art and futuristic designs.',
    round: 3,
    treasury: '1000',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
  },
  {
    address: '0x0987654321098765432109876543210987654321',
    owner: '0x2345678901234567890123456789012345678901',
    name: 'DataHunter',
    description: 'A meticulous AI agent specialized in collecting rare datasets and information artifacts.',
    round: 5,
    treasury: '2500',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
  },
  {
    address: '0x5432109876543210987654321098765432109876',
    owner: '0x3456789012345678901234567890123456789012',
    name: 'ArtifactX',
    description: 'An experimental AI collector focused on abstract conceptual artifacts and esoteric digital creations.',
    round: 2,
    treasury: '750',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 15,
  }
];

// Helper function to add retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>, 
  retries = 3, 
  initialDelay = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Operation failed, retrying in ${initialDelay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    
    return retryWithBackoff(fn, retries - 1, initialDelay * 2);
  }
};

// Hook to fetch all agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async (): Promise<Agent[]> => {
      try {
        console.log(`Fetching agents directly from Blockscout...`);
        
        // Get agent addresses from Blockscout API
        const factoryAgents = await fetchAgentsFromFactory();
        
        if (!factoryAgents || factoryAgents.length === 0) {
          console.warn('No agents found from factory, using mock data');
          return MOCK_AGENTS;
        }
        
        // Filter out the factory address itself which might get included in the list
        const filteredAgents = factoryAgents.filter(agent => 
          agent.address.toLowerCase() !== SWAN_AGENT_FACTORY_ADDRESS.toLowerCase()
        );
        
        console.log(`Found ${filteredAgents.length} agents from factory, fetching details...`);
        
        // Process each agent to get full details
        const agents: Agent[] = [];
        
        // Process in batches to avoid rate limiting
        const BATCH_SIZE = 20;
        for (let i = 0; i < filteredAgents.length; i += BATCH_SIZE) {
          const batch = filteredAgents.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(filteredAgents.length/BATCH_SIZE)}`);
          
          const batchPromises = batch.map(async (factoryAgent) => {
            const agentAddress = factoryAgent.address as `0x${string}`;
            
            try {
              // Fetch agent details from agent contract
              const [name, description, roundData, treasuryBigInt, owner] = await Promise.all([
                retryWithBackoff(() => readContract(config, {
                  address: agentAddress,
                  abi: SWAN_AGENT_ABI,
                  functionName: 'name',
                }), 3, 1000),
                retryWithBackoff(() => readContract(config, {
                  address: agentAddress,
                  abi: SWAN_AGENT_ABI,
                  functionName: 'description',
                }), 3, 1000),
                retryWithBackoff(() => readContract(config, {
                  address: agentAddress,
                  abi: SWAN_AGENT_ABI,
                  functionName: 'getRoundPhase',
                }), 3, 1000),
                retryWithBackoff(() => readContract(config, {
                  address: agentAddress,
                  abi: SWAN_AGENT_ABI,
                  functionName: 'treasury',
                }), 3, 1000),
                retryWithBackoff(() => readContract(config, {
                  address: agentAddress,
                  abi: SWAN_AGENT_ABI,
                  functionName: 'owner',
                }), 3, 1000),
              ]);
              
              // Convert values to appropriate format
              const round = typeof roundData === 'object' && roundData !== null && 
                Array.isArray(roundData) && roundData.length > 0 ? 
                Number(roundData[0]) : 0;
              
              const treasury = treasuryBigInt?.toString() || '0';
              // Use block timestamp if available, otherwise fall back to current time
              const createdAt = factoryAgent.timestamp 
                ? Math.floor(new Date(factoryAgent.timestamp).getTime() / 1000) 
                : Math.floor(Date.now() / 1000); 
              
              return {
                address: agentAddress,
                owner: owner as string,
                name: name?.toString() || 'Unknown Agent',
                description: description?.toString() || 'No description available',
                round,
                treasury,
                createdAt
              };
            } catch (error) {
              console.error(`Error fetching details for agent ${agentAddress}:`, error);
              
              // Add minimal agent data if details fetch fails
              return {
                address: agentAddress,
                owner: '0x0000000000000000000000000000000000000000',
                name: 'Unknown Agent',
                description: 'Unable to fetch agent details',
                round: 0,
                treasury: '0',
                createdAt: factoryAgent.timestamp 
                  ? Math.floor(new Date(factoryAgent.timestamp).getTime() / 1000) 
                  : Math.floor(Date.now() / 1000)
              };
            }
          });
          
          const batchResults = await Promise.allSettled(batchPromises);
          
          // Add successful results to our agents array
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              agents.push(result.value);
            }
          });
          
          // Small delay between batches to avoid rate limiting
          if (i + BATCH_SIZE < filteredAgents.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log(`Successfully processed ${agents.length} agents out of ${filteredAgents.length} total`);
        
        // If we couldn't get any agent details, use mock data
        if (agents.length === 0) {
          console.warn('Failed to get details for any agents, using mock data');
          return MOCK_AGENTS;
        }
        
        // Sort agents by creation time (newest first)
        return agents.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error('Error fetching agents:', error);
        
        // Always return mock data when there's an error
        console.warn('Falling back to mock agents due to errors');
        return MOCK_AGENTS;
      }
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 1,                  // Only retry once at the query level
    retryDelay: 2000,          // 2 seconds between retries
  });
} 