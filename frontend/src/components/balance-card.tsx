'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { SettleAllModal } from '@/components/modals/settle-all-modal';
import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { AddExpenseModal } from './modals/add-expense-modal';

interface BalanceCardProps {
  groupId: number;
}

export function BalanceCard({ groupId }: BalanceCardProps) {
  const { address } = useAccount();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleAll, setShowSettleAll] = useState(false);

  const { data: groupData } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup',
    args: [BigInt(groupId)],
  });

  const { data: userBalance } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getUserBalance',
    args: address ? [address, BigInt(groupId)] : undefined,
  });

  const { data: groupBalances } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroupBalances',
    args: [BigInt(groupId)],
  });

  if (!groupData) return null;

  const [, groupName] = groupData;
  const balance = userBalance ? Number(userBalance) / 1e18 : 0;
  const isInDebt = balance < 0;
  const isOwed = balance > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{groupName}</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
          {isInDebt && (
            <Button
              onClick={() => setShowSettleAll(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Settle All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Your Balance</h3>
          <p className={`text-2xl font-bold ${
            isInDebt ? 'text-red-600' : isOwed ? 'text-green-600' : 'text-gray-900'
          }`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          <p className="text-sm text-gray-500">
            {isInDebt ? 'You owe' : isOwed ? 'You are owed' : 'Settled up'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Owed</h3>
          <p className="text-2xl font-bold text-red-600">
            {groupBalances ? formatCurrency(
              groupBalances[1]
                .filter((bal: bigint) => bal < 0n)
                .reduce((sum: number, bal: bigint) => sum + Math.abs(Number(bal)) / 1e18, 0)
            ) : '$0.00'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Lent</h3>
          <p className="text-2xl font-bold text-green-600">
            {groupBalances ? formatCurrency(
              groupBalances[1]
                .filter((bal: bigint) => bal > 0n)
                .reduce((sum: number, bal: bigint) => sum + Number(bal) / 1e18, 0)
            ) : '$0.00'}
          </p>
        </div>
      </div>

      {groupBalances && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Group Balances</h3>
          <div className="space-y-2">
            {groupBalances[0].map((member: string, index: number) => {
              const memberBalance = Number(groupBalances[1][index]) / 1e18;
              return (
                <div key={member} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <span className="font-medium">
                    {member === address ? 'You' : `${member.slice(0, 6)}...${member.slice(-4)}`}
                  </span>
                  <span className={`font-semibold ${
                    memberBalance < 0 ? 'text-red-600' : memberBalance > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {memberBalance < 0 ? '-' : memberBalance > 0 ? '+' : ''}{formatCurrency(Math.abs(memberBalance))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={groupId}
      />

      <SettleAllModal
        isOpen={showSettleAll}
        onClose={() => setShowSettleAll(false)}
        groupId={groupId}
        debtAmount={Math.abs(balance)}
      />
    </div>
  );
}