'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { formatCurrency, formatDate, formatAddress } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Receipt, DollarSign, Clock } from 'lucide-react';
import { SettleExpenseModal } from './modals/settle-expense-modal';

interface ExpenseListProps {
  groupId: number;
}

export function ExpenseList({ groupId }: ExpenseListProps) {
  const { address } = useAccount();
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

  // This is a simplified version - in a real app, you'd want to track expenses in the contract
  // For now, we'll show a placeholder structure
  const expenses = [
    {
      id: 1,
      description: "Dinner at Italian Restaurant",
      amount: 120.50,
      paidBy: "0x1234567890123456789012345678901234567890",
      participants: 4,
      date: Date.now() / 1000 - 86400,
      settled: false
    },
    {
      id: 2,
      description: "Uber ride to airport",
      amount: 45.25,
      paidBy: address,
      participants: 3,
      date: Date.now() / 1000 - 172800,
      settled: true
    }
  ];

  if (expenses.length === 0) {
    return (
      <div className="glass-card bg-card dark:bg-background/30 rounded-lg shadow-lg p-8 text-center">
        <Receipt className="w-12 h-12 text-muted-foreground dark:text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-foreground dark:text-white/90 mb-2">No expenses yet</h3>
        <p className="text-muted-foreground dark:text-white/60 mb-4">
          Add your first expense to start tracking shared costs
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card bg-card dark:bg-background/30 rounded-lg shadow-lg">
      <div className="p-6 border-b border-border/50 dark:border-white/10">
        <h3 className="text-lg font-semibold text-foreground dark:text-white/90">Recent Expenses</h3>
      </div>

      <div className="divide-y">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            currentUser={address}
            onSettle={(expenseId) => setSelectedExpenseId(expenseId)}
          />
        ))}
      </div>

      {selectedExpenseId && (
        <SettleExpenseModal
          isOpen={true}
          onClose={() => setSelectedExpenseId(null)}
          expenseId={selectedExpenseId}
        />
      )}
    </div>
  );
}

function ExpenseItem({ expense, currentUser, onSettle }: {
  expense: any;
  currentUser: string | undefined;
  onSettle: (expenseId: number) => void;
}) {
  const isPaidByUser = expense.paidBy === currentUser;
  const userShare = expense.amount / expense.participants;

  return (
    <div className="p-4 hover:bg-secondary/10 dark:hover:bg-white/5 transition-colors border-border/50 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground dark:text-white/90">{expense.description}</h4>
            {expense.settled && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                Settled
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-white/60">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Total: {formatCurrency(expense.amount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(expense.date)}
            </span>
          </div>

          <div className="mt-2 text-sm">
            <span className="text-muted-foreground dark:text-white/60">
              Paid by: {isPaidByUser ? 'You' : formatAddress(expense.paidBy)}
            </span>
            <span className="mx-2 text-muted-foreground/50 dark:text-white/30">•</span>
            <span className="text-muted-foreground dark:text-white/60">
              Split {expense.participants} ways ({formatCurrency(userShare)} each)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className={`font-semibold ${
              isPaidByUser ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {isPaidByUser ? '+' : '-'}{formatCurrency(isPaidByUser ? expense.amount - userShare : userShare)}
            </div>
            <div className="text-xs text-muted-foreground dark:text-white/50">
              {isPaidByUser ? 'You are owed' : 'You owe'}
            </div>
          </div>

          {!expense.settled && !isPaidByUser && (
            <Button
              size="sm"
              onClick={() => onSettle(expense.id)}
              className="text-xs"
            >
              Settle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}