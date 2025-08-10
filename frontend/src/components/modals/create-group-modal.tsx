'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '@/stores/group-store';

type Log = {
  topics: string[];
  data: string;
};

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { addGroup } = useGroupStore();

  const { 
    writeContract, 
    data: hash, 
    error: writeError,
    reset: resetWrite
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess, 
    data: receipt 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle write contract errors
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      toast.error('Failed to send transaction');
      setIsLoading(false);
      resetWrite();
    }
  }, [writeError, resetWrite]);

  // Handle successful transaction
  useEffect(() => {
    if (!isSuccess || !receipt?.logs || !address) return;
    
    const processReceipt = () => {
      try {
        // Extract groupId from the transaction receipt logs
        const groupCreatedEvent = receipt.logs.find(
          (log: Log) => 
            log.topics[0] === '0x3a0ca8f38b91a9c9d298b34a890bdb4ef784edb3f0a5fbb7efbafd2f01cee3a7' // GroupCreated event signature
        );

        if (groupCreatedEvent) {
          const groupId = parseInt(groupCreatedEvent.topics[1], 16);
          
          // Ensure we have a valid group name
          const groupNameToUse = groupName || 'Unnamed Group';
          
          // Add the new group to the store
          addGroup({
            id: groupId,
            name: groupNameToUse,
            creator: address as `0x${string}`,
            members: [address as `0x${string}`],
            createdAt: Math.floor(Date.now() / 1000)
          });

          toast.success('Group created successfully!');
          setGroupName('');
          onClose();
        }
      } catch (error) {
        console.error('Error processing transaction receipt:', error);
        toast.error('Failed to process transaction');
      } finally {
        setIsLoading(false);
      }
    };

    processReceipt();
  }, [isSuccess, receipt, groupName, address, addGroup, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = groupName?.trim() || '';
    
    if (!trimmedName) {
      toast.error('Please enter a group name');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      
      // Explicitly type the contract call
      const contractCall = {
        address: CONTRACTS.SPLIT_ME as `0x${string}`,
        abi: SPLIT_ME_ABI,
        functionName: 'createGroup' as const,
        args: [groupName.trim()] as const,
      };
      
      await writeContract(contractCall);

    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error?.message || 'Failed to create group');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Split</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading || isConfirming}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Weekend Trip, Rent Split"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || isConfirming}
                maxLength={50}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> You can add members to your split after creating it.
                All split members will be able to add expenses and view balances.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading || isConfirming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!groupName.trim() || isLoading || isConfirming}
            >
              {isLoading || isConfirming ? 'Creating...' : 'Create Split'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}