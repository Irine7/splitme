'use client';

import { useReadContract, useAccount } from 'wagmi';
import { Users } from 'lucide-react';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';

interface GroupListProps {
  selectedGroupId: number | null;
  onSelectGroup: (groupId: number) => void;
}

export function GroupList({ selectedGroupId, onSelectGroup }: GroupListProps) {
  const { address } = useAccount();

  const { data: userGroups, isLoading } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getUserGroups',
    args: address ? [address] : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!userGroups || userGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No splits yet</p>
        <p className="text-sm text-gray-500">Create your first split to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {userGroups.map((groupId) => (
        <GroupItem
          key={groupId.toString()}
          groupId={Number(groupId)}
          isSelected={selectedGroupId === Number(groupId)}
          onSelect={() => onSelectGroup(Number(groupId))}
        />
      ))}
    </div>
  );
}

function GroupItem({ groupId, isSelected, onSelect }: {
  groupId: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: groupData } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup',
    args: [BigInt(groupId)],
  });

  if (!groupData) return null;

  const [, name, , members] = groupData;

  return (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className="w-full justify-start p-4 h-auto"
      onClick={onSelect}
    >
      <div className="text-left">
        <div className="font-medium truncate">{name}</div>
        <div className="text-sm text-gray-500">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Button>
  );
}