'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { Users, Clock, CreditCard, Check, X, Calendar, Tag, DollarSign } from 'lucide-react';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { useGroupStore, Group as BaseGroup } from '@/stores/group-store';
import { formatDistanceToNow } from 'date-fns';

// Extend the base Group interface to include category and amount
interface Group extends BaseGroup {
  category?: string;
  amount?: number;
}

// Define a participant with settlement status
interface ParticipantWithStatus {
  address: `0x${string}`;
  name: string;
  hasSettled: boolean;
  settledAt?: number;
}

// Define expense categories with icons and colors (copied from other components)
const EXPENSE_CATEGORIES = [
  { id: 'bars', name: 'Bars', icon: '🍔', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'other', name: 'Other', icon: '📝', color: 'bg-gray-100 dark:bg-gray-800/50' },
];

interface SplitDetailsProps {
  groupId: number;
}

export function SplitDetails({ groupId }: SplitDetailsProps) {
  const { address } = useAccount();
  const { groups } = useGroupStore();
  const [participants, setParticipants] = useState<ParticipantWithStatus[]>([]);
  
  // Find the group in the Zustand store
  const storeGroup = groups.find(g => g.id === groupId) as Group | undefined;
  
  // Get group data from blockchain
  const { data: groupData, isLoading: isLoadingGroup } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup',
    args: [BigInt(groupId)],
  }) as { data: any[] | undefined, isLoading: boolean };

  // Combine data from store and blockchain
  useEffect(() => {
    if (groupData && Array.isArray(groupData)) {
      const [, name, creator, members] = groupData;
      
      // Create participants with settlement status based on host
      const participantsWithStatus: ParticipantWithStatus[] = members.map((memberAddress: `0x${string}`) => {
        // The host (creator) is always settled, others are pending
        const isHost = memberAddress === creator;
        const hasSettled = isHost;
        const settledAt = hasSettled ? Math.floor(Date.now() / 1000) : undefined;
        
        // Get participant name from store if available
        let participantName = '';
        if (storeGroup?.participantNames && storeGroup.participantNames[memberAddress]) {
          participantName = storeGroup.participantNames[memberAddress];
        } else {
          participantName = memberAddress === creator ? 'Host' : 
                          memberAddress === address ? 'You' : 
                          `Participant`;
        }
        
        return {
          address: memberAddress,
          name: participantName,
          hasSettled,
          settledAt
        };
      });
      
      setParticipants(participantsWithStatus);
    } else if (storeGroup && storeGroup.members.length > 0) {
      // If we don't have blockchain data yet but have store data
      const participantsWithStatus: ParticipantWithStatus[] = storeGroup.members.map((memberAddress) => {
        // The host (creator) is always settled, others are pending
        const isHost = memberAddress === storeGroup.creator;
        const hasSettled = isHost;
        const settledAt = hasSettled ? Math.floor(Date.now() / 1000) : undefined;
        
        // Get participant name from store if available
        let participantName = '';
        if (storeGroup.participantNames && storeGroup.participantNames[memberAddress]) {
          participantName = storeGroup.participantNames[memberAddress];
        } else {
          participantName = memberAddress === storeGroup.creator ? 'Host' : 
                          memberAddress === address ? 'You' : 
                          `Participant`;
        }
        
        return {
          address: memberAddress,
          name: participantName,
          hasSettled,
          settledAt
        };
      });
      
      setParticipants(participantsWithStatus);
    }
  }, [groupData, storeGroup, address]);

  // Get category info
  const categoryId = storeGroup?.category || 'other';
  const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES.find(cat => cat.id === 'other');
  
  // If loading and no store data
  if (isLoadingGroup && !storeGroup) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-8 bg-secondary/30 dark:bg-white/10 rounded mb-4 w-1/3"></div>
        <div className="h-6 bg-secondary/30 dark:bg-white/10 rounded mb-6 w-1/2"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-secondary/30 dark:bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Combine data from both sources
  const displayName = groupData && Array.isArray(groupData) ? groupData[1] : storeGroup?.name || `Split #${groupId}`;
  const creator = groupData && Array.isArray(groupData) ? groupData[2] : storeGroup?.creator || '0x0000000000000000000000000000000000000000';
  const createdAt = storeGroup?.createdAt || Math.floor(Date.now() / 1000) - 86400; // Default to yesterday
  const amount = storeGroup?.amount || 0;
  
  return (
    <div className="glass-card p-6 border-gray-200 dark:border-gray-800">
      <div className="flex items-center mb-6">
        <div className={`w-12 h-12 rounded-full ${categoryInfo?.color} flex items-center justify-center mr-4`}>
          <span className="text-2xl">{categoryInfo?.icon}</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{displayName}</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Created {formatDistanceToNow(new Date(createdAt * 1000))} ago</span>
            {categoryInfo && (
              <span className="ml-3 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {categoryInfo.name}
              </span>
            )}
            {amount > 0 && (
              <span className="ml-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${amount.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Participants ({participants.length})
        </h3>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 dark:bg-white/5"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">
                    {participant.name}
                    {participant.address === creator && (
                      <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {participant.address}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {participant.hasSettled ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">Settled</span>
                    {participant.settledAt && (
                      <span className="text-xs ml-2 text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(participant.settledAt * 1000))} ago
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <X className="w-4 h-4 mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Split Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-secondary/10 dark:bg-white/5">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-xl font-semibold">${amount > 0 ? amount.toFixed(2) : '0.00'}</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 dark:bg-white/5">
            <div className="text-sm text-muted-foreground">Amount Per Person</div>
            <div className="text-xl font-semibold">
              ${amount > 0 && participants.length > 0 
                ? (amount / participants.length).toFixed(2) 
                : '0.00'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 dark:bg-white/5">
            <div className="text-sm text-muted-foreground">Settlement Status</div>
            <div className="text-xl font-semibold">
              {participants.filter(p => p.hasSettled).length} / {participants.length} Settled
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 dark:bg-white/5">
            <div className="text-sm text-muted-foreground">Category</div>
            <div className="text-xl font-semibold flex items-center">
              <span className="mr-2">{categoryInfo?.icon}</span>
              {categoryInfo?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
