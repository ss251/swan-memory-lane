'use client';

import { useQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import { 
  SWAN_AGENT_ABI, 
  LLM_ORACLE_COORDINATOR_ADDRESS, 
  LLM_ORACLE_COORDINATOR_ABI 
} from '@/lib/contracts';
import { base } from 'wagmi/chains';

// Default agent address to use - replace with actual contract in production
export const DEFAULT_AGENT_ADDRESS = '0xd4022dB6165caeA1F72a187D4d49B347E02E1484';

// Flag to determine if we should show contract errors or suppress them
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

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

// Maximum number of rounds to fetch diary entries for
const MAX_DIARY_ROUNDS_TO_FETCH = 3;

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
        
        // Fetch diary entries for each round, but limit to the most recent MAX_DIARY_ROUNDS_TO_FETCH
        const diaryEntries: DiaryEntry[] = [];
        
        // Calculate which rounds to fetch (newest to oldest, up to MAX_DIARY_ROUNDS_TO_FETCH)
        const currentRound = Number(round);
        const startRound = Math.max(1, currentRound - MAX_DIARY_ROUNDS_TO_FETCH + 1);
        console.log(`Fetching diary entries for rounds ${startRound} to ${currentRound}`);
        
        // For each round we want to fetch, get the diary entry
        const fetchPromises = [];
        for (let r = startRound; r <= currentRound; r++) {
          fetchPromises.push(fetchDiaryEntry(agentAddress, r));
        }
        
        // Wait for all fetches to complete
        const fetchedEntries = await Promise.all(fetchPromises);
        
        // Add the valid entries to our array
        for (const entry of fetchedEntries) {
          if (entry) {
            diaryEntries.push(entry);
          }
        }
        
        // Return the agent data with diary entries
        return {
          address: agentAddress,
          name: name?.toString() || 'Unknown Agent',
          description: description?.toString() || 'No description available',
          round: currentRound,
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
    // Get the oracle state request task ID for this round
    const taskId = await readContract(config, {
      address: agentAddress as `0x${string}`,
      abi: SWAN_AGENT_ABI,
      functionName: 'oracleStateRequests',
      args: [BigInt(round)],
      chainId: base.id,
    });
    
    if (!taskId) return null;
    
    // Get the result from the oracle coordinator
    const oracleResponse = await readContract(config, {
      address: LLM_ORACLE_COORDINATOR_ADDRESS as `0x${string}`,
      abi: LLM_ORACLE_COORDINATOR_ABI,
      functionName: 'getBestResponse',
      args: [BigInt(taskId.toString())],
      chainId: base.id,
    });
    
    if (!oracleResponse || !oracleResponse.output) return null;
    
    // Parse the diary entry from the bytes output
    const textDecoder = new TextDecoder();
    
    // Safely convert output to Uint8Array
    let outputUint8;
    if (oracleResponse.output) {
      outputUint8 = new Uint8Array(Buffer.from(oracleResponse.output as unknown as string, 'hex'));
    } else {
      outputUint8 = new Uint8Array();
    }
    const decoded = textDecoder.decode(outputUint8);
    
    // Add sentiment analysis
    const sentiment = getSentiment(decoded);
    
    // Return the diary entry
    return {
      content: decoded,
      timestamp: new Date().toISOString(), // Placeholder
      round,
      sentiment,
    };
  } catch (error) {
    if (!DEVELOPMENT_MODE) {
      console.error(`Error fetching diary for round ${round}:`, error);
    }
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