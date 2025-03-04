import { useQuery } from '@tanstack/react-query';

// Type definitions
export interface Agent {
  address: string;
  transactionHash: string;
  blockNumber: number;
  timestamp?: string;
}

export interface BlockscoutInternalTx {
  from: {
    hash: string;
    name: string;
  };
  to: {
    hash: string;
    name: string;
  } | null;
  type: string;
  value: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  created_contract?: {
    hash: string;
    name: string | null;
  };
  block_index: number;
  transaction_index: number;
  index: number;
}

export interface BlockscoutResponse {
  items: BlockscoutInternalTx[];
  next_page_params?: {
    block_number: number;
    index: number;
    items_count: number;
    transaction_index: number;
  };
}

const SWAN_AGENT_FACTORY_ADDRESS = '0x8D7DfC92613AAc6a0A8f89dD0ED3e52C0C83f3c3';

/**
 * Custom hook to fetch all agents created by the SwanAgentFactory
 * Uses Blockscout API to get internal transactions that created contracts
 */
export function useAgentFactory() {
  return useQuery({
    queryKey: ['agent-factory-contracts'],
    queryFn: async (): Promise<Agent[]> => {
      try {
        return await fetchAgentsFromFactory();
      } catch (error) {
        console.error('Error fetching agents from Blockscout:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Utility function to fetch all agents without using a React hook
 * Useful for server-side or one-off fetches
 */
export async function fetchAgentsFromFactory(): Promise<Agent[]> {
  let allAgents: Agent[] = [];
  let nextPageParams: BlockscoutResponse['next_page_params'] = undefined;
  let page = 1;
  const limit = 50; // Max items per page
  const MAX_RETRIES = 3;
  const MAX_PAGES = 5; // Limit the number of pages to fetch to avoid infinite loops

  try {
    do {
      // Build URL with pagination params if needed
      let apiUrl = `https://base.blockscout.com/api/v2/addresses/${SWAN_AGENT_FACTORY_ADDRESS}/internal-transactions?filter=to%20%7C%20from&limit=${limit}`;
      
      if (nextPageParams) {
        const { block_number, index, items_count, transaction_index } = nextPageParams;
        apiUrl += `&block_number=${block_number}&index=${index}&items_count=${items_count}&transaction_index=${transaction_index}`;
      }
      
      console.log(`Fetching page ${page} of internal transactions...`, apiUrl);
      
      // Add retry logic for each request
      let retries = 0;
      let success = false;
      let response;
      let data: BlockscoutResponse = { items: [] };
      
      while (retries < MAX_RETRIES && !success) {
        try {
          response = await fetch(apiUrl);
          
          if (response.ok) {
            data = await response.json() as BlockscoutResponse;
            success = true;
          } else {
            // If we're getting errors on second page, just stop pagination
            if (page > 1) {
              console.log(`Received error ${response.status} on page ${page}, stopping pagination`);
              nextPageParams = undefined;
              break;
            }
            
            console.log(`Attempt ${retries + 1} failed with status ${response.status}, retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          }
        } catch (error) {
          console.error(`Request error on attempt ${retries + 1}:`, error);
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!success) {
        if (page > 1) {
          // If we fail on pages after the first one, just return what we have so far
          console.log(`Failed to fetch page ${page} after ${MAX_RETRIES} retries, returning ${allAgents.length} agents found so far`);
          return allAgents;
        } else {
          // If we fail on first page, throw error to trigger fallback
          throw new Error(`Failed to fetch first page after ${MAX_RETRIES} retries`);
        }
      }
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn('Unexpected API response structure:', data);
        if (page > 1) {
          // If we get bad data after first page, just return what we have
          return allAgents;
        } else {
          throw new Error('Invalid API response format');
        }
      }
      
      // Filter for contract creation transactions only
      const pageAgents = data.items
        .filter((tx) => 
          tx.type === 'create' && tx.created_contract
        )
        .map((tx) => ({
          address: tx.created_contract?.hash as string,
          transactionHash: tx.tx_hash,
          blockNumber: tx.block_number,
          timestamp: tx.timestamp
        }));
      
      allAgents = [...allAgents, ...pageAgents];
      console.log(`Found ${pageAgents.length} agents on page ${page}. Total: ${allAgents.length}`);
      
      // Update pagination params for next request
      nextPageParams = data.next_page_params;
      page++;
      
      // If there are more pages, add a small delay to avoid rate limiting
      if (nextPageParams) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Safeguard against infinite loops
      if (page > MAX_PAGES) {
        console.log(`Reached max page limit of ${MAX_PAGES}, stopping pagination`);
        break;
      }
    } while (nextPageParams);
    
    console.log(`Completed fetching all agents. Total: ${allAgents.length}`);
    return allAgents;
  } catch (error) {
    console.error('Error fetching agents from Blockscout:', error);
    throw error;
  }
} 
