'use client';

import React from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks/useAgents';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, BrainCircuit, LayersIcon, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatEth } from '@/lib/utils';

export const AgentList = () => {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [isRefetching, setIsRefetching] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing agents:', err);
    } finally {
      setIsRefetching(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold tracking-tight">SWAN Agents</h2>
        </div>
        
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-destructive">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Network Connection Issue</h3>
              <p className="text-sm mb-4">We&apos;re having trouble connecting to the Base network. This could be due to network congestion or RPC endpoint issues.</p>
              <p className="text-sm">Showing mock data in the meantime. You can try refreshing to reconnect.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefetching}
              className="ml-4 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Connecting...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="lg:text-2xl md:text-2xl text-xl font-bold tracking-tight">SWAN Agents</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="sr-only md:not-sr-only md:inline-block">Refresh</span>
          </Button>
          <Badge variant="outline" className="px-3 py-1 font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              `${agents?.length || 0} Agents`
            )}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-md" />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent, index) => (
            <Link key={agent.address || `agent-${index}`} href={`/agent/${agent.address}`} passHref>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="truncate">{agent.name || 'Unnamed Agent'}</CardTitle>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      Round {agent.round || 0}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs truncate">
                    {agent.address || 'Unknown Address'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm line-clamp-3 mb-4">
                    {agent.description || 'No description available'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                      <span>Round {agent.round || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span>{formatEth(agent.treasury)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm col-span-2">
                      <LayersIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Created {agent.createdAt ? formatDistanceToNow(agent.createdAt * 1000, { addSuffix: true }) : 'recently'}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-muted-foreground">
                      Owner: {agent.owner ? `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}` : 'Unknown'}
                    </span>
                    <div className="flex items-center text-primary text-sm font-medium">
                      View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}; 