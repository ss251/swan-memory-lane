'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import { base } from 'wagmi/chains';
import {
  SWAN_CONTRACT_ADDRESS,
  SWAN_ABI,
  SWAN_ARTIFACT_ABI,
  SWAN_AGENT_ABI
} from '@/lib/contracts';
import { DEFAULT_AGENT_ADDRESS } from './useAgentData';

// Flag to determine if we should show contract errors or suppress them
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

// Minimum number of artifacts to find before stopping search
const MIN_ARTIFACTS_TO_DISPLAY = 6;

export interface Artifact {
  id: string;
  address: string;
  name: string;
  symbol: string;
  description: string;
  price: string;
  createdAt: string;
  status: 'unlisted' | 'listed' | 'sold';
  seller: string;
  round: number;
}

// Function to fetch artifacts for a specific range of rounds
export async function fetchArtifactsForRounds(
  agentAddress: string, 
  startRound: number, 
  endRound: number
): Promise<Artifact[]> {
  console.log(`Fetching artifacts for rounds ${startRound} to ${endRound}`);
  const artifacts: Artifact[] = [];
  
  // For each round in the range, get the inventory
  for (let round = startRound; round <= endRound; round++) {
    console.log(`Fetching inventory for round ${round}`);
    
    try {
      // Get the inventory for this round - iterate through indices
      let index = 0;
      let hasMoreArtifacts = true;
      
      while (hasMoreArtifacts) {
        try {
          const artifactAddress = await readContract(config, {
            address: agentAddress as `0x${string}`,
            abi: SWAN_AGENT_ABI,
            functionName: 'inventory',
            args: [BigInt(round), BigInt(index)],
            chainId: base.id,
          }) as string;
          
          // If we got a valid address (not zero address), process it
          if (artifactAddress && artifactAddress !== '0x0000000000000000000000000000000000000000') {
            console.log(`Found artifact at round ${round}, index ${index}: ${artifactAddress}`);
            
            try {
              // Get artifact details from the Artifact contract
              const [name, symbol, descriptionBytes, createdAtValue] = await Promise.all([
                readContract(config, {
                  address: artifactAddress as `0x${string}`,
                  abi: SWAN_ARTIFACT_ABI,
                  functionName: 'name',
                  chainId: base.id,
                }),
                readContract(config, {
                  address: artifactAddress as `0x${string}`,
                  abi: SWAN_ARTIFACT_ABI,
                  functionName: 'symbol',
                  chainId: base.id,
                }),
                readContract(config, {
                  address: artifactAddress as `0x${string}`,
                  abi: SWAN_ARTIFACT_ABI,
                  functionName: 'description',
                  chainId: base.id,
                }),
                readContract(config, {
                  address: artifactAddress as `0x${string}`,
                  abi: SWAN_ARTIFACT_ABI,
                  functionName: 'createdAt',
                  chainId: base.id,
                }).catch(() => null) // Handle gracefully if createdAt is not available
              ]);
              
              // Get listing details if available
              let price = '0';
              let listingStatus: 'unlisted' | 'listed' | 'sold' = 'unlisted';
              let createdAt = createdAtValue ? 
                new Date(Number(createdAtValue) * 1000).toISOString() : 
                new Date().toISOString();
              
              try {
                // Try to get listing details from the Swan contract
                const listing = await readContract(config, {
                  address: SWAN_CONTRACT_ADDRESS as `0x${string}`,
                  abi: SWAN_ABI,
                  functionName: 'getListing',
                  args: [artifactAddress as `0x${string}`],
                  chainId: base.id,
                });
                
                if (listing) {
                  price = listing.price ? listing.price.toString() : '0';
                  const statusMap = ['unlisted', 'listed', 'sold'];
                  listingStatus = listing.status !== undefined 
                    ? (statusMap[Number(listing.status)] as 'unlisted' | 'listed' | 'sold')
                    : 'unlisted';
                  // Only use listing's createdAt if artifact's createdAt is not available
                  if (!createdAtValue && listing.createdAt) {
                    createdAt = new Date(Number(listing.createdAt) * 1000).toISOString();
                  }
                }
              } catch (error) {
                const err = error as Error;
                console.log(`No listing found for artifact ${artifactAddress}: ${err.message}`);
              }

              // Convert bytes description to string
              const decoder = new TextDecoder();
              let descriptionUint8;
              if (descriptionBytes) {
                descriptionUint8 = new Uint8Array(Buffer.from(descriptionBytes as unknown as string, 'hex'));
              } else {
                descriptionUint8 = new Uint8Array();
              }
              const description = decoder.decode(descriptionUint8);
              
              // Add the artifact to our collection
              artifacts.push({
                id: `${round}-${index}`,
                address: artifactAddress,
                name: name ? name.toString() : `Artifact ${round}-${index}`,
                symbol: symbol ? symbol.toString() : 'ART',
                description: description || 'No description available',
                price,
                createdAt,
                status: listingStatus,
                seller: agentAddress,
                round
              });
              
              // Move to the next index
              index++;
            } catch (error) {
              console.log(`Error getting artifact details for ${artifactAddress}: ${error}`);
              index++; // Still increment to avoid infinite loops
            }
          } else {
            // No more artifacts for this round
            hasMoreArtifacts = false;
          }
        } catch (error) {
          console.log(`Error getting artifact at round ${round}, index ${index}: ${error}`);
          hasMoreArtifacts = false; // Stop trying this round
        }
      }
    } catch (error) {
      console.log(`Error fetching inventory for round ${round}: ${error}`);
    }
  }
  
  return artifacts;
}

