'use client';

import { useState, useEffect } from 'react';
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useAccount,
} from 'wagmi';
import { CONTRACTS, SPLIT_ME_ABI } from '@/constants/contracts';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2, Users, CreditCard, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '@/stores/group-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type Log = {
	topics: string[];
	data: string;
};

interface CreateGroupModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialCategory?: string | null;
}

// Define expense categories with icons and colors
const EXPENSE_CATEGORIES = [
	{
		id: 'food',
		name: 'Food',
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

type Participant = {
	address: string;
	name: string;
};

export function CreateGroupModal({
	isOpen,
	onClose,
	initialCategory = null,
}: CreateGroupModalProps) {
	const [groupName, setGroupName] = useState('');
	const [category, setCategory] = useState(initialCategory || 'other');
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [newParticipantAddress, setNewParticipantAddress] = useState('');
	const [newParticipantName, setNewParticipantName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { address } = useAccount();
	const { addGroup } = useGroupStore();

	const {
		writeContract,
		data: hash,
		error: writeError,
		reset: resetWrite,
	} = useWriteContract();

	const {
		isLoading: isConfirming,
		isSuccess,
		data: receipt,
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
						log.topics[0] ===
						'0x3a0ca8f38b91a9c9d298b34a890bdb4ef784edb3f0a5fbb7efbafd2f01cee3a7' // GroupCreated event signature
				);

				if (groupCreatedEvent) {
					const groupId = parseInt(groupCreatedEvent.topics[1], 16);

					// Ensure we have a valid group name
					const groupNameToUse = groupName || 'Unnamed Group';

					// Update the group in the store with the correct ID from blockchain
					// First remove any temporary groups with the same name
					const { groups } = useGroupStore.getState();
					const updatedGroups = groups.filter((g) => g.name !== groupNameToUse);

					// Add the new group to the store with the correct ID and category
					useGroupStore.setState({
						groups: [
							...updatedGroups,
							{
								id: groupId,
								name: groupNameToUse,
								creator: address as `0x${string}`,
								members: [
									address as `0x${string}`,
									...participants.map((p) => p.address as `0x${string}`),
								],
								createdAt: Math.floor(Date.now() / 1000),
								category: category, // Include the selected category
							},
						],
					});

					toast.success('Split created successfully!');
					setGroupName('');
				}
			} catch (error) {
				console.error('Error processing transaction receipt:', error);
				toast.error('Failed to process transaction');
			} finally {
				setIsLoading(false);
			}
		};

		processReceipt();
	}, [isSuccess, receipt, groupName, address, category, participants, onClose]);

	// Add participant to the list
	const addParticipant = () => {
		if (!newParticipantAddress || !newParticipantName) {
			toast.error('Please enter both address and name for the participant');
			return;
		}

		// Basic validation for Ethereum address
		if (
			!newParticipantAddress.startsWith('0x') ||
			newParticipantAddress.length !== 42
		) {
			toast.error('Please enter a valid Ethereum address');
			return;
		}

		setParticipants([
			...participants,
			{
				address: newParticipantAddress,
				name: newParticipantName,
			},
		]);

		// Clear input fields
		setNewParticipantAddress('');
		setNewParticipantName('');
	};

	// Remove participant from the list
	const removeParticipant = (index: number) => {
		const updatedParticipants = [...participants];
		updatedParticipants.splice(index, 1);
		setParticipants(updatedParticipants);
	};

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

			// Add current user to participants if not already included
			const userIncluded = participants.some(
				(p) => p.address.toLowerCase() === address.toLowerCase()
			);

			if (!userIncluded && address) {
				// Add the current user as a participant
				setParticipants([
					...participants,
					{
						address: address,
						name: 'You (Current User)',
					},
				]);
			}

			// Explicitly type the contract call
			const contractCall = {
				address: CONTRACTS.SPLIT_ME as `0x${string}`,
				abi: SPLIT_ME_ABI,
				functionName: 'createGroup' as const,
				args: [groupName.trim()] as const,
			};

			writeContract(contractCall);

			// Also save to Zustand store directly to ensure it appears in the list immediately
			// This will be updated with the correct ID once the transaction is confirmed
			const tempGroupId = Math.floor(Math.random() * 1000000); // Temporary ID until transaction confirms
			addGroup({
				id: tempGroupId,
				name: trimmedName,
				creator: address as `0x${string}`,
				members: [
					address as `0x${string}`,
					...participants.map((p) => p.address as `0x${string}`),
				],
				createdAt: Math.floor(Date.now() / 1000),
				category: category, // Save the selected category
			});

			toast.success('Creating split...');
			onClose();
		} catch (error) {
			console.error('Error creating group:', error);
			toast.error('Failed to create group');
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-background dark:bg-background rounded-lg shadow-xl max-w-md w-full">
				{/* <div className="flex items-center justify-between p-6 ">
          <h2 className="text-xl font-semibold">Create New Split</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading || isConfirming}
          >
            <X className="w-5 h-5" />
          </Button>
        </div> */}

				<form onSubmit={handleSubmit} className="p-6 glass-card">
					<div className="space-y-6">
						{/* Split Name */}
						<div className="space-y-2">
							<Label htmlFor="groupName">Split Name</Label>
							<Input
								id="groupName"
								type="text"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="e.g., Weekend Trip, Rent Split"
								disabled={isLoading || isConfirming}
								maxLength={50}
							/>
						</div>

						{/* Category Selection */}
						<div className="space-y-2">
							<Label htmlFor="category">Expense Category</Label>
							<div className="grid grid-cols-4 gap-2">
								{EXPENSE_CATEGORIES.map((cat) => (
									<div
										key={cat.id}
										onClick={() => {
											setCategory(cat.id);
											toast.success(`Category set to ${cat.name}`);
										}}
										className={` flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-all ${
											cat.color
										} ${category === cat.id ? 'ring-2 ring-primary' : ''}`}
									>
										<span className="text-2xl">{cat.icon}</span>
										<span className="text-xs mt-1 text-center">{cat.name}</span>
									</div>
								))}
							</div>
						</div>

						{/* Participants */}
						<div className="space-y-3">
							<Label>Participants</Label>

							{/* Current user */}
							<div className="flex items-center p-3 bg-primary/10 rounded-md">
								<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
									<Users className="w-4 h-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium">
										{address
											? `${address.substring(0, 6)}...${address.substring(
													address.length - 4
											  )}`
											: 'Your wallet'}
									</p>
									<p className="text-xs text-muted-foreground">
										You (Group Creator)
									</p>
								</div>
							</div>

							{/* Participant List */}
							{participants.length > 0 && (
								<div className="space-y-2">
									{participants.map((participant, index) => (
										<div
											key={index}
											className="flex items-center p-3 bg-secondary/10 rounded-md"
										>
											<div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
												<Users className="w-4 h-4" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium">
													{participant.name}
												</p>
												<p className="text-xs text-muted-foreground">{`${participant.address.substring(
													0,
													6
												)}...${participant.address.substring(
													participant.address.length - 4
												)}`}</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeParticipant(index)}
												disabled={isLoading || isConfirming}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add Participant Form */}
							<div className="space-y-2 pt-2 border-t">
								<p className="text-sm font-medium">Add Participant</p>
								<div className="flex gap-2">
									<Input
										placeholder="0x... Wallet Address"
										value={newParticipantAddress}
										onChange={(e) => setNewParticipantAddress(e.target.value)}
										disabled={isLoading || isConfirming}
										className="flex-1"
									/>
									<Input
										placeholder="Name"
										value={newParticipantName}
										onChange={(e) => setNewParticipantName(e.target.value)}
										disabled={isLoading || isConfirming}
										className="flex-1"
									/>
									<Button
										type="button"
										onClick={addParticipant}
										disabled={isLoading || isConfirming}
										size="icon"
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
							</div>
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
