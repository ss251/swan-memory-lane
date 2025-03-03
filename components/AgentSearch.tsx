'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useSwanContext } from '@/lib/providers/SwanProvider';
import { DEFAULT_AGENT_ADDRESS } from '@/lib/hooks/useAgentData';

export function AgentSearch() {
  const { loadAgentByAddress, isLoading, currentAgentAddress } = useSwanContext();
  const [searchInput, setSearchInput] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Function to validate Ethereum address
  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Only validate if there's input
    if (value) {
      setIsValidAddress(validateAddress(value));
    } else {
      setIsValidAddress(true); // Reset validation when input is empty
    }
  };

  const handleSearch = () => {
    if (!searchInput) return;
    
    if (validateAddress(searchInput)) {
      loadAgentByAddress(searchInput);
    } else {
      setIsValidAddress(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setIsValidAddress(true);
    loadAgentByAddress(DEFAULT_AGENT_ADDRESS);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search by agent address (0x...)"
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`pr-10 ${!isValidAddress ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isLoading}
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={!searchInput || !isValidAddress || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="whitespace-nowrap"
          disabled={isLoading || currentAgentAddress === DEFAULT_AGENT_ADDRESS}
        >
          Reset
        </Button>
      </div>
      
      {!isValidAddress && (
        <p className="text-red-500 text-xs">Please enter a valid Ethereum address (0x...)</p>
      )}
    </div>
  );
} 