export function useArtifacts(agentAddress = DEFAULT_AGENT_ADDRESS) {
  return useQuery({
    queryKey: ['artifacts', agentAddress],
    queryFn: async (): Promise<Artifact[]> => {
      try {
        try {
          console.log(`Fetching artifacts for agent: ${agentAddress}`);
          
          // First, get the current round from the agent contract
          const roundResult = await readContract(config, {
            address: agentAddress as `0x${string}`,
            abi: SWAN_AGENT_ABI,
            functionName: 'getRoundPhase',
            chainId: base.id,
          });
          
          if (!roundResult) {
            console.warn('Failed to get current round');
            return [];
          }
          
          const currentRound = Number(roundResult[0]); // First element is the round
          console.log(`Current round: ${currentRound}`);
          
          // Start searching from round 1 up to a reasonable maximum
          // Much smaller batch size - just enough to find the minimum
          let artifacts: Artifact[] = [];
          let startRound = 1;
          const batchSize = 10; // Smaller batch size
          let attemptsLeft = 3; // Limit number of batch searches
          
          while (artifacts.length < MIN_ARTIFACTS_TO_DISPLAY && startRound <= currentRound && attemptsLeft > 0) {
            const endRound = Math.min(currentRound, startRound + batchSize - 1);
            console.log(`Searching rounds ${startRound}-${endRound} for artifacts...`);
            
            const batchArtifacts = await fetchArtifactsForRounds(agentAddress, startRound, endRound);
            artifacts = [...artifacts, ...batchArtifacts];
            
            // If we found enough artifacts, stop searching
            if (artifacts.length >= MIN_ARTIFACTS_TO_DISPLAY) {
              console.log(`Found ${artifacts.length} artifacts, stopping search.`);
              break;
            }
            
            // Move to next batch
            startRound = endRound + 1;
            attemptsLeft--;
          }
          
          // Sort artifacts by round in ascending order (oldest first)
          const sortedArtifacts = artifacts.sort((a, b) => a.round - b.round);
          
          console.log(`Total artifacts found: ${artifacts.length}`);
          return sortedArtifacts;
        } catch (error) {
          // In development mode, only log a simple message without the full error
          if (DEVELOPMENT_MODE) {
            console.info('Using mock artifact data in development mode - blockchain contract not available');
          } else {
            const err = error as Error;
            console.warn('Blockchain connection failed when fetching artifacts:', err.message);
          }
          throw new Error('Failed to fetch artifacts from blockchain');
        }
      } catch (error) {
        if (!DEVELOPMENT_MODE) {
          const err = error as Error;
          console.info('Falling back to mock artifact data:', err.message);
        }
        
        // Generate a variety of realistic mock artifacts for development
        // This provides a better visualization of what the app will look like with real data
        const mockArtifacts: Artifact[] = [];
        const artifactTypes = [
          { category: 'Artwork', prefix: 'Digital', status: 'listed' },
          { category: 'Collectible', prefix: 'Rare', status: 'unlisted' },
          { category: 'Trading Card', prefix: 'Holographic', status: 'sold' },
          { category: 'Virtual Land', prefix: 'Prime', status: 'listed' },
          { category: 'Music NFT', prefix: 'Exclusive', status: 'listed' }
        ];
        
        // Generate 8-12 artifacts for a more realistic view
        const numArtifacts = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numArtifacts; i++) {
          const roundNum = numArtifacts - i; // Higher rounds are more recent
          const typeIndex = i % artifactTypes.length;
          const type = artifactTypes[typeIndex];
          const timestamp = new Date(Date.now() - (roundNum * 86400000 * 2)).toISOString();
          const price = (100 + Math.floor(Math.random() * 900)).toString();
          
          const adjectives = ['Ethereal', 'Quantum', 'Cosmic', 'Neon', 'Digital', 'Virtual', 'Cyber'];
          const nouns = ['Genesis', 'Nexus', 'Oracle', 'Whisper', 'Echo', 'Prism', 'Horizon'];
          
          const nameAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
          const nameNoun = nouns[Math.floor(Math.random() * nouns.length)];
          
          const descriptions = [
            `A stunning ${type.prefix.toLowerCase()} representation of blockchain technology through abstract visualization.`,
            `This ${type.category.toLowerCase()} captures the essence of digital ownership in the Web3 era.`,
            `An algorithmically generated ${type.category.toLowerCase()} that combines elements of finance and art.`,
            `One of a kind ${type.prefix.toLowerCase()} ${type.category.toLowerCase()} featuring dynamic elements that respond to market conditions.`,
            `A ${type.prefix.toLowerCase()} ${type.category.toLowerCase()} inspired by the mathematical patterns found in trading algorithms.`
          ];
          
          mockArtifacts.push({
            id: `mock-${i}`,
            address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            name: `${nameAdj} ${nameNoun}`,
            symbol: `${nameAdj.substring(0, 1)}${nameNoun.substring(0, 3)}`.toUpperCase(),
            description: descriptions[i % descriptions.length],
            price,
            createdAt: timestamp,
            status: type.status as 'listed' | 'unlisted' | 'sold',
            seller: agentAddress,
            round: roundNum
          });
        }
        
        // Sort by round (descending)
        return mockArtifacts.sort((a, b) => b.round - a.round);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to load more artifacts on demand
export function useLoadMoreArtifacts(
  agentAddress = DEFAULT_AGENT_ADDRESS,
  searchRange: { startRound: number, endRound: number } | null = null
) {
  return useInfiniteQuery({
    queryKey: ['infinite-artifacts', agentAddress, searchRange],
    queryFn: async ({ pageParam = { startRound: 0, endRound: 0, currentRound: 0 } }) => {
      console.log(`Loading more artifacts: ${JSON.stringify(pageParam)}`);
      
      try {
        // If we have a specific search range, use it
        if (searchRange) {
          const { startRound, endRound } = searchRange;
          console.log(`Using search range from props: ${startRound}-${endRound}`);
          
          // Fetch artifacts for these rounds
          const artifacts = await fetchArtifactsForRounds(agentAddress, startRound, endRound);
          
          // Sort artifacts by round in ascending order (oldest first)
          const sortedArtifacts = artifacts.sort((a, b) => a.round - b.round);
          
          console.log(`Loaded ${artifacts.length} artifacts for rounds ${startRound}-${endRound}`);
          
          return { 
            artifacts: sortedArtifacts, 
            pageParam: { 
              startRound, 
              endRound, 
              currentRound: pageParam.currentRound || Math.max(endRound, startRound) 
            } 
          };
        }
        
        // First, get the current round from the agent contract if we don't have it
        if (!pageParam.currentRound) {
          const roundResult = await readContract(config, {
            address: agentAddress as `0x${string}`,
            abi: SWAN_AGENT_ABI,
            functionName: 'getRoundPhase',
            chainId: base.id,
          });
          
          if (!roundResult) {
            console.warn('Failed to get current round for infinite query');
            return { artifacts: [], pageParam };
          }
          
          pageParam.currentRound = Number(roundResult[0]);
          pageParam.startRound = 1;
          pageParam.endRound = Math.min(10, pageParam.currentRound);
          
          console.log(`Current round: ${pageParam.currentRound}, Loading initial batch from round ${pageParam.startRound} to ${pageParam.endRound}`);
        }
        
        // Calculate the range of rounds to fetch for this page
        const { startRound, endRound } = pageParam;
        
        // Fetch artifacts for these rounds
        const artifacts = await fetchArtifactsForRounds(agentAddress, startRound, endRound);
        
        // Sort artifacts by round in ascending order (oldest first)
        const sortedArtifacts = artifacts.sort((a, b) => a.round - b.round);
        
        console.log(`Loaded ${artifacts.length} artifacts for rounds ${startRound}-${endRound}`);
        
        return { artifacts: sortedArtifacts, pageParam };
      } catch (error) {
        console.error('Error in infinite artifacts query:', error);
        return { artifacts: [], pageParam };
      }
    },
    getNextPageParam: (lastPage) => {
      const { pageParam } = lastPage;
      const { endRound, currentRound } = pageParam;
      
      if (endRound >= currentRound) {
        console.log('No more rounds to fetch (reached latest round)');
        return undefined;
      }
      
      const nextStartRound = endRound + 1;
      const nextEndRound = Math.min(currentRound, nextStartRound + 9);
      
      console.log(`Next page will fetch rounds ${nextStartRound}-${nextEndRound}`);
      
      return {
        startRound: nextStartRound,
        endRound: nextEndRound,
        currentRound
      };
    },
    initialPageParam: { startRound: 0, endRound: 0, currentRound: 0 },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 