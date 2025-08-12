'use client';

import { useReadContract, useAccount } from 'wagmi';
import { Users, Tag, Trash2 } from 'lucide-react';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { useGroupStore, Group as BaseGroup } from '@/stores/group-store';
import toast from 'react-hot-toast';

// Extend the base Group interface to include category
interface Group extends BaseGroup {
	category?: string;
}

interface GroupListProps {
	selectedGroupId: number | null;
	onSelectGroup: (groupId: number) => void;
}

export function GroupList({ selectedGroupId, onSelectGroup }: GroupListProps) {
	const { address } = useAccount();
	const { groups } = useGroupStore();

	const { data: userGroups, isLoading } = useReadContract({
		address: CONTRACTS.SPLIT_ME,
		abi: SPLIT_ME_ABI,
		functionName: 'getUserGroups',
		args: address ? [address] : undefined,
	});

	// Combine groups from blockchain and Zustand store
	const combinedGroups: Group[] = [];

	// Add groups from Zustand store
	if (groups && groups.length > 0) {
		combinedGroups.push(...groups);
	}

	// Add groups from blockchain that aren't already in the store
	if (userGroups && Array.isArray(userGroups) && userGroups.length > 0) {
		userGroups.forEach((groupId) => {
			const id = Number(groupId);
			if (!combinedGroups.some((g) => g.id === id)) {
				// This group is in the blockchain but not in our store yet
				// We'll add a placeholder that will be updated when selected
				combinedGroups.push({
					id,
					name: `Split #${id}`,
					creator:
						'0x0000000000000000000000000000000000000000' as `0x${string}`,
					members: [],
					createdAt: 0,
					category: 'other', // Default category
				});
			}
		});
	}

	if (isLoading && combinedGroups.length === 0) {
		return (
			<div className="space-y-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="animate-pulse bg-secondary/30 dark:bg-white/10 h-12 rounded-lg"
					/>
				))}
			</div>
		);
	}

	if (combinedGroups.length === 0) {
		return (
			<div className="text-center py-8">
				<Users className="w-12 h-12 text-muted-foreground dark:text-white/40 mx-auto mb-3" />
				<p className="text-muted-foreground dark:text-white/70">
					No splits yet
				</p>
				<p className="text-sm text-muted-foreground/70 dark:text-white/50">
					Create your first split to get started
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{combinedGroups.map((group) => (
				<GroupItem
					key={group.id}
					group={group}
					isSelected={selectedGroupId === group.id}
					onSelect={() => onSelectGroup(group.id)}
				/>
			))}
		</div>
	);
}

// Define expense categories with icons and colors (copied from create-group-modal.tsx)
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
		color: 'bg-gray-100 dark:bg-gray-800/50',
	},
];

function GroupItem({
	group,
	isSelected,
	onSelect,
}: {
	group: Group;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const { deleteGroup } = useGroupStore();
	// Get category info if available
	const categoryInfo = group.category
		? EXPENSE_CATEGORIES.find((cat) => cat.id === group.category)
		: EXPENSE_CATEGORIES.find((cat) => cat.id === 'other');

	const categoryIcon = categoryInfo?.icon || '📝';
	const categoryName = categoryInfo?.name || 'Other';
	const categoryColor =
		categoryInfo?.color || 'bg-gray-100 dark:bg-gray-800/50';

	// For groups from blockchain, we might need to fetch additional data
	const { data: groupData } = useReadContract({
		address: CONTRACTS.SPLIT_ME,
		abi: SPLIT_ME_ABI,
		functionName: 'getGroup',
		args: [BigInt(group.id)],
		// We'll always fetch the data, but use it conditionally
	});

	// Use data from blockchain if available and our group data is incomplete
	let displayName = group.name;
	let membersCount = group.members.length;

	if (groupData && group.members.length === 0) {
		const [, name, , members] = groupData;
		displayName = name;
		membersCount = members.length;
	}

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering the parent button click

		// Confirm before deleting
		if (window.confirm(`Удалить сплит "${displayName}"?`)) {
			deleteGroup(group.id);
			toast.success(`Сплит "${displayName}" успешно удален`);
		}
	};

	return (
		<div className="relative group">
			<Button
				variant={isSelected ? 'default' : 'ghost'}
				className="w-full justify-start p-4 h-auto font-montserrat"
				onClick={onSelect}
			>
				<div className="flex items-center w-full">
					<div
						className={`w-8 h-8 rounded-full ${categoryColor} flex items-center justify-center mr-3`}
					>
						<span>{categoryIcon}</span>
					</div>
					<div className="text-left flex-1">
						<div className="font-medium truncate">{displayName}</div>
						<div className="text-sm text-muted-foreground dark:text-white/60 flex items-center">
							<Users className="w-3 h-3 mr-1" />
							{membersCount} member{membersCount !== 1 ? 's' : ''}
							{group.category && (
								<span className="ml-2 flex items-center">
									<Tag className="w-3 h-3 mr-1" />
									{categoryName}
								</span>
							)}
						</div>
					</div>
				</div>
			</Button>

			{/* Debug button */}
			{/* <Button
				variant="ghost"
				size="icon"
				className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ml-5"
				onClick={handleDelete}
			>
				<Trash2 className="w-4 h-4 text-red-500" />
			</Button> */}
		</div>
	);
}
