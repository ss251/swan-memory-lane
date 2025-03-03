'use client';

import { useQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import { base } from 'wagmi/chains';
import {
  SWAN_AGENT_ABI,
} from '@/lib/contracts';

// Development mode flag to control error behavior
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

// Default agent to use if none is provided
export const DEFAULT_AGENT_ADDRESS = '0xd4022dB6165caeA1F72a187D4d49B347E02E1484';

// Define types
export interface AgentData {
  address: string;
  name: string;
  description: string;
  round: number;
  treasury: string;
  createdAt: number;
  diaryEntries: DiaryEntry[];
}

export interface DiaryEntry {
  content: string;
  timestamp: string;
  round: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export function useAgentData(agentAddress = DEFAULT_AGENT_ADDRESS) {
  return useQuery({
    queryKey: ['agentData', agentAddress],
    queryFn: async (): Promise<AgentData> => {
      try {
        // Try to fetch real data from the blockchain
        let name, description, round, treasuryBigInt;
        
        try {
          // Fetch basic agent data - note: using getRoundPhase instead of round function
          // The getRoundPhase returns [currentRound, phase, timestamp]
          const results = await Promise.all([
            readContract(config, {
              address: agentAddress as `0x${string}`,
              abi: SWAN_AGENT_ABI,
              functionName: 'name',
              chainId: base.id,
            }),
            readContract(config, {
              address: agentAddress as `0x${string}`,
              abi: SWAN_AGENT_ABI,
              functionName: 'description',
              chainId: base.id,
            }),
            readContract(config, {
              address: agentAddress as `0x${string}`,
              abi: SWAN_AGENT_ABI,
              functionName: 'getRoundPhase',
              chainId: base.id,
            }),
            readContract(config, {
              address: agentAddress as `0x${string}`,
              abi: SWAN_AGENT_ABI,
              functionName: 'treasury',
              chainId: base.id,
            })
          ]);
          
          name = results[0];
          description = results[1];
          // getRoundPhase returns [currentRound, phase, timestamp]
          round = results[2][0]; // Get the first element which is the currentRound
          treasuryBigInt = results[3];
          
          console.log("Successfully fetched agent data:", { name, description, round, treasury: treasuryBigInt });
        } catch (error) {
          // In development mode, only log a simple message without the full error
          if (DEVELOPMENT_MODE) {
            console.info('Using mock data in development mode - blockchain contract not available');
          } else {
            console.warn('Using mock data as blockchain data is unavailable:', error);
          }
          // If we can't get blockchain data, throw to fall back to mock data
          throw new Error('Blockchain connection failed - using mock data instead');
        }

        // Convert treasury from BigInt to string
        const treasury = treasuryBigInt ? treasuryBigInt.toString() : '0';
        
        // Fetch diary entries for the agent
        // Modified to search from round 1 but be more efficient
        const diaryEntries: DiaryEntry[] = [];

        // Get diary entries, but only look for the first 5 we can find
        // No need to search through all rounds
        const maxRound = Math.max(1, Number(round));
        let fetchedEntries = 0;
        const MAX_DIARY_ENTRIES = 5; // Just need a few entries to display

        console.log(`Fetching diary entries, stopping after finding ${MAX_DIARY_ENTRIES} entries`);

        // Start from most recent rounds (more likely to have entries)
        for (let r = maxRound; r >= 1 && fetchedEntries < MAX_DIARY_ENTRIES; r--) {
          try {
            const entry = await fetchDiaryEntry(agentAddress, r);
            if (entry) {
              console.log(`Found diary entry for round ${r}`);
              diaryEntries.push(entry);
              fetchedEntries++;
            }
          } catch (error) {
            const err = error as Error;
            console.debug(`Error fetching diary entry for round ${r}: ${err.message}`);
          }
        }

        // If no entries were found (possibly due to API failures), 
        // include a placeholder entry in development mode
        if (diaryEntries.length === 0 && DEVELOPMENT_MODE) {
          console.log('No diary entries found, generating mock entries');
          
          // Create some realistic mock entries
          for (let i = 0; i < Math.min(6, maxRound); i++) {
            const mockRound = maxRound - i;
            const dayOffset = i * 3; // Days ago
            const timestamp = new Date(Date.now() - (dayOffset * 86400000)).toISOString();
            const mockContent = `Mock entry for round ${mockRound} - ${timestamp}`;
            diaryEntries.push({
              content: mockContent,
              timestamp,
              round: mockRound,
              sentiment: 'neutral',
            });
          }
        }
        
        // Return the agent data with diary entries
        return {
          address: agentAddress,
          name: name?.toString() || 'Unknown Agent',
          description: description?.toString() || 'No description available',
          round: maxRound,
          treasury,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 30, // Placeholder: 30 days ago
          diaryEntries,
        };
      } catch (error) {
        if (!DEVELOPMENT_MODE) {
          console.info('Falling back to mock data:', error);
        }
        
        // Fallback data for development
        return {
          address: agentAddress,
          name: 'Cyberella',
          description: 'A curious and adventurous AI collector who loves artifacts related to digital art and futuristic designs.',
          round: 3,
          treasury: '1000',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
          diaryEntries: [
            {
              content: "I've been searching for unique digital art pieces today. I came across 'Neon Dreams' and was immediately captivated by its vibrant colors and futuristic vibe.",
              timestamp: new Date().toISOString(),
              round: 3,
              sentiment: 'positive',
            },
            {
              content: "Explored the marketplace today looking for patterns and abstract designs. I was drawn to 'Quantum Pattern' because of its complexity.",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              round: 2,
              sentiment: 'neutral',
            },
            {
              content: "Today marks the beginning of my journey as a collector. I'm excited to explore what unique digital artifacts I can find.",
              timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
              round: 1,
              sentiment: 'positive',
            }
          ],
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to fetch a single diary entry
async function fetchDiaryEntry(agentAddress: string, round: number): Promise<DiaryEntry | null> {
  try {
    console.log(`Attempting to fetch diary entry for round ${round}`);
    
    // Get the oracle state request task ID for this round
    const taskId = await readContract(config, {
      address: agentAddress as `0x${string}`,
      abi: SWAN_AGENT_ABI,
      functionName: 'oracleStateRequests',
      args: [BigInt(round)],
      chainId: base.id,
    });
    
    if (!taskId || taskId === BigInt(0)) {
      console.log(`No task ID found for round ${round}`);
      return null;
    }
    
    console.log(`Found task ID for round ${round}: ${taskId}`);
    
    // Use oracleResult directly from the SwanAgent contract
    try {
      const result = await readContract(config, {
        address: agentAddress as `0x${string}`,
        abi: SWAN_AGENT_ABI,
        functionName: 'oracleResult',
        args: [taskId],
        chainId: base.id,
      });
      
      if (!result) {
        console.log(`No diary entry found for task ${taskId}`);
        return null;
      }
      
      // Safely handle the result - it could be a string, ArrayBuffer, or complex object
      console.log('Raw oracle result:', result);
      
      // Try to safely extract the content
      let content;
      
      if (typeof result === 'string') {
        // If it's already a string, use it directly
        content = result;
      } else if (Array.isArray(result)) {
        // If it's a byte array, decode it
        try {
          const decoder = new TextDecoder();
          content = decoder.decode(new Uint8Array(Array.from(result)));
        } catch (decodeError) {
          console.error('Error decoding bytes:', decodeError);
          // Fallback: try to stringify the result
          content = JSON.stringify(result);
        }
      } else {
        // For other types (like objects), stringify them
        try {
          content = JSON.stringify(result);
        } catch (jsonError) {
          console.error('Error stringifying result:', jsonError);
          content = `[Unreadable diary entry for round ${round}]`;
        }
      }
      
      // Parse JSON if the content looks like JSON
      if (typeof content === 'string' && 
          (content.startsWith('{') || content.startsWith('['))) {
        try {
          const parsedContent = JSON.parse(content);
          // If this is a structured result with a content field, use that
          if (parsedContent.content) {
            content = parsedContent.content;
          } else if (parsedContent.arweave && parsedContent.arweave.content) {
            // Handle special case when the content is nested in arweave.content
            content = parsedContent.arweave.content;
          }
        } catch {
          // It's not valid JSON, keep the original string
          console.log('Content is not valid JSON, using as-is');
        }
      }
      
      // Create and return the diary entry
      return {
        content: typeof content === 'string' ? content : `[Complex diary entry for round ${round}]`,
        timestamp: new Date().toISOString(),
        round,
        sentiment: getSentiment(typeof content === 'string' ? content : ''),
      };
    } catch (error) {
      const err = error as Error;
      console.warn(`Error getting oracle result: ${err.message}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching diary for round ${round}:`, error);
    return null;
  }
}

// Simple sentiment analysis function
function getSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['breakthrough', 'success', 'positive', 'great', 'excellent', 'good', 'gain', 'profit', 'up'];
  const negativeWords = ['loss', 'negative', 'bad', 'failure', 'poor', 'down', 'volatility', 'decrease', 'adjust'];
  
  const lowerText = text.toLowerCase();
  let positive = 0;
  let negative = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positive++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negative++;
  });
  
  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
} 