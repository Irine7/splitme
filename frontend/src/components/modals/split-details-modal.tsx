'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { X, Users, Calendar, Tag } from 'lucide-react';
import { formatCurrency, formatDate, formatAddress } from '@/utils/format';
import { useGroupStore } from '@/stores/group-store';
import { Portal } from '@/components/ui/portal';

// Define expense categories with icons and colors
const EXPENSE_CATEGORIES = [
  {
    id: 'bars',
    name: 'Bars',
    icon: '🍔',
    color: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    color: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '💡',
    color: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📝',
    color: 'bg-gray-100 dark:bg-gray-900/30',
  },
];

interface SplitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
}

export function SplitDetailsModal({ isOpen, onClose, groupId }: SplitDetailsModalProps) {
  const { groups } = useGroupStore();
  const [loading, setLoading] = useState(true);
  
  // Найти группу в локальном хранилище
  const storeGroup = groups.find(g => g.id === groupId);
  
  // Получить данные группы из блокчейна
  const { data: groupData, isLoading: isGroupLoading } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup',
    args: [BigInt(groupId)],
  });

  // Получить участников группы из блокчейна
  const { data: membersData, isLoading: isMembersLoading } = useReadContract({
    address: CONTRACTS.SPLIT_ME,
    abi: SPLIT_ME_ABI,
    functionName: 'getGroup', // Используем getGroup вместо getGroupMembers
    args: [BigInt(groupId)],
  });

  useEffect(() => {
    if (!isGroupLoading && !isMembersLoading) {
      setLoading(false);
    }
  }, [isGroupLoading, isMembersLoading]);

  if (!isOpen) return null;

  // Объединяем данные из хранилища и блокчейна
  const name = storeGroup?.name || `Split #${groupId}`;
  const creator = storeGroup?.creator || (groupData ? groupData[0] : '0x0');
  const createdAt = storeGroup?.createdAt || (groupData ? Number(groupData[2]) : 0);
  const category = storeGroup?.category || 'other';
  const amount = storeGroup?.amount || 0;
  
  // Получаем участников
  const members = storeGroup?.members || 
    (membersData ? Array.isArray(membersData) ? membersData : [] : []);
  
  // Находим категорию для отображения иконки
  const categoryInfo = EXPENSE_CATEGORIES.find((c: {id: string}) => c.id === category) || EXPENSE_CATEGORIES[0];

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="glass-card bg-card dark:bg-background/30 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-border/50 dark:border-white/10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className={`text-2xl ${categoryInfo.color}`}>{categoryInfo.icon}</span>
              {name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-lg font-semibold">{formatCurrency(amount)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Amount Per Person</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(members.length > 0 ? amount / members.length : amount)}
                    </div>
                  </div>
                </div>

                {/* Информация о создании */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Created on {formatDate(createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span>Category: {categoryInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{members.length} participants</span>
                  </div>
                </div>

                {/* Список участников */}
                <div className="space-y-3">
                  <h3 className="font-medium">Participants</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.isArray(members) && members.map((member: string, index: number) => (
                      <div 
                        key={`${index}-${member}`} 
                        className="flex items-center justify-between py-2 px-3 bg-secondary/10 dark:bg-white/5 rounded-md"
                      >
                        <div className="text-sm">
                          {member === creator ? (
                            <span className="flex items-center gap-1">
                              {formatAddress(member)}
                              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Host</span>
                            </span>
                          ) : (
                            formatAddress(member)
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(amount / (Array.isArray(members) ? members.length : 1))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
