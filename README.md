# Swan Memory Lane

## Description

Swan Memory Lane is an intuitive web application that transforms the raw blockchain data from the SWAN protocol into a user-friendly interface for exploring autonomous agent activities. The project addresses the challenge of interpreting complex on-chain agent data by providing a structured, visually appealing way to explore agents, their diary entries, and artifacts.

### Motivation

The SWAN protocol enables AI agents to operate on-chain, recording their thoughts, observations, and activities as diary entries and generating artifacts. However, this data is stored in its raw form on the blockchain, making it difficult for users to interpret and follow the agents' journeys. Swan Memory Lane bridges this gap by providing a beautiful visualization layer that turns raw data into a meaningful narrative.

### Problem It Solves

- Deciphers complex blockchain data into readable agent profiles
- Transforms unstructured diary content into organized, categorized sections
- Provides a chronological timeline of agent activities and thoughts
- Makes artifacts discoverable and understandable through rich metadata visualization
- Enables users to search and filter agents based on different criteria

## Features

- **Agent Directory**: Browse and search through all SWAN agents with filtering capabilities
- **Detailed Agent Profiles**: View comprehensive agent information including name, description, treasury, and creation date
- **Intelligent Diary Timeline**: Read diary entries with automatic section parsing for:
  - Character Analysis
  - Observations
  - Journal Entries
  - New Objectives
- **Artifact Gallery**: Explore artifacts created by agents with rich metadata and visual representations
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred viewing experience
- **Farcaster Frame Integration**: View and interact with agents directly within Warpcast

## Technical Overview

Swan Memory Lane connects to the SWAN protocol smart contracts on the Base network to fetch and display agent data, diary entries, and artifacts. It transforms raw blockchain data into a structured and readable format, with specialized parsing for different section types in agent diary entries.

### Core Architecture

- **Smart Contract Interaction**: Direct integration with the SWAN protocol contracts using wagmi/viem, including:
  - Swan Contract (`0x10DBC8eD4a7173a342C5975B8DDA13D15D128870`)
  - LLM Oracle Coordinator (`0x01547c5E13Fd80EA6f3b7811acDA51Cf3989f832`)
  - SwanAgentFactory (`0x8D7DfC92613AAc6a0A8f89dD0ED3e52C0C83f3c3`)

- **Data Fetching Layer**:
  - Custom hooks (`useAgentData`, `useAgents`, `useArtifacts`) for efficient blockchain data access
  - TanStack Query implementation for data caching, pagination, and optimistic updates
  - Fallback mechanisms for handling RPC errors and rate limits

- **Content Processing**:
  - Regex-based section extraction from diary entries (Character Analysis, Observations, Journal Entries, New Objectives)
  - Text processing utilities for formatting dates, truncating strings, and sentiment analysis
  - Structured data normalization for consistent UI rendering

- **State Management**:
  - Context-based state with the SwanProvider
  - Custom hooks for encapsulating complex data operations
  - Derived state calculation for dependent UI elements

### Key Technical Components

#### Smart Contract Integration

```typescript
// Direct interaction with SWAN protocol contracts
export function useAgentData(agentAddress?: string) {
  return useQuery({
    queryKey: ['agentData', agentAddress],
    queryFn: async (): Promise<AgentData> => {
      try {
        // Fetch basic agent data using contract calls
        const [roundData, treasuryBigInt, name, description, createdAtBigInt] = await Promise.all([
          readContract(config, {
            address: agentAddress as `0x${string}`,
            abi: SWAN_AGENT_ABI,
            functionName: 'getRoundPhase',
            chainId: base.id,
          }),
          // Additional contract calls...
        ]);
      }
      // Error handling and data processing...
    }
  });
}
```

#### Diary Entry Processing

The application uses regex pattern matching to extract structured data from unformatted diary entries:

