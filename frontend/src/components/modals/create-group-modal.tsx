'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      setIsLoading(true);
      
      writeContract({
        address: CONTRACTS.SPLIT_ME,
        abi: SPLIT_ME_ABI,
        functionName: 'createGroup',
        args: [groupName.trim()],
      });

      toast.promise(
        new Promise((resolve, reject) => {
          if (isSuccess) resolve(hash);
          if (!isConfirming && !isSuccess) reject(new Error('Transaction failed'));
        }),
        {
          loading: 'Creating group...',
          success: 'Group created successfully!',
          error: 'Failed to create group',
        }
      );

    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error?.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal on success
  if (isSuccess) {
    setGroupName('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Group</h2>
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
                Group Name
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
                💡 <strong>Tip:</strong> You can add members to your group after creating it.
                All group members will be able to add expenses and view balances.
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
              {isLoading || isConfirming ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}