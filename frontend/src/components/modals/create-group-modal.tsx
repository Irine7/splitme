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
import { useAddressBookStore, AddressEntry } from '@/stores/address-book-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
	const [splitAmount, setSplitAmount] = useState<number>(0);
	const [category, setCategory] = useState(initialCategory || '');
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [newParticipantAddress, setNewParticipantAddress] = useState('');
	const [newParticipantName, setNewParticipantName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [hostAddress, setHostAddress] = useState<string>('');
	const [errors, setErrors] = useState<{
		groupName?: boolean;
		splitAmount?: boolean;
		participants?: boolean;
		host?: boolean;
	}>({});
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
								participantNames: {
									[address as string]: 'Me (Current User)',
									...participants.reduce(
										(acc, p) => ({ ...acc, [p.address]: p.name }),
										{}
									),
								},
								createdAt: Math.floor(Date.now() / 1000),
								category: category, // Include the selected category
								amount: splitAmount > 0 ? splitAmount : undefined, // Include the split amount if provided
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

	// Добавление участника в список
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

		// Add to participants list
		setParticipants([
			...participants,
			{
				address: newParticipantAddress,
				name: newParticipantName,
			},
		]);

		// Check if address exists in address book, if not - add it
		const { entries, addEntry } = useAddressBookStore.getState();
		const existingEntry = entries.find(
			(entry) => entry.address.toLowerCase() === newParticipantAddress.toLowerCase()
		);

		if (!existingEntry) {
			// Add to address book
			const result = addEntry({
				address: newParticipantAddress as `0x${string}`,
				ownerName: newParticipantName.trim()
			});

			if (result.success) {
				toast.success(`Address ${newParticipantAddress} added to address book`);
			}
		}

		// Clear input fields
		setNewParticipantAddress('');
		setNewParticipantName('');
	};
	
	// Выбор участника из адресной книги
	const handleAddressBookSelect = (addressBookEntry: string) => {
		if (addressBookEntry === 'none') return;
		
		const { entries } = useAddressBookStore.getState();
		const [ownerName, address] = addressBookEntry.split('|');
		
		// Set the participant fields
		setNewParticipantName(ownerName);
		setNewParticipantAddress(address);
	};

	// Remove participant from the list
	const removeParticipant = (index: number) => {
		const updatedParticipants = [...participants];
		updatedParticipants.splice(index, 1);
		setParticipants(updatedParticipants);
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {
			groupName: !groupName.trim(),
			splitAmount: splitAmount <= 0,
			participants: participants.length === 0,
			host: !hostAddress,
		};

		setErrors(newErrors);

		return !Object.values(newErrors).some((error) => error);
	};

	// Handle submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fill in all required fields');
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
						name: 'Me (Current User)',
					},
				]);
			}

			// Получаем имя пользователя из адресной книги или используем дефолтное
			const addressBook = useAddressBookStore.getState().entries;
			const creatorEntry = addressBook.find((entry: AddressEntry) => entry.address.toLowerCase() === address?.toLowerCase());
			const creatorName = creatorEntry?.ownerName || 'You';

			// Explicitly type the contract call
			const contractCall = {
				address: CONTRACTS.SPLIT_ME as `0x${string}`,
				abi: SPLIT_ME_ABI,
				functionName: 'createGroup' as const,
				args: [groupName.trim(), category || 'other', BigInt(splitAmount || 0), creatorName] as const, // Передаем категорию, сумму и имя создателя
			};

			writeContract(contractCall);

			// Also save to Zustand store directly to ensure it appears in the list immediately
			// This will be updated with the correct ID once the transaction is confirmed
			const tempGroupId = Math.floor(Math.random() * 1000000); // Temporary ID until transaction confirms
			addGroup({
				id: tempGroupId,
				name: groupName.trim(),
				creator: hostAddress as `0x${string}`, // Use selected host address
				members: [
					address as `0x${string}`,
					...participants.map((p) => p.address as `0x${string}`),
				],
				participantNames: {
					[address as string]: 'Me (Current User)',
					...participants.reduce(
						(acc, p) => ({ ...acc, [p.address]: p.name }),
						{}
					),
				},
				createdAt: Math.floor(Date.now() / 1000),
				category: category, // Save the selected category
				amount: splitAmount, // Always save the split amount
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
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-focus-styles">
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

				<form
					onSubmit={handleSubmit}
					className="p-6 glass-card max-w-3xl mx-auto"
				>
					<div className="space-y-6">
						{/* Split Name and Amount - Side by Side */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Split Name */}
							<div className="space-y-2">
								<Label htmlFor="groupName" className="flex items-center gap-1">
									Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="groupName"
									type="text"
									value={groupName}
									onChange={(e) => {
										setGroupName(e.target.value);
										if (errors.groupName) {
											setErrors({
												...errors,
												groupName: !e.target.value.trim(),
											});
										}
									}}
									placeholder="e.g., Rent Split"
									onFocus={(e) => (e.target.placeholder = '')}
									onBlur={(e) => (e.target.placeholder = 'e.g., Rent Split')}
									className={cn(
										'placeholder:text-gray-500 focus-visible:border-purple-600 focus-visible:ring-0',
										errors.groupName &&
											'border-red-500 focus-visible:ring-red-500'
									)}
									disabled={isLoading || isConfirming}
									maxLength={50}
								/>
								{errors.groupName && (
									<p className="text-xs text-red-500">Split name is required</p>
								)}
							</div>

							{/* Split Amount */}
							<div className="space-y-2">
								<Label
									htmlFor="splitAmount"
									className="flex items-center gap-1"
								>
									Amount <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<span className="text-gray-500 sm:text-sm">$</span>
									</div>
									<Input
										id="splitAmount"
										type="number"
										value={splitAmount}
										onChange={(e) => {
											const value = parseFloat(e.target.value) || 0;
											setSplitAmount(value);
											if (errors.splitAmount) {
												setErrors({ ...errors, splitAmount: value <= 0 });
											}
										}}
										placeholder="0"
										onFocus={(e) => (e.target.placeholder = '')}
										onBlur={(e) => (e.target.placeholder = '0')}
										min="0"
										step="1"
										className={cn(
											'pl-7 placeholder:text-gray-500 focus-visible:border-purple-600 focus-visible:ring-0',
											errors.splitAmount &&
												'border-red-500 focus-visible:ring-red-500'
										)}
										disabled={isLoading || isConfirming}
									/>
								</div>
								{errors.splitAmount && (
									<p className="text-xs text-red-500">
										Split amount is required and must be greater than 0
									</p>
								)}
							</div>
						</div>

						{/* Category Selection */}
						<div className="space-y-2">
							<Label htmlFor="category">Expense Category</Label>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
								{EXPENSE_CATEGORIES.map((cat) => (
									<div
										key={cat.id}
										onClick={() => {
											setCategory(cat.id);
										}}
										className={cn(
											'flex items-center gap-1 p-1 rounded-md cursor-pointer transition-all border w-full',
											cat.color,
											category === cat.id
												? 'ring-2 ring-primary border-purple-600'
												: 'border-transparent',
											category && category !== cat.id ? 'opacity-25' : ''
										)}
									>
										<Tag className="w-3 h-3 mx-0.5 flex-shrink-0" />
										<span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
											{cat.name}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Participants */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1">
								Participants <span className="text-red-500">*</span>
								{errors.participants && (
									<span className="text-xs text-red-500 ml-2">
										(At least one participant required)
									</span>
								)}
							</Label>

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
										Me (Current User)
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

							{/* Address Book Selection */}
							<div className="space-y-2">
								<Label htmlFor="addressBookSelect" className="text-sm">
									Select from Address Book
								</Label>
								<Select
									onValueChange={handleAddressBookSelect}
									disabled={isLoading || isConfirming}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a contact" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">-- Select a contact --</SelectItem>
										{useAddressBookStore.getState().entries.map((entry) => (
											<SelectItem 
												key={entry.address} 
												value={`${entry.ownerName}|${entry.address}`}
											>
												{entry.ownerName} ({entry.address.substring(0, 6)}...{entry.address.substring(entry.address.length - 4)})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div  className="space-y-2 text-sm">
								OR
							</div>

							{/* Add Participant */}
							<div className="space-y-2">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									<div>
										<Label htmlFor="participantName" className="sr-only">
											Participant Name
										</Label>
										<Input
											id="participantName"
											type="text"
											value={newParticipantName}
											onChange={(e) => setNewParticipantName(e.target.value)}
											placeholder="Participant Name"
											onFocus={(e) => (e.target.placeholder = '')}
											onBlur={(e) =>
												(e.target.placeholder = 'Participant Name')
											}
											disabled={isLoading || isConfirming}
											className={cn(
												'placeholder:text-gray-500',
												errors.participants &&
													participants.length === 0 &&
													'border-red-500 focus-visible:ring-red-500'
											)}
										/>
									</div>
									<div>
										<Label htmlFor="participantAddress" className="sr-only">
											Participant Address
										</Label>
										<Input
											id="participantAddress"
											type="text"
											value={newParticipantAddress}
											onChange={(e) => setNewParticipantAddress(e.target.value)}
											placeholder="0x..."
											onFocus={(e) => (e.target.placeholder = '')}
											onBlur={(e) => (e.target.placeholder = '0x...')}
											disabled={isLoading || isConfirming}
											className={cn(
												'placeholder:text-gray-500',
												errors.participants &&
													participants.length === 0 &&
													'border-red-500 focus-visible:ring-red-500'
											)}
										/>
									</div>
								</div>
								<Button
									type="button"
									variant="purple"
									className="w-full"
									onClick={() => {
										addParticipant();
										if (errors.participants && participants.length > 0) {
											setErrors({ ...errors, participants: false });
										}
									}}
									disabled={
										!newParticipantAddress ||
										!newParticipantName ||
										isLoading ||
										isConfirming
									}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Participant
								</Button>
							</div>
						</div>
					</div>

					{/* Host Selection */}
					<div className="my-4">
						<div className="mb-2">
							<Label htmlFor="hostAddress" className="flex items-center gap-1">
								Host <span className="text-red-500">*</span>
							</Label>
						</div>
						<Select
							value={hostAddress}
							onValueChange={(value) => {
								setHostAddress(value);
								if (errors.host) {
									setErrors({ ...errors, host: !value });
								}
							}}
							disabled={isLoading || isConfirming}
						>
							<SelectTrigger
								className={cn(
									errors.host && 'border-red-500 focus-visible:ring-red-500'
								)}
							>
								<SelectValue placeholder="Select host" />
							</SelectTrigger>
							<SelectContent>
								{address && (
									<SelectItem value={address}>Me</SelectItem>
								)}
								{participants.map((p, index) => (
									<SelectItem key={index} value={p.address}>
										{p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.host && (
							<p className="text-xs mt-1 text-red-500">
								Split host is required
							</p>
						)}
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="purple"
							onClick={onClose}
							disabled={isLoading || isConfirming}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="purple"
							disabled={
								isLoading ||
								isConfirming ||
								!groupName.trim() ||
								splitAmount <= 0 ||
								participants.length === 0 ||
								!hostAddress
							}
							className="relative"
						>
							{isLoading && (
								<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 modal-focus-styles">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
								</div>
							)}
							Create Split
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}