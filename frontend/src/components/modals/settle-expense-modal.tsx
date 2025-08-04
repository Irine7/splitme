'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI, EXPENSE_TOKEN_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { formatCurrency, parseAmount } from '@/utils/format';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettleExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: number;
}

export function SettleExpenseModal({ isOpen, onClose, expenseId }: SettleExpenseModalProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract: approveTokens } = useWriteContract();
  const { writeContract: settleExpense } = useWriteContract();

  // This is simplified - in a real app you'd fetch the actual expense data
  const expenseData = {
    description: "Sample Expense",
    totalAmount: 120.50,
    userShare: 30.13,
    settled: false
  };

  const handleSettle = async (amount: number) => {
    try {
      setIsLoading(true);
      
      const amountBigInt = parseAmount(amount.toString());
      
      // First approve tokens
      await approveTokens({
        address: CONTRACTS.EXPENSE_TOKEN,
        abi: EXPENSE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACTS.SPLIT_ME, amountBigInt],
      });

      // Then settle the expense
      await settleExpense({
        address: CONTRACTS.SPLIT_ME,
        abi: SPLIT_ME_ABI,
        functionName: 'settleExpense',
        args: [BigInt(expenseId), amountBigInt],
      });

      toast.success('Expense settled successfully!');
      onClose();

    } catch (error: any) {
      console.error('Error settling expense:', error);
      toast.error(error?.message || 'Failed to settle expense');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Settle Expense</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{expenseData.description}</h3>
            <div className="text-sm text-gray-600">
              <p>Total: {formatCurrency(expenseData.totalAmount)}</p>
              <p>Your share: {formatCurrency(expenseData.userShare)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleSettle(expenseData.userShare)}
              disabled={isLoading}
              className="w-full"
            >
              Pay Your Share ({formatCurrency(expenseData.userShare)})
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or pay custom amount</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSettle(parseFloat(customAmount))}
                disabled={!customAmount || parseFloat(customAmount) <= 0 || isLoading}
              >
                Pay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}