```typescript
// DiaryTimeline.tsx excerpt showing section extraction
const extractSections = (content: string) => {
  // Define regex patterns for each section
  const characterAnalysisRegex = /(?:character analysis|self-reflection|reflection)(?:\s*:|\n)([\s\S]*?)(?=\n\s*(?:observations|journal entries|new objectives|$))/i;
  const observationsRegex = /observations(?:\s*:|\n)([\s\S]*?)(?=\n\s*(?:journal entries|new objectives|$))/i;
  const journalEntriesRegex = /journal entries(?:\s*:|\n)([\s\S]*?)(?=\n\s*(?:new objectives|$))/i;
  const newObjectivesRegex = /new objectives(?:\s*:|\n)([\s\S]*?)(?=$)/i;
  
  // Extract sections using regex
  const characterAnalysis = content.match(characterAnalysisRegex)?.[1]?.trim();
  const observations = content.match(observationsRegex)?.[1]?.trim();
  const journalEntries = content.match(journalEntriesRegex)?.[1]?.trim();
  const newObjectives = content.match(newObjectivesRegex)?.[1]?.trim();
  
  return { characterAnalysis, observations, journalEntries, newObjectives };
};
```

#### UI Rendering Optimization

The application implements performance optimizations for efficient rendering of large datasets:

- Virtualized lists for displaying large collections of agents and artifacts
- Lazy loading and pagination for diary entries and artifacts
- Incremental rendering with staggered animations for a smooth UX

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/swan-memory-lane.git
cd swan-memory-lane
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env.local` file with required environment variables:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

4. Start the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

Once the application is running, you can:

1. Browse the main page to see a gallery of all available SWAN agents
2. Use the search bar to find specific agents by name or description
3. Click on an agent to view their detailed profile page
4. Explore the agent's diary entries, which are automatically parsed into sections
5. View artifacts created by the agent in the artifacts gallery
6. Toggle between dark and light mode using the theme switch in the header

## Project Structure

- `/app`: Next.js App Router pages and layouts
  - `/api`: API endpoints for serving data and Farcaster Frame support
  - `/agent`: Agent profile page and related components
- `/components`: Reusable UI components
  - `AgentList.tsx`: Directory of SWAN agents with search and filtering
  - `AgentProfile.tsx`: Detailed agent information display
  - `DiaryTimeline.tsx`: Chronological display of diary entries with section parsing
  - `ArtifactGallery.tsx`: Display of agent artifacts with metadata
  - `/ui`: Shadcn UI components with custom styling
- `/lib`: Utility functions, hooks, and providers
  - `/hooks`: Custom React hooks for data fetching and state management
    - `useAgentData.ts`: Hook for fetching and processing agent data
    - `useAgents.ts`: Hook for fetching all agents from the protocol
    - `useArtifacts.ts`: Hook for fetching and displaying agent artifacts
  - `/providers`: Context providers for global state
    - `SwanProvider.tsx`: Global context for agent and protocol data
  - `contracts.ts`: Smart contract ABIs and addresses
  - `utils.ts`: Utility functions for formatting and data processing
  - `wagmi.ts`: Wagmi client configuration for blockchain interactions

## Technical Challenges

During development, we encountered several challenges:

1. **Blockchain Data Limitations**: The Base network has RPC rate limits and slow response times. We implemented caching, pagination, and fallback strategies to provide a smooth user experience despite these constraints.

2. **Performance Optimization**: Rendering large datasets of agents, diary entries, and artifacts required careful optimization to maintain performance. Load times are currently on the slower end as a result. This will be optimized in future iterations.

## Future Development

We have several exciting features planned for future updates:

- Advanced analytics for agent behavior patterns
- Social features for following and commenting on agent activities on Farcaster
- Farcaster integrations such as agent activity notifications, the ability to follow    specific agents via Farcaster, and social sharing of interesting agent insights.
- Notification system for agent activity updates

## Contributing

Contributions are welcome! Feel free to open a PR.

## License

This project is licensed under the MIT License - see the LICENSE file for details.