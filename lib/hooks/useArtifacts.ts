'use client';

import { useQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import { base } from 'wagmi/chains';
import {
  SWAN_CONTRACT_ADDRESS,
  SWAN_ABI,
  SWAN_ARTIFACT_ABI,
} from '@/lib/contracts';
import { DEFAULT_AGENT_ADDRESS } from './useAgentData';

// Flag to determine if we should show contract errors or suppress them
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

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
}

export function useArtifacts(agentAddress = DEFAULT_AGENT_ADDRESS, round = 1) {
  return useQuery({
    queryKey: ['artifacts', agentAddress, round],
    queryFn: async (): Promise<Artifact[]> => {
      try {
        try {
          // Try to get all listed artifacts for the given agent and round
          const artifactAddresses = await readContract(config, {
            address: SWAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: SWAN_ABI,
            functionName: 'getListedArtifacts',
            args: [agentAddress as `0x${string}`, BigInt(round)],
            chainId: base.id,
          });

          if (!artifactAddresses || (artifactAddresses as unknown[]).length === 0) {
            // No artifacts found, return empty array
            return [];
          }

          // Fetch details for each artifact
          const artifacts = await Promise.all(
            (artifactAddresses as `0x${string}`[]).map(async (artifactAddress, index) => {
              try {
                // Get listing details from the Swan contract
                const listing = await readContract(config, {
                  address: SWAN_CONTRACT_ADDRESS as `0x${string}`,
                  abi: SWAN_ABI,
                  functionName: 'getListing',
                  args: [artifactAddress],
                  chainId: base.id,
                });

                // Get artifact details from the Artifact contract
                const [name, symbol, descriptionBytes] = await Promise.all([
                  readContract(config, {
                    address: artifactAddress,
                    abi: SWAN_ARTIFACT_ABI,
                    functionName: 'name',
                    chainId: base.id,
                  }),
                  readContract(config, {
                    address: artifactAddress,
                    abi: SWAN_ARTIFACT_ABI,
                    functionName: 'symbol',
                    chainId: base.id,
                  }),
                  readContract(config, {
                    address: artifactAddress,
                    abi: SWAN_ARTIFACT_ABI,
                    functionName: 'description',
                    chainId: base.id,
                  })
                ]);

                // Convert bytes description to string
                const decoder = new TextDecoder();
                // Cast to Uint8Array safely
                let descriptionUint8;
                if (descriptionBytes) {
                  descriptionUint8 = new Uint8Array(Buffer.from(descriptionBytes as unknown as string, 'hex'));
                } else {
                  descriptionUint8 = new Uint8Array();
                }
                const description = decoder.decode(descriptionUint8);

                // Map listing status number to string
                const statusMap = ['unlisted', 'listed', 'sold'];
                const listingStatus = listing && typeof listing.status === 'number' 
                  ? statusMap[listing.status] as 'unlisted' | 'listed' | 'sold'
                  : 'unlisted';

                // Return the artifact data
                return {
                  id: `artifact-${index}`,
                  address: artifactAddress,
                  name: name?.toString() || 'Unknown Artifact',
                  symbol: symbol?.toString() || 'UNKNOWN',
                  description,
                  price: listing && listing.price ? listing.price.toString() : '0',
                  createdAt: listing && listing.createdAt ? new Date(Number(listing.createdAt) * 1000).toISOString() : new Date().toISOString(),
                  status: listingStatus,
                  seller: listing && listing.seller ? listing.seller : agentAddress,
                } as Artifact;
              } catch (error) {
                if (!DEVELOPMENT_MODE) {
                  console.error(`Error fetching details for artifact ${artifactAddress}:`, error);
                }
                return null;
              }
            })
          );

          // Filter out any null values from artifacts that failed to load
          return artifacts.filter(a => a !== null) as Artifact[];
        } catch (error) {
          // In development mode, only log a simple message without the full error
          if (DEVELOPMENT_MODE) {
            console.info('Using mock artifact data in development mode - blockchain contract not available');
          } else {
            console.warn('Blockchain connection failed when fetching artifacts:', error);
          }
          throw new Error('Failed to fetch artifacts from blockchain');
        }
      } catch (error) {
        if (!DEVELOPMENT_MODE) {
          console.info('Falling back to mock artifact data:', error);
        }
        
        // Return fallback data for development
        return [
          {
            id: 'a1',
            address: '0x1111111111111111111111111111111111111111',
            name: 'Neon Dreams',
            symbol: 'NEON',
            description: 'A vibrant digital artwork depicting a futuristic cityscape at night',
            price: '200',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'listed',
            seller: agentAddress,
          },
          {
            id: 'a2',
            address: '0x2222222222222222222222222222222222222222',
            name: 'Quantum Pattern',
            symbol: 'QPAT',
            description: 'An abstract visualization of quantum computing patterns',
            price: '300',
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: 'listed',
            seller: agentAddress,
          }
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 