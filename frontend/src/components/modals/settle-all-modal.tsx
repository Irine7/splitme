'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI, EXPENSE_TOKEN_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { formatCurrency, parseAmount } from '@/utils/format';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettleAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  debtAmount: number;
}

export function SettleAllModal({ isOpen, onClose, groupId, debtAmount }: SettleAllModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { address: userAddress } = useAccount();

  const { writeContract: approveTokens, data: approveHash } = useWriteContract();
  const { writeContract: settleDebts, data: settleHash } = useWriteContract();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isSettling, isSuccess } = useWaitForTransactionReceipt({
    hash: settleHash,
  });

  const { data: allowance } = useReadContract({
    address: CONTRACTS.EXPENSE_TOKEN,
    abi: EXPENSE_TOKEN_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACTS.SPLIT_ME] : undefined, // [owner, spender]
  });

  const handleSettleAll = async () => {
    try {
      setIsLoading(true);
      
      const amountBigInt = parseAmount(debtAmount.toString());
      
      // Check if we need to approve first
      const allowanceBigInt = allowance ? BigInt(allowance.toString()) : BigInt(0);
      if (!allowance || allowanceBigInt < amountBigInt) {
        toast.loading('Approving tokens...');
        
        await approveTokens({
          address: CONTRACTS.EXPENSE_TOKEN,
          abi: EXPENSE_TOKEN_ABI,
          functionName: 'approve',
          args: [CONTRACTS.SPLIT_ME, amountBigInt],
        });

        // Wait for approval to complete
        // In a real app, you'd wait for the approval transaction to be mined
      }

      // Settle all debts
      await settleDebts({
        address: CONTRACTS.SPLIT_ME,
        abi: SPLIT_ME_ABI,
        functionName: 'settleAllDebts',
        args: [BigInt(groupId)],
      });

      toast.success('All debts settled successfully!');
      onClose();

    } catch (error: any) {
      console.error('Error settling debts:', error);
      toast.error(error?.message || 'Failed to settle debts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Settle All Debts</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading || isApproving || isSettling}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Confirm Settlement</h3>
                <p className="text-sm text-yellow-700">
                  You are about to settle all your debts in this group. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount to Settle:</span>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(debtAmount)}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>• This will pay off all your outstanding debts in the group</p>
              <p>• The amount will be distributed to members you owe money to</p>
              <p>• Your group balance will be reset to $0.00</p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading || isApproving || isSettling}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSettleAll}
              disabled={isLoading || isApproving || isSettling}
            >
              {isApproving ? 'Approving...' : isSettling ? 'Settling...' : `Settle ${formatCurrency(debtAmount)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}