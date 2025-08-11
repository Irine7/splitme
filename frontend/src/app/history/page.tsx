'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatAddress } from '@/utils/format';
import { ExpenseList } from '@/components/expense-list';

export default function History() {
  const { address } = useAccount();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 glass-card bg-card dark:bg-background/30 rounded-lg shadow-lg p-8 flex-1">
        <h2 className="text-lg font-semibold text-foreground dark:text-white/90 mb-6">History</h2>
        
        {address ? (
          <ExpenseList groupId={selectedGroupId} />
        ) : (
          <p className="text-muted-foreground dark:text-white/60 text-center">
            Please connect your wallet to view your history
          </p>
        )}
      </div>
    </div>
  );
}