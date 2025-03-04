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

export function useAgentData(agentAddress?: string) {
  return useQuery({
    queryKey: ['agentData', agentAddress],
    queryFn: async (): Promise<AgentData> => {
      // Check if we have an address to query
      if (!agentAddress) {
        throw new Error('No agent address provided');
      }
      
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

// Function to fetch additional diary entries (to be used in DiaryTimeline)
export async function fetchMoreDiaryEntries(
  agentAddress: string, 
  currentEntries: DiaryEntry[], 
  maxAdditionalEntries = 5
): Promise<DiaryEntry[]> {
  try {
    console.log(`Fetching more diary entries for agent ${agentAddress}`);
    console.log(`Current entries: ${currentEntries.length} entries with rounds: ${currentEntries.map(e => e.round).join(', ')}`);
    
    // Create a set of rounds that we already have
    const existingRounds = new Set(currentEntries.map(e => e.round));
    console.log(`Existing rounds: ${Array.from(existingRounds).join(', ')}`);
    
    // Find the lowest round we already have
    const lowestExistingRound = Math.min(...currentEntries.map(e => e.round));
    console.log(`Lowest existing round: ${lowestExistingRound}`);
    
    // Start searching from one round lower
    const startRound = Math.max(1, lowestExistingRound - 1);
    console.log(`Starting search from round ${startRound}`);
    
    // New diary entries we'll return
    const newEntries: DiaryEntry[] = [];
    let fetchedEntries = 0;
    
    // Search backwards for more entries
    for (let r = startRound; r >= 1 && fetchedEntries < maxAdditionalEntries; r--) {
      // Skip rounds we already have
      if (existingRounds.has(r)) {
        console.log(`Skipping round ${r} as it already exists`);
        continue;
      }
      
      try {
        const entry = await fetchDiaryEntry(agentAddress, r);
        if (entry) {
          console.log(`Found new diary entry for round ${r}`);
          newEntries.push(entry);
          fetchedEntries++;
        } else {
          console.log(`No entry found for round ${r}`);
        }
      } catch (error) {
        const err = error as Error;
        console.debug(`Error fetching diary entry for round ${r}: ${err.message}`);
      }
    }
    
    console.log(`Found ${newEntries.length} new diary entries with rounds: ${newEntries.map(e => e.round).join(', ')}`);
    return newEntries;
  } catch (error) {
    console.error('Error fetching more diary entries:', error);
    return [];
  }
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
      
      // Log the raw result for debugging
      console.log(`Raw oracle result for round ${round}:`, result);
      
      // Step 1: Handle various result formats
      let rawContent: string;
      
      // Handle if the result is already a string
      if (typeof result === 'string') {
        rawContent = result;
      } 
      // Handle if the result is a byte array or other format
      else {
        try {
          // First convert to string representation
          const resultStr = String(result);
          
          // Check if it's a hex string
          if (resultStr.startsWith('0x')) {
            rawContent = resultStr;
          } else if (Array.isArray(result)) {
            // Try to decode as UTF-8
            const decoder = new TextDecoder();
            rawContent = decoder.decode(new Uint8Array(Array.from(result)));
          } else {
            // For other types, stringify
            rawContent = JSON.stringify(result);
          }
        } catch (error) {
          console.error('Error processing result:', error);
          rawContent = String(result);
        }
      }
      
      console.log(`Decoded content: ${rawContent}`);
      
      // Step 2: If it's a hex string, convert it to normal string
      if (typeof rawContent === 'string' && rawContent.startsWith('0x')) {
        try {
          // Remove the '0x' prefix and convert hex to string
          const hex = rawContent.slice(2);
          const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
          rawContent = new TextDecoder().decode(bytes);
          console.log(`Converted hex to string: ${rawContent}`);
        } catch (hexError) {
          console.error('Error converting hex to string:', hexError);
        }
      }
      
      // Step 3: Parse JSON if possible to extract Arweave TX ID
      let arweaveTxId: string | null = null;
      let content = rawContent;
      
      try {
        if (typeof rawContent === 'string' && (rawContent.startsWith('{') || rawContent.startsWith('['))) {
          const parsed = JSON.parse(rawContent);
          
          // Extract Arweave TX ID
          if (parsed.arweave) {
            arweaveTxId = parsed.arweave;
            console.log(`Found Arweave TX ID: ${arweaveTxId}`);
          }
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
      }
      
      // Step 4: If we have an Arweave TX ID, fetch the actual content
      if (arweaveTxId) {
        try {
          console.log(`Fetching content from Arweave: ${arweaveTxId}`);
          const arweaveUrl = `https://arweave.net/${arweaveTxId}`;
          
          const response = await fetch(arweaveUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch from Arweave: ${response.status}`);
          }
          
          const arweaveContent = await response.text();
          console.log('Successfully fetched content from Arweave');
          
          // Step 5: Parse the content to extract the relevant parts
          content = extractRelevantContent(arweaveContent);
        } catch (error) {
          const fetchError = error as Error;
          console.error('Error fetching from Arweave:', fetchError);
          // Fall back to the raw content
          content = `Failed to fetch diary entry from Arweave (${arweaveTxId}). Error: ${fetchError.message}`;
        }
      }
      
      // Create and return the diary entry
      return {
        content,
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

// Helper function to extract relevant content from Arweave data
function extractRelevantContent(fullContent: string): string {
  // Extract content between <observe> and </observe> tags
  let content = '';

  // Try to extract <character_analysis> section
  const characterAnalysisMatch = /<character_analysis>([\s\S]*?)<\/character_analysis>/i.exec(fullContent);
  if (characterAnalysisMatch && characterAnalysisMatch[1]) {
    content += characterAnalysisMatch[1].trim();
  }
  
  // Try to extract <observe> section
  const observeMatch = /<observe>([\s\S]*?)<\/observe>/i.exec(fullContent);
  if (observeMatch && observeMatch[1]) {
    if (content) content += '\n\n';
    content += observeMatch[1].trim();
  }
  
  // Try to extract <journal> section
  const journalMatch = /<journal>([\s\S]*?)<\/journal>/i.exec(fullContent);
  if (journalMatch && journalMatch[1]) {
    if (content) content += '\n\n';
    content += journalMatch[1].trim();
  }
  
  // Try to extract <new_objectives> section
  const objectivesMatch = /<new_objectives>([\s\S]*?)<\/new_objectives>/i.exec(fullContent);
  if (objectivesMatch && objectivesMatch[1]) {
    if (content) content += '\n\n';
    content += objectivesMatch[1].trim();
  }
  
  // If we couldn't extract any of the specific sections, use everything after <observe>
  if (!content) {
    const observeIndex = fullContent.indexOf('<observe>');
    if (observeIndex !== -1) {
      content = fullContent.substring(observeIndex + '<observe>'.length).trim();
      
      // Remove any remaining tags
      content = content.replace(/<\/?[^>]+(>|$)/g, '');
    } else {
      // If there's no <observe> tag, just use the whole content
      content = fullContent;
    }
  }
  
  return content.trim();
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