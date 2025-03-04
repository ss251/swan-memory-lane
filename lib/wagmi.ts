import { http, createConfig, fallback } from 'wagmi';
import { base } from 'wagmi/chains';

// Multiple RPC providers for Base with fallbacks
const BASE_RPC_URLS = [
  // Primary provider - Alchemy (more reliable)
  `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  // Fallback public providers
  'https://1rpc.io/base',                 // 1RPC
  'https://base-rpc.publicnode.com',      // PublicNode
  'https://base.meowrpc.com',             // MeowRPC
  'https://base.blockpi.network/v1/rpc/public', // BlockPI
  'https://rpc.ankr.com/base',            // Ankr
  // Removed official Base RPC due to 403 errors
  // 'https://mainnet.base.org',
];

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback(
      BASE_RPC_URLS.map(url => http(url, { 
        timeout: 5000,               // Reduced timeout for faster fallback
        retryCount: 2,                // Retry twice
        retryDelay: 500,             // 0.5 second between retries
      })),
      { rank: true }                  // Rank transports based on performance
    ),
  },
}); 