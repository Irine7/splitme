'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { parseAmount } from '@/utils/format';
import { X, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
}

export function AddExpenseModal({ isOpen, onClose, groupId }: AddExpenseModalProps) {
  const { address } = useAccount();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: groupData } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup',
    args: [BigInt(groupId)],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    try {
      setIsLoading(true);
      
      const amountBigInt = parseAmount(amount);
      
      writeContract({
        address: CONTRACTS.SPLIT_ME,
        abi: SPLIT_ME_ABI,
        functionName: 'createExpense',
        args: [
          BigInt(groupId),
          description.trim(),
          amountBigInt,
          selectedParticipants
        ],
      });

      toast.promise(
        new Promise((resolve, reject) => {
          if (isSuccess) resolve(hash);
          if (!isConfirming && !isSuccess) reject(new Error('Transaction failed'));
        }),
        {
          loading: 'Adding expense...',
          success: 'Expense added successfully!',
          error: 'Failed to add expense',
        }
      );

    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error?.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (memberAddress: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberAddress)
        ? prev.filter(addr => addr !== memberAddress)
        : [...prev, memberAddress]
    );
  };

  // Reset form and close modal on success
  if (isSuccess) {
    setDescription('');
    setAmount('');
    setSelectedParticipants([]);
    onClose();
  }

  if (!isOpen || !groupData) return null;

  const [, , , members] = groupData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Expense</h2>
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
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at restaurant, Uber ride"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || isConfirming}
                maxLength={100}
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USDC)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || isConfirming}
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Split with ({selectedParticipants.length} selected)
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {members.map((member: string) => (
                  <label
                    key={member}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(member)}
                      onChange={() => toggleParticipant(member)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading || isConfirming}
                    />
                    <span className="text-sm">
                      {member === address ? 'You' : `${member.slice(0, 6)}...${member.slice(-4)}`}
                    </span>
                  </label>
                ))}
              </div>
              {selectedParticipants.length > 0 && amount && (
                <p className="text-sm text-gray-600 mt-2">
                  Each person pays: ${(parseFloat(amount) / selectedParticipants.length).toFixed(2)}
                </p>
              )}
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
              disabled={
                !description.trim() || 
                !amount || 
                parseFloat(amount) <= 0 || 
                selectedParticipants.length === 0 || 
                isLoading || 
                isConfirming
              }
            >
              {isLoading || isConfirming ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}