import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

// Use a public RPC provider for Base
const BASE_RPC_URL = 'https://mainnet.base.org';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC_URL)
  },
}); 