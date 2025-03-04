'use client';

import { useAgentFactory } from '@/lib/hooks/useAgentFactory';
import { useAgents } from '@/lib/hooks/useAgents';
import { useState } from 'react';

export default function AgentsTestPage() {
  const { data: factoryAgents, isLoading: isLoadingFactory, error: factoryError } = useAgentFactory();
  const { data: fullAgents, isLoading: isLoadingFull, error: fullError } = useAgents();
  const [viewMode, setViewMode] = useState<'factory' | 'full'>('factory');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Swan Agents Test</h1>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setViewMode('factory')}
          className={`px-4 py-2 rounded ${viewMode === 'factory' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Factory Agents ({factoryAgents?.length || 0})
        </button>
        <button 
          onClick={() => setViewMode('full')}
          className={`px-4 py-2 rounded ${viewMode === 'full' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Full Agents ({fullAgents?.length || 0})
        </button>
      </div>
      
      {/* Factory Agents View */}
      {viewMode === 'factory' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Factory Agents (Raw from Blockscout)</h2>
          
          {isLoadingFactory && <p className="text-gray-500">Loading factory agents...</p>}
          {factoryError && <p className="text-red-500">Error: {factoryError.message}</p>}
          
          {factoryAgents && factoryAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">TX Hash</th>
                    <th className="px-4 py-2 text-left">Block</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {factoryAgents.map((agent, index) => (
                    <tr key={agent.address || `factory-agent-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 font-mono text-sm">
                        {agent.address ? (
                          <a href={`https://base.blockscout.com/address/${agent.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agent.address.substring(0, 8)}...{agent.address.substring(agent.address.length - 6)}
                          </a>
                        ) : (
                          <span className="text-gray-400">Unknown address</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-sm">
                        {agent.transactionHash ? (
                          <a href={`https://base.blockscout.com/tx/${agent.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agent.transactionHash.substring(0, 8)}...{agent.transactionHash.substring(agent.transactionHash.length - 6)}
                          </a>
                        ) : (
                          <span className="text-gray-400">No transaction hash</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{agent.blockNumber}</td>
                      <td className="px-4 py-2">{agent.timestamp || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No factory agents found.</p>
          )}
        </div>
      )}
      
      {/* Full Agents View */}
      {viewMode === 'full' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Full Agents (With Contract Data)</h2>
          
          {isLoadingFull && <p className="text-gray-500">Loading agent details...</p>}
          {fullError && <p className="text-red-500">Error: {fullError.message}</p>}
          
          {fullAgents && fullAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Owner</th>
                    <th className="px-4 py-2 text-left">Round</th>
                    <th className="px-4 py-2 text-left">Treasury</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {fullAgents.map((agent, index) => (
                    <tr key={agent.address || `full-agent-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 font-mono text-sm">
                        {agent.address ? (
                          <a href={`https://base.blockscout.com/address/${agent.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agent.address.substring(0, 8)}...{agent.address.substring(agent.address.length - 6)}
                          </a>
                        ) : (
                          <span className="text-gray-400">Unknown address</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{agent.name || 'Unnamed'}</td>
                      <td className="px-4 py-2 font-mono text-sm">
                        {agent.owner ? (
                          <a href={`https://base.blockscout.com/address/${agent.owner}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agent.owner.substring(0, 8)}...{agent.owner.substring(agent.owner.length - 6)}
                          </a>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{agent.round || 'N/A'}</td>
                      <td className="px-4 py-2">{agent.treasury || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {agent.createdAt ? new Date(agent.createdAt * 1000).toLocaleString() : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No agent details found.</p>
          )}
        </div>
      )}
      
      {/* Export Button */}
      <div className="mt-8">
        <button
          onClick={() => {
            const data = viewMode === 'factory' ? factoryAgents : fullAgents;
            if (data) {
              const json = JSON.stringify(data, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `swan-agents-${viewMode}-${new Date().toISOString()}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export {viewMode === 'factory' ? 'Factory' : 'Full'} Agents to JSON
        </button>
      </div>
    </div>
  );
} 